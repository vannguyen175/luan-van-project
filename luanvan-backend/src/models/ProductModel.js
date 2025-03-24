const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		idUser: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		}, //ID_user
		name: { type: String, required: true },
		// sellerName: { type: String, required: true },
		images: [],
		subCategory: { type: String, required: true },
		stateProduct: {
			type: String,
		}, //trạng thái sản phẩm (mới hay cũ)
		info: { type: Object, required: true },
		price: { type: Number, required: true },
		description: { type: String },
		quantity: { type: Number, required: true },
		//tỉnh,tp => quận, huyện, thị xã => phường, xã, thị trấn => địa chỉ cụ thể
		address: {
			province: { type: String, required: true },
			district: { type: String, required: true },
			ward: { type: String, required: true },
			address: { type: String, required: true },
			phone: { type: String, required: true },
		},
		statePost: {
			type: String,
			enum: ["waiting", "approved", "reject", "selled", "closed"],
			default: "waiting",
		},
		quantityState: { type: Number, required: true }, //trạng thái số lượng trong kho
		rejectReason: { type: String },
	},
	{
		timestamps: true,
	}
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
