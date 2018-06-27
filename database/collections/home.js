const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var homeSchema = new Schema ({

    tipo : String,
    estado : String,
    precio : String,
    ciudad : String,
    descripcion : String,
    cantCuartos : String,
    cantBaños : String,
    superficie : String,
    lat : Number,
    lon : Number,
    gallery: Array,
    imagen : Array,



});
var home = mongoose.model("home", homeSchema);
module.exports = home;
