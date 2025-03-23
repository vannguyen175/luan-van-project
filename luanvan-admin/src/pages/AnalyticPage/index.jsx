import { Fragment, useEffect, useRef, useState } from "react";
import * as AnalyticService from "../../service/AnalyticService";
import moment from "moment";
import classNames from "classnames/bind";
import style from "./Analytic.module.scss";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import IconButton from "@mui/material/IconButton";

import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, BarElement, Title, Tooltip, Legend } from "chart.js";

import { Bar } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const cx = classNames.bind(style);

const options = {
	type: "bar",
	responsive: true,
};

function Analytic() {
	const weekValue = moment().format("YYYY-[W]WW");
	const firstDayOfWeek = moment(weekValue, "YYYY-[W]WW").startOf("isoWeek").toDate();
	const [isOnWeek, setIsOnWeek] = useState(true);
	const [isOnWeekOrder, setIsOnWeekOrder] = useState(true);

	const startDayRef = useRef();
	const endDayRef = useRef();

	const [resultProduct, setResultProduct] = useState({
		onSell: "",
		selled: "",
	});

	const [resultOrder, setResultOrder] = useState({
		revenue: {},
		stateOrders: {},
		totalRevenueChart: {},
	});

	const [resultCateDetail, setResultCateDetail] = useState();
	const [resultCate, setResultCate] = useState();
	const [typeDateCate, setTypeDateCate] = useState("all");
	const [message, setMessage] = useState();

	const checkInputDay = (startDate, endDate) => {
		if (!startDate) {
			setMessage("Vui lòng nhập ngày bắt đầu");
			return false;
		}
		if (!endDate) {
			setMessage("Vui lòng nhập ngày kết thúc");
			return false;
		}
		const start = new Date(startDate);
		const end = new Date(endDate);
		const current = new Date();

		if (start > current) {
			setMessage("Ngày bắt đầu không được lớn hơn ngày hiện tại.");
			return false; // Không hợp lệ
		}
		if (end > current) {
			setMessage("Ngày kết thúc không được lớn hơn ngày hiện tại.");
			return false; // Không hợp lệ
		}
		if (start > end) {
			setMessage("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
			return false; // Không hợp lệ
		}
		setMessage();
		return true; // Hợp lệ
	};

	const getAnalyticProduct = async (dataType, startDay) => {
		const res = await AnalyticService.analyticProducts({
			typeDate: dataType,
			typeUser: "seller",
			startDay: startDay,
		});
		setResultProduct({
			selled: res.selled,
			totalPosted: res.totalPosted,
			totalSelled: res.totalSelled,
			totalRejected: res.totalRejected,
		});
	};

	const getAnalyticOrder = async (dataType, startDay) => {
		const res = await AnalyticService.analyticOrders({
			typeDate: dataType,
			startDay: startDay,
		});

		setResultOrder({
			revenue: res.totalRevenue[0].totalRevenue,
			stateOrders: res.stateOrders,
			totalRevenueChart: res.totalRevenueChart,
		});
	};
	const getAnalyticCategory = async (typeDate, startDay, endDay) => {
		console.log("typeDate", typeDate);

		if (typeDate === "day") {
			const checkDate = checkInputDay(startDay, endDay);
			if (checkDate) {
				const res = await AnalyticService.analyticCategory({
					typeDate: typeDate,
					startDay: startDay,
					endDay: endDay,
				});
				setResultCate(res.data);
				setResultCateDetail(res.dataDetail);
			}
		} else {
			const res = await AnalyticService.analyticCategory({ typeDate: "all" });
			setResultCate(res.data);
			setResultCateDetail(res.dataDetail);
		}
	};

	const handleChangeWeekProduct = (e) => {
		const weekValue = e.target.value;
		const weekChanged = moment(weekValue, "YYYY-[W]WW").startOf("isoWeek").toDate();
		getAnalyticProduct("week", weekChanged);
	};
	const handleChangeWeekOrder = (e) => {
		const weekValue = e.target.value;
		const weekChanged = moment(weekValue, "YYYY-[W]WW").startOf("isoWeek").toDate();
		getAnalyticOrder("week", weekChanged);
	};

	const handleChangeDataType = (e) => {
		if (e.target.value === "week") {
			setIsOnWeek(true);
			getAnalyticProduct(e.target.value, firstDayOfWeek);
		} else {
			setIsOnWeek(false);
			getAnalyticProduct(e.target.value, firstDayOfWeek);
		}
	};

	const handleChangeDataTypeOrder = (e) => {
		if (e.target.value === "week") {
			setIsOnWeekOrder(true);
			getAnalyticOrder(e.target.value, firstDayOfWeek);
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
				backgroundColor: "rgba(253, 188, 9, 0.3)", //Vàng cam
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

	const dataCategory = {
		labels: Object.keys(resultCate || {}), // Tên danh mục
		datasets: [
			{
				label: "Doanh thu",
				data: Object.values(resultCate || {}).map((item) => item.revenue), // Số lượng sản phẩm theo danh mục
				backgroundColor: [
					"rgba(255, 99, 132, 0.2)",
					"rgba(54, 162, 235, 0.2)",
					"rgba(255, 206, 86, 0.2)",
					"rgba(75, 192, 192, 0.2)",
					"rgba(153, 102, 255, 0.2)",
					"rgba(255, 159, 64, 0.2)",
				],
				borderColor: [
					"rgba(255, 99, 132, 1)",
					"rgba(54, 162, 235, 1)",
					"rgba(255, 206, 86, 1)",
					"rgba(75, 192, 192, 1)",
					"rgba(153, 102, 255, 1)",
					"rgba(255, 159, 64, 1)",
				],
				borderWidth: 1,
			},
		],
	};

	useEffect(() => {
		getAnalyticProduct("week", firstDayOfWeek);
		getAnalyticOrder("week", firstDayOfWeek);
		getAnalyticCategory("all");
	}, []);

	const handleChangeDateCate = (e) => {
		if (e.target.value === "all") {
			getAnalyticCategory("all");
		} else {
			setResultCate(null);
			setResultCateDetail(null);
		}
		setTypeDateCate(e.target.value);
	};

	const handleGetAnalyticCate = async () => {
		console.log("startDayRef.current?.value, endDayRef.current?.valu", startDayRef.current?.value, endDayRef.current?.value);

		getAnalyticCategory(typeDateCate, startDayRef.current?.value, endDayRef.current?.value);
	};

	return (
		<>
			<div className={cx("inner-content", "product")}>
				<p className="title">Thống kê theo sản phẩm</p>
				<div>
					{resultProduct.totalPosted && (
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
								<p>Số đơn hàng bị hủy</p>
								<strong>{resultProduct.totalRejected}</strong>
							</div>
						</div>
					)}
				</div>
				<div className={cx("chart")}>
					<select name="typeDate" onChange={handleChangeDataType}>
						<option value="week">Theo tuần</option>
						<option value="month">Theo tháng</option>
					</select>
					{isOnWeek && <input type="week" onChange={handleChangeWeekProduct} defaultValue={weekValue} />}
					<Bar data={dataProduct} options={options} />
				</div>
			</div>
			<div className={cx("inner-content", "order")}>
				<p className="title">Thống kê theo doanh thu</p>

				<div>
					{resultOrder.stateOrders && (
						<div style={{ display: "flex", justifyContent: "space-evenly" }}>
							<div className={cx("data-order")}>
								<p>Tổng doanh thu</p>
								<strong>{Intl.NumberFormat().format(resultOrder.revenue)}đ</strong>
							</div>
						</div>
					)}
				</div>
				<div className={cx("chart")}>
					<select name="typeDate" onChange={handleChangeDataTypeOrder}>
						<option value="week">Theo tuần</option>
						<option value="month">Theo tháng</option>
					</select>
					{isOnWeekOrder && <input type="week" onChange={handleChangeWeekOrder} defaultValue={weekValue} />}
					{Object.keys(resultOrder?.totalRevenueChart || {})[0] && <Bar data={dataRevenue} options={options} />}
				</div>
			</div>
			<div className={cx("inner-content", "category")}>
				<p className="title">Thống kê theo danh mục</p>
				<div className={cx("select-date-category")}>
					<select name="RevenueTable" onChange={handleChangeDateCate} style={{ padding: "5px 10px" }}>
						<option value="all">Tất cả</option>
						<option value="day">Theo ngày</option>
					</select>
					{typeDateCate === "day" && (
						<div>
							<div className={cx("input-day")}>
								<label htmlFor="start-date">Từ:</label>
								<input type="date" name="start-date" ref={startDayRef} />

								<label htmlFor="end-date">Đến:</label>
								<input type="date" name="end-date" ref={endDayRef} />
								<IconButton color="primary" onClick={handleGetAnalyticCate}>
									<AutoGraphIcon />
								</IconButton>
							</div>
							{message && <p style={{ color: "red" }}>{message}</p>}
						</div>
					)}
				</div>
				<div style={{ display: "flex", justifyContent: "space-evenly", border: "1px solid white" }}>
					<div className={cx("chart")}>{Object.keys(resultCate || {})[0] && <Pie data={dataCategory} />}</div>
					<div className={cx("table")}>
						<table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
							<thead>
								<tr>
									<th>Danh mục</th>
									<th>Danh mục phụ</th>
									<th>Lượt bán</th>
									<th>Doanh thu</th>
								</tr>
							</thead>
							<tbody>
								{Object.keys(resultCateDetail || {}).map((categoryName, categoryIndex) => (
									<Fragment key={categoryIndex}>
										{Object.keys(resultCateDetail[categoryName].count || {}).map((subCategoryName, subCategoryIndex) => {
											const count = resultCateDetail[categoryName].count[subCategoryName] || 0;
											const revenue = resultCateDetail[categoryName].revenue[subCategoryName] || 0;

											return (
												<tr key={`${categoryIndex}-${subCategoryIndex}`}>
													<td>{categoryName}</td> {/* Danh mục chính */}
													<td>{subCategoryName}</td> {/* Danh mục con */}
													<td>{count}</td> {/* Số lượng */}
													<td>{revenue.toLocaleString()} VND</td> {/* Doanh thu */}
												</tr>
											);
										})}
									</Fragment>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</>
	);
}

export default Analytic;
