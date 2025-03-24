const Notification = require("../models/NotificationModel");
const NotificationService = require("../services/NotificationService");

const addNotification = async (req, res) => {
	try {
		const data = req.body; // Lấy dữ liệu từ body của yêu cầu
		const response = await NotificationService.addNotification(data);
		return res.status(200).json(response);
	} catch (error) {
		console.log("error at controller: ", error);
		return res.status(404).json({ message: error });
	}
};
const getNotification = async (req, res) => {
	try {
		const { user } = req.body; // Lấy dữ liệu từ body của yêu cầu
		const page = req.query.page || 1;
		const limit = req.query.limit || 10;
		const response = await NotificationService.getNotification(user, page, limit);
		return res.status(200).json(response);
	} catch (error) {
		console.log("error at controller: ", error);
		return res.status(404).json({ message: error });
	}
};
const updateNotification = async (req, res) => {
	try {
		const { user, infoID } = req.body; // Lấy dữ liệu từ body của yêu cầu
		const response = await NotificationService.updateNotification(user, infoID);
		return res.status(200).json(response);
	} catch (error) {
		console.log("error at controller: ", error);
		return res.status(404).json({ message: error });
	}
};

module.exports = {
	addNotification,
	getNotification,
	updateNotification,
};
