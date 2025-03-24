const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const genneralAccessToken = async (payload) => {
	const access_token = jwt.sign({ ...payload }, "access_token", { expiresIn: "30m" });
	return access_token;
};

const genneralRefreshToken = async (payload) => {
	const refresh_token = jwt.sign({ ...payload }, "refresh_token", { expiresIn: "1w" });
	return refresh_token;
};

const refreshTokenService = async (token) => {
	return new Promise(async (resolve, reject) => {
		try {
			jwt.verify(token, "refresh_token", async (error, user) => {
				if (error) {
					resolve({
						status: "ERROR",
						message: "The authemtication",
					});
				}
				const access_token = await genneralAccessToken({
					id: user?.id,
					isAdmin: user?.isAdmin,
				});
				resolve({
					status: "SUCCESS",
					message: "Refresh token successfully.",
					access_token,
				});
			});
		} catch (error) {
			reject(error);
		}
	});
};

module.exports = { genneralAccessToken, genneralRefreshToken, refreshTokenService };
