const mongoose = require("mongoose");
var slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, slug: "name" },
    },
    {
        timestamps: false,
    }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
