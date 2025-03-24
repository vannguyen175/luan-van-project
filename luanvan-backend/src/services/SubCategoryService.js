const Category = require("../models/CategoryModel");
const SubCategory = require("../models/Sub_categoryModel");

// path: /sub-category/create
const createSubCategory = (name, slug) => {
	//slug: category's slug
	return new Promise(async (resolve, reject) => {
		try {
			const checkCategory = await Category.findOne({ slug });

			if (checkCategory === null) {
				return resolve({
					status: "ERROR",
					message: "Danh mục chính không tồn tại",
				});
			}
			const checkSubCategory = await SubCategory.findOne({ name: name });

			if (checkSubCategory) {
				return resolve({
					status: "ERROR",
					message: "Danh mục phụ đã tồn tại",
				});
			}

			const createSubCategory = await SubCategory.create({
				name: name,
				category: checkCategory.slug,
			});
			if (createSubCategory) {
				return resolve({
					status: "SUCCESS",
					message: "SUCCESS",
					data: createSubCategory,
				});
			}
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

// path: /sub-category/create/info
const createInfoSubCate = (name, info, option) => {
	//slug: category's slug
	return new Promise(async (resolve, reject) => {
		try {
			const checkExists = await SubCategory.findOne({
				name: info,
				"infoSubCate.name": name,
			});
			if (checkExists) {
				return resolve({
					status: "ERROR",
					message: "Tên mô tả đã tồn tại",
				});
			} else {
				const createInfo = await SubCategory.findOneAndUpdate(
					{ name: info },
					{
						$push: {
							infoSubCate: {
								name: name,
								option: option,
							},
						},
					},
					{ upsert: true, new: true }
				);
				if (createInfo) {
					return resolve({
						status: "SUCCESS",
						message: "SUCCESS",
						data: createSubCategory,
					});
				}
			}
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

// path: /sub-category/update/:slug
const updateSubCategory = (slug, info, option) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkID = await SubCategory.findOne({ slug });
			if (checkID === null) {
				return resolve({
					status: "ERROR",
					status: "Sub-category doesn't exists",
				});
			}

			const checkInfo = await SubCategory.findOne({
				slug: slug,
				"infoSubCate.name": info,
			});
			if (checkInfo === null) {
				//chưa có info => thêm info mới
				const createSubCategory = await SubCategory.findOneAndUpdate(
					{ slug: slug },
					{
						$push: {
							infoSubCate: {
								name: info,
								option: option,
							},
						},
					},
					{ upsert: true, new: true }
				);

				return resolve({
					status: "SUCCESS",
					message: "SUCCESS",
					data: createSubCategory,
				});
			} else {
				//đã có info => cập nhật option
				const createSubCategory = await SubCategory.findOneAndUpdate(
					{ slug: slug, "infoSubCate.name": info },
					{ $set: { "infoSubCate.$.option": option } }
				);

				return resolve({
					status: "SUCCESS",
					message: "SUCCESS",
					data: createSubCategory,
				});
			}
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

// path: /sub-category/update/:slug
const getOptionSubCategory = (slug, info) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkID = await SubCategory.findOne({ slug });
			if (checkID === null) {
				return resolve({
					status: "ERROR",
					status: "Sub-category doesn't exists",
				});
			}

			const result = await SubCategory.find({
				slug: slug,
				infoSubCate: {
					$elemMatch: { name: info },
				},
			});

			//console.log(result);

			return resolve({
				status: "SUCCESS",
				message: "SUCCESS",
				data: result,
			});
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

// path: /sub-category/delete/:slug
const deleteSubCategory = (slug) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkExists = await SubCategory.findOne({ slug });
			if (checkExists === null) {
				resolve({
					status: "ERROR",
					message: "Danh mục phụ không tồn tại",
				});
			}
			const deleteSubCategory = await SubCategory.findOneAndDelete({
				slug,
			});
			if (deleteSubCategory) {
				resolve({
					status: "SUCCESS",
					message: "Xóa danh mục phụ thành công",
				});
			}
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

const deleteInfo = (slug, nameInfo) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkExists = await SubCategory.findOne({
				slug: slug,
				"infoSubCate.name": nameInfo,
			});
			if (checkExists === null) {
				resolve({
					status: "ERROR",
					message: "Tên mô tả không tồn tại",
				});
			}
			const deleteInfo = await SubCategory.updateOne({ slug: slug }, { $pull: { infoSubCate: { name: nameInfo } } });

			if (deleteInfo) {
				resolve({
					status: "SUCCESS",
					message: "Xóa danh mục phụ thành công",
				});
			}
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

//url: /sub-category/details/:slug
const detailSubCategory = (slug) => {
	return new Promise(async (resolve, reject) => {
		try {
			const detailSubCategory = await SubCategory.findOne({ slug: slug });
			if (detailSubCategory === null) {
				return resolve({
					status: "SUCCESS",
					message: "Sub-category is not exists",
				});
			}

			if (detailSubCategory) {
				const category = await Category.findOne({ slug: detailSubCategory.category });
				return resolve({
					status: "SUCCESS",
					message: "Get details sub-category successfully",
					data: detailSubCategory,
					category: category,
				});
			}
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};
const getAllSubCategory = (slug) => {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await SubCategory.find({});
			if (result) {
				return resolve({
					status: "SUCCESS",
					message: "Get all sub-categories successfully",
					data: result,
				});
			}
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};
const updateOption = (slug, info, options) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkExist = await SubCategory.findOne({
				slug: slug,
				"infoSubCate.name": info,
			});
			if (checkExist === null) {
				return resolve({
					status: "ERROR",
					message: "Thông tin mô tả không tồn tại.",
				});
			} else {
				const replaceOptions = await SubCategory.updateOne(
					{ slug: slug, "infoSubCate.name": info }, // Điều kiện lọc
					{ $set: { "infoSubCate.$.option": options } } // Thay thế toàn bộ mảng option
				);
				if (replaceOptions) {
					return resolve({
						status: "SUCCESS",
						message: "Cập nhật lựa chọn thành công!",
					});
				}
			}
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
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
	updateOption,
};
