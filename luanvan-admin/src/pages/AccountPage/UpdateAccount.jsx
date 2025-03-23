import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { getBase64 } from "../../utils";
import * as UserService from "../../service/UserService";
import { toast } from "react-toastify";
import classNames from "classnames/bind";
import style from "./AccountPage.module.scss";
import IconButton from "@mui/material/IconButton";
import Select from "../../components/Select";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import subVn from "sub-vn";

const cx = classNames.bind(style);

function UpdateAccount() {
	const { id } = useParams();
	const navigate = useNavigate();
	// let dataSubmit = {};
	const [dataSubmit, setDataSubmit] = useState();
	const token = localStorage.getItem("access_token");
	const [previewAvatar, setPreviewAvatar] = useState("");
	const fileInputRef = useRef();

	const [data, setData] = useState();
	const [dataAddress, setDataAddress] = useState({
		province: "",
		district: "",
		ward: "",
		phone: "",
		address: "",
	});

	const nameRef = useRef("");
	const emailRef = useRef("");
	const passwordRef = useRef("");
	const passwordConfirmedRef = useRef("");
	const phoneRef = useRef("");
	const addressRef = useRef("");

	const [provinceCode, setProvinceCode] = useState(""); //Lấy code tỉnh/thành phố
	const [districtCode, setDistrictCode] = useState(""); //Lấy code huyện/quận

	const hanldeChangeProvince = async (e) => {
		const listProvince = await subVn.getProvinces();
		const selectedProvince = listProvince.find((item) => item.name === e);
		if (selectedProvince) {
			setProvinceCode(selectedProvince.code);
		}
		setDataSubmit({ ...dataSubmit, province: e });
	};
	const hanldeChangeDistrict = async (e) => {
		const listDistrict = await subVn.getDistricts();
		//có name district, cần code district để truy xuất ward => dùng map
		const selectedDistrict = listDistrict.find((item) => item.name === e);
		if (selectedDistrict) {
			setDistrictCode(selectedDistrict.code);
		}
		setDataSubmit({ ...dataSubmit, district: e });
	};
	const hanldeChangeWard = (e) => {
		setDataSubmit({ ...dataSubmit, ward: e.target.value });
	};

	const getDetailUser = async () => {
		const res = await UserService.getDetailUser(id, token);
		setPreviewAvatar(res.user.avatar);
		setData(res.user);
		setDataAddress({
			province: res.address.province,
			district: res.address.district,
			ward: res.address.ward,
			phone: res.address.phone,
			address: res.address.address,
		});

		setDataSubmit({
			...dataSubmit,
			isAdmin: res.user.isAdmin,
			province: res.address.province,
			district: res.address.district,
			ward: res.address.ward,
		});
		if (res.address.province && res.address.district) {
			hanldeChangeProvince(res.address.province);
			hanldeChangeDistrict(res.address.district);
		}
	};

	useEffect(() => {
		getDetailUser();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handlePreviewAvatar = async (e) => {
		const file = e.target.files[0];
		if (file) {
			const imageBase64 = await getBase64(file);
			setPreviewAvatar(imageBase64);
		}
	};

	const handleChangeRole = (e) => {
		if (e.target.value === "admin") {
			setDataSubmit({ ...dataSubmit, isAdmin: true });
		} else {
			setDataSubmit({ ...dataSubmit, isAdmin: false });
		}
	};

	const handleUpdate = async (value) => {
		const res = await UserService.updateUser(id, token, { ...value });
		if (res.message === "SUCCESS") {
			toast.success("Cập nhật thành công!");
			setTimeout(() => {
				window.location.reload();
			}, 2000);
		} else {
			toast.error(res.message);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const data = {
			...dataSubmit,
			name: nameRef.current.value,
			email: emailRef.current.value,
			password: passwordRef.current.value,
			confirmPassword: passwordConfirmedRef.current.value,
			phone: phoneRef.current.value,
			address: addressRef.current.value,
			avatar: previewAvatar,
		};
		setDataSubmit({
			data,
		});

		handleUpdate(data);
	};

	const selectFiles = () => {
		fileInputRef.current.click();
	};

	const handleBack = () => {
		navigate("/account");
	};

	return (
		<div>
			<IconButton onClick={handleBack} aria-label="delete" size="small" className="sticky ">
				<KeyboardBackspaceIcon fontSize="small" />
			</IconButton>
			{data && (
				<div>
					<div className={cx("detail-account", "inner-content")}>
						<span className="title" style={{ marginRight: 20 }}>
							Thông tin tài khoản
						</span>
						{data._id}

						<div className={cx("upload-avatar")}>
							<label>Ảnh đại diện</label>
							<input ref={fileInputRef} accept="image/*" type="file" onChange={handlePreviewAvatar} />
							<button onClick={selectFiles}>+</button>
							<img className="avatar" src={previewAvatar || data.avatar || "/user-avatar.png"} alt="anh-dai-dien" />
						</div>

						<Select
							label="Vai trò"
							data={[{ name: "user" }, { name: "admin" }]}
							onChange={handleChangeRole}
							value={data.isAdmin ? "admin" : "user"}
						/>

						<TextField
							inputRef={nameRef}
							label="Tên tài khoản"
							variant="outlined"
							style={{ width: "45%", marginRight: "5%" }}
							defaultValue={data.name}
						/>
						<TextField inputRef={emailRef} label="Email" variant="outlined" style={{ width: "45%" }} defaultValue={data.email} />
						<TextField inputRef={passwordRef} label="Mật khẩu" variant="outlined" className="text" type="password" />
						<TextField inputRef={passwordConfirmedRef} label="Nhập lại mật khẩu" variant="outlined" className="text" type="password" />
					</div>
					<div className={cx("detail-account", "inner-content")}>
						<span className="title" style={{ marginRight: 20 }}>
							Thông tin liên hệ
						</span>

						<TextField inputRef={phoneRef} label="Số điện thoại" variant="outlined" className="text" defaultValue={dataAddress.phone} />
						<Select
							label="Tỉnh/thành phố"
							data={subVn.getProvinces()}
							onChange={(e) => hanldeChangeProvince(e.target.value)}
							value={dataAddress.province || ""}
						/>

						{provinceCode && (
							<Select
								label="Huyện/quận"
								data={subVn.getDistrictsByProvinceCode(provinceCode)}
								onChange={(e) => hanldeChangeDistrict(e.target.value)}
								value={dataAddress.district || ""}
							/>
						)}

						{districtCode && (
							<>
								<Select
									label="Phường/xã"
									data={subVn.getWardsByDistrictCode(districtCode)}
									onChange={hanldeChangeWard}
									value={dataAddress.ward || ""}
								/>

								<TextField
									inputRef={addressRef}
									label="Địa chỉ"
									variant="outlined"
									className="text"
									defaultValue={dataAddress.address || ""}
								/>
							</>
						)}
					</div>
					<div style={{ textAlign: "center", margin: "10px" }}>
						<Button onClick={handleSubmit} variant="contained">
							Cập nhật
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export default UpdateAccount;
