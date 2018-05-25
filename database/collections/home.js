const mongoose = require("../connect");
var homeSchema = {

  estado : String,
  tipo : String,
  oferta : String,
  superficie : String,
  zona : String,
  precio : Number,
  titulo: String,
  descripcion : String

};
var home = mongoose.model("home", homeSchema);
module.exports = home;
