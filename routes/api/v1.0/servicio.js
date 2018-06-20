var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
//var _ = require ("underscore");
var User = require("../../../database/collections/user");
var Home = require("../../../database/collections/home");
var Quarter = require("../../../database/collections/quarter");
var Img = require("../../../database/collections/img");

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
            home.gallery.push("http://192.168.43.249:7777/api/v1.0/homeimg/" + infoimg._id)
          } else {
            aux.push("http://192.168.43.249:7777/api/v1.0/homeimg/" + infoimg._id);
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
    name : req.body.name,
    lastname : req.body.lastname,
    number : req.body.email.number,
    ciudad : req.body.ciudad,
    sexo : req.body.sexo,
    email : req.body.email,
    password : req.body.password
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
// Read only one user
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
  var oficialkeys = ['name', 'altura', 'peso', 'edad', 'sexo', 'email'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
    });
    return;
  }

  var user = {
    name : req.body.name,
    lastname : req.body.lastname,
    number : req.body.email.number,
    ciudad : req.body.ciudad,
    sexo : req.body.sexo,
    email : req.body.email
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
    street : req.body.street,
    descripcion : req.body.descripcion,
    price : req.body.price,
    lat : req.body.lat,
    lon : req.body.lon,
    neighborhood : req.body.neighborhood,
    city : req.body.city,
    gallery: "",
    contact: req.body.contact
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
// Read only one user
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

router.patch(/home\/[a-z0-9]{1,}$/, (req, res) => {
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

router.put(/home\/[a-z0-9]{1,}$/, verifytoken,(req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['name', 'altura', 'peso', 'edad', 'sexo', 'email'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
    });
    return;
  }

  var user = {
    name : req.body.name,
    altura : req.body.altura,
    peso : req.body.peso,
    edad : req.body.edad,
    sexo : req.body.sexo,
    email : req.body.email
  };
  Home.findOneAndUpdate({_id: id}, user, (err, params) => {
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







module.exports = router;
