const SubCategoryService = require("../services/SubCategoryService");

//url: /sub-category/create
const createSubCategory = async (req, res) => {
	try {
		const { name, slug } = req.body; //slug category
		if (!name || !slug) {
			return res.status(200).json({
				status: "ERR",
				message: "The input is required",
			});
		}
		const response = await SubCategoryService.createSubCategory(name, slug);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
//url: /sub-category/create/info
const createInfoSubCate = async (req, res) => {
	try {
		const { name, info, option } = req.body; //slug category
		if (!name || !info || !option) {
			return res.status(200).json({
				status: "ERR",
				message: "The input is required",
			});
		}
		const response = await SubCategoryService.createInfoSubCate(name, info, option);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
const updateOption = async (req, res) => {
	try {
		const { slug, info, options } = req.body; //slug category
		if (!slug || !info || !options) {
			return res.status(200).json({
				status: "ERR",
				message: "Nhập thiếu dữ liệu",
			});
		}
		const response = await SubCategoryService.updateOption(slug, info, options);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};

//url: /sub-category/:slug
const updateSubCategory = async (req, res) => {
	try {
		const slug = req.params.slug; //slug subCate
		// const name = req.body.name;
		const { info, option } = req.body;
		if (!info) {
			return res.status(200).json({
				status: "ERROR",
				message: "info field is required",
			});
		}

		const response = await SubCategoryService.updateSubCategory(slug, info, option);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

//url: /sub-category/:slug
const getOptionSubCategory = async (req, res) => {
	try {
		const slug = req.params.slug; //slug subCate
		// const name = req.body.name;
		const { info } = req.body;
		if (!info) {
			return res.status(200).json({
				status: "ERROR",
				message: "info field is required",
			});
		}

		const response = await SubCategoryService.getOptionSubCategory(slug, info);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const deleteSubCategory = async (req, res) => {
	try {
		const slug = req.params.slug;
		const response = await SubCategoryService.deleteSubCategory(slug);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const detailSubCategory = async (req, res) => {
	try {
		const slug = req.params.slug;
		const response = await SubCategoryService.detailSubCategory(slug);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};
const deleteInfo = async (req, res) => {
	try {
		const slug = req.params.slug;
		const nameInfo = req.params.nameInfo;

		const response = await SubCategoryService.deleteInfo(slug, nameInfo);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};
const getAllSubCategory = async (req, res) => {
	try {
		const response = await SubCategoryService.getAllSubCategory();
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

module.exports = {
	createSubCategory,
	updateSubCategory,
	deleteSubCategory,
	detailSubCategory,
	getOptionSubCategory,
	createInfoSubCate,
	getAllSubCategory,
	deleteInfo,
	updateOption
};
