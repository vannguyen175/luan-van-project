const Product = require("../models/ProductModel");
const { Order } = require("../models/OrderModel");
const User = require("../models/UserModel");
const OrderDetailService = require("../services/OrderDetailService");
const { OrderDetail, OrderStatus } = require("../models/OrderDetailModel");
const Category = require("../models/CategoryModel");

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const format = require("date-format");
const { detailProduct } = require("./ProductService");

const formatDate = (isoString) => {
	const date = new Date(isoString);
	const month = date.getUTCMonth() + 1;
	const year = date.getUTCFullYear();
	return `${month}/${year}`;
};

//thống kê SP theo người bán
const analyticProduct = (idUser, typeDate, startDay, endDay) => {
	return new Promise(async (resolve, reject) => {
		try {
			const current = new Date();
			let selled = {};
			let totalPosted = null;
			let totalSelled = null;
			let totalRejected = null;
			let allProducts = {};

			totalPosted = await Product.find({ idUser: idUser, statePost: { $in: ["approved"] } });

			totalSelled = await OrderDetail.find({ idSeller: idUser, status: "Đã giao" }); //lượt bán thành công
			totalRejected = await Product.find({ idUser: idUser, statePost: { $in: ["waiting"] } });

			if (typeDate === "week") {
				//hiển thị sản phẩm theo các ngày trong 1 tuần
				const startOfWeek = new Date(startDay);
				const endDay = new Date(startOfWeek);
				endDay.setDate(startOfWeek.getDate() + 6);
				const endOfWeek = new Date(endDay.setHours(23, 59, 59, 999));

				//sản phẩm đã bán
				allProducts = await OrderDetail.find({ idSeller: idUser, updatedAt: { $gte: startOfWeek, $lt: endOfWeek }, status: "Đã giao" });
				for (let date = new Date(startOfWeek); date < new Date(endOfWeek); date.setDate(date.getDate() + 1)) {
					totalRevenue = allProducts.filter((item) => {
						const postProductDate = new Date(item.updatedAt);
						return postProductDate.toDateString() === date.toDateString();
					});
					selled[format("dd/MM/yyyy", date)] = totalRevenue.length;
				}
			} else if (typeDate === "month") {
				//hiển thị sản phẩm theo 12 tháng gần nhất
				const currentMonth = current.getMonth();
				const currentYear = current.getFullYear();

				const months = [];

				for (let i = 0; i < 12; i++) {
					const month = (currentMonth - i + 12) % 12;
					const year = currentYear - Math.floor((i + 12 - currentMonth) / 12);
					const monthString = `${month + 1}/${year}`;
					months.push(monthString);
				}
				//lượt bán ra
				let allProducts = await OrderDetail.find({ idSeller: idUser, status: "Đã giao" });
				months.reverse().forEach((month) => {
					const ProductsInMonth = allProducts.filter((item) => {
						const orderMonth = new Date(item.updatedAt);
						return formatDate(orderMonth) === month;
					});
					selled[month] = ProductsInMonth.length;
				});
			}

			{
				return resolve({
					status: "SUCCESS",
					message: "Thống kê sản phẩm thành công!",
					selled: selled,
					totalPosted: totalPosted.length,
					totalSelled: totalSelled.length,
					totalRejected: totalRejected.length,
				});
			}
		} catch (error) {
			console.log(`Have error at analyticProduct service: ${error}`);
		}
	});
};
//thống kê đơn hàng theo người bán
const analyticOrder = (idSeller, typeDate, startDay) => {
	return new Promise(async (resolve, reject) => {
		try {
			let stateOrders = {
				waiting: null,
				approved: null,
				rejected: null,
			};
			let totalRevenue = {};
			let totalRevenueChart = {};
			//typeUser == "seller" && typeDate == "today" => Nhà bán hàng
			const approvedOrders = await OrderDetail.find({
				idSeller: idSeller,
				status: { $nin: [OrderStatus[0], OrderStatus[4]] },
			}).select("_id");

			const rejectedOrders = await OrderDetail.find({ idSeller: idSeller, status: OrderStatus[4] }).select("_id");
			stateOrders = {
				approved: approvedOrders.length,
				rejected: rejectedOrders.length,
			};
			totalRevenue = await OrderDetail.aggregate([
				{
					$match: {
						idSeller: new ObjectId(idSeller),
						status: OrderStatus[3],
					},
				},
				{
					$group: {
						_id: null, // Không nhóm theo bất kỳ trường nào
						totalRevenue: { $sum: { $multiply: ["$productPrice", "$quantity"] } }, // Tính tổng (giá x số lượng)
					},
				},
			]);

			if (typeDate === "week") {
				//hiển thị đơn hàng theo các ngày trong 1 tuần
				const startOfWeek = new Date(startDay);
				const endDay = new Date(startOfWeek);
				endDay.setDate(startOfWeek.getDate() + 6);
				const endOfWeek = new Date(endDay.setHours(23, 59, 59, 999));

				//doanh thu đơn hàng
				allOrders = await OrderDetail.find({
					idSeller: idSeller,
					updatedAt: { $gte: startOfWeek, $lt: endOfWeek },
					status: OrderStatus[3],
				}).select("updatedAt productPrice quantity");

				console.log(allOrders);

				for (let date = new Date(startOfWeek); date <= new Date(endOfWeek); date.setDate(date.getDate() + 1)) {
					const res = allOrders.filter((item) => {
						const orderCheck = new Date(item.updatedAt);
						return orderCheck.toDateString() === date.toDateString();
					});
					const totalRevenueForDay = res.reduce((total, item) => total + item.productPrice * item.quantity, 0);
					totalRevenueChart[format("dd/MM/yyyy", date)] = totalRevenueForDay;
				}
			} else if (typeDate === "month") {
				//hiển thị sản phẩm theo 12 tháng gần nhất
				const current = new Date();
				const currentMonth = current.getMonth();
				const currentYear = current.getFullYear();
				const months = [];
				for (let i = 0; i < 12; i++) {
					const month = (currentMonth - i + 12) % 12;
					const year = currentYear - Math.floor((i + 12 - currentMonth) / 12);
					const monthString = `${month + 1}/${year}`;
					months.push(monthString);
				}
				//doanh thu đơn hàng
				allOrders = await OrderDetail.find({ idSeller: idSeller, status: "Đã giao" }).select("updatedAt productPrice");

				months.reverse().forEach((month) => {
					const res = allOrders.filter((item) => {
						const orderMonth = new Date(item.updatedAt);
						return formatDate(orderMonth) === month;
					});
					const RevenueInMonth = res.reduce((total, item) => total + item.productPrice, 0);
					totalRevenueChart[month] = RevenueInMonth;
				});
			}

			{
				return resolve({
					status: "SUCCESS",
					message: "Thống kê đơn hàng thành công!",
					stateOrders: stateOrders,
					totalRevenue: totalRevenue,
					totalRevenueChart: totalRevenueChart || [],
				});
			}
		} catch (error) {
			console.log(`Have error at analyticOrder service: ${error}`);
		}
	});
};
//thống kê SP cho admin
const analyticProductAdmin = (typeDate, startDay) => {
	return new Promise(async (resolve, reject) => {
		try {
			const current = new Date();
			let selled = {}; //lượt bán
			let totalPosted = null;
			let totalSelled = null;
			let totalRejected = null;
			let allProducts = {};

			totalPosted = await Product.find({ statePost: { $in: ["approved"] } }).select("_id");
			totalSelled = await OrderDetail.find({ status: OrderStatus[3] }).select("_id");
			totalRejected = await OrderDetail.find({ status: OrderStatus[4] }).select("_id");
			if (typeDate === "week") {
				//hiển thị sản phẩm theo các ngày trong 1 tuần
				const startOfWeek = new Date(startDay);
				const endDay = new Date(startOfWeek);
				endDay.setDate(startOfWeek.getDate() + 6);
				const endOfWeek = new Date(endDay.setHours(23, 59, 59, 999));

				//lượt bán thành công
				allProducts = await OrderDetail.find({ status: OrderStatus[3], updatedAt: { $gte: startOfWeek, $lte: endOfWeek } }).select(
					"updatedAt"
				);
				for (let date = new Date(startOfWeek); date < new Date(endOfWeek); date.setDate(date.getDate() + 1)) {
					totalRevenue = allProducts.filter((item) => {
						const postProductDate = new Date(item.updatedAt);
						return postProductDate.toDateString() === date.toDateString();
					});
					selled[format("dd/MM/yyyy", date)] = totalRevenue.length;
				}
			} else if (typeDate === "month") {
				//hiển thị sản phẩm theo 12 tháng gần nhất
				const currentMonth = current.getMonth();
				const currentYear = current.getFullYear();

				const months = [];

				for (let i = 0; i < 12; i++) {
					const month = (currentMonth - i + 12) % 12;
					const year = currentYear - Math.floor((i + 12 - currentMonth) / 12);
					const monthString = `${month + 1}/${year}`;
					months.push(monthString);
				}

				//lượt bán thành công
				let allProducts = await OrderDetail.find({ status: OrderStatus[3] }).select("updatedAt");
				months.reverse().forEach((month) => {
					const ProductsInMonth = allProducts.filter((item) => {
						const orderMonth = new Date(item.updatedAt);
						return formatDate(orderMonth) === month;
					});
					selled[month] = ProductsInMonth.length;
				});
			}

			{
				return resolve({
					status: "SUCCESS",
					message: "Thống kê sản phẩm thành công!",
					selled: selled,
					totalPosted: totalPosted.length,
					totalSelled: totalSelled.length,
					totalRejected: totalRejected.length,
				});
			}
		} catch (error) {
			console.log(`Have error at analyticProduct service: ${error}`);
		}
	});
};
//thống kê đơn hàng cho admin
const analyticOrderAdmin = (typeDate, startDay) => {
	return new Promise(async (resolve, reject) => {
		try {
			let stateOrders = {
				waiting: null,
				approved: null,
				rejected: null,
			};
			let totalRevenue = {};
			let totalRevenueChart = {};
			//typeUser == "seller" && typeDate == "today" => Nhà bán hàng
			const waitingOrders = await OrderDetail.find({ status: OrderStatus[0] }).select("_id");
			const approvedOrders = await OrderDetail.find({
				status: { $nin: [OrderStatus[0], OrderStatus[4]] },
			}).select("_id");
			const rejectedOrders = await OrderDetail.find({ status: OrderStatus[4] }).select("_id");

			stateOrders = {
				waiting: waitingOrders.length,
				approved: approvedOrders.length,
				rejected: rejectedOrders.length,
			};
			totalRevenue = await OrderDetail.aggregate([
				{
					$match: {
						status: OrderStatus[3],
					},
				},
				{
					$group: {
						_id: null, // Không nhóm theo bất kỳ trường nào
						totalRevenue: { $sum: { $multiply: ["$productPrice", "$quantity"] } }, // Tính tổng (giá x số lượng)
					},
				},
			]);
			if (typeDate === "week") {
				//hiển thị đơn hàng theo các ngày trong 1 tuần

				const startOfWeek = new Date(startDay);
				const endDay = new Date(startOfWeek);
				endDay.setDate(startOfWeek.getDate() + 6);
				const endOfWeek = new Date(endDay.setHours(23, 59, 59, 999));

				//doanh thu đơn hàng
				allOrders = await OrderDetail.find({ updatedAt: { $gte: startOfWeek, $lt: endOfWeek }, status: OrderStatus[3] }).select(
					"productPrice updatedAt status"
				);
				for (let date = new Date(startOfWeek); date < new Date(endOfWeek); date.setDate(date.getDate() + 1)) {
					const res = allOrders.filter((item) => {
						const orderCheck = new Date(item.updatedAt);
						return orderCheck.toDateString() === date.toDateString();
					});
					const totalRevenueForDay = res.reduce((total, item) => total + item.productPrice, 0);
					totalRevenueChart[format("dd/MM/yyyy", date)] = totalRevenueForDay;
				}
			} else if (typeDate === "month") {
				//hiển thị sản phẩm theo 12 tháng gần nhất
				const current = new Date();
				const currentMonth = current.getMonth();
				const currentYear = current.getFullYear();
				const months = [];
				for (let i = 0; i < 12; i++) {
					const month = (currentMonth - i + 12) % 12;
					const year = currentYear - Math.floor((i + 12 - currentMonth) / 12);
					const monthString = `${month + 1}/${year}`;
					months.push(monthString);
				}
				//doanh thu đơn hàng
				allOrders = await OrderDetail.find({ status: OrderStatus[3] }).select("productPrice updatedAt");
				months.reverse().forEach((month) => {
					const res = allOrders.filter((item) => {
						const orderMonth = new Date(item.updatedAt);
						return formatDate(orderMonth) === month;
					});
					const RevenueInMonth = res.reduce((total, item) => total + item.productPrice, 0);
					totalRevenueChart[month] = RevenueInMonth;
				});
			}

			{
				return resolve({
					status: "SUCCESS",
					message: "Thống kê đơn hàng thành công!",
					stateOrders: stateOrders,
					totalRevenue: totalRevenue,
					totalRevenueChart: totalRevenueChart || [],
				});
			}
		} catch (error) {
			console.log(`Have error at analyticOrderAdmin service: ${error}`);
		}
	});
};
//thống kê sản phẩm theo danh mục cho admin
const analyticCategoryAdmin = (typeDate, startDay, endDay) => {
	return new Promise(async (resolve, reject) => {
		try {
			let dataChart = {};
			let dataChartDetail = {};
			if (typeDate === "all") {
				let allOrders = await OrderDetail.find({
					status: OrderStatus[3],
				})
					.select("_id productPrice")
					.populate({
						path: "idProduct",
						select: "_id",
						populate: {
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							populate: {
								path: "category",
								model: "Category",
								foreignField: "slug",
							},
						},
					});

				allOrders.forEach((item) => {
					const categoryName = item.idProduct.subCategory?.category?.name;
					const subCateName = item.idProduct.subCategory?.name;
					const price = item?.productPrice || 0; // Giá của sản phẩm

					if (categoryName && subCateName) {
						if (!dataChartDetail[categoryName]) {
							dataChartDetail[categoryName] = {
								count: {}, // Đếm số lượng đơn hàng
								revenue: {}, // Tính tổng doanh thu
							};
						}
						// Đếm số lượng đơn hàng theo danh mục
						dataChart[categoryName] = dataChart[categoryName] || { count: 0, revenue: 0 }; // Khởi tạo nếu chưa có
						dataChart[categoryName].count += 1; // Tăng số lượng đơn hàng
						dataChart[categoryName].revenue += price; // Tăng doanh thu

						// Đếm số lượng và doanh thu theo danh mục con
						dataChartDetail[categoryName].count[subCateName] = (dataChartDetail[categoryName].count[subCateName] || 0) + 1; // Tăng số lượng
						dataChartDetail[categoryName].revenue[subCateName] = (dataChartDetail[categoryName].revenue[subCateName] || 0) + price; // Tăng doanh thu
					}
				});
			} else {
				const end = new Date(endDay); // Ngày kết thúc
				// Đặt end thành cuối ngày
				end.setHours(23, 59, 59, 999);
				let allOrders = await OrderDetail.find({
					status: OrderStatus[3],
					updatedAt: { $gte: new Date(startDay), $lte: new Date(end) },
				})
					.select("_id productPrice")
					.populate({
						path: "idProduct",
						select: "_id",
						populate: {
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							populate: {
								path: "category",
								model: "Category",
								foreignField: "slug",
							},
						},
					});

				allOrders.forEach((item) => {
					const categoryName = item.idProduct.subCategory?.category?.name;
					const subCateName = item.idProduct.subCategory?.name;
					const price = item?.productPrice || 0; // Giá của sản phẩm

					if (categoryName && subCateName) {
						if (!dataChartDetail[categoryName]) {
							dataChartDetail[categoryName] = {
								count: {}, // Đếm số lượng đơn hàng
								revenue: {}, // Tính tổng doanh thu
							};
						}
						// Đếm số lượng đơn hàng theo danh mục
						dataChart[categoryName] = dataChart[categoryName] || { count: 0, revenue: 0 }; // Khởi tạo nếu chưa có
						dataChart[categoryName].count += 1; // Tăng số lượng đơn hàng
						dataChart[categoryName].revenue += price; // Tăng doanh thu

						// Đếm số lượng và doanh thu theo danh mục con
						dataChartDetail[categoryName].count[subCateName] = (dataChartDetail[categoryName].count[subCateName] || 0) + 1; // Tăng số lượng
						dataChartDetail[categoryName].revenue[subCateName] = (dataChartDetail[categoryName].revenue[subCateName] || 0) + price; // Tăng doanh thu
					}
				});
			}

			{
				return resolve({
					status: "SUCCESS",
					message: "Thống kê danh mục thành công!",
					data: dataChart,
					dataDetail: dataChartDetail,
				});
			}
		} catch (error) {
			console.log(`Have error at analyticCategoryAdmin service: ${error}`);
		}
	});
};

