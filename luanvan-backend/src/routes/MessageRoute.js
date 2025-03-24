const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/MessageController");

router.get("/getChat/:user1/:user2", MessageController.getChat);
router.get("/getChat-unseen/:id", MessageController.getChatUnseen); //update đoạn chat từ unseen thành seen

module.exports = router;
