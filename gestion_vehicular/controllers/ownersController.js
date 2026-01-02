const multer = require("multer");
const bcryptjs = require("bcryptjs");
const path = require("path");
const sendMail = require("../configs/mailer.js");
const connection = require("../configs/db.js");
const uuid = require("uuid");

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/owner-img/"); // Carpeta de destino
  },
  filename: function (req, file, cb) {
    cb(null, "PROPIETARIO - " + Date.now() + path.extname(file.originalname));
  },
});

exports.upload = multer({ storage: storage });

exports.getAllOwners = async () => {
  try {
    const [owners] = await connection.query(
      "SELECT * FROM propietario_vehiculo"
    );
    return owners;
  } catch (error) {
    throw new Error("Error al obtener los datos");
  }
};

exports.getOwnerById = async (id) => {
  try {
    const sql = `SELECT * FROM propietario_vehiculo WHERE idPropietario = ?`;

    const [items] = await connection.query(sql, [id]);
    return items[0];
  } catch (error) {
    console.error("Error al obtener el vehiculo:", error);
    res.status(500).send("Error al obtener el perfil del usuario.");
  }
};

// para el registro de nuevos propietarios
exports.register = async (req, res) => {
  const id = uuid.v4();
  const { name, ap1, ap2, email, gender } = req.body;
  const pass = Math.random().toString(36).substring(2, 12); //genera una contrasena temporal
  const role = "ADMINISTRADOR"; //rol por defecto del usuario
  const filePath = req.file
    ? `/uploads/owner-img/${req.file.filename}`
    : "/uploads/SIN_IMAGEN.jpg"; // agregar una imagen por defecto si no se selecciona alguna

  try {
    // Verificar si el usuario ya existe
    const [existingUser] = await connection.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).send("El usuario ya existe.");
    }

    // Hash de la contraseña
    const hashedPassword = await bcryptjs.hash(pass, 12);

    // Insertar el nuevo usuario en la base de datos
    await connection.query("INSERT INTO usuarios SET ?", {
      idUsuario: id,
      nombre: name,
      ap1: ap1,
      ap2: ap2,
      genero: gender,
      correo: email,
      contrasena: hashedPassword,
      rol: role,
      foto: filePath,
    });
    console.log("USUARIO REGISTRADO CON ÉXITO");

    await connection.query("INSERT INTO propietario_vehiculo SET ?", {
      idPropietario: id,
      nombre_prop: name,
      ap1_prop: ap1,
      ap2_prop: ap2,
      foto_prop: filePath,
    });
    console.log("PROPIETARIO REGISTRADO CON EXITO");

    // Preparar el contenido del correo
    const subject = "Bienvenido a Nuestra Plataforma";
    const text = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border: 1px solid #dddddd;
          }
          .header {
            background-color: #e0e0e0;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .header img {
            max-width: 120px;
          }
          .content {
            padding: 20px;
          }
          h1 {
            color: #333333;
            font-size: 24px;
          }
          p {
            color: #666666;
            line-height: 1.5;
          }
          .details {
            background-color: #f9f9f9;
            border-left: 5px solid #4CAF50;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .details ul {
            padding: 0;
            list-style-type: none;
          }
          .details li {
            padding: 8px 0;
            border-bottom: 1px solid #dddddd;
          }
          .details li:last-child {
            border-bottom: none;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 0.8em;
            color: #999999;
            border-top: 1px solid #dddddd;
          }
          .footer a {
            color: #4CAF50;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="https://cdn.cfe.mx/2019/assets/images/logo.png" alt="Logo" />
            <h1>Bienvenido</h1>
          </div>
          <div class="content">
            <p>Hola ${name},</p>
            <p>Tu cuenta ha sido creada exitosamente. Aquí están los detalles de tu cuenta:</p>
            <div class="details">
              <ul>
                <li><strong>Nombre:</strong> ${name} ${ap1} ${ap2}</li>
                <li><strong>Correo:</strong> ${email}</li>
                <li><strong>Contraseña temporal:</strong> ${pass}</li>
              </ul>
            </div>
            <p>Por favor, cambia tu contraseña después de iniciar sesión.</p>
          </div>
          <div class="footer">
            <p>Saludos,</p>
            <p>El equipo CFE</p>
            <p><a href="http://localhost:8080">Inicia sesion en la plataforma</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

    // Enviar el correo al usuario
    try {
      await sendMail(email, subject, text);
      console.log("Correo enviado exitosamente.");
    } catch (emailError) {
      console.error("Error al enviar el correo:", emailError);
    }

    // Redirigir a la página de registro de usuario
    res.redirect("/admin/registrar-propietario");
  } catch (error) {
    console.error("Error al registrar el propietario:", error);
    res.status(500).send("Error al registrar el propietario.");
  }
};

exports.updateInformation = async (req, res) => {
  try {
    const id = req.body.id;
    const name = req.body.name;
    const ap1 = req.body.ap1;
    const ap2 = req.body.ap2;

    const sql = `UPDATE propietario_vehiculo SET
                  nombre_prop = ?,
                  ap1_prop = ?,
                  ap2_prop = ?
                  WHERE idPropietario = ?`;

    const sql2 = `UPDATE usuarios SET
                  nombre = ?,
                  ap1 = ?,
                  ap2 = ?
                  WHERE idUsuario = ?`;

    await connection.query(sql, [name, ap1, ap2, id]);
    await connection.query(sql2, [name, ap1, ap2, id]);

    console.log("INFORMACION ACTUALIZADA CORRECTAMENTE");
    res.redirect("/admin/propietarios");
  } catch (error) {
    console.log(error);
  }
};

exports.updateImage = async (req, res) => {
  const id = req.params.id;
  const filePath = `/uploads/owner-img/${req.file.filename}`;

  const sql = `UPDATE propietario_vehiculo SET
                foto_prop = ?
                WHERE idPropietario = ?`;

  const sql2 = `UPDATE usuarios SET
                foto = ?
                WHERE idUsuario = ?`;

  await connection.query(sql, [filePath, id]);
  await connection.query(sql2, [filePath, id]);

  console.log("IMAGEN CAMBIADA CON EXITO");
  res.redirect("/admin/propietarios");
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    await connection.query(
      "DELETE FROM usuarios where idUsuario = ?",
      [id]
    );
    await connection.query(
      "DELETE FROM propietario_vehiculo where idPropietario = ?",
      [id]
    );

    res.redirect("/admin/propietarios");
    console.log("PROPIETARIO ELIMINADO CON EXITO");
  } catch (error) {
    console.log(error);
  }
};
