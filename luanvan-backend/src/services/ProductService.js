const Product = require("../models/ProductModel");
const SubCategory = require("../models/Sub_categoryModel");
const User = require("../models/UserModel");
const NotificationService = require("../services/NotificationService");
const cloudinary = require("../config/cloundiary/cloundiary.config");
const Seller = require("../models/SellerModel");
// const httpServer  = require("http").createServer();

const uploadImage = async (images) => {
	let newImageList = [];
	for (const image of images) {
		try {
			const result = await cloudinary.uploader.upload(image, {
				use_filename: true,
				unique_filename: false,
				overwrite: true,
			});
			newImageList.push(result.secure_url);
		} catch (error) {
			//console.log("HAVE AN ERROR =>", error);
		}
	}
	return newImageList;
};

const createProduct = async (newProduct) => {
	return new Promise(async (resolve, reject) => {
		try {
			const data_subCategory = await SubCategory.find({ slug: newProduct.subCategory });
			const newImages = await uploadImage(newProduct.images);
			if (newImages) {
				const createProduct = await Product.create({
					subCategory: data_subCategory[0].slug,
					name: newProduct.name,
					price: newProduct.price,
					idUser: newProduct.idUser, //idSeller
					address: newProduct.address,
					images: newImages,
					info: newProduct.info,
					stateProduct: newProduct?.stateProduct,
					quantity: newProduct.quantity,
					quantityState: newProduct.quantity,
					description: newProduct.description,
					statePost: "waiting",
				});

				resolve({
					status: "SUCCESS",
					message: "Tạo bài đăng thành công",
					data: createProduct,
				});
			}
		} catch (error) {
			console.log("Error at createProduct Service: ", error);
			reject(error);
		}
	});
};

let io; //biến io đã khởi tạo ở socket.js
let getUserSocketId; //hàm lấy socket userID

const socket = (socketIO, getUserSocketIdFn) => {
	io = socketIO;
	getUserSocketId = getUserSocketIdFn;
};

const updateProduct = (productID, data) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkProduct = await Product.findOne({ _id: productID });

			if (checkProduct === null) {
				reject({
					status: "ERROR",
					message: "Bài đăng không tồn tại",
				});
			} else {
				const updateProduct = await Product.findByIdAndUpdate(productID, data, {
					new: true,
				});

				//nếu phê duyệt sản phẩm => tăng totalProduct của seller lên 1
				if (updateProduct && data.status === "approved") {
					const checkSellerExist = await Seller.findOne({ idUser: updateProduct.idUser });
					if (checkSellerExist) {
						await Seller.findByIdAndUpdate(
							checkSellerExist._id,
							{
								$inc: { totalProduct: 1 },
							},
							{ new: true }
						);
					} else {
						await Seller.create({ idUser: updateProduct.idUser, totalProduct: 1 });
					}
				}
				if (data.status === "closed") {
					const userSocket = getUserSocketId(updateProduct.idUser);
					const addNoti = await NotificationService.addNotification({
						user: updateProduct.idUser,
						info: {
							product: updateProduct._id,
							image: updateProduct.images[0],
							navigate: "product",
							message: "Bài đăng của bạn đã được cập nhật.",
						},
					});
					if (userSocket) {
						io.to(userSocket.socketId).emit("getNotification", {
							unseenCount: addNoti.unseenCount,
						});
					}
				}

				return resolve({
					status: "SUCCESS",
					message: "Cập nhật bài đăng thành công!",
					data: updateProduct,
				});
			}
		} catch (error) {
			console.log("error", error);
			reject(error);
		}
	});
};

const deleteProduct = () => {
	return new Promise(async (resolve, reject) => {
		try {
		} catch (error) {
			reject(error);
		}
	});
};

