const { Notification, NotiType } = require("../models/NotificationModel");

const unSeenCount = async (user) => {
	try {
		const notification = await Notification.findOne({ user: user });
		const unseenCount = notification.info.filter((item) => item.isSeen === false).length;
		return unseenCount;
	} catch (error) {
		console.log(error);
		reject(error);
	}
};

//data = {user: id_seller, info: {product, buyer, type}}
const addNotification = async (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let NotiCreated;
			const isExist = await Notification.findOne({ user: data.user });
			if (isExist === null) {
				NotiCreated = await Notification.create({
					user: data.user,
					info: {
						product: data.info?.product,
						buyer: data.info?.buyer,
						image: data.info?.image,
						navigate: data.info?.navigate,
						message: data.info?.message,
					},
				});
			} else {
				//checkInfoLength();
				NotiCreated = await Notification.findOneAndUpdate(
					{ _id: isExist._id },
					{
						$push: {
							info: {
								product: data.info?.product,
								buyer: data.info?.buyer,
								image: data.info?.image,
								navigate: data.info?.navigate,
								message: data.info?.message,
							},
						},
					},
					{ new: true }
				);
			}

			const unseenCount = await unSeenCount(data.user);
			//đảo ngược mới nhất xếp trước của mảng info
			if (NotiCreated && NotiCreated.info) {
				NotiCreated.info.reverse();
			}

			resolve({
				status: "SUCCESS",
				message: "Thêm thông báo thành công",
				data: NotiCreated,
				unseenCount: unseenCount,
			});
		} catch (error) {
			console.log("Error at addNotification-service", error);
			reject(error);
		}
	});
};
const getNotification = async (user, page, limit) => {
	return new Promise(async (resolve, reject) => {
		try {
			let unseenCount = 0;
			const notification = await Notification.findOne({ user: user });

			if (notification) {
				unseenCount = await unSeenCount(user);
			}
			//đảo ngược mới nhất xếp trước của mảng info
			if (notification && notification.info) {
				notification.info.reverse();
			}

			resolve({
				status: "SUCCESS",
				message: "Lấy thông báo thành công",
				data: notification,
				unseenCount: unseenCount,
			});
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};
const updateNotification = async (user, infoID) => {
	return new Promise(async (resolve, reject) => {
		try {
			const notification = await Notification.findOneAndUpdate(
				{ user: user, "info._id": infoID },
				{
					$set: { "info.$.isSeen": true },
				},
				{ new: true }
			);
			resolve({
				status: "SUCCESS",
				message: "Cập nhật thông báo thành công",
				data: notification,
			});
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

const analyticProduct = (idUser) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (idUser !== undefined) {
				//thống kê cho người dùng
				let priceBought = 0;
				const listProductBought = await Order.find({
					buyer: idUser,
					stateOrder: "approved",
				});
				if (listProductBought) {
					for (let index = 0; index < listProductBought.length; index++) {
						priceBought = priceBought + listProductBought[index].totalPrice;
					}
				}

				const listProductWaiting = await Order.find({
					buyer: idUser,
					stateOrder: "waiting",
				});

				let priceSelled = 0;
				const listProductSelled = await Order.find({
					seller: idUser,
					stateOrder: "approved",
				});
				if (listProductSelled) {
					for (let index = 0; index < listProductSelled.length; index++) {
						priceSelled = priceSelled + listProductSelled[index].totalPrice;
					}
				}
				const listOrderWaiting = await Order.find({
					seller: idUser,
					stateOrder: "waiting",
				});

				return resolve({
					status: "OK",
					message: "SUCCESS",
					listProductBought,
					priceBought,
					listProductSelled,
					priceSelled,
					listProductWaiting, //đơn hàng chờ seller duyệt của người mua
					listOrderWaiting,
				});
			} else {
				//thống kê cho quản trị viên
				let priceSelled = 0;
				const listOrderSelled = await Order.find({ stateOrder: "approved" });
				//const listProductSelling = await Product.find({ selled: { $ne: "true" } });
				const listProductSelling = await Product.find({
					statePost: "approved",
					selled: "false",
				});

				const listProductWaiting = await Product.find({
					statePost: "waiting",
				});

				if (listOrderSelled) {
					for (let index = 0; index < listOrderSelled.length; index++) {
						priceSelled = priceSelled + listOrderSelled[index].totalPrice;
					}
				}

				return resolve({
					status: "OK",
					message: "SUCCESS",
					listOrderSelled,
					listProductSelling,
					listProductWaiting,
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
	analyticProduct,
	addNotification,
	getNotification,
	updateNotification,
};
