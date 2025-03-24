import style from "./Products.module.scss";
import classNames from "classnames/bind";
import Button from "~/components/Button";
import CardProduct from "~/components/CardProduct";
import * as ProductService from "~/service/ProductService";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "../../components/Pagination";
import Fillter from "./FilterProduct";

const cx = classNames.bind(style);

function Products() {
	const { slug_category } = useParams();
	const [subCateChosen, setSubCateChosen] = useState();
	const [isLoading, setIsLoading] = useState(false);
	const [subCategory, setSubCategory] = useState();
	const [products, setProducts] = useState();
	const [filter, setFilter] = useState({
		province: null,
		isUsed: null,
		date: null,
		price: null,
	});

	const [pageState, setPageState] = useState({
		page: 1,
		pageSize: 10,
		totalCount: 0,
	});

	//Phân trang
	useEffect(() => {
		if (subCateChosen && pageState.pageSize) {
			getProductsBySubCate(filter.province, filter.isUsed, filter.date, filter.price);
		}
	}, [pageState.page, subCateChosen]);

	const getSubCategory = async () => {
		const res = await ProductService.getSubCategory(slug_category);
		setSubCategory(res.subCategory);
		setSubCateChosen(res.subCategory[0]?.name);
		//return res.subCategory;
	};
	useEffect(() => {
		getSubCategory();
		// eslint-disable-next-line
	}, []);

	const getProductsBySubCate = async (province, isUsed, date, price) => {
		setIsLoading(true);
		const res = await ProductService.getAllProducts({
			data: { state: [], cate: [], subCate: [subCateChosen], province, isUsed, date, price }, //vd: chó
			page: `page=${pageState.page}`,
			limit: `limit=${pageState.pageSize}`,
		});
		if (pageState.totalCount !== res.totalCount) {
			setPageState((prevData) => ({ ...prevData, totalCount: res.totalCount }));
		}
		setProducts(res.data);
		setIsLoading(false);
	};

	//thay đổi subCateChosen mỗi khi user nhấn chọn danh mục phụ
	const handleShowProducts = (subCate) => {
		setPageState((prevData) => ({ ...prevData, page: 1 }));
		setSubCateChosen(subCate.name);
	};

	//mỗi lần subCateChosen thay đổi, getProductsBySubCate sẽ được refetch để lấy data products
	// useEffect(() => {
	// 	if (subCateChosen) {
	// 		getProductsBySubCate();
	// 	}
	// 	// eslint-disable-next-line
	// }, [subCateChosen]);

	const handleFilter = () => {
		getProductsBySubCate(filter.province, filter.isUsed, filter.date, filter.price);
	};

	return (
		<div className={cx("container")}>
			<div className={cx("shop-category", "inner-content")}>
				<p className={cx("title")}>Danh mục phụ</p>
				{subCategory?.map((subCate, index) => (
					<Button
						key={index}
						chosenBtn={subCateChosen === subCate.name}
						onClick={() => handleShowProducts(subCate)}
					>
						{subCate.name}
					</Button>
				))}
			</div>
			<div className={cx("inner-content")}>
				<div className={cx("filter")}>
					<Fillter filter={filter} setFilter={setFilter} handleFilter={handleFilter} />
				</div>

				<div className={cx("products")}>
					{isLoading ? (
						<div style={{ margin: "0 auto" }}>
							<CircularProgress />
						</div>
					) : products?.length > 0 ? (
						<>
							{products?.map((product, key) => (
								<CardProduct key={key} product={product} type="horizontal" />
							))}
							<div className={cx("pagination")}>
								<Pagination pageState={pageState} setPageState={setPageState} />
							</div>
						</>
					) : (
						<p style={{ margin: "0 auto" }}>Danh mục này hiện không có sản phẩm nào.</p>
					)}
				</div>
			</div>
		</div>
	);
}

export default Products;
