const db = require('../config/database');

class FuelExpense {
  static async create(truckId, liters, pricePerLiter, mileage, expenseDate) {
    const sql = `
      INSERT INTO fuel_expenses (truck_id, liters, price_per_liter, mileage, expense_date)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [truckId, liters, pricePerLiter, mileage, expenseDate]);
    return result;
  }

  static async findAll() {
    const sql = `
      SELECT f.*, t.plate
      FROM fuel_expenses f
      JOIN trucks t ON f.truck_id = t.id
      ORDER BY f.expense_date DESC, f.id DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  static async findByTruckId(truckId) {
    const sql = `
      SELECT f.*, t.plate
      FROM fuel_expenses f
      JOIN trucks t ON f.truck_id = t.id
      WHERE f.truck_id = ?
      ORDER BY f.expense_date DESC, f.id DESC
    `;
    const [rows] = await db.execute(sql, [truckId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM fuel_expenses WHERE id = ?', [id]);
    return rows;
  }

  static async updateById(id, truckId, liters, pricePerLiter, mileage, expenseDate) {
    const sql = `
      UPDATE fuel_expenses SET truck_id=?, liters=?, price_per_liter=?, mileage=?, expense_date=? WHERE id=?
    `;
    const [result] = await db.execute(sql, [truckId, liters, pricePerLiter, mileage, expenseDate, id]);
    return result;
  }

  static async deleteById(id) {
    const [result] = await db.execute('DELETE FROM fuel_expenses WHERE id = ?', [id]);
    return result;
  }

  static async findByPeriod(year, month) {
    const sql = `
      SELECT f.*, t.plate
      FROM fuel_expenses f
      JOIN trucks t ON f.truck_id = t.id
      WHERE YEAR(f.expense_date) = ? AND MONTH(f.expense_date) = ?
      ORDER BY f.expense_date DESC, f.id DESC
    `;
    const [rows] = await db.execute(sql, [year, month]);
    return rows;
  }
}

module.exports = FuelExpense;
