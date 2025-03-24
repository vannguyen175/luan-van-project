import classNames from "classnames/bind";
import style from "./Notification.module.scss";
import * as notificationService from "~/service/NotificationService";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import socket from "../../socket";

const cx = classNames.bind(style);

function Notification() {
	const [notifications, setNotifications] = useState([]);
	const [anchorEl, setAnchorEl] = useState(null);
	const [unseenCount, setUnseenCount] = useState(null);
	const navigate = useNavigate();

	const getNoti = async () => {
		const res = await notificationService.getNotification({
			user: localStorage.getItem("id_user"),
		});
		const dataNoti = res?.data?.info;

		if (Array.isArray(dataNoti) && dataNoti.length > 0) {
			const paginatedInfo = dataNoti.slice(0, 5);
			setNotifications(paginatedInfo);
		}

		setUnseenCount(res.unseenCount || 0);
	};

	useEffect(() => {
		getNoti();

		socket.on("connect", () => {
			const handleNotification = (data) => {
				setUnseenCount(data.unseenCount);
			};
			socket.on("getNotification", handleNotification);
			return () => {
				socket.off("getNotification", handleNotification);
			};
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleShowNotification = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const open = Boolean(anchorEl);
	const id = open ? "simple-popover" : undefined;

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
			localStorage.setItem("menu_profile", "3");
			navigate(`/tai-khoan`);
		} else if (info.navigate === "seller-profile") {
			const idUser = localStorage.getItem("id_user");
			navigate(`/seller/${idUser}`);
		} else if (info.navigate === "seller-order") {
			navigate(`/nha-ban-hang`);
		}
		setAnchorEl(null);
	};

	const handleDetailPage = () => {
		setAnchorEl(null);
		navigate("/thong-bao");
	};

	return (
		<div className={cx("notification-icon")}>
			<Badge
				badgeContent={unseenCount > 0 ? unseenCount : 0}
				invisible={unseenCount === 0}
				color="primary"
				className={cx("icon-button")}
			>
				<NotificationsIcon onClick={handleShowNotification} />
			</Badge>
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={() => {
					setAnchorEl(null);
				}}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				PaperProps={{
					style: {
						padding: "5px",
						borderRadius: "8px",
						boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
					},
				}}
			>
				<div>
					<h4 style={{ margin: "5px 0 10px 10px" }}>Thông báo</h4>
					{notifications?.length === 0 ? (
						<div className={cx("noNotification")}>Không có thông báo.</div>
					) : (
						<div className={cx("haveNotification")}>
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
							<div className={cx("more-detail")} onClick={handleDetailPage}>
								Xem thêm
							</div>
						</div>
					)}
				</div>
			</Popover>
		</div>
	);
}

export default Notification;
