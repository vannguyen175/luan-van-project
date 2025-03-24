import { useRef } from "react";
import * as PaymentService from "~/service/PaymentService";

function Payment() {
	const amountRef = useRef();
	const bankCodeRef = useRef();
	const languageRef = useRef();
	const handleSubmit = async (event) => {
		event.preventDefault();
		const res = await PaymentService.createPayment({
			amount: amountRef.current.value,
			bankCode: bankCodeRef.current.value,
			language: languageRef.current.value,
		});
		//	console.log(res.redirect);
		window.location.href = res.redirect;
	};
	return (
		<div className="inner-content">
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="amount">Số tiền:</label>
					<input type="number" name="amount" ref={amountRef} placeholder="Số tiền" />
				</div>

				<div>
					<label htmlFor="bankCode">Chọn phượng thức thanh toán:</label>
					<select name="bankCode" ref={bankCodeRef} id="bankCode">
						<option value="">Cổng thanh toán VNPAYQR</option>
						<option value="VNPAYQR">Thanh toán qua ứng dụng hỗ trợ VNPAYQR</option>
						<option value="VNBANK">
							Thanh toán qua ATM-Tài khoản ngân hàng nội địa
						</option>
						<option value="INTCARD">Thanh toán qua thẻ quốc tế</option>
					</select>
				</div>
				<div>
					<label htmlFor="language">Ngôn ngữ:</label>
					<select name="language" ref={languageRef} id="language">
						<option value="vn">Tiếng Việt</option>
						<option value="en">Tiếng Anh</option>
					</select>
				</div>
				<div>
					<button type="submit">Tạo mới thanh toán</button>
				</div>
			</form>
		</div>
	);
}

export default Payment;
