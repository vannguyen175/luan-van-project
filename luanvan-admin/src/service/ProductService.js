import Axios from "axios";

//lấy products theo danh mục phụ + chỉ products đã duyệt
export const getAllProductsBySubCate = async (slug_subCate) => {
	const res = await Axios.get(
		`${process.env.REACT_APP_API_URL_BACKEND}/product/getAll/${slug_subCate}`
	);
	return res.data;
};

export const getAllCategories = async () => {
	const res = await Axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/category/getAll`);
	return res.data;
};

export const getSubCategory = async (slug_category) => {
	const res = await Axios.get(
		`${process.env.REACT_APP_API_URL_BACKEND}/category/details/${slug_category}`
	);
	return res.data;
};

export const getSubCategoryInfo = async (slug_subCategory) => {
	const res = await Axios.get(
		`${process.env.REACT_APP_API_URL_BACKEND}/sub-category/details/${slug_subCategory}`
	);
	return res.data;
};

export const createProduct = async (data) => {
	const res = await Axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/product/create`, data);
	return res.data;
};

export const updateProduct = async (id, data) => {
	const res = await Axios.put(
		`${process.env.REACT_APP_API_URL_BACKEND}/product/update/${id}`,
		data
	);
	return res.data;
};

//Lấy products theo filter (statePost): req.body
export const getAllProducts = async (data, page, limit) => {
	const res = await Axios.post(
		`${process.env.REACT_APP_API_URL_BACKEND}/product/getAll?${data.page}&${data.limit}`,
		data
	);
	return res.data;
};

export const detailProduct = async (id) => {
	const res = await Axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/product/detail/${id}`);
	return res.data;
};

export const getProductSeller = async (id) => {
	const res = await Axios.get(
		`${process.env.REACT_APP_API_URL_BACKEND}/product/getAll/seller/${id}`
	);
	return res.data;
};
