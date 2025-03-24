import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

function SelectComp({ name, value, onChange, options }) {
	return (
		<FormControl fullWidth>
			<InputLabel id="demo-simple-select-label">{name}</InputLabel>
			<Select
				labelId="demo-simple-select-label"
				id="demo-simple-select"
				defaultValue={value}
				label={name}
				onChange={onChange}
			>
				{options.map((item, index) => (
					<MenuItem key={index} value={item}>
						{item}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
}

export default SelectComp;
