const glow = document.getElementById("cursor-glow");

let lastTime = 0;

document.addEventListener("mousemove", (e) => {
  const now = Date.now();

  if (now - lastTime < 12) return;
  lastTime = now;

  const count = 4;

  const colors = [
    "rgba(146, 239, 253, 0.95)", // 水色
    "rgba(255, 245, 180, 0.95)", // 黄色
    "rgba(255, 255, 255, 0.98)"  // 白
  ];

  for (let i = 0; i < count; i++) {
    const spark = document.createElement("div");
    spark.className = "spark";

    const x = e.clientX;
    const y = e.clientY;

    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 40;

    spark.style.left = x + "px";
    spark.style.top = y + "px";

    spark.style.setProperty("--x", Math.cos(angle) * distance + "px");
    spark.style.setProperty("--y", Math.sin(angle) * distance + "px");

    const c1 = colors[Math.floor(Math.random() * colors.length)];
    const c2 = colors[Math.floor(Math.random() * colors.length)];
    const c3 = colors[Math.floor(Math.random() * colors.length)];

    spark.style.background = `
      radial-gradient(circle,
        ${c1} 0%,
        ${c2} 40%,
        ${c3} 70%,
        transparent 100%
      )
    `;

    glow.appendChild(spark);

    setTimeout(() => spark.remove(), 1200);
  }
});