//lấy tất cả sản phẩm (luôn lấy mới nhất)
const getAllProducts = (state, cate, subCate, page, limit, sort, seller, province, price, isUsed, isBlocked) => {
	return new Promise(async (resolve, reject) => {
		try {
			const perPage = limit; //Số items trên 1 page
			let query = {};
			let sortOption = {};

			if (state?.length > 0) {
				query.statePost = { $in: state };
			}

			if (seller) {
				query.idUser = seller;
			}
			if (province) {
				query["address.province"] = province;
			}
			if (sort) {
				if (sort === "Cũ nhất") {
					sortOption = { _id: 1 };
				} else {
					sortOption = { _id: -1 };
				}
			}
			//price: ["Cao nhất", "Thấp nhất", "Dưới 1 triệu", "Từ 1-5 triệu", "Trên 5 triệu"],
			if (price) {
				if (price === "Cao nhất") {
					sortOption = { price: -1 };
				} else if (price === "Thấp nhất") {
					sortOption = { price: 1 };
				} else if (price === "Dưới 1 triệu") {
					query.price = { $lt: 1000000 };
				} else if (price === "Từ 1-5 triệu") {
					query.price = { $gte: 1000000, $lte: 5000000 };
				} else if (price === "Trên 5 triệu") {
					query.price = { $gt: 5000000 };
				}
			}

			if (isUsed) {
				if (isUsed === "Mới") {
					query.stateProduct = "new";
				} else {
					query.stateProduct = "used";
				}
			}

			//có lọc subCate hoặc Cate (có phân trang)
			if (subCate?.length > 0 || cate?.length > 0) {
				let products = await Product.find(query)
					.sort(sortOption || { _id: -1 }) //lấy dữ liệu mới nhất
					.populate({
						path: "subCategory",
						model: "Sub_category",
						foreignField: "slug",
						match: subCate.length > 0 ? { name: { $in: subCate } } : {},
						populate: {
							path: "category",
							model: "Category",
							foreignField: "slug",
							match: cate.length > 0 ? { name: { $in: cate } } : {},
						},
					})
					.populate({
						path: "idUser", //idSeller
						select: "name blockExpireDate",
						match: { $or: [{ blockExpireDate: { $lte: new Date() } }, { blockExpireDate: null }] }, // chỉ lấy người bán không bị khóa
					});

				products = products.filter((product) => product.subCategory && product.subCategory.category && product.idUser);
				const paginatedProducts = products.slice((page - 1) * perPage, page * perPage);
				resolve({
					status: "OK",
					message: "Lấy tất cả sản phẩm thành công!",
					data: paginatedProducts,
					totalCount: products.length,
				});
			} else {
				//lấy tất cả dữ liệu (có phân trang)
				const totalPages = await Product.countDocuments(query);
				let products = {};
				if (isBlocked) {
					products = await Product.find(query)
						.sort({ _id: -1 }) //lấy dữ liệu mới nhất
						.populate({
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							populate: {
								path: "category",
								model: "Category",
								foreignField: "slug",
							},
						})
						.populate({
							path: "idUser", //idSeller
							select: "name",
						});
				} else {
					products = await Product.find(query)
						.sort({ _id: -1 }) //lấy dữ liệu mới nhất
						.populate({
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							populate: {
								path: "category",
								model: "Category",
								foreignField: "slug",
							},
						})
						.populate({
							path: "idUser", //idSeller
							select: "name",
							match: { $or: [{ blockExpireDate: { $lte: new Date() } }, { blockExpireDate: null }] }, // chỉ lấy người bán không bị khóa
						});
				}

				products = products.filter((product) => product.subCategory && product.subCategory.category && product.idUser);
				const paginatedProducts = products.slice((page - 1) * perPage, page * perPage);
				resolve({
					status: "OK",
					message: "Lấy tất cả sản phẩm thành công!",
					data: paginatedProducts,
					totalData: totalPages,
				});
			}
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};
const detailProduct = (id) => {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await Product.findById({ _id: id })
				.populate({
					path: "subCategory",
					model: "Sub_category",
					foreignField: "slug",
					populate: {
						path: "category",
						model: "Category",
						foreignField: "slug",
					},
				})
				.populate({
					path: "idUser", //idSeller
					select: "name email",
				});

			if (result === null) {
				return resolve({
					status: "ERROR",
					message: "Có lỗi khi lấy dữ liệu",
				});
			} else {
				return resolve({
					status: "OK",
					message: "SUCCESS",
					data: result,
				});
			}
		} catch (error) {
			console.log("Error at detailProduct service", error);
			reject(error);
		}
	});
};
const getProductSeller = (id) => {
	return new Promise(async (resolve, reject) => {
		try {
			const sellerInfo = await User.findById(id);
			const result = await Product.find({ sellerName: sellerInfo.name, selled: false });
			if (result === null) {
				return resolve({
					status: "ERROR",
					message: "Product's ID is not exist",
				});
			} else {
				return resolve({
					status: "OK",
					message: "SUCCESS",
					data: result,
				});
			}
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

module.exports = {
	socket,
	createProduct,
	updateProduct,
	deleteProduct,
	//getAllProductsBySubCate,
	getAllProducts,
	detailProduct,
	getProductSeller,
};
