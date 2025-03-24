import { useEffect, useRef, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import classNames from "classnames/bind";
import style from "./Search.module.scss";
import { StringTocamelCase } from "~/utils";
import { useLocation, useNavigate } from "react-router-dom";
import * as productService from "~/service/ProductService";

const cx = classNames.bind(style);

function Search() {
	const [inputSearch, setInputSearch] = useState("");
	const [searchResult, setSearchResult] = useState([]);
	const searchInputRef = useRef(null);
	const [productList, setProductList] = useState();
	const location = useLocation();

	const navigate = useNavigate();

	useEffect(() => {
		getProductList();
	}, []);

	const getProductList = async () => {
		const result = await productService.getAllProducts({
			data: { state: [], cate: [], subCate: [] },
			page: `page=1`,
			limit: `limit=10000`,
		});
		setProductList(result);
	};

	//lọc sản phẩm mỗi khi inputSearch thay đổi => tìm kiếm sp
	useEffect(() => {
		if (inputSearch === "") {
			setSearchResult([]);
		} else {
			const filteredProducts = productList.data?.filter((product) => {
				return StringTocamelCase(product.name).includes(StringTocamelCase(inputSearch));
			});
			setSearchResult(filteredProducts);
		}
		// eslint-disable-next-line
	}, [inputSearch]);

	const handleClickSearchResult = (id) => {
		navigate(`../detail-product/${id}`, { replace: true });

		if (location.pathname.includes("detail-product")) {
			navigate(0); //reload page khi user search product ở detail-product
		}
		searchInputRef.current.value = "";
		setInputSearch("");
	};

	return (
		<div className={cx("container")}>
			<div className={cx("search")}>
				<input
					type="text"
					onChange={(e) => setInputSearch(e.target.value)}
					name="search"
					ref={searchInputRef}
					autoComplete="off"
					placeholder="Tìm kiếm sản phẩm..."
				/>
				<button className="button-icon">
					<SearchIcon />
				</button>
			</div>
			<div className={cx("result")}>
				{searchResult &&
					searchResult.map((item, index) => (
						<ul>
							<li key={index} onClick={() => handleClickSearchResult(item._id)}>
								<img src={item.images[0]} alt="anhSP" />
								<div>
									<p className={cx("name")}>{item.name}</p>
									<p className={cx("price")}>
										{Intl.NumberFormat().format(item.price)}đ
									</p>
								</div>
							</li>
						</ul>
					))}
			</div>
		</div>
	);
}

export default Search;
