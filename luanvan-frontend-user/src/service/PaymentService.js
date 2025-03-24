import Axios from "axios";

export const createPayment = async (data) => {
	const res = await Axios.post(
		`${process.env.REACT_APP_API_URL_BACKEND}/payment/create_payment_url`,
		data
	);
	return res.data;
};
