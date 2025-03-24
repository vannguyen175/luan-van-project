const mongoose = require("mongoose");

const productHistorySchema = new mongoose.Schema(
	{
		idProduct: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		updatedQuantity: { type: Number },
		updatedPrice: { type: Number },
		updateReason: { type: String }, //giảm giá / restock
		discount: { type: Number }, //phần trăm giảm giá
	},
	{
		timestamps: true,
	}
);
const ProductHistory = mongoose.model("ProductHistory", productHistorySchema);
module.exports = { ProductHistory };
