import Button from "@mui/material/Button";
import classNames from "classnames/bind";
import style from "./Register.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import * as UserService from "../../service/UserService";
import TextField from "@mui/material/TextField";

import { toast } from "react-toastify";

const cx = classNames.bind(style);

function Register() {
	const navigate = useNavigate();
	const [dataRegister, setDataRegister] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		phone: "",
	});
	const [message, setMessage] = useState("");

	const handleChange = (e) => {
		setDataRegister((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const onsubmit = async (e) => {
		e.preventDefault();
		const res = await UserService.registerUser(dataRegister);
		if (res?.status === "SUCCESS") {
			toast.success("Đăng ký tài khoản thành công!");
			setTimeout(() => {
				navigate("/login");
			}, 1000);
		} else {
			setMessage(res.message);
		}
	};
	//127
	return (
		<div className={cx("backgroundImage", "animate__animated", "animate__fadeIn")}>
			<div className={cx("inner-content", "container", "animated", "fadeInDown")}>
				<h2 className={cx("title")}>Đăng ký tài khoản</h2>
				<form action="" method="POST">
					{message !== "" && <span style={{ color: "red" }}>{message}</span>}

					<TextField
						name="name"
						onChange={handleChange}
						label="Tên tài khoản"
						variant="outlined"
						style={{ margin: "15px 0", width: "90%" }}
						fullWidth
					/>
					<TextField
						name="email"
						onChange={handleChange}
						label="Email"
						variant="outlined"
						style={{ margin: "15px 0", width: "90%" }}
						fullWidth
					/>
					<TextField
						name="phone"
						onChange={handleChange}
						label="Số điện thoại"
						variant="outlined"
						style={{ margin: "15px 0", width: "90%" }}
						fullWidth
					/>
					<TextField
						name="password"
						onChange={handleChange}
						label="Mật khẩu"
						variant="outlined"
						style={{ margin: "15px 0", width: "90%" }}
						fullWidth
						type="password"
					/>
					<TextField
						name="confirmPassword"
						onChange={handleChange}
						label="Nhập lại mật khẩu"
						variant="outlined"
						style={{ margin: "15px 0", width: "90%" }}
						fullWidth
						type="password"
					/>
					<div style={{ padding: "0 30px" }}>
						<Button variant="contained" fullWidth onClick={onsubmit}>
							Đăng ký
						</Button>
					</div>

					<p className={cx("register-link")}>
						Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
					</p>
				</form>
			</div>
		</div>
	);
}

export default Register;
