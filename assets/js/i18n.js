/**
 * i18n - Internationalization System
 * Default language: English
 * Loads BOTH languages upfront for instant switching
 */
(function () {
    var currentLang = localStorage.getItem('lang') || 'en';
    var cache = {};
    var ready = false;

    function getLang() { return currentLang; }

    function setLang(lang) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        applyAll();
    }

    function t(key, params) {
        var val = (cache[currentLang] || {})[key];
        if (val === undefined) return key;
        if (params) {
            Object.keys(params).forEach(function (k) {
                val = val.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
            });
        }
        return val;
    }
    window.t = t;

    function translateDOM(root) {
        root = root || document;
        var i, el, key;
        var selects = [];
        var els = root.querySelectorAll ? root.querySelectorAll('[data-i18n]') : [];
        for (i = 0; i < els.length; i++) {
            el = els[i];
            key = el.getAttribute('data-i18n');
            if (key && cache[currentLang] && cache[currentLang][key] !== undefined) {
                el.textContent = cache[currentLang][key];
                if (el.tagName === 'OPTION' && el.parentElement && selects.indexOf(el.parentElement) === -1) {
                    selects.push(el.parentElement);
                }
            }
        }
        for (i = 0; i < selects.length; i++) {
            var tmp = selects[i].value;
            selects[i].value = tmp;
        }
        var phEls = root.querySelectorAll ? root.querySelectorAll('[data-i18n-placeholder]') : [];
        for (i = 0; i < phEls.length; i++) {
            el = phEls[i];
            key = el.getAttribute('data-i18n-placeholder');
            if (key && cache[currentLang] && cache[currentLang][key] !== undefined) {
                el.placeholder = cache[currentLang][key];
            }
        }
        var tiEls = root.querySelectorAll ? root.querySelectorAll('[data-i18n-title]') : [];
        for (i = 0; i < tiEls.length; i++) {
            el = tiEls[i];
            key = el.getAttribute('data-i18n-title');
            if (key && cache[currentLang] && cache[currentLang][key] !== undefined) {
                el.title = cache[currentLang][key];
            }
        }
        var htmlEls = root.querySelectorAll ? root.querySelectorAll('[data-i18n-html]') : [];
        for (i = 0; i < htmlEls.length; i++) {
            el = htmlEls[i];
            key = el.getAttribute('data-i18n-html');
            if (key && cache[currentLang] && cache[currentLang][key] !== undefined) {
                el.innerHTML = cache[currentLang][key];
            }
        }
    }
    window.i18n = { t: t, setLang: setLang, getLang: getLang, translateDOM: translateDOM };

    function applyAll() {
        document.documentElement.lang = currentLang;
        document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        var flag = document.getElementById('lang-flag');
        if (flag) flag.src = currentLang === 'ar' ? '/assets/icons/flag-ar.svg' : '/assets/icons/flag-en.svg';
        translateDOM(document);
        document.dispatchEvent(new Event('i18n:ready'));
    }

    function loadFile(lang) {
        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/assets/lang/' + lang + '.json?v=' + Date.now(), true);
            xhr.onload = function () {
                if (xhr.status === 200) {
                    try { cache[lang] = JSON.parse(xhr.responseText); } catch (e) { cache[lang] = {}; }
                } else {
                    cache[lang] = {};
                }
                resolve();
            };
            xhr.onerror = function () { cache[lang] = {}; resolve(); };
            xhr.send();
        });
    }

    function init() {
        Promise.all([loadFile('en'), loadFile('ar')]).then(function () {
            ready = true;
            applyAll();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
