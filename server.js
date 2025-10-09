const express = require('express');
const axios = require('axios');
const fs = requiere('fs');

const app = express();
const PORT = 3000;
//agregamos un comentario para subir este cambio
app.use(express.static('public'));

app.get('/api/status', async (req, res) => {
    const apis =JSON.parse(fs.readFileSync('apis.json'));
    const results = await Promise.all(
        apis.map(async (api) =>{
            try{
                const response =await axios.get(api.url, { timeout:3000});
                return { name: api.name, status: response.status === 200 ? 'up': 'down'};
            }catch {
                return {name: apin.name, status :'down'};
            }
        })
    );
    res.json(results);
});

app.listen(PORT, () =>{
    console.log('Servidor corriendo en http://localhost:${PORT}');
})