import crypto from 'crypto';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const algorithm = 'aes-256-cbc';
const iv = Buffer.alloc(16, 0);

//Generar MASTER_KEY si no existe en .env
let masterKey = process.env.MASTER_KEY;
if (!masterKey) {
  masterKey = crypto.randomBytes(32).toString('hex');
  // Guardar en .env
  let envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
  envContent += `\nMASTER_KEY=${masterKey}\n`;
  fs.writeFileSync('.env', envContent);
  console.log(' MASTER_KEY generada y guardada en .env');
}

//ApikeyTest
const apikey = "";

//Encriptar apiKey
const cipher = crypto.createCipheriv(algorithm, Buffer.from(masterKey, 'hex'), iv);
let encrypted = cipher.update(apikey, 'utf8', 'base64');
encrypted += cipher.final('base64');

//Guardar API_KEY_ENC en .env
let envContent = fs.readFileSync('.env', 'utf8');
if (!envContent.includes('API_KEY_ENC=')) {
  envContent += `API_KEY_ENC=${encrypted}\n`;
  fs.writeFileSync('.env', envContent);
  console.log(' API_KEY_ENC generada y guardada en .env');
} else {
  console.log(' API_KEY_ENC ya existe en .env, revisa si quieres sobrescribirla');
}

console.log('\n Valores en .env:');
console.log(`MASTER_KEY=${masterKey}`);
console.log(`API_KEY_ENC=${encrypted}`);
