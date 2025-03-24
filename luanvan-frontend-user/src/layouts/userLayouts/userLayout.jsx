import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
// import { Outlet } from "react-router-dom";
import style from "./UserLayouts.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

function UserLayout({ children }) {
	return (
		<div className={cx("container")}>
			<Header />
			<div className={cx("inner")}>{children}</div>
			<Footer />
		</div>
	);
}

export default UserLayout;
