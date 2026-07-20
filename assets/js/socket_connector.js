var socket;
var _eventsSetup = false;

function connectToServer() {
    socket = io("", {
        transports: ["polling", "websocket"],
        auth: { isStatusCheck: true },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000
    });

    socket.on("connect", () => {
        console.log("Connected Successfully");
        if (!_eventsSetup) {
            setupSocketEvents(socket);
            _eventsSetup = true;
        }
    });

    socket.on("connect_error", (err) => {
        if (err.message === "Authentication error") {
            window.location.href = '/login';
        }
    });
}

connectToServer();
