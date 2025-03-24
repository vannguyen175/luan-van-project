const mongoose = require("mongoose");
var slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const sub_categorySchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		slug: { type: String, slug: "name" },
		infoSubCate: [
			{
				name: { type: String, required: true },
				option: [{ type: String }],
			},
		],
		category: {
			type: String, //slug
			required: true,
		},
	},
	{
		timestamps: false,
	}
);

const Sub_category = mongoose.model("Sub_category", sub_categorySchema);

module.exports = Sub_category;
