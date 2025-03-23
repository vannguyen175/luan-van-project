import Header from "./Header";
import classNames from "classnames/bind";
import style from "./mainLayout.module.scss";
import Menu from "./Menu";

const cx = classNames.bind(style);

function MainLayout({ children }) {
	return (
		<>
			<Header />
			<div style={{ display: "flex" }}>
				<Menu />
				<div className={cx("innner")}>{children}</div>
			</div>
		</>
	);
}

export default MainLayout;
