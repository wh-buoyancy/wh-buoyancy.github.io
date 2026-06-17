async function renderFanArt() {
  const grid = document.getElementById("fan-grid");

  try {
    const res = await fetch("/.netlify/functions/get-images?tag=fanart");
    if (!res.ok) throw new Error("取得失敗");
    const data = await res.json();
    const images = data.images || [];

    grid.innerHTML = "";

    if (images.length === 0) {
      grid.innerHTML = "<p style='color:rgba(255,255,255,0.5)'>画像がありません</p>";
      return;
    }

    images.forEach(item => {
      const card = document.createElement("div");
      card.className = "flip-card";

      card.innerHTML = `
        <div class="flip-inner">
          <div class="flip-front">
            <img class="thumb" src="${item.thumb}" alt="">
          </div>
          <div class="flip-back">
            <p>${item.artistName || "unknown"}</p>
          </div>
        </div>
      `;

      card.addEventListener("click", (e) => {
        card.classList.toggle("is-flipped");
        e.stopPropagation();
      });

      grid.appendChild(card);
    });

    document.addEventListener("click", () => {
      document.querySelectorAll(".flip-card").forEach(c => c.classList.remove("is-flipped"));
    });

  } catch (err) {
    console.error("FanArt取得失敗:", err);
    grid.innerHTML = "<p style='color:rgba(255,80,80,0.8)'>読み込みに失敗しました</p>";
  }
}

renderFanArt();