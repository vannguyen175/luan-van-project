import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import classNames from "classnames/bind";
import style from "./Result.module.scss";
import { Link } from "react-router-dom";

const cx = classNames.bind(style);

function Result({ type, message, subMessage, backBtn, stayBtn }) {
	return (
		<div className={cx("container")}>
			<div>
				{type == "success" && (
					<div>
						<CheckCircleIcon className={cx("icon-sucess")} />
						<p className={cx("message")}>{message}</p>
						<p className={cx("sub-message")}>{subMessage}</p>
					</div>
				)}
				{type == "error" && (
					<div>
						<ErrorIcon className={cx("icon-error")} />
						<p className={cx("message")}>{message}</p>
						<p className={cx("sub-message")}>{subMessage}</p>
					</div>
				)}
				<div style={{ marginTop: 50 }}>
					{backBtn && (
						<Link to={backBtn} className={cx("button")}>
							Quay về
						</Link>
					)}
					{stayBtn && (
						<button onClick={() => window.location.reload()} className={cx("button")}>
							Tải lại trang
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

export default Result;
