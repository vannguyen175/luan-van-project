import { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import subVn from "sub-vn";
import { formatPhoneNumber } from "../../utils";

import { useApp } from "~/context/AppProvider";

function AddressForm({ setDataSubmit, data }) {
	const [provinceCode, setProvinceCode] = useState(""); //Lấy code tỉnh/thành phố
	const [districtCode, setDistrictCode] = useState(""); //Lấy code huyện/quận
	const { user } = useApp(); //useContext

	useEffect(() => {
		if (data.district !== "") {
			hanldeChangeProvince(data.province);
			hanldeChangeDistrict(data.district);
			hanldeChangeWard(data.ward);
			
		}
		// eslint-disable-next-line
	}, []);

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

	const handleChange = (e) => {
		setDataSubmit((prevData) => ({
			...prevData,
			address: {
				...prevData.address,
				[e.target.name]: e.target.value,
			},
		}));
	};

	return (
		<div
			style={{
				textAlign: "left",
				boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
				padding: 20,
			}}
		>
			{user.id && (
				<div style={{ display: "flex" }}>
					<div style={{ width: "50%" }}>
						<TextField
							defaultValue={user.name}
							label="Tên tài khoản"
							variant="outlined"
							className="text-field"
							InputProps={{ readOnly: true }}
						/>
						<TextField
							name="email"
							defaultValue={data.email}
							onChange={handleChange}
							label="Email"
							variant="outlined"
							className="text-field"
							style={{ margin: "15px 0" }}
						/>
						<TextField
							name="phone"
							defaultValue={formatPhoneNumber(data.phone)}
							onChange={handleChange}
							label="Số điện thoại"
							variant="outlined"
							type="number"
							className="text-field"
							style={{ margin: "15px 0" }}
						/>
					</div>

					<div style={{ marginLeft: 20, width: "50%" }}>
						<Autocomplete
							defaultValue={data.province}
							options={subVn.getProvinces().map((item) => item.name)}
							onChange={(e) => hanldeChangeProvince(e.target.innerText)}
							renderInput={(params) => (
								<TextField {...params} label="Tỉnh/thành phố" />
							)}
						/>
						{(provinceCode || data.district) && (
							<Autocomplete
								defaultValue={data.district}
								options={subVn
									.getDistrictsByProvinceCode(provinceCode)
									.map((item) => item.name)}
								onChange={(e) => hanldeChangeDistrict(e.target.innerText)}
								renderInput={(params) => (
									<TextField {...params} label="Huyện/quận" />
								)}
								style={{ margin: "15px 0" }}
							/>
						)}

						{(districtCode || data.district) && (
							<>
								<Autocomplete
									defaultValue={data.ward}
									options={subVn
										.getWardsByDistrictCode(districtCode)
										.map((item) => item.name)}
									onChange={(e) => hanldeChangeWard(e.target.innerText)}
									renderInput={(params) => (
										<TextField {...params} label="Phường/xã" />
									)}
								/>
								<TextField
									name="address"
									defaultValue={data.address}
									onChange={handleChange}
									label="Địa chỉ chi tiết"
									variant="outlined"
									className="text-field"
									style={{ margin: "15px 0" }}
								/>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default AddressForm;
