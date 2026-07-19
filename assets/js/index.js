function setupSocketEvents(socket) {
    window.socket = socket;
    window._statusState = 'connecting';

    function applyStatusText() {
        var el = document.querySelector('.status-text');
        if (!el) return;
        var map = {
            connected: 'common.status_connected',
            reconnecting: 'common.status_reconnecting',
            error: 'common.status_connection_error'
        };
        el.innerText = t(map[window._statusState] || map.connecting);
    }

    document.addEventListener('i18n:ready', applyStatusText);

    // 1. عند الاتصال بنجاح (أو إعادة الاتصال)
    socket.on('connect', async () => {
        console.log("Connected Successfully ✅");
        window._statusState = 'connected';
        document.querySelector('.status-dot').style.backgroundColor = 'var(--accent-green)';
        applyStatusText();

        if (typeof updateStatusUI === "function") updateStatusUI("online");

        // التحقق من صحة الجلسة ومزامنة البيانات بعد إعادة الاتصال
        const isValid = await validateSession();
        if (isValid) {
            const userId = localStorage.getItem('userId');
            socket.emit("get-chat-history", { userId: userId });
            socket.emit("request-modem-update");
        }
    });

    // إذا كان السوكت متصصل بالفعل عند التسجيل
    if (socket.connected) {
        window._statusState = 'connected';
        document.querySelector('.status-dot').style.backgroundColor = 'var(--accent-green)';
        applyStatusText();
        if (typeof updateStatusUI === "function") updateStatusUI("online");
    }

    // 2. عند انقطاع الاتصال
    socket.on('disconnect', () => {
        console.log("Disconnected ❌");
        window._statusState = 'reconnecting';
        document.querySelector('.status-dot').style.backgroundColor = 'var(--status-offline)';
        applyStatusText();

        if (typeof updateStatusUI === "function") updateStatusUI("offline");
    });

    // 3. معالجة أخطاء الاتصال والمصادقة
    socket.on("connect_error", (err) => {
        console.error("Socket Error:", err.message);

        if (err.message === "Authentication error") {
            window.location.href = '/login';
        }

        document.querySelector('.status-dot').style.backgroundColor = 'var(--status-offline)';
        window._statusState = 'error';
        applyStatusText();
    });

    // أضف هذا الكود داخل سكريبت الصفحة الرئيسية (index.html)
    socket.on("user_deleted", (data) => {
        const currentUsername = localStorage.getItem('username');

        // إذا كان الاسم المحذوف هو نفس اسمي الحالي
        if (data.username === currentUsername) {
            Toastify({ text: t('common.account_deleted'), duration: 5000, gravity: "top", position: "center", style: { background: "#e74c3c" } }).showToast();

            // مسح بيانات الجلسة
            localStorage.removeItem('username');
            localStorage.removeItem('userId');

            // توجيه لصفحة تسجيل الدخول
            window.location.href = '/login';
        }
    });
    socket.on("user_reset_devices", (data) => {
        const currentUsername = localStorage.getItem('username');

        // إذا كان الاسم المحذوف هو نفس اسمي الحالي
        if (data.username === currentUsername) {
            Toastify({ text: t('common.logged_out_by_admin'), duration: 5000, gravity: "top", position: "center", style: { background: "#e74c3c" } }).showToast();

            // مسح بيانات الجلسة
            localStorage.removeItem('username');
            localStorage.removeItem('userId');

            // توجيه لصفحة تسجيل الدخول
            window.location.href = '/login';
        }
    });
    // في index.html داخل السكريبت
    socket.on("update_online_count", (count) => {

        console.log(count);
    });

    socket.on("force_logout", (data) => {
        // إذا كان هذا المستخدم هو المحذوف، أو ببساطة نجعل الكل يحدث الحالة
        // أسهل طريقة هي عمل reload والباك اند سيرفض الكوكي لأن المستخدم طار من الداتا بيز
        window.location.reload();
    });

    socket.on("modem-data", (data) => {
        // --- 1. تحديث الذاكرة الدائمة (خلف الكواليس) لجميع الصفحات ---

        // أ. تخزين رسائل الـ USSD
        if (data.type === "ussd" || data.type === "system") {
            lastMessages[data.port] = data.content;
        }

        // ب. تخزين رسائل الـ SMS ومنع التكرار
        if (data.type === "sms" || data.type === "sms-list-item") {
            window.allMessages = window.allMessages || [];

            // 1. استخراج الـ userId الحالي (المخزن عند تسجيل الدخول)
            const currentUserId = localStorage.getItem("userId");

            // 2. فحص التكرار بناءً على البصمة الفريدة
            const isDuplicate = window.allMessages.some(m => m.fingerprint === data.fingerprint);

            if (!isDuplicate) {
                // ضبط الحالة الافتراضية للرسالة الجديدة (غير مقروءة 0)
                // إلا إذا كان المستخدم فاتح الشات حالياً مع نفس المرسل
                const isCurrentlyOpen = (window.currentSender === data.sender && window.currentReceiver === data.receiver);
                data.is_read = isCurrentlyOpen ? 1 : 0;

                // 3. إضافة الرسالة للمصفوفة
                window.allMessages.push(data);

                console.log(`📩 رسالة جديدة من ${data.sender}. الحالة: ${data.is_read ? 'مقروءة فوراً' : 'غير مقروءة'}`);

                // 4. التنبيهات الصوتية والمرئية
                if (typeof playNotificationSound === "function") playNotificationSound(data.transactionType);

                Toastify({
                    text: `📩 ${t('common.new_message_from')} ${data.sender}`,
                    duration: 5000,
                    gravity: "top",
                    position: "center",

                    style: {
                        background: "linear-gradient(to right, #00b09b, #96c93d)",
                    },
                    onClick: () => { /* اختياري: الانتقال للمحادثة عند الضغط على التوست */ }
                }).showToast();

                    // 5. تحديث الواجهة تلقائياً (التحديث اللحظي)
                if (typeof renderSidebar === "function") {
                    // إعادة رندر الـ Sidebar يضمن صعود المحادثة للأعلى بسبب منطق الـ Sort الجديد
                    renderLineTabs();
                    renderSidebar();
                    // إضافة انيميشن للمحادثة الجديدة
                    setTimeout(() => {
                        const firstContact = document.querySelector(".contact-item");
                        if (firstContact && !firstContact.classList.contains("active")) {
                            firstContact.classList.add("new-message");
                            setTimeout(() => firstContact.classList.remove("new-message"), 500);
                        }
                    }, 50);

                    // 6. التعامل مع الشات المفتوح حالياً
                    if (isCurrentlyOpen) {
                        // إضافة الفقاعة فوراً
                        if (typeof appendMessage === "function") appendMessage(data);

                        // إبلاغ السيرفر فوراً بأن هذه الرسالة قُرأت
                        if (socket && currentUserId) {
                            socket.emit("mark-as-read", {
                                sender: data.sender,
                                receiver: data.receiver,
                                userId: currentUserId
                            });
                        }
                    }
                }

                // إشعار دفع (Push Notification) إذا لم يكن المتصفح في الواجهة
                // if (typeof showPushNotification === "function") {
                //     showPushNotification(data.sender, data.content, data.receiver);
                // }
            }
        }

        // --- 2. تحديث واجهة صفحة الهاتف (Phone UI) إذا كانت مفتوحة ---
        const portSelector = document.getElementById("port-selector");
        const display = document.getElementById("screen") || document.getElementById("display");

        // إذا لم تكن صفحة الهاتف مفتوحة، نتوقف هنا (البيانات خُزنت بالأعلى بالفعل)
        if (!portSelector || !display) return;

        const selectedPort = portSelector.value;

        // التحديث المرئي فقط إذا كان البورت المختار هو صاحب البيانات
        if (data.port === selectedPort) {
            switch (data.type) {
                case "ussd":
                case "system":
                    display.innerHTML = `<div class="msg ussd-msg">${data.content}</div>`;
                    if (data.type === "system" && typeof resetDisplay === "function") {
                        setTimeout(resetDisplay, 3000);
                    }
                    break;

                case "call":
                    display.innerHTML += `<div class="msg call-msg">🔔 ${data.content}</div>`;
                    break;

                case "Auto-terminating-Session":
                    delete lastMessages[data.port];
                    display.innerHTML = `<div class="msg ussd-msg">${data.content}</div>`;
                    if (typeof updateActionButtons === "function") {
                        $(".action_btns .call").removeClass("hidden");
                        $(".action_btns .cancel").addClass("hidden");
                    }
                    setTimeout(() => { if (typeof resetDisplay === "function") resetDisplay(); }, 3000);
                    break;

                case "system-call_answered":
                    handleCallTimer(display, data.content);
                    break;

                case "ClearScreen":
                    delete lastMessages[data.port];
                    if (typeof resetDisplay === "function") resetDisplay();
                    break;

                case "sms":
                    // إشعار مؤقت على شاشة الهاتف
                    const oldContent = display.innerHTML;
                    display.innerHTML = `<div class="msg sms-msg" style="color:#f1c40f; font-weight:bold;">${t('common.new_message_from')} ${data.sender}</div>`;
                    setTimeout(() => {
                        // العودة لعرض آخر USSD مخزن لهذا البورت
                        display.innerHTML = lastMessages[selectedPort] ?
                            `<div class="msg ussd-msg">${lastMessages[selectedPort]}</div>` :
                            `<div class="info center">${t('common.ready')}</div>`;
                    }, 4000);
                    break;
            }
        }
    });

    function updatePhoneNumScreenDirect(modem) {
        if (!modem) return;
        const phoneDisplay = document.getElementById("modem_phoneNumber");
        if (phoneDisplay) {
            phoneDisplay.innerText = modem.number;
            phoneDisplay.style.cursor = "pointer";
        }
        if (typeof updateDisplay === "function") {
            updateDisplay(modem);
        }
    }

    function refreshPortSelectorUI() {
        const selector = document.getElementById("port-selector");
        if (!selector) return;
        const currentPath = selector.value;

        const newHtml = localModemList.map(m => {
            const isMe = m.currentOwner === socket.id;
            const busyText = m.isBusy ? (isMe ? ` ${t('modems.status_busy_with_you')}` : ` (${t('modems.status_busy')})`) : "";

            let displayName = m.number || m.path;
            if (m.isPhone || m.path.startsWith("phone-")) {
                displayName = `P-${m.number}`;
            }

            return `<option value="${m.path}" 
                class="${m.isBusy ? 'busy-option' : ''}" 
                ${m.path === currentPath ? 'selected' : ''}>
                ${displayName}${busyText}
        </option>`;
        }).join("");

        if (selector.innerHTML !== newHtml) {
            selector.innerHTML = newHtml;
        }

        let selectedModem;
        if (!selector.value && localModemList.length > 0) {
            selector.value = localModemList[0].path;
            selectedModem = localModemList[0];
        } else {
            selectedModem = localModemList.find(m => m.path === selector.value);
        }

        if (selectedModem) {
            updatePhoneNumScreenDirect(selectedModem);
        }

        if (typeof updateActionButtons === "function") updateActionButtons();
        updateExternalUIs();

        if (typeof window.updateCustomSelect === "function") {
            window.updateCustomSelect($(selector));
        }
    }

    // --- 1. مستمع قائمة المودمات (Modem List) ---
    socket.on("modem-list", (data) => {
        serverOffset = data.serverTime - Date.now();
        localModemList = data.modems;
        window.localModemList = data.modems;
        refreshPortSelectorUI();
    });

    // --- 2. مستمع تحديث الإشارة (Signal Update) ---
    socket.on("signal-update", (data) => {
        // تحديث القوة في القائمة المحلية المحفوظة في الذاكرة
        const modem = localModemList.find(m => m.path === data.port);
        if (modem) modem.signal = data.signal;

        // تحديث الواجهة (إن وجدت)
        updateSignalStrength(data.port, data.signal);
    });

    // داخل index.js أضف أو عدل مستمعات السوكيت:

    socket.on("chat-history", (data) => {
        // تخزين البيانات الأولية مع التأكد من تحويل الـ is_read للقيمة الصحيحة
        window.allMessages = (data || []).map(m => ({
            ...m,
            is_read: m.is_read === undefined ? 1 : m.is_read // التاريخ القديم نفترض أنه مقروء إلا لو السيرفر قال غير ذلك
        }));

        refreshUI();
    });

    socket.on("messages-cleared", () => {
        window.allMessages = [];
        const contactsList = document.getElementById("contacts-list");
        if (contactsList) contactsList.innerHTML = "";
        const messagesContainer = document.getElementById("messages-container");
        if (messagesContainer) messagesContainer.innerHTML = "";
        if (typeof renderLineTabs === "function") renderLineTabs();
        if (typeof renderSidebar === "function") renderSidebar();
    });

    socket.on("conversation-deleted", ({ sender, receiver }) => {
        window.allMessages = (window.allMessages || []).filter(
            m => !(m.sender === sender && m.receiver === receiver)
        );
        const container = document.getElementById("messages-container");
        if (window.currentSender === sender && window.currentReceiver === receiver) {
            if (container) container.innerHTML = "";
        }
        if (typeof renderLineTabs === "function") renderLineTabs();
        if (typeof renderSidebar === "function") renderSidebar();
    });

    // تحديث الـ port-selector كل ما تظهر صفحة الهاتف (حتى من الكاش)
    $(document).on('page_shown', function (e, url) {
        if (url === 'assets/phone.html') {
            refreshPortSelectorUI();
        }
        if (url === 'assets/messages.html') {
            if (typeof initCustomSelects === "function") {
                initCustomSelects();
            }
            refreshUI();
        }
    });

    // تحديث modem_phoneNumber فوراً عند تغيير port-selector
    $(document).on('change', '#port-selector', function () {
        const selectedModem = localModemList.find(m => m.path === this.value);
        if (selectedModem) {
            updatePhoneNumScreenDirect(selectedModem);
        }
    });

}


