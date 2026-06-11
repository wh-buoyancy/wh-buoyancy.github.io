const https = require("https");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  try {
    const result = await new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: "api.cloudinary.com",
          path: `/v1_1/${cloudName}/resources/image?tags=true&max_results=50`,
          method: "GET",
          headers: { Authorization: `Basic ${auth}` },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => { data += chunk; });
          res.on("end", () => resolve(JSON.parse(data)));
        }
      );
      req.on("error", reject);
      req.end();
    });

    // galleryタグがついた画像のみ返す
    const images = (result.resources || [])
      .filter(r => r.tags && r.tags.includes("gallery"))
      .map(r => ({
        thumb: `https://res.cloudinary.com/${cloudName}/image/upload/w_300,q_60,f_auto/${r.public_id}`,
        full: `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,q_80,f_auto/${r.public_id}`,
        publicId: r.public_id,
      }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
