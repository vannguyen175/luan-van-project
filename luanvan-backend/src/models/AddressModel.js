const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		phone: { type: String, unique: true },
		province: { type: String },
		district: { type: String },
		ward: { type: String },
		address: { type: String },
	},
	{
		timestamps: false,
	}
);
const Address = mongoose.model("Address", addressSchema);
module.exports = Address;
