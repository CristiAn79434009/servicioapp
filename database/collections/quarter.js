const mongoose = require("../connect");
var quarterSchema = {
  departamento: String,
  nombre : String,
  latitud: String,
  longitud : String,
  zoom : String
};
var quarter = mongoose.model("quarter", quarterSchema);
module.exports = quarter;
