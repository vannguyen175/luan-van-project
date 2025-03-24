const express = require("express");
const router = express.Router();
const cartController = require("../controllers/CartController");
const { authMiddleware } = require("../config/middleware/authMiddleware");

router.post("/create", cartController.createCart);
router.put("/update", cartController.updateCart);
router.get("/:id", cartController.getCart); //idUser
router.put("/delete", cartController.deleteCart);

module.exports = router;
