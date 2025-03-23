import { useEffect, useRef, useState } from "react";
import moment from "moment";
import vi from "javascript-time-ago/locale/vi";
import TimeAgo from "javascript-time-ago";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { toast } from "react-toastify";

import * as ProductService from "../../service/ProductService";
import classNames from "classnames/bind";
import style from "./DetailProduct.module.scss";
import Description from "../Description";

const cx = classNames.bind(style);
TimeAgo.addLocale(vi);

const options = [
	{ name: "Hình ảnh bị mờ" },
	{ name: "Tên sản phẩm không hợp lệ" },
	{ name: "Số điện thoại không hợp lệ" },
	{ name: "Địa chỉ không hợp lệ" },
];

function DetailProduct({ idProduct, toggleDrawer, getAllProducts }) {
	const [data, setData] = useState();
	const [imagePreview, setImagePreview] = useState();
	const [statePostChecked, setStatePostChecked] = useState();
	const [rejectReason, setRejectReason] = useState("");
	const reasonRejectRef = useRef();

	const getDetailProduct = async () => {
		const res = await ProductService.detailProduct(idProduct);
		setData(res.data);
		setImagePreview(res.data.images[0]);
	};

	useEffect(() => {
		getDetailProduct();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleChecked = (e) => {
		if (e === "reject") {
			setStatePostChecked(e);
		} else {
			setStatePostChecked(e);
			setRejectReason(null);
		}
	};

	const handleChangeReason = (e) => {
		setRejectReason(e.target.innerText);
	};

	const handleSubmit = async () => {
		const res = await ProductService.updateProduct(idProduct, {
			data: {
				statePost: statePostChecked,
				rejectReason: rejectReason || reasonRejectRef.current?.value,
			},
		});
		if (res.status === "SUCCESS") {
			toast.success(res.message);
			getDetailProduct();
			getAllProducts();
			// toggleDrawer(false);
		} else {
			toast.error(res.message);
		}
	};

	return (
		<>
			<Box sx={{ width: 1000 }} role="presentation" style={{ paddingBottom: 40 }}>
				<p className="title">Chi tiết bài đăng</p>
				<div className={cx("images-area")}>
					<div className={cx("images-preview")}>
						<img src={imagePreview} alt={imagePreview} />
					</div>
					<div className={cx("images-list")}>
						{data &&
							data.images.map((image, index) => (
								<img src={image} alt="anh-san-pham" key={index} onClick={() => setImagePreview(image)} />
							))}
					</div>
				</div>
				{data && (
					<div>
						<div style={{ display: "flex" }}>
							<div className={cx("detail")}>
								<p className={cx("detail-title")}>Thông tin sản phẩm</p>
								<Description title="Tên sản phẩm" desc={data.name} />
								<Description title="Danh mục" desc={`${data.subCategory.category.name} - ${data.subCategory.name}`} />
								<Description title="Giá tiền" desc={`${Intl.NumberFormat().format(data.price)}đ`} />
								<Description title="Số lượng" desc={data.quantity} />
								<Description title="Thời điểm đăng" desc={moment(data.createdAt).format("DD-MM-YYYY HH:mm")} />
								<Description
									title="Trạng thái"
									important={data.statePost === "waiting"}
									success={data.statePost === "approved"}
									desc={
										data.statePost === "waiting"
											? "Đang chờ"
											: data.statePost === "approved"
											? "Đang bán"
											: data.statePost === "selled"
											? "Đã bán"
											: "Bị từ chối"
									}
								/>
							</div>
							<br />
							<div className={cx("detail")}>
								<p className={cx("detail-title")}>Thông tin người bán</p>
								<Description title="Tên người bán" desc={data.idUser.name} />
								<Description title="Email" desc={data.idUser.email} />
								<Description title="Số điện thoại" desc={data.address.phone} />
								<Description
									title="Địa chỉ"
									desc={`${data.address.address}, ${data.address.ward}, ${data.address.district}, ${data.address.province}`}
								/>
							</div>
						</div>
						<div className={cx("radio")}>
							{data.statePost === "waiting" && (
								<>
									<input type="radio" id="approved" name="stateProduct" onChange={() => handleChecked("approved")} />
									<label htmlFor="approved">Phê duyệt</label>
									<input type="radio" id="reject" name="stateProduct" onChange={() => handleChecked("reject")} />
									<label htmlFor="reject">Từ chối</label>
								</>
							)}
							<div>
								{statePostChecked === "reject" ? (
									<Autocomplete
										freeSolo
										id="free-solo-2-demo"
										disableClearable
										options={options.map((option) => option.name)}
										onChange={handleChangeReason}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Lý do từ chối"
												inputRef={reasonRejectRef}
												InputProps={{
													...params.InputProps,
													type: "search",
												}}
											/>
										)}
									/>
								) : null}
							</div>
						</div>
						<div className={cx("button-submit")}>
							{data.statePost === "waiting" ? (
								<button className={cx("button-primary")} onClick={handleSubmit}>
									Lưu thay đổi
								</button>
							) : (
								<button className={cx("button-primary")} onClick={toggleDrawer(false)}>
									Thoát
								</button>
							)}
						</div>
					</div>
				)}
			</Box>
		</>
	);
}

export default DetailProduct;
