import classNames from "classnames/bind";
import style from "./ForSeller.module.scss";
import { useEffect, useRef, useState } from "react";
import * as OrderService from "../../service/OrderService";
import { useApp } from "~/context/AppProvider";
import moment from "moment";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "~/components/Modal";
import Description from "~/components/Description";
import Button from "../Button";
import { toast } from "react-toastify";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { exportExcel } from "../../utils";
import Pagination from "../../components/Pagination";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import EventNoteIcon from "@mui/icons-material/EventNote";
import RefreshIcon from "@mui/icons-material/Refresh";

const cx = classNames.bind(style);

function OrderManager() {
	const { user, token } = useApp();
	const searchRef = useRef();

	const [activeTab, setActiveTab] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [modalDetail, setModalDetail] = useState(false);
	const [orders, setOrders] = useState([]);
	const [orderSelected, setOrderSelected] = useState();

	const [pageState, setPageState] = useState({
		page: 1,
		pageSize: 10,
		totalCount: 0,
	});

	//Phân trang
	useEffect(() => {
		getOrders();
	}, [pageState.page, user]);

	const tabs = [
		{ label: "Đang xử lý" },
		{ label: "Đang vận chuyển" },
		{ label: "Đang giao hàng" },
		{ label: "Đã giao hàng" },
		{ label: "Bị hủy" },
	];

	const getOrders = async () => {
		if (user.id) {
			const res = await OrderService.getAllOrders({
				data: { seller: user.id, status: activeTab, token: token },
				page: `page=${pageState.page}`,
				limit: `limit=${pageState.pageSize}`,
			});
			if (pageState.totalCount !== res.totalCount) {
				setPageState((prevData) => ({ ...prevData, totalCount: res.totalCount }));
			}
			setOrders(res.data);
			setIsLoading(false);
		}
	};

	//tìm kiếm order theo: id seller, tên SP, người mua, trạng thái
	const searchOrder = async () => {
		if (user.id) {
			const res = await OrderService.searchOrders({
				data: {
					idSeller: user.id,
					query: searchRef.current.value,
					status: activeTab,
				},
			});
			setOrders(res.data);
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getOrders();
		setIsLoading(true);
	}, [activeTab]);

	const handleShowDetail = (row) => {
		setModalDetail(true);
		setOrderSelected(row);
	};

	const handleUpdateOrder = async (idOrder, data) => {
		if (window.confirm("Bạn có chắc muốn vận chuyển đơn hàng?")) {
			const res = await OrderService.updateOrder(idOrder, data);

			if (res.status === "SUCCESS") {
				toast.success(res.message);
				setTimeout(() => {
					getOrders();
					setModalDetail(false);
				}, 2000);
			} else {
				toast.error(res.message);
			}
		}
	};

	const handleClickExport = () => {
		if (orders) {
			const dataExport = orders?.map((item) => ({
				nameProduct: item.idProduct?.name,
				productPrice: item.productPrice || 0,
				shippingPrice: item.idOrder?.shippingDetail?.shippingPrice || 0,
				quantity: item.quantity || 1,
				paymentMethod: item.idOrder.paymentMethod || "Unknown",
				buyerName: item.idOrder.idBuyer?.name || "Unknown Buyer",
				email: item.idOrder?.shippingDetail?.email || "No Email",
				phone: item.idOrder?.shippingDetail?.phone || "No Phone",
				address: item.idOrder?.shippingDetail?.address || "No Address",
				isPaid: item.isPaid ?? false,
				status: item.status || "Unknown",
			}));

			exportExcel(dataExport, "Danh sách đơn hàng", "OrdersList");
		}
	};

	return (
		<div>
			<div className={cx("inner-content")}>
				<div className={cx("title")}>Quản lý đơn hàng</div>
				<div className={cx("tab-order")}>
					{tabs.map((item, index) => (
						<button
							key={index}
							onClick={() => setActiveTab(index)}
							className={cx(activeTab === index && "active-tab")}
						>
							{item.label}
						</button>
					))}
					<IconButton color="primary">
						<RefreshIcon />
					</IconButton>
				</div>
				<div className={cx("search-order")}>
					<input
						type="text"
						placeholder="Nhập ID đơn hàng, tên sản phẩm..."
						ref={searchRef}
					/>
					<button onClick={searchOrder}>Tìm kiếm</button>
					<button onClick={handleClickExport}>Xuất file excel</button>
				</div>
				<p style={{ margin: "20px 0 0 20px" }}>Tổng đơn hàng: {orders?.length}</p>
				<div className={cx("table-order")}>
					<TableContainer>
						<Table sx={{ minWidth: 650 }} aria-label="simple table">
							<TableHead>
								<TableRow>
									<TableCell></TableCell>
									<TableCell>Tên SP</TableCell>
									<TableCell>Giá tiền</TableCell>
									<TableCell>Số lượng</TableCell>
									<TableCell>Thanh toán</TableCell>
									<TableCell>Ngày mua</TableCell>
									<TableCell>Ngày giao</TableCell>
									<TableCell></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={12} align="center">
											<CircularProgress />
										</TableCell>
									</TableRow>
								) : (
									<>
										{orders[0]?.idOrder ? (
											orders.map((row) => (
												<TableRow
													key={row._id}
													sx={{
														"&:last-child td, &:last-child th": {
															border: 0,
														},
													}}
													className="animate__animated animate__fadeIn"
												>
													<TableCell>
														<img
															style={{ width: 50, height: 50 }}
															src={row.idProduct.images[0]}
															alt="anh-SP"
														/>
													</TableCell>
													<TableCell>
														<div>
															{row._id}
															<Tooltip title={row.idProduct?.name}>
																<p className={cx("product-name")}>
																	{row.idProduct?.name}
																</p>
															</Tooltip>
														</div>
													</TableCell>

													<TableCell>
														<p
															style={{
																color: "var(--orange-color)",
															}}
														>
															{Intl.NumberFormat().format(
																row.productPrice * row.quantity +
																	row.shippingPrice
															)}
															đ
														</p>
													</TableCell>
													<TableCell>{row.quantity}</TableCell>
													<TableCell>
														<p>
															{row.idOrder?.paymentMethod === "cash"
																? "Tiền mặt"
																: "Thanh toán online"}
														</p>
													</TableCell>
													<TableCell>
														{moment(row.createdAt).format("DD-MM-YYYY")}
														<br />
														{moment(row.createdAt).format("HH:mm:ss")}
													</TableCell>
													<TableCell>
														{row.status === "Đã giao" && (
															<>
																{moment(row.updatedAt).format(
																	"DD-MM-YYYY"
																)}
																<br />
																{moment(row.updatedAt).format(
																	"HH:mm:ss"
																)}
															</>
														)}
													</TableCell>

													<TableCell>
														<button
															className={cx("button-show-order")}
															onClick={() => handleShowDetail(row)}
														>
															Xem chi tiết
														</button>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell colSpan={12} align="center">
													Không có đơn hàng.
												</TableCell>
											</TableRow>
										)}
									</>
								)}
							</TableBody>
						</Table>
					</TableContainer>
					<Pagination pageState={pageState} setPageState={setPageState} />
				</div>

				<Modal isOpen={modalDetail} title="" setIsOpen={setModalDetail} width={1000}>
					{orderSelected?.idProduct && (
						<div className={cx("modal")}>
							<div className={cx("info-section")}>
								<div className={cx("title-section")}>
									<EventRepeatIcon />
									TRẠNG THÁI ĐƠN HÀNG: {orderSelected.status}
								</div>
								<p>
									{orderSelected.status === "Đang xử lý"
										? "Đang chờ Người bán xác nhận đơn hàng, chuẩn bị đơn và bàn giao cho đơn vị vận chuyển."
										: ""}
								</p>
							</div>
							<div style={{ display: "flex" }}>
								<div
									className={cx("info-section")}
									style={{ width: "48%", height: "350px" }}
								>
									<div className={cx("title-section")}>
										<AssignmentIndIcon />
										THÔNG TIN KHÁCH HÀNG:
									</div>
									<div>
										<Description
											title="Tên"
											desc={orderSelected.idOrder.idBuyer?.name}
										/>
										<Description
											title="Email"
											desc={orderSelected.idOrder.shippingDetail?.email}
										/>
										<Description
											title="Số điện thoại"
											desc={orderSelected.idOrder.shippingDetail?.phone}
										/>
										<Description
											title="Địa chỉ"
											desc={orderSelected.idOrder.shippingDetail?.address}
										/>
									</div>
								</div>

								<div
									className={cx("info-section")}
									style={{ width: "48%", height: "350px" }}
								>
									<div className={cx("title-section")}>
										<Inventory2Icon />
										THÔNG TIN SẢN PHẨM:
									</div>
									<div>
										{orderSelected.idProduct.images.map((image, index) => (
											<img
												key={index}
												style={{ width: 70, height: 70, margin: 5 }}
												src={image}
												alt="anh-SP"
											/>
										))}

										<Description
											title="ID sản phẩm"
											desc={orderSelected.idProduct?._id}
											important
										/>
										<Description
											title="Tên SP"
											desc={orderSelected.idProduct?.name}
										/>
										<Description
											title="Giá"
											desc={`${Intl.NumberFormat().format(
												orderSelected.productPrice
											)}đ`}
										/>
										<Description
											title="Danh mục"
											desc={orderSelected.idProduct.subCategory?.name}
										/>
									</div>
								</div>
							</div>

							<div className={cx("info-section")}>
								<div className={cx("title-section")}>
									<EventNoteIcon />
									THÔNG TIN ĐƠN HÀNG:
								</div>
								<div style={{ display: "flex", justifyContent: "space-between" }}>
									<div style={{ width: "53%" }}>
										<Description
											title="ID đơn hàng"
											desc={orderSelected._id}
											important
										/>
										<Description
											title="Giá sản phẩm (SL:1)"
											desc={`${Intl.NumberFormat().format(
												orderSelected.productPrice
											)}đ`}
										/>
										<Description
											title="Số lượng"
											desc={orderSelected.quantity}
										/>

										<Description
											title="Địa chỉ giao hàng"
											desc={orderSelected.idOrder.shippingDetail?.address}
										/>
									</div>
									<div style={{ width: "43%" }}>
										<Description
											title="Phí vận chuyển"
											desc={`${Intl.NumberFormat().format(
												orderSelected.shippingPrice
											)}đ`}
										/>
										<Description
											title="Hình thức thanh toán"
											desc={
												orderSelected.paymentMethod === "cash"
													? "Thanh toán khi nhận hàng"
													: "Thanh toán online"
											}
										/>
										<Description
											title="Tổng tiền"
											desc={`${Intl.NumberFormat().format(
												orderSelected.shippingPrice +
													orderSelected.productPrice
											)}đ`}
											important
										/>
									</div>
								</div>
								<div style={{ textAlign: "center", paddingTop: 30 }}>
									<Button onClick={() => setModalDetail(false)}>Thoát</Button>
									{orderSelected.status === "Đang xử lý" && (
										<Button
											primary
											onClick={() =>
												handleUpdateOrder(orderSelected._id, {
													status: "1",
												})
											}
										>
											Vận chuyển hàng
										</Button>
									)}
								</div>
							</div>
						</div>
					)}
				</Modal>
			</div>
		</div>
	);
}

export default OrderManager;
