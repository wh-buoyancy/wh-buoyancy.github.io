// ================================
// ■ 管理者隠し入口
// 右下を2秒長押し → パスワード入力 → admin.htmlへ
// ================================

const ADMIN_PASSWORD = "Vwf7szU12001"; // ← パスワード変更はここだけ
const ADMIN_PAGE     = "admin.html";

const trigger   = document.getElementById("admin-trigger");
const dialog    = document.getElementById("admin-dialog");
const input     = document.getElementById("admin-password-input");
const submitBtn = document.getElementById("admin-submit");
const cancelBtn = document.getElementById("admin-cancel");
const errorMsg  = document.getElementById("admin-error");

let holdTimer = null;

// ================================
// ■ 長押し検知（PC・スマホ共通）
// ================================
function startHold() {
  holdTimer = setTimeout(() => {
    openDialog();
  }, 3000); // 3秒長押し
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
// ■ ダイアログを開く
// ================================
function openDialog() {
  input.value = "";
  errorMsg.textContent = "";
  dialog.style.display = "flex";
  setTimeout(() => input.focus(), 100);
}

// ================================
// ■ ダイアログを閉じる
// ================================
function closeDialog() {
  dialog.style.display = "none";
}

// ================================
// ■ パスワード照合
// ================================
function checkPassword() {
  if (input.value === ADMIN_PASSWORD) {
    // sessionStorageに認証情報を保存してからページ移動
    sessionStorage.setItem("adminAuth", ADMIN_PASSWORD);
    window.location.href = ADMIN_PAGE;
  } else {
    errorMsg.textContent = "パスワードが違います";
    input.value = "";
    input.focus();
  }
}

submitBtn.addEventListener("click", checkPassword);
cancelBtn.addEventListener("click", closeDialog);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter")  checkPassword();
  if (e.key === "Escape") closeDialog();
});