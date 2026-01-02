const uuid = require("uuid");
const bcryptjs = require("bcryptjs");
const connection = require("../configs/db.js");
const multer = require("multer");
const path = require("path");
const sendMail = require("../configs/mailer.js");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

// Salt (salt rounds)
const salt = 12;

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/user-img/"); // Carpeta de destino
  },
  filename: function (req, file, cb) {
    cb(null, "USUARIO - " + Date.now() + path.extname(file.originalname));
  },
});

exports.upload = multer({ storage: storage });

// para el registro de nuevos usuarios
exports.register = async (req, res) => {
  const { name, ap1, ap2, email, gender } = req.body;
  const pass = Math.random().toString(36).substring(2, 12); //genera una contrasena temporal
  const role = "PROPIETARIO"; //rol por defecto del usuario
  const filePath = req.file
    ? `/uploads/user-img/${req.file.filename}`
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
    const hashedPassword = await bcryptjs.hash(pass, salt);

    // Insertar el nuevo usuario en la base de datos
    await connection.query("INSERT INTO usuarios SET ?", {
      idUsuario: uuid.v4(),
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
    res.redirect("/admin/registrar-usuario");
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    res.status(500).send("Error al registrar el usuario.");
  }
};

exports.updateInformation = async (req, res) => {
  try {
    const decoded = await promisify(jwt.verify)(
      req.cookies["cfe-gv"],
      process.env.JWT_SECRET
    );

    const id = decoded.id;
    const name = req.body.name;
    const ap1 = req.body.ap1;
    const ap2 = req.body.ap2;
    const email = req.body.email;

    const sql = `UPDATE usuarios SET
                  nombre = ?,
                  ap1 = ?,
                  ap2 = ?,
                  correo = ?
                  WHERE idUsuario = ?`;

    await connection.query(sql, [name, ap1, ap2, email, id]);

    console.log("INFORMACION ACTUALIZADA CORRECTAMENTE");
    res.redirect("/mi-perfil");
  } catch (error) {
    console.log(error);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const decoded = await promisify(jwt.verify)(
      req.cookies["cfe-gv"],
      process.env.JWT_SECRET
    );

    const id = decoded.id;
    const pass = req.body.pass;

    //hash para la contrasena
    let passHash = await bcryptjs.hash(pass, 8);

    const sql = `UPDATE usuarios SET
                  contrasena = ?
                  WHERE idUsuario = ?`;

    await connection.query(sql, [passHash, id]);
    console.log("CONTRASENA ACTUALIZADA CORRECTAMENTE");
    res.redirect("/mi-perfil");
  } catch (error) {
    console.log(error);
  }
};

exports.updateImage = async (req, res) => {
  const decoded = await promisify(jwt.verify)(
    req.cookies["cfe-gv"],
    process.env.JWT_SECRET
  );

  const id = decoded.id;
  const filePath = `/uploads/user-img/${req.file.filename}`;

  const sql = `UPDATE usuarios SET
                foto = ?
                WHERE idUsuario = ?`;

  await connection.query(sql, [filePath, id]);

  console.log("IMAGEN CAMBIADA CON EXITO");
  res.redirect("/mi-perfil");
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = req.user; // Información del usuario obtenida en el middleware

    if (!user) {
      return res.status(404).send("Usuario no encontrado.");
    }

    res.render("myProfile", { user });
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
    res.status(500).send("Error al obtener el perfil del usuario.");
  }
};
