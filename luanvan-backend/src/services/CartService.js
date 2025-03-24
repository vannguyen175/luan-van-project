//POST: /api/order/create
const Product = require("../models/ProductModel");
const Order = require("../models/OrderModel");
const User = require("../models/UserModel");
const Cart = require("../models/CartModel");

const createCart = (id, idProduct, quantity) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkCart = await Cart.findOne({ idUser: id, "product.idProduct": idProduct });
			if (checkCart) {
				return resolve({
					status: "EXIST",
					message: "Sản phẩm đã tồn tại trong giỏ hàng",
				});
			} else {
				const isUserExist = await Cart.findOne({ idUser: id });
				if (isUserExist) {
					//nếu đã tồn tại ít nhất 1 sp trong giỏ => cập nhật
					const result = await Cart.findOneAndUpdate({ idUser: id }, { $push: { product: { idProduct: idProduct, quantity: quantity } } });
					return resolve({
						status: "SUCCESS",
						message: "Thêm giỏ hàng thành công.",
						data: result,
					});
				} else {
					//user chưa từng thêm sp vào giỏ hàng => tạo giỏ hàng
					const result = await Cart.create({
						idUser: id,
						product: {
							idProduct: idProduct,
							quantity: quantity,
						},
					});
					return resolve({
						status: "SUCCESS",
						message: "Thêm giỏ hàng thành công",
						data: result,
					});
				}
			}
		} catch (error) {
			console.log(`Có lỗi ở CartService: ${error}`);
		}
	});
};
const updateCart = (idUser, product) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkCart = await Cart.findOne({ idUser: idUser });

			if (checkCart) {
				const updateCart = await Cart.findOneAndUpdate({ idUser: idUser }, { $set: { product: product } }, { new: true });
				if (updateCart) {
					return resolve({
						status: "SUCCESS",
						message: "Cập nhật giỏ hàng thành công",
						data: updateCart,
					});
				}
			}
		} catch (error) {
			console.log(`Có lỗi ở CartService - updateCart: ${error}`);
		}
	});
};

const deleteCart = (idUser, idProduct) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkCart = await Cart.findOne({ idUser: idUser, "product.idProduct": idProduct });
			if (checkCart) {
				const result = await Cart.findOneAndUpdate(
					{ idUser: idUser },
					{ $pull: { product: { idProduct: idProduct } } }, // Xóa sản phẩm có idProduct từ mảng product
					{ new: true }
				);
				return resolve({
					status: "SUCCESS",
					message: "Xóa giỏ hàng thành công",
					data: result,
				});
			} else {
				return resolve({
					status: "ERROR",
					message: "Giỏ hàng không tồn tại",
				});
			}
		} catch (error) {
			console.log(`Có lỗi ở Cart delete: ${error}`);
		}
	});
};

const getCart = (idUser) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkCart = await Cart.findOne({ idUser: idUser });

			if (checkCart) {
				let productDetail = [];
				for (let index = 0; index < checkCart.product.length; index++) {
					const detail = await Product.findById(checkCart.product[index].idProduct).populate({
						path: "idUser",
						select: "name email blockExpireDate",
					});
					if (detail) {
						productDetail = [
							...productDetail,
							{
								idProduct: detail._id,
								name: detail.name,
								sellerName: detail.idUser.name,
								email: detail.idUser.email,
								idSeller: detail.idUser._id,
								image: detail.images[0],
								price: detail.price,
								totalQuantity: detail.quantityState,
								quantity: checkCart.product[index].quantity,
								statePost: detail.statePost,
								blockExpireDate: detail.idUser.blockExpireDate,
							},
						];
					}
				}
				return resolve({
					status: "SUCCESS",
					message: "Lấy giỏ hàng thành công",
					data: productDetail,
				});
			} else {
				return resolve({
					status: "ERROR",
					message: "ID người dùng không tồn tại",
				});
			}
		} catch (error) {
			console.log(`Có lỗi ở getCart-Service: ${error}`);
		}
	});
};

module.exports = {
	createCart,
	getCart,
	deleteCart,
	updateCart,
};
