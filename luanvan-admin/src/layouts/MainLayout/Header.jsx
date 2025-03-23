import style from "./mainLayout.module.scss";
import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppProvider";

const cx = classNames.bind(style);

function Header() {
	const { user } = useApp();
	
	const navigate = useNavigate();
	const handleLogout = () => {
		localStorage.clear();
		navigate("/login");
	};
	return (
		<div className={cx("header")}>
			<h1 style={{ fontSize: "1.2rem" }}>Trang quản lý dành cho quản trị viên</h1>
			<button className={cx("button")} onClick={handleLogout}>
				Đăng xuất
			</button>
		</div>
	);
}

export default Header;
