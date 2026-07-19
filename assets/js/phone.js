var display = document.getElementById("screen");
var sendBtn = document.getElementById("sendBtn");
var codeInput = document.getElementById("display");
var portSelector = document.getElementById("port-selector");
var countdownInterval = null;

var isSessionActive = false;
var isCallAcive = false;

(function initPhoneDisplay() {
    if (!portSelector) return;
    var list = window.localModemList || [];
    if (list.length === 0) return;
    var selected = list.find(function(m) { return m.path === portSelector.value; }) || list[0];
    if (selected) updateDisplay(selected);
})();

function getCode() {
  return Array.from(codeInput.querySelectorAll(".digit")).map(s => s.textContent).join("");
}

function updateDisplayAlign() {
  if (codeInput.scrollWidth > codeInput.clientWidth) {
    codeInput.style.justifyContent = "flex-start";
  } else {
    codeInput.style.justifyContent = "center";
  }
}

function appendDigit(v) {
  const span = document.createElement("span");
  span.className = "digit new";
  span.textContent = v;
  codeInput.appendChild(span);
  codeInput.scrollLeft = codeInput.scrollWidth;
  codeInputKeyPress();
  if (isCallAcive) sendDigit(v);
}

function removeLastDigit() {
  const digits = codeInput.querySelectorAll(".digit");
  if (digits.length) {
    digits[digits.length - 1].remove();
    codeInputKeyPress();
  }
}

function add(v) {
  appendDigit(v);
  animateKey(v);
}

function back() {
  removeLastDigit();
}

function updateDisplay(modem) {
  if (!modem) return;

  var phoneDisplay = document.getElementById("modem_phoneNumber");
  if (phoneDisplay) {
    phoneDisplay.innerText = modem.number;
    phoneDisplay.style.cursor = "pointer";
    phoneDisplay.title = t('phone.copy_number');
    phoneDisplay.onclick = function () {
      copyToClipboard(modem.number, phoneDisplay);
    };
  }

  $(".signal-strength-container [data-port]").attr("data-port", modem.path);
  updateSignalStrength(modem.path, modem.signal);

  if (modem.isBusy) {
    startTimeoutCountdown(modem.expiryTime);
  } else {
    if (countdownInterval) clearInterval(countdownInterval);
    document.getElementById("timeout-display").innerText = "";
  }
}

document.getElementById("port-selector").addEventListener("change", (e) => {
  var selectedPath = e.target.value;
  var newModem = localModemList.find(m => m.path === selectedPath);

  if (newModem) {
    updateDisplay(newModem);
    updateActionButtons();
  }

  if (lastMessages[selectedPath]) {
    display.innerHTML = `<div class="msg ussd-msg">${lastMessages[selectedPath]}</div>`;
  } else {
    display.innerHTML = `<div class="info center">${t('common.ready')}</div>`;
  }
});

if (socket) socket.emit("request-modem-update");

function send(thisBtn) {
  if ($(thisBtn).attr("disabled") == "disabled") return;

  var code = getCode();
  var portPath = portSelector ? portSelector.value : null;
  var socketId = socket.id;

  if (!portPath) {
    Toastify({ text: t('phone.select_port_first'), duration: 5000, gravity: "top", position: "center", style: { background: "#e74c3c" } }).showToast();
    return;
  }
  if (!code) return;

  var isFullUSSD = code.startsWith("*") && code.endsWith("#") || code.startsWith("#") && code.endsWith("#");
  if (isSessionActive || isFullUSSD) {
    isSessionActive = true;
    $(".action_btns .cancel").removeClass("hidden");
    $(".action_btns .call").addClass("hidden");

    fetch("/send-ussd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portPath, code, socketId }),
    })
      .then(async (res) => {
        if (res.status === 403) {
          var data = await res.json();
          display.innerHTML = `<span style="color:red">${t('common.error')}: ${data.error}</span>`;
          return;
        }
        display.innerHTML = `${t('phone.sending')}`;
      })
      .then((data) => {
        if (typeof data !== "undefined" && data.error) {
          display.innerHTML = `<span style="color:red">${t('common.error')}: ${data.error}</span>`;
        }
      })
      .catch((err) => console.error("Fetch Error:", err));
  } else {
    return false;
  }
  codeInput.innerHTML = "";
}

