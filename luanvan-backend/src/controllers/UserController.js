const UserService = require("../services/UserService.js");
const JwtService = require("../services/JwtService.js");

const checkBanStatus = async (req, res) => {
	try {
		const idUser = req.params.id;

		if (!idUser) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Thiếu id người dùng.",
			});
		}
		const response = await UserService.checkBanStatus(idUser);
		return res.status(200).json(response);
	} catch (error) {
		console.log("Error at checkBanStatus controller", error);

		return res.status(404).json({ message: error });
	}
};
const checkEmailExist = async (req, res) => {
	try {
		const { email } = req.body;
		const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
		const isCheckEmail = regexEmail.test(email);
		if (!email) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Thiếu email.",
			});
		}
		if (!isCheckEmail) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Email không hợp lệ.",
			});
		}

		const response = await UserService.checkEmailExist(email.toLowerCase());
		return res.status(200).json(response);
	} catch (error) {
		console.log("Error at checkEmailExist controller", error);
		return res.status(404).json({ message: error });
	}
};
const createUser = async (req, res) => {
	try {
		const { name, email, password, confirmPassword, phone } = req.body;
		const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
		const isCheckEmail = regexEmail.test(email);
		if (!name || !email || !password || !confirmPassword || !phone) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Vui lòng điền đầy đủ thông tin.",
			});
		}
		if (!isCheckEmail) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Email không hợp lệ.",
			});
		}
		if (password != confirmPassword) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Mật khẩu nhập lại không hợp lệ.",
			});
		}
		const response = await UserService.createUser(req.body);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const loginUser = async (req, res) => {
	try {
		const { email, password, isForgotPass } = req.body; //destructuring
		const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
		const isCheckEmail = regexEmail.test(email);
		if (!email || !password) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Vui lòng điền đầy đủ thông tin.",
			});
		} else if (!isCheckEmail) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Email không hợp lệ.",
			});
		}
		const response = await UserService.loginUser(req.body);
		const { refresh_token, ...newResponse } = response;

		//lưu refresh_token vào cookie phía trình duyệt
		res.cookie("refresh_token", refresh_token, {
			httpOnly: true, // Bảo mật: cookie chỉ có thể được truy cập bởi HTTP, không phải JavaScript
			secure: false, // Bảo mật: cookie chỉ được gửi qua HTTPS (bỏ qua khi thử nghiệm trên localhost)
			sameSite: "strict", // Bảo vệ chống tấn công CSRF
		});

		return res.status(200).json(newResponse);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};
const loginWithGoogle = async (req, res) => {
	try {
		const { email, name, picture } = req.body;
		const response = await UserService.loginWithGoogle(email.toLowerCase(), name, picture);
		const { refresh_token, ...newResponse } = response;
		res.cookie("refresh_token", refresh_token, {
			httpOnly: true,
			secure: false,
			sameSite: "strict",
		});
		return res.status(200).json(newResponse);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};
const loginWithFacebook = async (req, res) => {
	try {
		const { email, name, picture } = req.body;
		const response = await UserService.loginWithFacebook(email.toLowerCase(), name, picture);
		const { refresh_token, ...newResponse } = response;
		res.cookie("refresh_token", refresh_token, {
			httpOnly: true,
			secure: false,
			sameSite: "strict",
		});
		return res.status(200).json(newResponse);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};
const loginAdmin = async (req, res) => {
	try {
		const { email, password } = req.body.data; //destructuring
		const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
		const isCheckEmail = regexEmail.test(email);

		if (!email || !password) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Vui lòng điền đầy đủ thông tin.",
			});
		} else if (!isCheckEmail) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Email không hợp lệ.",
			});
		}
		const response = await UserService.loginAdmin(req.body.data);
		const { refresh_token, ...newResponse } = response;

		//lưu refresh_token vào cookie phía trình duyệt
		res.cookie("refresh_token", refresh_token, {
			httpOnly: true, // Bảo mật: cookie chỉ có thể được truy cập bởi HTTP, không phải JavaScript
			secure: false, // Bảo mật: cookie chỉ được gửi qua HTTPS (bỏ qua khi thử nghiệm trên localhost)
			sameSite: "strict", // Bảo vệ chống tấn công CSRF
		});

		return res.status(200).json(newResponse);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const updateUser = async (req, res) => {
	try {
		const userID = req.params.id;
		const data = req.body;
		const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
		const isCheckEmail = regexEmail.test(data.email);
		if (data.password != data.confirmPassword) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Mật khẩu nhập lại không hợp lệ.",
			});
		}
		if (!data.name || !data.email) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Vui lòng điền đầy đủ thông tin.",
			});
		}
		if (!isCheckEmail) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Email không hợp lệ.",
			});
		}
		const response = await UserService.updateUser(userID, data);

		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const deleteUser = async (req, res) => {
	try {
		const userID = req.params.id;
		if (!userID) {
			return res.status(200).json({
				status: `ERROR`,
				message: "The user_id is requied",
			});
		}
		const response = await UserService.deleteUser(userID);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const getAllUsers = async (req, res) => {
	try {
		const role = req.body.role;
		const page = req.query.page || 1;
		const limit = req.query.limit || 5;
		const response = await UserService.getAllUsers(role, page, limit);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};
const getAllSellers = async (req, res) => {
	try {
		const page = req.query.page || 1;
		const limit = req.query.limit || 10;
		const response = await UserService.getAllSellers(page, limit);
		return res.status(200).json(response);
	} catch (error) {
		console.log("Error at getAllSellers Controller: ", error);

		return res.status(404).json({ message: error });
	}
};
const sellerDetail = async (req, res) => {
	try {
		const idSeller = req.params.id;
		const response = await UserService.sellerDetail(idSeller);
		return res.status(200).json(response);
	} catch (error) {
		console.log("Error at sellerDetail Controller: ", error);

		return res.status(404).json({ message: error });
	}
};

const detailUser = async (req, res) => {
	try {
		const userID = req.params.id;
		const response = await UserService.detailUser(userID);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};
const logoutUser = async (req, res) => {
	try {
		localStorage.clear("access_token");
		return res.status(200).json({
			status: "SUCCESS",
			message: "Logout successfully",
		});
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const infoUser = async (req, res) => {
	try {
		const userID = req.params.id;
		const response = await UserService.infoUser(userID);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const searchUser = async (req, res) => {
	try {
		const key = req.params.key;
		const response = await UserService.searchUser(key);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const refreshToken = async (req, res) => {
	try {
		const token = req.cookies.refresh_token;
		if (!token) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Token is requied",
			});
		}
		const response = await JwtService.refreshTokenService(token);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: error });
	}
};
const blockUser = async (req, res) => {
	try {
		const idUser = req.params.id;
		const { dateExpire, blockReason } = req.body;

		const response = await UserService.blockUser(idUser, dateExpire, blockReason);
		return res.status(200).json(response);
	} catch (error) {
		console.log("Error at blockUser", error);
		return res.status(404).json({ message: error });
	}
};

module.exports = {
	createUser,
	loginUser,
	loginWithGoogle,
	loginWithFacebook,
	loginAdmin,
	updateUser,
	deleteUser,
	getAllUsers,
	detailUser,
	logoutUser,
	infoUser,
	searchUser,
	refreshToken,
	getAllSellers,
	sellerDetail,
	blockUser,
	checkBanStatus,
	checkEmailExist,
};
