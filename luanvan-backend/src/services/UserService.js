const User = require("../models/UserModel");
const Address = require("../models/AddressModel");
const Seller = require("../models/SellerModel");
const Rating = require("../models/RatingModel");
const { OrderDetail, OrderStatus } = require("../models/OrderDetailModel");

const mongoose = require("mongoose");

const bcrypt = require("bcrypt"); //ma hoa mat khau
const { genneralAccessToken, genneralRefreshToken } = require("./JwtService");

//kiểm tra tài khoản của người dùng xem có bị chặn không
const checkBanStatus = (idUser) => {
	return new Promise(async (resolve, reject) => {
		const userAccount = await User.findById(idUser).select("blockExpireDate blockReason");

		// Kiểm tra nếu tài khoản đang bị khóa
		if (userAccount.blockExpireDate) {
			if (userAccount.blockExpireDate && new Date(userAccount.blockExpireDate) > new Date()) {
				return resolve({
					status: "BLOCKED",
					message: "Tài khoản của bạn đã bị khóa tạm thời.",
					isBlocked: true,
					blockExpireDate: userAccount.blockExpireDate,
					blockReason: userAccount.blockReason,
				});
			} else {
				//Cập nhật lại nếu blockExpireDate hết hạn
				await User.findByIdAndUpdate(idUser, { blockExpireDate: null, blockReason: null }, { new: true });
			}
		} else {
			if (userAccount.blockExpireDate && new Date(userAccount.blockExpireDate) > new Date()) {
				await User.findByIdAndUpdate(idUser, { blockExpireDate: null, blockReason: null }, { new: true });
			}

			return resolve({
				status: "NON-BLOCKED",
				message: "",
				isBlocked: false,
			});
		}
	});
};

//kiểm tra tồn tại email, dùng trong chức năng 'forgotten password'
const checkEmailExist = (email) => {
	return new Promise(async (resolve, reject) => {
		const userAccount = await User.findOne({ email: email }).select("email password loginMethod name avatar");
		if (userAccount) {
			return resolve({
				status: "SUCCESS",
				message: "Tồn tại tài khoản.",
				data: userAccount,
			});
		} else {
			return resolve({
				status: "ERROR",
				message: "Địa chỉ email này chưa được đăng ký.",
			});
		}
	});
};
const createUser = (newUser) => {
	return new Promise(async (resolve, reject) => {
		const { name, email, password, phone, isAdmin, avatar } = newUser;

		try {
			const checkUser = await User.findOne({ email: email });
			if (checkUser !== null) {
				//email da ton tai
				resolve({
					status: "ERROR",
					message: "Địa chỉ email đã tồn tại",
				});
			}
			const checkPhone = await Address.findOne({ phone: phone });
			if (checkPhone !== null) {
				//email da ton tai
				resolve({
					status: "ERROR",
					message: "Số điện thoại đã được đăng ký",
				});
			} else {
				const hash = bcrypt.hashSync(password, 10);
				const createUser = await User.create({
					name,
					email,
					password: hash,
					isAdmin,
					avatar,
				});

				if (createUser) {
					const createAddress = await Address.create({
						user: createUser._id,
						phone,
					});
					if (createAddress) {
						resolve({
							status: "SUCCESS",
							message: "SUCCESS",
							data: createUser,
						});
					}
				}
			}
		} catch (error) {
			reject(error);
		}
	});
};

