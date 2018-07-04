var express = require('express');

var multer = require('multer');
var router = express.Router();
var fs = require('fs');
//var _ = require ("underscore");
var User = require("../../../database/collections/user");
var Home = require("../../../database/collections/home");
var Quarter = require("../../../database/collections/quarter");
var Img = require("../../../database/collections/img");
var Mapa = require("../../../database/collections/mapa");


var jwt = require("jsonwebtoken");


var storage = multer.diskStorage({
  destination: "./public/avatars",
  filename: function (req, file, cb) {
    console.log("-------------------------");
    console.log(file);
    cb(null, file.originalname + "-" + Date.now() + ".jpg");
  }
});

var upload = multer({
  storage: storage
}).single("img");;


//Logeo de usuarios
router.post("/login", (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;
  var result = Home.findOne({name: username,password: password}).exec((err, doc) => {
    if (err) {
      res.status(200).json({
        msn : "No se puede concretar con la peticion "
      });
      return;
    }
    if (doc) {
      //res.status(200).json(doc);
      jwt.sign({name: doc.name, password: doc.password}, "secretkey123", (err, token) => {
          console.log(err);
          res.status(200).json({
            token : token
          });
      })
    } else {
      res.status(200).json({
        msn : "El usuario no existe ne la base de datos"
      });
    }
  });
});
//Middelware
function verifytoken (req, res, next) {
  //Recuperar el header
  const header = req.headers["authorization"];
  if (header  == undefined) {
      res.status(403).json({
        msn: "No autotizado"
      })
  } else {
      req.token = header.split(" ")[1];
      jwt.verify(req.token, "secretkey123", (err, authData) => {
        if (err) {
          res.status(403).json({
            msn: "No autotizado"
          })
        } else {
          next();
        }
      });
  }
}

router.post(/homeimg\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  upload(req, res, (err) => {
    if (err) {
      res.status(500).json({
        "msn" : "No se ha podido subir la imagen"
      });
    } else {
      var ruta = req.file.path.substr(6, req.file.path.length);
      console.log(ruta);
      var img = {
        idhome: id,
        name : req.file.originalname,
        physicalpath: req.file.path,
        relativepath: "http://localhost:7777" + ruta
      };
      var imgData = new Img(img);
      imgData.save().then( (infoimg) => {
        //content-type
        //Update User IMG
        var home = {
          gallery: new Array()
        }
        Home.findOne({_id:id}).exec( (err, docs) =>{
          //console.log(docs);
          var data = docs.gallery;
          var aux = new  Array();
          if (data.length == 1 && data[0] == "") {
            home.gallery.push("http://192.168.1.106:7777/api/v1.0/homeimg/" + infoimg._id)
          } else {
            aux.push("http://192.168.1.106:7777/api/v1.0/homeimg/" + infoimg._id);
            data = data.concat(aux);
            home.gallery = data;
          }
          Home.findOneAndUpdate({_id : id}, home, (err, params) => {
              if (err) {
                res.status(500).json({
                  "msn" : "error en la actualizacion del usuario"
                });
                return;
              }
              res.status(200).json(
                req.file
              );
              return;
          });
        });
      });
    }
  });
});



router.get(/homeimg\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  console.log(id)
  Img.findOne({_id: id}).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn": "Sucedio algun error en el servicio"
      });
      return;
    }
    //regresamos la imagen deseada
    var img = fs.readFileSync("./" + docs.physicalpath);
    //var img = fs.readFileSync("./public/avatars/img.jpg");
    res.contentType('image/jpeg');
    res.status(200).send(img);
  });
});



//CRUD Create, Read, Update, Delete
//Creation of users

//creacion de nuevo usuario
router.post("/user", (req, res) => {
  //Ejemplo de validacion
  if (req.body.name == "" && req.body.email == "") {
    res.status(400).json({
      "msn" : "formato incorrecto"
    });
    return;
  }
  var user = {

    nombre : req.body.nombre,
    apellido : req.body.apellido,
    correo : req.body.correo,
    numTelefono : req.body.numTelefono,
    ciudad : req.body.ciudad,
    direccion : req.body.direccion,
    contraseña : req.body.contraseña

  };
  var userData = new User(user);

  userData.save().then( () => {
    //content-type
    res.status(200).json({
      "msn" : "usuario Registrado con exito "
    });
  });
});

router.get("/user", (req, res, next) => {
  User.find({}).exec( (error, docs) => {
    res.status(200).json(docs);
  })
});


// mostrando usuarios creados
router.get(/user\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  User.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(200).json({
      "msn" : "No existe el recurso "
    });
  })
});
router.delete(/user\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  User.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});

