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
  try {
    const res = await fetch(
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/list/gallery.json`
    );
    if (!res.ok) throw new Error("取得失敗");
    const data = await res.json();

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

    // 削除済みを除外して返す
    return data.resources
      .map(r => `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${r.public_id}`)
      .filter(url => !excluded.includes(url));

  } catch (err) {
    console.error("画像一覧の取得に失敗:", err);
    return [];
  }
}

function getThumbs() {
  return Array.from(document.querySelectorAll(".thumb"));
}

// ================================
// ■ ギャラリーを描画
// ================================
async function renderGallery() {
  const images = await fetchImages();
  gallery.innerHTML = "";

  if (images.length === 0) {
    gallery.innerHTML = "<p style='color:rgba(255,255,255,0.5);text-align:center;grid-column:1/-1'>画像がありません</p>";
    return;
  }

  images.forEach((src) => {
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