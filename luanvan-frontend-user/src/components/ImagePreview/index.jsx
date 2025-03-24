import { useState } from "react";
import classNames from "classnames/bind";
import style from "./ImagePreview.module.scss";
import { Box, Modal } from "@mui/material";

const styleModal = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	bgcolor: "background.paper",
	border: "2px solid #000",
	boxShadow: 24,
	p: 2,
	borderRadius: "10px",
	textAlight: "center",
	transition: "0.2s ease",
};

const cx = classNames.bind(style);

function ImagePreview({ data }) {
	const [preview, setPreview] = useState(data[0]);

	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	return (
		<div className={cx("image-area")}>
			<div className={cx("show-image")}>
				<img onClick={handleOpen} src={preview} alt="anh-san-pham" />
			</div>
			<div className={cx("list-image")}>
				{data &&
					data.map((image, index) => (
						<img
							key={index}
							onClick={() => setPreview(image)}
							src={image}
							alt="anh-san-pham"
						/>
					))}
			</div>
			<Modal
				open={open}
				style={{ backdropFilter: "blur(10px)" }}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={styleModal}>
					<img style={{ maxWidth: 450 }} src={preview} alt="anh-san-pham" />
				</Box>
			</Modal>
		</div>
	);
}

export default ImagePreview;
