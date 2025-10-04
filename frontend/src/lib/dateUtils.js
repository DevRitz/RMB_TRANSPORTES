/**
 * Utilitários para formatação de datas
 * Resolve problemas de fuso horário ao exibir datas do banco de dados
 */

/**
 * Formata uma data para exibição, tratando corretamente datas no formato YYYY-MM-DD
 * @param {string|Date} dateLike - Data para formatar
 * @returns {string} Data formatada no padrão brasileiro (DD/MM/YYYY)
 */
export const formatDate = (dateLike) => {
  if (!dateLike) return '-';

  // Se a data está no formato YYYY-MM-DD, trata como data local para evitar problemas de fuso horário
  if (typeof dateLike === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateLike)) {
    const [year, month, day] = dateLike.split('-').map(Number);
    const d = new Date(year, month - 1, day); // mês é 0-indexado no JavaScript
    return d.toLocaleDateString('pt-BR');
  }

  // Para outros formatos de data
  const d = new Date(dateLike);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
};

/**
 * Extrai ano e mês de uma data, tratando corretamente datas no formato YYYY-MM-DD
 * @param {string|Date} dateLike - Data para extrair ano e mês
 * @returns {Object} Objeto com propriedades year e month
 */
export const getYearMonth = (dateLike) => {
  if (!dateLike) return { year: null, month: null };

  // Se a data está no formato YYYY-MM-DD, extrai diretamente
  if (typeof dateLike === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateLike)) {
    const [year, month] = dateLike.split('-').map(Number);
    return { year, month };
  }

  // Para outros formatos
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return { year: null, month: null };
  
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

/**
 * Converte uma data para o formato YYYY-MM-DD
 * @param {Date|string} date - Data para converter
 * @returns {string} Data no formato YYYY-MM-DD
 */
export const toDateString = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};