import Axios from "axios";

export const axiosJWT = Axios.create();

export const loginUser = async (data) => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/login`, data);
	return res.data;
};

export const loginWithGoogle = async (data) => {
	const res = await Axios.post(
		`${process.env.REACT_APP_API_URL_BACKEND}/user/login/google`,
		data
	);
	return res.data;
};
export const loginWithFacebook = async (data) => {
	const res = await Axios.post(
		`${process.env.REACT_APP_API_URL_BACKEND}/user/login/facebook`,
		data
	);
	return res.data;
};

export const registerUser = async (data) => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/register`, data);
	return res.data;
};

export const logoutUser = async () => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/logout`);
	return res.data;
};

export const checkUserBanned = async (id) => {
	const res = await Axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/user/check-banned/${id}`);
	return res.data;
};
export const checkEmailExist = async (data) => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/check-email`, data);
	return res.data;
};
export const getDetailUser = async (id, access_token) => {
	const res = await axiosJWT.get(`${process.env.REACT_APP_API_URL_BACKEND}/user/details/${id}`, {
		headers: { token: `Bearer ${access_token}` },
	});
	return res.data;
};

export const getInfoUser = async (id) => {	
	const res = await Axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/user/info/${id}`);
	return res.data;
};

export const updateUser = async (id, access_token, data) => {
	const res = await axiosJWT.put(
		`${process.env.REACT_APP_API_URL_BACKEND}/user/update/${id}`,
		data,
		{ headers: { token: `Bearer ${access_token}` } }
	);

	return res.data;
};

export const deleteUser = async (id, access_token) => {
	const res = await Axios.delete(`${process.env.REACT_APP_API_URL_BACKEND}/user/delete/${id}`, {
		headers: { token: `Bearer ${access_token}` },
	});
	return res.data;
};

export const getAllUsers = async (access_token) => {
	const res = await Axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/user/getAll`, {
		headers: { token: `Bearer ${access_token}` },
	});
	return res.data;
};

export const refreshToken = async () => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/refresh-token`, {
		withCredentials: true,
	});
	return res.data;
};
