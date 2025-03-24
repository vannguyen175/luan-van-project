const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		name: { type: String },
		email: { type: String, required: true, unique: true },
		password: { type: String },
		isAdmin: { type: Boolean, default: false, required: true },
		//access_token: { type: String, require: true },
		//refresh_token: { type: String, require: true },
		//remember_token: { type: String },
		avatar: { type: String, require: true, default: "/assets/images/user-avatar.jpg" },
		loginMethod: { type: String },
		blockExpireDate: { type: Date },
		blockReason: { type: String },
		avatar: { type: String },
	},
	{
		new: true,
		timestamps: true,
	}
);
const User = mongoose.model("User", userSchema);
module.exports = User;