function cancelUSSD() {
  var portPath = document.getElementById("port-selector").value;
  var socketId = socket.id;

  if (!portPath) return Toastify({ text: t('phone.select_port_first'), duration: 5000, gravity: "top", position: "center", style: { background: "#e74c3c" } }).showToast();

  const modem = localModemList.find(m => m.path === portPath);
  if (modem.currentOwner !== socketId) return;

  fetch("/cancel-ussd", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ portPath, socketId }),
  })
    .then(async (response) => {
      var data = await response.json();
      if (response.status === 403) {
        Toastify({ text: data.error, duration: 5000, gravity: "top", position: "center", style: { background: "#e74c3c" } }).showToast();
        return;
      }
      if (data.status === "terminated") {
        var log = document.getElementById("screen");
        log.innerHTML = `<div class="info center">${t('phone.session_terminated')}</div>`;
        isSessionActive = false;
        $(".action_btns .call").removeClass("hidden");
        $(".action_btns .cancel").addClass("hidden");
        setTimeout(function () {
          log.innerHTML = `<div class="info center">${t('common.ready')}</div>`;
        }, 2000);
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      Toastify({ text: t('phone.cancel_error'), duration: 5000, gravity: "top", position: "center", style: { background: "#e74c3c" } }).showToast();
    });
}

function detectMyNumber() {
  var portPath = document.getElementById("port-selector").value;
  if (!portPath) return Toastify({ text: t('phone.select_port_first'), duration: 5000, gravity: "top", position: "center", style: { background: "#e74c3c" } }).showToast();
  fetch("/auto-detect-number", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ portPath }),
  }).catch((err) => console.error("Error:", err));
}

function checkModemLock() {
  var portPath = document.getElementById("port-selector").value;
  if (!portPath) return Toastify({ text: t('phone.select_port_first'), duration: 5000, gravity: "top", position: "center", style: { background: "#e74c3c" } }).showToast();
  var statusDisplay = document.getElementById("lock-status-display");
  statusDisplay.innerText = t('phone.checking');
  statusDisplay.style.color = "black";
  fetch("/check-lock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ portPath }),
  }).catch((err) => {
    statusDisplay.innerText = t('common.status_connection_error');
    console.error("Error:", err);
  });
}

if (socket && !window._phone_lockRegistered) {
  window._phone_lockRegistered = true;
  socket.on("lock-result", (data) => {
    var statusDisplay = document.getElementById("lock-status-display");
    if (data.status === "Unlocked") {
      statusDisplay.innerText = t('phone.lock_unlocked');
      statusDisplay.style.color = "green";
    } else if (data.status === "Locked") {
      statusDisplay.innerText = t('phone.lock_locked');
      statusDisplay.style.color = "red";
    } else if (data.status === "Permanently Blocked") {
      statusDisplay.innerText = t('phone.lock_permanent');
      statusDisplay.style.color = "red";
    } else {
      statusDisplay.innerText = t('phone.lock_unknown');
    }
  });
}

function resetDisplay() {
  display.innerHTML = `<div class="info center">${t('common.ready')}</div>`;
  $(".action_btns .call").removeClass("hidden");
  $(".action_btns .cancel").addClass("hidden");
}

function hangUp() {
  var portPath = document.getElementById("port-selector").value;
  fetch("/cancel-ussd", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ portPath, socketId: socket.id }),
  });
  document.getElementById("screen").innerHTML = `<div class="info center">${t('phone.call_ended')}</div>`;
}

function sendDigit(digit) {
  var portPath = document.getElementById("port-selector").value;
  fetch("/send-dtmf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ portPath, digit }),
  }).catch((err) => console.error("Error:", err));
}

function codeInputKeyPress() {
  updateDisplayAlign();
  updateActionButtons();
}

