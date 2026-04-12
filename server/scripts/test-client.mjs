import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected");

    // test sequence
    setTimeout(() => {
        console.log("testing start_game...");
        socket.emit("start_game");
    }, 500);

    setTimeout(() => {
        socket.emit("collision", { bumperId: 1 });
    }, 1500);

    setTimeout(() => {
        socket.emit("ball_lost");
    }, 3200);
});

socket.on("state_updated", (state) => {
    console.log("Update received:", state);
});