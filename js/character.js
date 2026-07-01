// ================================
// ■ フリップカードを生成
// ================================
function createFlipCard(item) {
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

  return card;
}

// ================================
// ■ FanArtを取得して描画
// ================================
async function renderFanArt(tag, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  try {
    const res = await fetch(`/.netlify/functions/get-images?tag=${tag}`);
    if (!res.ok) throw new Error("取得失敗");
    const data = await res.json();
    const images = data.images || [];

    grid.innerHTML = "";

    if (images.length === 0) {
      grid.innerHTML = "<p style='color:rgba(255,255,255,0.5)'>画像がありません</p>";
      return;
    }

    images.forEach(item => {
      grid.appendChild(createFlipCard(item));
    });

  } catch (err) {
    console.error("FanArt取得失敗:", err);
    grid.innerHTML = "<p style='color:rgba(255,80,80,0.8)'>読み込みに失敗しました</p>";
  }
}

// ================================
// ■ タブ切り替え
// ================================
const tabs = document.querySelectorAll(".character-tab");
const sections = document.querySelectorAll(".chara-section");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const chara = tab.dataset.chara;

    // タブのアクティブ状態を切り替え
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    // セクションの表示切り替え
    sections.forEach(s => s.style.display = "none");
    document.getElementById(`chara-${chara}`).style.display = "block";
  });
});

// カード外クリックで全部戻す
document.addEventListener("click", () => {
  document.querySelectorAll(".flip-card").forEach(c => c.classList.remove("is-flipped"));
});

// ================================
// ■ 初期描画（両方のFanArtを読み込む）
// ================================
renderFanArt("fanart_1", "fan-grid-1");
renderFanArt("fanart_2", "fan-grid-2");