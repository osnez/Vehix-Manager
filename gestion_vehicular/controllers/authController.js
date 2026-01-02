const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const connection = require("../configs/db");
const { promisify } = require("util");

// Definir el nombre de la cookie como una constante
const COOKIE_NAME = 'sesion';

// Manejo del login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Usuario y contraseña requeridos.");
    }

    // Verificar si el usuario existe en la BD
    const [results] = await connection.query('SELECT * FROM usuarios WHERE correo = ?', [email]);

    if (results.length === 0) {
      return res.status(401).send("Usuario o contraseña incorrectos.");
    }

    const user = results[0];

    const passMatch = await bcryptjs.compare(password, user.contrasena);

    if (!passMatch) {
      return res.status(401).send("Usuario o contraseña incorrectos.");
    }

    // Inicio de sesión exitoso
    const token = jwt.sign({ id: user.idUsuario }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME || '1h',
    });

    const cookieOptions = {
      expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRATION || 7) * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.cookie(COOKIE_NAME, token, cookieOptions);

    // Redirección según el rol
    switch (user.rol) {
      case 'ADMINISTRADOR':
        return res.redirect('/admin');
      case 'PROPIETARIO':
        return res.redirect('/prop');
      default:
        return res.redirect('/error')
    }
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).send("Error en el servidor.");
  }
};

// Verificar si el usuario esta autenticado
exports.isAuthenticated = async (req, res, next) => {
  const token = req.cookies[COOKIE_NAME];

  if (token) {
    try {
      // Verificar el token JWT
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      // Consultar el usuario en la base de datos
      const [results] = await connection.query('SELECT * FROM usuarios WHERE idUsuario = ?', [decoded.id]);

      if (results.length === 0) {
        return res.redirect('/'); // Redirigir al login si el usuario no existe
      }

      // Agregar el usuario al objeto `req` para su uso en rutas protegidas
      req.user = results[0];
      next();
    } catch (error) {
      console.error('Error en la verificación del token:', error);
      res.redirect('/'); // Redirigir al login en caso de error en la verificación
    }
  } else {
    res.redirect('/'); // Redirigir al login si no hay token
  }
};

// Verificacion del rol de usuario
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Verifica los roles de lo contrario redirecciona a una pagina de error
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.render("error");
    }
    next();
  };
};

// Cierre de sesion
exports.logout = (req, res) => {
  // Eliminar la cookie que contiene el token JWT
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true, // Asegura que la cookie solo sea accesible a través del protocolo HTTP
    secure: process.env.NODE_ENV === 'production', // Asegura que la cookie solo se envíe a través de HTTPS en producción
    sameSite: 'Strict' // Protege contra ataques CSRF (Cross-Site Request Forgery)
  });

  // Redirigir al usuario a la página principal o de inicio
  res.redirect('/');
};