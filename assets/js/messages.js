socket = window.socket;

/**
 * messages.js
 * مخصص للعمل مع نظام Navigation.js (AJAX)
 */

window._rawMessageTexts = new Map();

// دالة التشغيل الرئيسية
function initMessagesModule() {

    window.allMessages = window.allMessages || [];
    window.currentSender = null;
    window.currentReceiver = null;
    window.currentLineFilter = 'all';


    renderLineTabs();
    renderSidebar();

    // في ملف messages.js أو index.js
    const currentUserId = localStorage.getItem("userId");
    socket.emit("get-chat-history", { userId: currentUserId });
    // تنفيذ الرندر الأولي (في حال كانت البيانات محملة مسبقاً)
    socket.emit("request-modem-update"); // السطر الجديد
}

// --- وظائف العرض (Render Functions) ---

function renderLineTabs() {
    const select = document.getElementById("line-filter-select");
    if (!select) return;

    const currentVal = select.value;

    const unreadByReceiver = {};
    window.allMessages.forEach(m => {
        if (m.is_read === 0) {
            unreadByReceiver[m.receiver] = (unreadByReceiver[m.receiver] || 0) + 1;
        }
    });

    const totalUnread = Object.values(unreadByReceiver).reduce((a, b) => a + b, 0);

    const uniqueReceivers = [...new Set(window.allMessages.map(m => m.receiver))]
        .filter(Boolean)
        .sort((a, b) => {
            const unreadA = unreadByReceiver[a] || 0;
            const unreadB = unreadByReceiver[b] || 0;
            const onlineA = (window.localModemList || []).some(m => m.number === a) ? 1 : 0;
            const onlineB = (window.localModemList || []).some(m => m.number === b) ? 1 : 0;
            if (onlineA !== onlineB) return onlineB - onlineA;
            if (unreadA > 0 && unreadB === 0) return -1;
            if (unreadB > 0 && unreadA === 0) return 1;
            return a.localeCompare(b);
        });

    let html = `<option value="all">📩 ${t('messages.all')}${totalUnread > 0 ? ` (${totalUnread})` : ''}</option>`;

    uniqueReceivers.forEach(num => {
        const unreadCount = unreadByReceiver[num] || 0;
        const isOnline = (window.localModemList || []).some(m => m.number === num);
        const label = unreadCount > 0 ? `${num} (${unreadCount})` : num;
        html += `<option value="${num}" ${isOnline ? 'data-online="1"' : ''}>${label}</option>`;
    });

    select.innerHTML = html;
    select.value = currentVal;

    if (window.updateCustomSelect && $(select).parent().hasClass('custom-select-wrapper')) {
        window.updateCustomSelect($(select));
        addOnlineDots($(select));
    }
}

function filterByLine(line) {
    window.currentLineFilter = line;
    renderSidebar();
    renderLineTabs();
}

$(document).on('change', '#line-filter-select', function () {
    filterByLine($(this).val());
});

