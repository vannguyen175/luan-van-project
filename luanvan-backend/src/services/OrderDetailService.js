const Product = require("../models/ProductModel");
const { OrderDetail, OrderStatus } = require("../models/OrderDetailModel");
const { Order } = require("../models/OrderModel");
const Seller = require("../models/SellerModel");
const Rating = require("../models/RatingModel");
const NotificationService = require("../services/NotificationService");

const CartService = require("../services/CartService");
const User = require("../models/UserModel");

const cancelReason = {
	0: "Muốn thay đổi địa chỉ giao hàng",
	1: "Tìm thấy giá rẻ hơn ở chỗ khác",
	2: "Thủ tục thanh toán rắc rối",
	3: "Thay đổi ý",
	4: "Khác",
};

let io; //biến io đã khởi tạo ở socket.js
let getUserSocketId; //hàm lấy socket userID

const socket = (socketIO, getUserSocketIdFn) => {
	io = socketIO;
	getUserSocketId = getUserSocketIdFn;
};

const createOrderDetail = (products, idOrder, paymentMethod, idBuyer) => {
	return new Promise(async (resolve, reject) => {
		try {
			for (let index = 0; index < products.length; index++) {
				const createDetailOrder = await OrderDetail.create({
					idOrder: idOrder,
					idProduct: products[index].idProduct,
					idSeller: products[index].idSeller,
					quantity: products[index].quantity,
					productPrice: products[index].price,
					shippingPrice: products[index].shippingPrice,
					isPaid: paymentMethod === "vnpay",
					note: products[index]?.note,
				});
				//bán thành công => cập nhật (trừ) số lượng sản phẩm + trạng thái của sản phẩm
				if (createDetailOrder) {
					//nếu tạo đơn hàng thành công
					console.log("products[index].quantityState", products[index]);
					const productCheck = await Product.findById(products[index].idProduct);
					const productStored = await Product.findOneAndUpdate(
						{
							_id: products[index].idProduct,
							quantityState: { $gte: products[index].quantity }, // Kiểm tra đủ số lượng
						},
						{
							$inc: { quantityState: -products[index].quantity }, // Trừ số lượng
							...(products[index].quantity === productCheck.quantityState && { stateProduct: "selled" }),
						},
						{ new: true }
					);

					if (!productStored) {
						return resolve({
							status: "ERROR",
							message: "Đã xảy ra lỗi. Không đủ số lượng sản phẩm trong kho.",
						});
					}

					//xóa sản phẩm trong giỏ hàng
					await CartService.deleteCart(idBuyer, products[index].idProduct);
				}
			}
			return resolve({
				status: "SUCCESS",
				message: "Đặt hàng thành công!",
			});
		} catch (error) {
			console.log(`Have error at createDetailOrder service: ${error}`);
		}
	});
};

