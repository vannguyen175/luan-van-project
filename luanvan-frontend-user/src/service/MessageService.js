import Axios from "axios";

export const getChat = async (user1, user2) => {
	const res = await Axios.get(
		`${process.env.REACT_APP_API_URL_BACKEND}/message/getChat/${user1}/${user2}`
	);
	return res.data;
};

export const getChatUnseen = async (user1) => {
	const res = await Axios.get(
		`${process.env.REACT_APP_API_URL_BACKEND}/message/getChat-unseen/${user1}`
	);
	return res.data;
};

export const seenChat = async (user1, user2) => {
	const res = await Axios.put(
		`${process.env.REACT_APP_API_URL_BACKEND}/message/seenChat/${user1}/${user2}`
	);
	return res.data;
};
