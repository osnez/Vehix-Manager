const nodemailer = require("nodemailer");

// Configuracion del transporte
const transporter = nodemailer.createTransport({
  service: process.env.E_SERVICE,
  auth: {
    user: process.env.E_USER,
    pass: process.env.E_PASS,
  },
});

// Para enviar el correo
const sendMail = (to, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.E_USER,
    to,
    subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendMail;