//thống kê sản phẩm theo danh mục cho seller
const analyticCategorySeller = (idUser, typeDate, startDay, endDay) => {
	return new Promise(async (resolve, reject) => {
		try {
			let dataChart = {};
			let dataChartDetail = {};

			if (typeDate === "all") {
				const allProducts = await OrderDetail.find({
					idSeller: idUser,
					status: OrderStatus[3],
				})
					.select("_id")
					.populate({
						path: "idProduct",
						select: "name",
						populate: {
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							populate: {
								path: "category",
								model: "Category",
								foreignField: "slug",
							},
						},
					});

				allProducts.forEach((product) => {
					const categoryName = product.idProduct?.subCategory?.category?.name;
					const subCateName = product.idProduct?.subCategory?.name;

					if (categoryName && subCateName) {
						if (!dataChartDetail[categoryName]) {
							dataChartDetail[categoryName] = {};
						}
						dataChart[categoryName] = (dataChart[categoryName] || 0) + 1;
						dataChartDetail[categoryName][subCateName] = (dataChartDetail[categoryName][subCateName] || 0) + 1;
					}
				});
			} else {
				const end = new Date(endDay); // Ngày kết thúc
				// Đặt end thành cuối ngày
				end.setHours(23, 59, 59, 999);
				const allProducts = await OrderDetail.find({
					idSeller: idUser,
					status: "Đã giao",
					updatedAt: { $gte: new Date(startDay), $lte: new Date(end) },
				})
					.select("_id")
					.populate({
						path: "idProduct",
						select: "name",
						populate: {
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							populate: {
								path: "category",
								model: "Category",
								foreignField: "slug",
							},
						},
					});

				allProducts.forEach((product) => {
					const categoryName = product.idProduct.subCategory?.category?.name;
					const subCateName = product.idProduct.subCategory?.name;
					if (categoryName && subCateName) {
						if (!dataChartDetail[categoryName]) {
							dataChartDetail[categoryName] = {};
						}
						dataChart[categoryName] = (dataChart[categoryName] || 0) + 1;
						dataChartDetail[categoryName][subCateName] = (dataChartDetail[categoryName][subCateName] || 0) + 1;
					}
				});
			}

			{
				return resolve({
					status: "SUCCESS",
					message: "Thống kê danh mục thành công!",
					data: dataChart,
					dataDetail: dataChartDetail,
				});
			}
		} catch (error) {
			console.log(`Have error at analyticCategoryseller service: ${error}`);
		}
	});
};
//thống kê doanh thu theo danh mục cho seller
const analyticCategoryRevenueSeller = (idUser, typeDate, startDay, endDay) => {
	return new Promise(async (resolve, reject) => {
		try {
			let dataChart = {};
			let dataChartDetail = {};

			if (typeDate === "all") {
				const allProducts = await OrderDetail.find({
					idSeller: idUser,
					status: "Đã giao",
				})
					.select("_id quantity productPrice")
					.populate({
						path: "idProduct",
						select: "name",
						populate: {
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							populate: {
								path: "category",
								model: "Category",
								foreignField: "slug",
							},
						},
					});

				allProducts.forEach((product) => {
					const categoryName = product.idProduct.subCategory?.category?.name;
					const subCateName = product.idProduct.subCategory?.name;
					const price = product?.productPrice || 0; // Giá của sản phẩm
					const quantitySold = product.quantity || 0; // Số lượng bán được
					if (categoryName && subCateName) {
						const revenue = price * quantitySold;

						if (!dataChartDetail[categoryName]) {
							dataChartDetail[categoryName] = {};
						}
						dataChart[categoryName] = (dataChart[categoryName] || 0) + revenue;
						dataChartDetail[categoryName][subCateName] = (dataChartDetail[categoryName][subCateName] || 0) + revenue;
					}
				});
			} else {
				const end = new Date(endDay); // Ngày kết thúc
				// Đặt end thành cuối ngày
				end.setHours(23, 59, 59, 999);
				const allProducts = await OrderDetail.find({
					idSeller: idUser,
					status: "Đã giao",
					updatedAt: { $gte: new Date(startDay), $lte: new Date(end) },
				})
					.select("_id quantity productPrice")
					.populate({
						path: "idProduct",
						select: "name",
						populate: {
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							populate: {
								path: "category",
								model: "Category",
								foreignField: "slug",
							},
						},
					});

				allProducts.forEach((product) => {
					const categoryName = product.idProduct.subCategory?.category?.name;
					const subCateName = product.idProduct.subCategory?.name;
					const price = product?.productPrice || 0; // Giá của sản phẩm
					const quantitySold = product.quantity || 0; // Số lượng bán được
					if (categoryName && subCateName) {
						const revenue = price * quantitySold;

						if (!dataChartDetail[categoryName]) {
							dataChartDetail[categoryName] = {};
						}
						dataChart[categoryName] = (dataChart[categoryName] || 0) + revenue;
						dataChartDetail[categoryName][subCateName] = (dataChartDetail[categoryName][subCateName] || 0) + revenue;
					}
				});
			}

			{
				return resolve({
					status: "SUCCESS",
					message: "Thống kê danh mục thành công!",
					data: dataChart,
					dataDetail: dataChartDetail,
				});
			}
		} catch (error) {
			console.log(`Have error at analyticCategoryAdmin service: ${error}`);
		}
	});
};

