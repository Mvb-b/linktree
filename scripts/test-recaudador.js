#!/usr/bin/env node

/**
 * Script de prueba para el endpoint del Agente Recaudador
 * 
 * Uso:
 *   node scripts/test-recaudador.js
 *   CRON_SECRET=mi_secreto node scripts/test-recaudador.js
 *   node scripts/test-recaudador.js http://localhost:3000/api/cron/recaudador
 */

const http = require('http');

const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret-123';
const ENDPOINT = process.argv[2] || 'http://localhost:3000/api/cron/recaudador';

console.log('=================================================');
console.log('🤖 Test del Agente Recaudador');
console.log('=================================================');
console.log(`URL: ${ENDPOINT}`);
console.log(`CRON_SECRET: ${CRON_SECRET.substring(0, 8)}...${CRON_SECRET.slice(-4)}`);
console.log('=================================================\n');

async function testRecaudador() {
  const url = new URL(ENDPOINT);
  
  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CRON_SECRET}`,
      'Content-Type': 'application/json',
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`📡 Status: ${res.statusCode} ${res.statusMessage}`);
      console.log('📨 Headers:', JSON.stringify(res.headers, null, 2));
      console.log('');
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  try {
    console.log('⏳ Ejecutando petición...\n');
    const result = await testRecaudador();
    
    console.log('=================================================');
    console.log('✅ Respuesta recibida:');
    console.log('=================================================');
    console.log(JSON.stringify(result.data, null, 2));
    
    if (result.status === 200 && result.data.success) {
      console.log('');
      console.log('🎉 ÉXITO: El recaudador se ejecutó correctamente');
      console.log(`📊 Resumen: ${result.data.result.completed} completados de ${result.data.result.processed} procesados`);
    } else if (result.status === 401) {
      console.log('\n⚠️  ERROR 401: CRON_SECRET inválido o no configurado');
      console.log('Revisa tu archivo .env.local y asegúrate de tener el CRON_SECRET correcto');
    } else {
      console.log(`\n⚠️  ERROR ${result.status}: Verificar logs del servidor`);
    }
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    console.log('\nPosibles causas:');
    console.log('  - El servidor no está corriendo en el puerto especificado');
    console.log('  - Verifica la URL del endpoint');
    console.log('  - Comprueba tus variables de entorno');
    console.log('\nPara iniciar el servidor:');
    console.log('  npm run dev');
  }
}

main();
