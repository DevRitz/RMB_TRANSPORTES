const db = require('../config/database');

class Truck {
  // Criar um novo caminhão
  static async create(truckData) {
    const { plate } = truckData;
    const sql = 'INSERT INTO trucks (plate) VALUES (?)';
    const [result] = await db.execute(sql, [plate]);
    
    return {
      id: result.insertId,
      plate,
      createdAt: new Date()
    };
  }

  // Buscar todos os caminhões
  static async findAll() {
    const sql = 'SELECT * FROM trucks ORDER BY created_at DESC';
    const [rows] = await db.execute(sql);
    return rows;
  }

  // Buscar caminhão por ID
  static async findById(id) {
    const sql = 'SELECT * FROM trucks WHERE id = ?';
    const [rows] = await db.execute(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Atualizar caminhão
  static async update(id, truckData) {
    const { plate } = truckData;
    const sql = 'UPDATE trucks SET plate = ? WHERE id = ?';
    const [result] = await db.execute(sql, [plate, id]);
    
    if (result.affectedRows === 0) {
      throw new Error('Caminhão não encontrado');
    }

    return await Truck.findById(id);
  }

  /**
   * Deletar caminhão em cascata manualmente (sem alterar FKs)
   * IMPORTANTE: adicione aqui TODAS as tabelas filhas que referenciam trucks(id).
   */
  static async deleteCascade(id) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Apaga registros filhos primeiro
      await connection.execute('DELETE FROM fuel_expenses WHERE truck_id = ?', [id]);
      await connection.execute('DELETE FROM driver_expenses WHERE truck_id = ?', [id]);
      await connection.execute('DELETE FROM maintenance_expenses WHERE truck_id = ?', [id]);
      await connection.execute('DELETE FROM other_expenses WHERE truck_id = ?', [id]);
      await connection.execute('DELETE FROM revenues WHERE truck_id = ?', [id]);

      // Agora apaga o caminhão
      const [result] = await connection.execute('DELETE FROM trucks WHERE id = ?', [id]);

      await connection.commit();
      return { affectedRows: result.affectedRows };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  // Criar tabela de caminhões (migração)
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS trucks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plate VARCHAR(20) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await db.execute(query);
  }
}

module.exports = Truck;