//thống kê sản phẩm theo danh mục cho seller
const analyticCategoryBuyer = (idUser, typeDate, startDay, endDay) => {
	return new Promise(async (resolve, reject) => {
		try {
			let dataChart = {};
			let dataChartDetail = {};

			if (typeDate === "all") {
				const allProducts = await OrderDetail.find({
					status: OrderStatus[3],
				})
					.select("_id")
					.populate({
						path: "idOrder",
						select: "_id",
						match: { idBuyer: idUser },
					})
					.populate({
						path: "idProduct",
						select: "name",
						populate: {
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							populate: {
								path: "category",
								model: "Category",
								foreignField: "slug",
							},
						},
					});

				allProducts.forEach((product) => {
					if (product.idOrder) {
						const categoryName = product.idProduct.subCategory?.category?.name;
						const subCateName = product.idProduct.subCategory?.name;

						if (categoryName && subCateName) {
							if (!dataChartDetail[categoryName]) {
								dataChartDetail[categoryName] = {};
							}
							dataChart[categoryName] = (dataChart[categoryName] || 0) + 1;
							dataChartDetail[categoryName][subCateName] = (dataChartDetail[categoryName][subCateName] || 0) + 1;
						}
					}
				});
			} else {
				const end = new Date(endDay); // Ngày kết thúc
				// Đặt end thành cuối ngày
				end.setHours(23, 59, 59, 999);

				const allProducts = await OrderDetail.find({
					status: OrderStatus[3],
					updatedAt: { $gte: new Date(startDay), $lte: new Date(end) + 1 },
				})
					.select("_id")
					.populate({
						path: "idOrder",
						select: "_id",
						match: { idBuyer: idUser },
					})
					.populate({
						path: "idProduct",
						select: "name",
						populate: {
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							populate: {
								path: "category",
								model: "Category",
								foreignField: "slug",
							},
						},
					});

				allProducts.forEach((product) => {
					console.log("product.idOrder", product.idOrder);
					if (product.idOrder) {
						const categoryName = product.idProduct.subCategory?.category?.name;
						const subCateName = product.idProduct.subCategory?.name;
						if (categoryName && subCateName) {
							if (!dataChartDetail[categoryName]) {
								dataChartDetail[categoryName] = {};
							}
							dataChart[categoryName] = (dataChart[categoryName] || 0) + 1;
							dataChartDetail[categoryName][subCateName] = (dataChartDetail[categoryName][subCateName] || 0) + 1;
						}
					}
				});
			}

			{
				return resolve({
					status: "SUCCESS",
					message: "Thống kê danh mục thành công!",
					data: dataChart,
					dataDetail: dataChartDetail,
				});
			}
		} catch (error) {
			console.log(`Have error at analyticCategoryBuyer service: ${error}`);
		}
	});
};
//thống kê doanh thu theo danh mục cho seller
const analyticCategoryRevenueBuyer = (idUser, typeDate, startDay, endDay) => {
	return new Promise(async (resolve, reject) => {
		try {
			let dataChart = {};
			let dataChartDetail = {};

			if (typeDate === "all") {
				const allProducts = await OrderDetail.find({
					status: OrderStatus[3],
				})
					.select("_id")
					.populate({
						path: "idOrder",
						select: "_id totalPaid",
						match: { idBuyer: idUser },
					})
					.populate({
						path: "idProduct",
						select: "name",
						populate: {
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							populate: {
								path: "category",
								model: "Category",
								foreignField: "slug",
							},
						},
					});

				allProducts.forEach((item) => {
					if (item.idOrder) {
						const categoryName = item.idProduct.subCategory?.category?.name;
						const subCateName = item.idProduct.subCategory?.name;

						const price = item?.idOrder.totalPaid || 0; // Giá của sản phẩm
						if (categoryName && subCateName) {
							if (!dataChartDetail[categoryName]) {
								dataChartDetail[categoryName] = {};
							}
							dataChart[categoryName] = (dataChart[categoryName] || 0) + price;
							dataChartDetail[categoryName][subCateName] = (dataChartDetail[categoryName][subCateName] || 0) + price;
						}
					}
				});
			} else {
				const end = new Date(endDay); // Ngày kết thúc
				// Đặt end thành cuối ngày
				end.setHours(23, 59, 59, 999);
				const allProducts = await OrderDetail.find({
					status: OrderStatus[3],
					updatedAt: { $gte: new Date(startDay), $lte: new Date(end) },
				})
					.select("_id")
					.populate({
						path: "idOrder",
						select: "_id totalPaid",
						match: { idBuyer: idUser },
					})
					.populate({
						path: "idProduct",
						select: "name",
						populate: {
							path: "subCategory",
							model: "Sub_category",
							foreignField: "slug",
							populate: {
								path: "category",
								model: "Category",
								foreignField: "slug",
							},
						},
					});

				allProducts.forEach((item) => {
					if (item.idOrder) {
						const categoryName = item.idProduct.subCategory?.category?.name;
						const subCateName = item.idProduct.subCategory?.name;
						const price = item?.idOrder.totalPaid || 0; // Giá của order

						if (categoryName && subCateName) {
							if (!dataChartDetail[categoryName]) {
								dataChartDetail[categoryName] = {};
							}
							dataChart[categoryName] = (dataChart[categoryName] || 0) + price;
							dataChartDetail[categoryName][subCateName] = (dataChartDetail[categoryName][subCateName] || 0) + price;
						}
					}
				});
			}

			{
				return resolve({
					status: "SUCCESS",
					message: "Thống kê danh mục thành công!",
					data: dataChart,
					dataDetail: dataChartDetail,
				});
			}
		} catch (error) {
			console.log(`Have error at analyticCategoryAdmin service: ${error}`);
		}
	});
};

