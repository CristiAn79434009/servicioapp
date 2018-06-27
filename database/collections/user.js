const mongoose = require("../connect");
var userSchema = {
  nombre : String,
  apellido : String,
  correo : String,
  numTelefono : Number,
  ciudad : String,
  direccion : String,
  contraseña : String
};
var user = mongoose.model("user", userSchema);
module.exports = user;