// عند فشل المصادقة في السوكت
// socket.on("connect_error", (err) => {
//     if (err.message === "Authentication error") {
//         window.location.href = '/login';
//     }
// });

// // تحديث حالة الاتصال عبر Socket.io
// socket.on('connect', () => {
//     document.querySelector('.status-dot').style.backgroundColor = 'var(--accent-green)';
//     document.querySelector('.status-text').innerText = 'متصل';
// });

// socket.on('disconnect', () => {
//     document.querySelector('.status-dot').style.backgroundColor = 'var(--status-offline)';
//     document.querySelector('.status-text').innerText = 'جاري إعادة الاتصال...';
// });



// دالة تسجيل الخروج
function logout() {
    if (confirm(t('common.confirm_logout'))) {
        localStorage.removeItem('username'); // مسح الاسم
        window.location.href = '/logout';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const storedName = localStorage.getItem('username') || t('common.unknown_user');

    // تحديث النص
    const nameElement = document.getElementById('display-username');
    if (nameElement) nameElement.innerText = storedName;

    // تحديث حرف الـ Avatar (أول حرف من الاسم)
    const avatarElement = document.querySelector('.user-avatar');
    if (avatarElement) avatarElement.innerText = storedName.charAt(0).toUpperCase();
});

async function updateHeader() {
    try {
        const response = await fetch('/api/me');
        const data = await response.json();
        if (data.username) {
            document.getElementById('display-username').innerText = data.username;
            document.querySelector('.user-avatar').innerText = data.username.charAt(0).toUpperCase();
            localStorage.setItem('username', data.username); // تحديث التخزين المؤقت
            if (data.id) localStorage.setItem('userId', data.id);
        }
    } catch (e) {
        console.error(t('common.fetch_user_failed'));
    }
}

