const express = require('express');
const axios = require('axios');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config({ quiet: true });

const app = express();
const PORT = 3000;

app.use(express.static('public'));

// Configurar transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Función para enviar correo de alerta
async function sendAlertEmail(logContent) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: 'Alerta: API caída detectada',
    text: `Se detectaron errores en tu monitor:\n\n${logContent}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de alerta enviado');
  } catch (err) {
    console.error('Error al enviar correo:', err.message);
  }
}

// Objeto global para guardar estados previos
const previousStatuses = {};

app.get('/api/status', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  const apis = JSON.parse(fs.readFileSync('apis.json'));
  const xmlBase64 = fs.readFileSync('ejemplo.xml').toString('base64');
  const API_KEY = '89ad7840-f772-4b21-bd60-2c6d8025ba2f';

  const logEntries = [];
  const results = await Promise.all(
    apis.map(async (api) => {
      try {
        let response;
//test new branch
        // Validador XML
        if (api.url.includes('Validator/ValidateXml')) {
          const body = { _File: xmlBase64, ApiKey: API_KEY };
          response = await axios.post(api.url, body, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
          });
        }
        // API con UUID
        else if (api.uuid) {
          const body = { uuid: api.uuid, ApiKey: API_KEY };
          response = await axios.post(api.url, body, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
          });
        }
        // GET simple
        else {
          response = await axios.get(api.url, { timeout: 3000 });
        }

        // Validar si el contenido indica error (aunque sea 200)
        const dataStr = JSON.stringify(response.data || '').toLowerCase();
        const hasError =
          dataStr.includes('error') ||
          dataStr.includes('fail') ||
          dataStr.includes('invalid');

        if (response.status !== 200 || hasError) {
          throw new Error(`Respuesta no válida (status ${response.status})`);
        }

        // Estado UP
        previousStatuses[api.name] = 'up';
        return { name: api.name, status: 'up' };

      } catch (error) {
        const status = error.response?.status || 'sin respuesta';
        const message = error.response?.data || error.message;

        const logLine = `[${new Date().toISOString()}] ${api.name} DOWN - Status: ${status} - ${JSON.stringify(message)}`;
        console.error(logLine);
        logEntries.push(logLine);

        // Solo mandar correo si antes estaba "up" o no existía
        if (previousStatuses[api.name] !== 'down') {
          previousStatuses[api.name] = 'down';
          fs.appendFileSync('error_log.txt', logLine + '\n');
          await sendAlertEmail(logLine);
        }

        return { name: api.name, status: 'down' };
      }
    })
  );

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);});