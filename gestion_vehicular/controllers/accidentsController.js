const connection = require("../configs/db");
const uuid = require("uuid");

exports.showAccidents = async (id) => {
  try {
    const sql = `SELECT U.nombre, U.ap1, U.ap2, V.placa, A.fecha, A.hora, U.foto FROM accidentes as A
    INNER JOIN usuarios as U ON U.idUsuario = A.idUsuario
    INNER JOIN vehiculos as V ON V.num_economico = A.num_economico
    WHERE A.num_economico = ?`;

    const [accidents] = await connection.query(sql, [id]);

    return accidents;
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

exports.registerAccident = async (req, res) => {
  const { vehicleId, userId, date, time, cost } = req.body;
  try {
    await connection.query("INSERT INTO accidentes SET ? ", {
      idAccidente: uuid.v4(),
      num_economico: vehicleId,
      idUsuario: userId,
      fecha: date,
      hora: time,
    });

    console.log("ACCIDENTE REGISTRADO");

    res.redirect("/admin/accidentes/" + vehicleId);
  } catch (error) {
    console.log(error);
    res.status(500).send("ERROR AL REGISTRAR EL ACCIDENTE");
  }
};
