import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import classNames from "classnames/bind";
import style from "./Modal.module.scss";

const cx = classNames.bind(style);

const styleModal = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	minWidth: 400,
	bgcolor: "background.paper",
	border: "2px solid #000",
	boxShadow: 24,
	p: "20px 30px",
	borderRadius: 2,
};

function ModalForm({ title, isOpen = false, setIsOpen, children, width = 400, ...rests }) {
	return (
		<Modal
			open={isOpen}
			onClose={() => setIsOpen(false)}
			style={{ backdropFilter: "blur(3px)" }}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={styleModal} style={{ width }}>
				<div className={cx("modal-header")}>{title}</div>
				<div>{children}</div>
			</Box>
		</Modal>
	);
}

export default ModalForm;
