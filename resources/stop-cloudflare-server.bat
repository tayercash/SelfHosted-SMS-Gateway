@echo off
:: الانتقال لمجلد السكريبت لضمان قراءة المسارات بشكل صحيح
cd /d "%~dp0"

:: فحص الصلاحيات
openfiles >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running with Administrator privileges.

    :: محاولة إيقاف الخدمة
    net stop cloudflared

    :: قتل العملية وشجرتها بالكامل بقوة
    taskkill /f /t /im cloudflared.exe

    :: بدلاً من pause، ننتظر 3 ثواني ثم نغلق لإبلاغ Electron بالانتهاء
    timeout /t 3
    exit /b 0
) else (
    echo [!] Requesting Administrator privileges...
    :: تشغيل نسخة جديدة كمسؤول وإغلاق الحالية فوراً
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b 0
)