const loginUser = (loginUser) => {
	return new Promise(async (resolve, reject) => {
		const { email, password, isForgotPass } = loginUser;
		try {
			const checkUser = await User.findOne({ email: email.toLowerCase(), isAdmin: false });

			if (checkUser?.loginMethod && checkUser?.password === undefined) {
				return resolve({
					status: "ERROR",
					message: `Tài khoản của bạn được kết nối với ${checkUser?.loginMethod} - hãy sử dụng nút ${checkUser?.loginMethod} để đăng nhập`,
				});
			} else if (checkUser === null) {
				return resolve({
					status: "ERROR",
					message: "Email hoặc mật khẩu không hợp lệ. Vui lòng thử lại...",
				});
			} else {
				if (!isForgotPass) {
					const isMatch = await bcrypt.compare(password, checkUser?.password);

					if (isMatch === false) {
						return resolve({
							status: "ERROR",
							message: "Email hoặc mật khẩu không hợp lệ. Vui lòng thử lại...",
						});
					}
				}
			}

			//sau khi ktra login hop le
			const access_token = await genneralAccessToken({
				id: checkUser.id,
				isAdmin: checkUser.isAdmin,
			});

			const refresh_token = await genneralRefreshToken({
				id: checkUser.id,
				isAdmin: checkUser.isAdmin,
			});
			resolve({
				status: "SUCCESS",
				message: "SUCCESS",
				access_token,
				refresh_token,
			});
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

const loginWithGoogle = (email, name, picture) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkUser = await User.findOne({ email: email, isAdmin: false });
			let access_token = null;
			let refresh_token = null;
			//nếu account không tồn tại => đăng ký
			if (checkUser === null) {
				const newUser = await User.create({
					email,
					name,
					avatar: picture,
					loginMethod: "Google",
				});
				await Address.create({ user: newUser._id });

				access_token = await genneralAccessToken({
					id: newUser.id,
					isAdmin: newUser.isAdmin,
				});
				refresh_token = await genneralRefreshToken({
					id: newUser.id,
					isAdmin: newUser.isAdmin,
				});
			} else {
				//nếu account có tồn tại => lấy token
				access_token = await genneralAccessToken({
					id: checkUser.id,
					isAdmin: checkUser.isAdmin,
				});
				refresh_token = await genneralRefreshToken({
					id: checkUser.id,
					isAdmin: checkUser.isAdmin,
				});
			}

			resolve({
				status: "SUCCESS",
				message: "Đăng nhập tài khoản thành công!",
				access_token,
				refresh_token,
			});
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};
const loginWithFacebook = (email, name, picture) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkUser = await User.findOne({ email: email, isAdmin: false });
			let access_token = null;
			let refresh_token = null;
			//nếu account không tồn tại => đăng ký
			if (checkUser === null) {
				const newUser = await User.create({
					email,
					name,
					avatar: picture,
					loginMethod: "Facebook",
				});
				await Address.create({ user: newUser._id });
				access_token = await genneralAccessToken({
					id: newUser.id,
					isAdmin: newUser.isAdmin,
				});
				refresh_token = await genneralRefreshToken({
					id: newUser.id,
					isAdmin: newUser.isAdmin,
				});
			} else {
				//nếu account có tồn tại => lấy token
				access_token = await genneralAccessToken({
					id: checkUser.id,
					isAdmin: checkUser.isAdmin,
				});
				refresh_token = await genneralRefreshToken({
					id: checkUser.id,
					isAdmin: checkUser.isAdmin,
				});
			}

			resolve({
				status: "SUCCESS",
				message: "Đăng nhập tài khoản thành công!",

				access_token,
				refresh_token,
			});
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};
const loginAdmin = (loginAdmin) => {
	return new Promise(async (resolve, reject) => {
		const { email, password } = loginAdmin;
		try {
			const checkUser = await User.findOne({ email: email.toLowerCase(), isAdmin: true });
			if (checkUser === null) {
				return resolve({
					status: "ERROR",
					message: "Email hoặc mật khẩu không hợp lệ. Vui lòng thử lại...",
				});
			} else {
				const isMatch = await bcrypt.compare(password, checkUser?.password);

				if (isMatch === false) {
					return resolve({
						status: "ERROR",
						message: "Email hoặc mật khẩu không hợp lệ. Vui lòng thử lại...",
					});
				}
			}
			//sau khi ktra login hop le
			const access_token = await genneralAccessToken({
				id: checkUser.id,
				isAdmin: true,
			});
			const refresh_token = await genneralRefreshToken({
				id: checkUser.id,
				isAdmin: true,
			});

			resolve({
				status: "SUCCESS",
				message: "SUCCESS",
				access_token,
				refresh_token,
			});
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

const updateUser = (userID, data) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkUser = await User.findOne({ _id: userID });
			const checkAddress = await Address.findOne({ user: userID });
			if (checkUser === null) {
				resolve({
					status: "ERROR",
					message: "Người dùng không tồn tại",
				});
			}
			const checkPhoneExist = await Address.findOne({ phone: data.phone });
			if (checkPhoneExist && checkPhoneExist?.user.toString() !== userID) {
				resolve({
					status: "ERROR",
					message: "Số điện thoại đã được sử dụng",
				});
			}
			let updateUser = {};
			let updateAddress = {};
			if (data.password) {
				//TH1: create password 	TH2: update password
				const hash = bcrypt.hashSync(data.password, 10);
				updateUser = await User.findByIdAndUpdate(userID, { ...data, password: hash }, { new: true });
				updateAddress = await Address.findOneAndUpdate({ user: userID }, data, {
					new: true,
				});
			} else {
				//User không nhập password => giữ pass cũ
				if (checkAddress) {
					//tồn tại checkAddress (register thủ công)
					updateUser = await User.findByIdAndUpdate(userID, { ...data, password: checkUser.password }, { new: true });
					updateAddress = await Address.findOneAndUpdate({ user: userID }, data, {
						new: true,
					});
				} else {
					//chưa có checkAddress (user đăng ký qua google, fb)
					updateUser = await User.findByIdAndUpdate(userID, { ...data, password: checkUser.password }, { new: true });
					updateAddress = await Address.create({
						user: userID,
						...data,
					});
				}
			}

			resolve({
				status: "OK",
				message: "SUCCESS",
				dataUser: updateUser,
				dataAddress: updateAddress,
			});
		} catch (error) {
			console.log("error", error);
			reject(error);
		}
	});
};

const deleteUser = (userID) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkUser = await User.findOne({ _id: userID });
			if (checkUser === null) {
				resolve({
					status: "ERROR",
					message: "Người dùng không tồn tại",
				});
			}
			await User.findByIdAndDelete(userID);
			await Address.findOneAndDelete({ user: userID });
			resolve({
				status: "OK",
				message: "Xóa người dùng thành công",
			});
		} catch (error) {
			reject(error);
		}
	});
};

