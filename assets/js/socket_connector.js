var socket;
var failoverAttempted = false;

// دالة الاتصال الذكي (الدمج مع Failover)
function connectToBestServer() {
    const localUrl = "";
    const remoteUrl = "https://mousim.elbatal-app.com";
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // محاولة اللوكال أولاً
    socket = io(localUrl, {
        transports: ["polling", "websocket"],
        auth: { isStatusCheck: true },
        timeout: 3000,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000
    });

    socket.on("connect", () => {
        console.log("Using Local Connection");
        setupSocketEvents(socket);
    });

    socket.on("connect_error", (err) => {
        if (err.message !== "Authentication error") {
            if (isLocal || failoverAttempted) return;
            failoverAttempted = true;
            console.warn("Local failed, trying Remote...");
            socket.close();

            // التبديل للسيرفر الخارجي
            socket = io(remoteUrl, {
                transports: ["polling", "websocket"],
                auth: { isStatusCheck: true },
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 10000
            });
            setupSocketEvents(socket);
        } else {
            // إذا كان خطأ مصادقة من اللوكال، نتوجه لـ Login فوراً
            window.location.href = '/login';
        }
    });


}

connectToBestServer();
