const RatingService = require("../services/RatingService");

//url: /sub-category/create
const createRating = async (req, res) => {
	try {
		const { review, score, idOrder, idProduct, idBuyer } = req.body; //slug category
		if (!score) {
			return res.status(200).json({
				status: "ERROR",
				message: "Vui lòng nhập điểm đánh giá",
			});
		}
		const response = await RatingService.createRating(review, score, idOrder, idProduct, idBuyer);
		return res.status(200).json(response);
	} catch (error) {
		console.log("Error at createRating controller", error);
		return res.status(404).json({ message: error });
	}
};
//url: /sub-category/update
const updateRating = async (req, res) => {
	try {
		const { idRating, review, score } = req.body; //slug category
		if (!score) {
			return res.status(200).json({
				status: "ERROR",
				message: "Vui lòng nhập điểm đánh giá",
			});
		}
		const response = await RatingService.updateRating(idRating, review, score);
		return res.status(200).json(response);
	} catch (error) {
		console.log("Error at updateRating controller", error);
		return res.status(404).json({ message: error });
	}
};
//url: /sub-category/update
const getRatingSeller = async (req, res) => {
	try {
		const idSeller = req.params.id;
		if (!idSeller) {
			return res.status(200).json({
				status: "ERROR",
				message: "Thiếu ID người bán",
			});
		}
		const response = await RatingService.getRatingSeller(idSeller);
		return res.status(200).json(response);
	} catch (error) {
		console.log("Error at updateRating controller", error);
		return res.status(404).json({ message: error });
	}
};

module.exports = {
	createRating,
	updateRating,
	getRatingSeller,
};
