// ================================
// ■ 管理者隠し入口
// 右下を3秒長押し → パスワード入力 → admin.htmlへ
// ================================

const ADMIN_PAGE = "admin.html";

const trigger    = document.getElementById("admin-trigger");
const dialog     = document.getElementById("admin-dialog");
const input      = document.getElementById("admin-password-input");
const submitBtn  = document.getElementById("admin-submit");
const cancelBtn  = document.getElementById("admin-cancel");
const errorMsg   = document.getElementById("admin-error");

let holdTimer = null;

// ================================
// ■ 長押し検知
// ================================
function startHold() {
  holdTimer = setTimeout(() => openDialog(), 3000);
}

function cancelHold() {
  clearTimeout(holdTimer);
}

trigger.addEventListener("mousedown",  startHold);
trigger.addEventListener("touchstart", startHold, { passive: true });
trigger.addEventListener("mouseup",    cancelHold);
trigger.addEventListener("mouseleave", cancelHold);
trigger.addEventListener("touchend",   cancelHold);

// ================================
// ■ ダイアログ開閉
// ================================
function openDialog() {
  input.value = "";
  errorMsg.textContent = "";
  dialog.style.display = "flex";
  setTimeout(() => input.focus(), 100);
}

function closeDialog() {
  dialog.style.display = "none";
}

// ================================
// ■ パスワード照合（Netlify Function経由）
// ================================
async function checkPassword() {
  const password = input.value;
  submitBtn.disabled = true;
  errorMsg.textContent = "";

  try {
    const res = await fetch("/.netlify/functions/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (data.success) {
      // パスワードをsessionStorageに保存（削除APIで使う）
      sessionStorage.setItem("adminAuth", password);
      window.location.href = ADMIN_PAGE;
    } else {
      errorMsg.textContent = data.message || "パスワードが違います";
      input.value = "";
      input.focus();
    }
  } catch {
    errorMsg.textContent = "通信エラーが発生しました";
  }

  submitBtn.disabled = false;
}

submitBtn.addEventListener("click", checkPassword);
cancelBtn.addEventListener("click", closeDialog);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter")  checkPassword();
  if (e.key === "Escape") closeDialog();
});