const CHARS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  number: "0123456789",
  symbol: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

const resultEl = document.getElementById("PasswordResult");
const lengthEl = document.getElementById("Passwordlength");
const uppercaseEl = document.getElementById("uppercase");
const lowercaseEl = document.getElementById("lowercase");
const numbersEl = document.getElementById("numbers");
const symbolsEl = document.getElementById("symbols");
const generateBtn = document.getElementById("generateBtn");
const clipboardBtn = document.getElementById("clipboardBtn");
const quickCopyBtn = document.getElementById("quickCopyBtn");
const themeCheckbox = document.getElementById("checkbox");
const toastEl = document.getElementById("toast");
const toastMessageEl = document.getElementById("toastMessage");

let toastTimeout = null;

// Theme toggle and persistence
function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
    if (themeCheckbox) themeCheckbox.checked = true;
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    if (themeCheckbox) themeCheckbox.checked = false;
  }
}

if (themeCheckbox) {
  themeCheckbox.addEventListener("change", (e) => {
    const newTheme = e.target.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

// Toast notification
function showToast(message, type = "success") {
  if (!toastEl || !toastMessageEl) return;

  toastMessageEl.textContent = message;
  toastEl.className = `toast show toast-${type}`;

  const iconEl = toastEl.querySelector(".toast-icon");
  if (iconEl) {
    if (type === "success") {
      iconEl.className = "fa-solid fa-circle-check toast-icon";
    } else if (type === "warning") {
      iconEl.className = "fa-solid fa-triangle-exclamation toast-icon";
    } else {
      iconEl.className = "fa-solid fa-circle-info toast-icon";
    }
  }

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2500);
}

// Cryptographically secure random helper
function getRandomInt(max) {
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function getRandomChar(str) {
  return str[getRandomInt(str.length)];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Generate password
function generatePassword(lower, upper, number, symbol, length) {
  const activeSets = [];
  if (lower) activeSets.push(CHARS.lower);
  if (upper) activeSets.push(CHARS.upper);
  if (number) activeSets.push(CHARS.number);
  if (symbol) activeSets.push(CHARS.symbol);

  if (activeSets.length === 0) {
    return "";
  }

  const parsedLength = Math.max(4, Math.min(50, parseInt(length, 10) || 8));
  const passwordChars = [];

  // Guarantee at least one character from each selected set
  activeSets.forEach((set) => {
    passwordChars.push(getRandomChar(set));
  });

  const allAllowed = activeSets.join("");

  for (let i = passwordChars.length; i < parsedLength; i++) {
    passwordChars.push(getRandomChar(allAllowed));
  }

  return shuffle(passwordChars).slice(0, parsedLength).join("");
}

// Generate button event
if (generateBtn) {
  generateBtn.addEventListener("click", () => {
    const length = lengthEl ? lengthEl.value : 8;
    const hasUpper = uppercaseEl ? uppercaseEl.checked : false;
    const hasLower = lowercaseEl ? lowercaseEl.checked : false;
    const hasNumber = numbersEl ? numbersEl.checked : false;
    const hasSymbol = symbolsEl ? symbolsEl.checked : false;

    if (!hasUpper && !hasLower && !hasNumber && !hasSymbol) {
      if (resultEl) resultEl.value = "";
      showToast("Please select at least one character type!", "warning");
      return;
    }

    const password = generatePassword(hasLower, hasUpper, hasNumber, hasSymbol, length);
    if (resultEl) {
      resultEl.value = password;
      resultEl.style.transform = "scale(1.02)";
      setTimeout(() => {
        resultEl.style.transform = "scale(1)";
      }, 150);
    }
  });
}

// Copy to clipboard
async function copyPassword() {
  const password = resultEl ? resultEl.value.trim() : "";

  if (!password) {
    showToast("No password to copy! Please generate one first.", "warning");
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(password);
    } else {
      resultEl.select();
      document.execCommand("copy");
    }

    showToast("Password copied successfully", "success");

    if (clipboardBtn) {
      const origHtml = clipboardBtn.innerHTML;
      clipboardBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Copied!</span>';
      setTimeout(() => {
        clipboardBtn.innerHTML = origHtml;
      }, 1500);
    }
  } catch (err) {
    showToast("Failed to copy password", "warning");
  }
}

if (clipboardBtn) {
  clipboardBtn.addEventListener("click", (e) => {
    e.preventDefault();
    copyPassword();
  });
}

if (quickCopyBtn) {
  quickCopyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    copyPassword();
  });
}

if (lengthEl) {
  lengthEl.addEventListener("change", () => {
    let val = parseInt(lengthEl.value, 10);
    if (isNaN(val) || val < 4) lengthEl.value = 4;
    else if (val > 50) lengthEl.value = 50;
  });
}

initTheme();
