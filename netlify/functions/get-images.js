const https = require("https");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // タグをクエリパラメータで受け取る（デフォルトはgallery）
  const tag = event.queryStringParameters?.tag || "gallery";

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  try {
    const result = await new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: "api.cloudinary.com",
          path: `/v1_1/${cloudName}/resources/image?tags=true&max_results=100`,
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

    // 指定タグがついた画像のみ返す
    const images = (result.resources || [])
      .filter(r => r.tags && r.tags.includes(tag))
      .map(r => ({
        thumb:    `https://res.cloudinary.com/${cloudName}/image/upload/w_800,q_80/${r.public_id}`,
        full:     `https://res.cloudinary.com/${cloudName}/image/upload/q_90/${r.public_id}`,
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