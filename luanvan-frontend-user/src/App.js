import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { routes } from "./routes";
import NotFoundPage from "~/pages/NotFoundPage/NotFoundPage";
import ScrollToTop from "./scrollToTop";
import { gapi } from "gapi-script";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useApp } from "./context/AppProvider";
import Chatbox from "./components/Chatbox";
import socket from "./socket";

const clientID = "105139517728-qa77n1q8768ek3tpmi2thvd94p2lqqdh.apps.googleusercontent.com";

export function App() {
	const { chatbox, setChatbox } = useApp();

	//console.log("chatbox", chatbox);

	//login with google
	useEffect(() => {
		function start() {
			gapi.client.init({
				clientID: clientID,
				scope: "",
			});
		}
		gapi.load("client:auth2", start);
	}, []);

	useEffect(() => {
		socket.on("sendID", (dataGot) => {
			console.log("idsocket", dataGot);
		});

		//lắng nghe sự kiện phía server
		socket.on("sendMessageServer", (dataGot) => {
			// if (!chatbox.includes(dataGot.data.sender)) {
			// 	setChatbox((prevData) => [...prevData, dataGot.data.sender]);
			// }
			if (chatbox.length === 0) {
				setChatbox([dataGot.data.sender]);
			}
		});
	}, []);

	return (
		<div>
			<GoogleOAuthProvider clientId={clientID}>
				<Router>
					<ScrollToTop />
					<Routes>
						{routes.map((route, index) => {
							let Page = route.page;
							const Layout = route.layout;
							const isCheckAuth = !route.isPrivate;
							return (
								<Route
									key={index}
									exact
									path={isCheckAuth === true ? route.path : "*"}
									element={
										<Layout>
											{isCheckAuth === true ? <Page /> : <NotFoundPage />}
											{chatbox?.length > 0 && <Chatbox />}
										</Layout>
									}
								/>
							);
						})}
					</Routes>
				</Router>
			</GoogleOAuthProvider>
		</div>
	);
}

export default App;
