// hashear.js
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function actualizarPassword() {
  const passwordPlana = 'admin123';
  const hash = await bcrypt.hash(passwordPlana, 12);
  
  await pool.query(
    'UPDATE usuarios SET password = $1 WHERE email = $2',
    [hash, 'admin@eltunel.com']
  );
  
  console.log('✅ Password actualizada correctamente');
  console.log('🔐 Hash generado:', hash);
  process.exit(0);
}

actualizarPassword().catch(console.error);