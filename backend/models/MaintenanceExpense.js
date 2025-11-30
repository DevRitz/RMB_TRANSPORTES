const db = require('../config/database');

class MaintenanceExpense {
  // Criar
  static async create(truckId, amount, mileage, description, expenseDate) {
    const sql = `
      INSERT INTO maintenance_expenses (truck_id, amount, mileage, description, expense_date)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [truckId, amount, mileage, description, expenseDate]);
    return result;
  }

  // Listar todas
  static async findAll() {
    const sql = `
      SELECT m.*, t.plate
      FROM maintenance_expenses m
      JOIN trucks t ON m.truck_id = t.id
      ORDER BY m.expense_date DESC, m.id DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  // Listar por caminhão
  static async findByTruckId(truckId) {
    const sql = `
      SELECT m.*, t.plate
      FROM maintenance_expenses m
      JOIN trucks t ON m.truck_id = t.id
      WHERE m.truck_id = ?
      ORDER BY m.expense_date DESC, m.id DESC
    `;
    const [rows] = await db.execute(sql, [truckId]);
    return rows;
  }

  // 🔹 Listar por período (ANO/MÊS)
  static async findByPeriod(year, month) {
    const sql = `
      SELECT m.*, t.plate
      FROM maintenance_expenses m
      JOIN trucks t ON m.truck_id = t.id
      WHERE YEAR(m.expense_date) = ? AND MONTH(m.expense_date) = ?
      ORDER BY m.expense_date DESC, m.id DESC
    `;
    const [rows] = await db.execute(sql, [year, month]);
    return rows;
  }

  // Buscar por ID (para edição)
  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM maintenance_expenses WHERE id = ?', [id]);
    return rows;
  }

  // Atualizar por ID
  static async updateById(id, truckId, amount, mileage, description, expenseDate) {
    const sql = `
      UPDATE maintenance_expenses
      SET truck_id = ?, amount = ?, mileage = ?, description = ?, expense_date = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [truckId, amount, mileage, description, expenseDate, id]);
    return result;
  }

  // Deletar por ID
  static async deleteById(id) {
    const [result] = await db.execute('DELETE FROM maintenance_expenses WHERE id = ?', [id]);
    return result;
  }
}

module.exports = MaintenanceExpense;
