const { LoginTicket } = require("google-auth-library");
const Order = require("../models/OrderModel");
const OrderDetailService = require("../services/OrderDetailService");

const createOrderDetail = async (req, res) => {
	try {
		const { shippingDetail, paymentMethod } = req.body;

		if (!shippingDetail || !paymentMethod) {
			return res.status(200).json({
				status: "ERROR",
				message: "Vui lòng nhập đầy đủ thông tin",
			});
		}
		const response = await OrderDetailService.createOrderDetail(req.body);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};

const getOrdersDetail = async (req, res) => {
	try {
		const { seller, buyer, status } = req.body.data;
		const page = req.query.page || 1;
		const limit = req.query.limit || 10;
		const response = await OrderDetailService.getOrdersDetail(seller, buyer, status, page, limit);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
const updateOrderDetail = async (req, res) => {
	try {
		const idOrder = req.params.id;
		const data = req.body; // Lấy dữ liệu từ body của yêu cầu

		const response = await OrderDetailService.updateOrderDetail(idOrder, req.body);
		return res.status(200).json(response);
	} catch (error) {
		//console.log("error at updateOrderDetail controller: ", error);
		return res.status(404).json({ message: error });
	}
};

const cancelOrder = async (req, res) => {
	try {
		const { reason, idOrder } = req.body;
		if (!reason) {
			return res.status(200).json({
				status: "ERROR",
				message: "Vui lòng chọn lý do hủy đơn.",
			});
		}
		const response = await OrderDetailService.cancelOrder(reason, idOrder);
		return res.status(200).json(response);
	} catch (error) {
		console.log("error at controller: ", error);
		return res.status(404).json({ message: error });
	}
};

const searchOrderDetail = async (req, res) => {
	try {
		const { query, idSeller, status } = req.body.data;
		const response = await OrderDetailService.searchOrderDetail(query, idSeller, status);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};

module.exports = {
	createOrderDetail,
	getOrdersDetail,
	updateOrderDetail,
	cancelOrder,
	searchOrderDetail,
};
