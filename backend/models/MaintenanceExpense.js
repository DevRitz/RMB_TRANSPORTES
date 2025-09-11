const db = require('../config/database');

class MaintenanceExpense {
  // Criar
  static create(truckId, amount, mileage, description, expenseDate, cb) {
    const sql = `
      INSERT INTO maintenance_expenses (truck_id, amount, mileage, description, expense_date)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [truckId, amount, mileage, description, expenseDate], cb);
  }

  // Listar todas
  static findAll(cb) {
    const sql = `
      SELECT m.*, t.plate
      FROM maintenance_expenses m
      JOIN trucks t ON m.truck_id = t.id
      ORDER BY m.expense_date DESC, m.id DESC
    `;
    db.query(sql, cb);
  }

  // Listar por caminhão
  static findByTruckId(truckId, cb) {
    const sql = `
      SELECT m.*, t.plate
      FROM maintenance_expenses m
      JOIN trucks t ON m.truck_id = t.id
      WHERE m.truck_id = ?
      ORDER BY m.expense_date DESC, m.id DESC
    `;
    db.query(sql, [truckId], cb);
  }

  // 🔹 Listar por período (ANO/MÊS)
  static findByPeriod(year, month, cb) {
    const sql = `
      SELECT m.*, t.plate
      FROM maintenance_expenses m
      JOIN trucks t ON m.truck_id = t.id
      WHERE YEAR(m.expense_date) = ? AND MONTH(m.expense_date) = ?
      ORDER BY m.expense_date DESC, m.id DESC
    `;
    db.query(sql, [year, month], cb);
  }

  // Buscar por ID (para edição)
  static findById(id, cb) {
    db.query('SELECT * FROM maintenance_expenses WHERE id = ?', [id], cb);
  }

  // Atualizar por ID
  static updateById(id, truckId, amount, mileage, description, expenseDate, cb) {
    const sql = `
      UPDATE maintenance_expenses
      SET truck_id = ?, amount = ?, mileage = ?, description = ?, expense_date = ?
      WHERE id = ?
    `;
    db.query(sql, [truckId, amount, mileage, description, expenseDate, id], cb);
  }

  // Deletar por ID
  static deleteById(id, cb) {
    db.query('DELETE FROM maintenance_expenses WHERE id = ?', [id], cb);
  }
}

module.exports = MaintenanceExpense;
