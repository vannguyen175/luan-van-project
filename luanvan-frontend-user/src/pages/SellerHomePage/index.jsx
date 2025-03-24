//Trang hiển thị các sản phẩm đang bán + thông tin chung của nhà bán hàng

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as UserService from "~/service/UserService";
import * as ProductService from "~/service/ProductService";
import Rating from "@mui/material/Rating";
import Description from "../../components/Description";
import ReactTimeAgo from "react-time-ago";
import Tooltip from "@mui/material/Tooltip";

import classNames from "classnames/bind";
import style from "./SellerHomePage.module.scss";

const cx = classNames.bind(style);

function SellerPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [navActive, setNavActive] = useState("product");
	const [pageState, setPageState] = useState({
		isLoading: false,
		data: [],
		total: 0,
		page: 1,
		pageSize: 10,
	});

	const [detail, setDetail] = useState({
		seller: null,
		product: [],
	});

	const getProducts = async () => {
		const res = await ProductService.getAllProducts({
			data: {
				state: ["approved"],
				cate: [],
				subCate: [],
				seller: id,
				isBlocked: true,
			},
			page: `page=${pageState.page}`,
			limit: `limit=${pageState.pageSize}`,
		});
		setDetail((prevData) => ({ ...prevData, product: res.data }));
	};

	useEffect(() => {
		const getDetailBuyer = async () => {
			const res = await UserService.getInfoUser(id);
			setDetail((prevData) => ({ ...prevData, seller: res.data }));
		};
		getDetailBuyer();
		getProducts();
	}, [id]);

	const handleClickCardProduct = (id) => {
		navigate(`/detail-product/${id}`);
	};

	return (
		<div style={{ width: "100%", display: "flex" }}>
			<div className={cx("profile")}>
				{detail.seller?.name && (
					<div>
						<div className="inner-content" style={{ paddingBottom: 30 }}>
							<div style={{ display: "flex", alignItems: "center" }}>
								<img
									className={cx("avatar")}
									src={detail?.seller?.avatar || "/assets/images/user-avatar.jpg"}
									alt="avatar"
								/>
								<div>
									<h2 className={cx("name")}>{detail?.seller?.name}</h2>
								</div>
							</div>
							<div className={cx("rating")}>
								{detail?.seller?.avgRating[0]?.averageRating ? (
									<>
										<Rating
											name="read-only"
											value={
												Math.round(
													detail?.seller?.avgRating[0]?.averageRating * 10
												) / 10
											}
											readOnly
										/>
										<strong>
											{Math.round(
												detail?.seller?.avgRating[0]?.averageRating * 10
											) / 10}
											/5
										</strong>
										<p>
											{detail?.seller?.avgRating[0]?.totalReviews} lượt đánh
											giá
										</p>
									</>
								) : (
									"Nhà bán hàng chưa có đánh giá nào"
								)}
							</div>
						</div>
						<div className={cx("contact", "inner-content")}>
							<Description title="Email:" desc={detail?.seller.email} />
							<Description title="Số điện thoại:" desc={detail?.seller.phone} />
							<Description
								title="Số điện thoại:"
								desc={`${detail?.seller.address}, ${detail?.seller.ward}, ${detail?.seller.district}, ${detail?.seller.province}`}
							/>
						</div>
					</div>
				)}
			</div>
			<div className={cx("inner-content")} style={{ width: "70%" }}>
				<div className={cx("nav-bar")}>
					<p
						className={cx(navActive === "product" && "active")}
						onClick={() => setNavActive("product")}
					>
						Sản phẩm
					</p>
					<p
						className={cx(navActive === "rating" && "active")}
						onClick={() => setNavActive("rating")}
					>
						Đánh giá
					</p>
				</div>
				{navActive === "product" ? (
					<div className={cx("product", "animate__animated", "animate__fadeIn")}>
						{detail?.product &&
							detail?.product?.map((item, key) => (
								<div className={cx("product-card")} key={key}>
									<img src={item.images[0]} alt="anh-SP" />
									<Tooltip title={item.name} placement="top-start">
										<p className={cx("name")}>{item.name}</p>
									</Tooltip>

									<p className={cx("price")}>
										{Intl.NumberFormat().format(item.price)}đ
									</p>
									<p>
										Đã đăng:{" "}
										<ReactTimeAgo
											date={Date.parse(item.updatedAt)}
											locale="vi-VN"
										/>
									</p>
									<button onClick={() => handleClickCardProduct(item._id)}>
										Xem chi tiết
									</button>
								</div>
							))}
					</div>
				) : (
					<div className={cx("rating", "animate__animated", "animate__fadeIn")}>
						{detail?.seller?.rating.length > 0 ? (
							detail.seller.rating.map((item, index) => {
								return (
									<div
										className={cx("rating-card")}
										key={index}
										style={{ display: "flex" }}
									>
										<div className={cx("img-product")}>
											<img src={item.idProduct.images[0]} alt="anhSP" />
										</div>
										<div className={cx("details")}>
											<p className={cx("name")}>{item.idBuyer.name}</p>
											<p className={cx("rating")}>
												<Rating
													name="read-only"
													size="large"
													value={
														detail?.seller?.avgRating[0]?.averageRating
													}
													readOnly
												/>
												<span>
													{detail?.seller?.avgRating[0]?.averageRating}/5
												</span>
											</p>
											<p className={cx("review")}>{item.review}</p>
										</div>
									</div>
								);
							})
						) : (
							<p>Nhà bán hàng chưa có đánh giá nào.</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default SellerPage;
