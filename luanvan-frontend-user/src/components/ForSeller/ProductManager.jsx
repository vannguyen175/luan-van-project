import { useEffect, useState } from "react";
import * as ProductService from "~/service/ProductService";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import CircularProgress from "@mui/material/CircularProgress";
import moment from "moment/moment";

import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import vi from "javascript-time-ago/locale/vi";
import TimeAgo from "javascript-time-ago";
import Description from "../../components/Description";

import classNames from "classnames/bind";
import style from "./ForSeller.module.scss";
import Modal from "~/components/Modal";

import { toast } from "react-toastify";
import { Link } from "react-router-dom";

TimeAgo.addLocale(vi);

const cx = classNames.bind(style);

function ProductManager() {
	const idUser = localStorage.getItem("id_user"); //idSeller
	const [products, setProducts] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpenModal, setIsOpenModal] = useState(false);
	const [detailProduct, setDetailProduct] = useState();
	const [activeTab, setActiveTab] = useState(0);

	const tabs = [
		{ label: "Đang chờ duyệt", value: "waiting" },
		{ label: "Đang bán", value: "approved" },
		{ label: "Bán hết", value: "selled" },
		{ label: "Bị từ chối", value: "reject" },
		{ label: "Ngưng bán", value: "closed" },
	];

	useEffect(() => {
		getProductsBySubCate(tabs[activeTab]?.value);
		setIsLoading(true);
	}, [activeTab]);

	const getProductsBySubCate = async (state) => {
		setIsLoading(true);
		const res = await ProductService.getAllProducts({
			data: { state: [state], cate: [], subCate: [], seller: idUser },
			page: `page=${1}`,
			limit: `limit=${20}`,
		});
		setProducts(res.data);
		setIsLoading(false);
	};

	useEffect(() => {
		getProductsBySubCate(tabs[activeTab]?.value);
	}, []);

	const closeProduct = async (idProduct) => {
		if (window.confirm("Bạn có chắc muốn ngưng bán sản phẩm này?")) {
			const res = await ProductService.updateProduct(idProduct, {
				data: {
					statePost: "closed",
				},
			});
			if (res.status === "SUCCESS") {
				toast.success(res.message);
				getProductsBySubCate();
				setIsOpenModal(false);
			} else {
				toast.error(res.message);
			}
		}
	};
	const openProduct = async (idProduct) => {
		if (window.confirm("Bạn có chắc muốn mở bán lại sản phẩm này?")) {
			const res = await ProductService.updateProduct(idProduct, {
				data: {
					statePost: "approved",
				},
			});
			if (res.status === "SUCCESS") {
				toast.success(res.message);
				getProductsBySubCate();
				setIsOpenModal(false);
			} else {
				toast.error(res.message);
			}
		}
	};

	const getDetailProduct = async (id) => {
		const res = await ProductService.detailProduct(id);
		setDetailProduct(res.data);
	};

	const handleOpenModal = (id) => {
		getDetailProduct(id);
		setIsOpenModal(true);
	};

	return (
		<div style={{ padding: "10px" }} className="inner-content">
			<p className="title">Quản lý sản phẩm</p>
			<div className={cx("action")}>
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
				</div>
				<div className={cx("search")}>
					<input type="text" placeholder="Nhập ID sản phẩm" />
					<button className="main-button">Tìm kiếm</button>
				</div>
			</div>
			<p style={{ margin: "20px" }}>Tổng sản phẩm: {products?.length}</p>
			<div className={cx("table")}>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell></TableCell>
								<TableCell
									className=""
									style={{
										width: "300px",
										maxWidth: "300px",
										overflow: "hidden",
										textOverflow: "ellipsis",
									}}
								>
									Tên SP
								</TableCell>
								<TableCell>Danh mục</TableCell>
								<TableCell>Giá tiền</TableCell>
								<TableCell>Số lượng</TableCell>
								<TableCell>Đã bán</TableCell>
								<TableCell>Thời điểm đăng bán</TableCell>
								<TableCell></TableCell>
							</TableRow>
						</TableHead>
						<TableBody className="animate__animated animate__fadeIn">
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={12} align="center">
										<CircularProgress />
									</TableCell>
								</TableRow>
							) : (
								<>
									{products[0]?.name ? (
										products.map((row) => (
											<TableRow
												key={row.name}
												sx={{
													"&:last-child td, &:last-child th": {
														border: 0,
													},
												}}
											>
												<TableCell component="th" scope="row">
													<img
														style={{ width: 50, height: 50 }}
														src={row.images[0]}
														alt="anh-SP"
													/>
												</TableCell>
												<TableCell component="th" scope="row">
													ID: {row._id}
													<p className={cx("product-name")}>{row.name}</p>
												</TableCell>
												<TableCell>
													{row.subCategory.category.name} -{" "}
													{row.subCategory.name}
												</TableCell>
												<TableCell align="left">
													{Intl.NumberFormat().format(row.price)}đ
												</TableCell>
												<TableCell>{row.quantity}</TableCell>
												<TableCell>
													{row.quantity - row.quantityState}
												</TableCell>
												<TableCell>
													{moment(row.createdAt).format("DD-MM-YYYY")}{" "}
													<br />
													{moment(row.createdAt).format("HH:mm")}
												</TableCell>
												<TableCell align="center" style={{ width: 150 }}>
													<button
														className={cx("button-detail-product")}
														onClick={() => handleOpenModal(row._id)}
													>
														Chi tiết
													</button>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableCell colSpan={12} align="center">
											Không có sản phẩm.
										</TableCell>
									)}
								</>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</div>

			<Modal isOpen={isOpenModal} title="" setIsOpen={setIsOpenModal} width={1000}>
				<div className={cx("modal")}>
					<div className={cx("info-section")}>
						<div style={{ display: "flex" }}>
							<p className={cx("title-section")}>THÔNG TIN SẢN PHẨM </p>
							<Link to={`/detail-product/${detailProduct?._id}`}>
								Đi đến trang bán sản phẩm
							</Link>
						</div>

						{detailProduct && (
							<div style={{ display: "flex" }}>
								<div style={{ width: "40%" }}>
									{detailProduct.images.map((image, index) => (
										<img
											key={index}
											style={{ width: 70, height: 70, margin: 5 }}
											src={image}
											alt="anh-SP"
										/>
									))}
								</div>

								<div style={{ width: "55%" }}>
									<Description
										title="ID sản phẩm"
										desc={detailProduct?._id}
										important
									/>
									<Description
										title="Ngày đăng bán"
										desc={moment(detailProduct.createdAt).format(
											"DD-MM-YYYY HH:mm"
										)}
										important
									/>
									<Description title="Tên SP" desc={detailProduct?.name} />
									<Description
										title="Giá"
										desc={`${Intl.NumberFormat().format(detailProduct.price)}đ`}
									/>
									<Description
										title="Số lượng ban đầu"
										desc={detailProduct.quantity}
									/>
									<Description
										title="Danh mục"
										desc={detailProduct.subCategory?.name}
									/>

									{detailProduct.statePost === "reject" ? (
										<p style={{ color: "red" }}>
											Lý do từ chối bài đăng: {detailProduct.rejectReason}
										</p>
									) : detailProduct.statePost === "closed" ? (
										<button
											className="main-button"
											style={{
												marginTop: 20,
											}}
											onClick={() => openProduct(detailProduct._id)}
										>
											Mở bán sản phẩm
										</button>
									) : (
										<button
											className="main-button"
											style={{
												marginTop: 20,
											}}
											onClick={() => closeProduct(detailProduct._id)}
										>
											Ngưng bán sản phẩm
										</button>
									)}
								</div>
							</div>
						)}
					</div>
					<div className={cx("info-section")}>
						<p className={cx("title-section")}>TRẠNG THÁI SẢN PHẨM</p>
						{detailProduct && (
							<div style={{ display: "flex", justifyContent: "space-evenly" }}>
								<div className={cx("analytic")}>
									<p>Số sản phẩm đã bán</p>
									<strong>
										{detailProduct.quantity - detailProduct.quantityState}
									</strong>
								</div>
								<div className={cx("analytic")}>
									<p>Số sản phẩm còn lại</p>
									<strong>{detailProduct.quantityState}</strong>
								</div>
								<div className={cx("analytic")}>
									<p>Doanh thu</p>
									<strong>
										{Intl.NumberFormat().format(
											(detailProduct.quantity - detailProduct.quantityState) *
												detailProduct.price
										)}
										đ
									</strong>
								</div>
							</div>
						)}
					</div>
				</div>
			</Modal>
		</div>
	);
}

export default ProductManager;
