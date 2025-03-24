import * as ProductService from "~/service/ProductService";
import * as UserService from "~/service/UserService";
import * as CartService from "~/service/CartService";
import ReactTimeAgo from "react-time-ago";
import TimeAgo from "javascript-time-ago";
import vi from "javascript-time-ago/locale/vi";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { toast } from "react-toastify";
import Rating from "@mui/material/Rating";

//import Button from "~/components/Button";
import classNames from "classnames/bind";
import style from "./DetailProduct.module.scss";
import { useEffect, useState } from "react";
import Button from "~/components/Button";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Description from "~/components/Description";
import ImagePreview from "~/components/ImagePreview";
import { useApp } from "~/context/AppProvider";
import { formatPhoneNumber } from "../../utils";
import CircularProgress from "@mui/material/CircularProgress";
import CardProduct from "~/components/CardProduct";

const cx = classNames.bind(style);
TimeAgo.addLocale(vi);

function DetailProduct() {
	const { id } = useParams();
	const { user, setChatbox, chatbox } = useApp();
	const navigate = useNavigate();
	//const [buyerDetail, setBuyerDetail] = useState();
	const [quantitySelected, setQuantitySelected] = useState(1);
	const location = useLocation();
	const [productBySubCate, setProductBySubCate] = useState();
	const [details, setDetails] = useState({
		product: {},
		seller: {},
		buyer: {},
		stateShow: "product",
	});
	// const getDetailBuyer = async () => {
	// 	const res = await UserService.getInfoUser(user?.id);
	// 	console.log("getDetailBuyer", res);

	// 	setBuyerDetail(res.data);
	// };

	const getDetailProduct = async () => {
		const res = await ProductService.detailProduct(id);
		setDetails((prevDetails) => ({
			...prevDetails,
			product: res.data,
		}));
		if (res.data) {
			getProductsBySubCate(res.data.subCategory.name);
		}
		getDetailSeller(res.data.idUser._id);
	};

	const getProductsBySubCate = async (subCate) => {
		const res = await ProductService.getAllProducts({
			data: { state: ["approved"], cate: [], subCate: [subCate] },
			page: `page=${1}`,
			limit: `limit=${10}`,
		});
		const filteredProducts = res.data.filter((product) => product._id !== id);
		setProductBySubCate(filteredProducts);
	};
	useEffect(() => {
		getDetailProduct();
		// if (user?.id) {
		// 	getDetailBuyer();
		// }
		// eslint-disable-next-line
	}, []);

	const getDetailSeller = async (idUser) => {
		const res = await UserService.getInfoUser(idUser);
		setDetails((prevDetails) => ({
			...prevDetails,
			seller: res.data,
		}));
	};

	const handleChoseQuantity = (type, e) => {
		if (e?.target?.value !== undefined) {
			const value = e.target.value.replace(/[^0-9]/g, "");
			if (/^\d+$/.test(value) && value <= details.product?.quantity) {
				setQuantitySelected(parseInt(value, 10)); // Chỉ chấp nhận số
			} else if (value === "") {
				setQuantitySelected(""); // Cho phép xóa tạm thời
			} else {
				toast.warning("Số lượng nhập vào không được lớn hơn số lượng hàng tồn kho.");
			}
		} else if (quantitySelected === 1 && type === "remove") return;
		else if (quantitySelected === details.product?.quantity && type === "add") return;
		else if (type === "remove") setQuantitySelected(quantitySelected - 1);
		else if (type === "add") setQuantitySelected(quantitySelected + 1);
	};

	// Xử lý khi người dùng rời khỏi input nhập số lượng
	const handleBlurQuantityInput = () => {
		if (quantitySelected === "" || quantitySelected < 1) {
			setQuantitySelected(1); // Đặt về giá trị mặc định nếu không hợp lệ
		}
	};

	const handleOrderNow = () => {
		if (user.id) {
			navigate(`/dat-hang/${id}/${quantitySelected}`);
		} else {
			navigate("/login", { state: location.pathname });
		}
	};

	const handleAddCart = async () => {
		if (user.id) {
			const addCart = await CartService.createCart({
				id: user.id,
				idProduct: details.product._id,
				quantity: quantitySelected,
			});
			if (addCart?.status === "SUCCESS") {
				toast.success("Thêm sản phẩm vào giỏ hàng thành công");
			} else if (addCart?.status === "EXIST") {
				toast.warning("Sản phẩm đã tồn tại trong giỏ hàng");
			}
		} else {
			navigate("/login", { state: location.pathname });
		}
	};

	const handleShowDetail = (value) => {
		setDetails((prev) => ({ ...prev, stateShow: value }));
	};

	const addChatID = (newId) => {
		//newId = id người nhận tin nhắn
		if (!chatbox.includes(newId)) {
			const updatedChatbox = [...chatbox, newId];
			setChatbox(updatedChatbox);
		}
	};

	return (
		<div className={cx("animate__animated", "animate__fadeIn")}>
			{details.product?.name ? (
				<div style={{ display: "flex", minHeight: "100vh" }}>
					<div
						className={cx("inner-content", "sticky")}
						style={{ width: "30%", height: "fit-content" }}
					>
						{details.product.images ? (
							<ImagePreview data={details.product.images} />
						) : (
							<div style={{ textAlign: "center" }}>
								<CircularProgress />
							</div>
						)}
					</div>
					{details.product.name && (
						<div style={{ width: "70%" }}>
							<div
								className={cx("inner-content", "sticky")}
								style={{ paddingLeft: 30 }}
							>
								<p>
									{details.product?.subCategory.category.name} /{" "}
									{details.product?.subCategory.name}
								</p>
								<h2 style={{ color: "var(--main-color)", marginTop: 10 }}>
									{details.product?.name}
								</h2>
								{details.product?.idUser._id &&
									details.product?.idUser._id === user?.id && (
										<div style={{ display: "flex" }}>
											<p style={{ marginRight: 10 }}>
												Đây là sản phẩm của bạn.
											</p>
										</div>
									)}
							</div>

							<div className={cx("inner-content")} style={{ paddingLeft: 10 }}>
								<div className={cx("tab-button")}>
									<button
										className={cx(
											details.stateShow === "product" && "button-active"
										)}
										onClick={() => {
											handleShowDetail("product");
										}}
									>
										Sản phẩm
									</button>
									<button
										className={cx(
											details.stateShow === "seller" && "button-active"
										)}
										onClick={() => {
											handleShowDetail("seller");
										}}
									>
										Người bán
									</button>
								</div>
								{details.stateShow === "product" && (
									<div style={{ paddingLeft: 30 }}>
										<h5>Thông tin chung</h5>
										<Description
											title="Giá tiền"
											desc={`${Intl.NumberFormat().format(
												details.product?.price
											)}đ`}
										/>
										<Description
											title="Số lượng"
											desc={details.product?.quantityState}
										/>
										<Description
											title="Thời điểm đăng"
											desc={
												<ReactTimeAgo
													date={Date.parse(details.product?.createdAt)}
													locale="vi-VN"
												/>
											}
										/>
										<Description
											title="Địa chỉ bán hàng"
											desc={`${details.product?.address?.address}, ${details.product?.address?.ward}, ${details.product?.address?.district}, ${details.product?.address?.province}`}
										/>
										<Description
											title="Tin đã được kiểm duyệt"
											desc={<CheckCircleOutlineIcon />}
										/>
										{details.product?.idUser._id &&
										details.product?.idUser._id === user?.id ? (
											<p style={{ textAlign: "center", marginTop: 20 }}>
												Đây là sản phẩm của bạn
											</p>
										) : new Date(details.seller?.blockExpireDate) >
										  new Date() ? (
											<p
												style={{
													textAlign: "center",
													marginTop: 20,
													color: "red",
												}}
											>
												Nhà bán hàng đang bị tạm khóa
											</p>
										) : details.product?.quantityState === 0 ? (
											<div
												style={{
													textAlign: "center",
													color: "var(--orange-color)",
												}}
											>
												<h4>Hết hàng.</h4>
											</div>
										) : (
											<div className={cx("actions")}>
												<div
													style={{
														display: "flex",
														justifyContent: "center",
													}}
												>
													<div className={cx("actions-price")}>
														<p>Tổng tiền: &nbsp;</p>
														<strong>
															{Intl.NumberFormat().format(
																details.product?.price *
																	quantitySelected
															)}
															đ
														</strong>
													</div>
													<div className={cx("actions-quantity")}>
														<p>Số lượng:</p>
														<RemoveIcon
															onClick={() =>
																handleChoseQuantity("remove")
															}
														/>
														<input
															type="number"
															value={quantitySelected}
															onChange={(e) =>
																handleChoseQuantity("", e)
															}
															onBlur={handleBlurQuantityInput}
															className={cx("quantity-input")}
															onKeyDown={(evt) =>
																["e", "E", "+", "-", "."].includes(
																	evt.key
																) && evt.preventDefault()
															}
														/>
														<AddIcon
															onClick={() =>
																handleChoseQuantity("add")
															}
														/>
													</div>
												</div>

												<div className={cx("actions-button")}>
													<Button
														style={{ width: "70%" }}
														onClick={handleAddCart}
													>
														Thêm vào giỏ hàng
													</Button>
													<Button
														primary
														style={{ width: "70%" }}
														onClick={handleOrderNow}
													>
														Đặt hàng ngay
													</Button>
												</div>
											</div>
										)}
										<hr />

										<h5>Thông tin chi tiết sản phẩm</h5>
										{Object.keys(details.product?.info).map((value, index) => (
											<p className={cx("info")} key={index}>
												<Description
													title={value}
													desc={details.product?.info[value]}
												/>
											</p>
										))}

										<Description
											title="Trạng thái sản phẩm"
											desc={
												details.product?.stateProduct === "used"
													? "Đã sử dụng"
													: "Mới"
											}
										/>
										<Description
											title="Mô tả sản phẩm"
											desc={details.product?.description || "Không có"}
										/>
									</div>
								)}
								{details.stateShow === "seller" && (
									<div
										style={{ paddingLeft: 30 }}
										className={cx("detail-seller")}
									>
										<h5>Thông tin nhà bán hàng</h5>

										<div className={cx("main-info")}>
											<img
												src={details.seller?.avatar}
												alt="anh-nguoi-ban"
												className={cx("avatar")}
											/>

											<p
												onClick={() =>
													navigate(`/seller/${details.seller?.user}`)
												}
												className={cx("name")}
											>
												{details.seller?.name}
											</p>
											{details.product?.idUser._id &&
												user.id &&
												!(
													new Date(details.seller?.blockExpireDate) >
													new Date()
												) &&
												details.product?.idUser._id !== user?.id && (
													<button
														className={cx("chat-btn")}
														onClick={() =>
															addChatID(details.seller.user)
														}
													>
														Chat với nhà bán hàng
													</button>
												)}
										</div>

										<Description
											title="Đánh giá"
											desc={
												<>
													{details.seller?.avgRating[0]?.averageRating ? (
														<>
															<Rating
																name="read-only"
																value={
																	Math.round(
																		details.seller?.avgRating[0]
																			?.averageRating * 10
																	) / 10
																}
																readOnly
															/>
															<span style={{ marginLeft: 10 }}>
																{Math.round(
																	details?.seller?.avgRating[0]
																		?.averageRating * 10
																) / 10}
																/5
															</span>
														</>
													) : (
														"Chưa có đánh giá nào"
													)}
												</>
											}
											className={cx("rating")}
										/>

										<Description
											title="Email"
											desc={formatPhoneNumber(details.seller?.email)}
										/>
										<Description
											title="Số điện thoại"
											desc={formatPhoneNumber(details.seller?.phone)}
										/>
										<Description
											title="Địa chỉ"
											desc={
												(details.seller?.address &&
													[
														details.seller?.address,
														details.seller?.ward,
														details.seller?.district,
														details.seller?.province,
													].join(", ")) ||
												"Chưa có"
											}
										/>

										{new Date(details.seller?.blockExpireDate) > new Date() && (
											<p
												style={{
													textAlign: "center",
													marginTop: 20,
													color: "red",
												}}
											>
												Nhà bán hàng đang bị tạm khóa
											</p>
										)}
									</div>
								)}
							</div>

							<div className="row"></div>
						</div>
					)}
				</div>
			) : (
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						width: "100%",
					}}
				>
					<CircularProgress color="inherit" />
				</div>
			)}
			<div className={cx("inner-content", "animate__animated", "animate__fadeIn")}>
				<div className="title">Những sản phẩm bạn có thể thích</div>
				<div style={{ display: "flex", flex: "wrap", width: "100%" }}>
					{productBySubCate &&
						productBySubCate?.map((product, key) => (
							<CardProduct key={key} product={product} />
						))}
				</div>
			</div>
		</div>
	);
}

export default DetailProduct;
