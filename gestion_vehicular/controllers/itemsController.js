const jwt = require("jsonwebtoken");
const connection = require("../configs/db.js");
const multer = require("multer");
const path = require("path");
const { promisify } = require("util");

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/vehicles-img/"); // Carpeta de destino
  },
  filename: function (req, file, cb) {
    cb(null, "UNIDAD CFE - " + Date.now() + path.extname(file.originalname));
  },
});

exports.upload = multer({ storage: storage });

// Para mostrar todos los datos disponibles en vehiculos

exports.getAllItems = async () => {
  try {
    const [items] = await connection.query("SELECT * FROM vehiculos");
    return items;
  } catch (error) {
    throw new Error("Error al obtener los datos");
  }
};

exports.searchItem = async (req, res) => {
  try {
    const { num } = req.body;
    const [items] = await connection.query(
      "SELECT * FROM vehiculos WHERE num_economico LIKE ?",
      [num]
    );

    res.render('admin views/search', { items })
  } catch (error) {
    throw new Error("Error al obtener los datos");
  }
};

exports.getItemById = async (id) => {
  try {
    const sqlVehicle = `SELECT * FROM vehiculos
    INNER JOIN propietario_vehiculo ON propietario_vehiculo.idPropietario = vehiculos.idPropietario
    WHERE num_economico = ?`;

    const sqlDetail = `SELECT V.estado_fisico, C.nivel, N.estadoN1, N.estadoN2, N.estadoN3, N.estadoN4
    FROM vehiculos as V
    INNER JOIN neumaticos as N ON V.num_economico = N.num_economico
    INNER JOIN combustible as C ON V.num_economico = C.num_economico
    WHERE V.num_economico = ?`;

    const [vehicle] = await connection.query(sqlVehicle, [id]);
    const [detail] = await connection.query(sqlDetail, [id]);
    return {
      vehicle: vehicle[0],
      detail: detail[0],
    };
  } catch (error) {
    console.error("Error al obtener el vehiculo:", error);
    res.status(500).send("Error al obtener el vehiculo.");
  }
};

// Para registrar nuevos vehiculos
exports.register = async (req, res) => {
  try {
    const {
      eco_number,
      plate,
      serial_number,
      engine_number,
      brand,
      sub_brand,
      description,
      model,
      cilinder,
      transmision,
      propertary,
      physical_state,
      situation,
    } = req.body;

    const filePath = req.file
      ? `/uploads/vehicles-img/${req.file.filename}`
      : "/uploads/SIN_IMAGEN.jpg"; // agregar una imagen por defecto si no se selecciona alguna

    await connection.query("INSERT INTO vehiculos SET ?", {
      num_economico: eco_number,
      marca: brand,
      submarca: sub_brand,
      descripcion: description,
      modelo: model,
      placa: plate,
      situacion: situation,
      estado_fisico: physical_state,
      num_serie: serial_number,
      num_motor: engine_number,
      cilindros: cilinder,
      transmision: transmision,
      idPropietario: propertary,
      foto_unidad: filePath,
    });

    console.log("DATOS DE VEHICULO AGREGADOS");
    res.redirect("/admin/registrar-vehiculo");
  } catch (error) {
    console.log(error);
  }
};

exports.updateInfo = async (req, res) => {
  try {
    const {
      eco_number,
      plate,
      serial_number,
      engine_number,
      brand,
      sub_brand,
      description,
      model,
      cilinder,
      transmision,
      propertary,
      physical_state,
      situation,
    } = req.body;

    const sql = `UPDATE vehiculos SET  
                  marca = ?, 
                  submarca = ?, 
                  descripcion = ?, 
                  modelo = ?, 
                  placa = ?, 
                  situacion = ?,
                  estado_fisico = ?,
                  num_serie = ?,
                  num_motor = ?,
                  cilindros = ?,
                  transmision = ?,
                  idPropietario = ?
                  WHERE num_economico = ?`;

    await connection.query(sql, [
      brand,
      sub_brand,
      description,
      model,
      plate,
      situation,
      physical_state,
      serial_number,
      engine_number,
      cilinder,
      transmision,
      propertary,
      eco_number,
    ]);

    console.log("INFORMACION DE VEHICULO ACTUALIZADA CORRECTAMENTE");
    res.redirect("/admin/");
  } catch (error) {
    console.log(error);
  }
};

exports.updateImage = async (req, res) => {
  try {
    const id = req.params.id;
    const filePath = `/uploads/vehicles-img/${req.file.filename}`;

    const sql = `UPDATE vehiculos SET
    foto_unidad = ?
    WHERE num_economico = ?`;

    await connection.query(sql, [filePath, id]);
    console.log("FOTO DE VEHICULO ACTUALIZADA CORRECTAMENTE");
    res.redirect("/admin/");
  } catch (error) {
    console.log(error);
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    await connection.query("DELETE FROM vehiculos where num_economico = ?", [
      id,
    ]);

    res.redirect("/admin/");
    console.log("ITEM ELIMINADO CON EXITO");
  } catch (error) {
    console.log(error);
  }
};

exports.audit = async (req, res) => {
  const id = req.params.id;

  try {
    const {
      physical_state,
      fuel_level,
      neumatic1,
      neumatic2,
      neumatic3,
      neumatic4,
    } = req.body;

    await connection.query("CALL spAuditoriaVehiculo(?, ?, ?, ?, ?, ?, ?)", [
      id,
      physical_state,
      fuel_level,
      neumatic1,
      neumatic2,
      neumatic3,
      neumatic4,
    ]);

    console.log("AUDITORIA REALIZADA CON EXITO");
    res.redirect("/admin/");
  } catch (error) {
    console.log(error);
  }
};
