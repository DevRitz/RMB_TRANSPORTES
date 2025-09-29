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
  create(category, supplier, document, amount, expense_date, description, cb) {
    const sql = `
      INSERT INTO other_expenses (category, supplier, document, amount, expense_date, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [category, supplier, document, amount, expense_date, description], cb);
  },

  findAll(cb) {
    const sql = `
      SELECT id, category, supplier, document, amount, expense_date, description, created_at, updated_at
      FROM other_expenses
      ORDER BY expense_date DESC, id DESC
    `;
    db.query(sql, cb);
  },

  findById(id, cb) {
    const sql = `
      SELECT id, category, supplier, document, amount, expense_date, description, created_at, updated_at
      FROM other_expenses
      WHERE id = ?
      LIMIT 1
    `;
    db.query(sql, [id], cb);
  },

  // Filtro por período (YYYY, M)
  findByPeriod(year, month, cb) {
    const sql = `
      SELECT id, category, supplier, document, amount, expense_date, description, created_at, updated_at
      FROM other_expenses
      WHERE YEAR(expense_date) = ? AND MONTH(expense_date) = ?
      ORDER BY expense_date ASC, id ASC
    `;
    db.query(sql, [year, month], cb);
  },

  updateById(id, category, supplier, document, amount, expense_date, description, cb) {
    const sql = `
      UPDATE other_expenses
      SET category = ?, supplier = ?, document = ?, amount = ?, expense_date = ?, description = ?
      WHERE id = ?
    `;
    db.query(sql, [category, supplier, document, amount, expense_date, description, id], cb);
  },

  deleteById(id, cb) {
    const sql = `DELETE FROM other_expenses WHERE id = ?`;
    db.query(sql, [id], cb);
  },

  // Totalizador por período (útil para relatórios)
  sumByPeriod(year, month, cb) {
    const sql = `
      SELECT 
        COALESCE(SUM(amount), 0) AS total_other_expenses,
        COUNT(*) AS total_records
      FROM other_expenses
      WHERE YEAR(expense_date) = ? AND MONTH(expense_date) = ?
    `;
    db.query(sql, [year, month], cb);
  },

  // (Opcional) total por categoria em um período
  sumByCategory(year, month, cb) {
    const sql = `
      SELECT category, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS records
      FROM other_expenses
      WHERE YEAR(expense_date) = ? AND MONTH(expense_date) = ?
      GROUP BY category
      ORDER BY total DESC
    `;
    db.query(sql, [year, month], cb);
  },

  // Expor helper (se quiser reutilizar em controller)
  _toNumber: toNumber,
};

module.exports = OtherExpense;
