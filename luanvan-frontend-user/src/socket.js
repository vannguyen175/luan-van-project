import socketIOClient from "socket.io-client";

const host = "http://localhost:5000";

const idUser = localStorage.getItem("id_user");

const socket = socketIOClient.connect(host, {
	query: { idUser: idUser }, // Truyền userId vào query parameters
});

export default socket;
