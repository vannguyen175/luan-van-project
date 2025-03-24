const mongoose = require("mongoose");

//dùng để frontend chuyển hướng trang khi user click vào thông báo
// const NotiType = {
// 	0: "product",
// 	1: "seller",
// 	2: "order",

// };
const notificationSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

		info: [
			{
				seller: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				}, //ID_seller
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
				},
				image: { type: String },
				navigate: { type: String, require: true },
				message: { type: String, require: true },
				isSeen: { type: Boolean, require: true, default: false },
				timestamp: { type: Date, default: Date.now }, // Thời gian gửi
			},
		], //seller, product
	},
	{
		new: true,
		timestamps: false,
	}
);
// Middleware để giới hạn số lượng phần tử trong mảng
notificationSchema.pre("save", function (next) {
	// Giới hạn mảng 'info' chỉ có tối đa 50 phần tử
	if (this.info.length > 50) {
		this.info = this.info.slice(-50);
	}
	next();
});
const Notification = mongoose.model("Notification", notificationSchema);
module.exports = { Notification };
