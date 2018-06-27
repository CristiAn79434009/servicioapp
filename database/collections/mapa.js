const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var mapaSchema = new Schema({
  calle : String,
  descripcion : String,
  lat : Number,
  lon : Number,
  vecinos: String,
  ciudad: String,
  contact: String
});
var mapa = mongoose.model("mapa", mapaSchema);
module.exports = mapa;