updateHeader();

// متغيرات عامة لحفظ الحالة
let serverOffset = 0;
let localModemList = [];

// في أعلى ملف index.js
window.allMessages = [];
window.localModemList = [];
let lastMessages = {};

// متغيرات عامة في index.js لإدارة الحالة
let callInterval = null;

var what_window = window;
if (window.frameElement) {
    what_window = window.parent;
}
what_window.e_m = false;

function set_e_m(e_m = what_window.e_m) {
    what_window.e_m = e_m;

    if (what_window.e_m == true) {
        $(".remove_ads").removeAttr("disabled").find(".btn_text").text("Remove Ads");
        $(".pro_status").hide();
    } else {
        $(".remove_ads").attr("disabled", "disabled").find(".btn_text").text("Ads Removed.");
        $(".pro_status").show();
    }
}


// 1. طلب إذن الإشعارات من المستخدم
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("هذا المتصفح لا يدعم إشعارات سطح المكتب");
        return;
    }

    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("تم تفعيل الإشعارات بنجاح");
            }
        });
    }
}

// 2. دالة عرض الإشعار
function showPushNotification(sender, content, receiver) {
    if (Notification.permission === "granted") {
        const options = {
            body: t('common.notification_message').replace('{content}', content).replace('{receiver}', receiver),
            icon: '/assets/images/sms.png', // ضع مسار أيقونة لويندوز
            dir: 'rtl',
            badge: '/assets/images/badge.avif',
            tag: 'new-sms', // لمنع تراكم الإشعارات المتطابقة
            requireInteraction: false // يختفي تلقائياً بعد ثوانٍ
        };

        const notification = new Notification(`${t('common.new_message_from')} ${sender}`, options);

        // عند الضغط على الإشعار، يفتح المتصفح ويركز على التبويب
        notification.onclick = function (event) {
            event.preventDefault();
            window.focus();
            notification.close();
            // يمكنك هنا إضافة كود لفتح المحادثة تلقائياً
        };
    }
}
function playNotificationSound(type) {
    let sound;
    switch(type) {
        case 'incoming': sound = '/assets/sounds/incoming.mp3'; break;
        case 'outgoing': sound = '/assets/sounds/outgoing.mp3'; break;
        default: sound = '/assets/sounds/notification.wav';
    }
    const audio = new Audio(sound);
    audio.play().catch(e => console.log("الصوت يحتاج تفاعل أولاً مع الصفحة"));
}

