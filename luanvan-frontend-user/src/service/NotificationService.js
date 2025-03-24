import Axios from "axios";

export const addNotification = async (data) => {
	const res = await Axios.post(
		`${process.env.REACT_APP_API_URL_BACKEND}/notification/create`,
		data
	);
	return res.data;
};

export const getNotification = async (data) => {
	const res = await Axios.post(
		`${process.env.REACT_APP_API_URL_BACKEND}/notification/getAll`,
		data
	);
	return res.data;
};

export const updateNotification = async (data) => {
	const res = await Axios.post(
		`${process.env.REACT_APP_API_URL_BACKEND}/notification/update`,
		data
	);
	return res.data;
};