const getAllUsers = (role, page, limit) => {
	return new Promise(async (resolve, reject) => {
		try {
			const perPage = limit; //Số items trên 1 page
			let result = await Address.find({}).populate({
				path: "user",
				match: { isAdmin: role === "admin" },
			});

			result = result.filter((res) => res.user);
			const paginatedResult = result.slice((page - 1) * perPage, page * perPage);
			resolve({
				status: "SUCCESS",
				message: "SUCCESS",
				data: paginatedResult,
				totalCount: result.length,
			});
		} catch (error) {
			console.log("Error at getAllUsers", error);
			reject(error);
		}
	});
};

const getAllSellers = (page, limit) => {
	return new Promise(async (resolve, reject) => {
		try {
			const perPage = limit; //Số items trên 1 page
			const sellers = await Seller.find({}).populate({
				path: "idUser",
				select: "name email avatar blockExpireDate blockReason",
			});

			const result = await Promise.all(
				//result = seller + rating
				sellers.map(async (seller) => {
					const avgRating = await Rating.aggregate([
						{
							$match: { idSeller: new mongoose.Types.ObjectId(seller.idUser._id) },
						},
						{
							$group: {
								_id: "$idSeller",
								averageRating: { $avg: "$score" },
								totalReviews: { $sum: 1 },
							},
						},
					]);

					// Gộp thông tin seller và rating lại
					return {
						...seller.toObject(), // Chuyển seller từ mongoose document sang plain object
						averageRating: avgRating.length > 0 ? avgRating[0].averageRating : null, // Nếu không có rating nào thì giá trị là null
						totalReviews: avgRating.length > 0 ? avgRating[0].totalReviews : 0,
					};
				})
			);

			const paginatedResult = result.slice((page - 1) * perPage, page * perPage);

			resolve({
				status: "SUCCESS",
				message: "SUCCESS",
				data: paginatedResult,
				totalCount: result.length,
			});
		} catch (error) {
			console.log("Have error at getAllSellers service", error);
			reject(error);
		}
	});
};
const sellerDetail = (idSeller) => {
	return new Promise(async (resolve, reject) => {
		try {
			const sellers = await Seller.findOne({ idUser: idSeller });
			const avgRating = await Rating.aggregate([
				{
					$match: { idSeller: new mongoose.Types.ObjectId(idSeller) },
				},
				{
					$group: {
						_id: "$idSeller",
						averageRating: { $avg: "$score" },
						totalReviews: { $sum: 1 },
					},
				},
			]);
			resolve({
				status: "SUCCESS",
				message: "SUCCESS",
				data: {
					sellers,
					averageRating: avgRating[0]?.averageRating || null,
					totalReviews: avgRating[0]?.totalReviews || 0,
				},
			});
		} catch (error) {
			console.log("Have error at sellerDetail service", error);
			reject(error);
		}
	});
};

