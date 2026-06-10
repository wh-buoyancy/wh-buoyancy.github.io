// ================================
// ■ 管理者ページ
// 画像一覧・追加・削除・ログアウト
// ================================

const ADMIN_PASSWORD = "Vwf7szU12001";
const STORAGE_KEY    = "galleryImages";

const CLOUDINARY_CLOUD_NAME    = "dmihzva14";
const CLOUDINARY_UPLOAD_PRESET = "my_gallery";

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

let allImages = [];
let deleteTargetIndex = null;

// ================================
// ■ Cloudinaryから画像一覧を取得
// ================================
async function fetchImages() {
  try {
    const res = await fetch(
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/gallery.json`
    );
    if (!res.ok) throw new Error("取得失敗");
    const data = await res.json();
    return data.resources.map(r =>
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${r.public_id}`
    );
  } catch (err) {
    console.error("画像一覧の取得に失敗:", err);
    // 取得失敗時はlocalStorageから読む
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
}

// ================================
// ■ グリッド描画
// ================================
async function renderGrid() {
  grid.innerHTML = "<p style='color:white'>読み込み中...</p>";
  allImages = await fetchImages();
  imgCount.textContent = allImages.length;
  grid.innerHTML = "";

  allImages.forEach((src, index) => {
    const card = document.createElement("div");
    card.className = "admin-card";

    const img = document.createElement("img");
    img.src = src;
    img.alt = `画像${index + 1}`;
    img.onerror = () => { card.style.opacity = "0.4"; };

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
  uploadStatus.style.color = "rgba(255,255,255,0.7)";
  uploadStatus.textContent = `0 / ${files.length} 枚アップロード中...`;

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("tags", "gallery");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("アップロード失敗");
      const data = await res.json();

      if (data.secure_url) {
        successCount++;
        uploadStatus.textContent = `${successCount} / ${files.length} 枚完了...`;
      } else {
        throw new Error("URLが取得できませんでした");
      }
    } catch (err) {
      failCount++;
      console.error("Upload error:", err);
    }
  }

  // 結果メッセージ
  if (failCount === 0) {
    uploadStatus.style.color = "#4caf50";
    uploadStatus.textContent = `${successCount} 枚追加しました！`;
  } else if (successCount === 0) {
    uploadStatus.style.color = "#e05";
    uploadStatus.textContent = `アップロードに失敗しました`;
  } else {
    uploadStatus.style.color = "#ff9800";
    uploadStatus.textContent = `${successCount} 枚追加、${failCount} 枚失敗しました`;
  }

  uploadBtn.disabled = false;
  uploadInput.value = "";

  await renderGrid();

  setTimeout(() => {
    uploadStatus.textContent = "";
    uploadStatus.style.color = "rgba(255,255,255,0.7)";
  }, 4000);
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

deleteConfirmBtn.addEventListener("click", async () => {
  if (deleteTargetIndex === null) return;

  // CloudinaryのpublicIDを取得して削除はAPI Key必要なので
  // localStorageから除外して管理
  const saved = localStorage.getItem(STORAGE_KEY);
  let excluded = saved ? JSON.parse(saved) : [];

  // 削除対象のURLを除外リストに追加
  const targetUrl = allImages[deleteTargetIndex];
  if (!excluded.includes(targetUrl)) {
    excluded.push("__deleted__" + targetUrl);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(excluded));
  }

  closeDeleteDialog();
  await renderGrid();
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