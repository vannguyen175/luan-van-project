import Axios from "axios";

export const createOrder = async (data) => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/order/create`, data);
	return res.data;
};

export const getUserOrder = async (data) => {
	const res = await Axios.get(
		`${process.env.REACT_APP_API_URL_BACKEND}/order/getAll/${data.id}`,
		data.stateOrder
	);
	return res.data;
};

export const getSellerOrder = async (data) => {
	const res = await Axios.post(
		`${process.env.REACT_APP_API_URL_BACKEND}/order/getAll/seller/${data.id}`,
		data
	);
	return res.data;
};

export const getAnalyticsOrder = async (data) => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/order/analytics/`, data);
	return res.data;
};

export const updateOrder = async (data, id) => {
	const res = await Axios.put(
		`${process.env.REACT_APP_API_URL_BACKEND}/order/update/${id}`,
		data
	);
	return res.data;
};
