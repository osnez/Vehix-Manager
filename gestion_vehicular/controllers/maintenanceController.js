const connection = require("../configs/db.js");
const uuid = require("uuid");

// Para mostrar todos los datos disponibles en mantenimientos

exports.getAllMaintenance = async (id) => {
  try {
    const sql = `SELECT * FROM mantenimientos
    INNER JOIN vehiculos ON vehiculos.num_economico = mantenimientos.num_economico
    WHERE mantenimientos.num_economico = ?`;

    const [items] = await connection.query(sql, [id]);
    return items;
  } catch (error) {
    throw new Error("Error al obtener los datos");
  }
};

exports.register = async (req, res) => {
  const {economic_num, destination, begin_date, cost } = req.body;

  try {
    // Insertar el nuevo usuario en la base de datos
    await connection.query("INSERT INTO mantenimientos SET ?", {
      idMantenimiento: uuid.v4(),
      num_economico: economic_num,
      fecha: begin_date,
      destino: destination,
      costo: cost,
    });

    console.log("MANTENIMIENTO REGISTRADO CON ÉXITO");

    // Redirigir a la página de registro de usuario
    res.redirect("/admin/mantenimiento/" + economic_num);
  } catch (error) {
    console.error("Error al registrar el mantenimiento:", error);
    res.status(500).send("Error al registrar el mantenimiento.");
  }
};
