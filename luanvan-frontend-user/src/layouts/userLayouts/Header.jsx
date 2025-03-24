import classNames from "classnames/bind";
import style from "./UserLayouts.module.scss";
import DropdownMenu from "~/components/DropdownMenu";
import Button from "@mui/material/Button";
import * as CartService from "~/service/CartService";
import * as userService from "~/service/UserService";
import { useApp } from "~/context/AppProvider";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import Grid from "@mui/material/Grid";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Notification from "../../components/Notification";
import * as ProductService from "~/service/ProductService";

import Search from "../../components/Search";
import { Badge } from "@mui/material";

const cx = classNames.bind(style);

// const categories = [
// 	{
// 		name: "Đồ nội thất",
// 		to: "/san-pham/noi-that",
// 	},
// 	{
// 		name: "Thiết bị điện tử",
// 		to: "/san-pham/do-dien-tu",
// 	},
// 	{
// 		name: "Thú cưng",
// 		to: "/san-pham/thu-cung",
// 	},
// ];

const ActionsUnLogin = [
	{
		name: "Đăng nhập",
		to: "/login",
	},
	{
		name: "Đăng ký",
		to: "/register",
	},
];

const ActionUserLogin = [
	{
		name: "Thông tin tài khoản",
		to: "/tai-khoan",
	},
	{
		name: "Nhà bán hàng",
		to: "/nha-ban-hang",
	},

	{
		name: "Đăng tin",
		to: "/dang-tin",
	},
];

function Header() {
	const { user, token, setToken, setChatbox } = useApp();

	const idUser = localStorage.getItem("id_user");
	const [cartLength, setCartLength] = useState(null);
	const [categories, setCategories] = useState(null);

	//Lấy danh sách danh mục
	const getCategory = async () => {
		const res = await ProductService.getAllCategories();
		setCategories(res.data);
	};

	const getCarts = async () => {
		const result = await CartService.getCart(idUser);
		if (result.status === "SUCCESS") {
			setCartLength(result.data.length);
		}
	};

	useEffect(() => {
		if (idUser) {
			getCarts();
		}
		// eslint-disable-next-line
	}, [idUser]);

	const navigate = useNavigate();
	const handleLogout = () => {
		localStorage.clear();
		setToken(null);
		setChatbox([]);
		navigate("/");
	};

	const handleShowCart = () => {
		let idUser = user?.id;
		navigate(`/gio-hang/${idUser}`);
	};

	const checkUserBanned = async () => {
		if (idUser) {
			const res = await userService.checkUserBanned(idUser);
			if (res.status === "BLOCKED") {
				navigate("/block-account");
			}
		}
	};

	useEffect(() => {
		checkUserBanned();
		getCategory();
	}, []);

	const handleLogin = () => {
		setChatbox([]);
		navigate("/login");
	};

	return (
		<Grid
			container
			style={{
				width: "90%",
				margin: "0 auto",
				boxShadow:
					"rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px",
			}}
		>
			<Grid item xs={2} className={cx("col")}>
				<Link to={"/"} className={cx("logo")}>
					CHODOCU
				</Link>
			</Grid>

			<Grid item xs={2} className={cx("col")}>
				<DropdownMenu title="Danh mục" listActions={categories} category/>
			</Grid>

			{/* Tìm kiếm sản phẩm */}
			<Grid item xs={4} className={cx("col")}>
				<Search />
			</Grid>

			{token === null ? (
				<Grid item xs={4} className={cx("col")}>
					<DropdownMenu title="Tiện ích" listActions={ActionsUnLogin} />

					<Button
						style={{ marginLeft: 100 }}
						variant="contained"
						size="small"
						to="/login"
						onClick={handleLogin}
					>
						Đăng nhập
					</Button>
				</Grid>
			) : (
				<Grid item xs={4} className={cx("col")} style={{ paddingLeft: 10 }}>
					<Badge
						badgeContent={cartLength > 0 ? cartLength : 0}
						invisible={cartLength === 0}
						color="primary"
						className={cx("icon-button")}
					>
						<ShoppingCartIcon onClick={handleShowCart} />
					</Badge>

					<Notification />

					<Box ml={3} mr={1} p={0} display="inline-block">
						<DropdownMenu title={user?.name} listActions={ActionUserLogin} />
					</Box>

					<LogoutIcon className="icon-button" onClick={handleLogout} />
				</Grid>
			)}
		</Grid>
	);
}

export default Header;
