import Select from "../../components/Select";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { getBase64 } from "../../utils";

import { useRef, useState } from "react";

function CreateForm({ onSubmit, onCloseModal }) {
	let dataSubmit = { isAdmin: false };
	const [previewAvatar, setPreviewAvatar] = useState("");
	const fileInputRef = useRef();

	const nameRef = useRef("");
	const emailRef = useRef("");
	const passwordRef = useRef("");
	const passwordConfirmedRef = useRef("");
	const phoneRef = useRef("");

	const handlePreviewAvatar = async (e) => {
		const file = e.target.files[0];
		if (file) {
			const imageBase64 = await getBase64(file);
			setPreviewAvatar(imageBase64);
		}
	};

	const selectFiles = () => {
		fileInputRef.current.click();
	};

	const handleChangeRole = (e) => {
		console.log(e.target.value);
		if (e.target.value === "admin") {
			console.log("=>");
			dataSubmit = { ...dataSubmit, isAdmin: true };
		} else {
			dataSubmit = { ...dataSubmit, isAdmin: false };
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		dataSubmit = {
			...dataSubmit,
			name: nameRef.current.value,
			email: emailRef.current.value,
			password: passwordRef.current.value,
			confirmPassword: passwordConfirmedRef.current.value,
			phone: phoneRef.current.value,
			avatar: previewAvatar,
		};
		onSubmit(dataSubmit);
	};

	const handleCloseCreateModal = () => {
		onCloseModal();
	};
	return (
		<>
			<Select
				label="Vai trò"
				data={[{ name: "user" }, { name: "admin" }]}
				onChange={handleChangeRole}
				value={"user"}
			/>

			<TextField
				inputRef={nameRef}
				label="Tên tài khoản"
				variant="outlined"
				style={{ width: "45%", marginRight: "5%" }}
			/>
			<TextField
				inputRef={emailRef}
				label="Email"
				variant="outlined"
				style={{ width: "45%" }}
			/>

			<TextField
				inputRef={passwordRef}
				label="Mật khẩu"
				variant="outlined"
				className="text"
				type="password"
			/>
			<TextField
				inputRef={passwordConfirmedRef}
				label="Nhập lại mật khẩu"
				variant="outlined"
				className="text"
				type="password"
			/>
			<TextField
				inputRef={phoneRef}
				label="Số điện thoại"
				variant="outlined"
				className="text"
			/>
			<div style={{ display: "flex", alignItems: "ceter", marginTop: 20 }}>
				<label htmlFor="imgInp" style={{ marginRight: 10 }}>
					Ảnh đại diện
				</label>
				<input
					ref={fileInputRef}
					accept="image/*"
					type="file"
					id="imgInp"
					onChange={handlePreviewAvatar}
					style={{ display: "none" }}
				/>
				<button style={{ height: 30, width: 30, marginRight: 50 }} onClick={selectFiles}>
					+
				</button>
				<img
					className="avatar"
					src={previewAvatar || "/user-avatar.png"}
					alt="anh-dai-dien"
				/>
			</div>
			<div style={{ textAlign: "center", margin: "10px" }}>
				<Button
					onClick={handleCloseCreateModal}
					style={{ margin: "20px" }}
					variant="outlined"
				>
					Thoát
				</Button>
				<Button onClick={handleSubmit} variant="contained">
					Cập nhật
				</Button>
			</div>
		</>
	);
}

export default CreateForm;
