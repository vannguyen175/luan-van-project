import { useEffect, useRef, useState } from "react";
import * as CategoryService from "../../service/CategoryService";
import classNames from "classnames/bind";
import style from "./CategoryPage.module.scss";
import Modal from "../../components/Modal";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { convertToSlug } from "../../utils";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";

const cx = classNames.bind(style);

function CategoryPage() {
	const cateRef = useRef();
	const subCateRef = useRef();
	const infoRef = useRef();
	const searchRef = useRef();

	const [cateList, setCateList] = useState();
	const [subCateList, setSubCateList] = useState();
	const [cateDetail, setCateDetail] = useState();
	const [infoSubCate, setInfoSubCate] = useState([]);
	const [infoActive, setInfoActive] = useState();
	const [showInputAdd, setShowInputAdd] = useState();
	//const [optionList, setOptionList] = useState([]);

	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingModal, setIsLoadingModal] = useState(true);
	const [showUpdateModal, setShowUpdateModal] = useState(false);

	const getCategory = async () => {
		const res = await CategoryService.getCategory();
		setCateList(res.data);
	};

	const getSubCategory = async () => {
		const res = await CategoryService.getSubCategory();
		setSubCateList(res.data);
	};

	const getCateDetail = async (slug, search) => {
		//cate-slug
		const res = await CategoryService.getDetailCategory(slug);
		setCateDetail({
			category: res.category,
			subCategory: res.subCategory,
		});
		if (res?.subCategory?.length > 0) {
			setInfoSubCate(res.subCategory[0].infoSubCate);
			setInfoActive({
				subCate: res.subCategory[0]?.name,
				info: res.subCategory[0].infoSubCate[0]?.name,
				options: res.subCategory[0].infoSubCate[0]?.option,
			});
		}
		setShowInputAdd();
		setIsLoadingModal(false);
	};

	const handleChangeSubCate = async (value) => {
		const result = cateDetail.subCategory.find((item) => item.name === value);
		setInfoActive({ subCate: value, info: result?.infoSubCate[0]?.name, options: result?.infoSubCate[0]?.option });
		setInfoSubCate(result.infoSubCate);
	};

	useEffect(() => {
		setIsLoading(true);
		getCategory();
		getSubCategory();
		setIsLoading(false);
	}, []);

	const handleShowUpdate = (cateSlug) => {
		setIsLoadingModal(true);
		setInfoSubCate();
		setInfoActive();
		getCateDetail(cateSlug);
		setShowUpdateModal(true);
	};

	const createCategory = async () => {
		const result = await CategoryService.createCategory({
			name: cateRef.current.value,
		});
		if (result.status === "SUCCESS") {
			toast.success(result.message);
			setShowInputAdd("");
			getCategory();
			getSubCategory();
		} else {
			toast.error(result.message);
		}
	};
	const createSubCate = async () => {
		const result = await CategoryService.createSubCategory({
			name: subCateRef.current.value,
			slug: convertToSlug(cateDetail.category.name),
		});
		handleResult(result);
	};
	const createInfo = async () => {
		const result = await CategoryService.createInfoSubCate({
			info: infoActive?.subCate,
			name: infoRef.current.value,
			option: infoActive?.options,
		});
		handleResult(result);
	};
	const deleteSubCate = async (subCate) => {
		if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
			const result = await CategoryService.deleteSubCate(subCate.slug);
			handleResult(result);
		}
	};
	const deleteInfo = async (info) => {
		const result = await CategoryService.deleteInfoSubcate({
			slug: convertToSlug(infoActive?.subCate),
			nameInfo: info.name,
		});
		handleResult(result);
	};

	//xử lý các kết quả trả về từ CategoryService
	const handleResult = (result) => {
		if (result.status === "SUCCESS") {
			getCateDetail(cateDetail.category.slug);
		} else {
			toast.error(result.message);
		}
	};

	const handleClickInfo = (info) => {
		setInfoActive((prev) => ({ ...prev, info: info.name, options: info.option }));
		setShowInputAdd("");
		//setOptionList([]);
	};

	const handleChangeOption = (newValue) => {
		setInfoActive((prev) => ({
			...prev,
			options: newValue,
		}));
		if (showInputAdd !== "info") {
			setShowInputAdd("option"); //show nút "Cập nhật lựa chọn"
		}
	};

	const handleSearch = async () => {
		setIsLoading(true);
		if (searchRef.current.value) {
			const res = await CategoryService.searchCategory(searchRef.current.value);
			setCateList(res.data);
		} else {
			getCategory();
		}
		getSubCategory();
		setIsLoading(false);
	};

	const updateOptions = async () => {
		const result = await CategoryService.updateOptions({
			slug: convertToSlug(infoActive?.subCate),
			info: infoActive?.info,
			options: infoActive.options,
		});
		if (result.status === "SUCCESS") {
			setShowInputAdd("");
		}
		handleResult(result);
	};

	const handleShowInputAdd = (value) => {
		setShowInputAdd(value);
		setInfoActive((prev) => ({
			...prev,
			options: [],
		}));
	};

	const handleDeleteCate = async (slug) => {
		if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
			const res = await CategoryService.deleteCategory(slug);
			console.log("handleDeleteCate", res);
			if (res.status === "SUCCESS") {
				toast.success(res.message);
			} else {
				toast.error(res.message);
			}
		}
	};

	console.log("cateList", subCateList);

	return (
		<>
			<div className="inner-content">
				<p className="title">Quản lý danh mục</p>
				<div style={{ display: "flex", justifyContent: "space-between", width: "95%" }}>
					{showInputAdd === "category" ? (
						<div className={cx("add-cate")}>
							<input placeholder="Thêm danh mục mới..." ref={cateRef} />
							<button className={cx("add")} onClick={createCategory}>
								Thêm
							</button>
							<button className={cx("cancel")} onClick={() => setShowInputAdd("")}>
								Hủy
							</button>
						</div>
					) : (
						<button className={cx("add-category")} onClick={() => setShowInputAdd("category")}>
							+ Tạo mới danh mục
						</button>
					)}

					<div className={cx("search")}>
						<input placeholder="Tìm kiếm danh mục..." ref={searchRef} />
						<button onClick={handleSearch}>Tìm kiếm</button>
					</div>
				</div>
				{isLoading ? (
					<div style={{ textAlign: "center" }}>
						<CircularProgress />
					</div>
				) : (
					<div style={{ marginTop: 20 }}>
						<table className={cx("table")}>
							<thead>
								<tr>
									<th className={cx("header")}>Danh mục chính</th>
									<th className={cx("header")}>Danh mục phụ</th>
									<th className={cx("header")}>Chỉnh sửa</th>
								</tr>
							</thead>
							<tbody>
								{cateList &&
									cateList.map((cate, index) => (
										<tr key={index}>
											<td className={cx("cell")}>{cate.name}</td>
											<td className={cx("cell")}>
												{subCateList &&
													subCateList.map(
														(subCate, index) => subCate.category === cate.slug && <span>{subCate.name}, </span>
													)}
											</td>
											<td className={cx("cell")}>
												<button className={cx("button-table")} onClick={() => handleShowUpdate(cate.slug)}>Chỉnh sửa</button>
											</td>
										</tr>
									))}
							</tbody>
						</table>

						{/* <div className={cx("header")}>
							<div style={{ width: "11.7%" }}>Danh mục</div>
							<div style={{ width: "20%" }}>Danh mục chính</div>
							<div style={{ width: "29.7%" }}>Thông tin mô tả</div>
							<div style={{ width: "70%" }}>Lựa chọn mô tả</div>
						</div>
						{cateList &&
							cateList.map((cate, index) => (
								<div key={index} style={{ display: "flex", marginLeft: 15, width: "95%" }}>
									<div onClick={() => handleShowUpdate(cate.slug)} className={cx("category")}>
										{cate.name}
									</div>
									<div className={cx("sub-category")}>
										{subCateList &&
											subCateList.map((subCate, indexSub) => {
												return cate.slug === subCate.category ? (
													<div key={indexSub} style={{ display: "flex" }}>
														<p className={cx("sub-category-name")}>{subCate.name}</p>
														<div className={cx("sub-category-info")}>
															{subCate.infoSubCate.map((info, indexInfo) => (
																<div key={indexInfo} style={{ display: "flex" }}>
																	<p>{info.name}</p>
																	<div>
																		{info.option.map((opt, indexOpt) => (
																			<p key={indexOpt}>{opt},</p>
																		))}
																	</div>
																</div>
															))}
														</div>
													</div>
												) : null;
											})}
									</div>
								</div>
							))} */}
					</div>
				)}

				<Modal title="Chỉnh sửa danh mục" isOpen={showUpdateModal} setIsOpen={setShowUpdateModal} width={1000}>
					{isLoadingModal ? (
						<div style={{ textAlign: "center" }}>
							<CircularProgress />
						</div>
					) : (
						<div className={cx("add-modal")}>
							{cateDetail?.subCategory.length === 0 && (
								<button onClick={() => handleDeleteCate(cateDetail.category.slug)} className={cx("delete-category-btn")}>
									Xóa danh mục
								</button>
							)}
							<Grid container spacing={2}>
								<Grid item xs={3}>
									Danh mục:
								</Grid>
								<Grid item xs={8}>
									<strong>{cateDetail.category.name}</strong>
								</Grid>
								<Grid item xs={3}>
									Danh mục phụ:
								</Grid>
								<Grid item xs={8}>
									<div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
										{cateDetail?.subCategory &&
											cateDetail.subCategory.map((subCate, index) => (
												<div
													className={cx("info-btn", infoActive.subCate === subCate.name && "active")}
													key={index}
													onClick={() => handleChangeSubCate(subCate.name)}
												>
													{subCate.name}
													<p onClick={() => deleteSubCate(subCate)}>
														<HighlightOffIcon />
													</p>
												</div>
											))}
										{showInputAdd === "subCate" ? (
											<div className={cx("add-input")}>
												<input placeholder="Thêm danh mục phụ" ref={subCateRef} />
												<button onClick={createSubCate}>Thêm</button>
											</div>
										) : (
											<IconButton onClick={() => handleShowInputAdd("subCate")}>
												<AddIcon />
											</IconButton>
										)}
									</div>
								</Grid>
								<Grid item xs={3}>
									Thông tin mô tả:
								</Grid>
								<Grid item xs={8} style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
									{infoSubCate?.length > 0 &&
										infoSubCate.map((info, index) => (
											<div
												className={cx("info-btn", infoActive.info === info?.name && "active")}
												key={index}
												onClick={() => handleClickInfo(info)}
											>
												{info?.name}
												<p onClick={() => deleteInfo(info)}>
													<HighlightOffIcon />
												</p>
											</div>
										))}
									{showInputAdd === "info" ? (
										<div className={cx("add-input")}>
											<input placeholder="Thêm thông tin mô tả" ref={infoRef} />
										</div>
									) : (
										<IconButton onClick={() => handleShowInputAdd("info")}>
											<AddIcon />
										</IconButton>
									)}
								</Grid>
								<Grid item xs={3}>
									Lựa chọn mô tả:
								</Grid>
								<Grid item xs={12} style={{ display: "flex" }}>
									<div style={{ display: "flex-wrap", width: "100%" }}>
										<Autocomplete
											multiple
											id="tags-filled"
											options={[]}
											value={infoActive?.options ? infoActive?.options?.map((option) => option) : []}
											freeSolo
											onChange={(event, newValue) => {
												handleChangeOption(newValue);
											}}
											renderTags={(value, getTagProps) =>
												value.map((option, index) => {
													const { key, ...tagProps } = getTagProps({ index });
													return <Chip variant="outlined" label={option} key={key} {...tagProps} />;
												})
											}
											renderInput={(params) => <TextField {...params} placeholder="Nhập các lựa chọn..." />}
										/>
									</div>
								</Grid>
							</Grid>
							{showInputAdd === "info" && (
								<div style={{ textAlign: "center", margin: "10px 0" }}>
									<Button variant="contained" onClick={createInfo}>
										Thêm
									</Button>
								</div>
							)}
							{showInputAdd === "option" && (
								<div style={{ textAlign: "center", margin: "10px 0" }}>
									<Button variant="contained" onClick={updateOptions}>
										Cập nhật lựa chọn
									</Button>
								</div>
							)}
						</div>
					)}
				</Modal>
			</div>
		</>
	);
}

export default CategoryPage;
