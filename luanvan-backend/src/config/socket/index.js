const { Server } = require("socket.io");

const productService = require("../../services/ProductService");
const orderService = require("../../services/OrderService");
const orderDetailService = require("../../services/OrderDetailService");
const ratingService = require("../../services/RatingService");
const messageService = require("../../services/MessageService");

// SOCKET.IO
const io = new Server({
	cors: {
		origin: "http://localhost:3006", //localhost fontend
	},
});

let onlineUsers = [];

const addNewUser = (userId, socketId) => {
	const existingUser = onlineUsers.find((user) => user.userId === userId);
	if (existingUser) {
		existingUser.socketId = socketId; // Cập nhật ID mới nếu user đã có trong danh sách
	} else {
		onlineUsers.push({ userId, socketId }); // Thêm user mới nếu chưa có
	}
};

const removeUser = (socketId) => {
	onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
	return onlineUsers.find((user) => user.userId === userId.toString());
};

const addChat = async (data) => {
	if (data.sender || data.receiver || data.content) {
		//lưu tin nhắn vào database
		await messageService.addChat(data.sender, data.receiver, data.content);
	}
};

const onConnection = (socket) => {
	const idUser = socket.handshake.query.idUser; //lấy idUser từ param
	if (idUser !== "null" && idUser !== undefined) {
		addNewUser(idUser, socket.id);
	}
	console.log("onlineUsers", onlineUsers.length);

	//gửi socket đển người nhận
	io.to(socket.id).emit("sendID", socket.id);

	//sendDataClient: lắng nghe data từ client
	//sendDataServer: phát data đó từ server đến tất cả các clients
	socket.on("sendMessageClient", function (data) {
		const receiverUser = getUser(data.receiver);
		console.log("receiverUser", receiverUser);

		addChat(data);
		//gửi socket đển người nhận
		if (receiverUser && receiverUser.socketId) {
			console.log("sended");

			io.to(receiverUser.socketId).emit("sendMessageServer", { data });
		}
	});

	socket.on("disconnect", (socket) => {
		removeUser(socket.id);
	});
};

productService.socket(io, getUser);
orderService.socket(io, getUser);
orderDetailService.socket(io, getUser);
ratingService.socket(io, getUser);

io.on("connection", onConnection);

io.listen(5000);

module.exports = { io };
