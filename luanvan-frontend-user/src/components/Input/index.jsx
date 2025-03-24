import Grid from "@mui/material/Grid";

function InputComp({ label, placeholder, type, textarea, innerRef, name, onChange, value }) {
	let Comp = "input";
	if (textarea) {
		Comp = "textarea";
	}
	return (
		<>
			<Grid item xs={2} justify="flex-start">
				<span>{label}:</span>
			</Grid>
			<Grid item xs={9}>
				<Comp
					name={name}
					onChange={onChange}
					ref={innerRef}
					type={type}
					placeholder={placeholder}
					defaultValue={value}
				/>
			</Grid>
		</>
	);
}

export default InputComp;
