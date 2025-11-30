// backend/models/OtherExpense.js
const db = require('../config/database');

// Helpers
const toNumber = (v) => {
  if (v == null || v === '') return 0;
  const s = String(v).trim();
  // "1.234,56" -> "1234.56" | "10.000" -> "10000"
  if (s.includes(',')) return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  // se for padrão milhar com ponto: 1.234 / 10.000 / 1.234.567
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) return parseFloat(s.replace(/\./g, '')) || 0;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

const OtherExpense = {
  async create(category, supplier, document, amount, expense_date, description) {
    const sql = `
      INSERT INTO other_expenses (category, supplier, document, amount, expense_date, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [category, supplier, document, amount, expense_date, description]);
    return result;
  },

  async findAll() {
    const sql = `
      SELECT id, category, supplier, document, amount, expense_date, description, created_at, updated_at
      FROM other_expenses
      ORDER BY expense_date DESC, id DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  async findById(id) {
    const sql = `
      SELECT id, category, supplier, document, amount, expense_date, description, created_at, updated_at
      FROM other_expenses
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows;
  },

  // Filtro por período (YYYY, M)
  async findByPeriod(year, month) {
    const sql = `
      SELECT id, category, supplier, document, amount, expense_date, description, created_at, updated_at
      FROM other_expenses
      WHERE YEAR(expense_date) = ? AND MONTH(expense_date) = ?
      ORDER BY expense_date ASC, id ASC
    `;
    const [rows] = await db.execute(sql, [year, month]);
    return rows;
  },

  async updateById(id, category, supplier, document, amount, expense_date, description) {
    const sql = `
      UPDATE other_expenses
      SET category = ?, supplier = ?, document = ?, amount = ?, expense_date = ?, description = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [category, supplier, document, amount, expense_date, description, id]);
    return result;
  },

  async deleteById(id) {
    const sql = `DELETE FROM other_expenses WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result;
  },

  // Totalizador por período (útil para relatórios)
  async sumByPeriod(year, month) {
    const sql = `
      SELECT 
        COALESCE(SUM(amount), 0) AS total_other_expenses,
        COUNT(*) AS total_records
      FROM other_expenses
      WHERE YEAR(expense_date) = ? AND MONTH(expense_date) = ?
    `;
    const [rows] = await db.execute(sql, [year, month]);
    return rows;
  },

  // (Opcional) total por categoria em um período
  async sumByCategory(year, month) {
    const sql = `
      SELECT category, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS records
      FROM other_expenses
      WHERE YEAR(expense_date) = ? AND MONTH(expense_date) = ?
      GROUP BY category
      ORDER BY total DESC
    `;
    const [rows] = await db.execute(sql, [year, month]);
    return rows;
  },

  // Expor helper (se quiser reutilizar em controller)
  _toNumber: toNumber,
};

module.exports = OtherExpense;
