const Order = require("../models/OrderModel");
const OrderService = require("../services/OrderService");

const createOrder = async (req, res) => {
	try {
		const { shippingDetail, paymentMethod, idBuyer, totalPaid, products } = req.body;		
		if (!shippingDetail || !paymentMethod || !idBuyer || !totalPaid || !products) {
			return res.status(200).json({
				status: "ERROR",
				message: "Vui lòng nhập đầy đủ thông tin",
			});
		}
		const response = await OrderService.createOrder(req.body);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};

//lấy thông tin các đơn hàng
const getOrders = async (req, res) => {
	try {
		const { seller, buyer, status } = req.body.data;
		const page = req.query.page || 1;
		const limit = req.query.limit || 10;
		const response = await OrderService.getOrders(seller, buyer, status, page, limit);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};

const updateOrder = async (req, res) => {
	try {
		const idOrder = req.params.id;
		const data = req.body; // Lấy dữ liệu từ body của yêu cầu

		const response = await OrderService.updateOrder(idOrder, req.body);
		return res.status(200).json(response);
	} catch (error) {
		console.log("error at controller: ", error);
		return res.status(404).json({ message: error });
	}
};

const ChartAnalyticOrder = async (req, res) => {
	try {
		const idUser = req.params.id;
		const response = await OrderService.ChartAnalyticOrder(idUser);
		return res.status(200).json(response);
	} catch (error) {
		console.log("error at controller: ", error);
		return res.status(404).json({ message: error });
	}
};

module.exports = {
	createOrder,
	updateOrder,
	ChartAnalyticOrder,
	getOrders,
	
};
