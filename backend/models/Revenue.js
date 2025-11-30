const db = require('../config/database');

class Revenue {
  // Criar
  static async create(truckId, amount, description, revenueDate) {
    const sql = `
      INSERT INTO revenues (truck_id, amount, description, revenue_date)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [truckId, amount, description, revenueDate]);
    return result;
  }

  // Buscar por caminhão
  static async findByTruckId(truckId) {
    const sql = `
      SELECT r.*, t.plate
      FROM revenues r
      JOIN trucks t ON r.truck_id = t.id
      WHERE r.truck_id = ?
      ORDER BY r.revenue_date DESC, r.id DESC
    `;
    const [rows] = await db.execute(sql, [truckId]);
    return rows;
  }

  // Buscar todas
  static async findAll() {
    const sql = `
      SELECT r.*, t.plate
      FROM revenues r
      JOIN trucks t ON r.truck_id = t.id
      ORDER BY r.revenue_date DESC, r.id DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  // ===== CRUD extra =====
  static async findById(id) {
    const sql = `
      SELECT r.*, t.plate
      FROM revenues r
      JOIN trucks t ON r.truck_id = t.id
      WHERE r.id = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows;
  }

  static async updateById(id, { truck_id, amount, description, revenue_date }) {
    const sql = `
      UPDATE revenues
      SET truck_id = ?, amount = ?, description = ?, revenue_date = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [truck_id, amount, description, revenue_date, id]);
    return result;
  }

  static async deleteById(id) {
    const sql = 'DELETE FROM revenues WHERE id = ?';
    const [result] = await db.execute(sql, [id]);
    return result;
  }
}

module.exports = Revenue;
