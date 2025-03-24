import classNames from "classnames/bind";
import style from "./CategoryButton.module.scss";
import { Link } from "react-router-dom";

const cx = classNames.bind(style);

function CategoryButton({ src, alt, type, to }) {
    return (
        <Link to={to} className={cx("container")}>
            <img src={src} alt={alt} />
            <div>{type}</div>
        </Link>
    );
}

export default CategoryButton;
