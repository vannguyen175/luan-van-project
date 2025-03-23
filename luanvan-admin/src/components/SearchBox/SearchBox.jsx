import SearchIcon from "@mui/icons-material/Search";
import ReplayIcon from "@mui/icons-material/Replay";
import { useRef } from "react";
import * as UserService from "../../service/UserService";
import classNames from "classnames/bind";
import style from "./SearchBox.module.scss";

const cx = classNames.bind(style);

function SearchBox({ API, token, setData }) {
	const inputRef = useRef("");

	const handleSearch = async () => {
		let key = inputRef.current.value;
		if (key) {
			const res = await API(key, token);
			setData(res.result);
		} else {
			key = "all";
			const res = await API(key, token);
			setData(res.result);
		}
	};

	return (
		<div className={cx("box-search")}>
			<input ref={inputRef} className={cx("input-search")} />
			<button className={cx("button-search")} onClick={handleSearch}>
				<SearchIcon fontSize="small" />
			</button>
		</div>
	);
}

export default SearchBox;
