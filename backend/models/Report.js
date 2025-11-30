// models/Report.js
const db = require('../config/database');

/**
 * Resumo mensal geral (um registro por caminhão no período)
 */
exports.getGeneralMonthlySummary = async (year, month) => {
  const sql = `
    SELECT
      t.id,
      t.plate,
      COALESCE(r.total_revenue, 0)                 AS monthly_revenue,
      COALESCE(f.total_fuel, 0)                    AS monthly_fuel_expenses,
      COALESCE(d.total_driver, 0)                  AS monthly_driver_expenses,
      COALESCE(m.total_maintenance, 0)             AS monthly_maintenance_expenses,
      COALESCE(r.total_revenue, 0)
        - COALESCE(f.total_fuel, 0)
        - COALESCE(d.total_driver, 0)
        - COALESCE(m.total_maintenance, 0)         AS monthly_balance
    FROM trucks t
    /* receitas do mês */
    LEFT JOIN (
      SELECT truck_id, SUM(amount) AS total_revenue
      FROM revenues
      WHERE YEAR(revenue_date) = ? AND MONTH(revenue_date) = ?
      GROUP BY truck_id
    ) r ON r.truck_id = t.id
    /* combustível do mês */
    LEFT JOIN (
      SELECT truck_id, SUM(liters * price_per_liter) AS total_fuel
      FROM fuel_expenses
      WHERE YEAR(expense_date) = ? AND MONTH(expense_date) = ?
      GROUP BY truck_id
    ) f ON f.truck_id = t.id
    /* motorista do mês */
    LEFT JOIN (
      SELECT truck_id, SUM(amount) AS total_driver
      FROM driver_expenses
      WHERE YEAR(expense_date) = ? AND MONTH(expense_date) = ?
      GROUP BY truck_id
    ) d ON d.truck_id = t.id
    /* manutenção do mês */
    LEFT JOIN (
      SELECT truck_id, SUM(amount) AS total_maintenance
      FROM maintenance_expenses
      WHERE YEAR(expense_date) = ? AND MONTH(expense_date) = ?
      GROUP BY truck_id
    ) m ON m.truck_id = t.id
    ORDER BY t.plate
  `;
  const params = [year, month, year, month, year, month, year, month];
  const [rows] = await db.execute(sql, params);
  return rows;
};

/**
 * Resumo mensal de UM caminhão (no período)
 */
exports.getMonthlyTruckSummary = async (truckId, year, month) => {
  const sql = `
    SELECT
      t.id,
      t.plate,
      COALESCE(r.total_revenue, 0)                 AS monthly_revenue,
      COALESCE(f.total_fuel, 0)                    AS monthly_fuel_expenses,
      COALESCE(d.total_driver, 0)                  AS monthly_driver_expenses,
      COALESCE(m.total_maintenance, 0)             AS monthly_maintenance_expenses,
      COALESCE(r.total_revenue, 0)
        - COALESCE(f.total_fuel, 0)
        - COALESCE(d.total_driver, 0)
        - COALESCE(m.total_maintenance, 0)         AS monthly_balance
    FROM trucks t
    LEFT JOIN (
      SELECT truck_id, SUM(amount) AS total_revenue
      FROM revenues
      WHERE truck_id = ? AND YEAR(revenue_date) = ? AND MONTH(revenue_date) = ?
      GROUP BY truck_id
    ) r ON r.truck_id = t.id
    LEFT JOIN (
      SELECT truck_id, SUM(liters * price_per_liter) AS total_fuel
      FROM fuel_expenses
      WHERE truck_id = ? AND YEAR(expense_date) = ? AND MONTH(expense_date) = ?
      GROUP BY truck_id
    ) f ON f.truck_id = t.id
    LEFT JOIN (
      SELECT truck_id, SUM(amount) AS total_driver
      FROM driver_expenses
      WHERE truck_id = ? AND YEAR(expense_date) = ? AND MONTH(expense_date) = ?
      GROUP BY truck_id
    ) d ON d.truck_id = t.id
    LEFT JOIN (
      SELECT truck_id, SUM(amount) AS total_maintenance
      FROM maintenance_expenses
      WHERE truck_id = ? AND YEAR(expense_date) = ? AND MONTH(expense_date) = ?
      GROUP BY truck_id
    ) m ON m.truck_id = t.id
    WHERE t.id = ?
  `;
  const params = [
    truckId, year, month,
    truckId, year, month,
    truckId, year, month,
    truckId, year, month,
    truckId,
  ];
  const [rows] = await db.execute(sql, params);
  return rows;
};

/**
 * Balanço TOTAL do caminhão (todo o histórico)
 */
exports.getTruckBalance = async (truckId) => {
  const sql = `
    SELECT
      t.id,
      t.plate,
      COALESCE(r.total_revenue, 0)         AS total_revenue,
      COALESCE(f.total_fuel, 0)            AS total_fuel_expenses,
      COALESCE(d.total_driver, 0)          AS total_driver_expenses,
      COALESCE(m.total_maintenance, 0)     AS total_maintenance_expenses,
      COALESCE(r.total_revenue, 0)
        - COALESCE(f.total_fuel, 0)
        - COALESCE(d.total_driver, 0)
        - COALESCE(m.total_maintenance, 0) AS balance
    FROM trucks t
    LEFT JOIN (
      SELECT truck_id, SUM(amount) AS total_revenue
      FROM revenues
      WHERE truck_id = ?
      GROUP BY truck_id
    ) r ON r.truck_id = t.id
    LEFT JOIN (
      SELECT truck_id, SUM(liters * price_per_liter) AS total_fuel
      FROM fuel_expenses
      WHERE truck_id = ?
      GROUP BY truck_id
    ) f ON f.truck_id = t.id
    LEFT JOIN (
      SELECT truck_id, SUM(amount) AS total_driver
      FROM driver_expenses
      WHERE truck_id = ?
      GROUP BY truck_id
    ) d ON d.truck_id = t.id
    LEFT JOIN (
      SELECT truck_id, SUM(amount) AS total_maintenance
      FROM maintenance_expenses
      WHERE truck_id = ?
      GROUP BY truck_id
    ) m ON m.truck_id = t.id
    WHERE t.id = ?
  `;
  const params = [truckId, truckId, truckId, truckId, truckId];
  const [rows] = await db.execute(sql, params);
  return rows;
};

/**
 * Total gasto com motoristas no período (para o card da aba Despesas)
 */
exports.getDriverExpensesTotal = async (year, month) => {
  const sql = `
    SELECT
      COALESCE(SUM(amount), 0) AS total_driver_expenses,
      COUNT(*)                 AS total_records
    FROM driver_expenses
    WHERE YEAR(expense_date) = ? AND MONTH(expense_date) = ?
  `;
  const [rows] = await db.execute(sql, [year, month]);
  return rows;
};