//thông tin chi tiết của người dùng (chỉ chính chủ hoặc admin mới có thể xem được)
const detailUser = (userID) => {
	return new Promise(async (resolve, reject) => {
		try {
			const user = await User.findById(userID);
			const address = await Address.findOne({ user: user._id });
			const seller = await Seller.findOne({ idUser: user._id });

			resolve({
				status: "OK",
				message: "SUCCESS",
				user,
				address,
				seller,
			});
		} catch (error) {
			reject(error);
		}
	});
};

//thông tin cơ bản của người dùng
const infoUser = (userID) => {
	return new Promise(async (resolve, reject) => {
		try {
			console.log("user", userID);

			const result = await User.findById(userID);
			if (result === null) {
				resolve({
					status: "ERROR",
					message: "Không tồn tại user",
				});
			}

			const address = await Address.findOne({ user: userID });
			const seller = await Seller.findOne({ idUser: userID }).populate({
				path: "idUser",
				select: "name avatar blockExpireDate blockReason",
			});

			const rating = await Rating.find({ idSeller: userID })
				.select("score review")
				.populate({
					path: "idProduct",
					select: "images name",
				})
				.populate({
					path: "idBuyer",
					select: "name avatar blockExpireDate blockReason",
				});

			const avgRating = await Rating.aggregate([
				{
					$match: { idSeller: new mongoose.Types.ObjectId(userID) },
				},
				{
					$group: {
						_id: "$idSeller", // Nhóm theo idSeller
						averageRating: { $avg: "$score" }, // Tính trung bình của trường score
						totalReviews: { $sum: 1 }, // Đếm tổng số đánh giá
					},
				},
			]);

			if (result?.password) {
				const { password, ...user } = result; //destructuring
				const data = {
					...address?._doc,
					...result._doc,
					...seller?._doc,
					rating,
					avgRating,
				};
				resolve({
					status: "OK",
					message: "SUCCESS",
					data,
				});
			} else {
				const data = {
					...address?._doc,
					...result._doc,
					...seller._doc,
					rating,
					avgRating,
				};

				resolve({
					status: "OK",
					message: "SUCCESS",
					data,
				});
			}
		} catch (error) {
			console.log("error at infoUser", error);

			reject(error);
		}
	});
};
const searchUser = (key) => {
	return new Promise(async (resolve, reject) => {
		try {
			let data;
			if (key === "all") {
				data = await Address.find().populate({
					path: "user",
				});
			} else {
				data = await Address.find().populate({
					path: "user",
					match: {
						$or: [
							{
								name: { $regex: key, $options: "i" }, // Sử dụng $options: "i" để không phân biệt chữ hoa, chữ thường
							},
						],
					},
				});
			}

			const result = data.filter((value) => value.user !== null);

			resolve({
				status: "OK",
				message: "SUCCESS",
				result,
			});
		} catch (error) {
			reject(error);
		}
	});
};

const blockExpire = {
	0: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 ngày
	1: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 ngày
	2: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 ngày
	3: Date.now() + 18250 * 24 * 60 * 60 * 1000, // vĩnh viễn (50 năm)
};

const blockReasonData = {
	0: "Vi phạm chính sách bán hàng",
	1: "Vi phạm chính sách mua hàng",
	2: "Khác",
};

const blockUser = (idUser, dateExpire, blockReason) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkUser = await User.findOne({ _id: idUser });
			if (checkUser === null) {
				resolve({
					status: "ERROR",
					message: "Người dùng không tồn tại",
				});
			} else {
				if (dateExpire && blockReason) {
					//chặn user
					const updateUser = await User.findByIdAndUpdate(
						idUser,
						{ blockExpireDate: blockExpire[dateExpire], blockReason: blockReasonData[blockReason] },
						{ new: true }
					);
					if (updateUser) {
						resolve({
							status: "SUCCESS",
							message: "Chặn người dùng thành công!",
						});
					}
				} else {
					const updateUser = await User.findByIdAndUpdate(idUser, { blockExpireDate: null, blockReason: null }, { new: true });
					if (updateUser) {
						resolve({
							status: "SUCCESS",
							message: "Hủy chặn người dùng thành công!",
						});
					}
				}
			}
		} catch (error) {
			console.log("error", error);
			reject(error);
		}
	});
};

module.exports = {
	createUser,
	loginWithGoogle,
	loginUser,
	loginAdmin,
	updateUser,
	deleteUser, //xóa
	getAllUsers,
	detailUser,
	infoUser,
	searchUser,
	loginWithFacebook,
	getAllSellers,
	sellerDetail,
	blockUser,
	checkBanStatus,
	checkEmailExist,
};
