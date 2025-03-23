function Description({ title, desc, important, success }) {
	const spanStyle = {};
	if (important) {
		spanStyle.color = "red";
	}
	if (success) {
		spanStyle.color = "green";
	}

	return (
		<p style={{ margin: "10px 0" }}>
			<strong>{title}: </strong>
			<span style={spanStyle}>{desc}</span>
		</p>
	);
}

export default Description;
