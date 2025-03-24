//type = vertical - horizontal
//props = {src, alt, name, price, name, time-post, place}

import style from "./CardProduct.module.scss";
import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";
import vi from "javascript-time-ago/locale/vi";
import ReactTimeAgo from "react-time-ago";
import TimeAgo from "javascript-time-ago";

import Grid from "@mui/material/Grid";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const cx = classNames.bind(style);
TimeAgo.addLocale(vi);

function CardProduct({ type, product }) {
	let navigate = useNavigate();
	const handleClick = () => {
		navigate(`/detail-product/${product._id}`);
	};

	return (
		<div>
			{type === "horizontal" ? ( //ngang
				<div
					className={cx("container", "animate__animated", "animate__fadeIn")}
					onClick={() => handleClick()}
				>
					<Grid container>
						<Grid item xs={3}>
							<img
								className={cx("image-product")}
								src={`${product.images[0]}`}
								alt="anh-san-pham"
							/>
						</Grid>
						<Grid item xs={8} className={cx("detail-product")}>
							<p className={cx("name")}>{product.name}</p>
							<p className={cx("price")}>
								{Intl.NumberFormat().format(product.price)}đ
							</p>
							<div className={cx("info-seller")}>
								<p>
									<PersonOutlineOutlinedIcon className={cx("icon")} />

									{product.idUser.name}
								</p>

								<p className={cx("time-post")}>
									<AccessTimeOutlinedIcon className={cx("icon")} />
									<ReactTimeAgo
										date={Date.parse(product.createdAt)}
										locale="vi-VN"
									/>
								</p>

								<p className={cx("place")}>
									<LocationOnIcon className={cx("icon")} />
									{product.address.province}
								</p>
							</div>
						</Grid>
					</Grid>
				</div>
			) : (
				<div
					className={cx("container-vertical", "animate__animated", "animate__fadeIn")}
					onClick={() => handleClick()}
				>
					<img
						className={cx("image-product-vertical")}
						src={`${product.images[0]}`}
						alt="anh-san-pham"
					/>

					<div className={cx("detail-product-vertical")}>
						<p className={cx("name")}>{product.name}</p>
						<p className={cx("price")}>{Intl.NumberFormat().format(product.price)}đ</p>
						<div className={cx("info-seller")}>
							<div className={cx("time-post")}>
								<ReactTimeAgo date={Date.parse(product.createdAt)} locale="vi-VN" />
							</div>
							<div className={cx("place")}>{product.address.province}</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default CardProduct;
