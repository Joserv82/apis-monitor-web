const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/api/status', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  const apis = JSON.parse(fs.readFileSync('apis.json'));
  const xmlBase64 = fs.readFileSync('ejemplo.xml').toString('base64');

  const results = await Promise.all(
    apis.map(async (api) => {
      try {
        let response;

        if (api.url.includes('Validator/ValidateXml')) {
          // 🔹 Enviar el formato correcto
          const body = {
            _File: xmlBase64,
            ApiKey: '89ad7840-f772-4b21-bd60-2c6d8025ba2f'
          };

          response = await axios.post(api.url, body, {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } else {
          response = await axios.get(api.url, { timeout: 3000 });
        }

        return { name: api.name, status: response.status === 200 ? 'up' : 'down' };

      } catch (error) {
        console.error(`Error con ${api.name}:`, error.response?.status || error.message);
        if (error.response) {
          console.log('Respuesta del servidor:', error.response.data);
        }
        return { name: api.name, status: 'down' };
      }
    })
  );

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

