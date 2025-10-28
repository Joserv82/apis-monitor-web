const nodemailer = require('nodemailer');
require('dotenv').config();

async function enviarCorreoDePrueba() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'Prueba de envío desde tu Monitor de APIs',
      text: '¡Hola! Este es un correo de prueba para confirmar que tu configuración SMTP funciona correctamente.'
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado correctamente:', info.response);
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error.message);
  }
}

enviarCorreoDePrueba();
