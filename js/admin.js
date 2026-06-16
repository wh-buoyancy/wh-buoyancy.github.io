// ================================
// ■ 管理者ページ
// ================================

const CLOUDINARY_CLOUD_NAME = "dmihzva14";
const PRESETS = {
  gallery: "my_gallery",
  fanart:  "my_fanart",
};

// ================================
// ■ 認証チェック
// ================================
if (!sessionStorage.getItem("adminAuth")) {
  window.location.href = "gallery.html";
}

// ================================
// ■ 要素取得
// ================================
const grid            = document.getElementById("admin-grid");
const imgCount        = document.getElementById("img-count");
const sectionTitle    = document.getElementById("admin-section-title");
const logoutBtn       = document.getElementById("logout-btn");
const uploadInput     = document.getElementById("upload-input");
const uploadBtn       = document.getElementById("upload-btn");
const uploadStatus    = document.getElementById("upload-status");
const deleteDialog    = document.getElementById("delete-dialog");
const deletePreview   = document.getElementById("delete-preview");
const deleteCancelBtn = document.getElementById("delete-cancel");
const deleteConfirmBtn= document.getElementById("delete-confirm");
const artistDialog    = document.getElementById("artist-dialog");
const artistPreview   = document.getElementById("artist-preview");
const artistInput     = document.getElementById("artist-input");
const artistCancelBtn = document.getElementById("artist-cancel");
const artistSaveBtn   = document.getElementById("artist-save");
const tabs            = document.querySelectorAll(".admin-tab");

let allImages = [];
let deleteTargetIndex = null;
let artistTargetPublicId = null;
let currentTab = "gallery";

// アーティスト名をlocalStorageで管理
function getArtistName(publicId) {
  return localStorage.getItem(`artist:${publicId}`) || "";
}

function saveArtistName(publicId, name) {
  localStorage.setItem(`artist:${publicId}`, name);
}

// ================================
// ■ タブ切り替え
// ================================
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.tab;

    const titles = { gallery: "Gallery 画像一覧", fanart: "Fan Art 画像一覧" };
    sectionTitle.textContent = titles[currentTab];

    renderGrid();
  });
});

// ================================
// ■ 画像一覧をNetlify Function経由で取得
// ================================
async function fetchImages() {
  try {
    const res = await fetch(`/.netlify/functions/get-images?tag=${currentTab}`);
    if (!res.ok) throw new Error("取得失敗");
    const data = await res.json();
    return data.images || [];
  } catch (err) {
    console.error("画像一覧の取得に失敗:", err);
    return [];
  }
}

// ================================
// ■ グリッド描画
// ================================
async function renderGrid() {
  grid.innerHTML = "<p style='color:white;grid-column:1/-1;text-align:center'>読み込み中...</p>";
  allImages = await fetchImages();
  imgCount.textContent = allImages.length;
  grid.innerHTML = "";

  if (allImages.length === 0) {
    grid.innerHTML = "<p style='color:rgba(255,255,255,0.5);grid-column:1/-1;text-align:center'>画像がありません</p>";
    return;
  }

  allImages.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "admin-card";

    const img = document.createElement("img");
    img.src = item.thumb;
    img.alt = `画像${index + 1}`;
    img.onerror = () => { card.style.opacity = "0.4"; };

    const btnArea = document.createElement("div");
    btnArea.className = "admin-card-btns";

    // FanArtタブのときだけアーティスト名ボタンを表示
    if (currentTab === "fanart") {
      const artistName = getArtistName(item.publicId);
      const artistBtn = document.createElement("button");
      artistBtn.className = "admin-artist-btn";
      artistBtn.textContent = artistName ? `✏️ ${artistName}` : "✏️ アーティスト名";
      artistBtn.addEventListener("click", () => openArtistDialog(item));
      btnArea.appendChild(artistBtn);
    }

    const delBtn = document.createElement("button");
    delBtn.className = "admin-delete-btn";
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", () => openDeleteDialog(index, item));
    btnArea.appendChild(delBtn);

    card.appendChild(img);
    card.appendChild(btnArea);
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

  const preset = PRESETS[currentTab];
  const tag    = currentTab;

  uploadBtn.disabled = true;
  uploadStatus.style.color = "rgba(255,255,255,0.7)";
  uploadStatus.textContent = `0 / ${files.length} 枚アップロード中...`;

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", preset);
      formData.append("tags", tag);

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
function openDeleteDialog(index, item) {
  deleteTargetIndex = index;
  deletePreview.src = item.thumb;
  deletePreview.dataset.publicId = item.publicId;
  deleteDialog.style.display = "flex";
}

function closeDeleteDialog() {
  deleteDialog.style.display = "none";
  deleteTargetIndex = null;
  deletePreview.src = "";
}

deleteConfirmBtn.addEventListener("click", async () => {
  if (deleteTargetIndex === null) return;

  const publicId = deletePreview.dataset.publicId;
  const password = sessionStorage.getItem("adminAuth");

  deleteConfirmBtn.disabled = true;
  deleteConfirmBtn.textContent = "削除中...";

  try {
    const res = await fetch("/.netlify/functions/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId, password }),
    });

    const data = await res.json();

    if (data.success) {
      // アーティスト名も削除
      localStorage.removeItem(`artist:${publicId}`);
      closeDeleteDialog();
      await renderGrid();
    } else {
      alert("削除に失敗しました: " + (data.message || "不明なエラー"));
    }
  } catch (err) {
    alert("削除中にエラーが発生しました");
    console.error(err);
  }

  deleteConfirmBtn.disabled = false;
  deleteConfirmBtn.textContent = "削除する";
});

deleteCancelBtn.addEventListener("click", closeDeleteDialog);

// ================================
// ■ アーティスト名ダイアログ
// ================================
function openArtistDialog(item) {
  artistTargetPublicId = item.publicId;
  artistPreview.src = item.thumb;
  artistInput.value = getArtistName(item.publicId);
  artistDialog.style.display = "flex";
  setTimeout(() => artistInput.focus(), 100);
}

function closeArtistDialog() {
  artistDialog.style.display = "none";
  artistTargetPublicId = null;
  artistPreview.src = "";
}

artistSaveBtn.addEventListener("click", () => {
  if (!artistTargetPublicId) return;
  saveArtistName(artistTargetPublicId, artistInput.value.trim());
  closeArtistDialog();
  renderGrid();
});

artistCancelBtn.addEventListener("click", closeArtistDialog);

artistInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter")  artistSaveBtn.click();
  if (e.key === "Escape") closeArtistDialog();
});

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