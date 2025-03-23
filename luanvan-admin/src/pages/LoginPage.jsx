import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import "./page.css";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import * as UserService from "../service/UserService";

function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const [result, setResult] = useState();

	const emailRef = useRef(null);
	const passwordRef = useRef(null);

	//xu ly khi nguoi dung nhan submit
	const onsubmit = async (e) => {
		e.preventDefault();
		const email = emailRef.current.value;
		const password = passwordRef.current.value;
		const res = await UserService.loginAdmin({ data: { email: email, password: password } });
		setResult(res);
	};

	useEffect(() => {
		if (result?.status === "SUCCESS") {
			toast.success("Đăng nhập thành công!");
			localStorage.setItem("access_token", result?.access_token);
			const decoded = jwtDecode(result?.access_token);
			localStorage.setItem("id_user", decoded?.id);
			localStorage.setItem("isAdmin", decoded?.isAdmin);
			localStorage.setItem("avatar", decoded?.avatar || "assets/images/user-avatar.jpg");
			if (location?.state) {
				setTimeout(() => {
					navigate(location?.state);
				}, 1000);
			} else {
				setTimeout(() => {
					navigate("/account");
				}, 1000);
			}
		}
	}, [result, navigate, location?.state]);

	return (
		<div>
			<div className="login-container box-shadow">
				<h2 className="title">Đăng nhập hệ thống quản trị viên</h2>
				<form method="POST">
					{result?.status === "ERROR" && <span style={{ color: "red" }}>{result?.message}</span>}
					<TextField className="text" label="Email" variant="outlined" inputRef={emailRef} />
					<TextField className="text" label="Mật khẩu" type="password" variant="outlined" inputRef={passwordRef} />

					<Button variant="contained" className="login-button" onClick={onsubmit}>
						Đăng nhập
					</Button>
				</form>
			</div>
		</div>
	);
}

export default LoginPage;
