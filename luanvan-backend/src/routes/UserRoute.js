const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const { authMiddleware, authUserMiddleWare } = require("../config/middleware/authMiddleware");

router.get("/check-banned/:id", userController.checkBanStatus); //kiểm tra xem người dùng có đang bị khóa
router.post("/check-email", userController.checkEmailExist); //kiểm tra tồn tại email, dùng trong chức năng 'forgotten password'
router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.post("/login/google", userController.loginWithGoogle);
router.post("/login/facebook", userController.loginWithFacebook);
router.post("/login-admin", userController.loginAdmin);
router.post("/logout", userController.logoutUser);
router.put("/update/:id", authUserMiddleWare, userController.updateUser);
router.delete("/delete/:id", authMiddleware, userController.deleteUser);
router.post("/getAll", authMiddleware, userController.getAllUsers);
router.post("/getAllSeller", userController.getAllSellers);
router.get("/seller-details/:id", userController.sellerDetail);
router.get("/details/:id", authUserMiddleWare, userController.detailUser);
router.get("/info/:id", userController.infoUser);
router.get("/search/:key", authMiddleware, userController.searchUser);
router.post("/refresh-token", userController.refreshToken);
router.put("/block/:id", authMiddleware, userController.blockUser);

module.exports = router;
