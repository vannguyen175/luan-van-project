import { useEffect, useState } from "react";
import * as RatingService from "~/service/RatingService";
import Rating from "@mui/material/Rating";

import classNames from "classnames/bind";
import style from "./ForSeller.module.scss";

const cx = classNames.bind(style);

function RatingAnalytic() {
	const idUser = localStorage.getItem("id_user");
	const [detail, setDetail] = useState();
	const [activeBtn, setActiveBtn] = useState(0);

	useEffect(() => {
		const getDetailRating = async () => {
			const res = await RatingService.getRating(idUser); //lấy info người bán
			setDetail({
				rating: res.data,
				avgRating: res.avgRating,
				ratingCounts: res.ratingCounts,
			});
		};
		if (idUser) {
			getDetailRating();
		}
	}, [idUser]);

	return (
		<div>
			<div className="inner-content">
				<p className="title">Đánh giá nhà bán hàng</p>
				<div style={{ display: "flex" }}>
					<div style={{ marginRight: "15%", marginLeft: 50, marginTop: 10 }}>
						{detail?.rating && (
							<div>
								<div>
									<h2>{detail.avgRating[0]?.averageRating}/5</h2>
								</div>
								<div>
									<p>{detail.avgRating[0]?.totalReviews} đánh giá</p>
								</div>
							</div>
						)}
					</div>
					<div className={cx("show-rating-btn")}>
						<button
							onClick={() => setActiveBtn(0)}
							className={cx(activeBtn === 0 && "active-btn")}
						>
							Tất cả
						</button>
						<button
							onClick={() => setActiveBtn(5)}
							className={cx(activeBtn === 5 && "active-btn")}
						>
							5 sao ({detail?.ratingCounts[5] || 0})
						</button>
						<button
							onClick={() => setActiveBtn(4)}
							className={cx(activeBtn === 4 && "active-btn")}
						>
							4 sao ({detail?.ratingCounts[4] || 0})
						</button>
						<button
							onClick={() => setActiveBtn(3)}
							className={cx(activeBtn === 3 && "active-btn")}
						>
							3 sao ({detail?.ratingCounts[3] || 0})
						</button>
						<button
							onClick={() => setActiveBtn(2)}
							className={cx(activeBtn === 2 && "active-btn")}
						>
							2 sao ({detail?.ratingCounts[2] || 0})
						</button>
						<button
							onClick={() => setActiveBtn(1)}
							className={cx(activeBtn === 1 && "active-btn")}
						>
							1 sao ({detail?.ratingCounts[1] || 0})
						</button>
					</div>
				</div>
			</div>
			<div className="inner-content">
				<div className={cx("rating", "animate__animated", "animate__fadeIn")}>
					{detail?.rating.length > 0 ? (
						detail.rating.map((item, index) => {
							return activeBtn === 0 ? (
								<div className={cx("rating-card")} style={{ display: "flex" }}>
									<div className={cx("img-product")}>
										<img src={item.idProduct.images[0]} alt="anhSP" />
									</div>
									<div className={cx("details")}>
										<p>Đã mua SP: {item.idProduct._id}</p>
										<p className={cx("name")}>{item.idBuyer.name}</p>
										<p className={cx("rating-score")}>
											<Rating
												name="read-only"
												//size="large"
												value={item?.score}
												readOnly
											/>
											<span style={{ marginLeft: 20 }}>{item?.score}/5</span>
										</p>
										<p className={cx("review")}>{item.review}</p>
									</div>
								</div>
							) : (
								activeBtn === item?.score && (
									<div className={cx("rating-card")} style={{ display: "flex" }}>
										<div className={cx("img-product")}>
											<img src={item.idProduct.images[0]} alt="anhSP" />
										</div>
										<div className={cx("details")}>
											<p>Đã mua SP: {item.idProduct._id}</p>
											<p className={cx("name")}>{item.idBuyer.name}</p>
											<p className={cx("rating-score")}>
												<Rating
													name="read-only"
													//size="large"
													value={item?.score}
													readOnly
												/>
												<span style={{ marginLeft: 20 }}>
													{item?.score}/5
												</span>
											</p>
											<p className={cx("review")}>{item.review}</p>
										</div>
									</div>
								)
							);
						})
					) : (
						<p>Nhà bán hàng chưa có đánh giá nào.</p>
					)}
				</div>
			</div>
		</div>
	);
}

export default RatingAnalytic;
