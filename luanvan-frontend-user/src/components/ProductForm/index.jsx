import { useEffect, useState } from "react";

import { convertToSlug } from "~/utils";
import * as ProductService from "~/service/ProductService";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

function ProductForm({ setDataSubmit }) {
	const [categoryList, setCategoryList] = useState();
	const [cateSelected, setCateSelected] = useState();
	const [subCategoryList, setSubCategoryList] = useState();
	const [info, setInfo] = useState();

	useEffect(() => {
		getCategories();
	}, []);



	const getCategories = async () => {
		const res = await ProductService.getAllCategories();
		const data = res.data.map((value) => value.name);
		setCategoryList(data);
	};

	const getSubCategory = async (category) => {
		const res = await ProductService.getSubCategory(convertToSlug(category));
		const data = res.subCategory.map((value) => value.name);
		setSubCategoryList(data);
	};

	const getSubCategoryInfo = async (subCategory) => {
		const res = await ProductService.getSubCategoryInfo(convertToSlug(subCategory));
		setInfo(res.data.infoSubCate);
	};

	//handle category selected
	const onChangeCategory = (e) => {
		setDataSubmit((prevData) => ({ ...prevData, category: e.target.textContent }));
		setCateSelected(e.target.textContent);
		const category = e.target.textContent;
		setSubCategoryList("");
		setInfo("");
		getSubCategory(category);
	};

	//handle sub-category selected
	const onChangeSubCate = (e) => {
		const subCategory = convertToSlug(e.target.textContent);
		setDataSubmit((prevData) => ({ ...prevData, subCategory: subCategory }));
		getSubCategoryInfo(subCategory);
	};

	const onChangeStateProduct = (e) => {
		if (e.target.textContent === "Chưa sử dụng") {
			setDataSubmit((prevData) => ({ ...prevData, stateProduct: "new" }));
		} else {
			setDataSubmit((prevData) => ({ ...prevData, stateProduct: "used" }));
		}
	};

	const onChangeInfo = (item, event) => {
		setDataSubmit((prevData) => ({
			...prevData,
			info: {
				...prevData.info,
				[item.name]: event.target.innerText,
			},
		}));
	};

	const handleChange = (e) => {
		setDataSubmit((prevData) => ({
			...prevData,
			[e.target.name]: e.target.value,
		}));
	};

	return (
			<form
				style={{
					textAlign: "left",
					boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
					padding: 20,
				}}
			>
				<div style={{ display: "flex", width: "100%" }}>
					<span style={{ marginRight: 30, width: "45%" }}>
						{categoryList && (
							<Autocomplete
								disablePortal
								options={categoryList}
								renderInput={(params) => (
									<TextField {...params} label="Chọn danh mục" />
								)}
								onChange={onChangeCategory}
							/>
						)}
					</span>

					<span style={{ width: "45%" }}>
						{subCategoryList && (
							<Autocomplete
								disablePortal
								options={subCategoryList}
								renderInput={(params) => (
									<TextField {...params} label="Chọn danh mục con" />
								)}
								onChange={onChangeSubCate}
							/>
						)}
					</span>
				</div>
				{info && (
					<div>
						{info.map((item, index) => (
							<Autocomplete
								disablePortal
								options={item.option}
								style={{ margin: "15px 0", width: "95%" }}
								onChange={(event) => onChangeInfo(item, event)}
								key={index}
								renderInput={(params) => (
									<TextField {...params} label={item.name} />
								)}
							/>
						))}

						{cateSelected !== "Thú cưng" && (
							<Autocomplete
								disablePortal
								options={["Chưa sử dụng", "Đã sử dụng"]}
								style={{ margin: "15px 0", width: "95%" }}
								onChange={onChangeStateProduct}
								renderInput={(params) => (
									<TextField {...params} label="Tình trạng" />
								)}
							/>
						)}

						<TextField
							name="name"
							onChange={handleChange}
							style={{ width: "95%" }}
							label="Tên bài đăng"
							variant="outlined"
						/>
						<TextField
							name="price"
							onChange={handleChange}
							style={{ width: "95%", margin: "15px 0" }}
							label="Giá bán"
							variant="outlined"
						/>
						<TextField
							name="description"
							onChange={handleChange}
							multiline
							rows={3}
							style={{ width: "95%" }}
							label="Mô tả chi tiết"
							variant="outlined"
						/>
					</div>
				)}
			</form>

	);
}

export default ProductForm;
