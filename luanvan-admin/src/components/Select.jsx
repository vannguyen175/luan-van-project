import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function SelectBasic({ label, data, onChange, value }) {
	return (
		<FormControl style={{ width: "95%", margin: "15px 0px" }}>
			<InputLabel id="demo-simple-select-label">{label}</InputLabel>
			<Select
				labelId="demo-simple-select-label"
				id="demo-simple-select"
				label={label}
				onChange={onChange}
				defaultValue={value}
			>
				{data &&
					data.map((value, index) => (
						<MenuItem key={index} value={value.name}>
							{value.name}
						</MenuItem>
					))}
			</Select>
		</FormControl>
	);
}
