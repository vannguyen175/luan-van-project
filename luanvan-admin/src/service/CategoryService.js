import Axios from "axios";

export const getCategory = async () => {
	const res = await Axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/category/getAll`);
	return res.data;
};
export const createCategory = async (data) => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/category/create`, data);
	return res.data;
};
export const deleteCategory = async (slug) => {
	const res = await Axios.delete(`${process.env.REACT_APP_API_URL_BACKEND}/category/delete/${slug}`);
	return res.data;
};
export const searchCategory = async (search) => {
	const res = await Axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/category/search/${search}`);
	return res.data;
};

export const getSubCategory = async () => {
	const res = await Axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/sub-category/getAll`);
	return res.data;
};
export const createSubCategory = async (data) => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/sub-category/create`, data);
	return res.data;
};

export const createInfoSubCate = async (data) => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/sub-category/create/info`, data);
	return res.data;
};
export const updateSubCategory = async (data) => {
	const res = await Axios.put(`${process.env.REACT_APP_API_URL_BACKEND}/sub-category/update/${data.slug}`, data);
	return res.data;
};

export const getDetailCategory = async (slug) => {
	const res = await Axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/category/details/${slug}`);
	return res.data;
};
export const deleteSubCate = async (slug) => {
	const res = await Axios.delete(`${process.env.REACT_APP_API_URL_BACKEND}/sub-category/delete/${slug}`);
	return res.data;
};
export const deleteInfoSubcate = async ({ slug, nameInfo }) => {
	const res = await Axios.delete(`${process.env.REACT_APP_API_URL_BACKEND}/sub-category/delete-info/${slug}/${nameInfo}`);
	return res.data;
};
export const updateOptions = async (data) => {
	const res = await Axios.put(`${process.env.REACT_APP_API_URL_BACKEND}/sub-category/update/option`, data);
	return res.data;
};

export const getDetailSubCategory = async (data) => {
	const res = await Axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/sub-category/details/${data.slug}`, data);
	return res.data;
};
