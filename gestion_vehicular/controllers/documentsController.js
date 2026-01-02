const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuración de Multer para almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const vehicleFolder = `uploads/docs/${req.params.id}`;
    if (!fs.existsSync(vehicleFolder)) {
      fs.mkdirSync(vehicleFolder, { recursive: true });
    }
    cb(null, vehicleFolder);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
exports.upload = multer({ storage: storage });

exports.showAllDocs = (req, res) => {
  const vehicleFolder = `uploads/docs/${req.params.id}`;

  // Asegurarse de que la carpeta existe antes de intentar leer
  if (!fs.existsSync(vehicleFolder)) {
    fs.mkdirSync(vehicleFolder, { recursive: true });
  }

  fs.readdir(vehicleFolder, (err, files) => {
    if (err) return res.status(500).send("Error al leer los archivos: " + err);
    res.render("admin views/documents/documents", {
      files: files,
      vehicleId: req.params.id,
    });
  });
};

exports.delete = (req, res) => {
  const filePath =
    "uploads/docs/" + req.params.vehicleId + "/" + req.params.filename;
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error al eliminar el archivo.");
    }
    res.send("Archivo eliminado.");
  });
};
