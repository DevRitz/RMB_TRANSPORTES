const db = require('../config/database');

class DriverExpense {
  static async create(truckId, amount, description, expenseDate) {
    const sql = 'INSERT INTO driver_expenses (truck_id, amount, description, expense_date) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(sql, [truckId, amount, description, expenseDate]);
    return result;
  }

  static async findAll() {
    const sql = `
      SELECT d.*, t.plate
      FROM driver_expenses d
      JOIN trucks t ON d.truck_id = t.id
      ORDER BY d.expense_date DESC, d.id DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  static async findByTruckId(truckId) {
    const sql = `
      SELECT d.*, t.plate
      FROM driver_expenses d
      JOIN trucks t ON d.truck_id = t.id
      WHERE d.truck_id = ?
      ORDER BY d.expense_date DESC, d.id DESC
    `;
    const [rows] = await db.execute(sql, [truckId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM driver_expenses WHERE id = ?', [id]);
    return rows;
  }

  static async updateById(id, truckId, amount, description, expenseDate) {
    const sql = 'UPDATE driver_expenses SET truck_id=?, amount=?, description=?, expense_date=? WHERE id=?';
    const [result] = await db.execute(sql, [truckId, amount, description, expenseDate, id]);
    return result;
  }

  static async deleteById(id) {
    const [result] = await db.execute('DELETE FROM driver_expenses WHERE id = ?', [id]);
    return result;
  }

  static async findByPeriod(year, month) {
    const sql = `
      SELECT d.*, t.plate
      FROM driver_expenses d
      JOIN trucks t ON d.truck_id = t.id
      WHERE YEAR(d.expense_date) = ? AND MONTH(d.expense_date) = ?
      ORDER BY d.expense_date DESC, d.id DESC
    `;
    const [rows] = await db.execute(sql, [year, month]);
    return rows;
  }
}

module.exports = DriverExpense;
