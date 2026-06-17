const https = require("https");
const crypto = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { publicId, artistName, password } = JSON.parse(event.body);

    if (password !== process.env.ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: "認証エラー" }),
      };
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const timestamp = Math.floor(Date.now() / 1000);

    // 署名生成（パラメータをアルファベット順に並べる）
    const signature = crypto
      .createHash("sha1")
      .update(`command=add&context=artist=${artistName}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const params = new URLSearchParams({
      command:    "add",
      public_id:  publicId,
      context:    `artist=${artistName}`,
      timestamp:  timestamp.toString(),
      api_key:    apiKey,
      signature,
    });

    const result = await new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: "api.cloudinary.com",
          path:     `/v1_1/${cloudName}/image/context`,
          method:   "POST",
          headers:  { "Content-Type": "application/x-www-form-urlencoded" },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => { data += chunk; });
          res.on("end", () => resolve(JSON.parse(data)));
        }
      );
      req.on("error", reject);
      req.write(params.toString());
      req.end();
    });

    if (result.public_ids) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: JSON.stringify(result) }),
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: err.message }),
    };
  }
};