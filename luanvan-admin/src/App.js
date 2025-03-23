import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { routes } from "./routes";
import NotFoundPage from "./pages/NotFoundPage";

export function App() {
	const getisAdminString = localStorage.getItem("isAdmin");
	const isAdmin = getisAdminString?.toLowerCase?.() === "true"; //convert string to boolean
	return (
		<div>
			<Router>
				<Routes>
					{routes.map((route, index) => {
						let Page = route.page;
						const Layout = route.layout;
						const isCheckAuth = !route.isPrivate || Boolean(isAdmin);
						return (
							<Route
								exact
								key={index}
								path={isCheckAuth === true ? route.path : "*"}
								element={<Layout>{isCheckAuth === true ? <Page /> : <NotFoundPage />}</Layout>}
							/>
						);
					})}
				</Routes>
			</Router>
		</div>
	);
}

export default App;
