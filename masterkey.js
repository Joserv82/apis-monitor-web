import crypto from 'crypto';

const masterKeyBuffer = crypto.randomBytes(32); // 32 bytes = 256 bits
const masterKeyHex = masterKeyBuffer.toString('hex');

console.log("MASTER_KEY=" + masterKeyHex);