// index.js
// socket.on("modem-data", (data) => {
//     // مهمة index: الإشعارات وتحديث مصفوفة الرسائل فقط
//     if (data.type === "sms" || data.type === "sms-list-item") {
//         window.allMessages = window.allMessages || [];
//         const isDuplicate = window.allMessages.some(m => m.fingerprint === data.fingerprint);

//         if (!isDuplicate) {
//             window.allMessages.push(data);
//             // إظهار الإشعار (يعمل دائماً في أي صفحة)
//             if (document.hidden || typeof window.currentSender === 'undefined' || window.currentSender !== data.sender) {
//                 playNotificationSound();
//                 showPushNotification(data.sender, data.content, data.receiver);
//             }
//             if (typeof renderLineTabs === "function") renderLineTabs();
//             if (typeof renderSidebar === "function") renderSidebar();
//         }
//     }
// });



// دالة مساعدة للعداد (Timer)
function handleCallTimer(displayElement, content) {
    displayElement.innerHTML = `<div class="msg ussd-msg">
        ${content} <br> 
        <span id="call_timer" style="font-weight: bold; color: #2ecc71;">00:00</span>
    </div>`;

    if (callInterval) clearInterval(callInterval);
    let seconds = 0;
    callInterval = setInterval(() => {
        seconds++;
        const timerElement = document.getElementById("call_timer");
        if (timerElement) {
            const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
            const secs = (seconds % 60).toString().padStart(2, "0");
            timerElement.innerText = `${mins}:${secs}`;
        } else {
            clearInterval(callInterval); // تنظيف العداد إذا خرج المستخدم من الصفحة
        }
    }, 1000);
}

