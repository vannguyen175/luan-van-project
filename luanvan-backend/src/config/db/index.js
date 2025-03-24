const mongoose = require("mongoose");
require("dotenv").config()

async function connect() {
    try {
        await mongoose.connect(process.env.MONGO_DB);

        console.log("Connect to database successfully!");
    } catch (error) {
        console.log(error);
    }

}

module.exports = { connect };
