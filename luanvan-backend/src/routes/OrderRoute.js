const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderController");

router.post("/create", orderController.createOrder);
router.post("/getAll", orderController.getOrders);
router.put("/update/:id", orderController.updateOrder); //đơn hàng đã bán của người bán
router.get("/chart-analytics/:id", orderController.ChartAnalyticOrder);

module.exports = router;