//thống kê SP cho người mua
const analyticProductBuyer = (idUser, typeDate, startDay) => {
	return new Promise(async (resolve, reject) => {
		try {
			let totalPaid = 0;
			let totalBrought = {};

			//số lượng SP đã mua
			const productBrought = await OrderDetail.find({
				status: OrderStatus[3],
			}).populate({
				path: "idOrder",
				match: { idBuyer: idUser },
			});

			const productBroughtCount = productBrought.filter((order) => order.idOrder !== null).length;

			//.countDocuments(); // Đếm số tài liệu sau khi đã tìm và populate

			//số lượng SP đang chờ xử lý
			const productWaiting = await OrderDetail.find({
				status: OrderStatus[0],
			}).populate({
				path: "idOrder",
				match: { idBuyer: idUser },
			});
			const productWaitingCount = productWaiting.filter((order) => order.idOrder !== null).length;

			//số lượng SP đã hủy
			const productCancel = await OrderDetail.find({
				status: OrderStatus[4],
			}).populate({
				path: "idOrder",
				match: { idBuyer: idUser },
			});
			const productCancelCount = productCancel.filter((order) => order.idOrder !== null).length;

			//tổng tiền đã chi khi mua SP
			const getData = await OrderDetail.find({ status: OrderStatus[3] })
				.populate({
					path: "idOrder",
					match: { idBuyer: idUser },
					select: "totalPaid",
				})
				.select("_id");

			totalPaid = getData.reduce((sum, order) => {
				// Chỉ cộng totalPaid nếu idOrder không null
				return sum + (order.idOrder?.totalPaid || 0);
			}, 0);

			if (typeDate === "week") {
				//hiển thị sản phẩm theo các ngày trong 1 tuần
				const startOfWeek = new Date(startDay);
				const endDay = new Date(startOfWeek);
				endDay.setDate(startOfWeek.getDate() + 6);
				const endOfWeek = new Date(endDay.setHours(23, 59, 59, 999));

				//sản phẩm đã mua
				const data = await OrderDetail.find({
					updatedAt: { $gte: startOfWeek, $lte: endOfWeek },
					status: OrderStatus[3],
				}).populate({
					path: "idOrder",
					match: { idBuyer: idUser },
				});
				allProducts = data.filter((order) => order.idOrder !== null);
				for (let date = new Date(startOfWeek); date < new Date(endOfWeek); date.setDate(date.getDate() + 1)) {
					totalProduct = allProducts.filter((item) => {
						const productBrougthDate = new Date(item.updatedAt);
						return productBrougthDate.toDateString() === date.toDateString();
					});
					totalBrought[format("dd/MM/yyyy", date)] = totalProduct.length;
				}
			} else if (typeDate === "month") {
				//hiển thị sản phẩm theo 12 tháng gần nhất
				const current = new Date();
				const currentMonth = current.getMonth();
				const currentYear = current.getFullYear();

				const months = [];

				for (let i = 0; i < 12; i++) {
					const month = (currentMonth - i + 12) % 12;
					const year = currentYear - Math.floor((i + 12 - currentMonth) / 12);
					const monthString = `${month + 1}/${year}`;
					months.push(monthString);
				}
				//sản phẩm đã mua
				const data = await OrderDetail.find({
					status: OrderStatus[3],
				}).populate({
					path: "idOrder",
					match: { idBuyer: idUser },
				});

				let allProducts = data.filter((order) => order.idOrder !== null);

				months.reverse().forEach((month) => {
					const ProductsInMonth = allProducts.filter((item) => {
						const orderMonth = new Date(item.idOrder.updatedAt);
						return formatDate(orderMonth) === month;
					});
					totalBrought[month] = ProductsInMonth.length;
				});
			}

			{
				return resolve({
					status: "SUCCESS",
					message: "Thống kê sản phẩm đã mua thành công!",
					stateOrders: {
						brought: productBroughtCount,
						waiting: productWaitingCount,
						cancel: productCancelCount,
					},
					totalPaid: totalPaid,
					totalBrought: totalBrought || [],
				});
			}
		} catch (error) {
			console.log(`Have error at analyticOrder service: ${error}`);
		}
	});
};

