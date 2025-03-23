import { createContext, useContext, useEffect, useState } from "react";
import * as UserService from "../service/UserService";
import { jwtDecode } from "jwt-decode";

export const AppContext = createContext({});

export const AppProvider = ({ children }) => {
	const [token, setToken] = useState(localStorage.getItem("access_token"));
	const [user, setUser] = useState({
		id: null,
		isAdmin: null,
	});

	const getUserInfo = async () => {
		if (!token) {
			setUser({});
			return;
		}
		const decoded = jwtDecode(token);
		try {
			const res = await UserService.getDetailUser(decoded?.id, token);
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
				totalSold: res?.seller?.totalSold,
				rating: res?.seller?.rating,
			});
		} catch (error) {
			if (error.response?.data?.message === "The authemtication") {
				//refresh_token hết hạn
				localStorage.clear();
				window.location.href = "/login";
				//console.log("refresh_token hết hạn...");
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
	}, [token]);

	return <AppContext.Provider value={{ user, setUser, token, setToken }}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
