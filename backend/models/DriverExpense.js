const db = require('../config/database');

class DriverExpense {
  static create(truckId, amount, description, expenseDate, cb) {
    const sql = 'INSERT INTO driver_expenses (truck_id, amount, description, expense_date) VALUES (?, ?, ?, ?)';
    db.query(sql, [truckId, amount, description, expenseDate], cb);
  }

  static findAll(cb) {
    const sql = `
      SELECT d.*, t.plate
      FROM driver_expenses d
      JOIN trucks t ON d.truck_id = t.id
      ORDER BY d.expense_date DESC, d.id DESC
    `;
    db.query(sql, cb);
  }

  static findByTruckId(truckId, cb) {
    const sql = `
      SELECT d.*, t.plate
      FROM driver_expenses d
      JOIN trucks t ON d.truck_id = t.id
      WHERE d.truck_id = ?
      ORDER BY d.expense_date DESC, d.id DESC
    `;
    db.query(sql, [truckId], cb);
  }

  static findById(id, cb) {
    db.query('SELECT * FROM driver_expenses WHERE id = ?', [id], cb);
  }

  static updateById(id, truckId, amount, description, expenseDate, cb) {
    const sql = 'UPDATE driver_expenses SET truck_id=?, amount=?, description=?, expense_date=? WHERE id=?';
    db.query(sql, [truckId, amount, description, expenseDate, id], cb);
  }

  static deleteById(id, cb) {
    db.query('DELETE FROM driver_expenses WHERE id = ?', [id], cb);
  }

  static findByPeriod(year, month, cb) {
    const sql = `
      SELECT d.*, t.plate
      FROM driver_expenses d
      JOIN trucks t ON d.truck_id = t.id
      WHERE YEAR(d.expense_date) = ? AND MONTH(d.expense_date) = ?
      ORDER BY d.expense_date DESC, d.id DESC
    `;
    db.query(sql, [year, month], cb);
  }
}

module.exports = DriverExpense;
