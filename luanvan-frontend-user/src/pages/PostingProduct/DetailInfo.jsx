import Grid from "@mui/material/Grid";
import classNames from "classnames/bind";
import style from "./PostingProduct.module.scss";
import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import { convertToSlug } from "~/utils";
import * as ProductService from "~/service/ProductService";

const cx = classNames.bind(style);

function DetailInfo({ dataSubmit, setDataSubmit }) {
	const [info, setInfo] = useState();
	const [price, setPrice] = useState(Intl.NumberFormat().format(dataSubmit.price) || "");

	const getSubCategoryInfo = async (subCategory) => {
		const res = await ProductService.getSubCategoryInfo(convertToSlug(subCategory));
		setInfo(res.data.infoSubCate);
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

	const onChangeStateProduct = (e) => {
		if (e.target.textContent === "Chưa sử dụng") {
			setDataSubmit((prevData) => ({ ...prevData, stateProduct: "new" }));
		} else {
			setDataSubmit((prevData) => ({ ...prevData, stateProduct: "used" }));
		}
	};

	const handleChangeInput = (e) => {
		if (e.target.name === "price") {
			const replacedPrice = e.target.value.replace(/[.,]/g, "");
			setPrice(Intl.NumberFormat().format(replacedPrice));
			setDataSubmit((prevData) => ({
				...prevData,
				[e.target.name]: replacedPrice,
			}));
		} else {
			setDataSubmit((prevData) => ({
				...prevData,
				[e.target.name]: e.target.value,
			}));
		}
	};

	useEffect(() => {
		if (dataSubmit.subCategory) {
			getSubCategoryInfo(dataSubmit.subCategory);
		}
	}, []);

	return (
		<>
			<p>Điền thông tin thuộc tính để tăng mức độ nhận diện sản phẩm.</p>
			<Grid container spacing={2} margin={1}>
				{info?.map((item, index) => (
					<>
						<Grid item xs={2} style={{ textAlign: "right", marginTop: 7 }} key={index}>
							{item.name}:
						</Grid>
						<Grid item xs={9}>
							<Autocomplete
								disablePortal
								defaultValue={dataSubmit.info[item.name]}
								options={item.option}
								onChange={(event) => onChangeInfo(item, event)}
								renderInput={(params) => (
									<TextField {...params} placeholder={item.name} />
								)}
								key={index}
							/>
						</Grid>
					</>
				))}
				{dataSubmit.category !== "Thú cưng" && (
					<>
						<Grid item xs={2} style={{ textAlign: "right", marginTop: 7 }}>
							Tình trạng hàng:
						</Grid>
						<Grid item xs={9}>
							<Autocomplete
								disablePortal
								defaultValue={
									dataSubmit.stateProduct === "used" ? "Đã sử dụng" : "Mới"
								}
								options={["Chưa sử dụng", "Đã sử dụng"]}
								onChange={onChangeStateProduct}
								renderInput={(params) => <TextField {...params} label="" />}
							/>
						</Grid>
					</>
				)}
				<Grid item xs={2} style={{ textAlign: "right", marginTop: 7 }}>
					Giá bán:
				</Grid>
				<Grid item xs={9}>
					<input
						name="price"
						value={price}
						className={cx("input-form")}
						onChange={handleChangeInput}
					/>
				</Grid>
				<Grid item xs={2} style={{ textAlign: "right", marginTop: 7 }}>
					Số lượng:
				</Grid>
				<Grid item xs={9}>
					<input
						name="quantity"
						value={dataSubmit.quantity}
						className={cx("input-form")}
						onChange={handleChangeInput}
						type="number"
					/>
				</Grid>
			</Grid>
		</>
	);
}

export default DetailInfo;
