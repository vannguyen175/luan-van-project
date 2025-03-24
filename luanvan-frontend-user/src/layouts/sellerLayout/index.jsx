import Header from "./Header.jsx";
import style from "./SellerLayout.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

function SellerLayout({ children }) {
	return (
		<div className={cx("container")}>
			<Header />
			<div className={cx("inner")}>{children}</div>
		</div>
	);
}

export default SellerLayout;