//thống kê tổng chi của người mua
const analyticTotalPaid = (idBuyer, typeDate, startDay) => {
	return new Promise(async (resolve, reject) => {
		try {
			let totalPaidChart = {};
			if (typeDate === "week") {
				const startOfWeek = new Date(startDay);
				const endDay = new Date(startOfWeek);
				endDay.setDate(startOfWeek.getDate() + 6);
				const endOfWeek = new Date(endDay.setHours(23, 59, 59, 999));

				//tổng tiền đã chi
				allOrders = await OrderDetail.find({ status: OrderStatus[3], updatedAt: { $gte: startOfWeek, $lte: endOfWeek } })
					.populate({
						path: "idOrder",
						match: { idBuyer: idBuyer },
						select: "totalPaid",
					})
					.select("_id updatedAt");

				for (let date = new Date(startOfWeek); date <= new Date(endOfWeek); date.setDate(date.getDate() + 1)) {
					const res = allOrders.filter((item) => {
						if (item.idOrder) {
							const orderCheck = new Date(item.updatedAt);
							return orderCheck.toDateString() === date.toDateString();
						}
					});
					const totalRevenueForDay = res.reduce((total, item) => total + item.idOrder.totalPaid, 0);
					totalPaidChart[format("dd/MM/yyyy", date)] = totalRevenueForDay;
				}
			} else if (typeDate === "month") {
				//hiển thị sản phẩm theo 12 tháng gần nhất
				const current = new Date();
				const currentMonth = current.getMonth();
				const currentYear = current.getFullYear();
				const months = [];
				for (let i = 0; i < 12; i++) {
					const month = (currentMonth - i + 12) % 12;
					const year = currentYear - Math.floor((i + 12 - currentMonth) / 12);
					const monthString = `${month + 1}/${year}`;
					months.push(monthString);
				}
				//doanh thu đơn hàng
				allOrders = await OrderDetail.find({ status: OrderStatus[3] })
					.populate({
						path: "idOrder",
						match: { idBuyer: idBuyer },
						select: "totalPaid",
					})
					.select("_id updatedAt");

				months.reverse().forEach((month) => {
					const res = allOrders.filter((item) => {
						if (item.idOrder) {
							const orderMonth = new Date(item.updatedAt);
							return formatDate(orderMonth) === month;
						}
					});
					const RevenueInMonth = res.reduce((total, item) => total + item.idOrder.totalPaid, 0);

					totalPaidChart[month] = RevenueInMonth;
				});
			}

			{
				return resolve({
					status: "SUCCESS",
					message: "Thống kê tổng chi tiêu thành công!",
					totalPaidChart: totalPaidChart || [],
				});
			}
		} catch (error) {
			console.log(`Have error at analyticOrder service: ${error}`);
		}
	});
};

module.exports = {
	analyticProduct,
	analyticOrder,
	analyticProductAdmin,
	analyticOrderAdmin,
	analyticCategoryAdmin,
	analyticProductBuyer,
	analyticTotalPaid,
	analyticCategorySeller,
	analyticCategoryRevenueSeller,
	analyticCategoryBuyer,
	analyticCategoryRevenueBuyer,
};
