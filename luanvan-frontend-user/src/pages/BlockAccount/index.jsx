import { useApp } from "~/context/AppProvider";
import ReactTimeAgo from "react-time-ago";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import * as userService from "../../service/UserService";
import { useEffect, useState } from "react";

function BlockAccount() {
	const { setToken } = useApp();
	const navigate = useNavigate();
	const idUser = localStorage.getItem("id_user");

	const [detail, setDetail] = useState({
		isBlocked: false,
		blockExpireDate: "",
		blockReason: "",
	});

	const checkUserBanned = async () => {
		const res = await userService.checkUserBanned(idUser);
		if (res.status === "BLOCKED") {
			setDetail({
				isBlocked: true,
				blockExpireDate: res.blockExpireDate,
				blockReason: res.blockReason,
			});
		}
	};

	useEffect(() => {
		checkUserBanned();
	}, []);

	const handleBackLogin = () => {
		localStorage.clear();
		setToken(null);
		navigate("/login");
	};

	return (
		<div
			style={{
				background: "white",
				minHeight: "100vh",
				textAlign: "center",
				paddingTop: 100,
				color: "red",
			}}
		>
			{detail.isBlocked && (
				<>
					<h2>Tài khoản của bạn đã bị khóa tạm thời.</h2>
					<h5>Lý do: {detail.blockReason}</h5>
					<h5>
						Thời gian mở khóa:{" "}
						{moment(detail.blockExpireDate).format("hh:mm, DD-MM-YYYY")} (
						<ReactTimeAgo date={Date.parse(detail.blockExpireDate)} locale="vi-VN" />)
					</h5>
					<button
						onClick={handleBackLogin}
						className="btn"
					>
						Quay về trang đăng nhập
					</button>
				</>
			)}
		</div>
	);
}

export default BlockAccount;
