/*
  Configuración de la conexión a PostgreSQL
  usando el módulo 'pg' (node-postgres)
*/
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Probar conexión al iniciar
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error al conectar a PostgreSQL:', err.message);
    } else {
        console.log('✅ Conectado a PostgreSQL - El Túnel');
        release();
    }
});

module.exports = pool;