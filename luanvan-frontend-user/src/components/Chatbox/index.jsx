import classNames from "classnames/bind";
import style from "./Chatbox.module.scss";
import { useEffect, useRef, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import * as UserService from "~/service/UserService";
import * as MessageService from "~/service/MessageService";
import socket from "../../socket";
import { useApp } from "~/context/AppProvider";
import ClearIcon from "@mui/icons-material/Clear";
import RemoveIcon from "@mui/icons-material/Remove";
import CircularProgress from "@mui/material/CircularProgress";

const cx = classNames.bind(style);

function Chatbox() {
	const idUser = localStorage.getItem("id_user");
	const { chatbox, setChatbox } = useApp(); //chatbox: mảng chứa id người nhận tin nhắn

	const [openChat, setOpenChat] = useState(); //mở hộp hội thoại chứa id người chat
	const [mess, setMess] = useState([]);
	const [userOnMess, setUserOnMess] = useState();
	const [receiveInfo, setReceiveInfo] = useState([]);

	const messagesEnd = useRef();
	const msgRef = useRef();

	const getInfoReceiver = async (idUser) => {
		try {
			if (idUser) {
				const res = await UserService.getInfoUser(idUser);
				setUserOnMess({
					id: res.data.user,
					avatar: res.data.avatar,
					name: res.data.name,
				});
			}
			if (chatbox.length > 0) {
				console.log("checkchatbox", chatbox);
				
				const responses = await Promise.all(
					chatbox.map((id) => UserService.getInfoUser(id))
				);
				const validResponses = responses
					.filter((res) => res.status === "OK")
					.map((res) => ({
						id: res.data.user,
						avatar: res.data.avatar,
					}));
				setReceiveInfo(validResponses);
			}
		} catch (error) {
			console.error("Error fetching receiver info:", error);
		}
	};

	const getDataChat = async (idUser, openChat) => {
		const res = await MessageService.getChat(idUser, openChat);
		if (res.status === "SUCCESS") {
			setMess(res.data.message);
		} else {
			setMess([]);
		}
	};

	useEffect(() => {
		if (chatbox?.length > 0) {
			//lấy tên, avatar người nhận message
			getInfoReceiver();
		}
		if (openChat) {
			setUserOnMess();
			getDataChat(idUser, openChat);
			getInfoReceiver(openChat);
		}
	}, [openChat, chatbox]);

	useEffect(() => {
		//lắng nghe sự kiện phía server
		socket.on("sendMessageServer", (dataGot) => {
			setMess((oldMsgs) => [...oldMsgs, dataGot.data]);
			scrollToBottom();
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const sendMessage = () => {
		const message = msgRef.current.value.trim();
		if (message !== null && message !== "") {
			const msg = {
				content: message,
				sender: idUser, //id người gửi
				receiver: chatbox, //id người nhận
			};
			setMess((oldMsgs) => [...oldMsgs, msg]);
			socket.emit("sendMessageClient", msg);
			msgRef.current.value = null;
		}
	};

	const scrollToBottom = () => {
		if (openChat) {
			messagesEnd.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	const renderMess = mess?.map((m, index) => (
		<div
			key={index}
			className={cx(m.sender === idUser ? "your-message" : "other-people", "chat-item")}
		>
			{m.content}
		</div>
	));

	const onEnterPress = (e) => {
		if (e.keyCode === 13 && e.shiftKey === false) {
			sendMessage();
		}
	};

	const closeChat = () => {
		const data = chatbox?.filter((item) => item !== openChat);
		setChatbox(data);
		setOpenChat();
	};

	// useEffect(() => {
	// 	if (chatbox.length > 0) {
	// 		localStorage.setItem("chatbox", JSON.stringify(chatbox));
	// 	}
	// }, [chatbox]);

	return (
		<div>
			<div className={cx("popup")}>
				{receiveInfo.length > 0 &&
					receiveInfo?.map((item, index) => (
						<div key={index} className={cx("item")}>
							{item.isSeen && <span className={cx("status-unseen")}></span>}
							<img
								onClick={() => setOpenChat(item.id)}
								className={cx("avatar", "animate__animated", "animate__pulse ")}
								src={item.avatar}
								alt=""
							/>
						</div>
					))}
			</div>

			{openChat && (
				<div className={cx("box-chat")}>
					<div className={cx("header")}>
						{userOnMess ? (
							<>
								<img src={userOnMess.avatar} alt="avatar" />
								{userOnMess.name}
							</>
						) : (
							<CircularProgress color="inherit" size={25} />
						)}

						<ClearIcon className={cx("close-chat")} onClick={closeChat} />
						<RemoveIcon className={cx("hide-chat")} onClick={() => setOpenChat()} />
					</div>
					<div className={cx("box-chat_message")}>
						{renderMess}
						<div style={{ float: "left", clear: "both" }} ref={messagesEnd}></div>
					</div>

					<div className={cx("send-box")}>
						<textarea
							ref={msgRef}
							onKeyDown={onEnterPress}
							placeholder="Nhập tin nhắn ..."
						/>

						<button onClick={sendMessage}>
							<SendIcon />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default Chatbox;
