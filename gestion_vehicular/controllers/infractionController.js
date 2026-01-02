const connection = require("../configs/db");
const uuid = require("uuid");

exports.showInfractions = async (id) => {
  try {
    const sql = `SELECT U.nombre, U.ap1, U.ap2, V.placa, I.fecha, I.hora, I.costo, U.foto FROM infracciones as I
    INNER JOIN usuarios as U ON U.idUsuario = I.idUsuario
    INNER JOIN vehiculos as V ON V.num_economico = I.num_economico
    WHERE I.num_economico = ?`;

    const [infractions] = await connection.query(sql, [id]);

    return infractions;
  } catch (error) {
    console.log(error);
  }
};

exports.showAssignInfo = async (id) => {
  try {
    const sql = `SELECT asignaciones.idUsuario, usuarios.nombre, usuarios.ap1 FROM asignaciones
    INNER JOIN usuarios ON usuarios.idUsuario = asignaciones.idUsuario
    WHERE asignaciones.num_economico = ?`;
    const [assignment] = await connection.query(sql, [id]);

    return assignment[0];
  } catch (error) {
    console.log(error);
  }
};

exports.registerInfraction = async (req, res) => {
  const { vehicleId, userId, date, time, cost } = req.body;
  try {
    await connection.query("INSERT INTO infracciones SET ? ", {
      idInfraccion: uuid.v4(),
      num_economico: vehicleId,
      idUsuario: userId,
      fecha: date,
      hora: time,
      costo: cost,
    });

    console.log("INFRACCION REGISTRADA");

    res.redirect("/admin/infracciones/" + vehicleId);
  } catch (error) {
    console.log(error);
    res.status(500).send("ERROR AL REGISTRAR LA INFRACCION");
  }
};
