const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Criar um novo usuário
  static async create(userData) {
    const { username, password, role = 'user' } = userData;
    
    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (username, password, role)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [username, hashedPassword, role]);
    
    return {
      id: result.insertId,
      username,
      role,
      createdAt: new Date()
    };
  }

  // Buscar usuário por username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await db.execute(query, [username]);
    
    return rows.length > 0 ? rows[0] : null;
  }

  // Buscar usuário por ID
  static async findById(id) {
    const query = 'SELECT id, username, role, created_at as createdAt FROM users WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    
    return rows.length > 0 ? rows[0] : null;
  }

  // Comparar senha
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Listar todos os usuários
  static async findAll() {
    const query = 'SELECT id, username, role, created_at as createdAt FROM users ORDER BY created_at DESC';
    const [rows] = await db.execute(query);
    
    return rows;
  }

  // Atualizar usuário
  static async update(id, userData) {
    const { username, role } = userData;
    
    const query = `
      UPDATE users 
      SET username = ?, role = ?
      WHERE id = ?
    `;
    
    const [result] = await db.execute(query, [username, role, id]);
    
    if (result.affectedRows === 0) {
      throw new Error('Usuário não encontrado');
    }

    return await User.findById(id);
  }

  // Deletar usuário
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    
    return result.affectedRows > 0;
  }

  // Criar tabela de usuários (migração)
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await db.execute(query);
  }

  // Criar usuário admin padrão
  static async createDefaultAdmin() {
    try {
      const existingAdmin = await User.findByUsername('admin');
      
      if (!existingAdmin) {
        await User.create({
          username: 'admin',
          password: 'admin123',
          role: 'admin'
        });
        console.log('Usuário admin padrão criado: admin/admin123');
      }
    } catch (error) {
      console.error('Erro ao criar usuário admin padrão:', error);
    }
  }
}

module.exports = User;