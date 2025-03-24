import classNames from "classnames/bind";
import style from "./OrderProduct.module.scss";
import Button from "~/components/Button";
import Grid from "@mui/material/Grid";
import { Link, useParams } from "react-router-dom";
import * as CartService from "~/service/CartService";
import * as ProductService from "~/service/ProductService";

import * as OrderService from "~/service/OrderService";
import * as PaymentService from "~/service/PaymentService";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "~/components/Modal";
import { useApp } from "~/context/AppProvider";
import AddressForm from "~/components/AddressForm";
import { formatPhoneNumber } from "../../utils";
import StoreMallDirectoryIcon from "@mui/icons-material/StoreMallDirectory";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import emailjs from "@emailjs/browser";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

const cx = classNames.bind(style);

function OrderProduct() {
	const { id, quantity } = useParams();
	const cartSelected = localStorage.getItem("cartSelected");
	const idUser = localStorage.getItem("id_user");
	const { user } = useApp();
	const [modalChangeAddress, setModalChangeAddress] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState("cash");
	const [isLoading, setIsLoading] = useState(false);
	const [modalSuccess, setModalSuccess] = useState(false);
	const [isExistClosedProduct, setIsExistClosedProduct] = useState();
	const [totalPrice, setTotalPrice] = useState(0);
	const [details, setDetails] = useState({
		product: {},
		buyer: {},
		address: {},
	});

	const getProducts = async () => {
		let data = [];
		if (id && quantity) {
			const result = await ProductService.detailProduct(id);
			if (result) {
				data = [
					{
						idProduct: result.data._id,
						idSeller: result.data.idUser,
						image: result.data.images[0],
						name: result.data.name,
						email: result.data.idUser.email,
						price: result.data.price,
						quantity: +quantity, // Ép kiểu từ string sang số nguyên
						sellerName: result.data.idUser.name,
						statePost: result.data.statePost,
						totalQuantity: result.data.quantity,
						shippingPrice: 15000,
					},
				];
			}
		} else {
			const result = await CartService.getCart(idUser);
			const selectedProducts = result?.data?.filter((_, index) =>
				cartSelected.includes(index)
			);
			//check xem dsach sản phẩm có chứa SP đang ở trạng thái "closed" hay không
			const isClosedProductExist = selectedProducts.some(
				(product) => product.statePost === "closed"
			);
			setIsExistClosedProduct(isClosedProductExist);

			data = selectedProducts.map((product) => ({
				...product,
				shippingPrice: 15000,
			}));
		}

		const resultBySeller = data.reduce((acc, product) => {
			const { email, price, quantity } = product;
			const totalPrice = price * quantity;

			if (!acc[email]) {
				acc[email] = {
					products: [],
					totalAmount: 0,
				};
			}
			acc[email].products.push(product);
			acc[email].totalAmount += totalPrice;

			return acc;
		}, {});

		setDetails((prevDetails) => ({
			...prevDetails,
			product: resultBySeller,
		}));

		const total = data?.reduce((sum, item) => sum + item.price * item.quantity, 0);
		setTotalPrice(total);
	};

	useEffect(() => {
		getProducts();

		if (user.id) {
			//getDetailBuyer();
			setDetails((prevDetails) => ({
				...prevDetails,
				buyer: {
					id: user.id,
					avatar: user.avatar,
					name: user.name,
				},
				address: {
					email: user.email,
					phone: user.phone,
					province: user.province,
					district: user.district,
					ward: user.ward,
					address: user.address,
				}, //address's buyer
			}));
		}
		// eslint-disable-next-line
	}, [user]); //detail-seller

	//Người dùng click button "Dat hang ngay" => hiện model confirm đơn hàng
	const handleCheckOrder = async () => {
		if (
			details.address.email === null ||
			details.address.address === null ||
			details.address.phone === null
		) {
			toast.error("Vui lòng điển đầy đủ thông tin đặt hàng");
		} else {
			if (window.confirm("Bạn có chắc muốn đặt hàng?")) {
				handleOrder();
			}
		}
	};

	//Cập nhật gtri select khi người dùng thay đổi PaymentMethod
	const handleChangePaymentMethod = (e) => {
		//console.log("e.target.value", e.target.value);
		setPaymentMethod(e.target.value);
	};

	//tiến hành lưu thông tin order
	const handleOrder = async () => {
		if (isExistClosedProduct) {
			toast.error(
				"Đơn hàng hiện có chứa sản phẩm đã ngừng bán. Vui lòng xóa sản phẩm đó và thực hiện thanh toán lại."
			);
		} else {
			const dataOrder = {
				products: details.product, //array
				paymentMethod: paymentMethod,
				shippingDetail: {
					email: details.address.email,
					phone: details.address.phone,
					address:
						details.address.address +
						", " +
						details.address.ward +
						", " +
						details.address.district +
						", " +
						details.address.province,
					shippingPrice: (cartSelected?.length || 1) * 15000,
				},
				idBuyer: details.buyer.id,
				totalPaid: totalPrice + (cartSelected?.length || 1) * 15000,
			};

			const allProducts = Object.values(dataOrder.products)
				.map((seller) => seller.products) // Lấy mảng sản phẩm của mỗi người bán
				.flat(); // Kết hợp tất cả các mảng sản phẩm thành một mảng duy nhất

			setIsLoading(true);

			if (dataOrder.paymentMethod === "vnpay") {
				localStorage.setItem("dataOrder", JSON.stringify(dataOrder));
				const res = await PaymentService.createPayment({
					amount: dataOrder.totalPaid,
					bankCode: "",
					language: "vn",
				});
				window.location.href = res.redirect;
			} else {
				const res = await OrderService.createOrder({ ...dataOrder, products: allProducts });

				if (res.status === "SUCCESS") {
					//gửi email thông báo đơn hàng mới đến sellers
					const emailSeller = Object.keys(dataOrder.products);
					for (let index = 0; index < emailSeller.length; index++) {
						if (
							emailSeller[index] === "vanngnran@gmail.com" ||
							emailSeller[index] === "ntthuyvan1705@gmail.com"
						) {
							sendEmail(dataOrder.products[emailSeller[index]]);
						}
					}
					setIsLoading(false);
					setModalSuccess(true);
				} else {
					setIsLoading(false);
					toast.error(res.message);
				}
			}
		}
	};

	const sendEmail = (value) => {
		const templateParams = {
			to_name: value.products[0].sellerName,
			to_email: value.products[0].email,
			item: {
				...value.products[0],
				price: new Intl.NumberFormat("vi-VN").format(value.products[0].price),
				shippingPrice: new Intl.NumberFormat("vi-VN").format(
					value.products[0].shippingPrice
				),
			},
			totalAmount: new Intl.NumberFormat("vi-VN").format(
				value.totalAmount + (cartSelected?.length || 1) * 15000
			),
			buyer: details.buyer,
			address: details.address,
			paymentMethod: "Thanh toán khi nhận hàng",
		};

		emailjs
			.send(
				"service_dnzblz9",
				"template_yvydi8f",

				templateParams,

				{
					publicKey: "Uxe-oHKEjYqhsFh_P",
				}
			)
			.then(
				(result) => {
					console.log("SUCCESS!", result.text);
				},
				(error) => {
					console.log("FAILED...", error.text);
				}
			);
	};

	const removeProduct = async (id) => {
		const res = await CartService.deleteCart({ idUser: idUser, idProduct: id });
		if (res.status === "SUCCESS") {
			getProducts();
		}
	};

	return (
		<div>
			<div style={{ margin: "5px auto 30px auto", display: "flex" }}>
				<div style={{ width: "60%" }}>
					<div className={cx("inner-content", "product")}>
						<p className="title">Sản phẩm</p>
						{Object.keys(details?.product)?.map((email, index) => {
							return (
								<div className={cx("cart", "row")} key={index}>
									<div className={cx("seller")}>
										<div>
											<StoreMallDirectoryIcon />{" "}
											{details.product[`${email}`]?.products[0].sellerName}
										</div>
									</div>
									{details.product[`${email}`]?.products?.length &&
										details.product[`${email}`]?.products?.map(
											(item, index) => {
												return (
													<div
														key={index}
														style={{
															display: "flex",
															padding: "20px 10px 0 10px",
														}}
													>
														<img
															className="col-2"
															src={`${item?.image}`}
															alt="anh-san-pham"
														/>
														<div className={cx("detail", "col-5")}>
															<p className={cx("name")}>
																{item?.name}
															</p>
															<p className={cx("price")}>
																Giá:{" "}
																{Intl.NumberFormat().format(
																	item?.price
																)}
																đ
															</p>
															<p>Số lượng: {item?.quantity}</p>
															{item?.statePost === "closed" && (
																<div className={cx("remove-btn")}>
																	<p style={{ color: "red" }}>
																		Sản phẩm đã ngưng bán.
																	</p>
																	<IconButton
																		color="secondary"
																		onClick={() =>
																			removeProduct(
																				item.idProduct
																			)
																		}
																	>
																		<DeleteIcon />
																	</IconButton>
																</div>
															)}
														</div>
														<div className={cx("price", "col-5")}>
															<div>
																<span>Phí vận chuyển: </span>
																<p>
																	{Intl.NumberFormat().format(
																		15000
																	)}
																	đ
																</p>
															</div>
															<div>
																<span>Tổng tiền: </span>
																<p>
																	{Intl.NumberFormat().format(
																		item?.price *
																			item?.quantity +
																			15000
																	)}
																	đ
																</p>
															</div>
														</div>
													</div>
												);
											}
										)}
								</div>
							);
						})}
					</div>
				</div>

				<div className={cx("buyer")} style={{ width: "40%" }}>
					<div className={cx("inner-content", "detail-order")}>
						<p className={cx("title")}>Thông tin đặt hàng</p>
						<Grid container style={{ display: "flex", alignItems: "center" }}>
							<Grid item xs={1}>
								<span className={cx("avatar")}>
									<img src={`${details.buyer?.avatar}`} alt="avatar" />
								</span>
							</Grid>
							<Grid item xs={7}>
								<p className={cx("name")}>{details.buyer?.name}</p>
							</Grid>
							<Grid item xs={4}>
								<button
									onClick={() => setModalChangeAddress(true)}
									className={cx("update-button")}
								>
									Cập nhật thông tin
								</button>
							</Grid>
						</Grid>
						<div className={cx("info")}>
							<div>
								<span>Email:</span>
								{details.address?.email || "Chưa có"}
							</div>
							<div>
								<span>Số điện thoại: </span>
								{formatPhoneNumber(details?.address.phone) || "Chưa có"}
							</div>

							<div>
								<span>Địa chỉ:</span>

								{(details.address?.address &&
									[
										details.address?.address,
										details.address?.ward,
										details.address?.district,
										details.address?.province,
									].join(", ")) ||
									"Chưa có"}
							</div>
							<hr />
							<div>
								<div className={cx("payment")}>
									<p style={{ marginRight: 20 }}>Hình thức thanh toán:</p>
									<div>
										<input
											type="radio"
											onChange={handleChangePaymentMethod}
											name="payment"
											value="cash"
											checked="checked"
										/>
										<label htmlFor="html">Thanh toán khi nhận hàng</label>
										<br />
										<input
											type="radio"
											onChange={handleChangePaymentMethod}
											name="payment"
											value="vnpay"
										/>
										<label htmlFor="html">Thanh toán qua VNPay</label>
										<br />
									</div>
								</div>
							</div>
						</div>
					</div>
					<Modal
						title="Cập nhật thông tin giao hàng"
						isOpen={modalChangeAddress}
						setIsOpen={setModalChangeAddress}
						width={800}
					>
						<div style={{ textAlign: "center" }}>
							<AddressForm setDataSubmit={setDetails} data={details.address} />
							<Button
								onClick={() => {
									setModalChangeAddress(false);
								}}
							>
								Cập nhật
							</Button>
						</div>
					</Modal>
					<div className={cx("inner-content", "summary")}>
						<p className={cx("title")}>Thông tin chung</p>
						<div className={cx("price")}>
							<p>
								Giá sản phẩm:
								<span>{Intl.NumberFormat().format(totalPrice)}đ</span>
							</p>
							<p>
								Giá vận chuyển:{" "}
								<span>
									{Intl.NumberFormat().format(
										(cartSelected?.length || 1) * 15000
									)}{" "}
									đ
								</span>
							</p>
							<p>
								Tổng cộng:
								<span style={{ color: "red" }}>
									{Intl.NumberFormat().format(
										totalPrice + (cartSelected?.length || 1) * 15000
									)}
									đ
								</span>
							</p>
						</div>
						<hr style={{ marginBlock: 30 }} />

						<div className={cx("order-btn")}>
							<Button primary onClick={handleCheckOrder}>
								Đặt hàng ngay
							</Button>
							{/* <Link to="/payment-vnpay">Đặt hàng ngay</Link> */}
						</div>
					</div>
				</div>
				<Backdrop
					sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
					open={isLoading}
				>
					<CircularProgress color="inherit" />
				</Backdrop>
				<Modal
					isOpen={modalSuccess}
					setIsOpen={setModalSuccess}
					width={600}
					isBlockClosed={true}
				>
					<div className={cx("confirm-success")}>
						<CheckCircleIcon color="success" fontSize="large" />
						<h5>Đặt hàng thành công!</h5>
						<p>Vui lòng chờ nhà bán hàng chuẩn bị và vận chuyển đơn hàng.</p>
						<Link to={"/"}>Quay về trang chủ</Link>
					</div>
				</Modal>
			</div>
		</div>
	);
}

export default OrderProduct;
