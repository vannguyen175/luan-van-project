import { useEffect, useState } from "react";
import * as notificationService from "~/service/NotificationService";
import Grid from "@mui/material/Grid";
import Pagination from "../Pagination";
import classNames from "classnames/bind";
import style from "./Notification.module.scss";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(style);

function NotificationPage() {
	const [notifications, setNotifications] = useState([]);
	const navigate = useNavigate();

	const [pageState, setPageState] = useState({
		page: 1,
		pageSize: 10,
		totalCount: 0,
	});

	const getNoti = async () => {
		const res = await notificationService.getNotification({
			user: localStorage.getItem("id_user"),
		});
		const dataNoti = res?.data?.info;
		console.log("dataNoti.length", pageState);

		if (dataNoti.length > 0) {
			const paginatedInfo = dataNoti.slice(
				(pageState.page - 1) * pageState.pageSize,
				pageState.page * pageState.pageSize
			);
			setNotifications(paginatedInfo);
			setPageState((prevData) => ({ ...prevData, totalCount: dataNoti.length }));
		}
	};

	useEffect(() => {
		getNoti();
	}, [pageState.page]);

	const handleClickNoti = async (info) => {
		if (info.isSeen === false) {
			//chuyển thông báo sang trạng thái "đã xem"
			await notificationService.updateNotification({
				user: localStorage.getItem("id_user"),
				infoID: info._id,
			});
			getNoti(); //cập nhật lại list thông báo
		}
		if (info.navigate === "product") {
			navigate(`/nha-ban-hang`);
		} else if (info.navigate === "order") {
			localStorage.setItem("menu_profile", "4");
			navigate(`/tai-khoan`);
		} else if (info.navigate === "seller-profile") {
			const idUser = localStorage.getItem("id_user");
			navigate(`/seller/${idUser}`);
		} else if (info.navigate === "seller-order") {
			navigate(`/nha-ban-hang`);
		}
	};

	return (
		<div className={cx("inner-content")}>
			<h4 style={{ textAlign: "center" }}>Thông báo</h4>
			{notifications?.length === 0 ? (
				<div className={cx("noNotification")}>Không có thông báo.</div>
			) : (
				<div className={cx("show-noti")}>
					{notifications?.map((item, index) => (
						<div
							key={index}
							className={cx(item.isSeen ? "" : "unSeen")}
							onClick={() => handleClickNoti(item)}
						>
							<Grid
								container
								sx={{
									alignItems: "center",
								}}
							>
								<Grid item xs={2}>
									<img src={item.image} alt="anh" />
								</Grid>

								<Grid item xs={10}>
									<span>{item.message}</span>
								</Grid>
							</Grid>
						</div>
					))}
					<Pagination pageState={pageState} setPageState={setPageState} />
				</div>
			)}
		</div>
	);
}

export default NotificationPage;
