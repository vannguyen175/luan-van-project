const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
	members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
	message: [
		{
			sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Người gửi
			content: { type: String, required: true }, // Nội dung tin nhắn
			timestamp: { type: Date, default: Date.now }, // Thời gian gửi
		},
	],
	isSeen: { type: Boolean, require: true, default: false },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
