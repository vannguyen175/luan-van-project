import classNames from "classnames/bind";
import style from "./Profile.module.scss";

const cx = classNames.bind(style);

function Activities() {
	return (
		<div style={{ overflow: "unset" }}>
			<div className="inner-content">
				<p className="title">Hoạt động người dùng</p>
				<button className={cx("button")}>Đang theo dõi</button>
				<button className={cx("button")}>Sản phẩm đã xem gần đây</button>
			</div>
		</div>
	);
}

export default Activities;