function updateActionButtons() {
  const val = getCode();
  const selectedPort = $(portSelector).val();
  const modem = localModemList.find(m => m.path === selectedPort);
  const isBusy = modem && modem.isBusy;
  const isBusyByMe = modem && modem.isBusy && modem.currentOwner === socket.id;

  if (isBusy) {
    if (isBusyByMe) {
      if (val.length > 0) {
        $(".action_btns .cancel").addClass("hidden");
        $(".action_btns .call").removeAttr("disabled").removeClass("hidden");
      } else {
        $(".action_btns .cancel").removeClass("hidden");
        $(".action_btns .call").addClass("hidden").removeAttr("disabled");
      }
    } else {
      $(".action_btns .call").removeClass("hidden").attr("disabled", "disabled");
      $(".action_btns .cancel").addClass("hidden");
    }
  } else {
    if (val.length > 0) {
      $(".action_btns .cancel").addClass("hidden");
      $(".action_btns .call").removeAttr("disabled").removeClass("hidden");
    } else {
      $(".action_btns .cancel").addClass("hidden");
      $(".action_btns .call").removeClass("hidden").removeAttr("disabled");
    }
  }
}

var BackSpaceTimer;
var duration = 600;
var back_space_btn = document.querySelector(".display_container .back");

function startHandler(e) {
  BackSpaceTimer = setTimeout(() => {
    codeInput.innerHTML = "";
    codeInputKeyPress();
  }, duration);
}

function stopHandler() {
  clearTimeout(BackSpaceTimer);
}

back_space_btn.addEventListener('mousedown', startHandler);
back_space_btn.addEventListener('mouseup', stopHandler);
back_space_btn.addEventListener('mouseleave', stopHandler);
back_space_btn.addEventListener('touchstart', startHandler);
back_space_btn.addEventListener('touchend', stopHandler);

function animateKey(value) {
  const btn = Array.from(document.querySelectorAll(".keypad .num")).find(b => b.textContent.trim() === value);
  if (btn) {
    btn.classList.add("keypress-anim");
    setTimeout(() => btn.classList.remove("keypress-anim"), 150);
  }
}

document.addEventListener("keydown", function (e) {
  if (!document.querySelector(".phone_container")) return;
  const key = e.key;
  const code = e.code;

  if ((key >= "0" && key <= "9") || /^Numpad\d$/.test(code)) {
    const digit = (key >= "0" && key <= "9") ? key : code.charAt(6);
    add(digit);
    animateKey(digit);
    e.preventDefault();
  } else if (key === "*" || key === "Multiply" || code === "NumpadMultiply") {
    add("*");
    animateKey("*");
    e.preventDefault();
  } else if (key === "#" || code === "NumpadDecimal") {
    add("#");
    animateKey("#");
    e.preventDefault();
  } else if (key === "Backspace" || key === "Delete") {
    back();
    const backBtn = document.querySelector(".display_container .back");
    if (backBtn) {
      backBtn.classList.add("keypress-anim");
      setTimeout(() => backBtn.classList.remove("keypress-anim"), 200);
    }
    e.preventDefault();
  } else if (key === "Enter" || code === "NumpadEnter") {
    const callBtn = document.querySelector(".action_btns .call:not(.hidden)");
    if (callBtn) {
      callBtn.classList.add("keypress-anim");
      setTimeout(() => callBtn.classList.remove("keypress-anim"), 200);
      callBtn.click();
    } else {
      const cancelBtn = document.querySelector(".action_btns .cancel:not(.hidden)");
      if (cancelBtn) {
        cancelBtn.classList.add("keypress-anim");
        setTimeout(() => cancelBtn.classList.remove("keypress-anim"), 200);
        cancelBtn.click();
      }
    }
    e.preventDefault();
  }
});

function startTimeoutCountdown(expiryTime) {
  if (countdownInterval) clearInterval(countdownInterval);
  const el = document.getElementById("timeout-display");
  if (!expiryTime) { el.innerText = ""; return; }
  countdownInterval = setInterval(() => {
    const correctedNow = Date.now() + serverOffset;
    const timeLeft = expiryTime - correctedNow;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      el.innerText = t('phone.session_expired');
      return;
    }
    const seconds = Math.floor((timeLeft / 1000) % 60);
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    el.innerText = `\u23F1${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}
