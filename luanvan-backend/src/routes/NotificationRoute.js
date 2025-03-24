const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/NotificationController");

router.post("/create", NotificationController.addNotification);
router.post("/getAll", NotificationController.getNotification);
router.post("/update", NotificationController.updateNotification); //seen notification

module.exports = router;
