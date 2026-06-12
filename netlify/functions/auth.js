exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { password } = JSON.parse(event.body);
    const correct = process.env.ADMIN_PASSWORD;

    if (password === correct) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: "パスワードが違います" }),
      };
    }
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "リクエストエラー" }),
    };
  }
};
