const db = require('../config/database');

class FuelExpense {
  static create(truckId, liters, pricePerLiter, mileage, expenseDate, cb) {
    const sql = `
      INSERT INTO fuel_expenses (truck_id, liters, price_per_liter, mileage, expense_date)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [truckId, liters, pricePerLiter, mileage, expenseDate], cb);
  }

  static findAll(cb) {
    const sql = `
      SELECT f.*, t.plate
      FROM fuel_expenses f
      JOIN trucks t ON f.truck_id = t.id
      ORDER BY f.expense_date DESC, f.id DESC
    `;
    db.query(sql, cb);
  }

  static findByTruckId(truckId, cb) {
    const sql = `
      SELECT f.*, t.plate
      FROM fuel_expenses f
      JOIN trucks t ON f.truck_id = t.id
      WHERE f.truck_id = ?
      ORDER BY f.expense_date DESC, f.id DESC
    `;
    db.query(sql, [truckId], cb);
  }

  static findById(id, cb) {
    db.query('SELECT * FROM fuel_expenses WHERE id = ?', [id], cb);
  }

  static updateById(id, truckId, liters, pricePerLiter, mileage, expenseDate, cb) {
    const sql = `
      UPDATE fuel_expenses SET truck_id=?, liters=?, price_per_liter=?, mileage=?, expense_date=? WHERE id=?
    `;
    db.query(sql, [truckId, liters, pricePerLiter, mileage, expenseDate, id], cb);
  }

  static deleteById(id, cb) {
    db.query('DELETE FROM fuel_expenses WHERE id = ?', [id], cb);
  }

  static findByPeriod(year, month, cb) {
    const sql = `
      SELECT f.*, t.plate
      FROM fuel_expenses f
      JOIN trucks t ON f.truck_id = t.id
      WHERE YEAR(f.expense_date) = ? AND MONTH(f.expense_date) = ?
      ORDER BY f.expense_date DESC, f.id DESC
    `;
    db.query(sql, [year, month], cb);
  }
}

module.exports = FuelExpense;
