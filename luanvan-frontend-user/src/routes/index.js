import Home from "~/pages/Home/Home";
import Products from "~/pages/Products/Products";
import DetailProduct from "~/pages/DetailProduct/DetailProduct";
import NotFoundPage from "~/pages/NotFoundPage/NotFoundPage";
import UserLayout from "~/layouts/userLayouts/userLayout";
import NoneFooterLayout from "../layouts/noneFooterLayout/noneFooterLayout";
import SellerLayout from "../layouts/sellerLayout";
import OrderProduct from "../pages/OrderProduct/OrderProduct";
import Cart from "../pages/Cart/Cart";
import NotificationPage from "../components/Notification/NotificationPage";

import { Fragment } from "react";
import Profile from "~/pages/Profile";
import Login from "~/pages/Login/Login";
import Register from "~/pages/Register/Register";
import PostingProduct from "../pages/PostingProduct/PostingProduct";
import ForSeller from "../pages/ForSellerMenu";
import SellerHomePage from "../pages/SellerHomePage";
import Payment from "../pages/OrderProduct/Payment";
import PaymentResult from "../pages/OrderProduct/PaymentResult";
import BlockAccount from "../pages/BlockAccount";

export const routes = [
	{
		path: "/",
		page: Home,
		layout: UserLayout,
	},
	{
		path: "/san-pham/:slug_category",
		page: Products,
		layout: UserLayout,
	},
	{
		path: "/detail-product/:id",
		page: DetailProduct,
		layout: UserLayout,
	},
	{
		path: "/seller/:id",
		page: SellerHomePage,
		layout: UserLayout,
	},
	{
		path: "/dat-hang",
		page: OrderProduct,
		layout: NoneFooterLayout,
	},
	{
		path: "/dat-hang/:id/:quantity",
		page: OrderProduct,
		layout: NoneFooterLayout,
	},
	{
		path: "/payment-vnpay",
		page: Payment,
		layout: NoneFooterLayout,
	},
	{
		path: "/payment-vnpay/result",
		page: PaymentResult,
		layout: Fragment,
	},
	{
		path: "/gio-hang/:id",
		page: Cart,
		layout: UserLayout,
	},
	{
		path: "/tai-khoan",
		page: Profile,
		layout: UserLayout,
	},
	{
		path: "/thong-bao",
		page: NotificationPage,
		layout: UserLayout,
	},
	{
		path: "/nha-ban-hang",
		page: ForSeller,
		layout: SellerLayout,
	},
	{
		path: "/login",
		page: Login,
		layout: NoneFooterLayout,
	},
	{
		path: "/register",
		page: Register,
		layout: NoneFooterLayout,
	},
	{
		path: "/dang-tin",
		page: PostingProduct,
		layout: SellerLayout,
	},

	{
		path: "/block-account",
		page: BlockAccount,
		layout: Fragment,
	},
	{
		path: "*",
		page: NotFoundPage,
		layout: Fragment,
	},
];
