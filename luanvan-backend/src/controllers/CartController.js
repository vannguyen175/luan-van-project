const CartService = require("../services/CartService");

//url: /sub-category/create
const createCart = async (req, res) => {
	try {
		const { id, idProduct, quantity } = req.body;

		if (!idProduct || !id || !quantity) {
			return res.status(200).json({
				status: "ERR",
				message: "The input is required",
			});
		}

		const response = await CartService.createCart(id, idProduct, quantity);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
const updateCart = async (req, res) => {
	try {
		const { idUser, product } = req.body;

		if (!idUser || !product) {
			return res.status(200).json({
				status: "ERR",
				message: "The input is required",
			});
		}

		const response = await CartService.updateCart(idUser, product);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};

const getCart = async (req, res) => {
	try {
		const id = req.params.id;
		if (!id) {
			return res.status(200).json({
				status: "ERR",
				message: "idUser is required",
			});
		}
		const response = await CartService.getCart(id);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};

const deleteCart = async (req, res) => {
	try {
		const { idUser, idProduct } = req.body;

		if (!idUser || !idProduct) {
			return res.status(200).json({
				status: "ERR",
				message: "The input is required",
			});
		}
		const response = await CartService.deleteCart(idUser, idProduct);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};

module.exports = { createCart, getCart, deleteCart, updateCart };
