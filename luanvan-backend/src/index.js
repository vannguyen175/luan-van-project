const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes");
const db = require("../src/config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const Multer = require("multer");
const cloudinary = require("cloudinary").v2;
const socket = require("../src/config/socket");

//Connect Database
db.connect();

dotenv.config();
const port = process.env.PORT || 3001;

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
	secure: true,
});

const app = express();
app.use(cors());
var cookies = require("cookie-parser");

app.use(cookies());

app.use(bodyParser.json({ limit: "35mb" }));
routes(app);

async function handleUpload(file) {
	const res = await cloudinary.uploader.upload(file, {
		resource_type: "auto",
	});
	return res;
}

const storage = new Multer.memoryStorage();
const upload = Multer({
	storage,
});

app.post("/upload", upload.single("my_file"), async (req, res) => {
	try {
		const b64 = Buffer.from(req.file.buffer).toString("base64");
		let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
		const cldRes = await handleUpload(dataURI);
		res.json(cldRes);
	} catch (error) {
		console.log(error);
		res.send({
			message: error.message,
		});
	}
});

app.get("/", (req, res) => {
	res.send("Hello world");
});

app.listen(port, () => {
	console.log("Server is running in port", +port);
});
