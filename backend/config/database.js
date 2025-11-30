const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração da conexão com o banco de dados MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rmb_transportes'
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Testar conexão
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1');
    console.log('Conectado ao banco de dados MySQL');
    connection.release();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
};

testConnection();

module.exports = pool;

