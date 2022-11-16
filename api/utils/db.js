const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.MONGODB_URL;

const Connect = async() => {
    try {
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("MongoDB connected");
    } catch (error) {
        console.log("Error in connecting mongoDB", error.message);
    }
}

module.exports = Connect;