import style from "./UserLayouts.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

function Footer() {
	return (
		<div className={cx("footer")}>
			<div className="row">
				<div className="col">
					<p className={cx("title")}>Kết nối với chúng tôi</p>
					<p>0968.762.175</p>
					<p>Địa chỉ</p>
					<p>Bình Thủy, Cần Thơ</p>
					<p>Email: hotro@gmail.com</p>
				</div>
				<div className="col">
					<p className={cx("title")}>Hướng dẫn</p>
					<p>Hướng dẫn mua hàng</p>
					<p>Hướng dẫn đăng bán sản phẩm</p>
					<p>Hỏi đáp</p>
					<p>Điều khoản sử dụng</p>
				</div>
				<div className="col">
					<p className={cx("title")}>Đi đến trang</p>
					<p>Danh mục</p>
					<p>Đăng tải sản phẩm</p>
					<p>Tài khoản</p>
					<p>Giỏ hàng</p>
				</div>
				<div className="col">
					<p className={cx("title")}>Khác</p>
					<p>Trở thành nhà cung cấp</p>
					<p>Cộng tác với chúng tôi</p>
					<p>Chính sách bảo mật</p>
					<p>Điều khoản sử dụng</p>
				</div>
			</div>
			<p style={{ userSelect: "none", marginTop: 30, textAlign: "center" }}>
				© 2024 GoodsTrading. Designed by VanNguyen
			</p>
		</div>
	);
}

export default Footer;
