const db = require('../config/database');

class Revenue {
  // Criar
  static create(truckId, amount, description, revenueDate, callback) {
    const sql = `
      INSERT INTO revenues (truck_id, amount, description, revenue_date)
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [truckId, amount, description, revenueDate], callback);
  }

  // Buscar por caminhão
  static findByTruckId(truckId, callback) {
    const sql = `
      SELECT r.*, t.plate
      FROM revenues r
      JOIN trucks t ON r.truck_id = t.id
      WHERE r.truck_id = ?
      ORDER BY r.revenue_date DESC, r.id DESC
    `;
    db.query(sql, [truckId], callback);
  }

  // Buscar todas
  static findAll(callback) {
    const sql = `
      SELECT r.*, t.plate
      FROM revenues r
      JOIN trucks t ON r.truck_id = t.id
      ORDER BY r.revenue_date DESC, r.id DESC
    `;
    db.query(sql, callback);
  }

  // ===== CRUD extra =====
  static findById(id, callback) {
    const sql = `
      SELECT r.*, t.plate
      FROM revenues r
      JOIN trucks t ON r.truck_id = t.id
      WHERE r.id = ?
    `;
    db.query(sql, [id], callback);
  }

  static updateById(id, { truck_id, amount, description, revenue_date }, callback) {
    const sql = `
      UPDATE revenues
      SET truck_id = ?, amount = ?, description = ?, revenue_date = ?
      WHERE id = ?
    `;
    db.query(sql, [truck_id, amount, description, revenue_date, id], callback);
  }

  static deleteById(id, callback) {
    const sql = 'DELETE FROM revenues WHERE id = ?';
    db.query(sql, [id], callback);
  }
}

module.exports = Revenue;
