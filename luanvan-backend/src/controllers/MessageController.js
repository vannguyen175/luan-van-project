const MessageService = require("../services/MessageService");

const getChat = async (req, res) => {
	try {
		const { user1, user2 } = req.params; // Lấy dữ liệu từ body của yêu cầu
		const response = await MessageService.getChat(user1, user2);
		return res.status(200).json(response);
	} catch (error) {
		console.log("error at getChat controller: ", error);
		return res.status(404).json({ message: error });
	}
};

//update chat từ unseen thành seen
const getChatUnseen = async (req, res) => {
	try {
		const idUser = req.params.id; // Lấy dữ liệu từ body của yêu cầu
		const response = await MessageService.getChatUnseen(idUser);
		return res.status(200).json(response);
	} catch (error) {
		console.log("error at chatIsSeen controller: ", error);
		return res.status(404).json({ message: error });
	}
};
module.exports = {
	getChat,
	getChatUnseen,
};
