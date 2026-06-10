// ================================
// ■ 定数
// ================================
const STORAGE_KEY = "galleryImages";

const DEFAULT_IMAGES = [
  "https://picsum.photos/1200?1",
  "https://picsum.photos/1200?2",
  "https://picsum.photos/1200?3",
  "https://picsum.photos/1200?4",
  "https://picsum.photos/1200?5",
  "https://picsum.photos/1200?6",
  "https://picsum.photos/1200?7",
  "https://picsum.photos/1200?8",
  "https://picsum.photos/1200?9",
  "https://picsum.photos/1200?10",
  "https://picsum.photos/1200?11",
  "https://picsum.photos/1200?12",
  "https://picsum.photos/1200?13",
];

//localStorage.removeItem("galleryImages")

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
// ■ 画像リスト取得
// ================================
function getImages() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [...DEFAULT_IMAGES];
}

function getThumbs() {
  return Array.from(document.querySelectorAll(".thumb"));
}

// ================================
// ■ ギャラリーを描画
// ================================
function renderGallery() {
  const images = getImages();
  gallery.innerHTML = "";

  images.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.className = "thumb";
    gallery.appendChild(img);
  });

  // フェードイン監視を再セット
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
