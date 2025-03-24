import { useEffect, useState } from "react";
import * as UserService from "~/service/UserService";
import classNames from "classnames/bind";
import style from "./ForSeller.module.scss";
import Input from "../Input";
import { getBase64 } from "../../utils";
import { useApp } from "~/context/AppProvider";

import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import subVn from "sub-vn";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(style);

function ProfileSeller() {
	const { user, token } = useApp();
	const navigate = useNavigate();
	const [dataSubmit, setDataSubmit] = useState();
	const [dataAddress, setDataAddress] = useState({
		province: "",
		district: "",
		ward: "",
		address: "",
	});
	const [previewAvatar, setPreviewAvatar] = useState("");

	const handlePreviewAvatar = async (e) => {
		const file = e.target.files[0];
		if (file) {
			const imageBase64 = await getBase64(file);
			setPreviewAvatar(imageBase64);
		}
	};

	const [provinceCode, setProvinceCode] = useState(""); //Lấy code tỉnh/thành phố
	const [districtCode, setDistrictCode] = useState(""); //Lấy code huyện/quận

	const hanldeChangeProvince = async (e) => {
		const listProvince = await subVn.getProvinces();
		const selectedProvince = listProvince.find((item) => item.name === e);
		if (selectedProvince) {
			setProvinceCode(selectedProvince.code);
		}

		setDataAddress({ ...dataAddress, province: e });
	};
	const hanldeChangeDistrict = async (e) => {
		const listDistrict = await subVn.getDistricts();
		//có name district, cần code district để truy xuất ward => dùng map
		const selectedDistrict = listDistrict.find((item) => item.name === e);
		if (selectedDistrict) {
			setDistrictCode(selectedDistrict.code);
		}
		setDataAddress({ ...dataAddress, district: e });
	};
	const hanldeChangeWard = (e) => {
		setDataAddress({ ...dataAddress, ward: e.target.value });
	};

	const getAccountInfo = async () => {
		setDataSubmit({
			...user,
		});
		if (user.avatar) {
			setPreviewAvatar(user.avatar);
		}
		if (user.province && user.district) {
			hanldeChangeProvince(user.province);
			hanldeChangeDistrict(user.district);
		}
	};
	useEffect(() => {
		if (user?.name) {
			getAccountInfo();
		}
		// eslint-disable-next-line
	}, [user]);

	const handleChangeInput = (e) => {
		setDataSubmit((prevData) => ({
			...prevData,
			[e.target.name]: e.target.value,
		}));
	};

	const handleUpdate = async (e) => {
		e.preventDefault();
		const res = await UserService.updateUser(user.id, token, {
			...dataSubmit,
			avatar: previewAvatar,
			province: dataAddress.province || dataSubmit.province,
			district: dataAddress.district || dataSubmit.district,
			ward: dataAddress.ward || dataSubmit.ward,
		});
		if (res.message === "SUCCESS") {
			toast.success("Cập nhật thành công!");
			setTimeout(() => {
				window.location.reload();
			}, 2000);
		} else {
			toast.error(res.message);
		}
	};

	return (
		<div>
			<div className="inner-content" style={{ padding: 20 }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<p className="title">Thông tin tài khoản</p>
					<button
						className={cx("button-primary")}
						onClick={() => navigate(`/seller/${dataSubmit.id}`)}
					>
						Đến trang bán hàng
					</button>
				</div>
				{dataSubmit && (
					<div className={cx("account-info")}>
						<img
							src={dataSubmit?.avatar || "assets/images/user-avatar.jpg"}
							alt="avatar"
						/>
						<div style={{ width: "100%" }}>
							<p className={cx("name")}>{dataSubmit.name}</p>
							<div className={cx("info")}>
								<div>
									<p>Vai trò</p>
									Nhà bán hàng
								</div>
								<div>
									<p>Số điện thoại</p>
									{dataSubmit.phone}
								</div>
								<div>
									<p>Địa chỉ email</p>
									{dataSubmit.email}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
			<div className="inner-content" style={{ padding: 20 }}>
				<p className="title">Chi tiết tài khoản</p>
				<form method="post" className={cx("detail-form")}>
					<Box sx={{ flexGrow: 1 }}>
						<Grid container spacing={1}>
							{dataSubmit && (
								<>
									<Input
										name="name"
										onChange={handleChangeInput}
										label="Tên tài khoản"
										value={dataSubmit.name}
									/>
									<Input
										name="email"
										onChange={handleChangeInput}
										label="Email"
										value={dataSubmit.email}
									/>
									<Input
										name="phone"
										onChange={handleChangeInput}
										label="Số điện thoại"
										value={dataSubmit.phone}
									/>
									<Input
										name="password"
										onChange={handleChangeInput}
										label="Mật khẩu"
										type="password"
									/>
									<Input
										name="confirmPassword"
										onChange={handleChangeInput}
										label="Nhập lại mật khẩu"
										type="password"
									/>
									<Grid item xs={2} justify="flex-start">
										Tỉnh/thành:
									</Grid>
									<Grid item xs={9}>
										<select
											name="Tỉnh/thành"
											onChange={(e) => hanldeChangeProvince(e.target.value)}
											defaultValue={dataSubmit.province || ""}
										>
											{subVn.getProvinces().map((data, index) => (
												<option key={index} value={data.name}>
													{data.name}
												</option>
											))}
										</select>
									</Grid>
									{provinceCode && (
										<>
											<Grid item xs={2} justify="flex-start">
												Quận/huyện:
											</Grid>
											<Grid item xs={9}>
												<select
													name="Quận/huyện"
													onChange={(e) =>
														hanldeChangeDistrict(e.target.value)
													}
													defaultValue={dataSubmit.district || ""}
												>
													{subVn
														.getDistrictsByProvinceCode(provinceCode)
														.map((data, index) => (
															<option key={index} value={data.name}>
																{data.name}
															</option>
														))}
												</select>
											</Grid>
										</>
									)}
									{districtCode && (
										<>
											<Grid item xs={2} justify="flex-start">
												Xã/phường:
											</Grid>
											<Grid item xs={9}>
												<select
													name="Xã/phường"
													onChange={hanldeChangeWard}
													defaultValue={dataSubmit.ward || ""}
												>
													{subVn
														.getWardsByDistrictCode(districtCode)
														.map((data, index) => (
															<option key={index} value={data.name}>
																{data.name}
															</option>
														))}
												</select>
											</Grid>
											<Input
												name="address"
												onChange={handleChangeInput}
												type="textarea"
												label="Địa chỉ cụ thể"
												value={dataSubmit.address}
											/>
										</>
									)}
									<Grid item xs={2} justify="flex-start">
										Ảnh đại diện:
									</Grid>
									<Grid item xs={9}>
										<input
											type="file"
											style={{
												width: "fit-content",
												float: "left",
												marginLeft: "5%",
											}}
											name="avatar"
											onChange={handlePreviewAvatar}
										/>
										<img
											className={cx("avatar-upload")}
											src={previewAvatar || "assets/images/user-avatar.jpg"}
											alt="anh-dai-dien"
											accept="image/png, image/gif, image/jpeg"
										/>
									</Grid>
								</>
							)}
						</Grid>
					</Box>
					<button
						style={{ marginTop: 20 }}
						onClick={handleUpdate}
						className={cx("button-primary")}
					>
						Cập nhật
					</button>
				</form>
			</div>
		</div>
	);
}

export default ProfileSeller;
