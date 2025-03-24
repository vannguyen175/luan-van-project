const mongoose = require("mongoose");

const OrderStatus = {
	0: "Đang xử lý",
	1: "Đang vận chuyển",
	2: "Giao hàng",
	3: "Đã giao",
	4: "Đã hủy",
};

const orderDetailSchema = new mongoose.Schema(
	{
		idProduct: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},

		idOrder: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
			required: true,
		},

		idSeller: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		quantity: { type: Number, default: 0 },
		productPrice: { type: Number, default: 0 },
		shippingPrice: { type: Number, default: 0 },
		status: { type: String, default: OrderStatus[0], required: true },
		cancelReason: { type: String },
		note: { type: String },
		isPaid: { type: Boolean, default: false, required: true },
	},
	{
		timestamps: true,
	}
);
const OrderDetail = mongoose.model("OrderDetail", orderDetailSchema);
module.exports = { OrderDetail, OrderStatus };
