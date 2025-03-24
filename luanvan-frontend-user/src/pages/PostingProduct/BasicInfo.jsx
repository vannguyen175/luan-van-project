import Grid from "@mui/material/Grid";
import UploadImage from "../../components/UploadImage";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import classNames from "classnames/bind";
import style from "./PostingProduct.module.scss";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import { useEffect, useState } from "react";

import * as ProductService from "~/service/ProductService";
import { convertToSlug } from "~/utils";

const cx = classNames.bind(style);

function BasicInfo({ dataSubmit, setDataSubmit }) {
	const [categoryList, setCategoryList] = useState();
	const [subCategoryList, setSubCategoryList] = useState();
	const [cateSelected, setCateSelected] = useState();
	const [imageList, setImageList] = useState(dataSubmit.images);

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

	//handle category selected
	const onChangeCategory = (e) => {
		setDataSubmit((prevData) => ({ ...prevData, category: e.target.textContent }));
		setCateSelected(e.target.textContent);
		setSubCategoryList("");
		getSubCategory(e.target.textContent);
	};

	//handle sub-category selected
	const onChangeSubCate = (e) => {
		const subCategory = convertToSlug(e.target.textContent);
		setDataSubmit((prevData) => ({ ...prevData, subCategory: subCategory }));
	};

	const handleChangeInput = (e) => {
		setDataSubmit((prevData) => ({
			...prevData,
			[e.target.name]: e.target.value,
		}));
	};

	useEffect(() => {
		if (imageList.length > 0) {
			setDataSubmit((prevData) => ({
				...prevData,
				images: imageList,
			}));
			console.log("imageList", imageList);
		}
	}, [imageList]);

	useEffect(() => {
		getCategories();
		console.log("imageList", imageList);

		if (dataSubmit.category) {
			getSubCategory(dataSubmit.category);
		}
	}, []);

	return (
		<div>
			<Grid container spacing={2} margin={1}>
				<Grid item xs={2} style={{ textAlign: "right", marginTop: 10 }}>
					Hình ảnh sản phẩm:
				</Grid>
				<Grid item xs={9}>
					<UploadImage imageList={imageList} setImageList={setImageList} />
				</Grid>
				<Grid item xs={2} style={{ textAlign: "right", marginTop: 7 }}>
					Tên sản phẩm:
				</Grid>
				<Grid item xs={9}>
					<input
						name="name"
						className={cx("input-form")}
						placeholder="Tên sản phẩm + Thương hiệu + Model + Thông số kỹ thuật"
						onChange={handleChangeInput}
						defaultValue={dataSubmit.name || undefined}
					/>
				</Grid>
				<Grid item xs={2} style={{ textAlign: "right", marginTop: 10 }}>
					Danh mục:
				</Grid>
				<Grid item xs={9}>
					{categoryList && (
						<Autocomplete
							disablePortal
							options={categoryList}
							renderInput={(params) => (
								<TextField {...params} placeholder="Chọn danh mục" />
							)}
							defaultValue={dataSubmit.category || undefined}
							onChange={onChangeCategory}
						/>
					)}
				</Grid>
				{subCategoryList && (
					<>
						<Grid item xs={2} style={{ textAlign: "right", marginTop: 10 }}>
							Danh mục phụ:
						</Grid>
						<Grid item xs={9}>
							<Autocomplete
								disablePortal
								options={subCategoryList}
								renderInput={(params) => (
									<TextField {...params} placeholder="Chọn danh mục con" />
								)}
								defaultValue={dataSubmit.subCategory || undefined}
								onChange={onChangeSubCate}
							/>
						</Grid>
					</>
				)}
				<Grid item xs={2} style={{ textAlign: "right", marginTop: 10 }}>
					Mô tả sản phẩm:
				</Grid>
				<Grid item xs={9}>
					<textarea
						name="description"
						rows="5"
						style={{ width: "100%", padding: "5px 10px" }}
						onChange={handleChangeInput}
						defaultValue={dataSubmit.description || undefined}
					></textarea>
				</Grid>
			</Grid>
		</div>
	);
}

export default BasicInfo;
