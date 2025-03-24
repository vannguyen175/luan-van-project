import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { useNavigate, useLocation } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

function DropdownMenu({ title, listActions, category }) {
	const navigate = useNavigate();
	const location = useLocation();

	const handleClick = (item) => {
		if (category) {
			navigate(`/san-pham/${item.to || item.slug}`);
			if (location.pathname.includes("san-pham")) {
				navigate(0); //reload page
			}
		} else {
			navigate(item.to);
			if (location.pathname.includes("san-pham")) {
				navigate(0); //reload page
			}
		}
	};
	return (
		<PopupState variant="popover">
			{(popupState) => (
				<>
					<Button {...bindTrigger(popupState)}>
						{title}
						<KeyboardArrowDownIcon style={{ marginLeft: "3px" }} />
					</Button>
					<Menu {...bindMenu(popupState)}>
						{listActions?.map((item, index) => (
							<div onClick={() => handleClick(item)} key={index}>
								<MenuItem key={index} onClick={popupState.close}>
									{item.name}
								</MenuItem>
							</div>
						))}
					</Menu>
				</>
			)}
		</PopupState>
	);
}

export default DropdownMenu;
