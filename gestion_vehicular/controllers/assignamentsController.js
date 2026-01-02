const connection = require("../configs/db");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

exports.showAssignaments = async (req, res) => {
  try {
    const sqlUsuarios = `SELECT * FROM usuarios
                          WHERE idUsuario NOT IN (SELECT idUsuario FROM asignaciones) AND rol = 'PROPIETARIO'`;
    const sqlVehiculos = `SELECT * FROM vehiculos
                          WHERE num_economico NOT IN (SELECT num_economico FROM asignaciones)`;
    const sqlAsignaciones = `
                          SELECT 
                          usuarios.idUsuario, usuarios.nombre, usuarios.ap1, usuarios.ap2, usuarios.foto AS fotoUsuario, 
                          vehiculos.num_economico, vehiculos.modelo, vehiculos.foto_unidad AS fotoVehiculo 
                          FROM asignaciones 
                          JOIN usuarios ON asignaciones.idUsuario = usuarios.idUsuario 
                          JOIN vehiculos ON asignaciones.num_economico = vehiculos.num_economico
                          `;
    const [usuarios] = await connection.query(sqlUsuarios);
    const [vehiculos] = await connection.query(sqlVehiculos);
    const [asignaciones] = await connection.query(sqlAsignaciones);

    res.render("admin views/assignaments", {
      usuarios,
      vehiculos,
      asignaciones,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.showUserAssignedById = async (id) => {
  try {
    const sql = `SELECT * FROM asignaciones
        INNER JOIN usuarios ON usuarios.idUsuario = asignaciones.idUsuario
        WHERE asignaciones.num_economico = ?`;

    const [assignamentDetail] = await connection.query(sql, [id]);
    return assignamentDetail[0];
  } catch (error) {
    console.log(error);
    res.status(500).send("ERROR AL OBTENER LA ASIGNACION DEL VEHICULO");
  }
};

exports.showHistory = async (id) => {
  try {
    const sql = `SELECT * FROM historial_asignaciones
        INNER JOIN vehiculos ON vehiculos.num_economico = historial_asignaciones.num_economico
        INNER JOIN usuarios ON usuarios.idUsuario = historial_asignaciones.idUsuario
        WHERE vehiculos.num_economico = ?`;

    const [assignamentHistory] = await connection.query(sql, [id]);
    return assignamentHistory;
  } catch (error) {
    console.log(error);
  }
};

exports.assign = async (req, res) => {
  const { userId, eco_number } = req.body;

  try {
    // Liberar el vehículo previamente asignado
    await connection.query("DELETE FROM asignaciones WHERE idUsuario = ?", [
      userId,
    ]);

    // Asignar el nuevo vehículo
    await connection.query("INSERT INTO asignaciones VALUES (?, ?)", [
      userId,
      eco_number,
    ]);

    console.log("ASIGNACION CORRECTA");
    res.redirect("/admin/asignaciones");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al asignar vehículo.");
  }
};

exports.release = async (req, res) => {
  const { userId } = req.body;
  try {
    // Liberar el vehículo
    await connection.query("DELETE FROM asignaciones WHERE idUsuario = ?", [
      userId,
    ]);

    console.log("ASIGNACION ELIMINADA");
    res.redirect("/admin/asignaciones");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al liberar vehículo.");
  }
};

exports.showUserAssignament = async (req, res) => {
  if (req.cookies["cfe-gv"]) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies["cfe-gv"],
        process.env.JWT_SECRET
      );

      const sql = `
      SELECT * FROM asignaciones
      INNER JOIN vehiculos ON vehiculos.num_economico = asignaciones.num_economico
      INNER JOIN usuarios ON usuarios.idUsuario = asignaciones.idUsuario
      INNER JOIN combustible ON vehiculos.num_economico = combustible.num_economico
      INNER JOIN neumaticos ON vehiculos.num_economico = neumaticos.num_economico
      WHERE usuarios.idUsuario = ?
      `;

      const [userInfo] = await connection.query(
        "SELECT * FROM usuarios WHERE idUsuario = ?",
        [decoded.id]
      );
      const [assignamentDetails] = await connection.query(sql, [decoded.id]);

      // res.send(assignamentDetails)
      res.render("user views/mainPage", { user: userInfo[0], assign:assignamentDetails[0] });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error en la consulta de la base de datos");
    }
  } else {
    console.log("No se encontro la cookie");
  }
};
