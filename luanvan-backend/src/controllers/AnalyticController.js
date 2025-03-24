const AnalyticService = require("../services/AnalyticService");

const analyticProduct = async (req, res) => {
	try {
		const { idUser, typeDate, startDay, endDay } = req.body;

		if (!idUser || !typeDate) {
			return res.status(200).json({
				status: "ERROR",
				message: "Vui lòng nhập đầy đủ thông tin",
			});
		}
		const response = await AnalyticService.analyticProduct(idUser, typeDate, startDay, endDay);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
const analyticOrder = async (req, res) => {
	try {
		const { idSeller, typeDate, startDay } = req.body;

		if (!idSeller || !typeDate) {
			return res.status(200).json({
				status: "ERROR",
				message: "Vui lòng nhập đầy đủ thông tin",
			});
		}
		const response = await AnalyticService.analyticOrder(idSeller, typeDate, startDay);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
const analyticProductAdmin = async (req, res) => {
	try {
		const { typeDate, startDay } = req.body;

		if (!typeDate) {
			return res.status(200).json({
				status: "ERROR",
				message: "Vui lòng nhập đầy đủ thông tin",
			});
		}
		const response = await AnalyticService.analyticProductAdmin(typeDate, startDay);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
const analyticOrderAdmin = async (req, res) => {
	try {
		const { typeDate, startDay } = req.body;

		if (!typeDate) {
			return res.status(200).json({
				status: "ERROR",
				message: "Vui lòng nhập đầy đủ thông tin",
			});
		}
		const response = await AnalyticService.analyticOrderAdmin(typeDate, startDay);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
const analyticCategoryAdmin = async (req, res) => {
	try {
		const { typeDate, startDay, endDay } = req.body;
		const response = await AnalyticService.analyticCategoryAdmin(typeDate, startDay, endDay);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
const analyticCategorySeller = async (req, res) => {
	try {
		const { idUser, typeDate, startDay, endDay } = req.body;
		const response = await AnalyticService.analyticCategorySeller(idUser, typeDate, startDay, endDay);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
const analyticCategoryRevenueSeller = async (req, res) => {
	try {
		const { idUser, typeDate, startDay, endDay } = req.body;
		const response = await AnalyticService.analyticCategoryRevenueSeller(idUser, typeDate, startDay, endDay);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};

const analyticCategoryBuyer = async (req, res) => {
	try {
		const { idUser, typeDate, startDay, endDay } = req.body;
		const response = await AnalyticService.analyticCategoryBuyer(idUser, typeDate, startDay, endDay);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
const analyticCategoryRevenueBuyer = async (req, res) => {
	try {
		const { idUser, typeDate, startDay, endDay } = req.body;
		const response = await AnalyticService.analyticCategoryRevenueBuyer(idUser, typeDate, startDay, endDay);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
const analyticProductBuyer = async (req, res) => {
	try {
		const { idUser, typeDate, startDay } = req.body;

		if (!idUser || !typeDate) {
			return res.status(200).json({
				status: "ERROR",
				message: "Vui lòng nhập đầy đủ thông tin",
			});
		}
		const response = await AnalyticService.analyticProductBuyer(idUser, typeDate, startDay);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
const analyticTotalPaid = async (req, res) => {
	try {
		const { idBuyer, typeDate, startDay } = req.body;

		if (!idBuyer || !typeDate) {
			return res.status(200).json({
				status: "ERROR",
				message: "Vui lòng nhập đầy đủ thông tin",
			});
		}
		const response = await AnalyticService.analyticTotalPaid(idBuyer, typeDate, startDay);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
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
