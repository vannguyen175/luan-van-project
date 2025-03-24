const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
	{
		idUser: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		totalProduct: { type: Number, default: 0 },
		totalSold: { type: Number, default: 0 },
		revenue: { type: Number, default: 0 },
	},
	{
		new: true,
		timestamps: true,
	}
);
const Seller = mongoose.model("Seller", sellerSchema);
module.exports = Seller;
