const http = require("http");
const https = require("https");
console.log('Starting main.js...');
const { Server } = require("socket.io");
const path = require("path");
const { exec, spawn } = require('child_process');
const express = require("express");
/**
 * MouGuard Node.js Client SDK v2.0 ΓÇö Hardened Edition
 * License verification with anti-tamper, anti-debug, heartbeat, poly-verify.
 *
 * Requirements: Node.js 14+
 *
 * Usage:
 *   const guard = new MouGuard('LICENSE_KEY', 'API_SECRET', 'https://your-server.com');
 *   if (!(await guard.verify())) { guard.terminate(); }
 */

const _c = require('crypto');
const _o = require('os');
const _f = require('fs'); 1
const _p = require('path');

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Protection error logger (logs to file, never crashes the host process)
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function _log(level, msg) {
    const ts = new Date().toISOString();
    const line = `[${ts}] [${level}] ${msg}`;
    if (level === 'FATAL' || level === 'ERROR') console.error(line);
}

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// XOR string obfuscation layer
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const _x = (s, k) => {
    let r = '';
    for (let i = 0; i < s.length; i++)
        r += String.fromCharCode(s.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    return r;
};
const _k = 'mGu' + String.fromCharCode(55, 55, 103, 97, 114, 100);

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Self-destruct ΓÇö irreversibly corrupts critical state
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
let _sdTrigger = '';
let _mainHttpPort = 29000;
let _mainHttpServer = null;

function _stopMainServer() {
    return new Promise((resolve) => {
        if (!_mainHttpServer) return resolve();
        // Force-close all HTTP connections without touching Socket.IO or HTTPS server
        try {
            if (_mainHttpServer.closeAllConnections) {
                _mainHttpServer.closeAllConnections();
            } else {
                // Fallback for older Node: destroy all sockets manually
                const handle = _mainHttpServer._handle;
                if (handle && handle._connections) {
                    handle._connections.forEach(c => { try { c.destroy(); } catch(e) {} });
                }
            }
        } catch(e) {}
        _mainHttpServer.close(() => {
            console.log('[SSL] Main HTTP server stopped on port', _mainHttpPort);
            resolve();
        });
        // Force resolve after 3 seconds in case close hangs
        setTimeout(resolve, 3000);
    });
}

function _startMainServer() {
    return new Promise((resolve, reject) => {
        if (!_mainHttpServer) return resolve();
        _mainHttpServer.listen(_mainHttpPort, '0.0.0.0', (err) => {
            if (err) return reject(err);
            console.log('[SSL] Main HTTP server restarted on port', _mainHttpPort);
            resolve();
        });
    });
}
function _sd(src) {
    // Disabled ΓÇö no-op
}
function _sdGetTrigger() { return _sdTrigger; }

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Request coalescing (merges concurrent verify calls into one)
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const _vPending = new Map();

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Embedded activation page HTML (no external file needed)
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const _NO_INTERNET_HTML = '<!DOCTYPE html><html lang="ar"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>No Internet</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>:root{--primary:#ffcc00;--primary-hover:#ff9900;--warning:#ff9f43;--error:#ef4444;--text-primary:#fff;--text-secondary:#888;--text-muted:#666}*{margin:0;padding:0;box-sizing:border-box}body{font-family:\'Noto Sans Arabic\',\'Segoe UI\',system-ui,-apple-system,sans-serif;background:#0d0d12;color:#e0e0e0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 16px}.locked-bg{position:fixed;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at 50% 0%,rgba(255,204,0,0.06) 0%,transparent 60%),radial-gradient(ellipse at 80% 80%,rgba(100,150,255,0.03) 0%,transparent 50%);z-index:0;pointer-events:none}.container{position:relative;z-index:1;width:100%;max-width:400px}.lock-card{background:rgba(20,20,26,0.8);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:40px 28px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,0.5)}.logo{width:64px;height:64px;background:linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.08));border:1px solid rgba(239,68,68,0.2);border-radius:18px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:1.8rem}h1{font-size:1.2rem;font-weight:800;color:var(--text-primary);margin-bottom:8px}.subtitle{color:var(--text-secondary);font-size:.85rem;line-height:1.6;margin-bottom:24px}.spinner{width:28px;height:28px;border:3px solid rgba(255,255,255,0.06);border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px}@keyframes spin{to{transform:rotate(360deg)}}.status{color:var(--text-muted);font-size:.82rem}.retry-count{color:var(--primary);font-weight:600;font-family:monospace}.fade-in{animation:fadeIn .35s ease}@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}</style></head><body><div class="locked-bg"></div><div class="container"><div class="lock-card fade-in"><div class="logo">&#x1f4f6;</div><h1 id="ni-title"></h1><p class="subtitle" id="ni-subtitle"></p><div class="spinner"></div><p class="status"><span id="ni-status"></span> <span class="retry-count" id="ni-count"></span></p></div></div><script>var _lang=localStorage.getItem(\'mouguard_lang\')||\'ar\';var _t={ar:{title:"\u0644\u0627 \u064a\u0648\u062c\u062f \u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u0625\u0646\u062a\u0631\u0646\u062a",subtitle:"\u064a\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b",checking:"\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0642\u0642...",count:"\u0645\u062d\u0627\u0648\u0644\u0629 %d"},en:{title:"No Internet Connection",subtitle:"Checking connection automatically",checking:"Checking connection...",count:"Attempt %d"}};function __(k){return(_t[_lang]&&_t[_lang][k])?_t[_lang][k]:k}var _attempts=0;function updateUI(){_attempts++;document.getElementById(\'ni-title\').textContent=__(\'title\');document.getElementById(\'ni-subtitle\').textContent=__(\'subtitle\');document.getElementById(\'ni-status\').textContent=__(\'checking\');document.getElementById(\'ni-count\').textContent=\'#\'+_attempts}updateUI();setInterval(function(){updateUI();window.location.reload()},5000);</script></body></html>';

const _ACTIVATE_HTML = `<!DOCTYPE html>
<html lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>License Activation</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--primary:#ffcc00;--primary-hover:#ff9900;--success:#10b981;--warning:#ff9f43;--error:#ef4444;--text-primary:#fff;--text-secondary:#888;--text-muted:#666}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans Arabic','Segoe UI',system-ui,-apple-system,sans-serif;background:#0d0d12;color:#e0e0e0;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px}
.locked-bg{position:fixed;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at 50% 0%,rgba(255,204,0,0.06) 0%,transparent 60%),radial-gradient(ellipse at 80% 80%,rgba(100,150,255,0.03) 0%,transparent 50%);z-index:0;pointer-events:none}
.container{position:relative;z-index:1;width:100%;max-width:440px}
.lock-card{background:rgba(20,20,26,0.8);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:32px 28px;box-shadow:0 24px 80px rgba(0,0,0,0.5)}
.lang-bar{display:flex;justify-content:flex-end;gap:4px;margin-bottom:16px}
.lang-btn{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);color:var(--text-muted);padding:4px 12px;border-radius:8px;cursor:pointer;font-size:.72rem;font-weight:600;font-family:inherit;transition:all .2s}
.lang-btn:hover{border-color:rgba(255,204,0,0.3);color:var(--text-secondary)}
.lang-btn.active{background:rgba(255,204,0,0.1);border-color:rgba(255,204,0,0.3);color:var(--primary)}
.logo{width:52px;height:52px;background:linear-gradient(135deg,var(--primary),var(--primary-hover));border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:1.4rem;box-shadow:0 8px 24px rgba(255,204,0,0.25)}
h1{font-size:1.2rem;font-weight:800;color:var(--text-primary);text-align:center;margin-bottom:4px}.subtitle{color:var(--text-secondary);font-size:.82rem;text-align:center;margin-bottom:20px}
.badge{display:inline-flex;align-items:center;gap:5px;padding:5px 14px;border-radius:20px;font-size:.75rem;font-weight:600;margin-bottom:16px}
.badge.ok{background:rgba(16,185,129,.12);color:var(--success);border:1px solid rgba(16,185,129,.25)}
.badge.warn{background:rgba(255,159,67,.12);color:var(--warning);border:1px solid rgba(255,159,67,.25)}
.badge.err{background:rgba(239,68,68,.12);color:var(--error);border:1px solid rgba(239,68,68,.25)}
.badge.mute{background:rgba(136,136,136,.08);color:var(--text-muted);border:1px solid rgba(136,136,136,.15)}
.card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:14px;margin-bottom:10px}
.row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;font-size:.82rem}
.row+.row{border-top:1px solid rgba(255,255,255,0.04)}
.row .l{color:var(--text-muted)}
.row .v{color:var(--text-primary);font-weight:600;font-family:monospace;direction:ltr}
.row .v.accent{color:var(--primary)}
.row .v.warn{color:var(--warning)}
.row .v.danger{color:var(--error)}
hr{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:16px 0}
.input-group{text-align:left;margin-bottom:12px}
.input-group label{display:block;font-size:.78rem;color:var(--text-secondary);margin-bottom:4px;font-weight:500}
input{width:100%;padding:12px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:.95rem;text-align:center;direction:ltr;transition:border-color .2s,box-shadow .2s;font-family:monospace;color:#e0e0e0}
input:focus{outline:none;border-color:rgba(255,204,0,0.4);box-shadow:0 0 0 3px rgba(255,204,0,0.06)}
input::placeholder{color:var(--text-muted)}
.btn{display:block;width:100%;padding:12px 16px;border:none;border-radius:10px;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .3s;font-family:inherit;text-decoration:none;text-align:center;margin-top:8px}
.btn:active{transform:scale(.97)}
.btn-primary{background:linear-gradient(135deg,var(--primary),var(--primary-hover));color:#000;box-shadow:0 4px 16px rgba(255,204,0,0.25)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(255,204,0,0.35)}
.btn-warning{background:linear-gradient(135deg,var(--warning),#e08930);color:#000;box-shadow:0 4px 16px rgba(255,159,67,0.25)}
.btn-warning:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(255,159,67,0.35)}
.btn-success{background:linear-gradient(135deg,var(--success),#059669);color:#fff;box-shadow:0 4px 16px rgba(16,185,129,0.25)}
.btn-success:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(16,185,129,0.35)}
.btn-outline{background:transparent;color:var(--text-secondary);border:1.5px solid rgba(255,255,255,0.08)}
.btn-outline:hover{border-color:rgba(255,204,0,0.4);color:var(--primary)}
.btn-ghost{background:transparent;color:var(--text-muted);border:none;font-size:.78rem;margin-top:4px;cursor:pointer;font-family:inherit}
.btn-ghost:hover{color:var(--text-primary)}
#msg{font-size:.82rem;min-height:1.3rem;margin-top:10px;padding:4px;border-radius:8px}
#msg.s{color:var(--success)}
#msg.e{color:var(--error);background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.12);padding:8px 12px}
.loading{display:flex;flex-direction:column;align-items:center;gap:14px;color:var(--text-muted);font-size:.82rem;padding:2.5rem 0}
.spinner{width:24px;height:24px;border:3px solid rgba(255,255,255,0.06);border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.hidden{display:none!important}
.fade-in{animation:fadeIn .35s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<div class="locked-bg"></div>
<div class="container">
<div class="lock-card">
<div class="lang-bar">
<button class="lang-btn active" data-lang="ar" onclick="switchLang('ar')" id="lang-ar-btn">\u0627\u0644\u0639\u0631\u0628\u064a\u0629</button>
<button class="lang-btn" data-lang="en" onclick="switchLang('en')">English</button>
</div>
<div class="logo">&#x1f6e1;</div>
<div id="loading-state" class="loading"><div class="spinner"></div><span data-i18n="loading"></span></div>
<div id="no-license-state" class="hidden fade-in">
<h1 data-i18n="activate_title"></h1>
<p class="subtitle" data-i18n="activate_subtitle"></p>
<span class="badge mute" data-i18n="badge_inactive"></span>
<hr>
<div class="input-group"><label data-i18n="license_key_label"></label><input type="text" id="license-input" placeholder="XXXX-XXXX-XXXX-XXXX" spellcheck="false" dir="ltr" autocomplete="off"></div>
<button class="btn btn-primary" onclick="submitActivation()"><span data-i18n="activate_btn"></span></button>
<div id="msg"></div>
<hr>
<p style="font-size:.78rem;color:var(--text-muted);margin-bottom:6px;" data-i18n="no_license_prompt"></p>
<a class="btn btn-warning" id="buy-link" href="#" target="_blank" data-i18n="buy_btn"></a>
<a class="btn btn-outline" id="renew-link" href="#" target="_blank" style="margin-top:6px;" data-i18n="renew_btn"></a>
</div>
<div id="renewal-state" class="hidden fade-in">
<h1 id="title"></h1>
<div id="badge-area"></div>
<hr>
<div id="info-rows"></div>
<hr>
<div id="action-area"></div>
<button class="btn-ghost" onclick="showForm()" id="activate-different-btn" data-i18n="activate_different"></button>
</div>
</div>
</div>
<script>
var _d=null;
var _t={ar:{loading:"\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0645\u064a\u0644...",activate_title:"\u{1f510} \u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u062a\u0631\u062e\u064a\u0635",activate_subtitle:"\u0623\u062f\u062e\u0644 \u0645\u0641\u062a\u0627\u062d \u0627\u0644\u062a\u0631\u062e\u064a\u0635 \u0644\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642",badge_inactive:"\u26a0 \u063a\u064a\u0631 \u0645\u0641\u0639\u0644",license_key_label:"\u0645\u0641\u062a\u0627\u062d \u0627\u0644\u062a\u0631\u062e\u064a\u0635",activate_btn:"\u2713 \u062a\u0641\u0639\u064a\u0644",no_license_prompt:"\u0644\u064a\u0633 \u0644\u062f\u064a\u0643 \u062a\u0631\u062e\u064a\u0635\u061f",buy_btn:"\u{1f6d2} \u0634\u0631\u0627\u0621 \u062a\u0631\u062e\u064a\u0635 \u062c\u062f\u064a\u062f",renew_btn:"\u{1f504} \u062a\u062c\u062f\u064a\u062f \u0627\u0644\u062a\u0631\u062e\u064a\u0635",activate_different:"\u{1f510} \u062a\u0641\u0639\u064a\u0644 \u0628\u0645\u0641\u062a\u0627\u062d \u0622\u062e\u0631",status_active:"\u{1f7e2} \u0646\u0634\u0637",status_grace:"\u26a0 \u0641\u062a\u0631\u0629 \u0633\u0645\u0627\u062d",status_suspended:"\u{1f6ab} \u0645\u0639\u0644\u0642",status_expired:"\u274c \u0645\u0646\u062a\u0647\u064a",status_unknown:"\u26a0 \u063a\u064a\u0631 \u0645\u0639\u0631\u0648\u0641",title_active:"\u{1f7e2} \u0627\u0644\u062a\u0631\u062e\u064a\u0635 \u0646\u0634\u0637",title_grace:"\u26a0 \u0641\u062a\u0631\u0629 \u0627\u0644\u0633\u0645\u0627\u062d",title_suspended:"\u{1f6ab} \u0627\u0644\u062a\u0631\u062e\u064a\u0635 \u0645\u0639\u0644\u0642",title_expired:"\u274c \u0627\u0644\u062a\u0631\u062e\u064a\u0635 \u0645\u0646\u062a\u0647\u064a",title_unknown:"\u062d\u0627\u0644\u0629 \u063a\u064a\u0631 \u0645\u0639\u0631\u0648\u0641\u0629",row_key:"\u0627\u0644\u0645\u0641\u062a\u0627\u062d",row_subscription:"\u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643",row_days:"\u0627\u0644\u0623\u064a\u0627\u0645 \u0627\u0644\u0645\u062a\u0628\u0642\u064a\u0629",row_expires:"\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621",row_overdue:"\u0645\u062a\u0623\u062e\u0631",day:"\u064a\u0648\u0645",msg_active:"\u2713 \u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u064a\u0639\u0645\u0644 \u0628\u0634\u0643\u0644 \u0637\u0628\u064a\u0639\u064a",msg_grace:"\u26a0 \u0642\u0645 \u0628\u0627\u0644\u062a\u062c\u062f\u064a\u062f \u0627\u0644\u0622\u0646 \u0644\u0644\u062d\u0641\u0627\u0638 \u0639\u0644\u0649 \u0627\u0644\u0648\u0635\u0648\u0644",msg_suspended:"\u{1f6ab} \u064a\u0631\u062c\u0649 \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062f\u0639\u0645",msg_expired:"\u274c \u0627\u0646\u062a\u0647\u062a \u0635\u0644\u0627\u062d\u064a\u0629 \u0627\u0644\u062a\u0631\u062e\u064a\u0635",msg_unknown:"\u2753 \u062d\u0627\u0644\u0629 \u063a\u064a\u0631 \u0645\u0639\u0631\u0648\u0641\u0629",renew:"\u{1f504} \u062a\u062c\u062f\u064a\u062f \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643",buy_new:"\u{1f6d2} \u0634\u0631\u0627\u0621 \u062a\u0631\u062e\u064a\u0635 \u062c\u062f\u064a\u062f",renew_license:"\u{1f504} \u062a\u062c\u062f\u064a\u062f",buy:"\u{1f6d2} \u0634\u0631\u0627\u0621",conn_err:"\u274c \u0641\u0634\u0644 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u062e\u0627\u062f\u0645",enter_key:"\u0627\u0644\u0631\u062c\u0627\u0621 \u0625\u062f\u062e\u0627\u0644 \u0645\u0641\u062a\u0627\u062d \u0627\u0644\u062a\u0631\u062e\u064a\u0635",activated:"\u2713 \u062a\u0645 \u0627\u0644\u062a\u0641\u0639\u064a\u0644! \u062c\u0627\u0631\u064a \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0648\u062c\u064a\u0647...",activate_fail:"\u0641\u0634\u0644 \u0627\u0644\u062a\u0641\u0639\u064a\u0644",conn_error:"\u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u0627\u062a\u0635\u0627\u0644"},
en:{loading:"Loading...",activate_title:"\u{1f510} Activate License",activate_subtitle:"Enter your license key to activate the application",badge_inactive:"\u26a0 Inactive",license_key_label:"License Key",activate_btn:"\u2713 Activate",no_license_prompt:"Don't have a license?",buy_btn:"\u{1f6d2} Buy New License",renew_btn:"\u{1f504} Renew License",activate_different:"\u{1f510} Activate with different key",status_active:"\u{1f7e2} Active",status_grace:"\u26a0 Grace Period",status_suspended:"\u{1f6ab} Suspended",status_expired:"\u274c Expired",status_unknown:"\u26a0 Unknown",title_active:"\u{1f7e2} License Active",title_grace:"\u26a0 Grace Period",title_suspended:"\u{1f6ab} License Suspended",title_expired:"\u274c License Expired",title_unknown:"Unknown Status",row_key:"Key",row_subscription:"Subscription",row_days:"Days Remaining",row_expires:"Expires",row_overdue:"Overdue",day:"day",msg_active:"\u2713 Application is running normally",msg_grace:"\u26a0 Renew now to maintain access",msg_suspended:"\u{1f6ab} Please contact support",msg_expired:"\u274c License has expired",msg_unknown:"\u2753 Unknown status",renew:"\u{1f504} Renew Subscription",buy_new:"\u{1f6d2} Purchase New License",renew_license:"\u{1f504} Renew",buy:"\u{1f6d2} Purchase",conn_err:"\u274c Failed to connect to server",enter_key:"Please enter your license key",activated:"\u2713 Activated! Redirecting...",activate_fail:"Activation failed",conn_error:"Connection error"}};
var _lang=localStorage.getItem('mouguard_lang')||'ar';
function __(k){return(_t[_lang]&&_t[_lang][k])?(_t[_lang][k]):k}
function apply_i18n(){var els=document.querySelectorAll('[data-i18n]');for(var i=0;i<els.length;i++){var k=els[i].getAttribute('data-i18n');if(k)els[i].textContent=__(k)}var arBtn=document.getElementById('lang-ar-btn');if(arBtn)arBtn.textContent='\u0627\u0644\u0639\u0631\u0628\u064a\u0629'}
apply_i18n();
function switchLang(l){_lang=l;localStorage.setItem('mouguard_lang',l);var btns=document.querySelectorAll('.lang-btn');for(var i=0;i<btns.length;i++){btns[i].classList.toggle('active',btns[i].getAttribute('data-lang')===l)};document.documentElement.lang=l;apply_i18n();if(_d){if(_d.status==='no_license'){showNoLicense(_d)}else{showRenewal(_d)}}}
window.onload=async function(){try{var r=await fetch('/api/license-status'),d=await r.json();_d=d;switchLang(_lang);if(d.status==='no_license'){showNoLicense(d)}else{showRenewal(d)}}catch(e){document.getElementById('loading-state').innerHTML='<span style=\"color:var(--error)\">'+__('conn_err')+'</span>'}}
function showNoLicense(d){document.getElementById('loading-state').classList.add('hidden');var s=document.getElementById('no-license-state');s.classList.remove('hidden');var b=document.getElementById('buy-link'),r=document.getElementById('renew-link');if(d.purchase_url){b.href=d.purchase_url;b.style.display='block'}else{b.style.display='none'}if(d.renew_url){r.href=d.renew_url;r.style.display='block'}else{r.style.display='none'}}
function showRenewal(d){document.getElementById('loading-state').classList.add('hidden');var s=document.getElementById('renewal-state');s.classList.remove('hidden');var badge='',title='',bk='',tk='';switch(d.status){case'active':bk='ok';tk='active';break;case'grace':bk='warn';tk='grace';break;case'suspended':bk='err';tk='suspended';break;case'expired':bk='err';tk='expired';break;default:bk='mute';tk='unknown'}badge='<span class=\"badge '+bk+'\">'+__('status_'+tk)+'</span>';title=__('title_'+tk);document.getElementById('title').textContent=title;document.getElementById('badge-area').innerHTML=badge;var h='';h+=row(__('row_key'),'<span class=\"v accent\">'+esc(d.license_key||'-')+'</span>');h+=row(__('row_subscription'),esc(d.subscription_status||'-'));if(d.days_remaining!==null&&d.days_remaining!==undefined){var c=d.days_remaining<0?'danger':(d.days_remaining<7?'warn':'accent');h+=row(__('row_days'),'<span class=\"v '+c+'\">'+d.days_remaining+'</span>')}if(d.expires_at)h+=row(__('row_expires'),'<span class=\"v\">'+d.expires_at+'</span>');if(d.grace_period&&d.days_overdue)h+=row(__('row_overdue'),'<span class=\"v warn\">'+d.days_overdue+' '+__('day')+'</span>');document.getElementById('info-rows').innerHTML=wrap(h);var a='';if(d.status==='active'){a+='<div style=\"color:var(--success);font-size:.82rem;padding:6px 0;\">'+__('msg_active')+'</div>';a+=btn(d.renew_url||d.purchase_url||'#',__('renew'),'primary')}else if(d.status==='grace'){a+='<div style=\"color:var(--warning);font-size:.82rem;padding:6px 0;\">'+__('msg_grace')+'</div>';a+=btn(d.renew_url||d.purchase_url||'#',__('renew'),'warning')}else if(d.status==='suspended'){a+='<div style=\"color:var(--error);font-size:.82rem;padding:6px 0;\">'+__('msg_suspended')+'</div>';a+=btn(d.purchase_url||'#',__('buy_new'),'primary');a+=btn(d.renew_url||'#',__('renew_license'),'outline',true)}else if(d.status==='expired'){a+='<div style=\"color:var(--error);font-size:.82rem;padding:6px 0;\">'+__('msg_expired')+'</div>';a+=btn(d.purchase_url||'#',__('buy_new'),'warning');a+=btn(d.renew_url||'#',__('renew_license'),'outline',true)}else{a+='<div style=\"color:var(--text-muted);font-size:.82rem;padding:6px 0;\">'+__('msg_unknown')+'</div>';a+=btn(d.purchase_url||'#',__('buy'),'primary');a+=btn(d.renew_url||'#',__('renew_license'),'outline',true)}document.getElementById('action-area').innerHTML=wrap(a)}
function row(l,v){return'<div class=\"row\"><span class=\"l\">'+l+'</span><span>'+v+'</span></div>'}
function wrap(h){return'<div class=\"card\">'+h+'</div>'}
function btn(h,t,c,s){return'<a class=\"btn btn-'+c+'\" href=\"'+h+'\" target=\"_blank\" style=\"'+(s?'margin-top:6px;':'')+'\">'+t+'</a>'}
function showForm(){document.getElementById('renewal-state').classList.add('hidden');document.getElementById('no-license-state').classList.remove('hidden');document.getElementById('license-input').value='';document.getElementById('msg').className='';document.getElementById('msg').textContent=''}
async function submitActivation(){var k=document.getElementById('license-input').value.trim(),m=document.getElementById('msg');m.className='';m.textContent='';if(!k){m.className='e';m.textContent=__('enter_key');return}try{var r=await fetch('/api/activate-app',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:k})}),j=await r.json();if(j.success){m.className='s';m.textContent=__('activated');setTimeout(function(){window.location.href='/'},1500)}else{m.className='e';m.textContent=j.message||__('activate_fail')}}catch(e){m.className='e';m.textContent=__('conn_error')}}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
</script>
</body>
</html>`;

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Class
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
class MouGuard {
    #key;
    #secret;
    #url;
    #domain;
    #err;
    #res;
    #hwid;
    #hb;
    #ts;
    #nonce;
    #appUid;

    constructor(licenseKey = '', apiSecret = '', apiUrl = '', appDomain = '', appUid = '') {
        // Anti-debug: command-line inspectors (target flags are XOR-obfuscated)
        const _a = process.execArgv || [];
        const _f1 = _x('\x40\x6a\x1c\x59\x44\x17\x04\x11\x10', _k); // --inspect
        const _f2 = _x('\x40\x6a\x11\x52\x55\x12\x06', _k);         // --debug
        const _f3 = _x('\x40\x6a\x10\x4f\x47\x08\x12\x17\x49\x0a\x24', _k); // --expose-gc
        const _f4 = _x('\x40\x6a\x14\x5b\x5b\x08\x16\x5f\x0a\x0c\x33\x1c\x41\x52\x14\x4c\x01\x1d\x03\x33\x14\x4f', _k); // --allow-natives-syntax
        const _f5 = _x('\x40\x6a\x05\x45\x58\x01', _k);             // --prof
        for (let i = 0; i < _a.length; i++) {
            if (_a[i].includes(_f1) || _a[i].includes(_f2) || _a[i].includes(_f3) || _a[i].includes(_f4) || _a[i].includes(_f5)) _sd('execArgv:' + _a[i]);
        }

        // Anti-debug: NODE_OPTIONS (match full flags only, avoid substring false positives)
        const _no = process.env.NODE_OPTIONS || '';
        function _wf(s, f) {
            let i = s.indexOf(f);
            while (i !== -1) {
                const c = s[i + f.length];
                if (c === undefined || c === '=' || c === ' ' || c === '"' || c === "'") return true;
                i = s.indexOf(f, i + 1);
            }
            return false;
        }
        if (_wf(_no, _f1) || _wf(_no, '=' + _f1) ||
            _wf(_no, _f2) || _wf(_no, '=' + _f2) ||
            _wf(_no, _f3) || _wf(_no, '=' + _f3) ||
            _wf(_no, _f4) || _wf(_no, '=' + _f4) ||
            _wf(_no, _f5) || _wf(_no, '=' + _f5)) _sd('NODE_OPTIONS:' + _no);

        // Anti-debug: electric fence (detect debugger via timing) ΓÇö very generous threshold
        const _t1 = Date.now();
        for (let i = 0; i < 100000; i++) Math.sqrt(i);
        const _t2 = Date.now();
        if (_t2 - _t1 > 2000) _sd('ctor_timing:' + (_t2 - _t1) + 'ms');

        // Store everything in private fields (not on `this`)
        this.#key = licenseKey;
        this.#secret = apiSecret;
        const u = (apiUrl || '').replace(/\/+$/, '');
        this.#url = u + _x('\x42\x31\x10\x45\x5e\x01\x18\x5c\x14\x05\x37', _k); // /verify.php
        this.#domain = appDomain || process.env.MG_APP_DOMAIN || _o.hostname();
        this.#err = null;
        this.#res = null;
        this.#hwid = null;
        this.#ts = 0;
        this.#nonce = '';
        this.#appUid = appUid || process.env.MG_APP_UID || '';

        // Self-integrity check at construction
        this.#_ic();

        // Generate HWID
        this.#hwid = this.#_gh();

        // Monkey-patch detection for crypto.createHash
        this.#_mpd();

        // Dead-code injection ΓÇö looks like real verification but isn't
        this.#_dc();

        // Heartbeat re-verification (every 10 seconds)
        this.#hb = setInterval(() => { this.#_hbv(); }, 10000);
        if (this.#hb && this.#hb.unref) this.#hb.unref();
    }

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // Public verify ΓÇö calls internal logic + integrity checks
    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    async verify() {
        // Check debug again (in case it was attached after construction)
        this.#_ad2();

        // Check integrities
        this.#_ic();

        // Coalescing key ΓÇö if a verify is already in-flight for this license, reuse it
        const _key = this.#key + '|' + this.#domain;
        if (_vPending.has(_key)) {
            const _result = await _vPending.get(_key);
            this.#res = _result.res;
            this.#err = _result.err;
            return _result.ok;
        }

        // Start verification (with retry for transient errors)
        const _promise = this.#_vretry();
        _vPending.set(_key, _promise.then(_r => {
            _vPending.delete(_key);
            return _r;
        }));

        const _result = await _promise;
        this.#res = _result.res;
        this.#err = _result.err;
        return _result.ok;
    }

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // PRIVATE: verify with retry + structured result
    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    async #_vretry() {
        const _MAX_ATTEMPTS = 3;
        for (let _i = 0; _i < _MAX_ATTEMPTS; _i++) {
            const _ok = await this.#_vint();
            if (_ok) return { ok: true, res: this.#res, err: null };
            const _e = this.#err || '';
            if ((_e.includes('Rate limit') || _e.includes('Connection error') || _e.includes('timed out')) && _i < _MAX_ATTEMPTS - 1) {
                await new Promise(_r => setTimeout(_r, Math.pow(2, _i) * 1000));
                continue;
            }
            return { ok: false, res: this.#res, err: this.#err };
        }
        return { ok: false, res: this.#res, err: this.#err };
    }

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // Getters
    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    getError() { return this.#err; }
    getResponse() { return this.#res; }
    getDaysRemaining() { return this.#res ? this.#res.days_remaining : null; }
    getExpiresAt() { return this.#res ? this.#res.expires_at : null; }
    getLockUrl() { return this.#res ? this.#res.lock_url : null; }
    isGracePeriod() { return this.#res && this.#res.grace_period === true; }
    getSubscriptionStatus() { return this.#res ? this.#res.subscription_status : 'active'; }
    getRenewalUrl() { return this.#res ? (this.#res.renewal_url || this.#res.renewal_page_url || null) : null; }
    isCorrupted() { return _corrupted; }

    showGraceWarning() {
        const d = this.#res ? this.#res.days_overdue : 0;
        const r = this.getRenewalUrl();
        const e = this.#res ? this.#res.developer_email : '';
        const n = this.#res ? this.#res.site_name : 'MouGuard';
        console.log('');
        console.log('==============================================');
        console.log(`  ${n} - GRACE PERIOD`);
        console.log('==============================================');
        console.log(`  License expired ${d} day(s) ago.`);
        if (r) console.log(`  Renew at: ${r}`);
        if (e) console.log(`  Contact: ${e}`);
        console.log('==============================================');
        console.log('');
    }

    sendActivationPage(res) {
        const _e = (this.#err || 'License validation failed').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        res.send(_ACTIVATE_HTML.replace('<div id="msg"></div>', `<div id="msg" class="error">${_e}</div>`));
    }

    sendNoInternetPage(res) {
        res.send(_NO_INTERNET_HTML);
    }

    static isNetworkError(errMsg) {
        if (!errMsg) return false;
        return errMsg.includes('Connection error') || errMsg.includes('timed out') || errMsg.includes('ECONNREFUSED') || errMsg.includes('ENOTFOUND') || errMsg.includes('fetch failed');
    }

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // Recover ΓÇö restores key and secret that were cleared by terminate()
    // so periodic re-checks can succeed after the license is reinstated.
    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    recover(key, secret) {
        this.#key = key;
        this.#secret = secret;
        this.#err = '';
        this.#res = null;
    }

    terminate(exitProcess = false) {
        const l = this.getLockUrl();
        const e = this.#err || 'License validation failed';
        const d = this.#res ? this.#res.developer_email : '';
        const n = this.#res ? this.#res.site_name : 'MouGuard';
        const r = this.getRenewalUrl();

        // Stop heartbeat
        if (this.#hb) clearInterval(this.#hb);

        _log('ERROR', `License not active ΓÇö ${e}${l ? ' | Lock: ' + l : ''}${r ? ' | Renew: ' + r : ''}`);

        if (l) {
            console.log('');
            console.log('==============================================');
            console.log('  LICENSE NOT ACTIVE');
            console.log('==============================================');
            console.log(`  Error: ${e}`);
            console.log('');
            console.log(`  Visit: ${l}`);
            if (r) console.log(`  Renew: ${r}`);
            if (d) console.log(`  Contact: ${d}`);
            console.log('==============================================');
        } else {
            console.error(`${n}: ${e}`);
            if (r) console.error(`Renew at: ${r}`);
        }

        // Corrupt in-memory state to prevent bypass
        this.#key = '';
        this.#secret = '';
        this.#res = null;
        _corrupted = true;

        if (exitProcess) {
            _log('FATAL', 'Forced process exit due to license failure');
            process.exit(1);
        }
    }

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // PRIVATE: Internal verify
    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    #_vint() {
        return new Promise((resolve) => {
            if (_corrupted) {
                this.#err = _x('\x3e\x22\x19\x51\x1a\x03\x04\x01\x10\x1f\x32\x16\x43\x52\x03', _k) + ' [' + _sdGetTrigger() + ']';
                resolve(false);
                return;
            }

            // Generate nonce for request binding
            this.#nonce = _c.randomBytes(16).toString('hex');
            this.#ts = Math.floor(Date.now() / 1000);

            const payload = JSON.stringify({
                license_key: this.#key,
                domain: this.#key ? undefined : this.#domain,
                hwid: this.#hwid,
                version: '2.0',
                nonce: this.#nonce,
                ts: this.#ts,
                app_uid: this.#appUid || undefined,
            });

            const url = new URL(this.#url);
            const isHttps = url.protocol === 'https:';
            const transport = isHttps ? https : http;
            const opts = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                    'User-Agent': 'MouGuard-NodeJS-SDK/2.0',
                    'X-HMAC-Signature': this.#secret || '',
                },
                timeout: 15000,
                rejectUnauthorized: isHttps && !process.env.MG_ALLOW_SELF_SIGNED,
            };

            const req = transport.request(opts, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);

                        if (res.statusCode !== 200) {
                            this.#err = parsed.error || `Server returned HTTP ${res.statusCode}`;
                            _log('ERROR', `Verify failed: HTTP ${res.statusCode} ΓÇö ${parsed.error || data.substring(0, 200)}`);
                            resolve(false);
                            return;
                        }

                        // Timestamp freshness check (reject if older than 60s)
                        if (parsed.ts && Math.abs(Math.floor(Date.now() / 1000) - parsed.ts) > 60) {
                            this.#err = _x('\x39\x2e\x18\x52\x44\x13\x00\x1f\x14\x4d\x23\x1c\x44\x54\x15\x04\x02\x05\x03\x24\x0c\x17\x53\x02\x15\x17\x07\x19\x22\x11', _k);
                            _log('WARN', 'Verify timestamp mismatch');
                            resolve(false);
                            return;
                        }

                        // Nonce echo verification
                        if (parsed.nonce && parsed.nonce !== this.#nonce) {
                            this.#err = _x('\x23\x28\x1b\x54\x52\x47\x0c\x1b\x17\x00\x26\x01\x54\x5f\x47\x05\x17\x10\x08\x24\x01\x52\x53', _k);
                            _log('WARN', 'Verify nonce mismatch (possible MITM)');
                            resolve(false);
                            return;
                        }

                        this.#res = parsed;

                        // HMAC verification
                        if (this.#secret && parsed.signature) {
                            const sig = parsed.signature;
                            const cp = { ...parsed };
                            delete cp.signature;
                            const exp = this.#_hm(cp);
                            if (!_c.timingSafeEqual(Buffer.from(exp), Buffer.from(sig))) {
                                this.#err = _x('\x21\x2e\x16\x52\x59\x14\x04\x52\x0c\x0c\x34\x55\x55\x52\x02\x0f\x52\x10\x0c\x2a\x05\x52\x45\x02\x05\x52\x13\x04\x33\x1d', _k);
                                _log('WARN', 'Verify HMAC signature mismatch');
                                resolve(false);
                                return;
                            }
                        }

                        if (!parsed.valid) {
                            this.#err = parsed.error || 'License validation failed';
                            _log('WARN', `Verify: license invalid ΓÇö ${this.#err}`);
                            resolve(false);
                            return;
                        }

                        _log('INFO', 'Verify: license valid');
                        resolve(true);
                    } catch (e) {
                        this.#err = _x('\x2b\x26\x1c\x5b\x52\x03\x41\x06\x0b\x4d\x37\x14\x45\x44\x02\x41\x01\x01\x1f\x31\x10\x45\x17\x15\x04\x01\x14\x02\x29\x06\x52', _k) + ': ' + data.substring(0, 200);
                        _log('ERROR', `Verify parse error ΓÇö status: ${res.statusCode}, body: ${data.substring(0, 300)}`);
                        resolve(false);
                    }
                });
            });

            req.on('error', (e) => {
                this.#err = `Connection error: ${e.message}`;
                _log('ERROR', `Verify connection error: ${e.message}`);
                resolve(false);
            });

            req.on('timeout', () => {
                req.destroy();
                this.#err = _x('\x3f\x22\x04\x42\x52\x14\x15\x52\x10\x04\x2a\x10\x53\x17\x08\x14\x06', _k);
                _log('WARN', 'Verify request timed out');
                resolve(false);
            });

            req.write(payload);
            req.end();
        });
    }

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // PRIVATE: Heartbeat re-verification
    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    #_hbv() {
        if (_sslPauseGuard) {
            _log('INFO', 'Heartbeat paused (SSL in progress)');
            return;
        }
        this.verify().then((ok) => {
            if (ok) {
                _log('INFO', 'Heartbeat: license valid');
            } else {
                _log('WARN', 'Heartbeat: verify failed (will retry) ΓÇö ' + (this.#err || ''));
            }
        }).catch((e) => {
            _log('ERROR', 'Heartbeat: error ΓÇö ' + (e?.message || e));
        });
    }

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // PRIVATE: Self-integrity check
    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    #_ic() {
        try {
            // File integrity check (skip if bundled/compiled where __filename doesn't exist)
            if (_f.existsSync(__filename)) {
                const c = _f.readFileSync(__filename);
                const h = _c.createHash('sha256').update(c).digest('hex');
                if (h.length !== 64) _sd("ic_hash");
                if (!/[a-f0-9]{64}/.test(h)) _sd("ic_hash");
            }

            // Check critical builtins
            if (typeof _c.timingSafeEqual !== 'function') _sd("ic_hash");
            if (typeof _c.createHash !== 'function') _sd("ic_hash");
            if (typeof _c.createHmac !== 'function') _sd("ic_hash");
            if (typeof JSON.parse !== 'function') _sd("ic_hash");
            if (typeof JSON.stringify !== 'function') _sd("ic_hash");
        } catch (e) { }
    }

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // PRIVATE: Monkey-patch detection
    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    #_mpd() {
        // Store references to originals and verify they haven't been replaced
        const origCreateHash = _c.createHash;
        const origCreateHmac = _c.createHmac;
        const origTimingEqual = _c.timingSafeEqual;
        const origParse = JSON.parse;
        const origStringify = JSON.stringify;

        // Override with wrappers that detect tampering
        _c.createHash = function (...args) {
            if (typeof origCreateHash !== 'function') _sd("ic_hash");
            return origCreateHash.apply(this, args);
        };

        _c.createHmac = function (...args) {
            if (typeof origCreateHmac !== 'function') _sd("ic_hash");
            return origCreateHmac.apply(this, args);
        };

        JSON.parse = function (...args) {
            if (typeof origParse !== 'function') _sd("ic_hash");
            return origParse.apply(this, args);
        };
    }

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // PRIVATE: Second anti-debug layer
    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    #_ad2() {
        // Anti-debug: command-line inspectors (XOR-obfuscated flags)
        const _a = process.execArgv || [];
        const _f1 = _x('\x40\x6a\x1c\x59\x44\x17\x04\x11\x10', _k);
        const _f2 = _x('\x40\x6a\x11\x52\x55\x12\x06', _k);
        const _f3 = _x('\x40\x6a\x10\x4f\x47\x08\x12\x17\x49\x0a\x24', _k);
        const _f4 = _x('\x40\x6a\x14\x5b\x5b\x08\x16\x5f\x0a\x0c\x33\x1c\x41\x52\x14\x4c\x01\x1d\x03\x33\x14\x4f', _k);
        const _f5 = _x('\x40\x6a\x05\x45\x58\x01', _k);
        for (let i = 0; i < _a.length; i++) {
            if (_a[i].includes(_f1) || _a[i].includes(_f2) || _a[i].includes(_f3) || _a[i].includes(_f4) || _a[i].includes(_f5)) _sd("ic_hash");
        }

        // Check for breakpoint via Function constructor
        try {
            const f = new Function('return this');
            if (typeof f !== 'function') _sd("ic_hash");
        } catch (e) {
            _sd("ic_hash");
        }

        // Timing-based debugger detection (very generous threshold)
        const t1 = process.hrtime.bigint();
        for (let i = 0; i < 50000; i++) Math.random();
        const t2 = process.hrtime.bigint();
        if (Number(t2 - t1) > 500000000) _sd("ic_hash"); // >500ms suggests debugger
    }

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // PRIVATE: Dead code injection
    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    #_dc() {
        // These look like verification calls but are harmless
        // They exist to confuse static analysis
        const _d1 = {
            valid: true,
            _chk: function () { return true; },
            _x: Math.random().toString(36),
        };
        // Hidden dependency to make tree-shaking harder
        if (typeof _d1._chk !== 'function') _sd("ic_hash");
        if (_d1._x.length < 1) _sd("ic_hash");
    }

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // PRIVATE: Generate HWID
    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    #_gh() {
        // Generate HWID from machine + project identifiers (NO file cache to prevent cloning)
        const c = [];

        // Stable system identifiers (never change for the same hardware)
        c.push('host:' + _o.hostname());
        c.push('plat:' + _o.platform());
        c.push('arch:' + _o.arch());
        c.push('machine:' + _o.machine());

        // CPU info (use first CPU model only ΓÇö stable across restarts)
        const _cpus = _o.cpus() || [];
        c.push('cpu:' + (_cpus.length > 0 ? _cpus[0].model : 'unknown'));
        c.push('cores:' + _cpus.length);

        // MAC addresses (sorted deterministically for consistency)
        try {
            const _macs = [];
            const _ifaces = _o.networkInterfaces();
            for (const _name of Object.keys(_ifaces).sort()) {
                for (const _iface of (_ifaces[_name] || [])) {
                    if (_iface && !_iface.internal && _iface.mac && _iface.mac !== '00:00:00:00:00:00') {
                        _macs.push(_iface.mac);
                    }
                }
            }
            _macs.sort();
            if (_macs.length > 0) c.push('mac:' + _macs[0]);
            c.push('macs:' + _macs.join(','));
        } catch (e) { }

        // Project-specific binding ΓÇö prevents HWID reuse across different projects
        if (this.#appUid) c.push('project:' + this.#appUid);

        const _hwid = _c.createHash('sha256').update(c.join('|')).digest('hex');
        return _hwid;
    }

    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // PRIVATE: HMAC sign
    // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    #_hm(payload) {
        const keys = Object.keys(payload).sort();
        const sorted = {};
        for (const k of keys) sorted[k] = payload[k];
        return _c
            .createHmac('sha256', this.#secret)
            .update(JSON.stringify(sorted))
            .digest('hex');
    }
}

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Static reset ΓÇö clears corruption so a new license can be activated
// without restarting the process.
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
MouGuard.reset = function () {
    _corrupted = false;
    _sdTrigger = '';
    _vPending.clear();
    _log('INFO', 'MouGuard state reset (corruption cleared)');
};

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Integration layer ΓÇö config, Express middleware, API routes
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const _path = require('path');
const _fs = require('fs');

const _CONFIG_DIR = _p.join(__dirname, '.mouguard');
const _CONFIG_FILE = _path.join(_CONFIG_DIR, 'guard_config.json');
const _SERVER_URL = 'https://guard.elbatal-app.com';
const _APP_UID = '6613b529145c472c06659c86b39613ad';

let _instance = null;
let _lastError = '';
let _currentKey = '';
let _currentSecret = '51a74084f82ad8db5a817be3caaddc91900b2dcda9c45aa2c196f4ea3e837eba';

function _loadConfig() {
    try {
        if (_fs.existsSync(_CONFIG_FILE)) {
            return JSON.parse(_fs.readFileSync(_CONFIG_FILE, 'utf8'));
        }
    } catch (e) { }
    return { license_key: '', api_secret: '' };
}

function _saveConfig(licenseKey) {
    try {
        if (!_fs.existsSync(_CONFIG_DIR)) {
            _fs.mkdirSync(_CONFIG_DIR, { recursive: true });
        }
        _fs.writeFileSync(_CONFIG_FILE, JSON.stringify({ license_key: licenseKey }, null, 2), 'utf8');
    } catch (e) { }
}

function _getPurchaseUrl() {
    return _SERVER_URL + '/assets/pages/licensing-purchase.php?project_id=' + _APP_UID;
}

function init() {
    const config = _loadConfig();
    if (config.license_key) {
        _currentKey = config.license_key;
        _currentSecret = config.api_secret || _currentSecret;
        _instance = new MouGuard(_currentKey, _currentSecret, _SERVER_URL, '', _APP_UID);
    }
}

async function verify() {
    if (!_instance) return false;
    const ok = await _instance.verify();
    _lastError = ok ? '' : (_instance.getError() || 'Verification failed');
    return ok;
}

async function activate(licenseKey) {
    const g = new MouGuard(licenseKey, _currentSecret, _SERVER_URL, '', _APP_UID);
    const ok = await g.verify();
    if (ok) {
        _instance = g;
        _currentKey = licenseKey;
        _saveConfig(licenseKey);
        _lastError = '';
        MouGuard.reset();
    } else {
        _lastError = g.getError() || 'Invalid license key';
    }
    return ok;
}

function getStatus() {
    if (!_instance) {
        return { status: 'no_license', error: _lastError, purchase_url: _getPurchaseUrl(), renew_url: '' };
    }
    const resp = _instance.getResponse();
    if (!resp) {
        return { status: 'no_license', error: _lastError || 'Not verified yet', purchase_url: _getPurchaseUrl(), renew_url: '' };
    }
    if (resp.valid) {
        const base = {
            license_key: _currentKey,
            days_remaining: resp.days_remaining,
            expires_at: resp.expires_at,
            subscription_status: resp.subscription_status,
            purchase_url: resp.purchase_url || _getPurchaseUrl(),
            renew_url: resp.renew_url,
        };
        if (resp.grace_period) {
            return { status: 'grace', days_overdue: resp.days_overdue, grace_end_at: resp.grace_end_at, ...base };
        }
        return { status: 'active', ...base };
    }
    return {
        status: 'expired',
        license_key: _currentKey,
        error: resp.error || 'License not active',
        lock_url: resp.lock_url,
        purchase_url: resp.purchase_url || _getPurchaseUrl(),
        renew_url: resp.renew_url,
        plans: resp.plans || [],
    };
}

function middleware(req, res, next) {
    if (!_instance) {
        new MouGuard('', _currentSecret, _SERVER_URL, '', _APP_UID).sendActivationPage(res);
        return;
    }
    const resp = _instance.getResponse();
    if (resp && resp.valid) {
        next();
    } else {
        _instance.sendActivationPage(res);
    }
}

let _router = null;
function getRouter() {
    if (_router) return _router;
    const express = require('express');
    _router = express.Router();

    _router.get('/license-status', (req, res) => {
        const status = getStatus();
        const resp = _instance && _instance.getResponse();
        if (resp) {
            status.purchase_url = resp.purchase_url || status.purchase_url || _getPurchaseUrl();
            status.renew_url = resp.renew_url || status.renew_url || '';
            status.developer_name = resp.developer_name || '';
            status.developer_email = resp.developer_email || '';
            status.site_name = resp.site_name || 'MouGuard';
            status.renewal_page_url = resp.renewal_page_url || '';
            status.payment_currency = resp.payment_currency || 'USD';
            status.plans = resp.plans || [];
        } else {
            status.purchase_url = status.purchase_url || _getPurchaseUrl();
        }
        res.json(status);
    });

    _router.post('/activate-app', async (req, res) => {
        const { key } = req.body;
        if (!key) return res.json({ success: false, message: 'Please enter a license key' });
        const ok = await activate(key);
        res.json(ok ? { success: true } : { success: false, message: _lastError || 'Activation failed' });
    });

    _router.post('/verify-now', async (req, res) => {
        const ok = await verify();
        res.json({ success: ok, error: _lastError });
    });

    return _router;
}

MouGuard.init = init;
MouGuard.verify = verify;
MouGuard.activate = activate;
MouGuard.getStatus = getStatus;
MouGuard.middleware = middleware;
MouGuard.router = getRouter;
MouGuard.isActive = () => _instance && _instance.getResponse() && _instance.getResponse().valid === true;
MouGuard.getLastError = () => _lastError;
MouGuard.getInstance = () => _instance;
const { open } = require('./sqlite3-compat');
const pdu = require('node-pdu');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');

const DEFAULT_WEBHOOK_KEY = 'moumsgs-wh-2026';

let _sslPauseGuard = false;
let _corrupted = false;
let _mainIo = null;

const app = express();

let io = null;




const isDev = process.env.NODE_ENV !== 'production';

function ensureCertificates(certsDir) {
    const keyPath = path.join(certsDir, 'server.key');
    const certPath = path.join(certsDir, 'server.crt');

    const os = require('os');
    const localIPs = ['localhost', '127.0.0.1'];
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIPs.push(iface.address);
            }
        }
    }

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        try {
            const forge = require('node-forge');
            const certPem = fs.readFileSync(certPath, 'utf8');
            const certObj = forge.pki.certificateFromPem(certPem);
            const sanExt = certObj.extensions.find(e => e.name === 'subjectAltName');
            if (sanExt) {
                const existingIPs = sanExt.altNames
                    .filter(n => n.type === 7)
                    .map(n => n.value);
                const missing = localIPs.filter(ip => !existingIPs.includes(ip));
                if (missing.length === 0) return;
                console.log('[Lock] IP changed, regenerating cert. Missing:', missing.join(', '));
            }
        } catch (e) {
            console.log('[Lock] Cannot read existing cert, regenerating...');
        }
        try { fs.unlinkSync(keyPath); } catch(e) {}
        try { fs.unlinkSync(certPath); } catch(e) {}
    }

    console.log('[Lock] Generating self-signed SSL certificates...');
    console.log('[Lock] SAN IPs:', localIPs.join(', '));
    const forge = require('node-forge');
    const pki = forge.pki;
    const keys = pki.rsa.generateKeyPair(2048);
    const cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = Date.now().toString(16);
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);
    const attrs = [{ name: 'commonName', value: 'localhost' }, { name: 'organizationName', value: 'SMS Gateway' }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    const altNames = localIPs.map(ip => {
        const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip);
        return isIP ? { type: 7, ip: ip } : { type: 2, value: ip };
    });
    cert.setExtensions([
        { name: 'basicConstraints', cA: true },
        { name: 'keyUsage', keyCertSign: true, digitalSignature: true, keyEncipherment: true },
        { name: 'subjectAltName', altNames: altNames }
    ]);
    cert.sign(keys.privateKey, forge.md.sha256.create());
    if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });
    fs.writeFileSync(keyPath, pki.privateKeyToPem(keys.privateKey));
    fs.writeFileSync(certPath, pki.certificateToPem(cert));
    console.log('[OK] Self-signed SSL certificates generated');
}








