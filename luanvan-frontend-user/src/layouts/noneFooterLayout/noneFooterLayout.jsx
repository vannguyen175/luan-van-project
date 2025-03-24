import Header from "./Header.jsx";
// import { Outlet } from "react-router-dom";
import style from "./UserLayouts.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

function noneFooter({ children }) {
	return (
		<div className={cx("container")}>
			<Header className={cx("content")} />
			<div className={cx("inner")}>{children}</div>
		</div>
	);
}

export default noneFooter;
