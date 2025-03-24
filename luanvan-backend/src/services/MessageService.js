const Message = require("../models/MessageModel");
const mongoose = require("mongoose");

const addChat = async (sender, receiver, content) => {
	return new Promise(async (resolve, reject) => {
		try {
			const chat = await Message.findOne({ members: { $all: [sender, receiver] } });

			if (chat) {
				await Message.findByIdAndUpdate(
					chat._id,
					{
						$push: {
							message: {
								sender: sender,
								content: content,
								timestamp: new Date(),
							},
						},
						isSeen: false,
						$slice: -50, // Chỉ giữ lại 50 tin nhắn mới nhất
					},
					{ new: true }
				);
			} else {
				// Tạo cuộc trò chuyện mới nếu chưa có
				await Message.create({
					members: [sender, receiver],
					message: [
						{
							content,
							sender,
							timestamp: new Date(),
						},
					],
				});
			}
			resolve({
				status: "SUCCESS",
			});
		} catch (error) {
			console.log("Error at addChat-service", error);
			reject(error);
		}
	});
};

const getChat = async (user1, user2) => {
	return new Promise(async (resolve, reject) => {
		try {
			const chat = await Message.findOne({ members: { $all: [user1, user2] } });

			if (chat) {
				await Message.findByIdAndUpdate(chat._id, { isSeen: true }, { new: true });
				resolve({
					status: "SUCCESS",
					message: "Lấy danh sách tin nhắn thành công!",
					data: chat,
				});
			} else {
				resolve({
					status: "ERROR",
					message: "Không có đoạn hội thoại nào",
				});
			}
		} catch (error) {
			console.log("Error at getChat-service", error);
			reject(error);
		}
	});
};

const getChatUnseen = async (idUser) => {
	return new Promise(async (resolve, reject) => {
		try {
			const chats = await Message.find({ members: idUser, isSeen: false });
			//result: mảng chứa các id của users đang chat với idUser
			const result = chats.map((chat) => chat.members.filter((member) => !member.equals(new mongoose.Types.ObjectId(idUser))));
			if (chats[0]?.isSeen) {
				resolve({
					status: "SUCCESS",
					message: "Lấy tất cả cuộc hội thoại chưa được xem.",
					data: result,
				});
			} else {
				resolve({
					status: "ERROR",
					message: "Không có đoạn hội thoại nào",
				});
			}
		} catch (error) {
			console.log("Error at getChatUnseen-service", error);
			reject(error);
		}
	});
};

module.exports = {
	addChat,
	getChat,
	getChatUnseen,
};