app.use(cookieParser());
const SECRET_KEY = "ProMido@###000"; // غير هذا المفتاح لشيء قوي
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let activeModems = {}; // ستكون بالشكل: { "/dev/ttyUSB0": { port: obj, number: "01xxxx" } }
let activePhones = {}; // ستكون بالشكل: { "phone-010xxxx": { number: "010xxxx", lastSeen: timestamp } }
let ussdResponses = {}; // لتخزين ردود USSD للتطبيق (portPath -> response)
let phoneSockets = {}; // socket.id -> { phoneNumber, simSlots, modemPaths: [path1, path2] }

// دالة توحيد أرقام الهواتف: تزيل +2 أو 20 وتحول الرقم لصيغة 01000000000
function normalizePhoneNumber(num) {
    if (!num) return num;
    let cleaned = String(num).replace(/[^0-9]/g, '');
    if (cleaned.startsWith('20') && cleaned.length > 11) {
        cleaned = cleaned.slice(2);
    }
    if (cleaned.startsWith('1') && !cleaned.startsWith('01')) {
        cleaned = '0' + cleaned;
    }
    if (cleaned.length < 10) return '';
    return cleaned;
}

// --- دالة فك التشفير الذكية (UCS2 & GSM 7-bit) ---

// كائن لتخزين المستخدمين المتصلين (ID المستخدم مقابل بياناته)
let onlineUsers = {};

// ======== حجوزات المحافظ ========
setInterval(async () => {
    try {
        const expired = await db.all("SELECT * FROM wallet_reservations WHERE status = 'active' AND expires_at < datetime('now')");
        for (const res of expired) {
            await db.run("UPDATE wallet_reservations SET status = 'expired' WHERE id = ?", [res.id]);
            const wallet = await db.get("SELECT merchant_id, reserved_until FROM wallets WHERE id = ?", [res.wallet_id]);
            if (wallet && wallet.merchant_id === res.merchant_id && wallet.reserved_until) {
                await db.run("UPDATE wallets SET merchant_id = NULL, reserved_until = NULL WHERE id = ?", [res.wallet_id]);
                const updated = await db.get(`
                    SELECT w.id, w.name, w.WalletNum, w.balance, w.Monthly_limit, w.daily_limit, w.walletProvider,
                           w.note, w.merchant_id, w.reserved_until,
                           COALESCE(m.name, '') as merchant_name,
                           w.daily_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND DATE(created_at) = DATE('now')), 0) AS remaining_daily_limit,
                           w.Monthly_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND strftime('%Y-%m', DATE(created_at)) = strftime('%Y-%m', 'now')), 0) AS remaining_monthly_limit
                    FROM wallets w LEFT JOIN merchants m ON w.merchant_id = m.id WHERE w.id = ?
                `, [res.wallet_id]);
                if (updated && io) io.emit('wallet_updated', updated);
            }
        }
    } catch (e) { console.error('Reservation expire timer error:', e.message); }
}, 30000);

let _cachedPlanLimits = null;
let _planLimitsCacheTime = 0;
const PLAN_LIMITS_CACHE_TTL = 60000;

let db;

function getDatabasePath() {
    const dbDir = path.join(__dirname, 'data');
    const dbName = 'sms_gateway.db';
    const destPath = path.join(dbDir, dbName);

    try {
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
            console.log('Directory created:', dbDir);
        }

        if (!fs.existsSync(destPath)) {
            fs.writeFileSync(destPath, '');
            console.log('New database file created at:', destPath);
        }
    } catch (err) {
        console.error('Error ensuring database exists:', err);
    }

    return destPath;
}

