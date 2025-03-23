import { useEffect, useRef, useState } from "react";
import * as ProductService from "../../service/ProductService";
import * as UserService from "../../service/UserService";
import { useNavigate, useParams } from "react-router-dom";

import classNames from "classnames/bind";
import style from "./SellerPage.module.scss";

import { DataGrid } from "@mui/x-data-grid";
import { viVN } from "@mui/x-data-grid/locales";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import IconButton from "@mui/material/IconButton";
import Description from "../../components/Description";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import ReactTimeAgo from "react-time-ago";
import moment from "moment";

const cx = classNames.bind(style);

function SellerDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [user, setUser] = useState();
	const [seller, setSeller] = useState();
	const token = localStorage.getItem("access_token");
	const [onBlock, setOnBlock] = useState(false);
	const [pageState, setPageState] = useState({
		isLoading: false,
		data: [],
		total: 0,
		page: 1,
		pageSize: 10,
	});
	const blockExpireRef = useRef();
	const blockReasonRef = useRef();

	const getAllSellerProduct = async () => {
		setPageState((prev) => ({ ...prev, isLoading: true }));

		const res = await ProductService.getAllProducts({
			data: { seller: id, isBlocked: true }, //với seller đang bị khóa, vẫn lấy được sp
			page: `page=${pageState.page}`,
			limit: `limit=${pageState.pageSize}`,
		});
		setPageState((prev) => ({
			...prev,
			isLoading: false,
			data: res.data,
			total: res.totalData,
		}));
	};

	const getDetailUser = async () => {
		const res = await UserService.getDetailUser(id, token);
		console.log("getDetailUser", res);

		setUser({ ...res.user, ...res.address, ...res.user });
	};

	const getDetailSeller = async () => {
		const res = await UserService.getDetailSeller(id);
		setSeller({
			totalProduct: res.data.sellers.totalProduct,
			totalSold: res.data.sellers.totalSold,
			revenue: res.data.sellers.revenue,
			averageRating: res.data.averageRating,
			totalReviews: res.data.totalReviews,
		});
	};

	const columns = [
		{
			field: "image",
			sortable: false,
			headerName: "Ảnh SP",
			renderCell: (params) => (
				<>
					<img src={params.row.images[0]} alt="anhSP" style={{ width: 50, height: 50 }} />
				</>
			),
		},
		{ field: "name", sortable: false, headerName: "Tên sản phẩm", flex: 1 },
		{
			field: "sellerName",
			headerName: "Tên người bán",
			width: 150,
			valueGetter: (value, row) => row.idUser?.name || "",
		},
		{
			field: "category",
			headerName: "Danh mục",
			flex: 1,
			valueGetter: (value, row) => `${row.subCategory?.category?.name} - ${row.subCategory?.name}` || "",
		},
		{
			field: "price",
			headerName: "Giá bán",
			width: 140,
			type: "number",
			renderCell: (params) => `${Intl.NumberFormat().format(params.value)}đ`,
		},
		{
			field: "quantity",
			headerName: "Số lượng",
			width: 100,
			align: "center",
			type: "number",
			renderCell: (params) => params.row.quantity,
		},
		{
			field: "quantityState",
			headerName: "Đã bán",
			width: 100,
			align: "center",
			type: "number",
			renderCell: (params) => params.row.quantity - params.row.quantityState,
		},
		{
			field: "province",
			headerName: "Địa chỉ",
			flex: 1,
			valueGetter: (value, row) => row.address?.province || "",
		},
		{
			field: "statePost",
			headerName: "Trạng thái",
			width: 100,
			renderCell: (params, row) => {
				return (
					<div>
						{params.row.statePost === "waiting" ? (
							<p className={cx("waiting")}>Đang chờ</p>
						) : params.row.statePost === "approved" ? (
							<p className={cx("approved")}>Đang bán</p>
						) : params.row.statePost === "selled" ? (
							<p className={cx("selled")}>Bán hết</p>
						) : params.row.statePost === "reject" ? (
							<p className={cx("reject")}>Bị từ chối</p>
						) : (
							<p className={cx("closed")}>Đã đóng</p>
						)}
					</div>
				);
			},
		},
	];

	const handleChange = (e) => {
		setPageState((prev) => ({ ...prev, page: e.page + 1 }));
		getAllSellerProduct();
	};

	useEffect(() => {
		getAllSellerProduct();
		getDetailUser();
		getDetailSeller();
	}, []);

	const handleBlockUser = async () => {
		if (window.confirm("Bạn có chắc muốn chặn người dùng này?")) {
			const res = await UserService.blockUser(token, id, {
				dateExpire: blockExpireRef.current.value,
				blockReason: blockReasonRef.current.value,
			});
			if (res.status === "SUCCESS") {
				toast.success("Chặn người dùng thành công!");
				getDetailUser();
				getDetailSeller();
				setOnBlock(false)
			}
		}
	};

	const handleNonBlockUser = async () => {
		if (window.confirm("Bạn có chắc muốn bỏ chặn người dùng này?")) {
			const res = await UserService.blockUser(token, id, {});
			if (res.status === "SUCCESS") {
				toast.success("Hủy chặn người dùng thành công!");
				getDetailUser();
				getDetailSeller();
			}
		}
	};

	return (
		<div className="inner-content">
			<IconButton onClick={() => navigate("/seller")}>
				<KeyboardBackspaceIcon />
			</IconButton>

			<h2 className="title">Thông tin chi tiết nhà bán hàng</h2>
			<div className={cx("seller-detail")}>
				<h2 style={{ textAlign: "center" }}>THÔNG TIN NGƯỜI DÙNG</h2>
				{}
				{user && seller ? (
					<div className={cx("detail", "animate__animated", "animate__fadeIn")}>
						<div style={{ width: "48%" }}>
							<Description title="ID" desc={id} />
							<Description title="Tên tài khoản" desc={user.name} />
							<Description title="Email" desc={user.email} />
							<Description title="Số điện thoại" desc={user.phone} />
							<Description
								title="Địa chỉ"
								desc={
									user.address && user.ward && user.district && user.province
										? `${user.address}, ${user.ward}, ${user.district}, ${user.province}`
										: "Chưa có"
								}
							/>
							{user?.blockExpireDate && (
								<>
									<Description
										title="Thời gian mở chặn"
										important
										desc={
											<>
												<ReactTimeAgo date={Date.parse(user.blockExpireDate)} locale="vi-VN" /> (
												{moment(user.blockExpireDate).format("DD-MM-YYYY")})
											</>
										}
									/>

									{user.blockReason && <Description title="Lý do chặn" important desc={user.blockReason} />}
								</>
							)}
						</div>
						<div style={{ width: "48%" }}>
							<Description title="Số sản phẩm" desc={seller.totalProduct} />
							<Description title="Lượt bán thành công" desc={seller.totalSold} />
							<Description title="Doanh thu" desc={`${Intl.NumberFormat().format(seller.revenue)}đ`} />
							<Description title="Đánh giá" desc={`${seller?.averageRating || 0}/5 (${seller?.totalReviews} đánh giá)` || 0} />

							<div className={cx("block-area")}>
								{onBlock ? (
									<>
										<div style={{ display: "flex" }}>
											<span>Chặn người dùng: </span>
											<select ref={blockExpireRef} name="dateExpire" id="cars">
												<option value="0">Một tuần</option>
												<option value="1">Một tháng</option>
												<option value="2">Ba tháng</option>
												<option value="3">Vĩnh viễn</option>
											</select>
										</div>

										<div style={{ display: "flex" }}>
											<span>Lý do chặn:</span>
											<select ref={blockReasonRef} name="reason" id="cars">
												<option value="0">Vi phạm chính sách bán hàng</option>
												<option value="1">Vi phạm chính sách mua hàng</option>
												<option value="2">Khác</option>
											</select>
										</div>

										<div style={{ display: "flex", justifyContent: "center" }}>
											<button onClick={() => setOnBlock(false)}>Hủy</button>
											<button onClick={handleBlockUser} className={cx("block-btn")}>
												Chặn
											</button>
										</div>
									</>
								) : user?.blockExpireDate ? (
									<button onClick={handleNonBlockUser}>Hủy chặn người dùng</button>
								) : (
									<button onClick={() => setOnBlock(true)}>Chặn người dùng</button>
								)}
							</div>
						</div>
					</div>
				) : (
					<div style={{ textAlign: "center" }}>
						<CircularProgress />
					</div>
				)}
			</div>
			<div className={cx("seller-product")}>
				<h2>DANH SÁCH SẢN PHẨM CỦA NGƯỜI BÁN</h2>
				{pageState.data && (
					<DataGrid
						autoHeight
						disableRowSelectionOnClick
						rows={pageState.data}
						getRowId={(data) => data._id}
						columns={columns}
						loading={pageState.isLoading}
						pagination
						paginationMode="server"
						rowCount={pageState.total} // Tổng số hàng (nếu phân trang phía server)
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
				)}
			</div>
		</div>
	);
}

export default SellerDetail;
