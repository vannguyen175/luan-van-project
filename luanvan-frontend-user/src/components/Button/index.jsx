import { Link } from "react-router-dom";
import style from "./Button.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

function Button({
	styleBtn,
	to,
	href,
	primary,
	chosenBtn,
	children,
	onClick,
	button,
	disabled,
	danger,
	...passProps
}) {
	let Comp = "button";
	const props = {
		onClick,
		...passProps,
	};
	if (to) {
		props.to = to;
		Comp = Link;
	} else if (href) {
		props.href = href;
		Comp = "a";
	}
	const classes = cx("wrapper", "button", {
		"chosen-btn": chosenBtn,
		"primary-btn": primary,
		button: button,
		disabled: disabled,
		danger: danger,
	});
	return (
		<Comp style={{ ...styleBtn }} className={classes} onClick={onClick}>
			{children}
		</Comp>
	);
}

export default Button;