// دالة الإشعارات العامة
function handleBackgroundNotification(data) {
    if (document.hidden) {
        new Notification(t('common.new_message_from') + " " + data.sender, { body: data.content });
    }
}



function updateSignalStrength(port, signal) {
    const signalBadge = document.querySelector(`.signal-strength-container [data-port='${port}'] .signal-strength`);
    if (signalBadge) {
        signalBadge.classList.add("signal-update-flash");
        signalBadge.innerHTML = `<i class="fas fa-signal"></i> ${signal}%`;

        // تغيير اللون
        if (signal > 70) signalBadge.style.color = "#2ecc71";
        else if (signal > 40) signalBadge.style.color = "#f39c12";
        else signalBadge.style.color = "#e74c3c";

        setTimeout(() => signalBadge.classList.remove("signal-update-flash"), 500);
    }
}



// دالة لتحديث القوائم في الصفحات الأخرى (مثل الرسائل)
function updateExternalUIs() {
    if (typeof renderLineTabs === "function") renderLineTabs();
    if (typeof renderSidebar === "function") renderSidebar();
    if (typeof renderModems === "function") renderModems(localModemList);
}


function toggleFullScreen() {
    const icon = document.getElementById('fs-icon');

    if (!document.fullscreenElement) {
        // تفعيل ملء الشاشة
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
        icon.innerText = '❐'; // تغيير الأيقونة لوضع الخروج
    } else {
        // الخروج من ملء الشاشة
        if (document.exitFullscreen) {
            document.exitFullscreen();
            icon.innerText = '⛶'; // العودة للأيقونة الأصلية
        }
    }
}


