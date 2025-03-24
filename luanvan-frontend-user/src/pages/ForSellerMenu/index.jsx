//Trang menu quản lý của nhà bán hàng

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";

import classNames from "classnames/bind";
import style from "./ForSeller.module.scss";
import { useState } from "react";
import OrderManager from "../../components/ForSeller/OrderManager";
import ProductManager from "../../components/ForSeller/ProductManager";
import ProfileSeller from "../../components/ForSeller/ProfileSeller";
import Analytic from "../../components/ForSeller/Analytic";
import RatingAnalytic from "../../components/ForSeller/RatingAnalytic";

const cx = classNames.bind(style);

function ForSeller() {
	const [menuClose, setMenuClose] = useState(
		localStorage.getItem("toggle_menu_seller") === "true"
	);

	const [activeIndex, setActiveIndex] = useState(1.1);

	const [activeSubMenu, setActiveSubMenu] = useState(
		localStorage.getItem("menu_seller_index") || 1.1
	);
	const handleClick = (index) => {
		setActiveIndex(index);
		localStorage.setItem("menu_seller_index", index);
	};

	const toggleMenu = () => {
		setMenuClose(!menuClose);
		localStorage.setItem("toggle_menu_seller", !menuClose);
	};
	return (
		<div style={{ display: "flex" }}>
			<div className={cx("menu-navigate", "inner-content", { close: menuClose })}>
				<div className={cx("menu-navigate-header")}>
					<IconButton onClick={toggleMenu}>
						{menuClose ? <ArrowBackIosIcon /> : <MenuIcon />}
					</IconButton>
				</div>

				<ul className={cx("menu")}>
					<li className={cx("menu-item")}>
						<p style={{ fontWeight: 500, fontSize: "1.2rem" }}>Quản lý bán hàng</p>
					</li>
					<li className={cx("menu-item")}>
						<p
							className={cx(activeIndex === "1.1" && "menu-item-active")}
							onClick={() => {
								handleClick("1.1");
								setActiveSubMenu("1.1");
							}}
						>
							Tài Khoản Của Tôi
						</p>
					</li>
					<li className={cx("menu-item")}>
						<p
							className={cx({ "menu-item-active": activeIndex === "2" })}
							onClick={() => {
								handleClick("2");
								setActiveSubMenu("2");
							}}
						>
							Quản lý sản phẩm
						</p>
					</li>
					<li className={cx("menu-item")}>
						<p
							className={cx({ "menu-item-active": activeIndex === "3" })}
							onClick={() => {
								handleClick("3");
								setActiveSubMenu("3");
							}}
						>
							Quản lý đơn hàng
						</p>
					</li>
					<li className={cx("menu-item")}>
						<p
							className={cx({ "menu-item-active": activeIndex === "4" })}
							onClick={() => {
								handleClick("4");
								setActiveSubMenu("4");
							}}
						>
							Xem đánh giá
						</p>
					</li>
					<li className={cx("menu-item")}>
						<p
							className={cx({ "menu-item-active": activeIndex === "5" })}
							onClick={() => {
								handleClick("5");
								setActiveSubMenu("5");
							}}
						>
							Thống Kê
						</p>
					</li>
				</ul>
			</div>
			<div className={cx("body")}>
				{activeSubMenu === "1.1" && <ProfileSeller />}
				{activeSubMenu === "2" && <ProductManager />}
				{activeSubMenu === "3" && <OrderManager />}
				{activeSubMenu === "4" && <RatingAnalytic />}
				{activeSubMenu === "5" && <Analytic />}
			</div>
		</div>
	);
}

export default ForSeller;
