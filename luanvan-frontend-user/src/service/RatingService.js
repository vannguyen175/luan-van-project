import Axios from "axios";

export const createRating = async (data) => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/rating/create`, data);
	return res.data;
};
export const updateRating = async (data) => {
	const res = await Axios.put(`${process.env.REACT_APP_API_URL_BACKEND}/rating/update`, data);
	return res.data;
};
export const getRating = async (id) => {
	const res = await Axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/rating/get/${id}`);
	return res.data;
};
