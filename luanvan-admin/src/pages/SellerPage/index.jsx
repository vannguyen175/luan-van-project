import * as userService from "../../service/UserService";
import { DataGrid } from "@mui/x-data-grid";
import { viVN } from "@mui/x-data-grid/locales";
import CircularProgress from "@mui/material/CircularProgress";
import BlockIcon from "@mui/icons-material/Block";

import classNames from "classnames/bind";
import style from "./SellerPage.module.scss";

import { useEffect, useRef, useState } from "react";
import ModalForm from "../../components/Modal";
import Description from "../../components/Description";
import ReactTimeAgo from "react-time-ago";
import moment from "moment";
import { Link } from "react-router-dom";

const cx = classNames.bind(style);

// const blockExpire = {
// 	0: "A week",
// 	1: "A month",
// 	2: "Three months",
// 	3: "Forever",
// };
// const blockReason = {
// 	0: "Vi phạm chính sách bán hàng",
// 	1: "Vi phạm chính sách mua hàng",
// 	2: "Khác",
// };

function SellerPage() {
	const blockExpireRef = useRef();
	const blockReasonRef = useRef();
	const token = localStorage.getItem("access_token");
	const [isLoading, setIsLoading] = useState(false);
	const [sellerData, setSellerData] = useState();
	const [detailSeller, setDetailSeller] = useState();
	const [isOpenModal, setIsOpenModal] = useState(false);
	const [onBlock, setOnBlock] = useState(false);
	const [pageState, setPageState] = useState({
		page: 1,
		pageSize: 10,
		totalCount: 0,
	});

	const columns = [
		{
			field: "image",
			sortable: false,
			headerName: "",
			renderCell: (params) => (
				<>
					<img src={params.row.idUser.avatar} alt="avatar" style={{ width: 50, height: 50 }} />
				</>
			),
		},
		{
			field: "sellerName",
			headerName: "Tên người bán",
			flex: 1,
			renderCell: (params) => {
				return <p style={{ color: params.row?.idUser.blockExpireDate ? "red" : "black" }}>{params.row?.idUser.name}</p>;
			},
		},
		{
			field: "email",
			headerName: "Email",
			width: 200,
			valueGetter: (value, row) => row.idUser?.email || "",
		},

		{
			field: "totalProduct",
			headerName: "Tổng SP",
			width: 90,
			type: "number",
			renderCell: (params) => params.totalProduct,
		},
		{
			field: "totalSold",
			headerName: "Lượt bán",
			width: 90,
			type: "number",
			renderCell: (params) => params.totalSold,
		},

		{
			field: "totalRevenue",
			headerName: "Tổng doanh thu",
			flex: 1,
			type: "number",
			renderCell: (params) => `${Intl.NumberFormat().format(params.row.revenue)}đ`,
		},
		{
			field: "rating",
			headerName: "Đánh giá",
			width: 120,
			type: "number",
			renderCell: (params) => params.row.averageRating || 0,
		},

		{
			field: "Chi tiết",
			sortable: false,
			width: 120,
			renderCell: (params) => {
				return (
					<Link className={cx("show-detail-btn")} to={`/seller-detail/${params.row.idUser._id}`}>
						Chi tiết
					</Link>
				);
			},
		},
		{
			field: "Chặn",
			sortable: false,
			width: 70,
			renderCell: (params) => {
				return (
					<p style={{ color: params.row?.idUser.blockExpireDate ? "red" : "rgb(210, 210, 210)" }}>
						<BlockIcon />
					</p>
				);
			},
		},
	];

	const getSellerData = async () => {
		setIsLoading(true);
		const res = await userService.getAllSellers(token, {
			page: `page=${pageState.page}`,
			limit: `limit=${pageState.pageSize}`,
		});
		if (pageState.totalCount !== res.totalCount) {
			setPageState((prevData) => ({ ...prevData, totalCount: res.totalCount }));
		}
		setSellerData(res.data);
		setIsLoading(false);
	};

	useEffect(() => {
		getSellerData();
	}, []);

	const handleChange = (e) => {
		setPageState((prev) => ({ ...prev, page: e.page + 1 }));
		getSellerData();
	};

	const handleShowDetail = async (idseller) => {
		setIsLoading(true);
		setIsOpenModal(true);
		const res = await userService.getDetailSeller(idseller);
		setDetailSeller(res.data);
		setIsLoading(false);
	};

	const handleBlockUser = async () => {
		if (window.confirm("Bạn có chắc muốn chặn người dùng này?")) {
			const res = await userService.blockUser(token, detailSeller.sellers.idUser._id, {
				dateExpire: blockExpireRef.current.value,
				blockReason: blockReasonRef.current.value,
			});
			if (res.status === "SUCCESS") {
				setIsOpenModal(false);
				setOnBlock(false);
				getSellerData();
			}
		}
	};

	const handleNonBlockUser = async () => {
		if (window.confirm("Bạn có chắc muốn bỏ chặn người dùng này?")) {
			const res = await userService.blockUser(token, detailSeller.sellers.idUser._id, {});
			if (res.status === "SUCCESS") {
				setIsOpenModal(false);
				setOnBlock(false);
				getSellerData();
			}
		}
	};

	return (
		<div className="inner-content">
			<p className="title">Quản lý nhà bán hàng</p>
			<br />
			{sellerData ? (
				<DataGrid
					autoHeight
					disableRowSelectionOnClick
					rows={sellerData}
					getRowId={(data) => data._id}
					columns={columns}
					loading={isLoading}
					pagination
					paginationMode="server"
					rowCount={pageState.totalCount} // Tổng số hàng (nếu phân trang phía server)
					paginationModel={{ page: pageState.page - 1, pageSize: pageState.pageSize }}
					onPaginationModelChange={handleChange}
					onPageChange={(newPage) => {
						setPageState((prev) => ({ ...prev, page: newPage }));
					}}
					onPageSizeChange={(newPageSize) => {
						setPageState((prev) => ({ ...prev, pageSize: newPageSize }));
					}}
					localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
				/>
			) : (
				<div style={{ textAlign: "center" }}>
					<CircularProgress />
				</div>
			)}
			<ModalForm title="Thông tin nhà bán hàng" isOpen={isOpenModal} setIsOpen={setIsOpenModal} width={800}>
				{isLoading ? (
					<div style={{ textAlign: "center" }}>
						<CircularProgress />
					</div>
				) : (
					<div style={{ display: "flex" }}>
						<div className={cx("info-account")}>
							<div className={cx("name-avatar")}>
								<img src={detailSeller?.sellers.idUser.avatar} alt="avatar" />
								<p>{detailSeller?.sellers.idUser.name}</p>
							</div>
							<div className={cx("info")}>
								<Description title="Email" desc={detailSeller?.sellers.idUser.email} />
								<Description title="SDT" desc={detailSeller?.address.phone} />
								<Description
									title="Địa chỉ"
									desc={`${detailSeller?.address.ward}, ${detailSeller?.address.district}, ${detailSeller?.address.province}`}
								/>
							</div>
						</div>
						<div className={cx("info-seller")}>
							<div className={cx("info")}>
								<Description title="Tổng sản phẩm" desc={detailSeller?.sellers.totalProduct} />
								<Description title="Đã bán" desc={detailSeller?.sellers.totalSold} />
								<Description
									title="Đánh giá"
									desc={`${detailSeller?.averageRating || 0} (${detailSeller?.totalReviews}) ` || "Chưa có"}
								/>
								<Description title="Doanh thu" desc={`${Intl.NumberFormat().format(detailSeller?.totalRevenue)}đ`} />
								{detailSeller?.sellers?.idUser?.blockExpireDate && (
									<>
										<Description
											title="Thời gian mở chặn"
											important
											desc={
												<>
													<ReactTimeAgo date={Date.parse(detailSeller.sellers.idUser.blockExpireDate)} locale="vi-VN" /> (
													{moment(detailSeller.sellers.idUser.blockExpireDate).format("DD-MM-YYYY")})
												</>
											}
										/>

										{detailSeller.sellers.idUser.blockReason && (
											<Description title="Lý do chặn" important desc={detailSeller.sellers.idUser.blockReason} />
										)}
									</>
								)}
							</div>
							<div className={cx("block-area")}>
								{onBlock ? (
									<>
										<span>Chặn người dùng: </span>
										<select ref={blockExpireRef} name="dateExpire" id="cars">
											<option value="0">Một tuần</option>
											<option value="1">Một tháng</option>
											<option value="2">Ba tháng</option>
											<option value="3">Vĩnh viễn</option>
										</select>
										<br />
										<br />
										<span>Lý do chặn:</span>
										<select ref={blockReasonRef} name="reason" id="cars">
											<option value="0">Vi phạm chính sách bán hàng</option>
											<option value="1">Vi phạm chính sách mua hàng</option>
											<option value="2">Khác</option>
										</select>
										<div style={{ display: "flex", justifyContent: "center" }}>
											<button onClick={() => setOnBlock(false)}>Hủy</button>
											<button onClick={handleBlockUser} className={cx("block-btn")}>
												Chặn
											</button>
										</div>
									</>
								) : detailSeller?.sellers.idUser?.blockExpireDate ? (
									<button onClick={handleNonBlockUser}>Hủy chặn người dùng</button>
								) : (
									<button onClick={() => setOnBlock(true)}>Chặn người dùng</button>
								)}
							</div>
						</div>
					</div>
				)}
			</ModalForm>
		</div>
	);
}

export default SellerPage;
