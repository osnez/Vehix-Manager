const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const app = express();

// Motor de plantillas utilizado
app.set("view engine", "ejs");

// Usar las carpetas con archivos estaticos
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Procesar los datos enviados desde el formulario
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Para el uso de las variables de entorno
dotenv.config({ path: "./env/.env" });

// Para trabajar las cookies
app.use(cookieParser());

// Uso de los router
app.use("/", require("./routers/router"));
app.use("/admin", require("./routers/adminRouter"));
app.use("/prop", require("./routers/propRouter"));

// Evitar que el usuario regrese a la sesion anterior con el boton back
app.use(function (req, res, next) {
  if (!req.user)
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  next();
});

// Para el puerto a utilizar en el servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SERVIDOR LISTO EN EL PUERTO ${PORT}`);
});
