import { useApp } from "~/context/AppProvider";
import classNames from "classnames/bind";
import style from "./PostingProduct.module.scss";
import Grid from "@mui/material/Grid";
import { Autocomplete, TextField } from "@mui/material";
import subVn from "sub-vn";
import { useState } from "react";

const cx = classNames.bind(style);

function SellerInfo({ dataSubmit, setDataSubmit }) {
	const { user } = useApp(); //useContext
	const [provinceCode, setProvinceCode] = useState(""); //Lấy code tỉnh/thành phố
	const [districtCode, setDistrictCode] = useState(""); //Lấy code huyện/quận

	const hanldeChangeProvince = async (value) => {
		const listProvince = await subVn.getProvinces();
		const selectedProvince = listProvince.find((item) => item.name === value);

		if (selectedProvince) {
			setProvinceCode(selectedProvince.code);
		}
		setDataSubmit((prevData) => ({
			...prevData,
			address: {
				...prevData.address,
				province: value,
			},
		}));
	};

	const hanldeChangeDistrict = async (value) => {
		const listDistrict = await subVn.getDistricts();
		const selectedDistrict = listDistrict.find((item) => item.name === value);
		if (selectedDistrict) {
			setDistrictCode(selectedDistrict.code);
		}
		setDataSubmit((prevData) => ({
			...prevData,
			address: {
				...prevData.address,
				district: value,
			},
		}));
	};
	const hanldeChangeWard = (value) => {
		setDataSubmit((prevData) => ({
			...prevData,
			address: {
				...prevData.address,
				ward: value,
			},
		}));
	};

	const handleChangeInput = (e) => {
		setDataSubmit((prevData) => ({
			...prevData,
			address: {
				...prevData.address,
				[e.target.name]: e.target.value,
			},
		}));
	};

	return (
		<>
			<Grid container spacing={2} margin={1}>
				{user?.id && (
					<>
						<Grid item xs={3} style={{ textAlign: "right", marginTop: 10 }}>
							Email:
						</Grid>
						<Grid item xs={7}>
							<input
								name="email"
								className={cx("input-form")}
								defaultValue={user.email || undefined}
								onChange={handleChangeInput}
							/>
						</Grid>
						<Grid item xs={3} style={{ textAlign: "right", marginTop: 10 }}>
							Số điện thoại:
						</Grid>
						<Grid item xs={7}>
							<input
								name="phone"
								className={cx("input-form")}
								defaultValue={user.phone || undefined}
								onChange={handleChangeInput}
							/>
						</Grid>
						<Grid item xs={3} style={{ textAlign: "right", marginTop: 10 }}>
							Tỉnh/thành phố:
						</Grid>
						<Grid item xs={7}>
							<Autocomplete
								defaultValue={dataSubmit.address.province || user.province}
								options={subVn.getProvinces().map((item) => item.name)}
								onChange={(e) => hanldeChangeProvince(e.target.innerText)}
								renderInput={(params) => (
									<TextField {...params} placeholder="Tỉnh/thành phố" />
								)}
							/>
						</Grid>
						<Grid item xs={3} style={{ textAlign: "right", marginTop: 10 }}>
							Quận/huyện:
						</Grid>
						<Grid item xs={7}>
							{(provinceCode || user.district) && (
								<Autocomplete
									defaultValue={dataSubmit.address.district || user.district}
									options={subVn
										.getDistrictsByProvinceCode(provinceCode)
										.map((item) => item.name)}
									onChange={(e) => hanldeChangeDistrict(e.target.innerText)}
									renderInput={(params) => (
										<TextField {...params} placeholder="Huyện/quận" />
									)}
								/>
							)}
						</Grid>
						{(districtCode || user.district) && (
							<>
								<Grid item xs={3} style={{ textAlign: "right", marginTop: 10 }}>
									Phường/xã:
								</Grid>
								<Grid item xs={7}>
									<Autocomplete
										defaultValue={dataSubmit.address.ward || user.ward}
										options={subVn
											.getWardsByDistrictCode(districtCode)
											.map((item) => item.name)}
										onChange={(e) => hanldeChangeWard(e.target.innerText)}
										renderInput={(params) => (
											<TextField {...params} placeholder="Phường/xã" />
										)}
									/>
								</Grid>
								<Grid item xs={3} style={{ textAlign: "right", marginTop: 7 }}>
									Địa chỉ cụ thể:
								</Grid>
								<Grid item xs={7}>
									<textarea
										name="address"
										className={cx("input-form")}
										defaultValue={user.address || undefined}
										onChange={handleChangeInput}
										rows="5"
										style={{ width: "100%", padding: "5px 10px" }}
									/>
								</Grid>
							</>
						)}
					</>
				)}
			</Grid>
		</>
	);
}

export default SellerInfo;