const getOrdersDetail = (seller, buyer, status, page, limit) => {
	return new Promise(async (resolve, reject) => {
		try {
			const perPage = limit; //Số items trên 1 page

			//kiểm tra + cập nhật trạng thái 5 giây của state "đang vận chuyển" và "đang giao hàng"
			const now = new Date();
			const fiveSecondsAgo = new Date(now - 5 * 1000);

			// Cập nhật trạng thái từ "Đang vận chuyển" sang "Giao hàng"
			await OrderDetail.updateMany(
				{ status: "Đang vận chuyển", updatedAt: { $lt: fiveSecondsAgo } },
				{ $set: { status: "Giao hàng", updatedAt: now } }
			);

			// Cập nhật trạng thái từ "Giao hàng" sang "Đã giao"
			await OrderDetail.updateMany(
				{ status: "Giao hàng", updatedAt: { $lt: fiveSecondsAgo } },
				{ $set: { status: "Đã giao", updatedAt: now } }
			);

			let statusOrder = null;
			if (status !== null) {
				statusOrder = OrderStatus[status];
			}

			let orders = {};
			if (seller) {
				//lấy tất cả đơn hàng theo người bán
				orders = await OrderDetail.find({ idSeller: seller, status: statusOrder })
					.sort({ _id: -1 }) //Lấy order mới nhất
					//.skip(perPage * (page - 1)) // Bỏ qua các bản ghi của các trang trước
					//.limit(perPage)
					.populate({
						path: "idProduct",
						select: "images name sellerName price",
						populate: {
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							select: "name",
						},
					})
					.populate({
						path: "idOrder",
						select: "shippingDetail idBuyer paymentMethod",
						populate: {
							path: "idBuyer",
							select: "name",
						},
					})
					.populate({
						path: "idSeller",
						select: "name",
					});
			} else {
				//lấy tất cả đơn hàng theo người mua
				const getOrdersBuyer = await Order.find({ idBuyer: buyer });
				const orderIds = getOrdersBuyer.map((order) => order._id); // Lấy danh sách idOrder

				orders = await OrderDetail.find({ idOrder: { $in: orderIds }, status: statusOrder })
					.sort({ _id: -1 }) //Lấy order mới nhất
					//.skip(perPage * (page - 1)) // Bỏ qua các bản ghi của các trang trước
					//.limit(perPage)
					.populate({
						path: "idProduct",
						select: "images name sellerName",
						populate: {
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							select: "name",
						},
					})
					.populate({
						path: "idOrder",
						select: "paymentMethod shippingDetail",
					})
					.populate({
						path: "idSeller",
						select: "name",
					});
				const promises = orders.map(async (order) => {
					const ratingInfo = await Rating.findOne({ idOrder: order._id });
					if (ratingInfo) {
						return {
							...order.toObject(),
							ratingInfo: {
								_id: ratingInfo._id,
								review: ratingInfo.review || "Không có",
								score: ratingInfo.score,
							},
						};
					}
					return order;
				});

				orders = await Promise.all(promises);
			}
			const paginatedResult = orders.slice((page - 1) * perPage, page * perPage);
			resolve({
				status: "SUCCESS",
				message: "Lấy đơn hàng thành công!",
				data: paginatedResult,
				totalCount: orders.length,
			});
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};
const searchOrderDetail = (query, idSeller, status) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Tạo điều kiện tìm kiếm
			//tìm tất cả SP thuộc cùng 1 người bán (idSeller) + tên SP
			let resultSearch = {};
			var ObjectId = require("mongoose").Types.ObjectId;
			const checkIsID = ObjectId.isValid(query); //kiểm tra tìm kiếm là id đơn hàng hay tên sp
			if (checkIsID) {
				resultSearch = await OrderDetail.find({ idSeller: idSeller, status: OrderStatus[status], _id: query })
					.populate({
						path: "idProduct",
						select: "images name sellerName",
					})
					.populate({
						path: "idOrder",
						select: "shippingDetail idBuyer paymentMethod",
					});
			} else {
				resultSearch = await OrderDetail.find({ idSeller: idSeller, status: OrderStatus[status] })
					.populate({
						path: "idProduct",
						match: { name: { $regex: query, $options: "i" } },
						select: "images name sellerName",
					})
					.populate({
						path: "idOrder",
						select: "shippingDetail idBuyer paymentMethod",
					});
				resultSearch = resultSearch.filter((ord) => ord.idProduct);
			}
			resolve({
				status: "SUCCESS",
				message: "Tìm kiếm thành công!",
				data: resultSearch,
			});
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

const updateOrderDetail = (idOrder, data) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkOrder = await OrderDetail.findById({ _id: idOrder })
				.populate({
					path: "idProduct",
					select: "_id images name",
				})
				.populate({
					path: "idOrder",
					select: "idBuyer",
				});
			if (checkOrder === null) {
				reject({
					status: "ERROR",
					message: "Có lỗi xảy ra.",
				});
			} else {
				//đơn hàng đã được người bán chấp nhận => bán thành công
				if (data.status === "1") {
					//OrderStatus = 1: đang vận chuyển
					await Seller.findOneAndUpdate(
						{ idUser: checkOrder.idSeller },
						{ $inc: { totalSold: 1, revenue: checkOrder.productPrice * checkOrder.quantity } },
						{ new: true }
					); //tăng totalSelled thêm 1
				}
				let status = checkOrder.status;
				if (data.status) {
					status = OrderStatus[data.status];
				}
				if (data.status === 3) {
					//update isPaid khi trạng thái giao hàng === "Đã giao"
					await OrderDetail.findByIdAndUpdate(
						idOrder,
						{ ...data, status: status, isPaid: true },
						{
							new: true,
						}
					);
				} else {
					await OrderDetail.findByIdAndUpdate(
						idOrder,
						{ ...data, status: status },
						{
							new: true,
						}
					);
				}

				const getProduct = await Product.findById(checkOrder.idProduct._id);
				if (getProduct.quantityState === 0) {
					await Product.findByIdAndUpdate(getProduct._id, { statePost: "selled" }, { new: true });
				}

				const userSocket = getUserSocketId(checkOrder.idOrder.idBuyer);
				const addNoti = await NotificationService.addNotification({
					user: checkOrder.idOrder.idBuyer,
					info: {
						product: checkOrder.idProduct,
						image: checkOrder.idProduct.images[0],
						navigate: "order",
						message: "Đơn hàng của bạn đã được người bán phê duyệt và sớm được giao đến bạn.",
					},
				});
				if (userSocket) {
					io.to(userSocket.socketId).emit("getNotification", {
						unseenCount: addNoti.unseenCount,
					});
				}

				return resolve({
					status: "SUCCESS",
					message: "Cập nhật đơn hàng thành công",
					//data: updateOrder,
				});
			}
		} catch (error) {
			console.log("error", error);
			reject(error);
		}
	});
};

const cancelOrder = (reason, idOrder) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkOrder = await OrderDetail.findById({ _id: idOrder }).populate({
				path: "idProduct",
				select: "images name",
			});

			if (checkOrder === null) {
				reject({
					status: "ERROR",
					message: "Đơn hàng không tồn tại",
				});
			} else {
				await Product.findByIdAndUpdate(
					{ _id: checkOrder.idProduct._id },
					{ statePost: "approved", $inc: { quantityState: checkOrder.quantity } }
				);
				const updateOrder = await OrderDetail.findByIdAndUpdate(
					idOrder,
					{
						status: OrderStatus[4], //status: đã hủy
						cancelReason: cancelReason[reason],
					},
					{
						new: true,
					}
				);
				const userSocket = getUserSocketId(checkOrder.idSeller);
				const addNoti = await NotificationService.addNotification({
					user: checkOrder.idSeller,
					info: {
						product: checkOrder.idProduct._id,
						image: checkOrder.idProduct.images[0],
						navigate: "seller-order",
						message: "Người mua đã hủy đơn hàng.",
					},
				});
				if (userSocket) {
					io.to(userSocket.socketId).emit("getNotification", {
						unseenCount: addNoti.unseenCount,
					});
				}

				return resolve({
					status: "SUCCESS",
					message: "Hủy đơn hàng thành công",
					data: updateOrder,
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
	createOrderDetail,
	getOrdersDetail,
	updateOrderDetail,
	cancelOrder,
	searchOrderDetail,
};
