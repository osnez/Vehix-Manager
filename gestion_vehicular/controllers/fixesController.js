const connection = require("../configs/db.js");
const uuid = require("uuid");

// Para mostrar todos los datos disponibles en mantenimientos

exports.getAllFixes = async (id) => {
  try {
    const sql = `SELECT * FROM reparaciones
    INNER JOIN vehiculos ON vehiculos.num_economico = reparaciones.num_economico
    WHERE reparaciones.num_economico = ?`;

    const [items] = await connection.query(sql, [id]);
    
    return items;
  } catch (error) {
    throw new Error("Error al obtener los datos");
  }
};

exports.register = async (req, res) => {
  const {economic_num, detail, begin_date, end_date, cost } = req.body;

  try {
    // Insertar el nuevo usuario en la base de datos
    await connection.query("INSERT INTO reparaciones SET ?", {
      idReparacion: uuid.v4(),
      num_economico: economic_num,
      detalle: detail,
      fecha_ingreso: begin_date,
      fecha_salida: end_date,
      costo: cost,
    });

    console.log("REPARACION REGISTRADA CON ÉXITO");

    // Redirigir a la página de registro de usuario
    res.redirect("/admin/reparacion/" + economic_num);
  } catch (error) {
    console.error("Error al registrar el reparacion:", error);
    res.status(500).send("Error al registrar la reparacion.");
  }
};
