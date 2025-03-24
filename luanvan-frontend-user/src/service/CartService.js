import Axios from "axios";

export const createCart = async (data) => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/cart/create`, data);
	return res.data;
};
export const updateCart = async (data) => {
	const res = await Axios.put(`${process.env.REACT_APP_API_URL_BACKEND}/cart/update`, data);
	return res.data;
};

export const getCart = async (id) => {
	const res = await Axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/cart/${id}`);
	return res.data;
};

export const deleteCart = async (data) => {
	const res = await Axios.put(`${process.env.REACT_APP_API_URL_BACKEND}/cart/delete`, data);
	return res.data;
};
