function Description({ title, desc, onClick, style, important }) {
	return (
		<span onClick={onClick} style={{ margin: "5px 0", display: "block", ...style }}>
			<strong>{title}: </strong>
			<span style={{ fontWeight: important ? 700 : "normal", whiteSpace: "pre-line" }}>
				{desc}
			</span>
		</span>
	);
}

export default Description;
