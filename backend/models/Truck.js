const db = require('../config/database');
const util = require('util');

// Promisifica métodos da conexão para usar async/await
const query    = util.promisify(db.query).bind(db);
const beginTx  = util.promisify(db.beginTransaction).bind(db);
const commitTx = util.promisify(db.commit).bind(db);
const rollTx   = util.promisify(db.rollback).bind(db);

class Truck {
  // Criar um novo caminhão
  static create(plate, callback) {
    const sql = 'INSERT INTO trucks (plate) VALUES (?)';
    db.query(sql, [plate], callback);
  }

  // Buscar todos os caminhões
  static findAll(callback) {
    const sql = 'SELECT * FROM trucks ORDER BY created_at DESC';
    db.query(sql, callback);
  }

  // Buscar caminhão por ID
  static findById(id, callback) {
    const sql = 'SELECT * FROM trucks WHERE id = ?';
    db.query(sql, [id], callback);
  }

  // Atualizar caminhão
  static update(id, plate, callback) {
    const sql = 'UPDATE trucks SET plate = ? WHERE id = ?';
    db.query(sql, [plate, id], callback);
  }

  /**
   * Deletar caminhão em cascata manualmente (sem alterar FKs)
   * IMPORTANTE: adicione aqui TODAS as tabelas filhas que referenciam trucks(id).
   */
  static async deleteCascade(id) {
    try {
      await beginTx();

      // Apaga registros filhos primeiro
      await query('DELETE FROM fuel_expenses        WHERE truck_id = ?', [id]);
      await query('DELETE FROM driver_expenses      WHERE truck_id = ?', [id]);
      await query('DELETE FROM maintenance_expenses WHERE truck_id = ?', [id]);
      await query('DELETE FROM revenues             WHERE truck_id = ?', [id]);

      // Agora apaga o caminhão
      const result = await query('DELETE FROM trucks WHERE id = ?', [id]);

      await commitTx();
      // mysql2 em modo callback retorna OkPacket; aqui result.affectedRows pode vir como number
      const affectedRows = result?.affectedRows ?? (Array.isArray(result) ? result[0]?.affectedRows : 0);
      return { affectedRows };
    } catch (err) {
      try { await rollTx(); } catch (_) {}
      throw err;
    }
  }
}

module.exports = Truck;