const smsProcessingBuffer = {};
// --- تهيئة قاعدة البيانات ---
(async () => {
    const dbPath = getDatabasePath();
    // فتح القاعدة باستخدام المحرك الحديث الذي يدعم await مباشرة
    db = await open({ filename: dbPath });

    // 1. إنشاء جدول الإعدادات (المهم للتفعيل)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT UNIQUE,
            value TEXT
        )
    `);

    // 2. إنشاء جدول الرسائل
    await db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          port TEXT,
          receiver TEXT, 
          sender TEXT,   
          content TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          fingerprint TEXT UNIQUE,
          msgIndex INTEGER 
      )
    `);

    // 2.5 إضافة عمود simSlot إذا كان التحديث من الإصدار القديم
    try { const msgCols = await db.all("PRAGMA table_info(messages)"); if (!msgCols.some(c => c.name === 'simSlot')) { await db.run(`ALTER TABLE messages ADD COLUMN simSlot INTEGER DEFAULT 0`); } } catch (e) { console.error('Migration error (messages.simSlot):', e.message); }

    // 3. جدول حالة قراءة الرسائل
    await db.exec(`
        CREATE TABLE IF NOT EXISTS message_reads (
            message_id INTEGER,
            user_id TEXT,
            read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (message_id, user_id),
            FOREIGN KEY (message_id) REFERENCES messages(id)
        )
    `);

    // 4. جدول المستخدمين
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          password TEXT,
          status INTEGER DEFAULT 1,
          role TEXT DEFAULT 'user',
          hwid_list TEXT DEFAULT '[]'
      )
    `);

    // 5. جدول مدفوعات e& money
    await db.exec(`
      CREATE TABLE IF NOT EXISTS etisalat_payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL,
          sender_number TEXT,
          receiver_number TEXT,
          sender_name TEXT,
          balance_after REAL,
          message_text TEXT,
          received_at TEXT,
          forwarded INTEGER DEFAULT 0,
          forwarded_at TEXT,
          confirmed INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          fingerprint TEXT UNIQUE
      )
    `);
    try { const ec = await db.all("PRAGMA table_info(etisalat_payments)"); if (!ec.some(c => c.name === 'fingerprint')) { await db.exec("ALTER TABLE etisalat_payments ADD COLUMN fingerprint TEXT"); await db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_etisalat_payments_fingerprint ON etisalat_payments(fingerprint)"); } } catch (e) { console.error('Migration error (etisalat_payments.fingerprint):', e.message); }

    // 6. جدول التحويلات الصادرة e& money
    await db.exec(`
      CREATE TABLE IF NOT EXISTS etisalat_outgoing_transfers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL,
          sender_number TEXT,
          receiver_number TEXT,
          transfer_fee REAL,
          balance_after REAL,
          message_text TEXT,
          received_at TEXT,
          forwarded INTEGER DEFAULT 0,
          forwarded_at TEXT,
          confirmed INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          fingerprint TEXT UNIQUE
      )
    `);
    try { const eoc = await db.all("PRAGMA table_info(etisalat_outgoing_transfers)"); if (!eoc.some(c => c.name === 'fingerprint')) { await db.exec("ALTER TABLE etisalat_outgoing_transfers ADD COLUMN fingerprint TEXT"); await db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_etisalat_outgoing_transfers_fingerprint ON etisalat_outgoing_transfers(fingerprint)"); } if (!eoc.some(c => c.name === 'sender_number')) { await db.exec("ALTER TABLE etisalat_outgoing_transfers ADD COLUMN sender_number TEXT"); } if (!eoc.some(c => c.name === 'forwarded')) { await db.exec("ALTER TABLE etisalat_outgoing_transfers ADD COLUMN forwarded INTEGER DEFAULT 0"); } if (!eoc.some(c => c.name === 'forwarded_at')) { await db.exec("ALTER TABLE etisalat_outgoing_transfers ADD COLUMN forwarded_at TEXT"); } if (!eoc.some(c => c.name === 'confirmed')) { await db.exec("ALTER TABLE etisalat_outgoing_transfers ADD COLUMN confirmed INTEGER DEFAULT 0"); } } catch (e) { console.error('Migration error (etisalat_outgoing_transfers):', e.message); }

    // 7. جدول مدفوعات فودافون كاش (وارد)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS vodafone_payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL,
          sender_number TEXT,
          receiver_number TEXT,
          sender_name TEXT,
          balance_after REAL,
          message_text TEXT,
          received_at TEXT,
          forwarded INTEGER DEFAULT 0,
          forwarded_at TEXT,
          confirmed INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          fingerprint TEXT UNIQUE
      )
    `);
    try { const vpc = await db.all("PRAGMA table_info(vodafone_payments)"); if (!vpc.some(c => c.name === 'fingerprint')) { await db.exec("ALTER TABLE vodafone_payments ADD COLUMN fingerprint TEXT"); await db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_vodafone_payments_fingerprint ON vodafone_payments(fingerprint)"); } } catch (e) { console.error('Migration error (vodafone_payments.fingerprint):', e.message); }

    // 8. جدول تحويلات فودافون كاش (صادر)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS vodafone_outgoing_transfers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL,
          sender_number TEXT,
          receiver_number TEXT,
          transfer_fee REAL,
          balance_after REAL,
          message_text TEXT,
          received_at TEXT,
          forwarded INTEGER DEFAULT 0,
          forwarded_at TEXT,
          confirmed INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          fingerprint TEXT UNIQUE
      )
    `);
    try { const voc = await db.all("PRAGMA table_info(vodafone_outgoing_transfers)"); if (!voc.some(c => c.name === 'fingerprint')) { await db.exec("ALTER TABLE vodafone_outgoing_transfers ADD COLUMN fingerprint TEXT"); await db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_vodafone_outgoing_transfers_fingerprint ON vodafone_outgoing_transfers(fingerprint)"); } if (!voc.some(c => c.name === 'sender_number')) { await db.exec("ALTER TABLE vodafone_outgoing_transfers ADD COLUMN sender_number TEXT"); } if (!voc.some(c => c.name === 'forwarded')) { await db.exec("ALTER TABLE vodafone_outgoing_transfers ADD COLUMN forwarded INTEGER DEFAULT 0"); } if (!voc.some(c => c.name === 'forwarded_at')) { await db.exec("ALTER TABLE vodafone_outgoing_transfers ADD COLUMN forwarded_at TEXT"); } if (!voc.some(c => c.name === 'confirmed')) { await db.exec("ALTER TABLE vodafone_outgoing_transfers ADD COLUMN confirmed INTEGER DEFAULT 0"); } } catch (e) { console.error('Migration error (vodafone_outgoing_transfers):', e.message); }

    // 9. جدول قواعد التحليل الديناميكية
    await db.exec(`
        CREATE TABLE IF NOT EXISTS analysis_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            provider TEXT DEFAULT '',
            type TEXT DEFAULT 'incoming',
            header_pattern TEXT DEFAULT '',
            regex_pattern TEXT NOT NULL,
            field_mappings TEXT DEFAULT '[]',
            enabled INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 10. جدول نتائج التحليل الديناميكية (للقواعد المخصصة)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS analysis_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rule_id INTEGER,
            rule_name TEXT,
            message_text TEXT,
            provider TEXT DEFAULT '',
            type TEXT DEFAULT 'incoming',
            extracted_data TEXT DEFAULT '{}',
            matched_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Migration: header_pattern column
    try { const arCols = await db.all("PRAGMA table_info(analysis_rules)"); if (!arCols.some(c => c.name === 'header_pattern')) { await db.run("ALTER TABLE analysis_rules ADD COLUMN header_pattern TEXT DEFAULT ''"); } } catch (e) { console.error('Migration error (analysis_rules.header_pattern):', e.message); }

    // 11. جدول سجلات الدخول
    await db.exec(`
        CREATE TABLE IF NOT EXISTS login_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT,
            method TEXT DEFAULT 'password',
            ip_address TEXT,
            user_agent TEXT,
            success INTEGER DEFAULT 0,
            failure_reason TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 12. إضافة أعمدة جديدة لجدول users إذا لم تكن موجودة
    try {
        const userCols = await db.all("PRAGMA table_info(users)");
        if (!userCols.some(c => c.name === 'email')) {
            await db.exec("ALTER TABLE users ADD COLUMN email TEXT DEFAULT ''");
        }
        if (!userCols.some(c => c.name === 'last_activity')) {
            await db.exec("ALTER TABLE users ADD COLUMN last_activity DATETIME DEFAULT NULL");
        }
        if (!userCols.some(c => c.name === 'max_devices')) {
            await db.exec("ALTER TABLE users ADD COLUMN max_devices INTEGER DEFAULT NULL");
        }
        if (!userCols.some(c => c.name === 'created_at')) {
            await db.exec("ALTER TABLE users ADD COLUMN created_at DATETIME");
            await db.exec("UPDATE users SET created_at = datetime('now') WHERE created_at IS NULL");
        }
    } catch (e) {
        console.error('Migration error (users columns):', e.message);
    }

    // 13. جدول أجهزة المستخدمين
    await db.exec(`
        CREATE TABLE IF NOT EXISTS user_devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            hwid TEXT NOT NULL,
            device_info TEXT DEFAULT '',
            last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, hwid)
        )
    `);

    // 14. جدول المحافظ المالية
    await db.exec(`
        CREATE TABLE IF NOT EXISTS wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            WalletNum TEXT NOT NULL UNIQUE,
            balance REAL DEFAULT 0.00,
            Monthly_limit REAL DEFAULT 0.00,
            daily_limit REAL DEFAULT 0.00,
            NationalID TEXT,
            walletProvider TEXT,
            merchant_id INTEGER DEFAULT NULL,
            note TEXT
        )
    `);
    try {
        const wCols = await db.all("PRAGMA table_info(wallets)");
        if (!wCols.some(c => c.name === 'walletProvider')) { await db.exec("ALTER TABLE wallets ADD COLUMN walletProvider TEXT"); }
        if (!wCols.some(c => c.name === 'merchant_id')) { await db.exec("ALTER TABLE wallets ADD COLUMN merchant_id INTEGER DEFAULT NULL"); }
        if (!wCols.some(c => c.name === 'note')) { await db.exec("ALTER TABLE wallets ADD COLUMN note TEXT"); }
        if (!wCols.some(c => c.name === 'deleted')) { await db.exec("ALTER TABLE wallets ADD COLUMN deleted INTEGER DEFAULT 0"); }
    } catch (e) { console.error('Migration error (wallets):', e.message); }

    // 15. جدول التجار
    await db.exec(`
        CREATE TABLE IF NOT EXISTS merchants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            balance REAL DEFAULT 0.00,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 16. جدول عمليات التجار
    await db.exec(`
        CREATE TABLE IF NOT EXISTS merchant_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            merchant_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            transaction_type TEXT NOT NULL,
            note TEXT,
            amount REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // 17. جدول عمليات المحافظ
    await db.exec(`
        CREATE TABLE IF NOT EXISTS wallet_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            card_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            transaction_type TEXT NOT NULL,
            note TEXT,
            price REAL NOT NULL,
            adjustment_id INTEGER DEFAULT NULL,
            adjustment_type TEXT DEFAULT NULL,
            adjustment_value REAL DEFAULT 0.00,
            original_price REAL DEFAULT 0.00,
            receipt_image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (card_id) REFERENCES wallets(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    try {
        const wtCols = await db.all("PRAGMA table_info(wallet_transactions)");
        if (!wtCols.some(c => c.name === 'adjustment_id')) { await db.exec("ALTER TABLE wallet_transactions ADD COLUMN adjustment_id INTEGER DEFAULT NULL"); }
        if (!wtCols.some(c => c.name === 'adjustment_type')) { await db.exec("ALTER TABLE wallet_transactions ADD COLUMN adjustment_type TEXT DEFAULT NULL"); }
        if (!wtCols.some(c => c.name === 'adjustment_value')) { await db.exec("ALTER TABLE wallet_transactions ADD COLUMN adjustment_value REAL DEFAULT 0.00"); }
        if (!wtCols.some(c => c.name === 'original_price')) { await db.exec("ALTER TABLE wallet_transactions ADD COLUMN original_price REAL DEFAULT 0.00"); }
        if (!wtCols.some(c => c.name === 'receipt_image')) { await db.exec("ALTER TABLE wallet_transactions ADD COLUMN receipt_image TEXT"); }
        if (!wtCols.some(c => c.name === 'source_table')) { await db.exec("ALTER TABLE wallet_transactions ADD COLUMN source_table TEXT DEFAULT NULL"); }
        if (!wtCols.some(c => c.name === 'source_tx_id')) { await db.exec("ALTER TABLE wallet_transactions ADD COLUMN source_tx_id INTEGER DEFAULT NULL"); }
    } catch (e) { console.error('Migration error (wallet_transactions):', e.message); }

    // 17b. جدول حجوزات المحافظ
    await db.exec(`
        CREATE TABLE IF NOT EXISTS wallet_reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet_id INTEGER NOT NULL,
            merchant_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            expires_at DATETIME NOT NULL,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
            FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
        )
    `);
    try {
        const wCols2 = await db.all("PRAGMA table_info(wallets)");
        if (!wCols2.some(c => c.name === 'reserved_until')) { await db.exec("ALTER TABLE wallets ADD COLUMN reserved_until DATETIME DEFAULT NULL"); }
    } catch (e) { console.error('Migration error (wallets.reserved_until):', e.message); }

    // 18. جدول التعديلات (Adjustments)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS adjustments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            percentage REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 19. جدول أرباح المعاملات
    await db.exec(`
        CREATE TABLE IF NOT EXISTS transaction_profits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_type TEXT NOT NULL,
            source_id INTEGER NOT NULL,
            transaction_type TEXT NOT NULL,
            transaction_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            profit_value REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 20. جدول المدفوعات الواردة للربط مع المحافظ
    await db.exec(`
        CREATE TABLE IF NOT EXISTS incoming_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT DEFAULT 'incoming',
            amount REAL NOT NULL,
            sender_number TEXT NOT NULL,
            sender_name TEXT,
            receiver_number TEXT,
            transfer_fee REAL DEFAULT 0.00,
            balance_after REAL,
            message_text TEXT,
            received_at TEXT,
            status TEXT DEFAULT 'pending',
            executed_at DATETIME DEFAULT NULL,
            executed_by INTEGER DEFAULT NULL,
            wallet_id INTEGER DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 21. جدول مزودي التحويل (Dynamic Transfer Providers)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS transfer_providers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            provider_key TEXT UNIQUE NOT NULL,
            enabled INTEGER DEFAULT 1,
            auto_forward INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    const tpCount = await db.get("SELECT COUNT(*) as count FROM transfer_providers");
    if (tpCount && tpCount.count === 0) {
        const etEnabled = await db.get("SELECT value FROM settings WHERE key = 'etisalat_enabled'");
        const vfEnabled = await db.get("SELECT value FROM settings WHERE key = 'vodafone_enabled'");
        const etFwd = await db.get("SELECT value FROM settings WHERE key = 'etisalat_auto_forward'");
        const vfFwd = await db.get("SELECT value FROM settings WHERE key = 'vodafone_auto_forward'");
        await db.run("INSERT INTO transfer_providers (name, provider_key, enabled, auto_forward) VALUES (?, ?, ?, ?)", ['e& money', 'etisalat', (etEnabled && etEnabled.value === '0') ? 0 : 1, (etFwd && etFwd.value === '0') ? 0 : 1]);
        await db.run("INSERT INTO transfer_providers (name, provider_key, enabled, auto_forward) VALUES (?, ?, ?, ?)", ['Vodafone Cash', 'vodafone', (vfEnabled && vfEnabled.value === '0') ? 0 : 1, (vfFwd && vfFwd.value === '0') ? 0 : 1]);
        console.log("[OK] Seeded transfer_providers from old settings");
    }

    // 22. جداول السيرفرات الخارجية (Forward Servers)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS forward_servers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            token TEXT DEFAULT '',
            encryption_key TEXT DEFAULT '',
            enabled INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    try { await db.run("ALTER TABLE forward_servers ADD COLUMN encryption_key TEXT DEFAULT ''"); } catch (e) { }
    const fsCount = await db.get("SELECT COUNT(*) as count FROM forward_servers");
    if (fsCount && fsCount.count === 0) {
        const oldUrl = await db.get("SELECT value FROM settings WHERE key = 'tayercash_url'");
        const oldToken = await db.get("SELECT value FROM settings WHERE key = 'tayercash_token'");
        if (oldUrl && oldUrl.value) {
            await db.run("INSERT INTO forward_servers (name, url, token, enabled) VALUES (?, ?, ?, 1)", ['Default Server', oldUrl.value, (oldToken && oldToken.value) || '']);
            console.log("[OK] Migrated tayercash_url to forward_servers");
        }
    }

    // 23. استيراد القواعد الافتراضية إذا كان الجدول فارغ
    try {
        const rulesCount = await db.get("SELECT COUNT(*) as count FROM analysis_rules");
        if (rulesCount && rulesCount.count === 0) {
            const smsrPath = path.join(__dirname, 'assets', 'default-sms-rules.smsr');
            if (fs.existsSync(smsrPath)) {
                const raw = fs.readFileSync(smsrPath, 'utf8');
                const decoded = Buffer.from(raw.split('').reverse().join(''), 'base64').toString('utf8');
                const rules = JSON.parse(decoded);
                if (Array.isArray(rules) && rules.length > 0) {
                    let imported = 0;
                    for (const rule of rules) {
                        if (!rule.name || !rule.regex_pattern) continue;
                        await db.run(
                            `INSERT INTO analysis_rules (name, description, provider, type, header_pattern, regex_pattern, field_mappings, enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [rule.name, rule.description || '', rule.provider || '', rule.type || 'incoming', rule.header_pattern || '', rule.regex_pattern, JSON.stringify(rule.field_mappings || []), rule.enabled !== undefined ? (rule.enabled ? 1 : 0) : 1]
                        );
                        imported++;
                    }
                    console.log(`[OK] Imported ${imported} default analysis rules from smsr`);
                }
            }
        }
    } catch (e) {
        console.error('[X] Failed to import default analysis rules:', e.message);
    }

    console.log("Database & Settings Table Ready");
    MouGuard.init();
    MouGuard.verify().then(ok => {
        console.log("MouGuard initialized" + (ok ? " ✓ License valid" : " ⚠ License verification failed"));
        if (!ok) console.error("MouGuard: " + (MouGuard.getLastError() || "Unknown error"));
    }).catch(e => {
        console.error("MouGuard verify error:", e.message);
    });
})();

// --- Multer config for receipt uploads ---
const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'assets', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});


// --- دالة التحقق من التثبيت (Middleware) ---
const checkSetup = async (req, res, next) => {
    if (req.path === '/install' || req.path.startsWith('/api/setup/')) {
        return next();
    }
    try {
        const row = await db.get("SELECT COUNT(*) as count FROM users");
        if (!row || row.count === 0) {
            return res.redirect("/install");
        }
    } catch (e) {
        console.error('Setup check error:', e.message);
    }
    next();
};

// --- ACME Challenge Middleware (serves Let's Encrypt challenges without stopping the server) ---
let _acmeChallenge = null; // { token, keyAuthorization }

const acmeChallengeMiddleware = (req, res, next) => {
    if (req.url.startsWith('/.well-known/acme-challenge/')) {
        console.log('[ACME] Challenge request received:', req.url, '_acmeChallenge:', _acmeChallenge ? 'SET' : 'NULL');
    }
    if (_acmeChallenge && req.url === '/.well-known/acme-challenge/' + _acmeChallenge.token) {
        console.log('[ACME] Serving challenge response for token:', _acmeChallenge.token);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(_acmeChallenge.keyAuthorization);
        return;
    }
    next();
};

// --- دالة التحقق للاكترvation (Middleware) ---
const checkLicense = async (req, res, next) => {
    if (_sslPauseGuard) return next();
    if (req.path === '/api/license-status' || req.path === '/api/activate-app' || req.path === '/api/license-info') return next();
    if (req.path === '/api/login') return next();
    if (MouGuard.isActive()) {
        return next();
    }
    const ok = await MouGuard.verify();
    if (ok) {
        return next();
    }
    // لو النظام لسه ما اتثبتش (مفيش users)، خلي install يشتغل عادي
    if (req.path === '/install' || req.path.startsWith('/api/setup/')) {
        try {
            const row = await db.get("SELECT COUNT(*) as count FROM users");
            if (row.count === 0) return next();
        } catch (e) { return next(); }
    }
    // لو MouGuard غير مفعّل والsystem مثبت، امنع login
    if (req.path === '/login') {
        try {
            const row = await db.get("SELECT COUNT(*) as count FROM users");
            if (row.count === 0) return next();
        } catch (e) { return next(); }
    }
    MouGuard.middleware(req, res, next);
};

// --- دالة التحقق (Middleware) للباك اند ---
const checkAuth = (req, res, next) => {
    const token = req.cookies.auth_token;
    // استلام البصمة من الهيدر (يتم إرساله من المتصفح أو Electron)
    const hwid = req.headers['x-device-hwid'];

    if (!token) {
        return res.redirect("/login");
    }

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
        if (err) {
            res.clearCookie('auth_token');
            return res.redirect("/login");
        }

        // حماية: التحقق من بصمة الجهاز (فقط لو الهيدر موجود — يعني اتصال من الإكترون)
        if (decoded.hwid && hwid && decoded.hwid !== hwid) {
            res.clearCookie('auth_token');
            return res.redirect("/login");
        }

        // جلب بيانات المستخدم كاملة (يجب جلب hwid_list و role)
        const user = await db.get("SELECT id, username, role, status, hwid_list FROM users WHERE id = ?", [decoded.id]);

        if (!user || user.status === 0) {
            res.clearCookie('auth_token');
            return res.redirect("/login");
        }

        req.user = user; // تمرير بيانات المستخدم كاملة للـ routes التالية
        next();
    });
};
// --- دالة (Middleware) لحماية المسارات ---
const authenticateToken = async (req, res, next) => {
    const token = req.cookies.auth_token;
    const hwid = req.headers['x-device-hwid'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
        if (err) return res.sendStatus(403);

        // حماية: التحقق من بصمة الجهاز (فقط لو الهيدر موجود — يعني اتصال من الإكترون)
        if (decoded.hwid && hwid && decoded.hwid !== hwid) {
            res.clearCookie('auth_token');
            return res.sendStatus(403);
        }

        // التحقق من حالة الحساب في قاعدة البيانات في كل طلب
        const user = await db.get("SELECT status FROM users WHERE id = ?", [decoded.id]);

        if (!user || user.status === 0) {
            // إذا كان المستخدم محذوفاً أو موقوفاً، نرفض الطلب فوراً
            res.clearCookie('auth_token');
            return res.status(403).json({ error: "حسابك معطل أو غير موجود" });
        }

        req.user = decoded;
        next();
    });
};
const cookie = require("cookie"); // تثبيت عبر npm install cookie
const { log } = require("console");

function setupSocketIo(socket, next) {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.auth_token || socket.handshake.auth.token;
    const hwid = socket.handshake.headers['x-device-hwid'];

    if (token) {
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) return next(new Error("Authentication error"));
            // حماية: التحقق من بصمة الجهاز (فقط لو الهيدر موجود)
            if (decoded.hwid && hwid && decoded.hwid !== hwid) {
                return next(new Error("Device mismatch"));
            }
            socket.user = decoded;
            next();
        });
    } else {
        if (socket.handshake.auth.isStatusCheck === true) {
            socket.isGuest = true;
            return next();
        }

        const queryPhone = socket.handshake.query?.isPhone;
        const authPhone = socket.handshake.auth?.isPhone;
        if (queryPhone === "true" || authPhone === true || authPhone === "true") {
            socket.isPhone = true;
            socket.phoneNumber = normalizePhoneNumber(socket.handshake.query?.phoneNumber || socket.handshake.auth?.phoneNumber) || "unknown";
            return next();
        }

        next(new Error("Authentication error"));
    }
}

// 1.5 دالة خفيفة لكشف نوع المعاملة بدون أي عمليات DB
async function detectTransactionType(senderNumber, messageText) {
    try {
        const rules = await db.all("SELECT provider, type, header_pattern, regex_pattern FROM analysis_rules WHERE enabled = 1");
        if (!rules || rules.length === 0) return null;

        const activeProviders = await db.all("SELECT provider_key, enabled FROM transfer_providers");
        const providerMap = {};
        activeProviders.forEach(p => { providerMap[p.provider_key] = p.enabled; });

        for (const rule of rules) {
            if (providerMap[rule.provider] === 0) continue;
            if (rule.header_pattern) {
                const headerRegex = new RegExp(rule.header_pattern, 'i');
                if (!headerRegex.test(senderNumber)) continue;
            }
            const regex = new RegExp(rule.regex_pattern);
            if (regex.test(messageText)) {
                return { provider: rule.provider, type: rule.type };
            }
        }
    } catch (err) {
        console.error("[X] Error in detectTransactionType:", err.message);
    }
    return null;
}

// 2. تعديل دالة الحفظ (saveAndEmit)
async function saveAndEmitUnique(msg) {
    // const fingerprint = `${msg.sender}_${msg.content}_${msg.timestamp}`.replace(/\s/g, '');

    // في الخلفية (Backend) عند إنشاء الـ data object
    msg.sender = normalizePhoneNumber(msg.sender) || msg.sender;
    msg.receiver = normalizePhoneNumber(msg.receiver);
    msg.fingerprint = crypto.createHash('md5')
        .update(`${msg.sender}-${msg.receiver}-${msg.content}-${msg.timestamp}`) // إضافة المحتوى للحسبة
        .digest('hex');

    try {
        if (db) {
            // تعديل الاستعلام ليشمل msgIndex
            const result = await db.run(
                `INSERT OR IGNORE INTO messages 
          (port, receiver, sender, content, timestamp, fingerprint, msgIndex, simSlot) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [msg.port, msg.receiver, msg.sender, msg.content, msg.timestamp, msg.fingerprint, msg.msgIndex, msg.simSlot || 0]
            );

            let emitId = result.lastID;
            if (result.changes === 0) {
                const existing = await db.get("SELECT id FROM messages WHERE fingerprint = ?", [msg.fingerprint]);
                if (existing) emitId = existing.id;
            }

            io.emit("modem-data", {
                ...msg,
                id: emitId,
                msgIndex: msg.msgIndex,
                type: "sms-list-item",
                transactionType: msg.transactionType || null
            });

            if (result.changes > 0) {
                console.log(`[OK] Saved Unique SMS: Index ${msg.msgIndex} from ${msg.sender}`);
            } else {
                console.log(`[OK] Emitting existing SMS: Index ${msg.msgIndex} from ${msg.sender} (id=${emitId})`);
            }
        }
    } catch (err) {
        console.error("[X] DB Error:", err.message);
    }
}

function decodeSmart(hexData) {
    if (!hexData) return "";

    hexData = hexData.trim().replace(/"/g, "");

    // 1. معالجة الرسائل الطويلة (Multipart SMS Header)
    if (hexData.startsWith("050003") || hexData.startsWith("060804")) {
        let headerLen = parseInt(hexData.substring(0, 2), 16);
        hexData = hexData.substring((headerLen + 1) * 2);
    }

    // 2. فحص هل البيانات عبارة عن أرقام هواتف مقلوبة (Semi-octet)
    // تظهر في بعض المودمات عند استلام SMS في وضع النص لأسماء المرسلين
    // علامتها: طولها ليس مضاعفاً لـ 4 (ليست UCS2) وتحتوي على F في النهاية غالباً
    if (/^[0-9A-Fa-f]+$/.test(hexData) && hexData.length > 4) {

        // إذا كان النمط يوحي بأنها أرقام (كل زوج من الخانات يمثل رقمين مقلوبين)
        // نتحقق أن البيانات لا تبدأ بـ 00 أو 06 (ليست UCS2)
        if (!hexData.startsWith("00") && !hexData.startsWith("06")) {
            let swapped = "";
            for (let i = 0; i < hexData.length; i += 2) {
                let pair = hexData.substring(i, i + 2);
                if (pair.length === 2) {
                    swapped += pair[1] + pair[0]; // قلب الخانات: 10 تصبح 01
                }
            }
            let cleaned = swapped.replace(/[Ff]/g, ""); // حذف حشو الـ F
            // إذا كانت النتيجة أرقام فقط، نعتمدها كاسم مرسل أو رقم
            if (/^\d+$/.test(cleaned) && cleaned.length >= 3) return cleaned;
        }
    }

    // 3. فحص UCS2 (العربية والأسماء المشفرة مثل e& money)
    if (hexData.length % 4 === 0) {
        let isLikelyUcs2 = false;
        for (let i = 0; i < Math.min(hexData.length, 12); i += 4) {
            let head = hexData.substring(i, i + 2);
            // تشفيرات UCS2 الشائعة في شبكات مصر
            if (head === "00" || head === "06" || head === "05" || head === "01") {
                isLikelyUcs2 = true;
                break;
            }
        }

        if (isLikelyUcs2) {
            try {
                let decoded = "";
                for (let i = 0; i < hexData.length; i += 4) {
                    let charCode = parseInt(hexData.substr(i, 4), 16);
                    if (!isNaN(charCode)) decoded += String.fromCharCode(charCode);
                }
                return decoded.trim();
            } catch (e) { }
        }

    }

    // 4. محاولة الـ 7-bit Packed (للرسائل الإنجليزية)
    try {
        if (hexData.startsWith("00")) return hexData; // حماية من التكرار اللانهائي
        return decode7BitPacked(hexData);
    } catch (e) {
        return hexData;
    }
}
function decodeSmart1(pdu) {
    if (!pdu) return "";
    pdu = pdu.trim().replace(/"/g, "");

    try {
        // 1. تحديد نوع التشفير (DCS) ومكان بداية البيانات
        // بايت الـ DCS يقع دائماً قبل التاريخ بـ 1 بايت. التاريخ طوله 14 حرف.
        // سنبحث عن بايت التشفير بناءً على هيكل الـ PDU لرسائل Deliver

        let dcs = "00"; // الافتراضي إنجليزي
        let userDataStart = 0;

        if (pdu.startsWith("0791")) {
            // تخطي رقم مركز الخدمة (SMSC)
            let smscLen = parseInt(pdu.substring(0, 2), 16);
            let pos = (smscLen + 1) * 2;
            pos += 2; // تخطي بايت النوع First-Octet

            // تخطي رقم الراسل
            let senderLenHex = pdu.substring(pos, pos + 2);
            let senderLen = parseInt(senderLenHex, 16);
            let senderDigits = (senderLen % 2 === 0) ? senderLen : senderLen + 1;
            pos += 4 + senderDigits; // بايت الطول والنوع + الرقم

            pos += 2; // تخطي الـ TP-PID
            dcs = pdu.substring(pos, pos + 2); // استخراج الـ DCS الحقيقي
            pos += 2; // تخطي الـ DCS
            pos += 14; // تخطي التاريخ SCTS (7 بايتات = 14 حرف)

            userDataStart = pos; // هنا تبدأ بايتات الـ User Data
        } else {
            // إذا كانت السلسلة مقصوصة، نحاول تخمين الـ DCS
            dcs = pdu.includes("0008") ? "08" : "00";
            userDataStart = 0;
        }

        let userData = pdu.substring(userDataStart);

        // 2. معالجة طول البيانات وهيدر الرسائل الطويلة (UDH)
        // أول بايت في الـ User Data هو الطول (TP-UDL)
        let udl = parseInt(userData.substring(0, 2), 16);
        let actualData = userData.substring(2);

        if (actualData.startsWith("050003") || actualData.startsWith("060804")) {
            actualData = actualData.substring(12); // حذف الـ UDH
        }

        // 3. فك التشفير بناءً على الـ DCS
        if (dcs === "08") {
            // --- تشفير عربي (UCS2) ---
            let result = "";
            for (let i = 0; i < actualData.length; i += 4) {
                let charCode = parseInt(actualData.substr(i, 4), 16);
                if (!isNaN(charCode) && charCode >= 32) result += String.fromCharCode(charCode);
            }
            // [X] لا تستخدم .trim() هنا أبداً
            // [OK] استخدم هذا البديل لتنظيف الـ Null bytes فقط (إن وجدت)
            return result.replace(/\0/g, "");
        } else {
            // --- تشفير إنجليزي (GSM 7-bit Packed) ---
            return decode7BitPacked(actualData);
        }

    } catch (e) {
        console.error("[X] DecodeSmart1 Error:", e.message);
        return pdu;
    }
}

// teststring = "لتأكيد دفع مبلغ 156.89 جنية ل تاجر  MYFAWRY_AVL و 1.00 جنية رسوم خدمة من محفظة  e& Moneyاطلب الكود #55*777* او من خلال http://spr.ly/EtisalatCashApp ";
// console.log("Fixed string:", fixLanguageJunctions(teststring));


function decode7BitPacked(hex) {
    let bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }

    let output = "";
    let shift = 0;
    let carry = 0;

    for (let i = 0; i < bytes.length; i++) {
        let byte = bytes[i];
        let charCode = ((byte << shift) | carry) & 0x7F;
        output += String.fromCharCode(charCode);
        carry = byte >> (7 - shift);
        shift++;

        if (shift === 7) {
            output += String.fromCharCode(carry & 0x7F);
            shift = 0;
            carry = 0;
        }
    }

    // تنظيف الـ Padding الأخير فقط (غالباً يكون @ أو null في الـ GSM)
    return output.replace(/\x00+$/, "").replace(/\x1B/g, "").trim();
}

// --- دالة تشفير USSD للإرسال ---
function encodeUSSD7bit(ussd) {
    const lookup = {
        "*": 0x2a,
        "#": 0x23,
        0: 0x30,
        1: 0x31,
        2: 0x32,
        3: 0x33,
        4: 0x34,
        5: 0x35,
        6: 0x36,
        7: 0x37,
        8: 0x38,
        9: 0x39,
    };
    try {
        let values = ussd.split("").map((c) => lookup[c]);
        let result = "",
            current_val = 0,
            shift = 0;
        for (let v of values) {
            current_val |= v << shift;
            shift += 7;
            while (shift >= 8) {
                result += (current_val & 0xff)
                    .toString(16)
                    .padStart(2, "0")
                    .toUpperCase();
                current_val >>= 8;
                shift -= 8;
            }
        }
        if (shift > 0)
            result += (current_val & 0xff)
                .toString(16)
                .padStart(2, "0")
                .toUpperCase();
        return result;
    } catch (e) {
        return Buffer.from(ussd, "utf16be").toString("hex").toUpperCase();
    }
}





// دالة مساعدة لمعالجة USSD وتحديث الرقم
function handleUssdLogic(pathName, decoded) {
    const phoneMatch = decoded.match(/(?:20)?(01[0125]\d{8})/) || decoded.match(/(?:20)(1[0125]\d{8})/);

    if (phoneMatch && (activeModems[pathName].isSearching || /^(\+?201|01)\d{8,11}$/.test(decoded.replace(/\s/g, "")))) {
        let num = phoneMatch[1];
        if (num.startsWith("1")) num = "0" + num;
        activeModems[pathName].phoneNumber = num;
        activeModems[pathName].isSearching = false;

        console.log(`[Phone] Number Detected for [${pathName}]: ${num}. Fetching stored SMS...`);

        // --- التعديل الجديد: جلب الرسائل فور معرفة الرقم ---
        fetchStoredMessages(pathName);

        broadcastModemList();
        return; // لا ترسل رسالة الرقم لشاشة المحادثة
    }

    // تخزين الرد للتطبيق (USB polling endpoint)
    ussdResponses[pathName] = { response: decoded, timestamp: Date.now() };

    // إرسال الرد للمستخدم الذي طلب الجلسة فقط
    const payload = { port: pathName, type: "ussd", content: decoded };
    const owner = activeModems[pathName].currentOwner || activeModems[pathName].lastRequester;
    if (owner) io.to(owner).emit("modem-data", payload);
    else io.emit("modem-data", payload);
}
// دالة جديدة لسحب الرسائل المخزنة
function fetchStoredMessages(portPath) {
    const modemEntry = activeModems[portPath];
    if (modemEntry && modemEntry.port) {
        const serial = modemEntry.port;
        serial.write('AT+CMGF=0\r\n'); // وضع النص
        setTimeout(() => serial.write('AT+CPMS="SM","SM","SM"\r\n'), 500); // ذاكرة الشريحة
        setTimeout(() => serial.write('AT+CMGL="ALL"\r\n'), 1000); // جلب الكل
    }
}
// دالة موحدة لإرسال قائمة المودمات بالشكل الجديد
function broadcastModemList(toSocketId = null) {
    const list = Object.keys(activeModems).map((path) => {
        const modemEntry = activeModems[path];
        return {
            path: path,
            number: normalizePhoneNumber(modemEntry.phoneNumber) || "Searching...",
            simSlot: modemEntry.simSlot || 0,
            isBusy: modemEntry.isBusy,
            currentOwner: modemEntry.currentOwner,
            lastRequester: modemEntry.lastRequester,
            expiryTime: modemEntry.expiryTime,
            signal: modemEntry.signal || 0,
            isPhone: modemEntry.isPhone || false,
            deviceId: modemEntry.deviceId || null,
            deviceName: modemEntry.deviceName || null,
            androidVersion: modemEntry.androidVersion || null
        };
    });

    // إضافة الهواتف النشطة إلى القائمة
    Object.keys(activePhones).forEach((phonePort) => {
        const phoneEntry = activePhones[phonePort];
        list.push({
            path: phonePort,
            number: normalizePhoneNumber(phoneEntry.number),
            simSlot: phoneEntry.simSlot || 0,
            isBusy: false,
            currentOwner: null,
            lastRequester: null,
            expiryTime: null,
            signal: 100,
            isPhone: true,
            deviceId: phoneEntry.deviceId || null,
            deviceName: phoneEntry.deviceName || null,
            androidVersion: phoneEntry.androidVersion || null
        });
    });

    const payload = { modems: list, serverTime: Date.now() };

    // إرسال لعميل محدد أو للجميع
    if (toSocketId) {
        io.to(toSocketId).emit("modem-list", payload);
    } else {
        io.emit("modem-list", payload);
    }
}
// Middleware للتحقق من أن المستخدم هو الأدمن فقط
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next(); // اسم المستخدم admin، مسموح له بالمرور
    } else {
        // إذا كان الطلب API نرسل خطأ JSON، وإذا كان صفحة نرجعه للرئيسية
        if (req.path.startsWith('/api')) {
            return res.status(403).json({ error: "غير مسموح لك بالوصول، صلاحيات أدمن فقط" });
        }
        res.status(403).send("<h1>خطأ 403: غير مسموح لك بدخول هذه الصفحة</h1>");
    }
}
// --- Routes ---
app.use(acmeChallengeMiddleware);
app.use(checkSetup);

// --- كشف الـ LAN IP ---
function getLocalIP() {
    const interfaces = _o.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }
    return '127.0.0.1';
}
app.get("/local-ip", (req, res) => {
    res.json({ ip: getLocalIP(), port: 29001 });
});

// --- مسار تحميل التطبيق (بدون تحقق) ---
app.get("/download", (req, res) => {
    res.sendFile(path.join(__dirname, "assets", "download.html"));
});

app.use(checkLicense);
app.use('/api', MouGuard.router());

// مسار التثبيت (بدون تحقق)
app.get("/install", async (req, res) => {
    try {
        const row = await db.get("SELECT COUNT(*) as count FROM users");
        if (row.count > 0) {
            return res.redirect("/login");
        }
    } catch (e) { /* ignore */ }
    res.sendFile(path.join(__dirname, "install.html"));
});

app.get("/", checkAuth, async (req, res) => {

    res.sendFile(path.join(__dirname, "index.html"));
});

// مسار تسجيل الدخول (مفتوح للجميع)
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});
// مسار تسجيل الخروج
app.get("/logout", (req, res) => {
    // مسح الكوكي عن طريق ضبط تاريخ انتهائها لوقت سابق
    res.clearCookie('auth_token');
    // إعادة التوجيه لصفحة تسجيل الدخول
    res.redirect("/login");
});

// --- مسار التثبيت الأولي (إنشاء حساب الأدمن) ---
app.post("/api/setup/install", async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // التأكد من عدم وجود أي مستخدمين
        const row = await db.get("SELECT COUNT(*) as count FROM users");
        if (row.count > 0) {
            return res.status(400).json({ error: "تم تثبيت النظام مسبقاً" });
        }

        if (!username || !password) {
            return res.status(400).json({ error: "يرجى إدخال اسم المستخدم وكلمة المرور" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
            "INSERT INTO users (username, password, role, status, email, hwid_list, created_at) VALUES (?, ?, 'admin', 1, ?, '[]', datetime('now'))",
            [username, hashedPassword, email || '']
        );

        console.log(`[OK] Admin account created via install page: ${username}`);
        res.json({ success: true, message: "تم إنشاء حساب الأدمن بنجاح" });
    } catch (e) {
        console.error('Install error:', e.message);
        res.status(500).json({ error: "حدث خطأ أثناء التثبيت" });
    }
});

// --- تعديل مسار تسجيل الدخول لإرسال الكوكي ---
app.post("/api/login", async (req, res) => {
    const { username, password, hwid } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';

    async function logLogin(userId, uname, success, reason) {
        try {
            await db.run(
                "INSERT INTO login_logs (user_id, username, method, ip_address, user_agent, success, failure_reason) VALUES (?, ?, 'password', ?, ?, ?, ?)",
                [userId, uname, ip, ua, success ? 1 : 0, reason || null]
            );
        } catch (e) { /* silent */ }
    }

    try {
        const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
        if (!user) {
            console.log('[Login] User not found:', username);
            await logLogin(null, username, false, 'User not found');
            return res.status(400).json({ error: "خطأ في البيانات..." });
        }

        if (user.status === 0) {
            await logLogin(user.id, username, false, 'Account disabled');
            return res.status(403).json({ error: "الحساب معطل حالياً" });
        }

        // 1. التحقق من الهوية (الأدمن والمستخدم العادي)
        const userAgent = req.headers['user-agent'] || "";

        // 2. فحص بصمة الجهاز للمستخدمين العاديين (إذا لم يكن أدمن)
        if (user.role !== 'admin') {
            let allowedDevices = JSON.parse(user.hwid_list || "[]");

            // تحديد الحد الأقصى للأجهزة (إذا كان NULL فلا يوجد حد)
            const maxDev = user.max_devices !== null && user.max_devices !== undefined ? user.max_devices : null;

            // إذا كان الجهاز الحالي غير مسجل في قائمة المستخدم
            if (!allowedDevices.includes(hwid)) {
                if (allowedDevices.length === 0 || maxDev === null || allowedDevices.length < maxDev) {
                    // تسجيل الجهاز الجديد
                    allowedDevices.push(hwid);
                    await db.run("UPDATE users SET hwid_list = ? WHERE id = ?", [JSON.stringify(allowedDevices), user.id]);
                    // تسجيل الجهاز في جدول user_devices
                    try { await db.run("INSERT OR IGNORE INTO user_devices (user_id, hwid, device_info, last_login) VALUES (?, ?, ?, datetime('now'))", [user.id, hwid, userAgent]); } catch (e) { }
                } else {
                    await logLogin(user.id, username, false, 'Device limit reached');
                    return res.status(403).json({
                        error: "لا يمكنك تسجيل الدخول علي هذا الجهاز !"
                    });
                }
            } else {
                // تحديث آخر نشاط للجهاز
                try { await db.run("INSERT OR IGNORE INTO user_devices (user_id, hwid, device_info) VALUES (?, ?, ?)", [user.id, hwid, userAgent]); } catch (e) { }
                try { await db.run("UPDATE user_devices SET last_login = datetime('now'), device_info = ? WHERE user_id = ? AND hwid = ?", [userAgent, user.id, hwid]); } catch (e) { }
            }
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            await logLogin(user.id, username, false, 'Wrong password');
            return res.status(400).json({ error: "خطأ في البيانات" });
        }

        const finalHwid = req.headers['x-device-hwid'] || hwid || null;
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role, hwid: finalHwid }, SECRET_KEY, { expiresIn: '7d' });

        res.cookie('auth_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });

        await logLogin(user.id, username, true, null);
        await db.run("UPDATE users SET last_activity = datetime('now') WHERE id = ?", [user.id]);

        res.json({
            success: true,
            user: { id: user.id, username: user.username, role: user.role }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "حدث خطأ!" });
    }
});

app.get("/api/me", authenticateToken, async (req, res) => {
    const user = await db.get("SELECT id, username, role, email, max_devices FROM users WHERE id = ?", [req.user.id]);
    res.json(user || { username: req.user.username });
});

// حماية صفحة الإدارة (HTML)
app.get("/admin-page", authenticateToken, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "assets", "admin.html"));
});
// دالة حماية إضافية للتأكد أن المستخدم هو "admin" (اختياري لو أردت رتب مختلفة)
// حالياً سنكتفي بـ authenticateToken التي قمنا بإنشائها سابقاً

// 1. جلب كل المستخدمين
app.get("/api/users", authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await db.all("SELECT id, username, role, status FROM users");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "خطأ في جلب البيانات" });
    }
});

// 2. إضافة مستخدم جديد
app.post("/api/users/add", authenticateToken, isAdmin, async (req, res) => {
    const { username, password, role, email } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run("INSERT INTO users (username, password, role, email, created_at) VALUES (?, ?, ?, ?, datetime('now'))", [username, hashedPassword, role || 'user', email || '']);
        res.status(200).json({ success: true, message: "تم إضافة المستخدم بنجاح" });
    } catch (err) {
        res.status(400).json({ error: "اسم المستخدم موجود مسبقاً" });
    }
});

// 3. تعديل مستخدم
app.post("/api/users/update", authenticateToken, isAdmin, async (req, res) => {
    const { id, username, password, role } = req.body;
    try {
        if (!username) {
            return res.status(400).json({ error: "اسم المستخدم مطلوب" });
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.run("UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?", [username, hashedPassword, role || 'user', id]);
        } else {
            await db.run("UPDATE users SET username = ?, role = ? WHERE id = ?", [username, role || 'user', id]);
        }
        res.json({ success: true, message: "تم تحديث المستخدم" });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: "اسم المستخدم موجود مسبقاً" });
        }
        res.status(500).json({ error: "فشل تحديث المستخدم" });
    }
});

// 4. حذف مستخدم
app.delete("/api/users/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: "لا يمكنك حذف حسابك الحالي" });
        }

        const userToDelete = await db.get("SELECT username FROM users WHERE id = ?", [id]);

        if (userToDelete) {
            // 2. إرسال أمر طرد عبر السوكت لهذا الاسم تحديداً
            io.emit("user_deleted", { username: userToDelete.username });
        }

        // io.emit("force_logout", { userId: id });

        await db.run("DELETE FROM users WHERE id = ?", [id]);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "خطأ في الحذف" });
    }
});

// 5. مسار تغيير حالة الحساب (تبديل بين إيقاف وتفعيل)
app.post("/api/users/toggle-status", authenticateToken, isAdmin, async (req, res) => {
    const { id, currentStatus } = req.body;
    try {
        const newStatus = currentStatus === 1 ? 0 : 1;
        await db.run("UPDATE users SET status = ? WHERE id = ?", [newStatus, id]);

        // إذا تم الإيقاف، اطرد المستخدم فوراً عبر السوكت
        if (newStatus === 0) {
            const user = await db.get("SELECT username FROM users WHERE id = ?", [id]);
            io.emit("user_deleted", { username: user.username }); // نستخدم نفس حدث الطرد
        }

        res.json({ success: true, newStatus });
    } catch (err) {
        res.status(500).json({ error: "فشل تغيير حالة الحساب" });
    }
});

