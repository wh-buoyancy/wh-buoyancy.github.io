// ================================
// ■ 管理者ページ
// 画像一覧・追加・削除・ログアウト
// ================================

const ADMIN_PASSWORD = "Vwf7szU12001";
const STORAGE_KEY    = "galleryImages";

const CLOUDINARY_CLOUD_NAME    = "dmihzva14";
const CLOUDINARY_UPLOAD_PRESET = "my_gallery";

// 初期画像
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

// ================================
// ■ 認証チェック
// ================================
if (sessionStorage.getItem("adminAuth") !== ADMIN_PASSWORD) {
  window.location.href = "gallery.html";
}

// ================================
// ■ 要素取得
// ================================
const grid             = document.getElementById("admin-grid");
const imgCount         = document.getElementById("img-count");
const logoutBtn        = document.getElementById("logout-btn");
const uploadInput      = document.getElementById("upload-input");
const uploadBtn        = document.getElementById("upload-btn");
const uploadStatus     = document.getElementById("upload-status");
const deleteDialog     = document.getElementById("delete-dialog");
const deletePreview    = document.getElementById("delete-preview");
const deleteCancelBtn  = document.getElementById("delete-cancel");
const deleteConfirmBtn = document.getElementById("delete-confirm");

let deleteTargetIndex = null;

// ================================
// ■ 画像リスト管理
// ================================
function getImages() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [...DEFAULT_IMAGES];
}

function saveImages(images) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

// ================================
// ■ グリッド描画
// ================================
function renderGrid() {
  const images = getImages();
  imgCount.textContent = images.length;
  grid.innerHTML = "";

  images.forEach((src, index) => {
    const card = document.createElement("div");
    card.className = "admin-card";

    const img = document.createElement("img");
    img.src = src;
    img.alt = `画像${index + 1}`;

    const delBtn = document.createElement("button");
    delBtn.className = "admin-delete-btn";
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", () => openDeleteDialog(index, src));

    card.appendChild(img);
    card.appendChild(delBtn);
    grid.appendChild(card);
  });
}

// ================================
// ■ 画像アップロード（Cloudinary）
// ================================
uploadBtn.addEventListener("click", () => uploadInput.click());

uploadInput.addEventListener("change", async () => {
  const files = Array.from(uploadInput.files);
  if (files.length === 0) return;

  uploadBtn.disabled = true;
  uploadStatus.textContent = `0 / ${files.length} 枚アップロード中...`;

  const images = getImages();
  let successCount = 0;

  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();

      if (data.secure_url) {
        images.push(data.secure_url);
        successCount++;
        uploadStatus.textContent = `${successCount} / ${files.length} 枚完了...`;
      } else {
        console.error("Upload failed:", data);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  }

  saveImages(images);
  renderGrid();

  uploadStatus.textContent = `${successCount} 枚追加しました！`;
  uploadBtn.disabled = false;
  uploadInput.value = "";

  setTimeout(() => { uploadStatus.textContent = ""; }, 3000);
});

// ================================
// ■ 削除ダイアログ
// ================================
function openDeleteDialog(index, src) {
  deleteTargetIndex = index;
  deletePreview.src = src;
  deleteDialog.style.display = "flex";
}

function closeDeleteDialog() {
  deleteDialog.style.display = "none";
  deleteTargetIndex = null;
  deletePreview.src = "";
}

deleteConfirmBtn.addEventListener("click", () => {
  if (deleteTargetIndex === null) return;
  const images = getImages();
  images.splice(deleteTargetIndex, 1);
  saveImages(images);
  closeDeleteDialog();
  renderGrid();
});

deleteCancelBtn.addEventListener("click", closeDeleteDialog);

// ================================
// ■ ログアウト
// ================================
logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("adminAuth");
  window.location.href = "gallery.html";
});

// ================================
// ■ 初期描画
// ================================
renderGrid();