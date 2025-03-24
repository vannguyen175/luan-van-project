const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
	{
		idOrder: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "OrderDetail",
			required: true,
		},
		idBuyer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		idSeller: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		idProduct: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		review: {
			type: String,
		},
		score: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;
