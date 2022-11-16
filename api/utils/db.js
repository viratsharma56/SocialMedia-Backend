const mongoose = require('mongoose');

const Connect = async(val) => {
    try {
        await mongoose.connect(val, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("MongoDB connected");
    } catch (error) {
        console.log("Error in connecting mongoDB", error.message);
    }
}

module.exports = Connect;