// مسار للتحقق من حالة الحساب (نشط أم موقوف)
app.get("/api/check-status", authenticateToken, async (req, res) => {
    try {
        // جلب حالة المستخدم من قاعدة البيانات باستخدام معرفه الموجود في التوكن
        const user = await db.get("SELECT  id, username, role, status, hwid_list FROM users WHERE id = ?", [req.user.id]);

        const hwid = req.headers['x-device-hwid'];

        if (!user) {
            return res.status(401).json({ error: "المستخدم غير موجود" });
        }

        if (user.status === 0) {
            res.clearCookie('auth_token');
            return res.status(403).json({ active: false, error: "الحساب معطل" });

        }


        // 2. فحص بصمة الجهاز للمستخدمين العاديين (سواء متصفح أو Electron)
        if (user.role !== 'admin') {
            let allowedDevices = [];
            try {
                allowedDevices = JSON.parse(user.hwid_list || "[]");
            } catch (e) {
                allowedDevices = [];
            }

            if (!hwid) {
                console.log("no HWID");
                return res.status(403).json({ active: false, error: "خطأ كبير!!!" });
            }
            // إذا كان الجهاز الحالي غير مسجل في قائمة المستخدم
            if (!allowedDevices.includes(hwid)) {
                // إذا وصل للحد الأقصى (جهازين) والجهاز الحالي ليس منهم
                return res.status(403).json({ active: false, error: "الحساب مسجل علي جهاز اخر" });
            }
        }

        res.json({ active: true });
    } catch (err) {
        res.status(500).json({ error: "خطأ في السيرفر" });
    }
});

// مسار API ليعرف الأدمن من هم المتصلين بالضبط
app.get("/api/online-list", authenticateToken, isAdmin, (req, res) => {
    res.json(Object.values(onlineUsers));
});

app.get("/api/users/online", authenticateToken, isAdmin, (req, res) => {
    res.json(Object.values(onlineUsers));
});

// جلب المستخدمين مع pagination, بحث, فرز
app.get("/api/users/paginated", authenticateToken, isAdmin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page) || 20));
        const sort = req.query.sort || 'id';
        const sortDir = req.query.sort_dir === 'ASC' ? 'ASC' : 'DESC';
        const search = (req.query.search || '').trim();

        const allowedSorts = ['id', 'username', 'role', 'status', 'created_at', 'last_activity', 'max_devices'];
        const sortCol = allowedSorts.includes(sort) ? sort : 'id';

        let where = '';
        let params = [];
        if (search) {
            where = "WHERE username LIKE ? OR email LIKE ?";
            params = [`%${search}%`, `%${search}%`];
        }

        const countResult = await db.get(`SELECT COUNT(*) as total FROM users ${where}`, params);
        const total = countResult.total;
        const totalPages = Math.ceil(total / perPage) || 1;
        const offset = (page - 1) * perPage;

        const users = await db.all(
            `SELECT id, username, email, role, status, max_devices, last_activity, created_at FROM users ${where} ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`,
            [...params, perPage, offset]
        );

        const onlineUsernames = Object.values(onlineUsers).map(u => u.username);
        const onlineCount = Object.keys(onlineUsers).length;
        const disabledCount = await db.get("SELECT COUNT(*) as c FROM users WHERE status = 0");

        res.json({
            success: true,
            users: users,
            page: page,
            per_page: perPage,
            total_pages: totalPages,
            total: total,
            site_total: total,
            online_count: onlineCount,
            disabled_count: disabledCount.c
        });
    } catch (err) {
        console.error('Error fetching paginated users:', err);
        res.status(500).json({ success: false, error: 'خطأ في جلب البيانات' });
    }
});

// جلب سجلات الدخول لمستخدم معين
app.get("/api/users/:id/logs", authenticateToken, isAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const perPage = 20;
        const offset = (page - 1) * perPage;

        const countResult = await db.get("SELECT COUNT(*) as total FROM login_logs WHERE user_id = ?", [userId]);
        const total = countResult.total;
        const totalPages = Math.ceil(total / perPage) || 1;

        const logs = await db.all(
            "SELECT * FROM login_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [userId, perPage, offset]
        );

        res.json({
            success: true,
            logs: logs,
            page: page,
            per_page: perPage,
            total_pages: totalPages,
            total: total
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'خطأ في جلب السجلات' });
    }
});

// تحديث حد الأجهزة لمستخدم
app.post("/api/users/:id/max-devices", authenticateToken, isAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { max_devices } = req.body;
        const val = (max_devices === '' || max_devices === null || max_devices === undefined) ? null : parseInt(max_devices);
        await db.run("UPDATE users SET max_devices = ? WHERE id = ?", [val, userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'خطأ في التحديث' });
    }
});

// مسار لمسح بصمات الجهاز (Reset HWID)
app.post("/api/admin/reset-hwid", checkAuth, isAdmin, async (req, res) => {
    // التأكد أن الذي ينفذ الأمر هو الأدمن فقط
    // if (req.user.role !== 'admin') {
    //     return res.status(403).json({ error: "غير مصرح لك بالقيام بهذا الإجراء" });
    // }

    const { userId } = req.body;

    try {
        // تحديث مصفوفة الأجهزة لتعود فارغة []
        await db.run("UPDATE users SET hwid_list = '[]' WHERE id = ?", [userId]);

        const user = await db.get("SELECT username FROM users WHERE id = ?", [userId]);
        io.emit("user_reset_devices", { username: user.username }); // نستخدم نفس حدث الطرد

        res.json({ success: true, message: "تمت إعادة ضبط بصمة الجهاز بنجاح" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "خطأ في السيرفر" });
    }
});

