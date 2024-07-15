const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoURL = process.env.MONGO_URL;
        if (!mongoURL) {
            throw new Error("MongoDB connection URI is not defined");
        }
        await mongoose.connect(mongoURL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

module.exports = connectDB;
