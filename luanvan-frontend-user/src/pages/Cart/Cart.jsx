import { useNavigate, useParams } from "react-router-dom";
import classNames from "classnames/bind";
import style from "./Cart.module.scss";
import * as CartService from "~/service/CartService";
import { useEffect, useRef, useState } from "react";
import Button from "~/components/Button";

import StoreMallDirectoryIcon from "@mui/icons-material/StoreMallDirectory";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const cx = classNames.bind(style);

function Cart() {
	const { id } = useParams(); //idUser
	const timeoutRef = useRef(null);
	let navigate = useNavigate();
	const [cartDetail, setCartDetail] = useState([]);
	const [itemSelected, setItemSelected] = useState([]);
	const [totalPrice, setTotalPrice] = useState(0);

	const getCarts = async () => {
		const result = await CartService.getCart(id);
		console.log("res", result);

		setCartDetail(result.data);
	};

	useEffect(() => {
		getCarts();
		// eslint-disable-next-line
	}, [id]);

	const handleDeleteCart = async (idProduct) => {
		const res = await CartService.deleteCart({ idUser: id, idProduct: idProduct });
		if (res.status === "SUCCESS") {
			getCarts();
		}
	};

	const handleUpdateCart = async (updatedCartDetail) => {
		await CartService.updateCart({ idUser: id, product: updatedCartDetail });
	};

	const handleSetTotalPrice = (type, price, quantity) => {
		if (type === "remove") {
			setTotalPrice(totalPrice - price * quantity);
		} else {
			setTotalPrice(totalPrice + price * quantity);
		}
	};

	const handleChangeQuantity = (type, index) => {
		const updatedCartDetail = [...cartDetail];
		if (cartDetail[index].quantity === 1 && type === "remove") return;
		else if (cartDetail[index].quantity === cartDetail[index].totalQuantity && type === "add")
			return;
		else if (type === "remove") {
			updatedCartDetail[index] = {
				...updatedCartDetail[index],
				quantity: updatedCartDetail[index].quantity - 1,
			};
			setCartDetail(updatedCartDetail);
		} else if (type === "add") {
			updatedCartDetail[index] = {
				...updatedCartDetail[index],
				quantity: updatedCartDetail[index].quantity + 1,
			};
			setCartDetail(updatedCartDetail);
		}

		if (itemSelected.includes(index)) {
			handleSetTotalPrice(type, cartDetail[index].price, 1);
		}

		// Xóa bỏ timeout trước đó nếu có (người dùng thay đổi quá nhanh)
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Thiết lập timeout mới
		timeoutRef.current = setTimeout(() => {
			handleUpdateCart(updatedCartDetail);
		}, 1000); // 1s
	};

	const handleSelectItem = (e, index) => {
		if (e.target.checked) {
			setItemSelected([...itemSelected, index]);
			localStorage.setItem("cartSelected", [...itemSelected, index]);
			handleSetTotalPrice("add", cartDetail[index].price, cartDetail[index].quantity);
		} else {
			const tempArray = itemSelected.filter((item) => item !== index);
			setItemSelected(tempArray);
			localStorage.setItem("cartSelected", tempArray);

			handleSetTotalPrice("remove", cartDetail[index].price, cartDetail[index].quantity);
		}
	};

	const handlePurchase = () => {
		navigate(`/dat-hang`);
	};

	return (
		<div
			className={cx("inner-content")}
			style={{ width: "100%", display: "flex", justifyContent: "space-evenly" }}
		>
			<div style={{ width: "70%" }}>
				<p className="title">Giỏ hàng của bạn</p>
				{cartDetail?.map((cart, index) => {
					return (
						<div className={cx("cart", "row")} key={index}>
							<div style={{ display: "flex" }}>
								<div className="col-1">
									<input
										type="checkbox"
										style={{ transform: "scale(1.5)" }}
										onClick={(e) => handleSelectItem(e, index)}
										disabled={
											cart.blockExpireDate || cart.statePost === "closed"
										}
									/>
								</div>
								<img className="col-2" src={`${cart?.image}`} alt="anh-san-pham" />
								<div className={cx("detail", "col-5")}>
									<div
										onClick={() => navigate(`/seller/${cart.idSeller}`)}
										className={cx("seller")}
									>
										<StoreMallDirectoryIcon /> {cart?.sellerName}{" "}
										{cart.blockExpireDate && (
											<p style={{ color: "red" }}>
												Người bán đang bị tạm khóa
											</p>
										)}
									</div>
									<p
										className={cx("name")}
										onClick={() =>
											navigate(`/detail-product/${cart.idProduct}`)
										}
									>
										{cart?.name}
									</p>

									<p className={cx("price")}>
										{Intl.NumberFormat().format(cart?.price)}đ
									</p>
									{cart.statePost === "closed" && (
										<p style={{ color: "red" }}>Sản phẩm đã ngưng bán.</p>
									)}
									{cart?.statePost === "selled" && (
										<p style={{ color: "red" }}>Hết hàng</p>
									)}
								</div>
								<div className={cx("quantity", "col-3")}>
									<p>Số lượng: </p>
									<div>
										<RemoveIcon
											onClick={() =>
												handleChangeQuantity("remove", index, cart.price)
											}
										/>
										<p>{cart?.quantity}</p>
										<AddIcon
											onClick={() =>
												handleChangeQuantity("add", index, cart.price)
											}
										/>
									</div>
									<p>Tổng tiền: </p>
									<p className={cx("price")}>
										{Intl.NumberFormat().format(cart?.price * cart?.quantity)}đ
									</p>
								</div>
								<div className={cx("col-1", "action")}>
									<Button
										danger
										onClick={() => handleDeleteCart(cart.idProduct)}
										style={{ width: 109 }}
									>
										Xóa
									</Button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
			<div style={{ width: "27%" }}>
				<p className="title">Tạm tính</p>
				<div className={cx("summary")}>
					<p>Tổng sản phẩm đã chọn: {itemSelected.length}</p>
					<p>Tổng tiền: {Intl.NumberFormat().format(totalPrice)}đ</p>
					{itemSelected.length === 0 ? (
						<button className={cx("disabled")}>Tiến hành thanh toán</button>
					) : (
						<button onClick={handlePurchase}>Tiến hành thanh toán</button>
					)}
				</div>
			</div>
		</div>
	);
}

export default Cart;
