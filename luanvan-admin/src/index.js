import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ToastContainer, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { viVN } from "@mui/material/locale";
import { AppProvider } from "./context/AppProvider";

const theme = createTheme({
	palette: {
		primary: {
			main: "#d78d3a",
		},
	},
	viVN,
});
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<ThemeProvider theme={theme}>
		<AppProvider>
			<App />
			<ToastContainer hideProgressBar position="top-center" transition={Flip} autoClose={2000} />
		</AppProvider>
	</ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
