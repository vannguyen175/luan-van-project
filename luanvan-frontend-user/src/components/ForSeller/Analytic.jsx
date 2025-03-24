import { Fragment, useEffect, useRef, useState } from "react";
import * as AnalyticService from "../../service/AnalyticService";
import moment from "moment";
import classNames from "classnames/bind";
import style from "./ForSeller.module.scss";
import { useApp } from "~/context/AppProvider";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import IconButton from "@mui/material/IconButton";

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const cx = classNames.bind(style);

const options = {
	type: "bar",
	responsive: true,
};

function Analytic() {
	const { user } = useApp();
	const idUser = localStorage.getItem("id_user");

	const weekValue = moment().format("YYYY-[W]WW");
	const firstDayOfWeek = moment(weekValue, "YYYY-[W]WW").startOf("isoWeek").toDate();
	const [typeDateChart, setTypeDateChart] = useState("week");
	const [typeDateTable, setTypeDateTable] = useState("all");
	const [typeDateTableRevenue, setTypeDateTableRevenue] = useState("all");
	const [isOnWeekOrder, setIsOnWeekOrder] = useState(true);

	const startWeekProductRef = useRef();
	const startDayRefProduct = useRef();
	const endDayRefProduct = useRef();

	const startDayRefOrder = useRef();
	const endDayRefOrder = useRef();

	const [message, setMessage] = useState({
		product: null,
		revenue: null,
	});

	const [resultProduct, setResultProduct] = useState({
		selled: "",
	});

	const [resultOrder, setResultOrder] = useState({
		revenue: {},
		stateOrders: {},
		totalRevenueChart: {},
	});

	const checkInputDay = (type, startDate, endDate) => {
		if (!startDate) {
			setMessage({ [type]: "Vui lòng nhập ngày bắt đầu" });
			return false;
		}
		if (!endDate) {
			setMessage({ [type]: "Vui lòng nhập ngày kết thúc" });
			return false;
		}
		const start = new Date(startDate);
		const end = new Date(endDate);
		const current = new Date();

		if (start > current) {
			setMessage({ [type]: "Ngày bắt đầu không được lớn hơn ngày hiện tại." });
			return false; // Không hợp lệ
		}
		if (end > current) {
			setMessage({ [type]: "Ngày kết thúc không được lớn hơn ngày hiện tại." });
			return false; // Không hợp lệ
		}
		if (start > end) {
			setMessage({ [type]: "Ngày bắt đầu không được lớn hơn ngày kết thúc." });
			return false; // Không hợp lệ
		}
		setMessage();
		return true; // Hợp lệ
	};

	const getAnalyticProduct = async (dataType, startDay, endDay) => {
		const res = await AnalyticService.analyticProducts({
			idUser: idUser,
			typeDate: dataType,
			typeUser: "seller",
			startDay: startDay,
			endDay: endDay,
		});
		setResultProduct((prev) => ({
			...prev,
			selled: res.selled,
			totalPosted: res.totalPosted,
			totalSelled: res.totalSelled,
			totalRejected: res.totalRejected,
		}));
	};

	const getAnalyticOrder = async (dataType, startDay) => {
		const res = await AnalyticService.analyticOrders({
			idSeller: idUser,
			typeDate: dataType,
			startDay: startDay,
		});
		setResultOrder((prev) => ({
			...prev,
			revenue: res.totalRevenue[0]?.totalRevenue,
			stateOrders: res.stateOrders,
			totalRevenueChart: res.totalRevenueChart,
		}));
	};

	const getAnalyticCategoryProduct = async (typeDate, startDay, endDay) => {
		if (typeDate === "day") {
			const checkInput = checkInputDay("product", startDay, endDay);
			if (checkInput) {
				const res = await AnalyticService.analyticCategory({
					idUser: idUser,
					typeDate: typeDate,
					startDay: startDay,
					endDay: endDay,
				});
				setResultProduct((prev) => ({
					...prev,
					resultCate: res.data,
					resultCateDetail: res.dataDetail,
				}));
			}
		} else {
			const res = await AnalyticService.analyticCategory({
				idUser: idUser,
				typeDate: typeDate,
			});
			setResultProduct((prev) => ({
				...prev,
				resultCate: res.data,
				resultCateDetail: res.dataDetail,
			}));
		}
	};

	const getAnalyticCategoryRevenue = async (typeDate, startDay, endDay) => {
		if (typeDate === "day") {
			const checkInput = checkInputDay("revenue", startDay, endDay);
			if (checkInput) {
				const res = await AnalyticService.analyticCategoryRevenue({
					idUser: idUser,
					typeDate: typeDate,
					startDay: startDay,
					endDay: endDay,
				});
				setResultOrder((prev) => ({
					...prev,
					resultCate: res.data,
					resultCateDetail: res.dataDetail,
				}));
			}
		} else {
			const res = await AnalyticService.analyticCategoryRevenue({
				idUser: idUser,
				typeDate: typeDate,
			});
			setResultOrder((prev) => ({
				...prev,
				resultCate: res.data,
				resultCateDetail: res.dataDetail,
			}));
		}
	};

	const handleChangeWeekOrder = (e) => {
		const weekValue = e.target.value;
		const weekChanged = moment(weekValue, "YYYY-[W]WW").startOf("isoWeek").toDate();
		getAnalyticOrder("week", weekChanged);
	};

	//thay đổi điều kiện tìm kiếm (typeDate) của Product
	const handleChangeDataType = (e, type) => {
		if (type === "product-chart") {
			setTypeDateChart(e.target.value);
			handleAnalytic("product", e.target.value);
		} else if (type === "product-table") {
			if (e.target.value === "day") {
				setResultProduct((prev) => ({
					...prev,
					resultCate: null,
					resultCateDetail: null,
				}));
				setTypeDateTable(e.target.value);
			} else {
				setResultProduct((prev) => ({
					...prev,
					resultCate: null,
					resultCateDetail: null,
				}));
				setTypeDateTable(e.target.value);
				handleAnalytic("category", e.target.value);
			}
		}
	};
	//thay đổi điều kiện tìm kiếm (typeDate) của Order
	const handleChangeDataTypeOrder = (e) => {
		if (e.target.value === "week") {
			setIsOnWeekOrder(true);
			getAnalyticOrder(e.target.value, firstDayOfWeek);
		} else if (e.target.value === "day") {
			setTypeDateTableRevenue("day");
			setResultOrder((prev) => ({
				...prev,
				resultCate: null,
				resultCateDetail: null,
			}));
		} else {
			setIsOnWeekOrder(false);
			getAnalyticOrder("month", firstDayOfWeek);
		}
	};

	let dataProduct = {
		labels: Object.keys(resultProduct?.selled),
		datasets: [
			{
				label: "Lượt bán",
				data: Object.values(resultProduct?.selled),
				backgroundColor: "#419366", //Vàng cam
				borderColor: "rgba(253, 188, 9, 1)",
				borderWidth: 1,
			},
		],
	};

	let dataRevenue = {
		labels: Object.keys(resultOrder?.totalRevenueChart || {}),
		datasets: [
			{
				label: "Doanh thu",
				data: Object.values(resultOrder?.totalRevenueChart || {}),
				backgroundColor: "rgba(253, 188, 9, 0.3)", //Vàng cam
				borderColor: "rgba(253, 188, 9, 1)",
				borderWidth: 1,
			},
		],
	};

	useEffect(() => {
		getAnalyticProduct("week", firstDayOfWeek);
		getAnalyticOrder("week", firstDayOfWeek);
		getAnalyticCategoryProduct("all");
		getAnalyticCategoryRevenue("all");
	}, []);

	const handleAnalytic = (type, typeDate) => {
		if (type === "product") {
			getAnalyticProduct(
				typeDate || typeDateChart,
				moment(startWeekProductRef.current?.value, "YYYY-[W]WW").startOf("isoWeek").toDate()
			);
		} else if (type === "category") {
			getAnalyticCategoryProduct(
				typeDate || typeDateTable,
				startDayRefProduct.current?.value,
				endDayRefProduct.current?.value
			);
		} else if (type === "category-revenue") {
			getAnalyticCategoryRevenue(
				"day",
				startDayRefOrder.current?.value,
				endDayRefOrder.current?.value
			);
		}
	};

	return (
		<div>
			<div className="inner-content" style={{ padding: 10 }}>
				{user?.name && (
					<div className={cx("account-info")}>
						<img src={user?.avatar || "assets/images/user-avatar.jpg"} alt="avatar" />
						<div style={{ width: "100%" }}>
							<p className={cx("name")}>{user.name}</p>
							<div className={cx("info")}>
								<div>
									<p>Vai trò</p>
									Nhà bán hàng
								</div>
								<div>
									<p>Số điện thoại</p>
									{user.phone}
								</div>
								<div>
									<p>Địa chỉ email</p>
									{user.email}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
			<div className={cx("inner-content", "product")}>
				<p className="title">Thống kê theo sản phẩm</p>
				<div>
					{
						<div style={{ display: "flex", justifyContent: "space-evenly" }}>
							<div className={cx("data-product")}>
								<p>Số sản phẩm đang bán</p>
								<strong>{resultProduct.totalPosted}</strong>
							</div>
							<div className={cx("data-product")}>
								<p>Số lượt bán thành công</p>
								<strong>{resultProduct.totalSelled}</strong>
							</div>
							<div className={cx("data-product")}>
								<p>Số sản phẩm đang chờ duyệt</p>
								<strong>{resultProduct.totalRejected}</strong>
							</div>
						</div>
					}
				</div>
				<div style={{ display: "flex" }}>
					<div className={cx("chart")}>
						<select
							name="typeDateChart"
							onChange={(e) => handleChangeDataType(e, "product-chart")}
						>
							<option value="week">Theo tuần</option>
							<option value="month">Theo tháng</option>
						</select>
						{typeDateChart === "week" ? (
							<input
								type="week"
								defaultValue={weekValue}
								ref={startWeekProductRef}
								className="week-input"
								onChange={(e) => handleAnalytic("product")}
							/>
						) : (
							<></>
						)}

						<div className={cx("show-chart")}>
							{resultProduct?.selled ? (
								<Bar data={dataProduct} options={options} />
							) : (
								<p>Vui lòng nhập thời gian thống kê.</p>
							)}
						</div>
					</div>
					<div className={cx("chart-table")}>
						<select
							name="typeDateTable"
							onChange={(e) => handleChangeDataType(e, "product-table")}
							style={{ display: "block" }}
						>
							<option value="all">Tất cả</option>
							<option value="day">Theo ngày</option>
						</select>
						<div className={cx("date-range-container")}>
							{typeDateTable === "day" && (
								<div>
									<div>
										<label htmlFor="start-date">Từ:</label>
										<input
											type="date"
											name="start-date"
											ref={startDayRefProduct}
										/>

										<label htmlFor="end-date">Đến:</label>
										<input type="date" name="end-date" ref={endDayRefProduct} />
										<IconButton
											color="primary"
											onClick={() => handleAnalytic("category", "day")}
										>
											<AutoGraphIcon />
										</IconButton>
									</div>
									{message?.product && (
										<p style={{ color: "red" }}>{message.product}</p>
									)}
								</div>
							)}
						</div>

						<div className={cx("table")}>
							<table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
								<thead>
									<tr>
										<th>Danh mục</th>
										<th>Danh mục phụ</th>
										<th>Lượt bán ra</th>
									</tr>
								</thead>
								<tbody>
									{Object.keys(resultProduct.resultCateDetail || {}).map(
										(key, index) => (
											<Fragment key={index}>
												{Object.keys(
													resultProduct.resultCateDetail[key] || {}
												).map((keySub, indexSub) => (
													<tr key={indexSub}>
														<td>{key}</td>
														<td>{keySub}</td>
														<td>
															{
																resultProduct.resultCateDetail[key][
																	keySub
																]
															}
														</td>
													</tr>
												))}
											</Fragment>
										)
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
			<div className={cx("inner-content", "product")}>
				<p className="title">Thống kê theo doanh thu</p>

				<div>
					{resultOrder.stateOrders && (
						<div
							style={{
								display: "flex",
								justifyContent: "space-evenly",
								textAlign: "center",
							}}
						>
							<div className={cx("data-order")}>
								<p>Tổng doanh thu</p>
								<strong
									style={{ fontSize: "1.6rem", color: "var(--orange-color)" }}
								>
									{Intl.NumberFormat().format(resultOrder.revenue || 0)}đ
								</strong>
							</div>
						</div>
					)}
				</div>

				{/* thống kê theo doanh thu */}
				<div style={{ display: "flex" }}>
					<div className={cx("chart")}>
						<select name="typeDate" onChange={handleChangeDataTypeOrder}>
							<option value="week">Theo tuần</option>
							<option value="month">Theo tháng</option>
						</select>
						{isOnWeekOrder && (
							<input
								type="week"
								onChange={handleChangeWeekOrder}
								defaultValue={weekValue}
							/>
						)}
						{Object.keys(resultOrder?.totalRevenueChart || {})[0] && (
							<Bar data={dataRevenue} options={options} />
						)}
					</div>
					<div className={cx("chart-table")}>
						<select
							name="typeDateTable"
							onChange={(e) => handleChangeDataTypeOrder(e, "product-table")}
							style={{ display: "block" }}
						>
							<option value="all">Tất cả</option>
							<option value="day">Theo ngày</option>
						</select>
						<div className={cx("date-range-container")}>
							{typeDateTableRevenue === "day" && (
								<div>
									<div>
										<label htmlFor="start-date">Từ:</label>
										<input
											type="date"
											name="start-date"
											ref={startDayRefOrder}
										/>

										<label htmlFor="end-date">Đến:</label>
										<input type="date" name="end-date" ref={endDayRefOrder} />
										<IconButton
											color="primary"
											onClick={() =>
												handleAnalytic("category-revenue", "day")
											}
										>
											<AutoGraphIcon />
										</IconButton>
									</div>
									{message?.revenue && (
										<p style={{ color: "red" }}>{message.revenue}</p>
									)}
								</div>
							)}
						</div>

						<div className={cx("table")}>
							<table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
								<thead>
									<tr>
										<th>Danh mục</th>
										<th>Danh mục phụ</th>
										<th>Doanh thu</th>
									</tr>
								</thead>
								<tbody>
									{Object.keys(resultOrder.resultCateDetail || {}).map(
										(key, index) => (
											<Fragment key={index}>
												{Object.keys(
													resultOrder.resultCateDetail[key] || {}
												).map((keySub, indexSub) => (
													<tr key={indexSub}>
														<td>{key}</td>
														<td>{keySub}</td>
														<td>
															{Intl.NumberFormat().format(
																resultOrder.resultCateDetail[key][
																	keySub
																]
															)}
															đ
														</td>
													</tr>
												))}
											</Fragment>
										)
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Analytic;