// تعديل دالة validateSession لتعيد قيمة boolean
async function validateSession() {
    try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const user_FP = result.visitorId;
        const hwid = user_FP;
        const response = await fetch('/api/check-status', {
            headers: {
                'x-device-hwid': hwid
            }
        });

        if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            window.location.href = '/login';
            return false;
        }
        return response.ok;
    } catch (error) {
        console.error("تعذر التحقق من حالة الحساب");
        return false;
    }
}

// 2. التحقق كل دقيقتين بشكل تلقائي في الخلفية
setInterval(validateSession, 120000);


// دالة موحدة لتحديث كل عناصر الصفحة
function refreshUI() {
    if (typeof renderLineTabs === "function") renderLineTabs();
    if (typeof renderSidebar === "function") renderSidebar();
}


function updateNavUI() {
    const adminBtn = document.getElementById("admin_btn_nav");
    if (!adminBtn) return;

    function showAdminBtn(isAdmin) {
        if (isAdmin) {
            adminBtn.classList.remove("d-none");
        } else {
            adminBtn.classList.add("d-none");
        }
    }

    // جلب الصلاحية من السيرفر أولاً
    fetch('/api/me').then(r => r.json()).then(data => {
        if (data && data.role) {
            localStorage.setItem('userRole', data.role);
            if (data.id) localStorage.setItem('userId', data.id);
            showAdminBtn(data.role === 'admin');
        }
    }).catch(() => {
        // fallback على localStorage
        const userRole = localStorage.getItem("userRole");
        const userId = localStorage.getItem("userId");
        showAdminBtn(userRole === 'admin' || userId === '1');
    });
}

// تشغيل الدالة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", updateNavUI);


window.onpopstate = function (event) {
    // إذا كان المستخدم يرى الشات حالياً، قم بإرجاعه للسايدبار
    const chatView = document.getElementById("chat-view");
    if (chatView && !chatView.classList.contains("hidden")) {
        showSidebar();
    }
};

function copyToClipboard(text, btn) {
    const originalText = btn.innerHTML;

    // محاولة النسخ باستخدام الـ API الحديث
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => showSuccess(btn, originalText))
            .catch(() => fallbackCopy(text, btn, originalText));
    } else {
        // إذا كان الموقع HTTP أو المتصفح قديم
        fallbackCopy(text, btn, originalText);
    }
}

// دالة النسخ الاحتياطية (تعمل على كل الهواتف)
function fallbackCopy(text, btn, originalText) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // تأمين ظهور الحقل خارج الشاشة
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999); // للهواتف

    try {
        document.execCommand('copy');
        showSuccess(btn, originalText);
    } catch (err) {
        console.error('فشل النسخ اليدوي:', err);
    }

    document.body.removeChild(textArea);
}
// --- وظائف التحكم (Control Functions) ---


function showSuccess(btn, originalText) {
    const isPhoneNumber = btn.id === "modem_phoneNumber";

    if (isPhoneNumber) {
        // منع التداخل: إذا كان النص الحالي هو "تم النسخ"، لا تفعل شيئاً
        if (btn.innerText.includes(t('common.copied'))) return;

        // حفظ الرقم الأصلي في متغير مؤقت داخل الدالة
        const realNumber = btn.innerText;

        btn.style.color = "#2ecc71"; // تحويل اللون للأخضر
        btn.innerHTML = t('common.copied') + ` <i class="fad fa-check-square"></i>`;

        setTimeout(() => {
            btn.style.color = ""; // العودة للون الأصلي
            btn.innerText = realNumber; // استعادة الرقم الأصلي بدقة
        }, 1500);
    } else {
        // المنطق الخاص بأزرار الـ OTP (كود التحقق)
        if (btn.innerText.includes(t('common.copied'))) return;

        btn.innerHTML = t('common.copied') + ` <i class="fad fa-check-square"></i>`;
        btn.classList.add('copied');

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }

    if (navigator.vibrate) {
        navigator.vibrate(50); // هزة خفيفة جداً لمدة 50 مللي ثانية
    }
}
