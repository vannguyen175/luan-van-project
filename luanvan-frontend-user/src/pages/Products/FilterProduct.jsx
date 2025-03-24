import subVn from "sub-vn";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import FilterListIcon from "@mui/icons-material/FilterList";
import Badge from "@mui/material/Badge";

function Fillter({ filter, setFilter, handleFilter }) {
	const options = {
		province: subVn.getProvinces().map((item) => item.name),
		isUsed: ["Mới", "Đã sử dụng"],
		date: ["Mới nhất", "Cũ nhất"],
		price: ["Cao nhất", "Thấp nhất", "Dưới 1 triệu", "Từ 1-5 triệu", "Trên 5 triệu"],
	};

	const onChangeProvince = (e) => {
		setFilter((prevData) => ({ ...prevData, province: e.target.innerText }));
	};
	const onChangeIsUsed = (e) => {
		setFilter((prevData) => ({ ...prevData, isUsed: e.target.innerText }));
	};
	const onChangeDate = (e) => {
		setFilter((prevData) => ({ ...prevData, date: e.target.innerText }));
	};
	const onChangePrice = (e) => {
		setFilter((prevData) => ({ ...prevData, price: e.target.innerText }));
	};

	return (
		<div style={{ display: "flex", justifyContent: "space-evenly" }}>
			<Autocomplete
				size="small"
				options={options.province}
				sx={{ width: "20%" }}
				renderInput={(params) => <TextField {...params} label="Tỉnh/thành" />}
				onChange={onChangeProvince}
			/>
			<Autocomplete
				size="small"
				options={options.isUsed}
				sx={{ width: "20%" }}
				renderInput={(params) => <TextField {...params} label="Trạng thái" />}
				onChange={onChangeIsUsed}
			/>
			<Autocomplete
				size="small"
				options={options.date}
				sx={{ width: "20%" }}
				renderInput={(params) => <TextField {...params} label="Ngày đăng bán" />}
				onChange={onChangeDate}
			/>
			<Autocomplete
				size="small"
				options={options.price}
				sx={{ width: "20%" }}
				renderInput={(params) => <TextField {...params} label="Giá tiền" />}
				onChange={onChangePrice}
			/>
			<Badge
				badgeContent={
					Object.values(filter).filter(
						(value) => value !== null && value !== undefined && value !== ""
					).length
				}
				color="success"
			>
				<Button variant="contained" startIcon={<FilterListIcon />} onClick={handleFilter}>
					Bộ lọc
				</Button>
			</Badge>
		</div>
	);
}

export default Fillter;
