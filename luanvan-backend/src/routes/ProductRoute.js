const express = require("express");
const router = express.Router();
const productController = require("../controllers/ProductController");
const upload = require("../config/cloundiary/multer");

router.post("/create", upload.array("images"), productController.createProduct);
router.put("/update/:id", productController.updateProduct);
//router.get("/getAll/:slug", productController.getAllProductsBySubCate);
router.post("/getAll", productController.getAllProducts);
router.get("/detail/:id", productController.detailProduct);
router.get("/getAll/seller/:id", productController.getProductSeller);

module.exports = router;
