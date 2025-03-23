import Axios from "axios";
import { jwtDecode } from "jwt-decode";

export const axiosJWT = Axios.create();

export const loginUser = async (data) => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/login`, data);
	return res.data;
};

export const loginAdmin = async (data) => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/login-admin`, data);
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

export const getDetailUser = async (id, access_token) => {
	const res = await axiosJWT.get(`${process.env.REACT_APP_API_URL_BACKEND}/user/details/${id}`, {
		headers: { token: `Bearer ${access_token}` },
	});
	return res.data;
};
export const getDetailSeller = async (id, access_token) => {
	const res = await axiosJWT.get(`${process.env.REACT_APP_API_URL_BACKEND}/user/seller-details/${id}`, {
		headers: { token: `Bearer ${access_token}` },
	});
	return res.data;
};

export const getInfoUser = async (id) => {
	const res = await Axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/user/info/${id}`);
	return res.data;
};

export const updateUser = async (id, access_token, data) => {
	const res = await axiosJWT.put(`${process.env.REACT_APP_API_URL_BACKEND}/user/update/${id}`, data, { headers: { token: `Bearer ${access_token}` } });

	return res.data;
};

export const deleteUser = async (id, access_token) => {
	const res = await Axios.delete(`${process.env.REACT_APP_API_URL_BACKEND}/user/delete/${id}`, {
		headers: { token: `Bearer ${access_token}` },
	});
	return res.data;
};

export const getAllUsers = async (access_token, data) => {
	console.log("token-user", access_token);
	const res = await axiosJWT.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/getAll?${data.page}&${data.limit}`, data, {
		headers: { token: `Bearer ${access_token}` },
	});
	return res.data;
};
export const getAllSellers = async (access_token, data) => {
	const res = await axiosJWT.post(`${process.env.REACT_APP_API_URL_BACKEND}/user/getAllSeller?${data.page}&${data.limit}`, {
		headers: { token: `Bearer ${access_token}` },
	});
	return res.data;
};

export const search = async (key, access_token) => {
	const res = await axiosJWT.get(`${process.env.REACT_APP_API_URL_BACKEND}/user/search/${key}`, {
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

export const blockUser = async (access_token, id, data) => {
	console.log("TETS", access_token);

	const res = await axiosJWT.put(`${process.env.REACT_APP_API_URL_BACKEND}/user/block/${id}`, data, {
		headers: { token: `Bearer ${access_token}` },
	});

	return res.data;
};

axiosJWT.interceptors.request.use(
	async (config) => {
		const current = new Date();
		const decoded = jwtDecode(localStorage.getItem("access_token"));
		if (decoded?.exp < current.getTime() / 1000) {
			const data = await refreshToken();
			config.headers["token"] = `Bearer ${data?.access_token}`;
		}
		return config;
	},
	function (error) {
		return Promise.reject(error);
	}
);
