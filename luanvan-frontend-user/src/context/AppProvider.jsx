import { createContext, useContext, useEffect, useState } from "react";
import * as UserService from "~/service/UserService";
import * as MessageService from "~/service/MessageService";
import { jwtDecode } from "jwt-decode";

export const AppContext = createContext({});

export const AppProvider = ({ children }) => {
	const [socket, setSocket] = useState();
	const [token, setToken] = useState(localStorage.getItem("access_token"));
	const [user, setUser] = useState({
		id: null,
		isAdmin: null,
	});
	const [chatbox, setChatbox] = useState([]); //danh sách người nhắn tin
	const getChatUnseen = async () => {
		if (token) {
			const decoded = jwtDecode(token);
			const res = await MessageService.getChatUnseen(decoded?.id);
			if (res.status === "SUCCESS") {
				console.log('wefewf');
				
				setChatbox([res.data.flat()[0]]);
			}
		}
	};

	const getUserInfo = async () => {
		if (!token) {
			setUser({});
			return;
		}
		const decoded = jwtDecode(token);
		try {
			const res = await UserService.getDetailUser(decoded?.id, token);
			if (res.user.blockExpireDate) {
				setUser({
					isBlocked: true,
					blockExpireDate: res.user.blockExpireDate,
					blockReason: res.user.blockReason,
				});
			} else {
				setUser({
					id: res?.user?._id,
					name: res?.user?.name,
					email: res?.user?.email,
					avatar: res?.user?.avatar || "assets/images/user-avatar.jpg",
					isAdmin: res?.user?.isAdmin,

					phone: res?.address?.phone || null,
					province: res?.address?.province || null,
					district: res?.address?.district || null,
					ward: res?.address?.ward || null,
					address: res?.address?.address || null,

					totalProduct: res?.seller?.totalProduct,
					totalSold: res?.seller?.totalSold || 0,
					rating: res?.seller?.rating,
				});
			}
		} catch (error) {
			if (error.response?.data?.message === "The authemtication") {
				//refresh_token hết hạn
				localStorage.clear();
				window.location.href = "/login";
			}
		}
	};

	UserService.axiosJWT.interceptors.request.use(
		async (config) => {
			const current = new Date();
			const decoded = jwtDecode(localStorage.getItem("access_token"));
			if (decoded?.exp < current.getTime() / 1000) {
				const data = await UserService.refreshToken();
				config.headers["Token"] = `Bearer ${data?.access_token}`;
			}
			return config;
		},
		function (error) {
			return Promise.reject(error);
		}
	);

	useEffect(() => {
		getUserInfo();
		getChatUnseen();
	}, [token]);

	// useEffect(() => {
	// 	if (chatbox.length > 0) {
	// 		localStorage.setItem("chatbox", JSON.stringify(chatbox));
	// 	}
	// }, [chatbox]);

	return (
		<AppContext.Provider
			value={{ user, setUser, token, setToken, socket, setSocket, chatbox, setChatbox }}
		>
			{children}
		</AppContext.Provider>
	);
};

export const useApp = () => useContext(AppContext);
