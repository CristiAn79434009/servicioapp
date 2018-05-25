const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/findhome");
module.exports = mongoose;
