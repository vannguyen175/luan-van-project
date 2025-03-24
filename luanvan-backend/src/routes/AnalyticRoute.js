const express = require("express");
const router = express.Router();
const analyticController = require("../controllers/AnalyticController");

router.post("/product", analyticController.analyticProduct);
router.post("/order", analyticController.analyticOrder);
router.post("/product-admin", analyticController.analyticProductAdmin);
router.post("/order-admin", analyticController.analyticOrderAdmin);
router.post("/category-admin", analyticController.analyticCategoryAdmin);
router.post("/category-seller", analyticController.analyticCategorySeller);
router.post("/category-revenue-seller", analyticController.analyticCategoryRevenueSeller);
router.post("/category-buyer", analyticController.analyticCategoryBuyer);
router.post("/category-revenue-buyer", analyticController.analyticCategoryRevenueBuyer);
router.post("/product-buyer", analyticController.analyticProductBuyer);
router.post("/total-paid-buyer", analyticController.analyticTotalPaid);
// router.put("/update", cartController.updateCart);
// router.get("/:id", cartController.getCart); //idUser
// router.put("/delete", cartController.deleteCart);

module.exports = router;
