const userRoute = require("./UserRoute");
const productRoute = require("./ProductRoute");
const categoryRoute = require("./CategoryRoute");
const subCategoryRoute = require("./SubCategoryRoute");
const orderRoute = require("./OrderRoute");
const cartRoute = require("./CartRoute");
const notificationRoute = require("./NotificationRoute");
const orderDetailRoute = require("./OrderDetailRoute");
const analyticRoute = require("./AnalyticRoute");
const ratingRoute = require("./RatingRoute");
const paymentRoute = require("./PaymentRoute");
const messageRoute = require("./MessageRoute");

const routes = (app) => {
	app.use("/api/user", userRoute);
	app.use("/api/product", productRoute);
	app.use("/api/category", categoryRoute);
	app.use("/api/sub-category", subCategoryRoute);
	app.use("/api/order", orderRoute);
	app.use("/api/cart", cartRoute);
	app.use("/api/notification", notificationRoute);
	app.use("/api/order-detail", orderDetailRoute);
	app.use("/api/analytic", analyticRoute);
	app.use("/api/rating", ratingRoute);
	app.use("/api/payment", paymentRoute);
	app.use("/api/message", messageRoute);
};

module.exports = routes;
