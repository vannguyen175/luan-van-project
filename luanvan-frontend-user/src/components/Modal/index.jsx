import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import classNames from "classnames/bind";
import style from "./Modal.module.scss";
import { Padding } from "@mui/icons-material";

const cx = classNames.bind(style);

const styleModal = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	overflow: "scroll",
	maxHeight: "95%",
	display: "block",
	minWidth: 400,
	bgcolor: "background.paper",
	border: "2px solid #000",
	boxShadow: 24,
	p: "20px 30px",
	borderRadius: 2,
};

function ModalForm({
	title,
	isOpen = false,
	setIsOpen,
	isBlockClosed,
	children,
	width = 400,
	...rests
}) {
	const handleClosed = () => {
		if (isBlockClosed === true) {
			return;
		} else {
			setIsOpen(false);
		}
	};
	return (
		<Modal
			open={isOpen}
			onClose={handleClosed}
			style={{ backdropFilter: "blur(3px)" }}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={styleModal} style={(width = { width })}>
				<div className={cx("modal-header")}>{title}</div>
				<div>{children}</div>
			</Box>
		</Modal>
	);
}

export default ModalForm;
