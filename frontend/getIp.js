const os = require('os');
const fs = require('fs');

const interfaces = os.networkInterfaces();
let ip = '127.0.0.1';

for (const devName in interfaces) {
  const iface = interfaces[devName];
  for (let i = 0; i < iface.length; i++) {
    const alias = iface[i];
    if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
      ip = alias.address;
    }
  }
}

/*gets local IP from ipconfig for this computer and writes in js file to
 automatically set the ip for development*/
const content = `export const API_URL = 'http://${ip}:5245';`; 
fs.writeFileSync('./constants/ApiConfig.js', content);
console.log(`Backend IP: ${ip}`);