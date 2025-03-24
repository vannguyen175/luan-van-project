import Button from "~/components/Button";
import classNames from "classnames/bind";
import style from "./Login.module.scss";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "animate.css";
import TextField from "@mui/material/TextField";

import * as UserService from "~/service/UserService";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useApp } from "../../context/AppProvider";
import axios from "axios";
import FacebookLogin from "react-facebook-login";
import ModalForm from "../../components/Modal";
import emailjs from "@emailjs/browser";

const cx = classNames.bind(style);
const clientID = "105139517728-qa77n1q8768ek3tpmi2thvd94p2lqqdh.apps.googleusercontent.com";

function Login() {
	const { setUser, setToken } = useApp();
	const navigate = useNavigate();
	const location = useLocation();
	const [data, setData] = useState();

	const [isForgotPasswordModal, setIsForgotPasswordModal] = useState(false);
	const [forgotPass, setForgotPass] = useState({
		step: 0,
		email: null,
		PIN: null,
		message: null, //color: green
		erorr_message: null, //color: red
	});

	const emailRef = useRef(null);
	const passwordRef = useRef(null);
	const emailForgotPasswordRef = useRef(null);
	const PINRef = useRef();

	const loginGoogle = useGoogleLogin({
		onSuccess: async (response) => {
			try {
				const dataUser = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
					headers: {
						Authorization: `Bearer ${response.access_token}`,
					},
				});
				if (dataUser?.data?.email) {
					const res = await UserService.loginWithGoogle({
						email: dataUser?.data?.email,
						name: dataUser?.data?.name,
						picture: dataUser?.data?.picture,
					});
					checkLoginResult(res);
				}
			} catch (error) {
				console.log("Have an error with login google", error);
			}
		},
	});

	const responseFacebook = async (response) => {
		if (response?.email) {
			const res = await UserService.loginWithFacebook({
				email: response?.email,
				name: response?.name,
				picture: response?.picture.url,
			});
			checkLoginResult(res);
		}
	};

	//xu ly khi nguoi dung nhan submit
	const onsubmit = async (e) => {
		e.preventDefault();
		const email = emailRef.current.value;
		const password = passwordRef.current.value;
		const res = await UserService.loginUser({ email, password });
		setData(res);
		checkLoginResult(res);
	};

	const checkLoginResult = (result) => {
		if (result.status === "SUCCESS") {
			toast.success("Đăng nhập thành công!");
			localStorage.setItem("access_token", result?.access_token);
			setToken(result?.access_token);
			const decoded = jwtDecode(result?.access_token);
			localStorage.setItem("id_user", decoded?.id);
			localStorage.setItem("toggle_menu_profile", true);
			localStorage.setItem("menu_profile", 1);
			setUser({
				id: decoded?.id,
				isAdmin: decoded?.isAdmin,
			});
			if (location?.state) {
				setTimeout(() => {
					navigate(location?.state);
				}, 1000);
			} else {
				setTimeout(() => {
					navigate("/");
				}, 1000);
			}
		}
	};

	const handleForgotPassword = async () => {
		if (forgotPass.step === 0) {
			//giao diện nhập email
			const res = await UserService.checkEmailExist({
				email: emailForgotPasswordRef.current.value,
			});
			if (res.status === "SUCCESS") {
				setForgotPass((prev) => ({
					...prev,
					step: 1,
					erorr_message: null,
					email: emailForgotPasswordRef.current.value,
				})); //chuyển sang giao diện nhập mã PIN
				const randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);
				setForgotPass((prev) => ({ ...prev, PIN: randomSixDigitNumber }));
				sendEmail(res.data, randomSixDigitNumber);
			} else {
				setForgotPass((prev) => ({
					...prev,
					erorr_message: res.message,
				}));
			}
		} else if (forgotPass.step === 1) {
			//giao diện nhập mã PIN
			if (forgotPass.PIN === Number(PINRef.current.value)) {
				//thành công!
				const dataAccount = await UserService.checkEmailExist({
					email: forgotPass.email,
				});
				if (dataAccount.data?.loginMethod === "Google") {
					const res = await UserService.loginWithGoogle({
						email: dataAccount.data.email,
						name: dataAccount.data.name,
						picture: dataAccount.data.avatar,
					});
					checkLoginResult(res);
				} else if (dataAccount.data?.loginMethod === "Facebook") {
					const res = await UserService.loginWithFacebook({
						email: dataAccount.data.email,
						name: dataAccount.data.name,
						picture: dataAccount.data.avatar,
					});
					checkLoginResult(res);
				} else {
					const res = await UserService.loginUser({
						email: dataAccount.data.email,
						password: dataAccount.data.password,
						isForgotPass: true,
					});
					setData(res);
					checkLoginResult(res);
				}
			} else {
				setForgotPass((prev) => ({
					...prev,
					erorr_message: "Mã xác minh không hợp lệ. Vui lòng kiểm tra và nhập lại.",
				}));
			}
		}
	};

	const sendEmail = (value, PIN) => {
		emailjs
			.send(
				"service_dnzblz9",
				"template_vqthbri",
				{
					to_name: value.name,
					to_email: value.email,
					message: PIN,
				},
				{
					publicKey: "Uxe-oHKEjYqhsFh_P",
				}
			)
			.then(
				(result) => {
					console.log("SUCCESS!", result.text);
				},
				(error) => {
					console.log("FAILED...", error.text);
				}
			);
	};

	return (
		<GoogleOAuthProvider clientId={clientID}>
			<div className={cx("backgroundImage", "animate__animated", "animate__fadeIn")}>
				<div
					className={cx(
						"inner-content",
						"container",
						"animated",
						"fadeInDown",
						"box-shadow"
					)}
				>
					<h2 className={cx("title")}>Đăng nhập</h2>
					<form method="POST">
						{data?.status === "ERROR" && (
							<span style={{ color: "red" }}>{data?.message}</span>
						)}
						<TextField
							sx={{ margin: "20px 0" }}
							fullWidth
							label="Email"
							inputRef={emailRef}
						/>
						<TextField
							type="password"
							fullWidth
							label="Mật khẩu"
							inputRef={passwordRef}
							autoComplete="on"
						/>
						<span
							className={cx("forgot-password")}
							onClick={() => {
								setIsForgotPasswordModal(true);
								setForgotPass({ step: 0 });
							}}
						>
							Quên mật khẩu?
						</span>
						<Button primary className={cx("login-btn")} onClick={onsubmit}>
							Đăng nhập
						</Button>
						<div className={cx("login-with")}>
							<p>Hoặc đăng nhập bằng:</p>
							<img onClick={loginGoogle} src="/assets/google-icon.webp" alt="#" />
							<span>
								<FacebookLogin
									appId="1138022350625642"
									fields="name,email,picture"
									callback={responseFacebook}
									className={cx("my-facebook-button-class")}
									textButton=""
									icon={<img src="/assets/facebook-icon.png" alt="#" />}
								/>
							</span>
						</div>

						<p className={cx("register-link")}>
							Chưa có tài khoản? <Link to="/register">Đăng ký tài khoản mới</Link>
						</p>
					</form>
					<ModalForm
						title="Tìm tài khoản của bạn"
						isOpen={isForgotPasswordModal}
						setIsOpen={setIsForgotPasswordModal}
						width={650}
					>
						<div className={cx("forget-password-modal")}>
							{forgotPass.step === 0 && (
								<>
									<p>
										Vui lòng nhập địa chỉ email đã đăng ký để nhận mã xác minh
										khôi phục mật khẩu. ntthuyvan1705@gmail.com
									</p>
									{forgotPass.erorr_message && (
										<p style={{ color: "red" }}>{forgotPass.erorr_message}</p>
									)}

									<input
										ref={emailForgotPasswordRef}
										type="text"
										placeholder="Nhập email..."
									/>
									<button onClick={handleForgotPassword}>Gửi mã xác minh</button>
								</>
							)}

							{forgotPass.step === 1 && (
								<>
									<p>Nhập mã xác minh bạn đã nhận qua email.</p>
									{forgotPass.erorr_message && (
										<p style={{ color: "red" }}>{forgotPass.erorr_message}</p>
									)}
									<input
										ref={PINRef}
										type="number"
										placeholder="Nhập mã xác minh..."
									/>
									<span>
										Không nhận được email? <strong>Gửi lại.</strong>
									</span>
									<button onClick={handleForgotPassword}>Xác nhận</button>
								</>
							)}
						</div>
					</ModalForm>
				</div>
			</div>
		</GoogleOAuthProvider>
	);
}

export default Login;