// --- e& money settings API ---
app.get("/api/etisalat/settings", authenticateToken, isAdmin, async (req, res) => {
    try {
        const rows = await db.all("SELECT key, value FROM settings WHERE key IN ('etisalat_enabled', 'tayercash_url', 'tayercash_token', 'etisalat_auto_forward', 'forward_master_enabled')");
        const settings = { enabled: false, tayercash_url: '', tayercash_token: '', auto_forward: true, forward_master_enabled: true };
        rows.forEach(r => {
            if (r.key === 'etisalat_enabled') settings.enabled = r.value === '1';
            else if (r.key === 'tayercash_url') settings.tayercash_url = r.value || '';
            else if (r.key === 'tayercash_token') settings.tayercash_token = r.value || '';
            else if (r.key === 'etisalat_auto_forward') settings.auto_forward = r.value === '1';
            else if (r.key === 'forward_master_enabled') settings.forward_master_enabled = r.value === '1';
        });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/etisalat/settings", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { enabled, tayercash_url, tayercash_token, auto_forward, forward_master_enabled } = req.body;
        await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['etisalat_enabled', enabled ? '1' : '0']);
        if (tayercash_url !== undefined) await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['tayercash_url', tayercash_url || '']);
        if (tayercash_token !== undefined) await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['tayercash_token', tayercash_token || '']);
        if (auto_forward !== undefined) await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['etisalat_auto_forward', auto_forward ? '1' : '0']);
        if (forward_master_enabled !== undefined) await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['forward_master_enabled', forward_master_enabled ? '1' : '0']);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/etisalat/payments", authenticateToken, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const offset = (page - 1) * limit;
        const payments = await db.all("SELECT * FROM etisalat_payments ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]);
        const total = await db.get("SELECT COUNT(*) as count FROM etisalat_payments");
        res.json({ payments, total: total.count, page, limit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/etisalat/payments/forward/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const payment = await db.get("SELECT * FROM etisalat_payments WHERE id = ?", [req.params.id]);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });

        const body = JSON.stringify({
            type: 'incoming',
            provider: 'etisalat',
            amount: payment.amount,
            sender_number: payment.sender_number,
            sender_name: payment.sender_name,
            receiver_number: payment.receiver_number,
            balance_after: payment.balance_after,
            received_at: payment.received_at,
            message_text: payment.message_text
        });

        const result = await forwardToServers(body);
        res.json({ success: result.success, message: result.success ? 'تم إعادة الإرسال' : 'فشل', details: result.results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/etisalat/payments/test-forward/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const payment = await db.get("SELECT * FROM etisalat_payments WHERE id = ?", [req.params.id]);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });

        const body = JSON.stringify({
            type: 'incoming',
            provider: 'etisalat',
            amount: payment.amount,
            sender_number: payment.sender_number,
            sender_name: payment.sender_name,
            receiver_number: payment.receiver_number,
            balance_after: payment.balance_after,
            received_at: payment.received_at,
            message_text: payment.message_text,
            test_mode: true
        });

        const result = await forwardToServers(body);
        res.json({ success: result.success, message: 'تم إرسال الاختبار', details: result.results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/etisalat/outgoing", authenticateToken, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const offset = (page - 1) * limit;
        const transfers = await db.all("SELECT * FROM etisalat_outgoing_transfers ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]);
        const total = await db.get("SELECT COUNT(*) as count FROM etisalat_outgoing_transfers");
        res.json({ transfers, total: total.count, page, limit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/etisalat/outgoing/forward/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const transfer = await db.get("SELECT * FROM etisalat_outgoing_transfers WHERE id = ?", [req.params.id]);
        if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

        const body = JSON.stringify({
            type: 'outgoing',
            provider: 'etisalat',
            amount: transfer.amount,
            sender_number: transfer.sender_number,
            receiver_number: transfer.receiver_number,
            transfer_fee: transfer.transfer_fee,
            balance_after: transfer.balance_after,
            received_at: transfer.received_at,
            message_text: transfer.message_text
        });

        const result = await forwardToServers(body);
        res.json({ success: result.success, message: result.success ? 'تم إعادة إرسال التحويل' : 'فشل', details: result.results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/etisalat/outgoing/test-forward/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const transfer = await db.get("SELECT * FROM etisalat_outgoing_transfers WHERE id = ?", [req.params.id]);
        if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

        const body = JSON.stringify({
            type: 'outgoing',
            provider: 'etisalat',
            amount: transfer.amount,
            sender_number: transfer.sender_number,
            receiver_number: transfer.receiver_number,
            transfer_fee: transfer.transfer_fee,
            balance_after: transfer.balance_after,
            received_at: transfer.received_at,
            message_text: transfer.message_text,
            test_mode: true
        });

        const result = await forwardToServers(body);
        res.json({ success: result.success, message: 'تم اختبار الإرسال', details: result.results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/etisalat/all-payments", authenticateToken, isAdmin, async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const offset = (page - 1) * limit;

        // جلب المدفوعات المستلمة مع type='incoming'
        const payments = await db.all(
            "SELECT id, 'incoming' as type, amount, sender_number, sender_name, receiver_number, NULL as transfer_fee, balance_after, message_text, received_at, forwarded, confirmed, created_at FROM etisalat_payments ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [limit, offset]
        );

        const paymentsTotal = await db.get("SELECT COUNT(*) as count FROM etisalat_payments");

        // جلب التحويلات الصادرة مع type='outgoing'
        const transfers = await db.all(
            "SELECT id, 'outgoing' as type, amount, sender_number, receiver_number, transfer_fee, balance_after, message_text, received_at, forwarded, confirmed, created_at FROM etisalat_outgoing_transfers ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [limit, offset]
        );

        const transfersTotal = await db.get("SELECT COUNT(*) as count FROM etisalat_outgoing_transfers");

        // دمج وترتيب
        const combined = [...payments, ...transfers].sort((a, b) => {
            const da = a.created_at || a.received_at || '';
            const db_ = b.created_at || b.received_at || '';
            return db_.localeCompare(da);
        });

        // تطبيق Pagination على النتائج المدمجة
        const paginated = combined.slice(0, limit);

        const total = (paymentsTotal ? paymentsTotal.count : 0) + (transfersTotal ? transfersTotal.count : 0);

        res.json({ payments: paginated, total, page, limit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Vodafone Cash settings API ---
app.get("/api/vodafone/settings", authenticateToken, isAdmin, async (req, res) => {
    try {
        const rows = await db.all("SELECT key, value FROM settings WHERE key IN ('vodafone_enabled', 'vodafone_auto_forward')");
        const settings = { enabled: false, auto_forward: true };
        rows.forEach(r => {
            if (r.key === 'vodafone_enabled') settings.enabled = r.value === '1';
            else if (r.key === 'vodafone_auto_forward') settings.auto_forward = r.value === '1';
        });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/vodafone/settings", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { enabled, auto_forward } = req.body;
        await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['vodafone_enabled', enabled ? '1' : '0']);
        if (auto_forward !== undefined) await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['vodafone_auto_forward', auto_forward ? '1' : '0']);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== Transfer Providers CRUD =====
app.get("/api/transfer-providers", authenticateToken, isAdmin, async (req, res) => {
    try {
        const providers = await db.all("SELECT * FROM transfer_providers ORDER BY id ASC");
        res.json(providers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/transfer-providers", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, provider_key } = req.body;
        if (!name || !provider_key) return res.status(400).json({ error: 'name and provider_key are required' });
        const cleanKey = provider_key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        const existing = await db.get("SELECT id FROM transfer_providers WHERE provider_key = ?", [cleanKey]);
        if (existing) return res.status(409).json({ error: 'Provider key already exists' });
        const result = await db.run("INSERT INTO transfer_providers (name, provider_key) VALUES (?, ?)", [name.trim(), cleanKey]);
        res.json({ success: true, id: result.lastID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/transfer-providers/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, enabled, auto_forward } = req.body;
        const provider = await db.get("SELECT * FROM transfer_providers WHERE id = ?", [id]);
        if (!provider) return res.status(404).json({ error: 'Provider not found' });
        if (name !== undefined) await db.run("UPDATE transfer_providers SET name = ? WHERE id = ?", [name.trim(), id]);
        if (enabled !== undefined) await db.run("UPDATE transfer_providers SET enabled = ? WHERE id = ?", [enabled ? 1 : 0, id]);
        if (auto_forward !== undefined) await db.run("UPDATE transfer_providers SET auto_forward = ? WHERE id = ?", [auto_forward ? 1 : 0, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/transfer-providers/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const provider = await db.get("SELECT * FROM transfer_providers WHERE id = ?", [id]);
        if (!provider) return res.status(404).json({ error: 'Provider not found' });
        await db.run("DELETE FROM transfer_providers WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== Forward Servers CRUD =====

app.get("/api/forward-servers", authenticateToken, isAdmin, async (req, res) => {
    try {
        const servers = await db.all("SELECT * FROM forward_servers ORDER BY id ASC");
        res.json(servers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/forward-servers", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, url, token, encryption_key } = req.body;
        if (!name || !url) return res.status(400).json({ error: 'name and url are required' });
        const result = await db.run("INSERT INTO forward_servers (name, url, token, encryption_key) VALUES (?, ?, ?, ?)", [name.trim(), url.trim(), (token || '').trim(), (encryption_key || '').trim()]);
        res.json({ success: true, id: result.lastID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/forward-servers/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url, token, encryption_key, enabled } = req.body;
        const server = await db.get("SELECT * FROM forward_servers WHERE id = ?", [id]);
        if (!server) return res.status(404).json({ error: 'Server not found' });
        if (name !== undefined) await db.run("UPDATE forward_servers SET name = ? WHERE id = ?", [name.trim(), id]);
        if (url !== undefined) await db.run("UPDATE forward_servers SET url = ? WHERE id = ?", [url.trim(), id]);
        if (token !== undefined) await db.run("UPDATE forward_servers SET token = ? WHERE id = ?", [token.trim(), id]);
        if (encryption_key !== undefined) await db.run("UPDATE forward_servers SET encryption_key = ? WHERE id = ?", [encryption_key.trim(), id]);
        if (enabled !== undefined) await db.run("UPDATE forward_servers SET enabled = ? WHERE id = ?", [enabled ? 1 : 0, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/forward-servers/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const server = await db.get("SELECT * FROM forward_servers WHERE id = ?", [id]);
        if (!server) return res.status(404).json({ error: 'Server not found' });
        await db.run("DELETE FROM forward_servers WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== No-IP DDNS Settings =====

app.get("/api/public-ip", authenticateToken, async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    const services = [
        { url: 'https://api.ipify.org?format=json', parse: d => JSON.parse(d).ip },
        { url: 'https://httpbin.org/ip', parse: d => JSON.parse(d).origin },
        { url: 'https://ifconfig.me/ip', parse: d => d.trim() }
    ];

    function tryService(index) {
        if (index >= services.length) {
            return res.status(500).json({ error: 'Failed to detect public IP from all services' });
        }
        const svc = services[index];
        const mod = svc.url.startsWith('https') ? https : require('http');
        mod.get(svc.url, { timeout: 5000 }, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                const redirectMod = require('http');
                redirectMod.get(response.headers.location, { timeout: 5000 }, (r2) => {
                    let data = '';
                    r2.on('data', chunk => data += chunk);
                    r2.on('end', () => {
                        try { res.json({ ip: svc.parse(data) }); } catch (e) { tryService(index + 1); }
                    });
                }).on('error', () => tryService(index + 1));
                return;
            }
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try { res.json({ ip: svc.parse(data) }); } catch (e) { tryService(index + 1); }
            });
        }).on('error', () => tryService(index + 1));
    }
    tryService(0);
});

app.get("/api/noip/settings", authenticateToken, isAdmin, async (req, res) => {
    try {
        const rows = await db.all("SELECT key, value FROM settings WHERE key IN ('noip_hostname', 'noip_username', 'noip_enabled', 'noip_password')");
        const settings = { hostname: '', username: '', enabled: false, hasPassword: false };
        rows.forEach(r => {
            if (r.key === 'noip_hostname') settings.hostname = r.value || '';
            else if (r.key === 'noip_username') settings.username = r.value || '';
            else if (r.key === 'noip_enabled') settings.enabled = r.value === '1';
            else if (r.key === 'noip_password') settings.hasPassword = !!r.value;
        });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Auto-check No-IP on startup: compare DNS IP vs public IP, update if different
async function noip_autoUpdateOnStartup() {
    try {
        if (!db) { console.log('[No-IP AutoUpdate] Skipped — DB not ready'); return; }
        const rows = await db.all("SELECT key, value FROM settings WHERE key IN ('noip_hostname', 'noip_username', 'noip_password', 'noip_enabled')");
        const settings = {};
        rows.forEach(r => { settings[r.key] = r.value || ''; });

        if (settings.noip_enabled !== '1') {
            console.log('[No-IP AutoUpdate] Skipped — No-IP is disabled');
            return;
        }

        if (!settings.noip_hostname || !settings.noip_username || !settings.noip_password) {
            console.log('[No-IP AutoUpdate] Skipped — credentials not configured');
            return;
        }

        console.log('[No-IP AutoUpdate] Checking...');

        // 1) Resolve current DNS IP
        const dns = require('dns');
        const resolver = new dns.Resolver();
        resolver.setServers(['8.8.8.8', '1.1.1.1']);
        const dnsIp = await new Promise((resolve) => {
            resolver.resolve4(settings.noip_hostname, (err, addresses) => {
                resolve(err ? null : (addresses && addresses[0]));
            });
        });

        // 2) Get current public IP
        const publicIp = await new Promise((resolve) => {
            https.get('https://api.ipify.org?format=json', { timeout: 8000 }, (r) => {
                let data = '';
                r.on('data', c => data += c);
                r.on('end', () => {
                    try { resolve(JSON.parse(data).ip); } catch (e) { resolve(null); }
                });
            }).on('error', () => resolve(null));
        });

        if (!publicIp) {
            console.log('[No-IP AutoUpdate] Failed to get public IP');
            return;
        }

        console.log(`[No-IP AutoUpdate] DNS=${dnsIp || 'N/A'}  Public=${publicIp}`);

        // 3) If same, skip
        if (dnsIp && dnsIp === publicIp) {
            console.log('[No-IP AutoUpdate] IP unchanged — skipping update');
            return;
        }

        // 4) Update No-IP
        const auth = Buffer.from(settings.noip_username + ':' + settings.noip_password).toString('base64');
        const updateUrl = `https://dynupdate.no-ip.com/nic/update?hostname=${encodeURIComponent(settings.noip_hostname)}&myip=${publicIp}`;

        const body = await new Promise((resolve) => {
            https.get(updateUrl, {
                headers: { 'Authorization': 'Basic ' + auth, 'User-Agent': 'SMS-Gateway/1.0' },
                timeout: 10000
            }, (r) => {
                let b = '';
                r.on('data', c => b += c);
                r.on('end', () => resolve({ status: r.statusCode, body: b.trim() }));
            }).on('error', (e) => resolve({ status: 0, body: e.message }));
        });

        if (body.status === 200 || body.status === 201 || body.status === 204) {
            console.log(`[No-IP AutoUpdate] Updated successfully -> ${publicIp}`);
        } else {
            console.log(`[No-IP AutoUpdate] No-IP responded (${body.status}): ${body.body}`);
        }
    } catch (err) {
        console.error('[No-IP AutoUpdate] Error:', err.message);
    }
}

app.post("/api/noip/settings", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { hostname, username, password, enabled } = req.body;
        if (hostname !== undefined) await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['noip_hostname', hostname || '']);
        if (username !== undefined) await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['noip_username', username || '']);
        if (password !== undefined) await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['noip_password', password || '']);
        if (enabled !== undefined) await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['noip_enabled', enabled ? '1' : '0']);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/noip/update", authenticateToken, isAdmin, async (req, res) => {
    try {
        const rows = await db.all("SELECT key, value FROM settings WHERE key IN ('noip_hostname', 'noip_username', 'noip_password')");
        const settings = {};
        rows.forEach(r => { settings[r.key] = r.value || ''; });

        if (!settings.noip_hostname || !settings.noip_username || !settings.noip_password) {
            return res.status(400).json({ error: 'يرجى إدخال جميع بيانات No-IP (Hostname, Username, Password)' });
        }

        https.get('https://api.ipify.org?format=json', (ipRes) => {
            let ipData = '';
            ipRes.on('data', chunk => ipData += chunk);
            ipRes.on('end', () => {
                let publicIp;
                try { publicIp = JSON.parse(ipData).ip; } catch (e) { return res.status(500).json({ error: 'Failed to get public IP' }); }

                const auth = Buffer.from(settings.noip_username + ':' + settings.noip_password).toString('base64');
                const updateUrl = `https://dynupdate.no-ip.com/nic/update?hostname=${encodeURIComponent(settings.noip_hostname)}&myip=${publicIp}`;

                const updateReq = https.get(updateUrl, {
                    headers: { 'Authorization': 'Basic ' + auth, 'User-Agent': 'SMS-Gateway/1.0' }
                }, (updateRes) => {
                    let body = '';
                    updateRes.on('data', chunk => body += chunk);
                    updateRes.on('end', () => {
                        if (updateRes.statusCode === 200 || updateRes.statusCode === 201) {
                            res.json({ success: true, ip: publicIp, message: body.trim() });
                        } else if (updateRes.statusCode === 204) {
                            res.json({ success: true, ip: publicIp, message: 'NOCHANGE - IP is already up to date' });
                        } else {
                            res.json({ success: false, error: 'No-IP returned: ' + body.trim() });
                        }
                    });
                });
                updateReq.on('error', (err) => {
                    res.status(500).json({ error: 'Failed to connect to No-IP: ' + err.message });
                });
            });
        }).on('error', (err) => {
            res.status(500).json({ error: 'Failed to get public IP: ' + err.message });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/notification/settings", authenticateToken, isAdmin, async (req, res) => {
    try {
        const row = await db.get("SELECT value FROM settings WHERE key = 'broadcast_notif_enabled'");
        res.json({ broadcastEnabled: row ? row.value === '1' : true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/notification/settings", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { broadcastEnabled } = req.body;
        await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['broadcast_notif_enabled', broadcastEnabled ? '1' : '0']);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/license-info", authenticateToken, isAdmin, async (req, res) => {
    try {
        const key = req.query.key || _currentKey;
        if (!key) return res.json({ success: false, error: 'No license key configured' });
        const https = require('https');
        const http = require('http');
        const url = new URL(_SERVER_URL + '/license-info.php');
        const transport = url.protocol === 'https:' ? https : http;
        const postData = JSON.stringify({ license_key: key });
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
            timeout: 10000,
        };
        const proxyReq = transport.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => { data += chunk; });
            proxyRes.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    res.json(parsed);
                } catch (e) {
                    res.status(500).json({ success: false, error: 'Invalid response from license server' });
                }
            });
        });
        proxyReq.on('error', (e) => { res.status(500).json({ success: false, error: 'Connection error: ' + e.message }); });
        proxyReq.on('timeout', () => { proxyReq.destroy(); res.status(500).json({ success: false, error: 'Request timed out' }); });
        proxyReq.write(postData);
        proxyReq.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/license-limits", authenticateToken, async (req, res) => {
    try {
        const now = Date.now();
        if (!_cachedPlanLimits || (now - _planLimitsCacheTime) > PLAN_LIMITS_CACHE_TTL) {
            if (!_currentKey) {
                _cachedPlanLimits = { max_projects: 0, max_licenses: 0, plan_name: 'Unknown' };
                _planLimitsCacheTime = now;
            } else {
                try {
                    const https2 = require('https');
                    const http2 = require('http');
                    const url = new URL(_SERVER_URL + '/license-info.php');
                    const transport = url.protocol === 'https:' ? https2 : http2;
                    const postData = JSON.stringify({ license_key: _currentKey });
                    const result = await new Promise((resolve, reject) => {
                        const r = transport.request({
                            hostname: url.hostname,
                            port: url.port || (url.protocol === 'https:' ? 443 : 80),
                            path: url.pathname,
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
                            timeout: 8000,
                        }, (res2) => {
                            let d = '';
                            res2.on('data', (c) => { d += c; });
                            res2.on('end', () => { try { resolve(JSON.parse(d)); } catch (_) { resolve(null); } });
                        });
                        r.on('error', () => resolve(null));
                        r.on('timeout', () => { r.destroy(); resolve(null); });
                        r.write(postData);
                        r.end();
                    });
                    if (result && result.success && result.plan) {
                        _cachedPlanLimits = {
                            max_projects: result.plan.max_projects || 0,
                            max_licenses: result.plan.max_licenses || 0,
                            plan_name: result.plan.name || 'Unknown',
                        };
                        _planLimitsCacheTime = now;
                    }
                } catch (_) {}
            }
        }

        const connectedClients = Object.keys(phoneSockets).length;
        const connectedGateways = 1;
        const onlineCount = Object.keys(onlineUsers).length;

        res.json({
            success: true,
            limits: _cachedPlanLimits || { max_projects: 0, max_licenses: 0, plan_name: 'Unknown' },
            usage: {
                clients: connectedClients,
                gateways: connectedGateways,
                online_users: onlineCount,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/noip/diagnose", authenticateToken, isAdmin, async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    try {
        const rows = await db.all("SELECT key, value FROM settings WHERE key IN ('noip_hostname', 'noip_username')");
        const settings = {};
        rows.forEach(r => { settings[r.key] = r.value || ''; });

        if (!settings.noip_hostname) {
            return res.json({ error: 'Hostname not configured' });
        }

        const dns = require('dns');
        const resolver = new dns.Resolver();
        resolver.setServers(['8.8.8.8', '1.1.1.1']);
        resolver.resolve4(settings.noip_hostname, (err, addresses) => {
            const dnsResult = err ? { error: err.code } : { ip: addresses[0] };

            const services = [
                { url: 'https://api.ipify.org?format=json', parse: d => JSON.parse(d).ip },
                { url: 'https://httpbin.org/ip', parse: d => JSON.parse(d).origin }
            ];

            function tryService(idx) {
                if (idx >= services.length) {
                    return res.json({ hostname: settings.noip_hostname, dns: dnsResult, publicIp: { error: 'Failed' } });
                }
                const svc = services[idx];
                https.get(svc.url, { timeout: 5000 }, (r) => {
                    let data = '';
                    r.on('data', c => data += c);
                    r.on('end', () => {
                        try {
                            res.json({ hostname: settings.noip_hostname, dns: dnsResult, publicIp: svc.parse(data) });
                        } catch (e) { tryService(idx + 1); }
                    });
                }).on('error', () => tryService(idx + 1));
            }
            tryService(0);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== Let's Encrypt SSL Certificate =====
const acme = require('acme-client');

function killPort(port) {
    return new Promise((resolve) => {
        exec(`netstat -ano | findstr :${port} | findstr LISTENING`, (err, stdout) => {
            if (err || !stdout) return resolve();
            const lines = stdout.trim().split('\n');
            const pids = new Set();
            lines.forEach(line => {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0') pids.add(pid);
            });
            if (pids.size === 0) return resolve();
            let done = 0;
            pids.forEach(pid => {
                exec(`taskkill /f /pid ${pid}`, () => {
                    done++;
                    if (done >= pids.size) resolve();
                });
            });
        });
    });
}

let acmeAccountKey = null;
let acmeAccountUrl = null;
let currentChallenge = null;
let challengeServer = null;

function loadAccountKey() {
    const keyPath = path.join(__dirname, 'certs', 'account.key');
    const urlPath = path.join(__dirname, 'certs', 'account.url');
    if (fs.existsSync(keyPath)) {
        acmeAccountKey = fs.readFileSync(keyPath);
    }
    if (fs.existsSync(urlPath)) {
        acmeAccountUrl = fs.readFileSync(urlPath, 'utf8').trim();
    }
}

async function saveAccountKey(key, url) {
    const keyPath = path.join(__dirname, 'certs', 'account.key');
    const urlPath = path.join(__dirname, 'certs', 'account.url');
    fs.writeFileSync(keyPath, key);
    if (url) fs.writeFileSync(urlPath, url);
    acmeAccountKey = key;
    acmeAccountUrl = url || null;
}

loadAccountKey();

function getSslStatus() {
    const certPath = path.join(__dirname, 'certs', 'server.crt');
    const keyPath = path.join(__dirname, 'certs', 'server.key');
    const letsencryptCertPath = path.join(__dirname, 'certs', 'letsencrypt_cert.pem');
    const letsencryptKeyPath = path.join(__dirname, 'certs', 'letsencrypt_key.pem');

    const hasLetsEncrypt = fs.existsSync(letsencryptCertPath) && fs.existsSync(letsencryptKeyPath);
    let expiresAt = null;
    let issuer = null;
    let domains = [];

    if (hasLetsEncrypt) {
        try {
            const { X509Certificate } = require('crypto');
            const cert = new X509Certificate(fs.readFileSync(letsencryptCertPath));
            expiresAt = cert.validTo;
            issuer = cert.issuer;
            const subjectAlt = cert.subjectAltName || '';
            domains = subjectAlt.split(',').map(s => s.trim().replace('DNS:', '')).filter(Boolean);
        } catch (e) { }
    }

    return {
        hasLetsEncrypt,
        hasAccountKey: !!(acmeAccountKey && acmeAccountUrl),
        port80Ready,
        acmePort,
        expiresAt,
        issuer,
        domains,
        certPath: letsencryptCertPath,
        keyPath: letsencryptKeyPath
    };
}

app.get("/api/ssl/status", authenticateToken, isAdmin, async (req, res) => {
    try {
        res.json(getSslStatus());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/ssl/create-account", authenticateToken, isAdmin, async (req, res) => {
    try {
        const accountKey = await acme.crypto.createPrivateKey();

        const client = new acme.Client({
            directoryUrl: acme.directory.letsencrypt.production,
            accountKey
        });

        await client.createAccount({
            termsOfServiceAgreed: true,
            contact: ['mailto:noreply@noemail.com']
        });

        const accountUrl = client.getAccountUrl();
        await saveAccountKey(accountKey, accountUrl);

        res.json({ success: true, message: 'Account created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== SSL Background Task =====
let sslTask = { status: 'idle', message: '', result: null };

async function runSslTask(domain) {
    if (!port80Ready) {
        const msg = 'ACME server is not running. Please wait for the server to start and try again.';
        console.error('[SSL]', msg);
        sslTask = { status: 'error', message: msg, result: null };
        return;
    }

    if (acmePort !== 80) {
        console.log('[SSL] Using port ' + acmePort + ' for ACME. Router must forward external:80 → device:' + acmePort);
    }

    _sslPauseGuard = true;
    console.log('[SSL] Heartbeat paused');
    sslTask = { status: 'running', message: 'Starting...', result: null };
    try {
        console.log('[SSL] Creating client...');
        sslTask.message = 'Creating ACME client...';
        const client = new acme.Client({
            directoryUrl: acme.directory.letsencrypt.production,
            accountKey: acmeAccountKey,
            accountUrl: acmeAccountUrl
        });

        console.log('[SSL] Creating CSR for:', domain);
        sslTask.message = 'Creating CSR...';
        const [key, csr] = await acme.crypto.createCsr({
            commonName: domain,
            altNames: [domain]
        });

        console.log('[SSL] Starting auto...');
        sslTask.message = 'Requesting certificate from Let\'s Encrypt...';
        const cert = await client.auto({
            csr,
            termsOfServiceAgreed: true,
            skipChallengeVerification: true,
            challengeCreateFn: async (authz, challenge, keyAuthorization) => {
                console.log('[SSL] Challenge received for:', authz.identifier?.value, 'serving via middleware...');
                sslTask.message = 'Challenge received, waiting for Let\'s Encrypt to verify...';
                _acmeChallenge = { token: challenge.token, keyAuthorization };
                console.log('[SSL] ACME challenge token set, serving on port 80');
            },
            challengeRemoveFn: async (authz, challenge) => {
                console.log('[SSL] Challenge verified, clearing token...');
                sslTask.message = 'Challenge verified! Finalizing certificate...';
                _acmeChallenge = null;
            }
        });

        console.log('[SSL] Certificate obtained, saving...');
        sslTask.message = 'Saving certificate...';
        const letsencryptCertPath = path.join(__dirname, 'certs', 'letsencrypt_cert.pem');
        const letsencryptKeyPath = path.join(__dirname, 'certs', 'letsencrypt_key.pem');
        fs.writeFileSync(letsencryptCertPath, cert);
        fs.writeFileSync(letsencryptKeyPath, key);

        console.log('[SSL] Certificate saved successfully');
        sslTask = { status: 'done', message: 'Certificate obtained successfully!', result: getSslStatus() };
    } catch (err) {
        console.error('[SSL] Error:', err.message);
        console.error('[SSL] Stack:', err.stack);
        if (err.response) console.error('[SSL] Response:', JSON.stringify(err.response.data || err.response.status));
        sslTask = { status: 'error', message: err.message, result: null };
    } finally {
        _sslPauseGuard = false;
        _acmeChallenge = null;
        console.log('[SSL] MouGuard heartbeat resumed');
    }
}

app.post("/api/ssl/request", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { domain } = req.body;
        if (!domain) return res.status(400).json({ error: 'Domain is required' });
        if (!acmeAccountKey) return res.status(400).json({ error: 'Create an ACME account first' });
        if (sslTask.status === 'running') return res.status(409).json({ error: 'A certificate request is already in progress' });

        runSslTask(domain);
        res.json({ success: true, message: 'Certificate request started' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/ssl/task-status", authenticateToken, isAdmin, async (req, res) => {
    try {
        res.json(sslTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/ssl/renew", authenticateToken, isAdmin, async (req, res) => {
    try {
        const status = getSslStatus();
        if (!status.hasLetsEncrypt || !status.domains.length) {
            return res.status(400).json({ error: 'No certificate to renew' });
        }
        if (sslTask.status === 'running') {
            return res.status(409).json({ error: 'A certificate task is already in progress' });
        }

        const domain = status.domains[0];
        if (!acmeAccountKey) {
            return res.status(400).json({ error: 'No ACME account found' });
        }

        sslTask = { status: 'running', message: 'Renewing certificate...', result: null };
        _sslPauseGuard = true;
        console.log('[SSL-Renew] MouGuard heartbeat paused');

        runRenewTask(domain, status, acmeAccountKey, acmeAccountUrl).catch(err => {
            console.error('[SSL-Renew] Background task error:', err.message);
        });

        res.json({ success: true, message: 'Renewal started, check status at /api/ssl/task-status' });
    } catch (err) {
        _sslPauseGuard = false;
        res.status(500).json({ error: err.message });
    }
});

async function runRenewTask(domain, status, accountKey, accountUrl) {
    try {
        const client = new acme.Client({
            directoryUrl: acme.directory.letsencrypt.production,
            accountKey: accountKey,
            accountUrl: accountUrl
        });

        const [key, csr] = await acme.crypto.createCsr({
            commonName: domain,
            altNames: status.domains
        });

        const cert = await client.auto({
            csr,
            termsOfServiceAgreed: true,
            skipChallengeVerification: true,
            challengeCreateFn: async (authz, challenge, keyAuthorization) => {
                console.log('[SSL-Renew] Challenge received, serving via middleware...');
                sslTask.message = 'Challenge received, waiting for Let\'s Encrypt to verify...';
                _acmeChallenge = { token: challenge.token, keyAuthorization };
                console.log('[SSL-Renew] ACME challenge token set, serving on port 80');
            },
            challengeRemoveFn: async (authz, challenge) => {
                console.log('[SSL-Renew] Challenge verified, clearing token...');
                sslTask.message = 'Challenge verified! Finalizing certificate...';
                _acmeChallenge = null;
            }
        });

        fs.writeFileSync(status.certPath, cert);
        fs.writeFileSync(status.keyPath, key);

        console.log('[SSL-Renew] Certificate renewed successfully');
        sslTask = { status: 'done', message: 'Certificate renewed successfully!', result: getSslStatus() };
    } catch (err) {
        console.error('[SSL-Renew] Error:', err.message);
        sslTask = { status: 'error', message: err.message, result: null };
    } finally {
        _sslPauseGuard = false;
        _acmeChallenge = null;
        console.log('[SSL-Renew] MouGuard heartbeat resumed');
    }
}

// --- Auto-Renew SSL Certificate ---
async function autoRenewSsl() {
    if (sslTask.status === 'running') return;
    const status = getSslStatus();
    if (!status.hasLetsEncrypt || !status.domains.length || !acmeAccountKey) return;
    if (!status.expiresAt) return;

    const expires = new Date(status.expiresAt);
    const now = new Date();
    const daysLeft = Math.floor((expires - now) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 1) {
        console.log(`[SSL-AutoRenew] Certificate expires in ${daysLeft} day(s), renewing...`);
        sslTask = { status: 'running', message: 'Auto-renewing certificate...', result: null };
        _sslPauseGuard = true;
        try {
            await runRenewTask(status.domains[0], status, acmeAccountKey, acmeAccountUrl);
            console.log('[SSL-AutoRenew] Auto-renewal completed');
        } catch (e) {
            console.error('[SSL-AutoRenew] Auto-renewal failed:', e.message);
        }
    } else {
        console.log(`[SSL-AutoRenew] Certificate valid for ${daysLeft} day(s), no renewal needed`);
    }
}

// Check every 12 hours
setInterval(autoRenewSsl, 12 * 60 * 60 * 1000);

app.get("/api/vodafone/payments", authenticateToken, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const offset = (page - 1) * limit;
        const payments = await db.all("SELECT * FROM vodafone_payments ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]);
        const total = await db.get("SELECT COUNT(*) as count FROM vodafone_payments");
        res.json({ payments, total: total.count, page, limit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/vodafone/payments/forward/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const payment = await db.get("SELECT * FROM vodafone_payments WHERE id = ?", [req.params.id]);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });

        const body = JSON.stringify({
            type: 'incoming',
            provider: 'vodafone',
            amount: payment.amount,
            sender_number: payment.sender_number,
            sender_name: payment.sender_name,
            receiver_number: payment.receiver_number,
            balance_after: payment.balance_after,
            received_at: payment.received_at,
            message_text: payment.message_text
        });

        const result = await forwardToServers(body);
        res.json({ success: result.success, message: result.success ? 'تم إعادة الإرسال' : 'فشل', details: result.results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/vodafone/payments/test-forward/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const payment = await db.get("SELECT * FROM vodafone_payments WHERE id = ?", [req.params.id]);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });

        const body = JSON.stringify({
            type: 'incoming',
            provider: 'vodafone',
            amount: payment.amount,
            sender_number: payment.sender_number,
            sender_name: payment.sender_name,
            receiver_number: payment.receiver_number,
            balance_after: payment.balance_after,
            received_at: payment.received_at,
            message_text: payment.message_text,
            test_mode: true
        });

        const result = await forwardToServers(body);
        res.json({ success: result.success, message: 'تم إرسال الاختبار', details: result.results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/vodafone/outgoing", authenticateToken, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const offset = (page - 1) * limit;
        const transfers = await db.all("SELECT * FROM vodafone_outgoing_transfers ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]);
        const total = await db.get("SELECT COUNT(*) as count FROM vodafone_outgoing_transfers");
        res.json({ transfers, total: total.count, page, limit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/vodafone/outgoing/forward/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const transfer = await db.get("SELECT * FROM vodafone_outgoing_transfers WHERE id = ?", [req.params.id]);
        if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

        const body = JSON.stringify({
            type: 'outgoing',
            provider: 'vodafone',
            amount: transfer.amount,
            sender_number: transfer.sender_number,
            receiver_number: transfer.receiver_number,
            transfer_fee: transfer.transfer_fee,
            balance_after: transfer.balance_after,
            received_at: transfer.received_at,
            message_text: transfer.message_text
        });

        const result = await forwardToServers(body);
        res.json({ success: result.success, message: result.success ? 'تم إعادة إرسال التحويل' : 'فشل', details: result.results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/vodafone/outgoing/test-forward/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const transfer = await db.get("SELECT * FROM vodafone_outgoing_transfers WHERE id = ?", [req.params.id]);
        if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

        const body = JSON.stringify({
            type: 'outgoing',
            provider: 'vodafone',
            amount: transfer.amount,
            sender_number: transfer.sender_number,
            receiver_number: transfer.receiver_number,
            transfer_fee: transfer.transfer_fee,
            balance_after: transfer.balance_after,
            received_at: transfer.received_at,
            message_text: transfer.message_text,
            test_mode: true
        });

        const result = await forwardToServers(body);
        res.json({ success: result.success, message: 'تم اختبار الإرسال', details: result.results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/vodafone/all-payments", authenticateToken, isAdmin, async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const offset = (page - 1) * limit;

        const payments = await db.all(
            "SELECT id, 'incoming' as type, amount, sender_number, sender_name, receiver_number, NULL as transfer_fee, balance_after, message_text, received_at, forwarded, confirmed, created_at FROM vodafone_payments ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [limit, offset]
        );

        const paymentsTotal = await db.get("SELECT COUNT(*) as count FROM vodafone_payments");

        const transfers = await db.all(
            "SELECT id, 'outgoing' as type, amount, sender_number, receiver_number, transfer_fee, balance_after, message_text, received_at, forwarded, confirmed, created_at FROM vodafone_outgoing_transfers ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [limit, offset]
        );

        const transfersTotal = await db.get("SELECT COUNT(*) as count FROM vodafone_outgoing_transfers");

        const combined = [...payments, ...transfers].sort((a, b) => {
            const da = a.created_at || a.received_at || '';
            const db_ = b.created_at || b.received_at || '';
            return db_.localeCompare(da);
        });

        const paginated = combined.slice(0, limit);

        const total = (paymentsTotal ? paymentsTotal.count : 0) + (transfersTotal ? transfersTotal.count : 0);

        res.json({ payments: paginated, total, page, limit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API موحد لكل المعاملات من جميع المصادر ---
app.get("/api/transactions/all", authenticateToken, async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const offset = (page - 1) * limit;
        const providerFilter = req.query.provider || '';
        const typeFilter = req.query.type || '';
        const search = (req.query.search || '').trim().toLowerCase();
        const dateFrom = req.query.dateFrom || '';
        const dateTo = req.query.dateTo || '';

        // Union All من جداول المزودين الأربعة
        const unionSQL = `
            SELECT id, 'etisalat' as provider, 'incoming' as type, amount, sender_number, sender_name, receiver_number,
                   NULL as transfer_fee, balance_after, message_text, received_at, forwarded, confirmed, created_at
            FROM etisalat_payments
            UNION ALL
            SELECT id, 'etisalat' as provider, 'outgoing' as type, amount, sender_number, NULL as sender_name, receiver_number,
                   transfer_fee, balance_after, message_text, received_at, forwarded, confirmed, created_at
            FROM etisalat_outgoing_transfers
            UNION ALL
            SELECT id, 'vodafone' as provider, 'incoming' as type, amount, sender_number, sender_name, receiver_number,
                   NULL as transfer_fee, balance_after, message_text, received_at, forwarded, confirmed, created_at
            FROM vodafone_payments
            UNION ALL
            SELECT id, 'vodafone' as provider, 'outgoing' as type, amount, sender_number, NULL as sender_name, receiver_number,
                   transfer_fee, balance_after, message_text, received_at, forwarded, confirmed, created_at
            FROM vodafone_outgoing_transfers
        `;

        const countSQL = `SELECT COUNT(*) as cnt FROM (${unionSQL}) unified`;

        let whereClauses = [];
        let params = [];

        if (providerFilter && providerFilter !== 'all') {
            whereClauses.push("unified.provider = ?");
            params.push(providerFilter);
        }
        if (typeFilter && typeFilter !== 'all') {
            whereClauses.push("unified.type = ?");
            params.push(typeFilter);
        }
        if (search) {
            whereClauses.push("(unified.sender_number LIKE ? OR unified.receiver_number LIKE ? OR unified.message_text LIKE ? OR unified.sender_name LIKE ? OR unified.provider LIKE ? OR unified.type LIKE ? OR CAST(unified.amount AS TEXT) LIKE ?)");
            const sp = '%' + search + '%';
            params.push(sp, sp, sp, sp, sp, sp, sp);
        }
        if (dateFrom) {
            whereClauses.push("unified.created_at >= ?");
            params.push(dateFrom + ' 00:00:00');
        }
        if (dateTo) {
            whereClauses.push("unified.created_at <= ?");
            params.push(dateTo + ' 23:59:59');
        }

        let fullWhere = whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '';

        const countRow = await db.get(countSQL + fullWhere, params);
        const totalMain = countRow ? countRow.cnt : 0;

        const mainSQL = `SELECT * FROM (${unionSQL}) unified${fullWhere} ORDER BY unified.created_at DESC LIMIT ? OFFSET ?`;
        const mainParams = [...params, limit, offset];
        const mainRows = await db.all(mainSQL, mainParams);

        // جلب نتائج التحليل من analysis_results (قواعد مخصصة)
        let extraSQL = `SELECT id, provider, type, extracted_data, message_text, matched_at as created_at, rule_name
                        FROM analysis_results`;
        let extraWhere = [];
        let extraParams = [];

        if (providerFilter && providerFilter !== 'all') {
            extraWhere.push("provider = ?");
            extraParams.push(providerFilter);
        }
        if (typeFilter && typeFilter !== 'all') {
            extraWhere.push("type = ?");
            extraParams.push(typeFilter);
        }
        if (search) {
            extraWhere.push("(message_text LIKE ? OR provider LIKE ? OR type LIKE ? OR rule_name LIKE ? OR extracted_data LIKE ?)");
            extraParams.push('%' + search + '%', '%' + search + '%', '%' + search + '%', '%' + search + '%', '%' + search + '%');
        }
        if (dateFrom) {
            extraWhere.push("created_at >= ?");
            extraParams.push(dateFrom + ' 00:00:00');
        }
        if (dateTo) {
            extraWhere.push("created_at <= ?");
            extraParams.push(dateTo + ' 23:59:59');
        }
        let extraFullWhere = extraWhere.length > 0 ? ' WHERE ' + extraWhere.join(' AND ') : '';

        const extraCountRow = await db.get(`SELECT COUNT(*) as cnt FROM (${extraSQL}) ar${extraFullWhere}`, extraParams);
        const totalExtra = extraCountRow ? extraCountRow.cnt : 0;

        const extraRows = await db.all(`SELECT * FROM (${extraSQL}) ar${extraFullWhere} ORDER BY ar.created_at DESC LIMIT ? OFFSET ?`, [...extraParams, limit, offset]);

        // تنسيق نتائج القواعد المخصصة
        const formattedExtra = (extraRows || []).map(r => {
            let ed = {};
            try { ed = JSON.parse(r.extracted_data || '{}'); } catch (e) { }
            return {
                id: 'ar_' + r.id,
                provider: r.provider || 'other',
                type: r.type || 'incoming',
                amount: ed.amount || null,
                sender_number: ed.sender_number || ed.receiver_number || '',
                sender_name: ed.sender_name || r.rule_name || '',
                receiver_number: ed.receiver_number || '',
                transfer_fee: ed.transfer_fee || null,
                balance_after: ed.balance_after || null,
                message_text: r.message_text || '',
                received_at: r.created_at,
                forwarded: 0,
                confirmed: 0,
                created_at: r.created_at,
                is_custom: true,
                rule_name: r.rule_name
            };
        });

        // دمج وترتيب
        const allRows = [...mainRows, ...formattedExtra].sort((a, b) => {
            const da = a.created_at || a.received_at || '';
            const db_ = b.created_at || b.received_at || '';
            return db_.localeCompare(da);
        });

        const total = totalMain + totalExtra;

        res.json({
            transactions: allRows.slice(0, limit),
            total,
            page,
            limit,
            totalMain,
            totalExtra
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- قواعد التحليل الديناميكية API ---
app.get("/api/analysis/rules", authenticateToken, isAdmin, async (req, res) => {
    try {
        const rules = await db.all("SELECT * FROM analysis_rules ORDER BY created_at DESC");
        res.json(rules.map(r => ({ ...r, field_mappings: JSON.parse(r.field_mappings || '[]') })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/analysis/rules", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, description, provider, type, header_pattern, regex_pattern, field_mappings, enabled } = req.body;
        if (!name || !regex_pattern) return res.status(400).json({ error: 'Name and regex pattern are required' });
        const result = await db.run(
            `INSERT INTO analysis_rules (name, description, provider, type, header_pattern, regex_pattern, field_mappings, enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description || '', provider || '', type || 'incoming', header_pattern || '', regex_pattern, JSON.stringify(field_mappings || []), enabled !== undefined ? (enabled ? 1 : 0) : 1]
        );
        const rule = await db.get("SELECT * FROM analysis_rules WHERE id = ?", [result.lastID]);
        res.json({ ...rule, field_mappings: JSON.parse(rule.field_mappings || '[]') });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/analysis/rules/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, description, provider, type, header_pattern, regex_pattern, field_mappings, enabled } = req.body;
        const existing = await db.get("SELECT id FROM analysis_rules WHERE id = ?", [req.params.id]);
        if (!existing) return res.status(404).json({ error: 'Rule not found' });
        await db.run(
            `UPDATE analysis_rules SET name=?, description=?, provider=?, type=?, header_pattern=?, regex_pattern=?, field_mappings=?, enabled=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
            [name, description || '', provider || '', type || 'incoming', header_pattern || '', regex_pattern, JSON.stringify(field_mappings || []), enabled !== undefined ? (enabled ? 1 : 0) : 1, req.params.id]
        );
        const rule = await db.get("SELECT * FROM analysis_rules WHERE id = ?", [req.params.id]);
        res.json({ ...rule, field_mappings: JSON.parse(rule.field_mappings || '[]') });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/analysis/rules/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const existing = await db.get("SELECT id FROM analysis_rules WHERE id = ?", [req.params.id]);
        if (!existing) return res.status(404).json({ error: 'Rule not found' });
        await db.run("DELETE FROM analysis_rules WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/analysis/rules", authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await db.run("DELETE FROM analysis_rules");
        res.json({ success: true, deleted: result.changes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/analysis/test", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { message, header, rule_id } = req.body;
        if (!message) return res.status(400).json({ error: 'Message text is required' });

        let rules = [];
        if (rule_id) {
            const rule = await db.get("SELECT * FROM analysis_rules WHERE id = ?", [rule_id]);
            if (rule) rules = [rule];
        } else {
            rules = await db.all("SELECT * FROM analysis_rules WHERE enabled = 1");
        }

        const results = [];
        for (const rule of rules) {
            try {
                // التحقق من هيدر المرسل
                if (rule.header_pattern && header) {
                    const headerRegex = new RegExp(rule.header_pattern, 'i');
                    if (!headerRegex.test(header)) {
                        results.push({ rule_id: rule.id, rule_name: rule.name, matched: false, reason: 'header_mismatch' });
                        continue;
                    }
                } else if (rule.header_pattern && !header) {
                    results.push({ rule_id: rule.id, rule_name: rule.name, matched: false, reason: 'header_required' });
                    continue;
                }

                const regex = new RegExp(rule.regex_pattern);
                const match = message.match(regex);
                const fields = JSON.parse(rule.field_mappings || '[]');

                const extracted = {};
                if (match) {
                    fields.forEach(f => {
                        const val = match[f.group];
                        if (val !== undefined) {
                            extracted[f.name] = f.type === 'float' ? parseFloat(val.replace(/,/g, '')) : val;
                        }
                    });
                }

                results.push({
                    rule_id: rule.id,
                    rule_name: rule.name,
                    matched: !!match,
                    extracted
                });
            } catch (e) {
                results.push({ rule_id: rule.id, rule_name: rule.name, matched: false, error: e.message });
            }
        }

        res.json({ results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- تحليل كل الرسائل الموجودة بالقواعد الديناميكية ---
app.post("/api/analysis/run-all", authenticateToken, isAdmin, async (req, res) => {
    try {
        const messages = await db.all("SELECT id, receiver, sender, content, timestamp FROM messages ORDER BY id ASC");
        if (!messages || messages.length === 0) {
            return res.json({ processed: 0, total: 0, message: 'لا توجد رسائل للتحليل' });
        }

        // جلب أعداد المصادفات الموجودة لكل جدول قبل المعالجة
        const processedContent = new Set();
        const existingTables = ['etisalat_payments', 'etisalat_outgoing_transfers', 'vodafone_payments', 'vodafone_outgoing_transfers'];
        for (const table of existingTables) {
            try {
                const rows = await db.all(`SELECT message_text FROM ${table}`);
                rows.forEach(r => processedContent.add(r.message_text));
            } catch (e) { }
        }

        let matched = 0;
        let skipped = 0;
        for (const msg of messages) {
            if (processedContent.has(msg.content)) {
                skipped++;
                continue;
            }
            if (!msg.content || !msg.sender) continue;
            await processMessageWithRules(msg.receiver, msg.sender, msg.content, msg.timestamp);
            processedContent.add(msg.content);
            matched++;
        }

        res.json({
            total: messages.length,
            processed: matched + skipped,
            matched,
            skipped,
            message: `تم تحليل ${matched} رسالة جديدة، تخطي ${skipped} محللة مسبقاً`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- مسح كل بيانات التطبيق (للأدمن فقط) ---
app.post("/api/clear-all-data", authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.run("DELETE FROM etisalat_payments");
        await db.run("DELETE FROM etisalat_outgoing_transfers");
        await db.run("DELETE FROM vodafone_payments");
        await db.run("DELETE FROM vodafone_outgoing_transfers");
        await db.run("DELETE FROM messages");
        await db.run("DELETE FROM message_reads");
        console.log(`[Del] Admin cleared all app data`);
        res.json({ success: true, message: 'تم مسح كل البيانات بنجاح' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- حذف جميع المعاملات (للأدمن فقط) ---
app.post("/api/transactions/delete-all", authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.run("DELETE FROM etisalat_payments");
        await db.run("DELETE FROM etisalat_outgoing_transfers");
        await db.run("DELETE FROM vodafone_payments");
        await db.run("DELETE FROM vodafone_outgoing_transfers");
        await db.run("DELETE FROM analysis_results");
        console.log(`[Del] Admin deleted all transactions`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post("/api/test-outgoing", async (req, res) => {
    try {
        const { message, sender, receiver, simSlot, timestamp } = req.body;
        if (!message) return res.status(400).json({ error: 'Message text required' });
        const senderNum = sender || '01000000000';
        const receiverNum = receiver || '01000000000';
        const slot = parseInt(simSlot) || 0;
        const now = normalizeTimestampDigits(timestamp || new Date().toISOString().replace('T', ' ').split('.')[0]);

        // كشف نوع المعاملة قبل الحفظ
        const txType1 = await detectTransactionType(senderNum, message);

        // حفظ وبث الرسالة كـ SMS واردة (تظهر في الشات)
        await saveAndEmitUnique({
            port: 'simulated',
            receiver: receiverNum,
            sender: senderNum,
            content: message,
            timestamp: now,
            msgIndex: Math.floor(Math.random() * 9999) + 1,
            simSlot: slot,
            type: 'sms',
            transactionType: txType1?.type || null
        });

        // معالجة الدفع والتحويل لو الرسالة مطابقة (باستخدام القواعد الديناميكية)
        const txDetails = await processMessageWithRules(receiverNum, senderNum, message, now);

        // إرسال تنبيه المعاملة فقط لو معاملة جديدة اتحفظت فعلاً
        if (txDetails) {
            try {
                const alertPayload = {
                    transactionType: txDetails.type || null,
                    sender: senderNum,
                    receiver: receiverNum,
                    provider: txDetails.provider || null,
                    amount: txDetails.amount || null,
                    sender_name: txDetails.sender_name || null,
                    receiver_number: txDetails.receiver_number || null,
                    transfer_fee: txDetails.transfer_fee || null,
                    balance_after: txDetails.balance_after || null
                };
                const broadcastRow = await db.get("SELECT value FROM settings WHERE key = 'broadcast_notif_enabled'");
                const broadcastEnabled = !broadcastRow || broadcastRow.value === '1';
                if (broadcastEnabled) {
                    if (io) io.emit("transaction-alert", alertPayload);
                }
            } catch (e) {}
        }

        res.json({
            success: true,
            message: txDetails ? 'تم حفظ المعاملة بنجاح' : 'تم استلام الرسالة (متكررة)',
            isNew: !!txDetails,
            transactionType: txDetails?.type || null,
            sender: senderNum,
            receiver: receiverNum,
            provider: txDetails?.provider || null,
            amount: txDetails?.amount || null,
            sender_name: txDetails?.sender_name || null,
            receiver_number: txDetails?.receiver_number || null,
            transfer_fee: txDetails?.transfer_fee || null,
            balance_after: txDetails?.balance_after || null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// نقطة نهاية لاستقبال الرسائل من تطبيق Android (بدلاً من المودم)
app.post("/api/phone-message", async (req, res) => {
    try {
        const { sender, content, timestamp, receiver, deviceNumber, simSlot } = req.body;
        if (!sender || !content) {
            return res.status(400).json({ error: 'sender and content are required' });
        }

        const phonePort = `phone-${sender}`;
        const receiverNum = receiver || deviceNumber || activeModems[Object.keys(activeModems)[0]]?.phoneNumber || '01000000000';
        const now = normalizeTimestampDigits(timestamp || new Date().toISOString().replace('T', ' ').split('.')[0]);

        // كشف نوع المعاملة قبل الحفظ
        const txType2 = await detectTransactionType(sender, content);

        // حفظ وبث الرسالة عبر نفس pipeline معالجة رسائل المودم
        await saveAndEmitUnique({
            port: phonePort,
            receiver: receiverNum,
            sender: sender,
            content: content,
            timestamp: now,
            msgIndex: Math.floor(Math.random() * 9999) + 1,
            simSlot: simSlot || 0,
            type: "sms",
            transactionType: txType2?.type || null
        });

        // معالجة المدفوعات والتحويلات (باستخدام القواعد الديناميكية)
        await processMessageWithRules(receiverNum, sender, content, now);

        res.json({ success: true, message: 'تم استلام الرسالة من الهاتف بنجاح' });
    } catch (err) {
        console.error("[X] Error in phone-message:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// إرسال إشعار إلى تطبيق Android عن طريق رقم الهاتف
app.post("/api/send-notification", async (req, res) => {
    try {
        const { phoneNumber, sender, body, simSlot } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: 'phoneNumber is required' });
        }
        const normalized = normalizePhoneNumber(phoneNumber);
        let targetSocketId = null;
        for (const [sid, info] of Object.entries(phoneSockets)) {
            if (normalizePhoneNumber(info.phoneNumber) === normalized) {
                targetSocketId = sid;
                break;
            }
        }
        if (!targetSocketId) {
            return res.status(404).json({ success: false, error: 'Phone not connected' });
        }
        io.to(targetSocketId).emit("server-notification", {
            sender: sender || "Server",
            body: body || "",
            timestamp: String(Date.now()),
            simSlot: simSlot || 0
        });
        console.log(`[Envelope] Server notification sent to ${normalized}`);
        res.json({ success: true, message: 'تم إرسال الإشعار بنجاح' });
    } catch (err) {
        console.error("[X] Error in send-notification:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/send-ussd", authenticateToken, (req, res) => {
    const { portPath, code, socketId } = req.body;

    const modemEntry = activeModems[portPath];
    if (!modemEntry) {
        return res.status(404).json({ error: "Port not found" });
    }

    // التحقق من حجز الموديم
    if (modemEntry.isBusy && modemEntry.currentOwner !== socketId) {
        return res.status(403).json({
            error: "هذا الخط مشغول حالياً بواسطة جهاز آخر. يرجى الانتظار.",
        });
    }

    modemEntry.isBusy = true;
    modemEntry.currentOwner = socketId;
    modemEntry.lastRequester = socketId;

    // موديم افتراضي (متصل عبر تطبيق Android)
    if (modemEntry.isVirtual) {
        const phoneInfo = phoneSockets[modemEntry.socketId];
        if (!phoneInfo) {
            modemEntry.isBusy = false;
            modemEntry.currentOwner = null;
            return res.status(404).json({ error: "الهاتف غير متصل" });
        }
        resetModemTimeout(portPath);
        io.to(modemEntry.socketId).emit("ussd-command", { code, simSlot: modemEntry.simSlot });
        console.log(`[Out] [Virtual] Sent USSD to ${portPath}: ${code}`);
        res.json({ status: "sent", method: "virtual" });
        broadcastModemList();
        return;
    }

    // موديم فعلي (متصل عبر منفذ تسلسلي)
    if (modemEntry.port) {
        resetModemTimeout(portPath);

        const pdu = encodeUSSD7bit(code);
        modemEntry.port.write('AT+CSCS="UCS2"\r\n');

        setTimeout(() => {
            modemEntry.port.write(`AT+CUSD=1,"${pdu}",15\r\n`);
            console.log(`[Out] Sent PDU to ${portPath}: ${pdu} (${code})`);
            res.json({ status: "sent", pdu: pdu });
        }, 200);
        broadcastModemList();
    } else {
        modemEntry.isBusy = false;
        modemEntry.currentOwner = null;
        res.status(404).json({ error: "Port not found" });
    }
});

app.post("/cancel-ussd", (req, res) => {
    const { portPath, socketId } = req.body;
    const modemEntry = activeModems[portPath];

    // 1. فحص وجود المودم
    if (!modemEntry) {
        return res.status(404).json({ error: "المنفذ غير موجود" });
    }

    // 2. الفحص الجوهري: هل السوكيت الذي يطلب الإلغاء هو المالك الحالي للسيشن؟
    if (modemEntry.isBusy && modemEntry.currentOwner === socketId) {

        if (modemEntry.isVirtual) {
            io.to(modemEntry.socketId).emit("ussd-cancel-command", { simSlot: modemEntry.simSlot });
        } else {
            modemEntry.port.write("AT+CUSD=2\r\n");
        }

        if (modemEntry.timeoutTimer) clearTimeout(modemEntry.timeoutTimer);

        modemEntry.isBusy = false;
        modemEntry.currentOwner = null;
        modemEntry.lastRequester = null;

        console.log(`[Plug] Session terminated by owner: ${socketId} on ${portPath}`);

        broadcastModemList();

        return res.json({ status: "terminated", message: "تم إنهاء الجلسة بنجاح" });
    } else {
        // إذا حاول مستخدم آخر إلغاء سيشن ليست له
        console.warn(`[Stop] Unauthorized cancel attempt from ${socketId} on ${portPath}`);
        return res.status(403).json({
            error: "لا يمكنك إنهاء جلسة لم تبدأها أنت، أو أن الجلسة منتهية بالفعل."
        });
    }
});

// --- endpoints للتطبيق (MOUMSGS Android) ---

// --- معلومات الاتصال لتطبيق الهاتف ---
app.get("/api/server-info", async (req, res) => {
    const httpsPort = 29001;

    let noipDomain = null;
    try {
        const row = await db.get("SELECT value FROM settings WHERE key = 'noip_enabled'");
        if (row && row.value === '1') {
            const domainRow = await db.get("SELECT value FROM settings WHERE key = 'noip_hostname'");
            if (domainRow && domainRow.value) noipDomain = domainRow.value;
        }
    } catch(e) {}

    res.json({
        localIP: getLocalIP(),
        httpsPort: httpsPort,
        noipDomain: noipDomain
    });
});

app.post("/api/ussd/list-modems", (req, res) => {
    const list = Object.keys(activeModems).map((path) => {
        const modemEntry = activeModems[path];
        return {
            path: path,
            number: normalizePhoneNumber(modemEntry.phoneNumber) || "Searching...",
            isBusy: modemEntry.isBusy || false,
            signal: modemEntry.signal || 0,
            simSlot: modemEntry.simSlot || 0,
            isVirtual: modemEntry.isVirtual || false,
            isPhone: modemEntry.isPhone || false,
            deviceId: modemEntry.deviceId || null,
            deviceName: modemEntry.deviceName || null,
            androidVersion: modemEntry.androidVersion || null
        };
    });
    res.json({ modems: list });
});

app.post("/api/ussd/dial", (req, res) => {
    const { portPath, code } = req.body;
    if (!portPath || !code) {
        return res.status(400).json({ error: "portPath and code are required" });
    }
    const modemEntry = activeModems[portPath];
    if (!modemEntry) {
        return res.status(404).json({ error: "المنفذ غير موجود" });
    }
    if (modemEntry.isBusy && modemEntry.currentOwner !== "phone-app") {
        return res.status(403).json({ error: "هذا الخط مشغول حالياً. يرجى الانتظار." });
    }

    modemEntry.isBusy = true;
    modemEntry.currentOwner = "phone-app";

    // موديم افتراضي (متصل عبر تطبيق Android)
    if (modemEntry.isVirtual) {
        const phoneInfo = phoneSockets[modemEntry.socketId];
        if (!phoneInfo) {
            modemEntry.isBusy = false;
            modemEntry.currentOwner = null;
            return res.status(404).json({ error: "الهاتف غير متصل" });
        }
        resetModemTimeout(portPath);
        io.to(modemEntry.socketId).emit("ussd-command", { code, simSlot: modemEntry.simSlot });
        console.log(`[Out] [Phone-App][Virtual] Sent USSD to ${portPath}: ${code}`);
        res.json({ status: "sent", method: "virtual" });
        broadcastModemList();
        return;
    }

    // موديم فعلي
    if (modemEntry.port) {
        resetModemTimeout(portPath);
        const pdu = encodeUSSD7bit(code);
        modemEntry.port.write('AT+CSCS="UCS2"\r\n');
        setTimeout(() => {
            modemEntry.port.write(`AT+CUSD=1,"${pdu}",15\r\n`);
            console.log(`[Out] [Phone-App] Sent USSD to ${portPath}: ${pdu} (${code})`);
            res.json({ status: "sent", pdu: pdu });
        }, 200);
        broadcastModemList();
    } else {
        modemEntry.isBusy = false;
        modemEntry.currentOwner = null;
        res.status(404).json({ error: "المنفذ غير موجود" });
    }
});

app.post("/api/ussd/cancel", (req, res) => {
    const { portPath } = req.body;
    const modemEntry = activeModems[portPath];
    if (!modemEntry) {
        return res.status(404).json({ error: "المنفذ غير موجود" });
    }
    if (modemEntry.currentOwner !== "phone-app") {
        return res.status(403).json({ error: "لا يمكنك إنهاء جلسة لم تبدأها" });
    }
    if (modemEntry.isVirtual) {
        io.to(modemEntry.socketId).emit("ussd-cancel-command", { simSlot: modemEntry.simSlot });
    } else {
        modemEntry.port.write("AT+CUSD=2\r\n");
    }
    if (modemEntry.timeoutTimer) clearTimeout(modemEntry.timeoutTimer);
    modemEntry.isBusy = false;
    modemEntry.currentOwner = null;
    modemEntry.lastRequester = null;
    console.log(`[Plug] [Phone-App] Session terminated on ${portPath}`);
    broadcastModemList();
    return res.json({ status: "terminated" });
});

app.get("/api/ussd/response", (req, res) => {
    const { portPath } = req.query;
    if (!portPath) {
        return res.status(400).json({ error: "portPath query parameter is required" });
    }
    const entry = ussdResponses[portPath];
    if (entry && (Date.now() - entry.timestamp < 30000)) {
        // حذف الرد بعد قراءته
        delete ussdResponses[portPath];
        return res.json({ hasResponse: true, response: entry.response });
    }
    return res.json({ hasResponse: false });
});

// إرسال SMS عبر موديم افتراضي (تطبيق Android)
app.post("/api/send-sms", authenticateToken, (req, res) => {
    const { portPath, to, message } = req.body;
    if (!portPath || !to || !message) {
        return res.status(400).json({ error: "portPath, to, and message are required" });
    }
    const modemEntry = activeModems[portPath];
    if (!modemEntry || !modemEntry.isVirtual) {
        return res.status(404).json({ error: "Virtual modem not found" });
    }
    const phoneInfo = phoneSockets[modemEntry.socketId];
    if (!phoneInfo) {
        return res.status(404).json({ error: "Phone not connected" });
    }
    io.to(modemEntry.socketId).emit("send-sms", {
        to: to,
        message: message,
        simSlot: modemEntry.simSlot
    });
    console.log(`[Out] [Virtual] SMS send request to ${portPath}: to=${to}`);
    res.json({ status: "sent", method: "virtual" });
});

app.post("/api/modems/clear-messages", authenticateToken, isAdmin, async (req, res) => {
    try {
        // 1. مسح الرسائل من قاعدة البيانات (Database)
        await db.run("DELETE FROM messages");
        console.log("[Del] Database messages cleared.");

        // 2. مسح الرسائل من شرائح الـ SIM (Modems)
        const ports = Object.keys(activeModems);
        ports.forEach(portPath => {
            const modem = activeModems[portPath];
            if (modem && modem.port && modem.port.isOpen) {
                // AT+CMGD=1,4 يحذف جميع الرسائل من ذاكرة الشريحة
                modem.port.write("AT+CMGD=1,4\r\n", (err) => {
                    if (err) console.error(`Error clearing SIM on ${portPath}:`, err);
                    else console.log(`[Del] SIM messages cleared on ${portPath}`);
                });
            }
        });

        // إرسال تحديث للفرونت اند عبر السوكت لتفريغ الواجهة فوراً
        io.emit("messages-cleared");

        res.json({ success: true, message: "تم مسح جميع الرسائل من القاعدة والشرائح" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "خطأ أثناء مسح قاعدة البيانات" });
    }
});


function setupConnectionHandler(socket) {

    if (socket.user) {
        onlineUsers[socket.id] = {
            username: socket.user.username,
            loginTime: new Date()
        };
        io.emit("update_online_count", Object.values(onlineUsers).length);
        io.emit("update_online_status", Object.values(onlineUsers));
    }

    socket.on("get-chat-history", async ({ userId }) => {
        console.log(`[Antenna] User [${userId}] requested chat history`);

        try {
            // استعلام ذكي يجلب الرسالة ويتحقق إذا كان الـ userId موجود في جدول القراءات لهذه الرسالة
            const sql = `
            SELECT m.*, 
            CASE WHEN mr.user_id IS NOT NULL THEN 1 ELSE 0 END as is_read
            FROM messages m
            LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = ?
            ORDER BY m.timestamp DESC 
            LIMIT 500
        `;

            const history = await db.all(sql, [userId]);

            // إرسال التاريخ مرتباً من الأقدم للأحدث للواجهة
            socket.emit("chat-history", history.reverse());

        } catch (err) {
            console.error("[X] Error fetching history:", err.message);
        }
    });


    // 2. طلب يدوي لجلب حالة المودمات (لإظهار النقطة الخضراء فوراً)
    socket.on("request-modem-update", () => {
        broadcastModemList(socket.id);
    });

    socket.on("mark-as-read", async ({ sender, receiver, userId }) => {
        if (!userId) return;

        try {
            // البحث عن كل الرسائل التي لم يقرأها هذا المستخدم في هذه المحادثة
            const unreadMessages = await db.all(
                `SELECT id FROM messages 
             WHERE sender = ? AND receiver = ? 
             AND id NOT IN (SELECT message_id FROM message_reads WHERE user_id = ?)`,
                [sender, receiver, userId]
            );

            if (unreadMessages.length > 0) {
                const stmt = await db.prepare(`INSERT OR IGNORE INTO message_reads (message_id, user_id) VALUES (?, ?)`);
                for (const msg of unreadMessages) {
                    await stmt.run(msg.id, userId);
                }
                await stmt.finalize();

                console.log(`[Eye] User [${userId}] read ${unreadMessages.length} messages from ${sender}`);

                // إبلاغ الواجهة بالتحديث (اختياري)
                socket.emit("messages-updated", { sender, receiver });
            }
        } catch (err) {
            console.error("[X] Error marking as read by user:", err.message);
        }
    });

    socket.on("mark-as-read", async ({ sender, receiver, userId }) => {
        try {
            // إدخال سجل لكل رسالة لم يقرأها هذا المستخدم في هذه المحادثة
            await db.run(`
                INSERT OR IGNORE INTO message_reads (message_id, user_id)
                SELECT id, ? FROM messages 
                WHERE sender = ? AND receiver = ?
            `, [userId, sender, receiver]);

            console.log(`[Book] Messages from ${sender} marked read by ${userId}`);
        } catch (err) {
            console.error("[X] Read status error:", err.message);
        }
    });

    // إرسال إشعار لتطبيق Android
    socket.on("send-server-notification", async ({ phoneNumber, sender, body, simSlot }) => {
        try {
            const normalized = normalizePhoneNumber(phoneNumber);
            let targetSocketId = null;
            for (const [sid, info] of Object.entries(phoneSockets)) {
                if (normalizePhoneNumber(info.phoneNumber) === normalized) {
                    targetSocketId = sid;
                    break;
                }
            }
            if (!targetSocketId) {
                socket.emit("server-notification-status", { success: false, error: "Phone not connected" });
                return;
            }
            io.to(targetSocketId).emit("server-notification", {
                sender: sender || "Server",
                body: body || "",
                timestamp: String(Date.now()),
                simSlot: simSlot || 0
            });
            socket.emit("server-notification-status", { success: true });
            console.log(`[Envelope] Server notification sent to ${normalized}`);
        } catch (err) {
            console.error("[X] send-server-notification error:", err.message);
            socket.emit("server-notification-status", { success: false, error: err.message });
        }
    });

    // --- أحداث اتصال التطبيق (Android Phone) ---
    if (socket.isPhone) {
        console.log(`[Phone] Phone socket connected: ${socket.phoneNumber} (${socket.id})`);

        socket.on("register-phone", (data) => {
            const { phoneNumber: rawPhone, simSlots, deviceId, deviceName, androidVersion, signalValues, simPhoneNumbers } = data;
            const phoneNumber = normalizePhoneNumber(rawPhone) || `unknown-${socket.id.substring(0, 6)}`;
            const slots = Array.isArray(simSlots) ? simSlots : [];
            const hasNoSims = slots.length === 0;

            // تنظيف أي موديمات قديمة لهذا السوكيت قبل إعادة التسجيل
            if (phoneSockets[socket.id]) {
                phoneSockets[socket.id].modemPaths.forEach(path => delete activeModems[path]);
            }

            if (hasNoSims) {
                phoneSockets[socket.id] = { phoneNumber, simSlots: [], modemPaths: [], deviceId: deviceId || "unknown", deviceName: deviceName || "unknown", androidVersion: androidVersion || "unknown", simPhoneNumbers: [] };
                broadcastModemList();
                console.log(`[Phone] Phone unregistered (no SIMs): ${phoneNumber} (${socket.id})`);
                return;
            }

            const isReconnect = Object.entries(phoneSockets).some(([sid, p]) => p.phoneNumber === phoneNumber && sid !== socket.id);
            const normalizedCurrent = normalizePhoneNumber(phoneNumber);
            const uniquePhoneCount = new Set(
                Object.entries(phoneSockets)
                    .filter(([sid, p]) => sid !== socket.id && (!normalizedCurrent || normalizePhoneNumber(p.phoneNumber) !== normalizedCurrent))
                    .map(([_, p]) => p.phoneNumber)
            ).size;
            const alreadyRegistered = normalizedCurrent && Object.values(phoneSockets).some(p => normalizePhoneNumber(p.phoneNumber) === normalizedCurrent && p.simSlots.length > 0);
            const effectiveCount = alreadyRegistered ? uniquePhoneCount : uniquePhoneCount + 1;
            const maxLic = _cachedPlanLimits ? _cachedPlanLimits.max_licenses : 0;
            if (maxLic > 0 && effectiveCount > maxLic) {
                console.log(`[License] Phone rejected: ${phoneNumber} — max ${maxLic} clients reached (${effectiveCount} attempted)`);
                socket.emit("license-limit-reached", { max: maxLic, current: effectiveCount });
                socket.disconnect(true);
                return;
            }

            // تنظيف أي اتصال قديم لنفس الرقم (حالة إعادة الاتصال السريع)
            for (const [oldId, oldInfo] of Object.entries(phoneSockets)) {
                if (oldInfo.phoneNumber === phoneNumber && oldId !== socket.id) {
                    console.log(`[Broom] Cleaning old socket ${oldId} for phone ${phoneNumber}`);
                    oldInfo.modemPaths.forEach(path => delete activeModems[path]);
                    delete phoneSockets[oldId];
                    try { io.sockets.sockets.get(oldId)?.disconnect(true); } catch (_) { }
                }
            }

            const devId = deviceId || "unknown";
            const devName = deviceName || "unknown";
            const devVer = androidVersion || "unknown";
            console.log(`[Phone] Phone registered: ${phoneNumber} (${slots.length} SIMs) [${devName}/${devVer}]`);

            const modemPaths = [];
            slots.forEach((slot, idx) => {
                const slotPhone = normalizePhoneNumber((simPhoneNumbers && idx < simPhoneNumbers.length && simPhoneNumbers[idx])
                    ? simPhoneNumbers[idx] : phoneNumber);
                if (!slotPhone) return;
                const path = `phone-${slotPhone}-sim${slot}`;
                const initialSignal = (signalValues && idx < signalValues.length && signalValues[idx] >= 0)
                    ? signalValues[idx] : 100;
                activeModems[path] = {
                    path: path,
                    phoneNumber: slotPhone,
                    simSlot: slot,
                    isVirtual: true,
                    isPhone: true,
                    socketId: socket.id,
                    isBusy: false,
                    currentOwner: null,
                    lastRequester: null,
                    timeoutTimer: null,
                    expiryTime: null,
                    signal: initialSignal,
                    deviceId: devId,
                    deviceName: devName,
                    androidVersion: devVer
                };
                modemPaths.push(path);
            });

            phoneSockets[socket.id] = { phoneNumber, simSlots: slots, modemPaths, deviceId: devId, deviceName: devName, androidVersion: devVer, simPhoneNumbers };
            broadcastModemList();
        });

        socket.on("phone-signal-update", (data) => {
            const { signalValues } = data;
            if (!signalValues || !Array.isArray(signalValues)) return;
            const phoneInfo = phoneSockets[socket.id];
            if (!phoneInfo) return;
            phoneInfo.modemPaths.forEach((path, idx) => {
                if (idx < signalValues.length && signalValues[idx] >= 0) {
                    if (activeModems[path]) {
                        activeModems[path].signal = signalValues[idx];
                    }
                }
            });
            broadcastModemList();
        });

        socket.on("phone-sim-status", (data) => {
            const { simSlots, added, removed, signalValues, simPhoneNumbers } = data;
            const phoneInfo = phoneSockets[socket.id];
            if (!phoneInfo) return;

            const newSlots = Array.isArray(simSlots) ? simSlots : phoneInfo.simSlots;
            phoneInfo.simSlots = newSlots;
            if (simPhoneNumbers) phoneInfo.simPhoneNumbers = simPhoneNumbers;

            // Remove disconnected SIM modems
            if (removed && removed.length > 0) {
                removed.forEach(slot => {
                    let foundPath = null;
                    phoneInfo.modemPaths.forEach(p => {
                        if (p.endsWith(`-sim${slot}`)) foundPath = p;
                    });
                    if (foundPath) {
                        delete activeModems[foundPath];
                        const idx = phoneInfo.modemPaths.indexOf(foundPath);
                        if (idx !== -1) phoneInfo.modemPaths.splice(idx, 1);
                    }
                });
                console.log(`[Phone] SIMs removed from ${phoneInfo.phoneNumber}: [${removed}]`);
            }

            // Add newly connected SIM modems
            if (added && added.length > 0) {
                added.forEach(slot => {
                    // Figure out the index in simSlots for this slot to get the phone number
                    const slotIdx = phoneInfo.simSlots.indexOf(slot);
                    const slotPhone = (simPhoneNumbers && slotIdx >= 0 && slotIdx < simPhoneNumbers.length && simPhoneNumbers[slotIdx])
                        ? simPhoneNumbers[slotIdx] : phoneInfo.phoneNumber;
                    const path = `phone-${slotPhone}-sim${slot}`;
                    if (activeModems[path]) return;
                    const sigIdx = phoneInfo.simSlots.indexOf(slot);
                    const sig = (signalValues && sigIdx >= 0 && sigIdx < signalValues.length && signalValues[sigIdx] >= 0)
                        ? signalValues[sigIdx] : 100;
                    activeModems[path] = {
                        path, phoneNumber: slotPhone, simSlot: slot,
                        isVirtual: true, isPhone: true, socketId: socket.id,
                        isBusy: false, currentOwner: null, lastRequester: null,
                        timeoutTimer: null, expiryTime: null, signal: sig,
                        deviceId: phoneInfo.deviceId, deviceName: phoneInfo.deviceName,
                        androidVersion: phoneInfo.androidVersion
                    };
                    phoneInfo.modemPaths.push(path);
                });
                console.log(`[Phone] SIMs added to ${phoneInfo.phoneNumber}: [${added}]`);
            }

            // Update signals for all modems
            if (signalValues) {
                phoneInfo.modemPaths.forEach((path, idx) => {
                    if (idx < signalValues.length && signalValues[idx] >= 0 && activeModems[path]) {
                        activeModems[path].signal = signalValues[idx];
                    }
                });
            }

            broadcastModemList();
        });

        socket.on("phone-sms", async (data) => {
            const { sender, content, timestamp, simSlot, msgId } = data;
            const phoneInfo = phoneSockets[socket.id];
            if (!phoneInfo) return;

            const slot = simSlot || 0;
            let phonePort = phoneInfo.modemPaths.find(p => p.endsWith(`-sim${slot}`));
            if (!phonePort) phonePort = `phone-${phoneInfo.phoneNumber}-sim${slot}`;
            const now = normalizeTimestampDigits(timestamp || new Date().toISOString().replace('T', ' ').split('.')[0]);

            // الرقم الصحيح للـ SIM المستلم
            const modemEntry = activeModems[phonePort];
            const simNumber = modemEntry ? modemEntry.phoneNumber : phoneInfo.phoneNumber;

            // كشف نوع المعاملة قبل الحفظ
            const txType3 = await detectTransactionType(sender, content);

            await saveAndEmitUnique({
                port: phonePort,
                receiver: simNumber,
                sender: sender,
                content: content,
                timestamp: now,
                msgIndex: Math.floor(Math.random() * 9999) + 1,
                simSlot: simSlot || 0,
                type: "sms",
                transactionType: txType3?.type || null
            });

            // معالجة المدفوعات والتحويلات باستخدام القواعد الديناميكية
            const txDetails = await processMessageWithRules(simNumber, sender, content, now);

            // إرسال تفاصيل المعاملة فقط لو معاملة جديدة اتحفظت فعلاً
            if (txDetails) {
                try {
                    const alertPayload = {
                        transactionType: txDetails.type || null,
                        sender: sender,
                        receiver: simNumber,
                        provider: txDetails.provider || null,
                        amount: txDetails.amount || null,
                        sender_name: txDetails.sender_name || null,
                        receiver_number: txDetails.receiver_number || null,
                        transfer_fee: txDetails.transfer_fee || null,
                        balance_after: txDetails.balance_after || null
                    };
                    const broadcastRow = await db.get("SELECT value FROM settings WHERE key = 'broadcast_notif_enabled'");
                    const broadcastEnabled = !broadcastRow || broadcastRow.value === '1';
                    if (broadcastEnabled) {
                        if (io) io.emit("transaction-alert", alertPayload);
                    } else {
                        socket.emit("transaction-alert", alertPayload);
                    }
                } catch (e) {}
            }

            // إرسال تأكيد الاستلام للهاتف مع تفاصيل المعاملة
            if (msgId != null) {
                try {
                    const ackPayload = {
                        msgId: Number(msgId),
                        transactionType: txType3?.type || null,
                        sender: sender,
                        provider: txDetails?.provider || null,
                        amount: txDetails?.amount || null,
                        sender_name: txDetails?.sender_name || null,
                        receiver_number: txDetails?.receiver_number || null,
                        transfer_fee: txDetails?.transfer_fee || null,
                        balance_after: txDetails?.balance_after || null
                    };
                    socket.emit("phone-sms-ack", ackPayload);
                } catch (e) {}
            }
        });

        socket.on("phone-ussd-response", (data) => {
            const { simSlot, response, interactive, isError } = data;
            const phoneInfo = phoneSockets[socket.id];
            if (!phoneInfo) return;
            const slot = simSlot || 0;
            let path = phoneInfo.modemPaths.find(p => p.endsWith(`-sim${slot}`));
            if (!path) path = `phone-${phoneInfo.phoneNumber}-sim${slot}`;
            ussdResponses[path] = { response: response, timestamp: Date.now() };

            const payload = { port: path, type: "ussd", content: response, interactive: !!interactive, isError: !!isError };
            const modemEntry = activeModems[path];
            const owner = modemEntry?.currentOwner || modemEntry?.lastRequester;
            if (owner) io.to(owner).emit("modem-data", payload);
            else io.emit("modem-data", payload);

            if (modemEntry) {
                if (interactive) {
                    resetModemTimeout(path);
                } else {
                    if (modemEntry.timeoutTimer) clearTimeout(modemEntry.timeoutTimer);
                    modemEntry.isBusy = false;
                    modemEntry.currentOwner = null;
                    modemEntry.lastRequester = null;
                    modemEntry.expiryTime = null;
                    broadcastModemList();
                }
            }
        });

        socket.on("phone-ping", () => {
            const phoneInfo = phoneSockets[socket.id];
            if (phoneInfo) {
                phoneInfo.lastSeen = Date.now();
                socket.emit("phone-pong");
            }
        });
    }

    // --- أحداث عامة ---

    socket.on("vibrate-phone", (data, ack) => {
        // مستخدم Web يطلب هز هاتف معين
        const path = data?.path;
        if (!path) { if (ack) ack({ error: "missing path" }); return; }
        const modem = activeModems[path];
        if (!modem || !modem.isPhone) { if (ack) ack({ error: "not a phone" }); return; }
        const targetSocket = io.sockets.sockets.get(modem.socketId);
        if (!targetSocket) { if (ack) ack({ error: "phone offline" }); return; }
        targetSocket.emit("vibrate-phone");
        if (ack) ack({ ok: true });
        console.log(`[Tab] Vibration sent to ${path}`);
    });

    socket.on("disconnect", () => {
        if (socket.isPhone) {
            const phoneInfo = phoneSockets[socket.id];
            if (phoneInfo) {
                console.log(`[Phone] Phone disconnected: ${phoneInfo.phoneNumber}`);
                phoneInfo.modemPaths.forEach(path => {
                    const entry = activeModems[path];
                    if (entry && entry.socketId === socket.id) {
                        if (entry.timeoutTimer) clearTimeout(entry.timeoutTimer);
                        delete activeModems[path];
                    }
                });
                delete phoneSockets[socket.id];
                broadcastModemList();
            }
            return;
        }

        if (socket.user) {
            delete onlineUsers[socket.id];
            io.emit("update_online_count", Object.values(onlineUsers).length);
            io.emit("update_online_status", Object.values(onlineUsers));
        }

        Object.keys(activeModems).forEach((path) => {
            const entry = activeModems[path];
            if (entry && entry.currentOwner === socket.id) {
                console.log(`[Plug] User ${socket.id} disconnected. Releasing ${path}`);

                if (entry.timeoutTimer) clearTimeout(entry.timeoutTimer);

                if (entry.isVirtual && entry.socketId) {
                    io.to(entry.socketId).emit("ussd-cancel-command", { simSlot: entry.simSlot });
                } else if (entry.port) {
                    entry.port.write("AT+CUSD=2\r\n");
                }

                entry.isBusy = false;
                entry.currentOwner = null;
                entry.lastRequester = null;
                broadcastModemList();
            }
        });
    });


    broadcastModemList(socket.id);

}

app.post("/auto-detect-number", (req, res) => {
    const { portPath } = req.body;
    const modemEntry = activeModems[portPath];

    if (modemEntry && modemEntry.port) {
        activeModems[portPath].isSearching = true; // تفعيل الحالة فوراً
        console.log(`[Search] Searching mode activated for ${portPath}`);
        // الأكواد الخاصة بالشبكات المصرية
        const codes = ["*947#", "*878#", "*688#"];

        console.log(`[Rocket] Start detection for ${portPath}`);

        codes.forEach((code, index) => {
            setTimeout(() => {
                // الفحص السحري: لو الرقم اتلقى فعلاً في محاولة سابقة، وقف التنفيذ
                if (activeModems[portPath] && activeModems[portPath].phoneNumber) {
                    console.log(
                        `[Stop2] Stopping detection on ${portPath} (Number already found)`,
                    );
                    return;
                }

                const pdu = encodeUSSD7bit(code);
                const serial = modemEntry.port;

                serial.write('AT+CSCS="UCS2"\r\n');
                setTimeout(() => {
                    serial.write(`AT+CUSD=1,"${pdu}",15\r\n`);
                    console.log(`[Antenna] Trying: ${code} on ${portPath}`);
                }, 200);
            }, index * 5000); // زيادة المهلة لـ 5 ثواني لضمان رد الشبكة
        });

        res.json({ status: "processing" });
    } else {
        res.status(404).json({ error: "Port not found" });
    }
});

// مسار فحص القفل
app.post("/check-lock", (req, res) => {
    const { portPath } = req.body;
    const modemEntry = activeModems[portPath];

    if (modemEntry && modemEntry.port) {
        // إرسال الأوامر للمنفذ الصحيح
        modemEntry.port.write("AT^CARDLOCK?\r\n");
        modemEntry.port.write('AT+CLCK="PN",2\r\n');
        res.json({ status: "checking" });
    } else {
        res.status(404).json({ error: "Port not found" });
    }
});

function resetModemTimeout(pathName) {
    const modemEntry = activeModems[pathName];
    if (!modemEntry) return;

    if (modemEntry.timeoutTimer) {
        clearTimeout(modemEntry.timeoutTimer);
    }

    const duration = 60 * 1000;
    modemEntry.expiryTime = Date.now() + duration;

    modemEntry.timeoutTimer = setTimeout(() => {
        const entry = activeModems[pathName];
        if (!entry || !entry.isBusy) return;

        console.log(`[Clock] Timeout: Auto-terminating session on ${pathName} due to inactivity.`);

        if (entry.isVirtual) {
            const info = phoneSockets[entry.socketId];
            if (info) {
                io.to(entry.socketId).emit("ussd-cancel-command", { simSlot: entry.simSlot });
            }
        } else if (entry.port) {
            entry.port.write("AT+CUSD=2\r\n");
        }

        if (entry.currentOwner) {
            io.to(entry.currentOwner).emit("modem-data", {
                port: pathName,
                type: "Auto-terminating-Session",
                content: "انتهت الجلسة تلقائياً بسبب عدم النشاط لمدة دقيقة .",
            });
        }

        entry.isBusy = false;
        entry.currentOwner = null;
        entry.lastRequester = null;
        entry.expiryTime = null;
        broadcastModemList();
    }, duration);
}

function startAutoDetection(pathName) {
    const modemEntry = activeModems[pathName];
    if (!modemEntry || !modemEntry.port) return;

    modemEntry.isSearching = true;
    // console.log(`[Rocket] Auto-detecting number for new modem: ${pathName}`);

    const codes = ["*947#", "*878#", "*688#"];

    codes.forEach((code, index) => {
        setTimeout(() => {
            // توقف إذا تم العثور على الرقم أو تم فصل الفلاشة
            if (!activeModems[pathName] || activeModems[pathName].phoneNumber) return;

            const pdu = encodeUSSD7bit(code);
            const serial = modemEntry.port;

            serial.write('AT+CSCS="UCS2"\r\n');
            setTimeout(() => {
                if (activeModems[pathName]) {
                    serial.write(`AT+CUSD=1,"${pdu}",15\r\n`);
                    console.log(`[Antenna] [Auto] Trying: ${code} on ${pathName}`);
                }
            }, 500);
        }, index * 6000); // مهلة 6 ثوانٍ بين كل محاولة
    });
}

app.post("/make-call", (req, res) => {
    const { portPath, phoneNumber } = req.body;
    const modemEntry = activeModems[portPath];

    if (modemEntry && modemEntry.port) {
        const serial = modemEntry.port;

        // 1. تحويل لوضع الـ GSM وتغيير التشفير
        serial.write('AT+CSCS="IRA"\r\n');
        setTimeout(() => serial.write("AT^CVOICE=0\r\n"), 100);
        setTimeout(() => serial.write("AT^DDSET=1\r\n"), 200); // فتح قناة الصوت الرقمية

        setTimeout(() => {
            const cleanNumber = phoneNumber.replace(/\s/g, "");
            // 2. تجربة الاتصال بالصيغة الدولية الكاملة (حتى لو الرقم محلي)
            // أحياناً المودم يحتاج +2 قبل الرقم ليقبل الطلب
            const internationalNumber = cleanNumber.startsWith("01")
                ? `+2${cleanNumber}`
                : cleanNumber;

            const dialCommand = `ATD${internationalNumber};\r\n`;

            serial.write(dialCommand);
            console.log(`[Antenna] Final Attempt Calling: ${internationalNumber}`);

            res.json({ status: "calling" });
        }, 500);
    }
});

app.post("/send-dtmf", (req, res) => {
    const { portPath, digit } = req.body;
    const modemEntry = activeModems[portPath];

    if (modemEntry && modemEntry.port) {
        // AT+VTS يسمح بإرسال نغمة الرقم للطرف الآخر ليسمعها النظام الآلي
        modemEntry.port.write(`AT+VTS=${digit}\r\n`);
        console.log(`[Piano] Sending DTMF Digit: ${digit} on ${portPath}`);
        res.json({ status: "digit_sent" });
    } else {
        res.status(404).json({ error: "Port not found" });
    }
});

// server.listen(5000, () => {
//   console.log("[Rocket] Server running: http://localhost:5000");
//   watchPorts(); // تشغيل الـ Listener
// });


app.post("/list-messages", (req, res) => {
    const { portPath } = req.body;
    const modemEntry = activeModems[portPath];

    if (modemEntry && modemEntry.port) {
        const serial = modemEntry.port;

        // سلسلة أوامر تضمن الوصول للرسائل
        serial.write('AT+CMGF=0\r\n'); // وضع النص

        setTimeout(() => {
            // المحاولة الأولى: ذاكرة الشريحة (SIM)
            serial.write('AT+CPMS="SM"\r\n');
        }, 200);

        setTimeout(() => {
            // طلب كل الرسائل (ALL)
            serial.write('AT+CMGL="4"\r\n');
        }, 400);

        // محاولة ثانية احتياطية بعد ثانية واحدة لذاكرة الهاتف
        setTimeout(() => {
            serial.write('AT+CPMS="ME"\r\n');
            setTimeout(() => serial.write('AT+CMGL="ALL"\r\n'), 200);
        }, 1500);

        res.json({ status: "fetching" });
    }
});

async function processIncomingSMS(pathName, rawLine) {
    const modem = activeModems[pathName];
    if (!modem) return;

    let line = rawLine.trim();
    if (!/^[0-9A-Fa-f]{20,}$/.test(line)) return;

    try {
        const sender = extractSenderFromPDU(line);
        const timestamp = normalizeTimestampDigits(extractTimestampFromPDU(line));

        let refNumber = "SINGLE";
        let partIndex = 1;
        let totalParts = 1;

        if (line.includes("050003")) {
            let udhPos = line.indexOf("050003");
            refNumber = line.substring(udhPos + 6, udhPos + 8);
            totalParts = parseInt(line.substring(udhPos + 8, udhPos + 10), 16);
            partIndex = parseInt(line.substring(udhPos + 10, udhPos + 12), 16);
        }

        const bufferKey = `${pathName}_${sender}_${refNumber}`;

        if (!smsProcessingBuffer[bufferKey]) {
            smsProcessingBuffer[bufferKey] = {
                parts: new Array(totalParts).fill(null),
                indices: [],
                sender: sender,
                timestamp: timestamp,
                receivedCount: 0
            };
        }

        const data = smsProcessingBuffer[bufferKey];

        let decodedPart = decodeSmart1(line);
        if (!data.parts[partIndex - 1]) {
            data.parts[partIndex - 1] = decodedPart;
            data.receivedCount++;
            if (modem.tempReadingIndex) data.indices.push(modem.tempReadingIndex);
        }

        console.log(`[Inbox] [${pathName}] Part ${data.receivedCount}/${totalParts} (Ref: ${refNumber})`);

        if (data.receivedCount === totalParts) {
            console.log(`[OK] All ${totalParts} parts collected. Finalizing message...`);

            if (data.cleanupTimer) clearTimeout(data.cleanupTimer);

            let fullContent = data.parts.join("");
            fullContent = fullContent.trim();
            fullContent = fixLanguageJunctions(fullContent);

            const receiver = modem.phoneNumber || "Unknown";

            // كشف نوع المعاملة قبل الحفظ
            const txType4 = await detectTransactionType(data.sender, fullContent);

            await saveAndEmitUnique({
                port: pathName,
                receiver: receiver,
                sender: data.sender,
                content: fullContent,
                timestamp: data.timestamp,
                msgIndex: data.indices.length > 0 ? parseInt(data.indices[0]) : null,
                simSlot: modem.simSlot || 0,
                type: "sms",
                transactionType: txType4?.type || null
            });

            await processMessageWithRules(receiver, data.sender, fullContent, data.timestamp);

            delete smsProcessingBuffer[bufferKey];

            if (data.indices && data.indices.length > 0) {
                clearAllSimMessages(pathName);
            }

        } else {
            if (data.cleanupTimer) clearTimeout(data.cleanupTimer);
            data.cleanupTimer = setTimeout(() => {
                if (smsProcessingBuffer[bufferKey]) {
                    console.warn(`[Del] [Cleanup] Removing incomplete message (Ref: ${refNumber}) from memory.`);
                    delete smsProcessingBuffer[bufferKey];
                }
            }, 2 * 60 * 1000);
        }

    } catch (err) {
        console.error(`[X] Error in processIncomingSMS:`, err.message);
    }
}

async function autoAnalyzePendingMessages() {
    try {
        console.log('[Search] فحص الرسائل غير المحللة...');
        const messages = await db.all("SELECT id, receiver, sender, content, timestamp FROM messages ORDER BY id ASC");
        if (!messages || messages.length === 0) return;

        // جمع message_text الموجود بالفعل في جداول المعاملات
        const existingTexts = new Set();
        const tables = ['etisalat_payments', 'etisalat_outgoing_transfers', 'vodafone_payments', 'vodafone_outgoing_transfers'];
        for (const table of tables) {
            try {
                const rows = await db.all(`SELECT message_text FROM ${table}`);
                rows.forEach(r => existingTexts.add(r.message_text));
            } catch (e) { }
        }

        let analyzed = 0;
        let skipped = 0;
        for (const msg of messages) {
            if (!msg.content || !msg.sender) continue;
            if (existingTexts.has(msg.content)) { skipped++; continue; }
            await processMessageWithRules(msg.receiver, msg.sender, msg.content, msg.timestamp);
            existingTexts.add(msg.content);
            analyzed++;
        }
        console.log(`[OK] Auto-analyze: ${analyzed} new, ${skipped} already exist`);
    } catch (err) {
        console.error(`[X] Error in autoAnalyzePendingMessages:`, err.message);
    }
    // إعادة محاولة إرسال المعاملات اللي فشل إرسالها قبل كده
    await retryUnforwardedTransactions();
}

async function retryUnforwardedTransactions() {
    try {
        console.log('[Repeat] فحص المعاملات غير المرسلة...');
        const tables = [
            { name: 'etisalat_payments', provider: 'etisalat', type: 'incoming', event: 'etisalat-payment-forwarded' },
            { name: 'etisalat_outgoing_transfers', provider: 'etisalat', type: 'outgoing', event: 'etisalat-outgoing-forwarded' },
            { name: 'vodafone_payments', provider: 'vodafone', type: 'incoming', event: 'vodafone-payment-forwarded' },
            { name: 'vodafone_outgoing_transfers', provider: 'vodafone', type: 'outgoing', event: 'vodafone-outgoing-forwarded' }
        ];
        let retried = 0;
        for (const t of tables) {
            const rows = await db.all(`SELECT * FROM ${t.name} WHERE forwarded = 0`);
            for (const row of rows) {
                const extracted = {
                    amount: row.amount,
                    sender_number: row.sender_number,
                    receiver_number: row.receiver_number,
                    sender_name: row.sender_name,
                    transfer_fee: row.transfer_fee,
                    balance_after: row.balance_after
                };
                await autoForwardToTayercash(t.provider, t.type, extracted, row.receiver_number || row.sender_number, row.message_text, row.received_at, t.name, t.event, row.id);
                retried++;
            }
        }
        if (retried > 0) console.log(`[OK] Retried forwarding ${retried} unforwarded transactions`);
    } catch (err) {
        console.error(`[X] Error in retryUnforwardedTransactions:`, err.message);
    }
}

async function autoCreateWalletIfNeeded(walletNum, provider, type, amount, balanceAfter) {
    if (!walletNum) return { wallet: null, isNew: false };
    try {
        let wallet = await db.get("SELECT id FROM wallets WHERE WalletNum = ?", [walletNum]);
        let isNew = false;
        if (!wallet) {
            let initialBalance = 0;
            const ba = parseFloat(balanceAfter);
            if (Number.isFinite(ba) && ba >= 0) {
                initialBalance = ba;
            }
            await db.run(
                "INSERT INTO wallets (name, WalletNum, balance, Monthly_limit, daily_limit, walletProvider, merchant_id, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                ['', walletNum, initialBalance, 200000, 60000, provider || 'etisalat', null, 'Auto-created from transaction']
            );
            wallet = await db.get("SELECT id FROM wallets WHERE WalletNum = ?", [walletNum]);
            isNew = true;
            console.log(`[New] Auto-created wallet for ${walletNum} (provider: ${provider}, balance: ${initialBalance})`);
        }
        return { wallet, isNew };
    } catch (e) { return { wallet: null, isNew: false }; }
}

async function autoExecuteWalletOperation(walletNum, provider, type, amount, fee, balanceAfter, sourceTable, sourceTxId) {
    if (!walletNum || !amount) return;
    try {
        const { wallet, isNew } = await autoCreateWalletIfNeeded(walletNum, provider, type, amount, balanceAfter);
        if (!wallet) return;
        const cardId = wallet.id;
        const numAmount = parseFloat(amount);
        if (!Number.isFinite(numAmount) || numAmount <= 0) return;

        const txType = type === 'incoming' ? 'add_money' : 'pay';
        const txLabel = type === 'incoming' ? 'incoming' : 'outgoing';

        if (isNew) {
            const finalBalance = parseFloat(balanceAfter) || 0;
            const txResult = await db.run(
                `INSERT INTO wallet_transactions (card_id, user_id, transaction_type, note, price, adjustment_id, adjustment_type, adjustment_value, original_price, receipt_image, source_table, source_tx_id) VALUES (?, ?, ?, ?, ?, NULL, NULL, 0, ?, NULL, ?, ?)`,
                [cardId, 0, txType, `Auto: ${provider} ${txLabel} ${numAmount} EGP`, numAmount, numAmount, sourceTable || null, sourceTxId || null]
            );
            const limits = await db.get(`
                SELECT (daily_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = ? AND transaction_type IN ('pay', 'withdraw') AND DATE(created_at) = DATE('now')), 0)) as remaining_daily,
                       (Monthly_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = ? AND transaction_type IN ('pay', 'withdraw') AND strftime('%Y-%m', DATE(created_at)) = strftime('%Y-%m', 'now')), 0)) as remaining_monthly
                FROM wallets WHERE id = ?
            `, [cardId, cardId, cardId]);
            if (io) io.emit('wallet_transaction_added', { transaction: { id: txResult.lastID, card_id: cardId, user_id: 0, transaction_type: txType, note: `Auto: ${provider} ${txLabel} ${numAmount} EGP`, price: numAmount, created_at: new Date().toISOString() }, new_balance: finalBalance, new_daily_remaining: limits ? limits.remaining_daily : 0, new_monthly_remaining: limits ? limits.remaining_monthly : 0 });
            console.log(`[Money] Auto wallet new: ${txLabel} ${numAmount} EGP -> wallet #${cardId} (${walletNum}), balance: ${finalBalance}`);
            return;
        }

        const cardResult = await db.get('SELECT balance FROM wallets WHERE id = ?', [cardId]);
        const currentBalance = parseFloat(cardResult?.balance) || 0;

        let newBalance;
        if (type === 'incoming') {
            newBalance = currentBalance + numAmount;
        } else {
            if (currentBalance < numAmount) return;
            newBalance = currentBalance - numAmount;
        }

        await db.run('UPDATE wallets SET balance = ? WHERE id = ?', [newBalance, cardId]);
        const txResult = await db.run(
            `INSERT INTO wallet_transactions (card_id, user_id, transaction_type, note, price, adjustment_id, adjustment_type, adjustment_value, original_price, receipt_image, source_table, source_tx_id) VALUES (?, ?, ?, ?, ?, NULL, NULL, 0, ?, NULL, ?, ?)`,
            [cardId, 0, txType, `Auto: ${provider} ${txLabel} ${numAmount} EGP`, numAmount, numAmount, sourceTable || null, sourceTxId || null]
        );

        const walletMerchant = await db.get('SELECT merchant_id FROM wallets WHERE id = ?', [cardId]);
        if (walletMerchant && walletMerchant.merchant_id) {
            const mDiff = type === 'incoming' ? numAmount : -numAmount;
            await db.run('UPDATE merchants SET balance = balance + ? WHERE id = ?', [mDiff, walletMerchant.merchant_id]);
            const merchant = await db.get('SELECT * FROM merchants WHERE id = ?', [walletMerchant.merchant_id]);
            if (merchant) io.emit('merchant_updated', merchant);
        }

        const limits2 = await db.get(`
            SELECT (daily_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = ? AND transaction_type IN ('pay', 'withdraw') AND DATE(created_at) = DATE('now')), 0)) as remaining_daily,
                   (Monthly_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = ? AND transaction_type IN ('pay', 'withdraw') AND strftime('%Y-%m', DATE(created_at)) = strftime('%Y-%m', 'now')), 0)) as remaining_monthly
            FROM wallets WHERE id = ?
        `, [cardId, cardId, cardId]);
        if (io) io.emit('wallet_transaction_added', { transaction: { id: txResult.lastID, card_id: cardId, user_id: 0, transaction_type: txType, note: `Auto: ${provider} ${txLabel} ${numAmount} EGP`, price: numAmount, created_at: new Date().toISOString() }, new_balance: newBalance, new_daily_remaining: limits2 ? limits2.remaining_daily : 0, new_monthly_remaining: limits2 ? limits2.remaining_monthly : 0 });
        console.log(`[Money] Auto wallet ${txLabel}: ${type === 'incoming' ? '+' : '-'}${numAmount} EGP ${type === 'incoming' ? 'to' : 'from'} wallet #${cardId} (${walletNum})`);
    } catch (e) { }
}

async function processMessageWithRules(receiverNumber, senderNumber, messageText, receivedAt) {
    try {
        const rules = await db.all("SELECT * FROM analysis_rules WHERE enabled = 1");
        if (!rules || rules.length === 0) return null;

        // تحميل المزودين المفعّلين من جدول transfer_providers
        const activeProviders = await db.all("SELECT provider_key, enabled FROM transfer_providers");
        const providerMap = {};
        activeProviders.forEach(p => { providerMap[p.provider_key] = p.enabled; });

        for (const rule of rules) {
            // التحقق من تفعيل المزود من جدول transfer_providers (افتراضياً مشغل إلا لو معطل يدوي)
            if (providerMap[rule.provider] === 0) continue;

            // التحقق من هيدر المرسل (اسم الراسل)
            if (rule.header_pattern) {
                const headerRegex = new RegExp(rule.header_pattern, 'i');
                if (!headerRegex.test(senderNumber)) continue;
            }

            const regex = new RegExp(rule.regex_pattern);
            const match = messageText.match(regex);
            if (!match) continue;

            const fields = JSON.parse(rule.field_mappings || '[]');
            const extracted = {};
            fields.forEach(f => {
                const val = match[f.group];
                if (val !== undefined) {
                    extracted[f.name] = f.type === 'float' ? parseFloat(String(val).replace(/,/g, '')) : val;
                }
            });

            // نتائج المعاملة لإرسالها للهاتف
            const txResult = {
                provider: rule.provider,
                type: rule.type,
                amount: extracted.amount || null,
                sender_name: extracted.sender_name || null,
                sender_number: extracted.sender_number || null,
                receiver_number: extracted.receiver_number || null,
                transfer_fee: extracted.transfer_fee || null,
                balance_after: extracted.balance_after || null,
                message_text: messageText
            };

            // التوجيه للجدول المناسب حسب المزود والنوع
            const fingerprint = crypto.createHash('md5')
                .update(`${messageText}-${receivedAt}-${rule.provider}-${rule.type}`)
                .digest('hex');

            let isNewTransaction = false;

            if (rule.provider === 'etisalat' && rule.type === 'incoming') {
                const result = await db.run(
                    `INSERT OR IGNORE INTO etisalat_payments (amount, sender_number, receiver_number, sender_name, balance_after, message_text, received_at, fingerprint) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [extracted.amount, extracted.sender_number, receiverNumber, extracted.sender_name, extracted.balance_after, messageText, receivedAt, fingerprint]
                );
                if (result.changes > 0) {
                    isNewTransaction = true;
                    const newPayment = { id: result.lastID, amount: extracted.amount, sender_number: extracted.sender_number, sender_name: extracted.sender_name, receiver_number: receiverNumber, balance_after: extracted.balance_after, message_text: messageText, received_at: receivedAt, created_at: new Date().toISOString(), forwarded: 0, confirmed: 0, forwarded_at: null };
                    if (io) io.emit("etisalat-new-payment", newPayment);
                    console.log(`[Money] e& money payment detected: ${extracted.amount} EGP from ${extracted.sender_number} (${extracted.sender_name})`);
                    await autoExecuteWalletOperation(receiverNumber, 'etisalat', 'incoming', extracted.amount, extracted.transfer_fee, extracted.balance_after, 'etisalat_payments', result.lastID);
                    await autoForwardToTayercash('etisalat', 'incoming', extracted, receiverNumber, messageText, receivedAt, 'etisalat_payments', 'etisalat-payment-forwarded');
                }
            } else if (rule.provider === 'etisalat' && rule.type === 'outgoing') {
                const result = await db.run(
                    `INSERT OR IGNORE INTO etisalat_outgoing_transfers (amount, sender_number, receiver_number, transfer_fee, balance_after, message_text, received_at, fingerprint) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [extracted.amount, receiverNumber, extracted.receiver_number, extracted.transfer_fee, extracted.balance_after, messageText, receivedAt, fingerprint]
                );
                if (result.changes > 0) {
                    isNewTransaction = true;
                    const newTransfer = { id: result.lastID, amount: extracted.amount, sender_number: receiverNumber, receiver_number: extracted.receiver_number, transfer_fee: extracted.transfer_fee, balance_after: extracted.balance_after, message_text: messageText, received_at: receivedAt, forwarded: 0, confirmed: 0, forwarded_at: null, created_at: new Date().toISOString() };
                    if (io) io.emit("etisalat-new-outgoing", newTransfer);
                    console.log(`[Out] e& money outgoing transfer: ${extracted.amount} EGP to ${extracted.receiver_number}, fee: ${extracted.transfer_fee} EGP`);
                    await autoExecuteWalletOperation(receiverNumber, 'etisalat', 'outgoing', extracted.amount, extracted.transfer_fee, extracted.balance_after, 'etisalat_outgoing_transfers', result.lastID);
                    await autoForwardToTayercash('etisalat', 'outgoing', extracted, receiverNumber, messageText, receivedAt, 'etisalat_outgoing_transfers', 'etisalat-outgoing-forwarded');
                }
            } else if (rule.provider === 'vodafone' && rule.type === 'incoming') {
                const result = await db.run(
                    `INSERT OR IGNORE INTO vodafone_payments (amount, sender_number, receiver_number, sender_name, balance_after, message_text, received_at, fingerprint) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [extracted.amount, extracted.sender_number, receiverNumber, extracted.sender_name, extracted.balance_after, messageText, receivedAt, fingerprint]
                );
                if (result.changes > 0) {
                    isNewTransaction = true;
                    const newPayment = { id: result.lastID, amount: extracted.amount, sender_number: extracted.sender_number, sender_name: extracted.sender_name, receiver_number: receiverNumber, balance_after: extracted.balance_after, message_text: messageText, received_at: receivedAt, created_at: new Date().toISOString(), forwarded: 0, confirmed: 0, forwarded_at: null };
                    if (io) io.emit("vodafone-new-payment", newPayment);
                    console.log(`[Money] Vodafone Cash payment detected: ${extracted.amount} EGP from ${extracted.sender_number} (${extracted.sender_name})`);
                    await autoExecuteWalletOperation(receiverNumber, 'vodafone', 'incoming', extracted.amount, extracted.transfer_fee, extracted.balance_after, 'vodafone_payments', result.lastID);
                    await autoForwardToTayercash('vodafone', 'incoming', extracted, receiverNumber, messageText, receivedAt, 'vodafone_payments', 'vodafone-payment-forwarded');
                }
            } else if (rule.provider === 'vodafone' && rule.type === 'outgoing') {
                const result = await db.run(
                    `INSERT OR IGNORE INTO vodafone_outgoing_transfers (amount, sender_number, receiver_number, transfer_fee, balance_after, message_text, received_at, fingerprint) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [extracted.amount, receiverNumber, extracted.receiver_number, extracted.transfer_fee, extracted.balance_after, messageText, receivedAt, fingerprint]
                );
                if (result.changes > 0) {
                    isNewTransaction = true;
                    const newTransfer = { id: result.lastID, amount: extracted.amount, sender_number: receiverNumber, receiver_number: extracted.receiver_number, transfer_fee: extracted.transfer_fee, balance_after: extracted.balance_after, message_text: messageText, received_at: receivedAt, forwarded: 0, confirmed: 0, forwarded_at: null, created_at: new Date().toISOString() };
                    if (io) io.emit("vodafone-new-outgoing", newTransfer);
                    console.log(`[Out] Vodafone Cash outgoing transfer: ${extracted.amount} EGP to ${extracted.receiver_number}, fee: ${extracted.transfer_fee} EGP`);
                    await autoExecuteWalletOperation(receiverNumber, 'vodafone', 'outgoing', extracted.amount, extracted.transfer_fee, extracted.balance_after, 'vodafone_outgoing_transfers', result.lastID);
                    await autoForwardToTayercash('vodafone', 'outgoing', extracted, receiverNumber, messageText, receivedAt, 'vodafone_outgoing_transfers', 'vodafone-outgoing-forwarded');
                }
            } else {
                // قاعدة مخصصة - حفظ في جدول النتائج العام
                isNewTransaction = true;
                await db.run(
                    `INSERT INTO analysis_results (rule_id, rule_name, message_text, provider, type, extracted_data, matched_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [rule.id, rule.name, messageText, rule.provider, rule.type, JSON.stringify(extracted), receivedAt]
                );
                console.log(`[Chart] Custom rule matched: ${rule.name}`, extracted);
            }

            if (!isNewTransaction) return null;
            return txResult;
        }
    } catch (err) {
        console.error(`[X] Error in processMessageWithRules:`, err.message);
    }
    return null;
}

// دالة مساعدة للإرسال التلقائي إلى Tayercash
async function forwardToServers(body) {
    const servers = await db.all("SELECT * FROM forward_servers WHERE enabled = 1");
    if (!servers || servers.length === 0) return { success: false, error: 'No forward servers configured', results: [] };
    let anySuccess = false;
    const results = [];
    for (const server of servers) {
        const sentAt = new Date().toISOString();
        try {
            var fwdUrl = server.url.replace(/\/+$/, '');
            let sendBody = body;
            const encKey = DEFAULT_WEBHOOK_KEY + (server.encryption_key || '');
            sendBody = JSON.stringify({ encrypted: true, data: xorEncrypt(body, encKey) });
            const httpResult = await httpRequest(fwdUrl, 'POST', sendBody, server.token || '');
            const receivedAt = new Date().toISOString();
            const resp = httpResult.response || {};
            const isSuccess = resp.success === true || (resp._statusCode >= 200 && resp._statusCode < 300);
            results.push({
                name: server.name,
                url: server.url,
                sent_at: sentAt,
                received_at: receivedAt,
                success: isSuccess,
                error: isSuccess ? null : (resp.error || httpResult.statusMessage || 'no response'),
                request: httpResult.request || null,
                response: resp,
                statusCode: httpResult.statusCode,
                statusMessage: httpResult.statusMessage
            });
            if (isSuccess) anySuccess = true;
        } catch (e) {
            const receivedAt = new Date().toISOString();
            results.push({ name: server.name, url: server.url, success: false, error: e.message, sent_at: sentAt, received_at: receivedAt, request: null, response: null });
        }
    }
    return { success: anySuccess, results };
}

async function autoForwardToTayercash(provider, type, extracted, receiverNumber, messageText, receivedAt, tableName, eventName, rowId) {
    try {
        // تحقق من تفعيل الإرسال للسيرفر الخارجي (master switch)
        const masterEnabled = await db.get("SELECT value FROM settings WHERE key = 'forward_master_enabled'");
        if (masterEnabled && masterEnabled.value === '0') {
            console.log(`[Timer] Forward to external server disabled globally.`);
            return;
        }

        const providerRow = await db.get("SELECT auto_forward FROM transfer_providers WHERE provider_key = ?", [provider]);
        if (providerRow && providerRow.auto_forward === 0) {
            console.log(`[Timer] Auto-forward disabled for ${provider}, saving locally only.`);
            return;
        }

        const servers = await db.all("SELECT * FROM forward_servers WHERE enabled = 1");
        if (!servers || servers.length === 0) return;

        const body = JSON.stringify({
            type: type,
            provider: provider,
            amount: extracted.amount,
            sender_number: type === 'incoming' ? extracted.sender_number : receiverNumber,
            sender_name: extracted.sender_name || '',
            receiver_number: type === 'outgoing' ? extracted.receiver_number : receiverNumber,
            transfer_fee: extracted.transfer_fee || 0,
            balance_after: extracted.balance_after,
            received_at: receivedAt,
            message_text: messageText
        });

        for (const server of servers) {
            try {
                var fwdUrl = server.url.replace(/\/+$/, '');
                let sendBody = body;
                const encKey = DEFAULT_WEBHOOK_KEY + (server.encryption_key || '');
                sendBody = JSON.stringify({ encrypted: true, data: xorEncrypt(body, encKey) });
                const result = await httpRequest(fwdUrl, 'POST', sendBody, server.token || '');
                const resp = result.response || {};
                const isSuccess = resp.success === true || (resp._statusCode >= 200 && resp._statusCode < 300);
                if (isSuccess) {
                    const targetId = rowId || (await db.get(`SELECT id FROM ${tableName} ORDER BY id DESC LIMIT 1`))?.id;
                    if (targetId) {
                        await db.run(`UPDATE ${tableName} SET forwarded = 1, forwarded_at = datetime('now'), confirmed = 1 WHERE id = ?`, [targetId]);
                        if (io) io.emit(eventName, { id: targetId, forwarded: 1, confirmed: 1 });
                    }
                    console.log(`[OK] ${provider} ${type} forwarded to "${server.name}" successfully`);
                } else {
                    console.warn(`[!] "${server.name}" returned error: ${resp.error || result.statusMessage || 'no response'}`);
                }
            } catch (e) {
                console.warn(`[!] Failed to forward to "${server.name}": ${e.message}`);
            }
        }
    } catch (err) {
        console.warn(`[!] Failed to forward to external server: ${err.message}`);
    }
}

function xorEncrypt(text, key) {
    const buf = Buffer.from(text, 'utf8');
    const keyBuf = Buffer.from(key, 'utf8');
    const out = Buffer.alloc(buf.length);
    for (let i = 0; i < buf.length; i++) {
        out[i] = buf[i] ^ keyBuf[i % keyBuf.length];
    }
    return out.toString('base64');
}

function xorDecrypt(encoded, key) {
    const buf = Buffer.from(encoded, 'base64');
    const keyBuf = Buffer.from(key, 'utf8');
    const out = Buffer.alloc(buf.length);
    for (let i = 0; i < buf.length; i++) {
        out[i] = buf[i] ^ keyBuf[i % keyBuf.length];
    }
    return out.toString('utf8');
}

function httpRequest(url, method, body, authToken) {
    return new Promise((resolve, reject) => {
        if (!/^https?:\/\//i.test(url)) url = 'http://' + url;
        const urlObj = new URL(url);
        const mod = urlObj.protocol === 'https:' ? https : http;
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = 'Bearer ' + authToken;
        if (body) headers['Content-Length'] = Buffer.byteLength(body);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: method || 'GET',
            timeout: 10000,
            headers: headers
        };

        const requestInfo = {
            method: options.method,
            url: url,
            headers: { ...headers },
            body: body ? (() => { try { return JSON.parse(body); } catch (e) { return body; } })() : null
        };

        if (mod === https) options.rejectUnauthorized = false;
        const req = mod.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    parsed._statusCode = res.statusCode;
                    parsed._statusMessage = res.statusMessage;
                    resolve({ request: requestInfo, response: parsed, statusCode: res.statusCode, statusMessage: res.statusMessage });
                } catch (e) {
                    resolve({ request: requestInfo, response: { raw: data.substring(0, 500) }, statusCode: res.statusCode, statusMessage: res.statusMessage, success: false, error: data.substring(0, 200) });
                }
            });
        });
        req.on('error', (e) => reject(e));
        req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
        if (body) req.write(body);
        req.end();
    });
}

function extractSenderFromPDU(pduHex) {
    try {
        // 1. تخطي رقم مركز الخدمة (Service Center)
        // أول بايت يحدد طول رقم المركز
        let smscLen = parseInt(pduHex.substring(0, 2), 16);
        let startAfterSMSC = (smscLen + 1) * 2;

        // 2. الوصول لبداية رقم الراسل
        // بعد الـ SMSC بـ 2 بايت (بايت النوع)
        let senderLenHex = pduHex.substring(startAfterSMSC + 2, startAfterSMSC + 4);
        let senderLen = parseInt(senderLenHex, 16); // طول الرقم/الاسم

        let senderType = pduHex.substring(startAfterSMSC + 4, startAfterSMSC + 6);
        let senderData = pduHex.substring(startAfterSMSC + 6, startAfterSMSC + 6 + (senderLen % 2 === 0 ? senderLen : senderLen + 1));

        // إذا كان النوع 91 (رقم دولي) أو 81 (رقم محلي)
        if (senderType === "91" || senderType === "81") {
            let number = "";
            for (let i = 0; i < senderData.length; i += 2) {
                // عكس الخانات (Semi-octet)
                number += senderData[i + 1] + senderData[i];
            }
            if (number.endsWith("F") || number.endsWith("f")) number = number.slice(0, -1);
            return (senderType === "91" ? "+" : "") + number;
        }

        // إذا كان النوع D0 (اسم نصي مشفر مثل e& money)
        if (senderType === "D0") {
            // أسماء الشركات تكون مشفرة GSM 7-bit
            return decode7BitPacked(senderData);
        }

        return "Unknown";
    } catch (e) {
        console.error("Error extracting sender:", e);
        return "Error";
    }
}

function normalizeTimestampDigits(str) {
    if (!str) return str;
    return str.replace(/[٠١٢٣٤٥٦٧٨٩]/g, function (c) {
        return String.fromCharCode(c.charCodeAt(0) - 0x0660 + 48);
    });
}

function extractTimestampFromPDU(pduHex) {
    try {
        // 1. تخطي رقم مركز الخدمة (SMSC)
        let smscLen = parseInt(pduHex.substring(0, 2), 16);
        let pos = (smscLen + 1) * 2;

        // 2. تخطي بايت النوع (First byte of SMS-DELIVER)
        pos += 2;

        // 3. تخطي رقم الراسل (Sender Address)
        let senderLenHex = pduHex.substring(pos, pos + 2);
        let senderLen = parseInt(senderLenHex, 16);
        // الطول يحسب بعدد الأرقام، فإذا كان فردياً نضيف 1 للحساب بالبايت
        let senderDigits = (senderLen % 2 === 0) ? senderLen : senderLen + 1;
        pos += 4 + senderDigits; // 2 بايت للطول والنوع + بايتات الرقم

        // 4. تخطي بايتات البروتوكول (TP-PID) والتشفير (TP-DCS)
        pos += 4;

        // 5. استخراج الـ 7 بايتات الخاصة بالتاريخ (SCTS)
        // الترتيب: السنة، الشهر، اليوم، الساعة، الدقيقة، الثانية، التوقيت الزمني
        let scts = pduHex.substring(pos, pos + 14);

        const swap = (hex) => hex[1] + hex[0];

        let year = "20" + swap(scts.substring(0, 2));
        let month = swap(scts.substring(2, 4));
        let day = swap(scts.substring(4, 6));
        let hour = swap(scts.substring(6, 8));
        let min = swap(scts.substring(8, 10));
        let sec = swap(scts.substring(10, 12));

        return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
    } catch (e) {
        console.error("Error extracting timestamp:", e);
        return new Date().toISOString().replace('T', ' ').split('.')[0];
    }
}

function fixSender(rawDecoded) {
    let result = "";
    let i = 0;

    // تحويل السلسلة الرقمية إلى نص مقروء
    while (i < rawDecoded.length) {
        let triple = parseInt(rawDecoded.substr(i, 3));
        if (triple >= 100 && triple <= 126) {
            result += String.fromCharCode(triple);
            i += 3;
        } else {
            let double = parseInt(rawDecoded.substr(i, 2));
            if (double >= 32 && double <= 99) {
                result += String.fromCharCode(double);
            }
            i += 2;
        }
    }

    // تنظيف أي رموز غير مقروءة ناتجة عن بداية السلسلة
    let finalName = result.replace(/[\x00-\x1F\x7F]/g, "").trim();

    // إذا نجح الفك وظهرت حروف، نعيد الاسم، وإلا نعيد الرقم الأصلي
    return (/[A-Za-z]/.test(finalName)) ? finalName : rawDecoded;
}

// مسار مسح رسالة محددة بواسطة ID
app.post("/delete-message", authenticateToken, async (req, res) => {
    const { id } = req.body;
    try {
        if (!db) return res.status(500).json({ error: "Database not connected" });

        const message = await db.get('SELECT msgIndex, port FROM messages WHERE id = ?', [id]);

        if (!message) {
            return res.status(404).json({ success: false, message: "الرسالة غير موجودة" });
        }

        const modem = activeModems[message.port];

        if (modem && modem.port && message.msgIndex !== null) {
            // تفعيل المراقب لهذا المودم
            modem.pendingDelete = true;

            // إرسال الأمر
            modem.port.write(`AT+CMGD=${message.msgIndex}\r\n`);
            console.log(`[Hourglass] Attempting to delete from SIM... Port: ${message.port}, Index: ${message.msgIndex}`);
        } else {
            console.warn(`[!] Modem offline or index missing. Deleting from DB only.`);
        }

        // مسح من قاعدة البيانات
        await db.run('DELETE FROM messages WHERE id = ?', [id]);

        res.json({ success: true, message: "تم تنفيذ طلب الحذف" });

    } catch (err) {
        console.error("Delete Route Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});
// مسار مسح محادثة كاملة (اختياري)
app.post("/delete-conversation", async (req, res) => {
    const { sender, receiver } = req.body;
    try {
        if (db) {
            await db.run('DELETE FROM messages WHERE sender = ? AND receiver = ?', [sender, receiver]);
            io.emit("conversation-deleted", { sender, receiver });
            res.json({ success: true });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});
// هذا الأمر يمسح جميع الرسائل المقروءة والمستلمة من الشريحة دفعة واحدة
function clearAllSimMessages(portPath) {
    const modem = activeModems[portPath];
    if (modem && modem.port) {
        // AT+CMGD=1,4 تعني مسح كل الرسائل من الذاكرة
        modem.port.write(`AT+CMGD=1,4\r\n`);
        console.log(`[Broom] Full SIM cleanup started on ${portPath}`);
    }
}
app.post("/clear-sim", authenticateToken, isAdmin, (req, res) => {
    const { port } = req.body;
    if (activeModems[port]) {
        clearAllSimMessages(port);
        res.json({ success: true, message: "جاري تصفير الشريحة..." });
    } else {
        res.status(404).json({ error: "المودم غير متصل" });
    }
});

// ======================== Helper Functions ========================
function normalizeNumber(value) {
    if (typeof value === 'string') {
        const normalized = value.trim().replace(/\s+/g, '').replace(/,/g, '.').replace(/\$/g, '');
        const parsed = parseFloat(normalized);
        return Number.isFinite(parsed) ? parsed : NaN;
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : NaN;
    }
    return NaN;
}

async function calculateAdjustedAmount(originalPrice, adjustment_id, adjustment_type) {
    let transactionAmount = originalPrice;
    let adjustmentValue = 0;
    if (adjustment_id && adjustment_id !== "" && adjustment_id !== "null") {
        const adj = await db.get("SELECT percentage FROM adjustments WHERE id = ?", [adjustment_id]);
        if (adj) {
            adjustmentValue = (originalPrice * adj.percentage) / 100;
            if (adjustment_type === 'add') {
                transactionAmount = originalPrice + adjustmentValue;
            } else if (adjustment_type === 'deduct') {
                transactionAmount = originalPrice - adjustmentValue;
            }
        }
    }
    return { transactionAmount, adjustmentValue };
}

// ======================== Wallet Routes ========================

// Serve wallets page
app.get("/wallets", checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "assets/wallets.html"));
});

// Serve merchants page
app.get("/merchants", checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "assets/merchants.html"));
});

// Get all auto-executed wallet ops (for frontend sync)
app.get('/get_executed_wallet_ops', authenticateToken, async (req, res) => {
    try {
        const rows = await db.all(`
            SELECT wt.source_table, wt.source_tx_id, w.WalletNum
            FROM wallet_transactions wt
            JOIN wallets w ON w.id = wt.card_id
            WHERE wt.source_table IS NOT NULL AND wt.source_tx_id IS NOT NULL
        `);
        const ops = {};
        rows.forEach(r => {
            const key = r.source_table + ':' + r.source_tx_id + ':' + r.WalletNum;
            ops[key] = true;
        });
        res.json({ success: true, data: ops });
    } catch (err) {
        res.json({ success: true, data: {} });
    }
});

// List all wallets
app.get('/get_wallets', async (req, res) => {
    try {
        const filter = req.query.filter || 'all';
        let sql = `
            SELECT w.id, w.name, w.WalletNum, w.balance, w.Monthly_limit,
                   w.daily_limit, w.walletProvider, w.note, w.merchant_id,
                   w.reserved_until,
                   COALESCE(m.name, '') as merchant_name,
                   w.daily_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND DATE(created_at) = DATE('now')), 0) AS remaining_daily_limit,
                   w.Monthly_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND strftime('%Y-%m', DATE(created_at)) = strftime('%Y-%m', 'now')), 0) AS remaining_monthly_limit
            FROM wallets w
            LEFT JOIN merchants m ON w.merchant_id = m.id
            WHERE w.deleted = 0 OR w.deleted IS NULL
        `;
        if (filter === 'active_balance') {
            sql += ` AND w.balance > 0 `;
        }
        sql += ` ORDER BY w.WalletNum ASC`;
        const results = await db.all(sql);
        res.json({ success: true, data: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Create/Update wallet
app.post('/savewallet', authenticateToken, async (req, res) => {
    try {
        let { id, name, WalletNum, balance, Monthly_limit, daily_limit, walletProvider, note, merchant_id } = req.body || {};
        if (id && id !== "" && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin only to edit wallet' });
        }
        const numericMonthlyLimit = Number.isFinite(normalizeNumber(Monthly_limit)) ? normalizeNumber(Monthly_limit) : 0;
        const numericDailyLimit = Number.isFinite(normalizeNumber(daily_limit)) ? normalizeNumber(daily_limit) : 0;

        const getFullCardData = async (cardId) => {
            const row = await db.get(`
                SELECT w.*,
                       COALESCE(m.name, '') as merchant_name,
                       w.daily_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND DATE(created_at) = DATE('now')), 0) AS remaining_daily_limit,
                       w.Monthly_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND strftime('%Y-%m', DATE(created_at)) = strftime('%Y-%m', 'now')), 0) AS remaining_monthly_limit
                FROM wallets w
                LEFT JOIN merchants m ON w.merchant_id = m.id
                WHERE w.id = ?
            `, [cardId]);
            return row;
        };

        const emitMerchantUpdate = async (mId) => {
            if (!mId) return;
            const row = await db.get(`
                SELECT m.*, (SELECT COUNT(*) FROM wallets WHERE merchant_id = m.id) as linked_wallets_count
                FROM merchants m WHERE m.id = ?
            `, [mId]);
            if (row) { io.emit('merchant_updated', row); }
        };

        let oldMerchantId = null;
        if (id && id !== "") {
            const oldWallet = await db.get('SELECT merchant_id FROM wallets WHERE id = ?', [id]);
            if (oldWallet) oldMerchantId = oldWallet.merchant_id;
            const newMerchantId = req.body.merchant_id || null;
            await db.run(
                `UPDATE wallets SET name=?, WalletNum=?, Monthly_limit=?, daily_limit=?, walletProvider=?, merchant_id=?, note=? WHERE id=?`,
                [name, WalletNum, numericMonthlyLimit, numericDailyLimit, walletProvider, newMerchantId, note, id]
            );
            const updatedCard = await getFullCardData(id);
            io.emit('wallet_updated', updatedCard);
            if (oldMerchantId !== newMerchantId) {
                await emitMerchantUpdate(oldMerchantId);
                await emitMerchantUpdate(newMerchantId);
            } else {
                await emitMerchantUpdate(newMerchantId);
            }
            return res.json({ success: true, message: "Updated successfully", card: updatedCard });
        } else {
            const existingDeleted = await db.get('SELECT id FROM wallets WHERE WalletNum = ? AND deleted = 1', [WalletNum]);
            if (existingDeleted) {
                const newMerchantId = req.body.merchant_id || null;
                await db.run(
                    `UPDATE wallets SET name=?, balance=?, Monthly_limit=?, daily_limit=?, walletProvider=?, merchant_id=?, note=?, deleted=0 WHERE id=?`,
                    [name, normalizeNumber(balance) || 0, numericMonthlyLimit, numericDailyLimit, walletProvider, newMerchantId, note, existingDeleted.id]
                );
                const restoredCard = await getFullCardData(existingDeleted.id);
                io.emit('wallet_updated', restoredCard);
                await emitMerchantUpdate(newMerchantId);
                return res.json({ success: true, message: "Wallet restored", card: restoredCard });
            }
            const initialBalance = normalizeNumber(balance) || 0;
            const newMerchantId = req.body.merchant_id || null;
            const result = await db.run(
                `INSERT INTO wallets (name, WalletNum, balance, Monthly_limit, daily_limit, walletProvider, merchant_id, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, WalletNum, initialBalance, numericMonthlyLimit, numericDailyLimit, walletProvider, newMerchantId, note]
            );
            const newCard = await getFullCardData(result.lastID);
            io.emit('wallet_updated', newCard);
            await emitMerchantUpdate(newMerchantId);
            return res.json({ success: true, message: "Added successfully", card: newCard });
        }
    } catch (err) {
        console.error("savewallet error:", err.message);
        if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ success: false, error: "Wallet number already exists" });
        }
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Soft delete wallet (mark as deleted)
app.post('/delete_wallet', authenticateToken, async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ success: false, error: 'wallet id required' });
        const wallet = await db.get('SELECT id, WalletNum FROM wallets WHERE id = ?', [id]);
        if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' });
        await db.run('UPDATE wallets SET deleted = 1 WHERE id = ?', [id]);
        io.emit('wallet_deleted', { id: wallet.id, WalletNum: wallet.WalletNum });
        res.json({ success: true, message: 'Wallet deleted' });
    } catch (err) {
        console.error('delete_wallet error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Hard delete wallet (remove wallet and all its transactions)
app.post('/delete_wallet_hard', authenticateToken, async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ success: false, error: 'wallet id required' });
        const wallet = await db.get('SELECT id, WalletNum FROM wallets WHERE id = ?', [id]);
        if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' });
        await db.run('DELETE FROM wallet_transactions WHERE card_id = ?', [id]);
        await db.run('DELETE FROM wallets WHERE id = ?', [id]);
        io.emit('wallet_deleted', { id: wallet.id, WalletNum: wallet.WalletNum });
        res.json({ success: true, message: 'Wallet and all transactions deleted' });
    } catch (err) {
        console.error('delete_wallet_hard error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update wallet merchant only
app.post('/update_wallet_merchant', authenticateToken, async (req, res) => {
    try {
        const { wallet_id, merchant_id } = req.body;
        if (!wallet_id) return res.status(400).json({ success: false, error: 'wallet_id required' });
        const oldWallet = await db.get('SELECT merchant_id FROM wallets WHERE id = ?', [wallet_id]);
        if (!oldWallet) return res.status(404).json({ success: false, error: 'Wallet not found' });
        const oldMerchantId = oldWallet.merchant_id;
        const newMerchantId = merchant_id || null;
        await db.run('UPDATE wallets SET merchant_id = ? WHERE id = ?', [newMerchantId, wallet_id]);

        const getFullCardData = async (cardId) => {
            return await db.get(`
                SELECT w.*,
                       COALESCE(m.name, '') as merchant_name,
                       w.daily_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND DATE(created_at) = DATE('now')), 0) AS remaining_daily_limit,
                       w.Monthly_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND strftime('%Y-%m', DATE(created_at)) = strftime('%Y-%m', 'now')), 0) AS remaining_monthly_limit
                FROM wallets w LEFT JOIN merchants m ON w.merchant_id = m.id WHERE w.id = ?
            `, [cardId]);
        };
        const emitMerchantUpdate = async (mId) => {
            if (!mId) return;
            const row = await db.get('SELECT m.*, (SELECT COUNT(*) FROM wallets WHERE merchant_id = m.id) as linked_wallets_count FROM merchants m WHERE m.id = ?', [mId]);
            if (row) { io.emit('merchant_updated', row); }
        };
        const updatedCard = await getFullCardData(wallet_id);
        io.emit('wallet_updated', updatedCard);
        if (oldMerchantId) await emitMerchantUpdate(oldMerchantId);
        if (newMerchantId && newMerchantId != oldMerchantId) await emitMerchantUpdate(newMerchantId);
        res.json({ success: true, message: 'Merchant updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get single wallet details
app.get('/get_wallet_details/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const row = await db.get("SELECT * FROM wallets WHERE id = ?", [req.params.id]);
        if (row) {
            res.json({ success: true, data: row });
        } else {
            res.status(404).json({ success: false, error: "Wallet not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Add wallet balance
app.post('/add_wallet_balance', authenticateToken, async (req, res) => {
    try {
        const { card_id, amount, note } = req.body || {};
        if (!card_id || !amount) {
            return res.status(400).json({ success: false, error: 'card_id and amount required' });
        }
        const transactionAmount = normalizeNumber(amount);
        if (!Number.isFinite(transactionAmount) || transactionAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Amount must be > 0' });
        }

        const cardResult = await db.get('SELECT balance FROM wallets WHERE id = ?', [card_id]);
        if (!cardResult) {
            return res.status(404).json({ success: false, error: 'Wallet not found' });
        }
        const currentBalance = normalizeNumber(cardResult.balance) || 0;
        const newBalance = currentBalance + transactionAmount;
        await db.run('UPDATE wallets SET balance = ? WHERE id = ?', [newBalance, card_id]);

        const walletData = await db.get('SELECT merchant_id FROM wallets WHERE id = ?', [card_id]);
        if (walletData && walletData.merchant_id) {
            const merchantId = walletData.merchant_id;
            await db.run('UPDATE merchants SET balance = balance + ? WHERE id = ?', [transactionAmount, merchantId]);
            await db.run('INSERT INTO merchant_transactions (merchant_id, user_id, transaction_type, note, amount) VALUES (?, ?, ?, ?, ?)',
                [merchantId, req.user.id, 'wallet_sync', 'Deposit from wallet: ' + card_id + ' | ' + (note || ''), transactionAmount]);
            const merchant = await db.get('SELECT * FROM merchants WHERE id = ?', [merchantId]);
            io.emit('merchant_updated', merchant);
        }

        const result = await db.run(
            `INSERT INTO wallet_transactions (card_id, user_id, transaction_type, note, price) VALUES (?, ?, 'add_money', ?, ?)`,
            [card_id, req.user.id, note || '', transactionAmount]
        );

        const transactionData = {
            id: result.lastID, card_id: parseInt(card_id), user_id: req.user.id,
            transaction_type: 'add_money', note: note || '', price: transactionAmount,
            created_at: new Date().toISOString(), username: req.user.username
        };

        const limits = await db.get(`
            SELECT (daily_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = ? AND transaction_type IN ('pay', 'withdraw') AND DATE(created_at) = DATE('now')), 0)) as remaining_daily,
                   (Monthly_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = ? AND transaction_type IN ('pay', 'withdraw') AND strftime('%Y-%m', DATE(created_at)) = strftime('%Y-%m', 'now')), 0)) as remaining_monthly
            FROM wallets WHERE id = ?
        `, [card_id, card_id, card_id]);

        io.emit('wallet_transaction_added', {
            transaction: transactionData,
            new_balance: newBalance,
            new_daily_remaining: limits ? limits.remaining_daily : 0,
            new_monthly_remaining: limits ? limits.remaining_monthly : 0
        });

        return res.json({
            success: true, message: "Balance added successfully",
            transaction: transactionData, new_balance: newBalance
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Edit wallet balance (admin direct override)
app.post('/edit_wallet_balance', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin only' });
        }
        const { card_id, new_balance } = req.body || {};
        if (!card_id) {
            return res.status(400).json({ success: false, error: 'card_id required' });
        }
        const parsedBalance = normalizeNumber(new_balance);
        if (!Number.isFinite(parsedBalance) || parsedBalance < 0) {
            return res.status(400).json({ success: false, error: 'Balance must be >= 0' });
        }

        const card = await db.get('SELECT id, balance, merchant_id FROM wallets WHERE id = ?', [card_id]);
        if (!card) {
            return res.status(404).json({ success: false, error: 'Wallet not found' });
        }

        const oldBalance = normalizeNumber(card.balance) || 0;
        const diff = parsedBalance - oldBalance;

        await db.run('UPDATE wallets SET balance = ? WHERE id = ?', [parsedBalance, card_id]);

        if (card.merchant_id && diff !== 0) {
            await db.run('UPDATE merchants SET balance = balance + ? WHERE id = ?', [diff, card.merchant_id]);
            const merchant = await db.get('SELECT * FROM merchants WHERE id = ?', [card.merchant_id]);
            if (merchant) io.emit('merchant_updated', merchant);
        }

        const updatedCard = await db.get(`
            SELECT w.*, COALESCE(m.name, '') as merchant_name,
                   w.daily_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND DATE(created_at) = DATE('now')), 0) AS remaining_daily_limit,
                   w.Monthly_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND strftime('%Y-%m', DATE(created_at)) = strftime('%Y-%m', 'now')), 0) AS remaining_monthly_limit
            FROM wallets w LEFT JOIN merchants m ON w.merchant_id = m.id WHERE w.id = ?
        `, [card_id]);

        io.emit('wallet_updated', updatedCard);

        return res.json({ success: true, message: 'Balance updated', new_balance: parsedBalance, card: updatedCard });
    } catch (err) {
        console.error('edit_wallet_balance error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Wallet transaction (payment/deduction)
app.post('/wallet_transaction', authenticateToken, async (req, res) => {
    try {
        const { card_id, note, price } = req.body || {};
        if (!card_id || !price) {
            return res.status(400).json({ success: false, error: 'card_id and price required' });
        }

        const transactionAmount = normalizeNumber(price);
        if (!Number.isFinite(transactionAmount) || transactionAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Price must be > 0' });
        }

        const card = await db.get(`
            SELECT w.name, w.balance, w.daily_limit, w.Monthly_limit,
                   (w.daily_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND DATE(created_at) = DATE('now')), 0)) AS remaining_daily,
                   (w.Monthly_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND strftime('%Y-%m', DATE(created_at)) = strftime('%Y-%m', 'now')), 0)) AS remaining_monthly
            FROM wallets w WHERE w.id = ?
        `, [card_id]);

        if (!card) {
            return res.status(404).json({ success: false, error: 'Wallet not found' });
        }

        const currentBalance = normalizeNumber(card.balance) || 0;
        const remainingDailyBefore = normalizeNumber(card.remaining_daily);
        const remainingMonthlyBefore = normalizeNumber(card.remaining_monthly);

        if (transactionAmount > currentBalance) {
            return res.status(400).json({ success: false, error: 'Insufficient balance. Balance: ' + currentBalance.toFixed(2) });
        }
        if (transactionAmount > remainingDailyBefore) {
            return res.status(400).json({ success: false, error: 'Daily limit exceeded. Remaining: ' + remainingDailyBefore.toFixed(2) });
        }
        if (transactionAmount > remainingMonthlyBefore) {
            return res.status(400).json({ success: false, error: 'Monthly limit exceeded. Remaining: ' + remainingMonthlyBefore.toFixed(2) });
        }

        const newBalance = currentBalance - transactionAmount;
        await db.run('UPDATE wallets SET balance = ? WHERE id = ?', [newBalance, card_id]);

        const walletData = await db.get('SELECT merchant_id FROM wallets WHERE id = ?', [card_id]);
        if (walletData && walletData.merchant_id) {
            const merchantId = walletData.merchant_id;
            await db.run('UPDATE merchants SET balance = balance - ? WHERE id = ?', [transactionAmount, merchantId]);
            await db.run('INSERT INTO merchant_transactions (merchant_id, user_id, transaction_type, note, amount) VALUES (?, ?, ?, ?, ?)',
                [merchantId, req.user.id, 'wallet_sync', 'Withdrawal from wallet: ' + card_id + ' | ' + (note || ''), -transactionAmount]);
            const merchant = await db.get('SELECT * FROM merchants WHERE id = ?', [merchantId]);
            io.emit('merchant_updated', merchant);
        }

        const result = await db.run(
            `INSERT INTO wallet_transactions (card_id, user_id, transaction_type, note, price) VALUES (?, ?, 'pay', ?, ?)`,
            [card_id, req.user.id, note || '', transactionAmount]
        );

        const transactionData = {
            id: result.lastID, card_id: parseInt(card_id), user_id: req.user.id,
            transaction_type: 'pay', note: note || '', price: transactionAmount,
            created_at: new Date().toISOString(), username: req.user.username
        };

        const limits = await db.get(`
            SELECT (daily_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = ? AND transaction_type IN ('pay', 'withdraw') AND DATE(created_at) = DATE('now')), 0)) as remaining_daily,
                   (Monthly_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = ? AND transaction_type IN ('pay', 'withdraw') AND strftime('%Y-%m', DATE(created_at)) = strftime('%Y-%m', 'now')), 0)) as remaining_monthly
            FROM wallets WHERE id = ?
        `, [card_id, card_id, card_id]);

        io.emit('wallet_transaction_added', {
            transaction: transactionData,
            new_balance: newBalance,
            new_daily_remaining: limits ? limits.remaining_daily : 0,
            new_monthly_remaining: limits ? limits.remaining_monthly : 0
        });

        return res.json({
            success: true, message: "Payment processed successfully",
            transaction: transactionData, new_balance: newBalance
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get wallet transactions
app.get('/get_wallet_transactions/:card_id', async (req, res) => {
    try {
        const results = await db.all(
            `SELECT wt.*, u.username FROM wallet_transactions wt
             LEFT JOIN users u ON wt.user_id = u.id
             WHERE wt.card_id = ? ORDER BY wt.created_at DESC`,
            [req.params.card_id]
        );
        res.json({ success: true, data: results });
    } catch (err) {
        console.error("get_wallet_transactions error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete wallet transaction
app.post('/delete_wallet_transaction', authenticateToken, async (req, res) => {
    try {
        const { id } = req.body || {};
        if (!id) return res.status(400).json({ success: false, error: 'id required' });

        const tx = await db.get('SELECT * FROM wallet_transactions WHERE id = ?', [id]);
        if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });

        await db.run('DELETE FROM wallet_transactions WHERE id = ?', [id]);

        const limits = await db.get(`
            SELECT (daily_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = ? AND transaction_type IN ('pay', 'withdraw') AND DATE(created_at) = DATE('now')), 0)) as remaining_daily,
                   (Monthly_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = ? AND transaction_type IN ('pay', 'withdraw') AND strftime('%Y-%m', DATE(created_at)) = strftime('%Y-%m', 'now')), 0)) as remaining_monthly
            FROM wallets WHERE id = ?
        `, [tx.card_id, tx.card_id, tx.card_id]);

        io.emit('wallet_transaction_deleted', {
            id: id,
            card_id: tx.card_id,
            new_daily_remaining: limits ? limits.remaining_daily : 0,
            new_monthly_remaining: limits ? limits.remaining_monthly : 0
        });
        return res.json({ success: true, message: 'Transaction deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Import wallets from bulk data
app.post('/import_wallets', authenticateToken, isAdmin, async (req, res) => {
    const { wallets } = req.body || {};
    if (!Array.isArray(wallets) || wallets.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid data' });
    }
    try {
        let inserted = 0, updated = 0;
        for (const item of wallets) {
            const WalletNum = item.WalletNum ? item.WalletNum.toString().trim() : null;
            if (!WalletNum) continue;
            const name = item.name ? item.name.toString().trim() : 'No name';
            const walletProvider = item.walletProvider ? item.walletProvider.toString().trim() : null;
            const note = item.note ? item.note.toString().trim() : '';
            const balance = parseFloat(normalizeNumber(item.balance)) || 0;
            const m_limit = parseFloat(normalizeNumber(item.monthly_limit)) || 0;
            const d_limit = parseFloat(normalizeNumber(item.daily_limit)) || 0;
            const existing = await db.get('SELECT id FROM wallets WHERE WalletNum = ?', [WalletNum]);
            if (existing) {
                await db.run('UPDATE wallets SET name=?, balance=?, Monthly_limit=?, daily_limit=?, walletProvider=?, note=? WHERE WalletNum=?',
                    [name, balance, m_limit, d_limit, walletProvider, note, WalletNum]);
                updated++;
            } else {
                await db.run('INSERT INTO wallets (name, WalletNum, balance, Monthly_limit, daily_limit, walletProvider, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [name, WalletNum, balance, m_limit, d_limit, walletProvider, note]);
                inserted++;
            }
        }
        io.emit('wallet_updated');
        res.json({ success: true, inserted, updated });
    } catch (err) {
        console.error('Import wallets error:', err.message);
        res.status(500).json({ success: false, error: 'Database error during import' });
    }
});

// ======================== Merchant Routes ========================

// List merchants
app.get('/get_merchants', async (req, res) => {
    try {
        const results = await db.all(`
            SELECT m.*, (SELECT COUNT(*) FROM wallets WHERE merchant_id = m.id) as linked_wallets_count
            FROM merchants m ORDER BY m.name ASC
        `);
        res.json({ success: true, data: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get single merchant details
app.get('/get_merchant_details/:id', async (req, res) => {
    try {
        const row = await db.get(`
            SELECT m.*, (SELECT COUNT(*) FROM wallets WHERE merchant_id = m.id) as linked_wallets_count
            FROM merchants m WHERE m.id = ?
        `, [req.params.id]);
        if (row) {
            res.json({ success: true, data: row });
        } else {
            res.status(404).json({ success: false, error: 'Merchant not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Create/Update merchant
app.post('/save_merchant', authenticateToken, async (req, res) => {
    try {
        const { id, name, balance, note } = req.body || {};
        if (!name) return res.status(400).json({ success: false, error: 'Name required' });
        if (id && id !== "") {
            await db.run('UPDATE merchants SET name=?, note=? WHERE id=?', [name, note, id]);
            const updated = await db.get('SELECT * FROM merchants WHERE id=?', [id]);
            io.emit('merchant_updated', updated);
            res.json({ success: true, message: 'Updated successfully', merchant: updated });
        } else {
            const initialBalance = normalizeNumber(balance) || 0;
            const result = await db.run('INSERT INTO merchants (name, balance, note) VALUES (?, ?, ?)', [name, initialBalance, note]);
            const newMerchant = await db.get('SELECT * FROM merchants WHERE id=?', [result.lastID]);
            io.emit('merchant_updated', newMerchant);
            res.json({ success: true, message: 'Added successfully', merchant: newMerchant });
        }
    } catch (err) {
        console.error(err);
        if (err.code === 'SQLITE_CONSTRAINT') return res.status(400).json({ success: false, error: 'Merchant name already exists' });
        res.status(500).json({ success: false, error: err.message });
    }
});

// Adjust merchant balance
app.post('/adjust_merchant_balance', authenticateToken, async (req, res) => {
    try {
        const { merchant_id, amount, note } = req.body || {};
        if (!merchant_id || !amount) return res.status(400).json({ success: false, error: 'Missing data' });
        const adjustAmount = normalizeNumber(amount);
        if (!Number.isFinite(adjustAmount)) return res.status(400).json({ success: false, error: 'Invalid amount' });

        await db.run('UPDATE merchants SET balance = ROUND(balance + ?, 2) WHERE id = ?', [adjustAmount, merchant_id]);
        await db.run('INSERT INTO merchant_transactions (merchant_id, user_id, transaction_type, note, amount) VALUES (?, ?, ?, ?, ?)',
            [merchant_id, req.user.id, 'manual_adjustment', note || 'Manual adjustment', adjustAmount]);

        const updated = await db.get('SELECT * FROM merchants WHERE id=?', [merchant_id]);
        io.emit('merchant_updated', updated);
        res.json({ success: true, message: 'Balance adjusted', new_balance: updated.balance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get merchant transactions
app.get('/get_merchant_transactions/:id', authenticateToken, async (req, res) => {
    try {
        const results = await db.all(
            `SELECT mt.*, u.username FROM merchant_transactions mt
             LEFT JOIN users u ON mt.user_id = u.id
             WHERE mt.merchant_id = ? ORDER BY mt.created_at DESC`,
            [req.params.id]
        );
        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete merchant (keeps transactions)
app.post('/delete_merchant', authenticateToken, async (req, res) => {
    try {
        const { merchant_id } = req.body || {};
        if (!merchant_id) return res.status(400).json({ success: false, error: 'merchant_id required' });
        const merchant = await db.get('SELECT id, name FROM merchants WHERE id = ?', [merchant_id]);
        if (!merchant) return res.status(404).json({ success: false, error: 'Merchant not found' });

        // Disable FK constraints temporarily to preserve merchant_transactions
        await db.run('PRAGMA foreign_keys = OFF');
        try {
            await db.run('UPDATE merchant_transactions SET merchant_id = NULL WHERE merchant_id = ?', [merchant_id]);
            await db.run('UPDATE wallets SET merchant_id = NULL WHERE merchant_id = ?', [merchant_id]);
            await db.run('DELETE FROM merchants WHERE id = ?', [merchant_id]);
        } finally {
            await db.run('PRAGMA foreign_keys = ON');
        }

        io.emit('merchant_deleted', { id: merchant.id, name: merchant.name });
        res.json({ success: true, message: 'Merchant deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ======================== Adjustment Routes ========================

// List adjustments
app.get('/get_adjustments', authenticateToken, async (req, res) => {
    try {
        const results = await db.all("SELECT * FROM adjustments ORDER BY created_at DESC");
        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Create/Update adjustment
app.post('/save_adjustment', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id, name, percentage } = req.body;
        if (id) {
            await db.run("UPDATE adjustments SET name = ?, percentage = ? WHERE id = ?", [name, percentage, id]);
            io.emit('adjustments_updated');
            res.json({ success: true, message: "Updated successfully" });
        } else {
            await db.run("INSERT INTO adjustments (name, percentage) VALUES (?, ?)", [name, percentage]);
            io.emit('adjustments_updated');
            res.json({ success: true, message: "Added successfully" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete adjustment
app.post('/delete_adjustment', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.body;
        await db.run("DELETE FROM adjustments WHERE id = ?", [id]);
        io.emit('adjustments_updated');
        res.json({ success: true, message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ======================== Profit Routes ========================

// Get profit stats
app.get('/get_profit_stats', authenticateToken, async (req, res) => {
    try {
        const tables = ['wallet_transactions'];
        let totalOriginal = 0;
        let totalProfit = 0;
        for (const table of tables) {
            const row = await db.get(`
                SELECT COALESCE(SUM(original_price), 0) AS total_original,
                       COALESCE(SUM(adjustment_value), 0) AS total_profit
                FROM ${table}
            `);
            if (row) {
                totalOriginal += parseFloat(row.total_original) || 0;
                totalProfit += parseFloat(row.total_profit) || 0;
            }
        }
        const percentage = totalOriginal > 0 ? (totalProfit / totalOriginal) * 100 : 0;
        res.json({ success: true, total_original: totalOriginal, total_profit: totalProfit, profit_percentage: percentage });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get transaction profits
app.get('/api/transaction_profits', authenticateToken, async (req, res) => {
    try {
        const results = await db.all(`
            SELECT tp.*,
                   CASE WHEN tp.source_type = 'wallet' THEN w.name ELSE NULL END AS source_name
            FROM transaction_profits tp
            LEFT JOIN wallets w ON tp.source_type = 'wallet' AND tp.source_id = w.id
            ORDER BY tp.created_at DESC
        `);
        const totalRow = await db.get('SELECT COALESCE(SUM(profit_value), 0) AS total_profit FROM transaction_profits');
        res.json({ success: true, data: results, total_profit: parseFloat(totalRow.total_profit) || 0 });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ======================== Incoming Payments Routes ========================

// Receive payment from gateway (no auth - called from SMS gateway)
app.post("/api/incoming-payments/receive", async (req, res) => {
    try {
        const { type, amount, sender_number, sender_name, receiver_number, transfer_fee, balance_after, received_at, message_text } = req.body;
        if (!amount || !sender_number) {
            return res.status(400).json({ error: 'amount and sender_number required' });
        }
        const payType = (type || 'incoming').toString().trim().toLowerCase();
        let walletId = null;
        const phoneToSearch = payType === 'outgoing' ? sender_number : (receiver_number || sender_number);
        if (phoneToSearch) {
            const wallet = await db.get(
                "SELECT id FROM wallets WHERE REPLACE(WalletNum, '+', '') LIKE ? LIMIT 1",
                ['%' + phoneToSearch.slice(-10)]
            );
            if (wallet) walletId = wallet.id;
        }
        const result = await db.run(
            `INSERT INTO incoming_payments (type, amount, sender_number, sender_name, receiver_number, transfer_fee, balance_after, received_at, message_text, wallet_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [payType, amount, sender_number, sender_name || '', receiver_number || '', transfer_fee || 0, balance_after || 0, received_at || '', message_text || '', walletId]
        );
        console.log('Payment received: ' + amount + ' EGP from ' + sender_number + (walletId ? ' (wallet #' + walletId + ')' : ''));
        res.json({ success: true, message: 'Payment received', wallet_id: walletId, type: payType });
        (async () => {
            try {
                const newPayment = await db.get("SELECT * FROM incoming_payments WHERE id = ?", [result.lastID]);
                if (io && newPayment) io.emit('incoming_payment_received', newPayment);
            } catch (e) { console.error('Error emitting incoming_payment_received:', e); }
        })();
    } catch (err) {
        console.error('Error receiving payment:', err);
        res.status(500).json({ error: err.message });
    }
});

// List incoming payments
app.get("/api/incoming-payments/list", authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const offset = (page - 1) * limit;
        const payments = await db.all(`
            SELECT p.*, w.name AS wallet_name, w.WalletNum AS wallet_phone, u.username AS executed_by_username
            FROM incoming_payments p
            LEFT JOIN wallets w ON w.id = p.wallet_id
            LEFT JOIN users u ON u.id = p.executed_by
            ORDER BY p.created_at DESC LIMIT ? OFFSET ?
        `, [limit, offset]);
        const countResult = await db.get("SELECT COUNT(*) as count FROM incoming_payments");
        res.json({ success: true, payments, total: countResult.count, page, limit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get wallet total balance
app.get('/get_wallet_total_balance', async (req, res) => {
    try {
        const row = await db.get("SELECT COALESCE(SUM(balance), 0) as total FROM wallets");
        res.json({ success: true, total_balance: row.total });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ======================== Wallet Reservation API ========================
app.post('/api/wallets/reserve', async (req, res) => {
    try {
        const { merchant: merchantName, price, time } = req.body || {};
        if (!merchantName || !price || !time) {
            return res.status(400).json({ success: false, error: 'merchant, price, and time are required' });
        }
        const reservationAmount = parseFloat(price);
        const reservationMinutes = parseInt(time);
        if (!Number.isFinite(reservationAmount) || reservationAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid price' });
        }
        if (!Number.isFinite(reservationMinutes) || reservationMinutes <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid time' });
        }

        // Find or create merchant
        let merchant = await db.get("SELECT * FROM merchants WHERE name = ?", [merchantName]);
        if (!merchant) {
            const result = await db.run("INSERT INTO merchants (name, balance, note) VALUES (?, 0, ?)", [merchantName, 'Auto-created from reservation API']);
            merchant = await db.get("SELECT * FROM merchants WHERE id = ?", [result.lastID]);
        }

        // Find available wallet
        const candidates = await db.all(`
            SELECT w.*,
                w.daily_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions
                    WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw')
                    AND DATE(created_at) = DATE('now')), 0) AS remaining_daily,
                w.Monthly_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions
                    WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw')
                    AND strftime('%Y-%m', DATE(created_at)) = strftime('%Y-%m', 'now')), 0) AS remaining_monthly
            FROM wallets w
            WHERE (w.deleted = 0 OR w.deleted IS NULL)
                AND (w.merchant_id IS NULL OR w.merchant_id = ?)
            ORDER BY w.id ASC
        `, [merchant.id]);

        let selectedWallet = null;
        for (const w of candidates) {
            const rd = parseFloat(w.remaining_daily) || 0;
            const rm = parseFloat(w.remaining_monthly) || 0;
            if (rd < reservationAmount || rm < reservationAmount) continue;
            const activeRes = await db.get(
                "SELECT id FROM wallet_reservations WHERE wallet_id = ? AND status = 'active' AND expires_at > datetime('now') AND merchant_id != ? LIMIT 1",
                [w.id, merchant.id]
            );
            if (activeRes) continue;
            selectedWallet = w;
            break;
        }

        if (!selectedWallet) {
            return res.json({ success: false, error: 'No wallet available', reason: 'all_reserved' });
        }

        const expiresAt = new Date(Date.now() + reservationMinutes * 60000).toISOString();

        // If same merchant already has a reservation on this wallet, extend it
        const existingRes = await db.get(
            "SELECT id FROM wallet_reservations WHERE wallet_id = ? AND merchant_id = ? AND status = 'active' AND expires_at > datetime('now') LIMIT 1",
            [selectedWallet.id, merchant.id]
        );
        let reservationId;
        if (existingRes) {
            await db.run("UPDATE wallet_reservations SET expires_at = ?, amount = ? WHERE id = ?", [expiresAt, reservationAmount, existingRes.id]);
            reservationId = existingRes.id;
        } else {
            const ins = await db.run("INSERT INTO wallet_reservations (wallet_id, merchant_id, amount, expires_at) VALUES (?, ?, ?, ?)",
                [selectedWallet.id, merchant.id, reservationAmount, expiresAt]);
            reservationId = ins.lastID;
        }

        // Link wallet to merchant and set reserved_until
        await db.run("UPDATE wallets SET merchant_id = ?, reserved_until = ? WHERE id = ?",
            [merchant.id, expiresAt, selectedWallet.id]);

        // Fetch updated wallet for response and socket emit
        const updated = await db.get(`
            SELECT w.id, w.name, w.WalletNum, w.balance, w.Monthly_limit, w.daily_limit, w.walletProvider,
                   w.note, w.merchant_id, w.reserved_until,
                   COALESCE(m.name, '') as merchant_name,
                   w.daily_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND DATE(created_at) = DATE('now')), 0) AS remaining_daily_limit,
                   w.Monthly_limit - COALESCE((SELECT SUM(price) FROM wallet_transactions WHERE card_id = w.id AND transaction_type IN ('pay', 'withdraw') AND strftime('%Y-%m', DATE(created_at)) = strftime('%Y-%m', 'now')), 0) AS remaining_monthly_limit
            FROM wallets w LEFT JOIN merchants m ON w.merchant_id = m.id WHERE w.id = ?
        `, [selectedWallet.id]);
        if (io) io.emit('wallet_updated', updated);

        res.json({
            success: true,
            wallet: { id: selectedWallet.id, name: selectedWallet.name, number: selectedWallet.WalletNum },
            merchant: { id: merchant.id, name: merchant.name },
            reservation_id: reservationId,
            expires_at: expiresAt
        });
    } catch (err) {
        console.error('Error reserving wallet:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ======================== Wallet Release API ========================
app.post('/api/wallets/release', async (req, res) => {
    try {
        const { reservation_id, wallet_id } = req.body || {};
        if (!reservation_id && !wallet_id) {
            return res.status(400).json({ success: false, error: 'reservation_id or wallet_id is required' });
        }
        if (reservation_id) {
            const reservation = await db.get("SELECT * FROM wallet_reservations WHERE id = ? AND status = 'active'", [reservation_id]);
            if (!reservation) {
                return res.json({ success: true, message: 'Reservation already released or not found' });
            }
            await db.run("UPDATE wallet_reservations SET status = 'released' WHERE id = ?", [reservation_id]);
            await db.run("UPDATE wallets SET reserved_until = NULL WHERE id = ?", [reservation.wallet_id]);
            console.log(`[PhoneWallet] Reservation #${reservation_id} released (wallet #${reservation.wallet_id})`);
        } else if (wallet_id) {
            await db.run("UPDATE wallet_reservations SET status = 'released' WHERE wallet_id = ? AND status = 'active'", [wallet_id]);
            await db.run("UPDATE wallets SET reserved_until = NULL WHERE id = ?", [wallet_id]);
            console.log(`[PhoneWallet] All active reservations for wallet #${wallet_id} released`);
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error releasing wallet:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// مثال لاستعلام جلب المحادثات مع حالة القراءة لمستخدم معين
async function getConversations(userId) {
    return await db.all(`
        SELECT m.*, 
        (SELECT COUNT(*) FROM message_reads mr WHERE mr.message_id = m.id AND mr.user_id = ?) as is_read
        FROM messages m
        ORDER BY timestamp DESC
    `, [userId]);
}

function fixLanguageJunctions(text) {
    if (!text) return "";

    // 1. إضافة مسافة بين حرف إنجليزي/رقم يليه حرف عربي
    // [a-zA-Z0-9] -> إنجليزي أو رقم
    // [\u0600-\u06FF] -> نطاق الحروف العربية
    let fixedText = text.replace(/([a-zA-Z0-9])([\u0600-\u06FF])/g, '$1 $2');

    // 2. إضافة مسافة بين حرف عربي يليه حرف إنجليزي/رقم
    fixedText = fixedText.replace(/([\u0600-\u06FF])([a-zA-Z0-9])/g, '$1 $2');

    // 3. تنظيف المسافات المزدوجة التي قد تنتج عن العملية
    return fixedText.replace(/\s+/g, ' ').trim();
}



// --- Standalone HTTPS Server Startup ---
const httpsPort = 29001;
const certsDir = path.join(__dirname, 'certs');
ensureCertificates(certsDir);
const letsencryptCertPath = path.join(certsDir, 'letsencrypt_cert.pem');
const letsencryptKeyPath = path.join(certsDir, 'letsencrypt_key.pem');
let httpsOptions;
try {
    if (fs.existsSync(letsencryptCertPath) && fs.existsSync(letsencryptKeyPath)) {
        console.log("Using Let's Encrypt SSL certificate");
        httpsOptions = {
            key: fs.readFileSync(letsencryptKeyPath),
            cert: fs.readFileSync(letsencryptCertPath)
        };
    } else {
        httpsOptions = {
            key: fs.readFileSync(path.join(certsDir, 'server.key')),
            cert: fs.readFileSync(path.join(certsDir, 'server.crt'))
        };
    }
} catch (e) {
    console.error('Failed to load certificates for HTTPS:', e.message);
    httpsOptions = null;
}

if (!httpsOptions) {
    console.error('Failed to load SSL certificates. Cannot start HTTPS server.');
    process.exit(1);
}

const httpsServer = https.createServer(httpsOptions, app);
io = require('socket.io')(httpsServer, {
    cors: {
        origin: (origin, callback) => callback(null, true),
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingInterval: 5000,
    pingTimeout: 8000,
    connectTimeout: 10000,
    allowUpgrades: true,
    maxHttpBufferSize: 1e6,
    perMessageDeflate: false
});
_mainIo = io;
io.use(setupSocketIo);
io.on("connection", setupConnectionHandler);

noip_autoUpdateOnStartup();

const httpForAcme = require('http');
let port80Ready = false;
let acmePort = 80;
const httpAcmeServer = httpForAcme.createServer((req, res) => {
    if (req.url.startsWith('/.well-known/acme-challenge/') && _acmeChallenge && req.url === '/.well-known/acme-challenge/' + _acmeChallenge.token) {
        console.log('[ACME-HTTP] Serving challenge for:', _acmeChallenge.token);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(_acmeChallenge.keyAuthorization);
        return;
    }
    res.writeHead(301, { 'Location': 'https://' + req.headers.host + req.url });
    res.end();
});
httpAcmeServer.on('error', (err) => {
    if (err.code === 'EACCES' && acmePort === 80) {
        console.log('[SSL] Port 80 blocked (Android). Falling back to port 8080...');
        acmePort = 8080;
        httpAcmeServer.listen(8080, '0.0.0.0');
    } else if (err.code === 'EADDRINUSE') {
        console.error('[SSL] Port ' + acmePort + ' already in use.');
    } else {
        console.error('[SSL] ACME server error:', err.message);
    }
});
httpAcmeServer.listen(80, '0.0.0.0', () => {
    port80Ready = true;
    console.log('[SSL] ACME HTTP server running on port 80');
});
httpAcmeServer.on('listening', () => {
    port80Ready = true;
    console.log('[SSL] ACME HTTP server ready on port ' + acmePort);
    if (acmePort !== 80) {
        console.log('[SSL] Router must forward external port 80 → device port 8080');
    }
});

function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) return net.address;
        }
    }
    return '127.0.0.1';
}

function detectPublicIP() {
    return new Promise((resolve, reject) => {
        const https = require('https');
        https.get('https://api.ipify.org?format=json', { timeout: 5000 }, (res) => {
            let data = '';
            res.on('data', (c) => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data).ip); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

httpsServer.listen(httpsPort, '0.0.0.0', (err) => {
    if (err) {
        console.error('Failed to start HTTPS server:', err);
        return;
    }
    const localIP = getLocalIP();
    console.log(`HTTPS Server running on https://${localIP}:${httpsPort}`);
});

// HTTP server for local WebView access (avoids self-signed SSL issues on Android)
const httpLocalServer = http.createServer(app);
httpLocalServer.listen(29000, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`HTTP Server running on http://${localIP}:29000 (for local WebView access)`);
});
httpLocalServer.on('error', (err) => {
    console.error('Failed to start HTTP server on port 29000:', err.message);
});

