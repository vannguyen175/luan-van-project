import { useEffect, useState } from "react";
import * as OrderService from "~/service/OrderService";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import emailjs from "@emailjs/browser";
import { useApp } from "~/context/AppProvider";

function PaymentResult() {
	const { user } = useApp();
	const navigate = useNavigate();
	const dataOrder = JSON.parse(localStorage.getItem("dataOrder") || "{}");
	const [isLoading, setIsLoading] = useState(true);
	const [result, setResult] = useState(JSON.parse(localStorage.getItem("result-payment")) || "");
	const [amountPaid, setAmountPaid] = useState(localStorage.getItem("amount-paid") || "");

	const createOrder = async () => {
		const allProducts = Object.values(dataOrder.products)
			.map((seller) => seller.products) // Lấy mảng sản phẩm của mỗi người bán
			.flat(); // Kết hợp tất cả các mảng sản phẩm thành một mảng duy nhất
		console.log("allProducts", allProducts);

		console.log("result", result === "");

		if (result === "") {
			const res = await OrderService.createOrder({ ...dataOrder, products: allProducts });
			console.log("res", res);
			localStorage.removeItem("dataOrder");
			if (res.status === "SUCCESS") {
				setIsLoading(false);
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
			}
			setResult(res);
			localStorage.setItem("result-payment", JSON.stringify(res));
			localStorage.setItem("amount-paid", dataOrder.totalPaid);
			setAmountPaid(dataOrder.totalPaid);
		} else {
			localStorage.removeItem("dataOrder");
		}
		setIsLoading(false);
	};

	const sendEmail = (value) => {
		console.log(user);

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
				value.totalAmount + dataOrder.products?.length * 15000
			),
			buyerName: user?.name,
			address: {
				province: user.province,
				district: user.district,
				ward: user.ward,
				address: user.address,
			},
			paymentMethod: "Thanh toán qua VNPay",
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

	useEffect(() => {
		if (user.id) {
			createOrder();
		}
	}, [user]);

	const handleBack = () => {
		localStorage.removeItem("result-payment");
		localStorage.removeItem("amount-paid");
		navigate("/");
	};

	return (
		<>
			{isLoading ? (
				<Backdrop
					sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
					open={isLoading}
				>
					<CircularProgress color="inherit" />
				</Backdrop>
			) : (
				<div
					className="inner-content"
					style={{
						textAlign: "center",
						width: "50%",
						margin: "100px auto",
						padding: "30px 0px",
					}}
				>
					{result?.status === "success" ? (
						<CheckCircleIcon
							style={{ color: "green", transform: "scale(3.5)", marginTop: 50 }}
						/>
					) : (
						<ErrorIcon
							style={{ color: "green", transform: "scale(3.5)", marginTop: 50 }}
						/>
					)}
					<h3 style={{ marginTop: 40 }}>{result.message}</h3>

					{result?.status === "SUCCESS" && (
						<>
							<p>Nhà bán hàng sẽ chuẩn bị hàng và sớm giao đến cho bạn.</p>
							<div
								style={{
									boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
									width: "60%",
									margin: "30px auto",
									padding: 20,
									borderRadius: 10,
								}}
							>
								<h5>Tổng tiền đã thanh toán:</h5>
								<h4>{Intl.NumberFormat().format(amountPaid)}đ</h4>
							</div>
						</>
					)}
					<Button onClick={handleBack} primary>
						Quay về trang chủ
					</Button>
				</div>
			)}
		</>
	);
}

export default PaymentResult;
