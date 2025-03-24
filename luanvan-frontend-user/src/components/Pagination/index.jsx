import classNames from "classnames/bind";
import style from "./Pagination.module.scss";
import { useEffect, useState } from "react";

const cx = classNames.bind(style);

function Pagination({ pageState, setPageState }) {
	const [totalPage, setTotalPage] = useState(Math.ceil(pageState.totalCount / pageState.pageSize));

	const handleClick = (pageNumber) => {
		if (pageNumber > 0 && pageNumber <= totalPage) {
			setPageState((prevData) => ({ ...prevData, page: pageNumber }));
		}
	};

	useEffect(() => {
		setTotalPage(Math.ceil(pageState.totalCount / pageState.pageSize));
	}, [pageState]);

	return (
		<div className={cx("pagination")}>
			<button className={cx("pagination-btn")} onClick={() => handleClick(pageState.page - 1)} disabled={pageState.page === 1}>
				&laquo;
			</button>

			{Array.from({ length: totalPage }, (_, index) => (
				<button
					key={index}
					className={cx("pagination-btn", pageState.page === index + 1 ? "active" : "")}
					onClick={() => handleClick(index + 1)}
				>
					{index + 1}
				</button>
			))}

			<button className={cx("pagination-btn")} onClick={() => handleClick(pageState.page + 1)} disabled={pageState.page === totalPage}>
				&raquo;
			</button>
		</div>
	);
}

export default Pagination;
