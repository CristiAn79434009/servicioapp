var express = require('express');
var router = express.Router();
var _ = require ("underscore");
var User = require("../../../database/collections/user");
var Home = require("../../../database/collections/home");
var Quarter = require("../../../database/collections/quarter");

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
    email : req.body.email
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
  if (req.body.estado == "" && req.body.oferta == "") {
    res.status(400).json({
      "msn" : "formato incorrecto"
    });
    return;
  }
  var home = {
    estado : req.body.estado,
    tipo : req.body.tipo,
    oferta : req.body.oferta,
    superficie : req.body.superficie,
    zona : req.body.zona,
    precio : req.body.precio,
    titulo: req.body.titulo,
    descripcion : req.body.descripcion
  };
  var homeData = new Home(home);

  homeData.save().then( () => {
    //content-type
    res.status(200).json({
      "msn" : "casa Registrada con exito "
    });
  });
});

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







module.exports = router;