function renderSidebar() {
    const list = document.getElementById("contacts-list");
    if (!list) return;

    const filtered = window.currentLineFilter === 'all'
        ? window.allMessages
        : window.allMessages.filter(m => m.receiver === window.currentLineFilter);

    // 1. حساب عدد غير المقروء لكل محادثة
    const unreadCounts = new Map();
    window.allMessages.forEach(m => {
        if (m.is_read === 0) {
            const key = `${m.sender}|${m.receiver}`;
            unreadCounts.set(key, (unreadCounts.get(key) || 0) + 1);
        }
    });

    // 2. تجميع أحدث رسالة لكل محادثة
    const convosMap = new Map();
    filtered.forEach(msg => {
        const key = `${msg.sender}|${msg.receiver}`;
        convosMap.set(key, msg);
    });

    // 3. تحويل الـ Map لمصفوفة وفرزها (Sorting Logic)
    const sortedConvos = Array.from(convosMap.values()).sort((a, b) => {
        const keyA = `${a.sender}|${a.receiver}`;
        const keyB = `${b.sender}|${b.receiver}`;

        const unreadA = unreadCounts.get(keyA) || 0;
        const unreadB = unreadCounts.get(keyB) || 0;

        // الحالة الأولى: إذا كانت واحدة غير مقروءة والأخرى مقروءة، ترفع غير المقروءة للأعلى
        if (unreadA > 0 && unreadB === 0) return -1;
        if (unreadB > 0 && unreadA === 0) return 1;

        // الحالة الثانية: إذا تساوت حالة القراءة (كلاهما مقروء أو كلاهما غير مقروء)
        // نرتب حسب الأحدث زمنياً
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    list.innerHTML = "";

    // 4. بناء العناصر في الواجهة
    sortedConvos.forEach(lastMsg => {
        const key = `${lastMsg.sender}|${lastMsg.receiver}`;
        const unreadCount = unreadCounts.get(key) || 0;
        const isActive = (window.currentSender === lastMsg.sender && window.currentReceiver === lastMsg.receiver) ? 'active' : '';

        const item = document.createElement("div");
        item.className = `contact-item ${isActive} ${unreadCount > 0 ? 'has-unread' : ''}`;

        const previewDir = isArabic(lastMsg.content) ? 'rtl' : 'ltr';

        item.innerHTML = `
            <div class="avatar" style="background: ${stringToColor(lastMsg.receiver)}">
                ${lastMsg.sender[0] || '?'}
                ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
            </div>
            <div class="info">
                <div class="name-row">
                    <span class="name" style="${unreadCount > 0 ? 'font-weight: 800;' : ''}">${lastMsg.sender}</span>
                    <span class="receiver-tag">${lastMsg.receiver}</span>
                </div>
                <div class="preview" style="direction: ${previewDir}">
                    ${(lastMsg.content || "").substring(0, 30)}...
                </div>
            </div>
        `;
        item.onclick = () => selectConversation(lastMsg.sender, lastMsg.receiver);
        list.appendChild(item);
    });
}

function selectConversation(sender, receiver) {
    window.currentSender = sender;
    window.currentReceiver = receiver;

    //userId افترضنا أنك تخزن الـ
    const userId = localStorage.getItem("userId");

    // 1. إبلاغ السيرفر
    socket.emit("mark-as-read", { sender, receiver, userId });

    // 2. تحديث الحالة محلياً في الذاكرة لضمان اختفاء التنبيه فوراً
    window.allMessages.forEach(m => {
        if (m.sender === sender && m.receiver === receiver) {
            m.is_read = 1;
        }
    });

    document.getElementById("active-sender-name").innerText = sender;
    const subHeader = document.getElementById("active-receiver-info");
    if (subHeader) subHeader.innerText = receiver;


    document.getElementById("sidebar-view").classList.add("hidden");
    document.getElementById("chat-view").classList.remove("hidden");

    renderMessages(sender, receiver);
    renderSidebar();
    renderLineTabs(); // <--- هذا السطر سيقوم بتحديث أرقام التبويبات فوراً
    history.pushState({ view: 'chat' }, '');
}

function renderMessages(sender, receiver) {
    const container = document.getElementById("messages-container");
    if (!container) return;

    container.innerHTML = "";

    const filtered = window.allMessages
        .filter(m => m.sender === sender && m.receiver === receiver)
        .sort((a, b) => parseModemDate(a.timestamp) - parseModemDate(b.timestamp));

    let lastDateLabel = null;

    filtered.forEach(msg => {
        const currentDateLabel = getDayLabel(msg.timestamp);

        if (currentDateLabel !== lastDateLabel) {
            const divider = document.createElement("div");
            divider.className = "date-divider";
            divider.innerHTML = `<span>${currentDateLabel}</span>`;
            container.appendChild(divider);
            lastDateLabel = currentDateLabel;
        }
        appendMessage(msg, false); // نمرر false لمنع السكرول المتكرر داخل الحلقة
    });

    // سكرول للأسفل بعد تحميل كل الرسائل
    scrollToBottom();
}

// دالة موحدة للسكرول
function scrollToBottom() {
    const container = document.getElementById("messages-container");
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

function appendMessage(msg) {
    const container = document.getElementById("messages-container");
    // التحقق من وجود الحاوية أو تكرار الرسالة بناءً على الـ id أو البصمة
    if (!container || (msg.id && document.getElementById(`msg-${msg.id}`))) return;

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    if (msg.id) bubble.id = `msg-${msg.id}`;

    // 1. معالجة النص لاكتشاف الـ OTP وتحويله لزر نسخ
    const processedContent = highlightOTP(msg.content || "");

    const direction = isArabic(msg.content) ? 'rtl' : 'ltr';
    const textAlign = isArabic(msg.content) ? 'right' : 'left';

    const previewContent = (msg.content || "").length > 40 ? (msg.content || "").substring(0, 37) + "..." : msg.content || "";

    if (msg.id) window._rawMessageTexts.set(msg.id, msg.content || "");

    bubble.innerHTML = `
        <div class="msg-content-wrapper" style="direction: ${direction}; text-align: ${textAlign};">
            <div class="text">${processedContent}</div>
            <div class="msg-actions">
                <button class="copy-msg-btn" onclick="copyRawMessage(${msg.id}, event)" title="${t('common.copy')}">📋</button>
                <button class="delete-msg-btn" onclick="deleteMessage(${msg.id}, event)">🗑️</button>
            </div>
        </div>
        <div class="time" style="direction: ltr; text-align: ${textAlign};">
            ${formatTime(msg.timestamp)}
        </div>
    `;

    container.appendChild(bubble);
    scrollToBottom();
}

// دالة نسخ النص الخام للحافظة
function copyRawMessage(msgId, event) {
    event.stopPropagation();
    var text = window._rawMessageTexts.get(msgId) || '';
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(function () {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
        var btn = event.currentTarget;
        btn.textContent = '✔️';
        setTimeout(function () { btn.textContent = '📋'; }, 1500);
    } catch (e) {
        fallbackCopy(text);
    }
}
function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
}

/**
 * دالة لاكتشاف الـ OTP وتحويله لزر نسخ
 */
function highlightOTP(text) {
    const otpRegex = /\b\d{4,6}\b/g;

    return text.replace(otpRegex, (match, offset, str) => {
        const charBefore = str[offset - 1] || '';
        const charAfter = str[offset + match.length] || '';

        // استبعاد الأرقام العشرية (رقم ديسمل)
        if (charBefore === '.' || charAfter === '.') return match;

        // استبعاد الأرقام التي تتبع كلمات مثل رصيد أو balance
        const contextBefore = str.slice(Math.max(0, offset - 30), offset);
        if (/رصيد|balance/i.test(contextBefore)) return match;

        return `<button class="otp-copy-btn" onclick="copyToClipboard('${match}', this)" title="${t('messages.copy_otp')}">
                    ${match} <i class="far fa-copy"></i>
                </button>`;
    });
}

function showSidebar() {
    window.currentSender = null;
    window.currentReceiver = null;
    document.getElementById("chat-view").classList.add("hidden");
    document.getElementById("sidebar-view").classList.remove("hidden");
    renderSidebar();
}

async function deleteMessage(msgId, event) {
    if (event) event.stopPropagation();
    if (!confirm(t('messages.delete_confirm'))) return;

    try {
        const res = await fetch("/delete-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: msgId })
        });

        if (res.ok) {
            const el = document.getElementById(`msg-${msgId}`);
            if (el) {
                el.classList.add("removing");
                setTimeout(() => el.remove(), 300);
            }
            window.allMessages = window.allMessages.filter(m => m.id !== msgId);
            renderSidebar();
            renderLineTabs();
        }
    } catch (err) {
        Toastify({ text: t('messages.delete_error') + ' ' + err.message, duration: 5000, gravity: "top", position: "center", style: { background: "#e74c3c" } }).showToast();
    }
}

async function deleteConversation(sender, receiver) {
    if (!confirm(t('messages.delete_conversation_confirm').replace('{sender}', sender))) return;

    try {
        const res = await fetch("/delete-conversation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender, receiver })
        });

        if (res.ok) {
            window.allMessages = (window.allMessages || []).filter(
                m => !(m.sender === sender && m.receiver === receiver)
            );
            const activeItem = document.querySelector(".contact-item.active");
            if (activeItem) {
                activeItem.style.transition = "all 0.3s";
                activeItem.style.opacity = "0";
                activeItem.style.transform = "translateX(-20px)";
                setTimeout(() => {
                    activeItem.remove();
                    document.getElementById("chat-view").classList.add("hidden");
                    document.getElementById("sidebar-view").classList.remove("hidden");
                    renderSidebar();
                    renderLineTabs();
                }, 300);
            } else {
                document.getElementById("chat-view").classList.add("hidden");
                document.getElementById("sidebar-view").classList.remove("hidden");
                renderSidebar();
                renderLineTabs();
            }
        }
    } catch (err) {
        Toastify({ text: t('messages.delete_conversation_error') + ' ' + err.message, duration: 5000, gravity: "top", position: "center", style: { background: "#e74c3c" } }).showToast();
    }
}

function addOnlineDots($select) {
    const selectId = $select.attr('data-custom-id');
    if (!selectId) return;
    const $optionsContainer = $(`.custom-options[data-for="${selectId}"]`);
    if (!$optionsContainer.length) return;

    const $trigger = $select.siblings('.custom-select').find('.custom-select-trigger');
    const selectedVal = $select.val();

    $select.find('option').each(function () {
        const val = $(this).val();
        const isOnline = $(this).attr('data-online') === '1';
        const $customOption = $optionsContainer.find(`.custom-option[data-value="${val}"]`);
        if ($customOption.length) {
            $customOption.find('.online-indicator, .offline-indicator').remove();
            if (isOnline) {
                $customOption.prepend('<span class="online-indicator"></span> ');
            } else if (val !== 'all') {
                $customOption.prepend('<span class="offline-indicator"></span> ');
            }
        }
        if (val === selectedVal && $trigger.length) {
            $trigger.find('.online-indicator, .offline-indicator').remove();
            if (isOnline) {
                $trigger.prepend('<span class="online-indicator"></span> ');
            } else if (val !== 'all') {
                $trigger.prepend('<span class="offline-indicator"></span> ');
            }
        }
    });
}

function stringToColor(str) {
    if (!str) return "#333";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash) % 360}, 60%, 35%)`;
}

function clearSimStorage(portPath) {
    if (confirm(t('messages.clear_storage_confirm'))) {
        fetch('/clear-sim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ port: portPath })
        });
    }
}

// دالة مساعدة لتحويل نص المودم إلى كائن تاريخ حقيقي
function parseModemDate(dateStr) {
    if (!dateStr) return new Date();

    // إذا كان رقمًا (Unix timestamp) نمرره مباشرة
    if (typeof dateStr === 'number') return new Date(dateStr);

    // إذا كان نصًا رقميًا طويلًا (Unix timestamp على شكل نص)
    if (/^\d{10,}$/.test(dateStr)) return new Date(parseInt(dateStr, 10));

    // تحويل صيغة SQLite (YYYY-MM-DD HH:MM:SS) إلى ISO (بإضافة T)
    let normalized = dateStr;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(normalized)) {
        normalized = normalized.replace(' ', 'T');
    }

    // إذا كان التاريخ بصيغة ISO سيعمل مباشرة
    if (normalized.includes('T')) return new Date(normalized);

    try {
        // التعامل مع صيغة المودم: 26/02/11,01:56:06+08
        // تقسيم النص لنحصل على التاريخ والوقت
        const parts = dateStr.split(',');
        if (parts.length < 2) return safeParse(dateStr);

        const dateParts = parts[0].split('/'); // [26, 02, 11]
        const timeParts = parts[1].split('+')[0].split(':'); // [01, 56, 06]

        // بناء التاريخ (السنة، الشهر - 1، اليوم، الساعة، الدقيقة، الثانية)
        // ملاحظة: المودم يرسل السنة كأول رقمين (2026)
        const year = 2000 + parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;
        const day = parseInt(dateParts[2]);
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);
        const second = parseInt(timeParts[2]);

        const result = new Date(year, month, day, hour, minute, second);
        if (isNaN(result.getTime())) return new Date();
        return result;
    } catch (e) {
        console.error("خطأ في تحليل التاريخ:", dateStr);
        return new Date();
    }
}

function safeParse(str) {
    try {
        const d = new Date(str);
        return isNaN(d.getTime()) ? new Date() : d;
    } catch {
        return new Date();
    }
}

function getDayLabel(dateStr) {
    const date = parseModemDate(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return t('transactions.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
        return t('transactions.yesterday');
    } else {
        // عرض اسم اليوم مع التاريخ (مثل: الاثنين، 11 فبراير 2026)
        return date.toLocaleDateString(window.i18n && window.i18n.getLang() === 'ar' ? 'ar-EG' : 'en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

function formatTime(dateStr) {
    const date = parseModemDate(dateStr);
    return date.toLocaleTimeString(window.i18n && window.i18n.getLang() === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function isArabic(text) {
    if (!text) return false;
    // نمط يبحث عن الحروف العربية
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
}

// تشغيل التهيئة فور تحميل الملف
initMessagesModule();

// إعادة العرض عند عرض صفحة الرسائل (لأن initMessagesModule قد يُexecuted قبل وجود DOM)
$(document).on('page_shown', function (e, url) {
    if (url && url.includes('messages.html')) {
        initMessagesModule();
    }
});


