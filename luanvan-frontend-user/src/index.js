import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ToastContainer, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AppProvider } from "~/context/AppProvider";

const theme = createTheme({
	palette: {
		primary: {
			main: "#419366",
		},
	},
});

const contextClass = {
	success: "#419366",
	error: "bg-red-600",
	info: "bg-gray-600",
	warning: "bg-orange-400",
};

// const root = ReactDOM.createRoot(document.getElementById("root"));
const root = ReactDOM.createRoot(document.getElementById("root"));
// Create a client
root.render(
	<ThemeProvider theme={theme}>
		<AppProvider>
			<ToastContainer
				hideProgressBar
				position="top-center"
				transition={Flip}
				autoClose={2000}
				theme="colored"
			/>
			<App />
		</AppProvider>
	</ThemeProvider>
);
reportWebVitals();
