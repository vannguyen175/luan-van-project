const express = require("express");
const router = express.Router();
const orderDetailController = require("../controllers/OrderDetailController");

// => api/order-detail
router.post("/create", orderDetailController.createOrderDetail);
router.post("/getAll", orderDetailController.getOrdersDetail);
router.post("/cancel", orderDetailController.cancelOrder);
router.put("/update/:id", orderDetailController.updateOrderDetail); //đơn hàng đã bán của người bán
router.post("/search", orderDetailController.searchOrderDetail); //đơn hàng đã bán của người bán
// router.post("/analytics", orderController.analyticOrder);
// router.get("/chart-analytics/:id", orderController.ChartAnalyticOrder);

module.exports = router;
