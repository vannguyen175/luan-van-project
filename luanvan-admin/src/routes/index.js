import UpdateAccount from "../pages/AccountPage/UpdateAccount";
import AccountPage from "../pages/AccountPage/index.jsx";

import ProductPage from "../pages/ProductPage/index.jsx";
import CategoryPage from "../pages/CategoryPage/index.jsx";
import AnalyticPage from "../pages/AnalyticPage/index.jsx";
import SellerPage from "../pages/SellerPage/index.jsx";
import SellerDetail from "../pages/SellerPage/SellerDetail.jsx";
import NotFoundPage from "../pages/NotFoundPage";

import MainLayout from "../layouts/MainLayout";
import LoginLayout from "../layouts/LoginLayout";
import { Fragment } from "react";
import LoginPage from "../pages/LoginPage";

export const routes = [
	{
		path: "account/update-account/:id",
		page: UpdateAccount,
		layout: MainLayout,
	},
	{
		path: "/",
		page: AccountPage,
		layout: MainLayout,
	},
	{
		path: "/account",
		page: AccountPage,
		layout: MainLayout,
	},

	{
		path: "/product",
		page: ProductPage,
		layout: MainLayout,
	},

	{
		path: "/category",
		page: CategoryPage,
		layout: MainLayout,
	},
	{
		path: "/analytic",
		page: AnalyticPage,
		layout: MainLayout,
	},
	{
		path: "/seller",
		page: SellerPage,
		layout: MainLayout,
	},
	{
		path: "/seller-detail/:id",
		page: SellerDetail,
		layout: MainLayout,
	},
	{
		path: "/login",
		page: LoginPage,
		layout: LoginLayout,
	},
	{
		path: "*",
		page: NotFoundPage,
		layout: Fragment,
	},
];
