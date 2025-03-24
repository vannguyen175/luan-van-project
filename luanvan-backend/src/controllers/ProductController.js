const ProductService = require("../services/ProductService");
const cloudinary = require("../config/cloundiary/cloundiary.config");
const { Server } = require("socket.io");

// Socket.IO
const io = new Server({
	cors: {
		origin: "http://localhost:3006", //localhost fontend
	},
});

const createProduct = async (req, res) => {
	try {
		const { name, images, subCategory, info, price, address, quantity } = req.body;
		const imageUrls = [];
		if (images) {
			try {
				for (const image of images) {
					const result = await cloudinary.uploader.upload(image, {
						resource_type: "auto",
					});
					imageUrls.push(result.secure_url);
				}
				req.body.images = imageUrls;
			} catch (error) {
				console.log("HAVE AN ERROR =>", error);
			}
		}
		if (!name || !images || !subCategory || !price || !address || !info || !quantity) {
			return res.status(200).json({
				status: "ERROR",
				message: "Vui lòng nhập đầy đủ thông tin",
			});
		}
		const response = await ProductService.createProduct(req.body);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};

const updateProduct = async (req, res) => {
	try {
		const productID = req.params.id;
		const data = req.body.data;

		const response = await ProductService.updateProduct(productID, data);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};
const deleteProduct = (req, res) => {
	try {
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};
// const getAllProductsBySubCate = async (req, res) => {
// 	try {
// 		const { limit, page, sort, filter } = req.query;
// 		const slug = req.params.slug; //subCategory's slug
// 		const response = await ProductService.getAllProductsBySubCate(slug, Number(limit) || 10, Number(page) || 1, sort, filter);
// 		return res.status(200).json(response);
// 	} catch (error) {
// 		return res.status(404).json({ message: error });
// 	}
// };

const getAllProducts = async (req, res) => {
	try {
		const { state, cate, subCate, sort, seller, province, price, isUsed, isBlocked } = req.body.data;
		const page = req.query.page || 1;
		const limit = req.query.limit || 10;
		const response = await ProductService.getAllProducts(state, cate, subCate, page, limit, sort, seller, province, price, isUsed, isBlocked);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};
const detailProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const response = await ProductService.detailProduct(id);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};
const getProductSeller = async (req, res) => {
	try {
		const { id } = req.params;
		const response = await ProductService.getProductSeller(id);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

module.exports = {
	createProduct,
	updateProduct,
	deleteProduct,
	//getAllProductsBySubCate,
	getAllProducts,
	detailProduct,
	getProductSeller,
};
