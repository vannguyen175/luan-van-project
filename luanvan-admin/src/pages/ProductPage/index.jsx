import { useEffect, useState } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import FilterListIcon from "@mui/icons-material/FilterList";
import Tooltip from "@mui/material/Tooltip";
import Drawer from "@mui/material/Drawer";
import { DataGrid } from "@mui/x-data-grid";
import { viVN } from "@mui/x-data-grid/locales";

import * as ProductService from "../../service/ProductService";
import * as CategoryService from "../../service/CategoryService";
import style from "./ProductPage.module.scss";
import classNames from "classnames/bind";
import DetailProduct from "../../components/DetailProduct";

const cx = classNames.bind(style);

const styleModal = {
	position: "absolute",
	maxHeight: "90%",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 800,
	bgcolor: "background.paper",
	borderRadius: "8px",
	boxShadow: 24,
	p: 4,
};

function ProductPage() {
	const [open, setOpen] = useState(false);
	const [categories, setCategories] = useState();
	const [subCategories, setSubCategories] = useState();
	const [state, setState] = useState([]);
	const [cate, setCate] = useState([]);
	const [subCate, setSubCate] = useState([]);
	const [idProduct, setIdProduct] = useState();
	const [pageState, setPageState] = useState({
		isLoading: false,
		data: [],
		total: 0,
		page: 1,
		pageSize: 10,
	});

	const toggleDrawer = (newOpen, id) => () => {
		setIdProduct(id);
		setOpen(newOpen);
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
			width: 150,
			valueGetter: (value, row) => row.subCategory?.category?.name || "",
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
		{
			field: "Chi tiết",
			sortable: false,
			width: 100,
			renderCell: (params, row) => {
				const handleClick = () => {
					setIdProduct(params.row._id);
					setOpen(true);
				};
				return (
					<p onClick={handleClick} style={{ cursor: "pointer" }}>
						Chi tiết
					</p>
				);
			},
		},
	];

	const [openFilterModal, setOpenFilterModal] = useState(false);
	const handleOpenFilterModal = () => {
		setState([]);
		setCate([]);
		setSubCate([]);
		setOpenFilterModal(true);
	};
	const handleCloseFilterModal = () => setOpenFilterModal(false);

	const getCategory = async () => {
		const res = await CategoryService.getCategory();
		setCategories(res.data);
	};
	const getSubCategory = async () => {
		const res = await CategoryService.getSubCategory();
		setSubCategories(res.data);
	};

	const getAllProducts = async () => {
		setPageState((prev) => ({ ...prev, isLoading: true }));
		const res = await ProductService.getAllProducts({
			data: { state, cate, subCate, isBlocked: true },
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
	useEffect(() => {
		getAllProducts();
	}, [pageState.page, pageState.pageSize]);

	useEffect(() => {
		getAllProducts();
		getCategory();
		getSubCategory();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleCheckFilter = (e, value) => {
		if (e.target.name === "state") {
			const currentIndex = state.indexOf(value); //currentIndex=-1 => value không có trong mảng
			if (currentIndex === -1) {
				setState([...state, value]);
			} else {
				setState([state.splice(currentIndex, 1)]);
			}
		} else if (e.target.name === "cate") {
			const currentIndex = cate.indexOf(value);
			if (currentIndex === -1) {
				setCate([...cate, value]);
			} else {
				setCate([cate.splice(currentIndex, 1)]);
			}
		} else {
			const currentIndex = subCate.indexOf(value);
			if (currentIndex === -1) {
				setSubCate([...subCate, value]);
			} else {
				setSubCate([subCate.splice(currentIndex, 1)]);
			}
		}
	};

	const handleChange = (e) => {
		setPageState((prev) => ({ ...prev, page: e.page + 1 }));
		getAllProducts();
	};

	const handleFilter = () => {
		getAllProducts();
		handleCloseFilterModal();
	};
	return (
		<div className="inner-content">
			<p className="title">Quản lý sản phẩm</p>

			<div style={{ float: "right" }}>
				<Tooltip title="Lọc sản phẩm">
					<IconButton color="primary" onClick={handleOpenFilterModal}>
						<FilterListIcon />
					</IconButton>
				</Tooltip>
			</div>
			<div style={{ margin: "20px 0" }}>
				<strong style={{ marginRight: 10 }}>Lọc sản phẩm:</strong>
				{state && state.map((value) => <span key={value}>{value}, </span>)}
				{cate && cate.map((value) => <span key={value}>{value}, </span>)}
				{subCate && subCate.map((value) => <span key={value}>{value}, </span>)}
			</div>

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

			<Modal
				open={openFilterModal}
				onClose={handleCloseFilterModal}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={styleModal} style={{ width: 1200 }}>
					<div className="title-2" style={{ marginBottom: 30 }}>
						Lọc danh sách sản phẩm
					</div>
					<div id="modal-modal-description" sx={{ mt: 2 }}>
						<>
							<div style={{ display: "flex", alignItems: "center" }}>
								<strong style={{ marginRight: 20 }}>Trạng thái:</strong>
								<FormControlLabel
									control={<Checkbox />}
									label="Đang chờ"
									name="state"
									onChange={(e) => handleCheckFilter(e, "waiting")}
								/>
								<FormControlLabel
									control={<Checkbox />}
									onChange={(e) => handleCheckFilter(e, "approved")}
									label="Đang bán"
									name="state"
								/>
								<FormControlLabel
									control={<Checkbox />}
									onChange={(e) => handleCheckFilter(e, "selled")}
									label="Đã bán"
									name="state"
								/>
								<FormControlLabel
									control={<Checkbox />}
									onChange={(e) => handleCheckFilter(e, "reject")}
									label="Đã hủy"
									name="state"
								/>
							</div>
							<div style={{ display: "flex", alignItems: "center" }}>
								<strong style={{ marginRight: 20 }}>Danh mục chính:</strong>
								{categories &&
									categories.map((data) => (
										<FormControlLabel
											key={data._id}
											control={<Checkbox />}
											label={data.name}
											name="cate"
											onChange={(e) => handleCheckFilter(e, data.name)}
										/>
									))}
							</div>
							<div style={{ display: "flex-column", alignItems: "center" }}>
								<strong style={{ marginRight: 20 }}>Danh mục phụ:</strong>
								{subCategories &&
									subCategories.map((data) => (
										<FormControlLabel
											key={data._id}
											control={<Checkbox />}
											name="subCate"
											label={data.name}
											onChange={(e) => handleCheckFilter(e, data.name)}
										/>
									))}
							</div>
							<button style={{ float: "right" }} className="button-primary" onClick={handleFilter}>
								Lọc
							</button>
						</>
					</div>
				</Box>
			</Modal>
			<Drawer open={open} onClose={toggleDrawer(false)}>
				<DetailProduct idProduct={idProduct} toggleDrawer={toggleDrawer} getAllProducts={getAllProducts} />
			</Drawer>
		</div>
	);
}

export default ProductPage;
