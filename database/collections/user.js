const mongoose = require("../connect");
var userSchema = {
  name : String,
  lastname : String,
  number : Number,
  ciudad : String,
  sexo : String,
  email : String,
  password : String
};
var user = mongoose.model("user", userSchema);
module.exports = user;