import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";

import classNames from "classnames/bind";
import style from "./Profile.module.scss";
import { useState } from "react";
import AccountInfo from "../../components/Profile/AccountInfo";
import Activities from "../../components/Profile/OrderStatus";
import OrderStatus from "../../components/Profile/OrderStatus";
import Analytics from "../../components/Profile/Analytics";

const cx = classNames.bind(style);

function Profile() {
	const [menuClose, setMenuClose] = useState(
		localStorage.getItem("toggle_menu_profile") === "true"
	);
	const [menuState, setMenuState] = useState(localStorage.getItem("menu_profile"));

	const handleState = (value) => {
		setMenuState(value);
		localStorage.setItem("menu_profile", value);
	};

	const handleCloseMenu = () => {
		setMenuClose(!menuClose);
		localStorage.setItem("toggle_menu_profile", !menuClose);
	};

	return (
		<div style={{ display: "flex" }}>
			<div className={cx("menu-navigate", "inner-content", { close: !menuClose })}>
				<div className={cx("menu-navigate-header")}>
					<IconButton onClick={handleCloseMenu}>
						{menuClose ? <ArrowBackIosIcon /> : <MenuIcon />}
					</IconButton>
				</div>
				<div className={cx("menu")}>
					<div
						className={cx({ "menu-active": menuState === "1" })}
						onClick={() => handleState("1")}
					>
						Thông tin tài khoản
					</div>

					<div
						className={cx({ "menu-active": menuState === "3" })}
						onClick={() => handleState("3")}
					>
						Đơn hàng đã mua
					</div>
					<div
						className={cx({ "menu-active": menuState === "4" })}
						onClick={() => handleState("4")}
					>
						Thống kê
					</div>
				</div>
			</div>
			<div className={cx("body")}>
				{menuState === "1" && <AccountInfo />}
				{menuState === "2" && <Activities />}
				{menuState === "3" && <OrderStatus />}
				{menuState === "4" && <Analytics />}
			</div>
		</div>
	);
}

export default Profile;
