var socket;

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
        setupSocketEvents(socket);
    });

    socket.on("connect_error", (err) => {
        if (err.message === "Authentication error") {
            window.location.href = '/login';
        }
    });
}

connectToServer();
