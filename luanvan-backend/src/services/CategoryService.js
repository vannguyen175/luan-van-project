const Category = require("../models/CategoryModel.js");
const SubCategory = require("../models/Sub_categoryModel.js");

const createCategory = (name) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkExist = await Category.findOne({ name: name });
			if (checkExist) {
				return resolve({
					status: "ERROR",
					message: "Danh mục đã tồn tại",
				});
			}
			const createCategory = await Category.create({ name });

			if (createCategory) {
				return resolve({
					status: "SUCCESS",
					message: "Tạo mới danh mục thành công!",
					data: createCategory,
				});
			}
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};
const searchCategory = (search) => {
	return new Promise(async (resolve, reject) => {
		try {
			const getAllCategory = await Category.find({
				name: { $regex: search, $options: "i" }, 
			});

			if (getAllCategory) {
				return resolve({
					status: "SUCCESS",
					message: "Lấy tất cả danh mục thành công",
					data: getAllCategory,
				});
			}
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};
//url: /category/update/:slug
const updateCategory = (slug, name) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkCategory = await Category.findOne({ slug: slug });
			if (checkCategory === null) {
				return resolve({
					status: "ERROR",
					status: "Category is not exists",
				});
			}
			const updateCategory = await Category.findOneAndUpdate(
				slug,
				{ name },
				{
					new: true,
				}
			);
			if (updateCategory) {
				return resolve({
					status: "OK",
					message: "SUCCESS",
					updateCategory,
				});
			}
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};
//url: /category/delete/:slug
const deleteCategory = (slug) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkCategory = await Category.findOne({ slug: slug });
			if (checkCategory === null) {
				return resolve({
					status: "ERROR",
					message: "Danh mục không tồn tại.",
				});
			} else {
				const subCategories = await SubCategory.find({ category: checkCategory.slug });
				console.log("subCategories", slug);

				if (subCategories.length > 0) {
					return resolve({
						status: "ERROR",
						message: "Không thể xóa danh mục do chứa danh mục con.",
					});
				} else {
					//subCategories.length == 0
					const deleteCategory = await Category.findOneAndDelete({ slug: slug });

					if (deleteCategory) {
						return resolve({
							status: "SUCCESS",
							message: "Xóa danh mục thành công",
						});
					}
				}
			}
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

//url: /category/getAll
const getAllCategory = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const getAllCategory = await Category.find();
			if (getAllCategory) {
				return resolve({
					status: "SUCCESS",
					message: "Lấy tất cả danh mục thành công",
					data: getAllCategory,
				});
			}
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

//url: /category/details/:slug
const detailCategory = (slug) => {
	return new Promise(async (resolve, reject) => {
		try {
			const detailCategory = await Category.findOne({ slug: slug });
			if (detailCategory === null) {
				return resolve({
					status: "SUCCESS",
					message: "Category is not exists",
				});
			}
			if (detailCategory) {
				const subCategories = await SubCategory.find({ category: detailCategory.slug });
				return resolve({
					status: "SUCCESS",
					message: "Get all category successfully",
					category: detailCategory,
					subCategory: subCategories,
				});
			}
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

module.exports = {
	createCategory,
	searchCategory,
	updateCategory,
	deleteCategory,
	getAllCategory,
	detailCategory,
};