router.patch(/user\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var user = {};
  for (var i = 0; i < keys.length; i++) {
    user[keys[i]] = req.body[keys[i]];
  }
  console.log(user);
  User.findOneAndUpdate({_id: id}, user, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});

router.put(/user\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['nombre', 'apellido', 'correo', 'numTelefono', 'ciudad', 'direccion', 'contraseña'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
    });
    return;
  }

  var user = {

        nombre : req.body.nombre,
        apellido : req.body.apellido,
        correo : req.body.correo,
        numTelefono : req.body.numTelefono,
        ciudad : req.body.ciudad,
        direccion : req.body.direccion,
        contraseña : req.body.contraseña

  };
  User.findOneAndUpdate({_id: id}, user, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});

//creacion de una casa
router.post("/home", (req, res) => {
  //Ejemplo de validacion
  if (req.body.name == "" && req.body.email == "") {
    res.status(400).json({
      "msn" : "formato incorrecto"
    });
    return;
  }
  var home = {

    tipo : req.body.tipo,
    estado : req.body.estado,
    precio : req.body.precio,
    ciudad : req.body.ciudad,
    descripcion : req.body.descripcion,
    cantCuartos : req.body.cantCuartos,
    cantBaños : req.body.cantBaños,
    superficie : req.body.superficie,
    lat : req.body.lat,
    lon : req.body.lon,
    gallery: req.body.gallery,
    imagen : req.body.image,

  };
  var homeData = new Home(home);

  homeData.save().then( (rr) => {
    //content-type
    res.status(200).json({
      "id" : rr._id,
      "msn" : "casa Registrado con exito "
    });
  });
});;


router.get("/home", (req, res, next) => {
  Home.find({}).exec( (error, docs) => {
    res.status(200).json(docs);
  })
});
// listamos las casas
router.get(/home\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Home.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(200).json({
      "msn" : "No existe el recurso "
    });
  })
});

router.delete(/home\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Home.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
    });
});





//registro de zonas
router.post("/quarter", (req, res) => {
  //Ejemplo de validacion
  if (req.body.latitud == "" && req.body.longitud == "") {
    res.status(400).json({
      "msn" : "formato incorrecto"
    });
    return;
  }
  var quarter = {
    departamento: req.body.departamento,
    nombre : req.body.nombre,
    latitud: req.body.latitud,
    longitud : req.body.longitud,
    zoom : req.body.zoom
  };
  var quarterData = new Quarter(quarter);

  quarterData.save().then( () => {
    //content-type
    res.status(200).json({
      "msn" : "barrio Registrado con exito "
    });
  });
});

//muestra los zonas creados
router.get("/quarter", (req, res, next) => {
  Quarter.find({}).exec( (error, docs) => {
    res.status(200).json(docs);
  })
});
// Read only one user
router.get(/quarter\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Quarter.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(200).json({
      "msn" : "No existe el recurso "
    });
  })
});

router.delete(/quarter\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Quarter.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
    });
});

//mapas
router.post(/mapa\/[a-z0-9]{1,}$/, (req, res) => {
  var url= req.url;
  var id = url.split("/")[2];
  //Ejemplo de validacion
  if (req.body.name == "" && req.body.email == "") {
    res.status(400).json({
      "msn" : "formato incorrecto"
    });
    return;
  }
  var mapa = {
    calle : req.body.street,
    descripcion : req.body.descripcion,
    lat : req.body.lat,
    lon : req.body.lon,
    vecinos : req.body.neighborhood,
    ciudad : req.body.city,
    contact: req.body.contact
  };
  var mapaData = new Mapa(mapa);

  mapaData.save().then( (rr) => {

    var mp = {
      ubicacion: new Array()
    }
    Inmuebles.findOne({_id:id}).exec( (error, docs) => {
      var dt = docs.ubicacion;
      var aux = new Array();
      if (dt.length == 1 && dt[0] == ""){
        mp.ubicacion.push("/api/v1.0/mapa/")
      }
      else {
        aux.push("/api/v1.0/mapa/");
        dt = dt.concat(aux);
        mp.ubicacion = dt;
      }
      Inmuebles.findOneAndUpdate({_id : id}, mp, (err, params) => {
          if(err){
            res.status(500).json({
              "msn" : "error"
            });
            return;
          }
          res.status(200).json(req.file);
          return;
      });
    });
    //content-type
    res.status(200).json({
      "id" : rr._id,
      "msn" : "mapa Registrado con exito "
    });
  });
});

//recuperar el array de la mapa
router.get(/mapa\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  console.log(id)
  Mapa.findOne({_id: id}).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn": "Sucedio algun error en el servicio"
      });
      return;
    }
    else{
          res.status(200).json({docs});
    }
  });
});


module.exports = router;
