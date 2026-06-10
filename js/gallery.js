// ================================
// ■ 定数
// ================================
const STORAGE_KEY      = "galleryImages";
const CLOUDINARY_CLOUD = "dmihzva14";

// ================================
// ■ 要素取得
// ================================
const gallery    = document.getElementById("gallery");
const modal      = document.getElementById("modal");
const modalImg   = document.getElementById("modalImg");
const modalClose = document.getElementById("modalClose");
const modalPrev  = document.getElementById("modalPrev");
const modalNext  = document.getElementById("modalNext");

let currentIndex = 0;

// ================================
// ■ Cloudinaryから画像一覧を取得
// ================================
async function fetchImages() {
  // ネットワーク接続チェック
  if (!navigator.onLine) {
    return { error: "offline" };
  }

  try {
    const res = await fetch(
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/list/gallery.json`
    );

    if (!res.ok) {
      return { error: res.status === 404 ? "empty" : "server" };
    }

    let data;
    try {
      data = await res.json();
    } catch {
      return { error: "parse" };
    }

    // localStorageの削除リストを取得
    let excluded = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const list = JSON.parse(saved);
        excluded = list
          .filter(s => s.startsWith("__deleted__"))
          .map(s => s.replace("__deleted__", ""));
      }
    } catch {}

    const images = data.resources
      .map(r => `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${r.public_id}`)
      .filter(url => !excluded.includes(url));

    return { images };

  } catch (err) {
    console.error("画像一覧の取得に失敗:", err);
    return { error: "network" };
  }
}

function getThumbs() {
  return Array.from(document.querySelectorAll(".thumb"));
}

// ================================
// ■ エラーメッセージ表示
// ================================
function showMessage(type) {
  const messages = {
    offline: "オフラインです。接続を確認してください。",
    network: "読み込みに失敗しました。再読み込みしてください。",
    server:  "サーバーエラーが発生しました。しばらくお待ちください。",
    parse:   "データの読み込みに失敗しました。",
    empty:   "画像がありません",
  };

  const colors = {
    offline: "rgba(255,150,50,0.8)",
    network: "rgba(255,80,80,0.8)",
    server:  "rgba(255,80,80,0.8)",
    parse:   "rgba(255,80,80,0.8)",
    empty:   "rgba(255,255,255,0.4)",
  };

  gallery.innerHTML = `
    <p style="
      color: ${colors[type] || "rgba(255,255,255,0.4)"};
      text-align: center;
      grid-column: 1 / -1;
      padding: 40px 0;
      font-size: 14px;
    ">${messages[type] || "エラーが発生しました"}</p>
  `;
}

// ================================
// ■ ギャラリーを描画
// ================================
async function renderGallery() {
  const result = await fetchImages();
  gallery.innerHTML = "";

  // エラー処理
  if (result.error) {
    showMessage(result.error);
    return;
  }

  // 0件
  if (result.images.length === 0) {
    showMessage("empty");
    return;
  }

  result.images.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.className = "thumb";
    img.onerror = () => { img.style.display = "none"; };
    gallery.appendChild(img);
  });

  setupObserver();
}

// ================================
// ■ フェードイン（Intersection Observer）
// ================================
function setupObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  getThumbs().forEach(img => observer.observe(img));
}

// ================================
// ■ モーダルを開く
// ================================
function openModal(index) {
  const thumbs = getThumbs();
  if (!thumbs[index]) return;

  currentIndex = index;
  modalImg.src = thumbs[index].src;
  modal.style.display = "flex";

  modalPrev.style.visibility = index > 0 ? "visible" : "hidden";
  modalNext.style.visibility = index < thumbs.length - 1 ? "visible" : "hidden";
}

// ================================
// ■ モーダルを閉じる
// ================================
function closeModal() {
  modal.style.display = "none";
  modalImg.src = "";
}

// ================================
// ■ 画像クリック → モーダル表示
// ================================
gallery.addEventListener("click", (e) => {
  if (!e.target.classList.contains("thumb")) return;
  const thumbs = getThumbs();
  const index = thumbs.indexOf(e.target);
  openModal(index);
});

// ================================
// ■ 前後ナビ
// ================================
modalPrev.addEventListener("click", (e) => {
  e.stopPropagation();
  e.preventDefault();
  e.currentTarget.blur();
  openModal(currentIndex - 1);
});

modalNext.addEventListener("click", (e) => {
  e.stopPropagation();
  e.preventDefault();
  e.currentTarget.blur();
  openModal(currentIndex + 1);
});

// ================================
// ■ 閉じる操作
// ================================
modalClose.addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => {
  if (!modal || modal.style.display === "none") return;
  if (e.key === "Escape")     closeModal();
  if (e.key === "ArrowLeft")  openModal(currentIndex - 1);
  if (e.key === "ArrowRight") openModal(currentIndex + 1);
});

// ================================
// ■ スワイプ対応（スマホ用）
// ================================
let touchStartX = 0;

modal.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

modal.addEventListener("touchend", (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) < 50) return;
  if (diff > 0) openModal(currentIndex + 1);
  else          openModal(currentIndex - 1);
});

// ================================
// ■ 初期描画
// ================================
renderGallery();