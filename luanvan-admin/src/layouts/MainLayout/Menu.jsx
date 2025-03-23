import { Link } from "react-router-dom";
import classNames from "classnames/bind";
import style from "./mainLayout.module.scss";
import { useEffect, useState } from "react";

import PeopleIcon from "@mui/icons-material/People";
import SubjectIcon from "@mui/icons-material/Subject";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import * as ProductService from "../../service/ProductService";

const cx = classNames.bind(style);

function Menu() {
	const [state, setState] = useState(localStorage.getItem("menu-select") || "Tài khoản");
	const [productWaitingCount, setProductWaitingCount] = useState(0);
	const handleClick = (e) => {
		if (e.target.innerText === "product") {
			setProductWaitingCount(0);
		} else {
			getProductWaitingCount();
		}
		localStorage.setItem("menu-select", e.target.innerText);
		setState(e.target.innerText);
	};

	const getProductWaitingCount = async () => {
		const res = await ProductService.getAllProducts({
			data: { state: "waiting" },
		});
		setProductWaitingCount(res.totalData);
	};

	useEffect(() => {
		getProductWaitingCount();
	}, []);

	return (
		<div className={cx("menu")}>
			<Link className={cx(state === "Tài khoản" && "selected")} onClick={handleClick} to={"/account"}>
				<PeopleIcon />
				Tài khoản
			</Link>
			<Link className={cx(state === "Bài đăng" && "selected")} onClick={handleClick} to={"/product"}>
				<SubjectIcon />
				Bài đăng {productWaitingCount !== 0 && `(${productWaitingCount})`}
			</Link>
			<Link className={cx(state === "Danh mục" && "selected")} onClick={handleClick} to={"/category"}>
				<CategoryIcon />
				Danh mục
			</Link>
			<Link className={cx(state === "Nhà bán hàng" && "selected")} onClick={handleClick} to={"/seller"}>
				<StorefrontIcon />
				Nhà bán hàng
			</Link>
			<Link className={cx(state === "Thống kê" && "selected")} onClick={handleClick} to={"/analytic"}>
				<ShoppingCartIcon />
				Thống kê
			</Link>
		</div>
	);
}

export default Menu;
