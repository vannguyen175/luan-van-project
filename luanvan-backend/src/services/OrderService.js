//POST: /api/order/create
const Product = require("../models/ProductModel");
const { Order, OrderStatus } = require("../models/OrderModel");
const User = require("../models/UserModel");
const OrderDetailService = require("../services/OrderDetailService");
const { default: mongoose } = require("mongoose");
const Rating = require("../models/RatingModel");

let io; //biến io đã khởi tạo ở socket.js
let getUserSocketId; //hàm lấy socket userID

const socket = (socketIO, getUserSocketIdFn) => {
	io = socketIO;
	getUserSocketId = getUserSocketIdFn;
};

const createOrder = (newOrder) => {
	return new Promise(async (resolve, reject) => {
		const {
			products, //array
			shippingDetail, //object
			paymentMethod,
			idBuyer,
			totalPaid,
		} = newOrder;
		try {
			for (let index = 0; index < products.length; index++) {
				const productCheck = await Product.findOne({ _id: products[index].idProduct });
				if (productCheck.quantityState < products[index].quantity) {
					return resolve({
						status: "ERROR",
						message: "Có lỗi khi đặt hàng. Số lượng sản phẩm trong kho không đủ.",
					});
				}
			}

			const createOrder = await Order.create({
				idBuyer: idBuyer,
				shippingDetail: {
					address: shippingDetail.address,
					email: shippingDetail.email,
					phone: shippingDetail.phone,
					shippingPrice: shippingDetail.shippingPrice,
				},
				totalPaid: totalPaid,
				paymentMethod: paymentMethod,
			});

			if (createOrder) {
				const response = await OrderDetailService.createOrderDetail(products, createOrder._id, paymentMethod, idBuyer);
				if (response.status === "SUCCESS") {
					return resolve({
						status: "SUCCESS",
						message: "Đặt hàng thành công!",
					});
				}
			} else {
				return resolve({
					status: "error",
					message: "Có lỗi khi đặt hàng. Vui lòng thử lại.",
				});
			}
		} catch (error) {
			console.log(`Have error at createOrder service: ${error}`);
		}
	});
};

const getOrders = (seller, buyer, status, page, limit) => {
	return new Promise(async (resolve, reject) => {
		try {
			const perPage = limit; //Số items trên 1 page

			//kiểm tra + cập nhật trạng thái 5 phút của state "đang vận chuyển" và "đang giao hàng"
			const now = new Date();
			const fiveMinutesAgo = new Date(now - 5 * 60000);

			// Cập nhật trạng thái từ "Đang vận chuyển" sang "Giao hàng"
			await Order.updateMany(
				{ status: "Đang vận chuyển", updatedAt: { $lt: fiveMinutesAgo } },
				{ $set: { status: "Giao hàng", updatedAt: now } }
			);

			// Cập nhật trạng thái từ "Giao hàng" sang "Đã giao"
			await Order.updateMany({ status: "Giao hàng", updatedAt: { $lt: fiveMinutesAgo } }, { $set: { status: "Đã giao", updatedAt: now } });

			let statusOrder = null;
			if (status !== null) {
				statusOrder = OrderStatus[status];
			}

			let orders = {};
			if (seller) {
				//lấy đơn hàng theo người bán
				orders = await Order.find({ seller: seller, status: statusOrder })
					.sort({ _id: 1 }) //Lấy order mới nhất
					.skip(perPage * (page - 1)) // Bỏ qua các bản ghi của các trang trước
					.limit(perPage)
					.populate({
						path: "product",
						select: "images name sellerName price",
						populate: {
							path: "subCategory",
							select: "name",
						},
					})
					.populate({
						path: "buyer",
						select: "avatar name",
					});
			} else {
				//lấy đơn hàng theo người mua
				orders = await Order.find({ buyer: buyer, status: statusOrder })
					.sort({ _id: 1 }) //Lấy order mới nhất
					.skip(perPage * (page - 1)) // Bỏ qua các bản ghi của các trang trước
					.limit(perPage)
					.populate({
						path: "product",
						select: "images name sellerName price",
						populate: {
							path: "subCategory",
							select: "name",
						},
					});
			}

			resolve({
				status: "SUCCESS",
				message: "Lấy đơn hàng thành công!",
				data: orders,
			});
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

const updateOrder = (idOrder, data) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkOrder = await Order.findById({ _id: idOrder });
			let imageProduct = "";
			if (checkOrder === null) {
				reject({
					status: "ERROR",
					message: "Có lỗi xảy ra.",
				});
			} else {
				//đơn hàng đã được người bán chấp nhận => bán thành công
				if (data.status === "1") {
					const updateProduct = await Product.findByIdAndUpdate(checkOrder.product, {
						selled: true,
					});
					imageProduct = updateProduct.images[0];
					await User.findOneAndUpdate({ _id: updateProduct.idUser }, { $inc: { totalSelled: 1 } }); //tăng totalSelled thêm 1
				} else if (data.status === "4") {
					const updateProduct = await Product.findByIdAndUpdate(checkOrder.product, {
						selled: false,
					});
					imageProduct = updateProduct.images[0];
				}
				let status = checkOrder.status;
				if (data.status) {
					status = OrderStatus[data.status];
				}
				const updateOrder = await Order.findByIdAndUpdate(
					idOrder,
					{ ...data, status: status },
					{
						new: true,
					}
				);
				const userSocket = getUserSocketId(updateOrder.buyer);

				if (userSocket) {
					io.to(userSocket.socketId).emit("getNotification", {
						message: "Người bán đã chuẩn bị đơn hàng và đang vận chuyển.",
						product: updateOrder._id,
						image: imageProduct,
						navigate: "order",
					});
				}

				return resolve({
					status: "SUCCESS",
					message: "Cập nhật thành công",
					data: updateOrder,
				});
			}
		} catch (error) {
			console.log("error", error);
			reject(error);
		}
	});
};

const ChartAnalyticOrder = (idUser) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (idUser) {
				const ObjectId = mongoose.Types.ObjectId;
				// const result = await Order.aggregate([
				// 	{
				// 		$match: { buyer: new ObjectId(idUser) },
				// 	},
				// 	{
				// 		$group: {
				// 			_id: {
				// 				year: { $year: "$updatedAt" },
				// 				month: { $month: "$updatedAt" },
				// 			},
				// 			countOrders: { $sum: 1 },
				// 		},
				// 	},
				// ]);
				const result = await Order.aggregate([
					{
						$match: { buyer: new ObjectId(idUser) },
					},
				]);

				return resolve({
					status: "OK",
					message: "SUCCESS",
					result,
				});
			} else {
				//thống kê cho quản trị viên
				let priceBought = 0;
				const listProductBought = await Order.find();
				if (listProductBought) {
					for (let index = 0; index < listProductBought.length; index++) {
						priceBought = priceBought + listProductBought[index].totalPrice;
					}
				}

				let priceSelled = 0;
				const listProductSelled = await Order.find();
				if (listProductSelled) {
					for (let index = 0; index < listProductSelled.length; index++) {
						priceSelled = priceSelled + listProductSelled[index].totalPrice;
					}
				}

				return resolve({
					status: "OK",
					message: "SUCCESS",
					listProductBought,
					priceBought,
					listProductSelled,
					priceSelled,
				});
			}
		} catch (error) {
			console.log("error", error);
			reject(error);
		}
	});
};

module.exports = {
	socket,
	createOrder,
	updateOrder,
	ChartAnalyticOrder,
	getOrders,
};
