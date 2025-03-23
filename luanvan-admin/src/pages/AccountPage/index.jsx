import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "react";
import * as UserService from "../../service/UserService";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { toast } from "react-toastify";
import classNames from "classnames/bind";
import style from "./AccountPage.module.scss";

import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";
import { viVN } from "@mui/x-data-grid/locales";
import BlockIcon from "@mui/icons-material/Block";

import "../page.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateForm from "./CreateAccount";
import { useNavigate } from "react-router-dom";
import SearchBox from "../../components/SearchBox/SearchBox";
import Pagination from "../../components/Pagination";
import Backdrop from "@mui/material/Backdrop";

const cx = classNames.bind(style);

const styleModal = {
	position: "absolute",
	maxHeight: "90%",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 800,
	bgcolor: "background.paper",
	overflowY: "scroll",
	borderRadius: "8px",
	boxShadow: 24,
	p: 4,
};

function AccountPage() {
	const columns = [
		{
			field: "image",
			sortable: false,
			headerName: "",
			renderCell: (params) => (
				<>
					<img src={params.row.user.avatar} alt="avatar" style={{ width: 50, height: 50 }} />
				</>
			),
		},
		{
			field: "sellerName",
			headerName: "Tên người bán",
			flex: 1,
			renderCell: (params) => {
				return <p>{params.row?.user.name}</p>;
			},
		},
		{
			field: "email",
			headerName: "Email",
			flex: 1,
			valueGetter: (value, row) => row.user?.email || "",
		},

		{
			field: "address",
			headerName: "Địa chỉ",
			flex: 1,
			valueGetter: (value, row) => row?.province || "",
		},

		{
			field: "phone",
			headerName: "Số điện thoại",
			width: 150,
			type: "number",
			renderCell: (params) => params.row.user.phone,
		},

		{
			field: " ",
			sortable: false,
			width: 120,
			renderCell: (params) => {
				return (
					<button
						className={cx("edit-btn")}
						onClick={() => {
							handleEdit(params.row.user._id);
						}}
					>
						Chỉnh sửa
					</button>
				);
			},
		},
	];
	const navigate = useNavigate();
	const token = localStorage.getItem("access_token");
	const [isLoading, setIsLoading] = useState(false);
	const [dataAccounts, setDataAccounts] = useState([]); //thông tin tất cả tài khoản
	const [pageState, setPageState] = useState({
		page: 1,
		pageSize: 10,
		totalCount: 0,
	});

	//Phân trang
	useEffect(() => {
		getAllUsers("user");
	}, [pageState.page]);

	const [openCreateModal, setOpenCreateModal] = useState(false);
	const handleOpenCreateModal = () => setOpenCreateModal(true);
	const handleCloseCreateModal = () => setOpenCreateModal(false);

	const getAllUsers = async (role) => {
		setIsLoading(true);
		const res = await UserService.getAllUsers(token, { role: role, page: `page=${pageState.page}`, limit: `limit=${pageState.pageSize}` });		
		setDataAccounts(res.data);
		if (pageState.totalCount !== res.totalCount) {
			setPageState((prevData) => ({ ...prevData, totalCount: res.totalCount }));
		}
		setIsLoading(false);
	};

	//khi admin nhấn vào nút edit
	const handleEdit = async (id) => {
		navigate(`update-account/${id}`);
	};

	const handleRoleSelected = (e) => {
		getAllUsers(e.target.value);
	};

	const handleSubmitCreate = async (value) => {
		const res = await UserService.registerUser({ ...value });
		if (res.message === "SUCCESS") {
			toast.success("Tạo tài khoản thành công!");
			getAllUsers("user");
			setTimeout(() => {
				handleCloseCreateModal();
			}, 2000);
		} else {
			toast.error(res.message);
		}
	};

	const handleDelete = async (id) => {
		const confirmed = window.confirm("Bạn có chắc muốn xóa người dùng này không?");
		if (confirmed) {
			const res = await UserService.deleteUser(id, token);
			if (res.status === "OK") {
				toast.success("Xóa tài khoản thành công!");
				getAllUsers("user");
			} else {
				toast.error(res.message);
			}
		}
	};

	const handleChange = (e) => {
		setPageState((prev) => ({ ...prev, page: e.page + 1 }));
		getAllUsers("user");
	};

	return (
		<div className="inner-content">
			<p className="title">Quản lý tài khoản</p>
			<button style={{ marginTop: 20 }} className="add-button" onClick={handleOpenCreateModal}>
				Tạo tài khoản mới +
			</button>
			<select name="Vai trò" id="role" className="account-select" onChange={handleRoleSelected} defaultValue="user">
				<option value="admin">Quản trị viên</option>
				<option value="user">Người dùng</option>
			</select>
			<SearchBox API={UserService.search} token={token} setData={setDataAccounts} />
			{dataAccounts.length > 0 ? (
				<DataGrid
					autoHeight
					disableRowSelectionOnClick
					rows={dataAccounts}
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
			{/* <TableContainer component={Paper} className="account-table">
				<Table sx={{ minWidth: 650 }} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell align="left"></TableCell>
							<TableCell>Tên tài khoản</TableCell>
							<TableCell align="right">Email</TableCell>
							<TableCell align="right">Địa chỉ</TableCell>
							<TableCell align="right">Số điện thoại</TableCell>
							<TableCell align="right">Vai trò</TableCell>
							<TableCell align="right">Sửa</TableCell>
							<TableCell align="right">Xóa</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{dataAccounts.length > 0 &&
							dataAccounts?.map((account) => (
								<TableRow key={account.user?._id || account._id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
									<TableCell align="left">
										<img style={{ width: 50, height: 50 }} src={account.user?.avatar || account.avatar} alt="avatar" />
									</TableCell>
									<TableCell align="left">{account.user?.name || account.name}</TableCell>
									<TableCell align="right">{account.user?.email || account.email}</TableCell>
									<TableCell align="right">{account.province}</TableCell>
									<TableCell align="right">{account.phone}</TableCell>
									<TableCell align="right">{account.user?.isAdmin || account.isAdmin ? "quản trị viên" : "người dùng"}</TableCell>
									<TableCell align="right">
										<button style={{ border: "none", background: "transparent" }} onClick={() => handleEdit(account.user._id)}>
											<EditIcon fontSize="small" className="editIcon" />
										</button>
									</TableCell>
									<TableCell align="right">
										<DeleteIcon onClick={() => handleDelete(account.user._id)} fontSize="small" className="deleteIcon" />
									</TableCell>
								</TableRow>
							))}
						<TableRow>
							<TableCell align="right">
								<Pagination pageState={pageState} setPageState={setPageState} />
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer> */}

			<Modal
				open={openCreateModal}
				onClose={handleCloseCreateModal}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={styleModal}>
					<div id="modal-modal-title" variant="h6" component="h2">
						Tạo tài khoản mới
					</div>
					<div id="modal-modal-description" sx={{ mt: 2 }}>
						<>
							<CreateForm onSubmit={handleSubmitCreate} onCloseModal={handleCloseCreateModal} />
						</>
					</div>
				</Box>
			</Modal>
		</div>
	);
}

export default AccountPage;
