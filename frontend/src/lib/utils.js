import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um número para moeda brasileira (ex: 1234.56 -> "1.234,56")
 */
export function formatCurrency(value) {
  if (value == null || value === '') return '';
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/\./g, '').replace(',', '.'));
  if (!Number.isFinite(num)) return '';
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Converte um número para formato de input com máscara (multiplica por 100 e formata)
 * Ex: 5.75 -> "575" -> currencyMask -> "5,75"
 */
export function toMaskedInput(value) {
  if (value == null || value === '') return '';
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (!Number.isFinite(num)) return '';
  // Multiplica por 100 e formata
  const cents = Math.round(num * 100);
  return currencyMask(String(cents));
}

/**
 * Máscara de moeda brasileira para input (ex: "10345" -> "103,45")
 * Aceita apenas dígitos e formata automaticamente com vírgula para centavos
 */
export function currencyMask(value) {
  if (!value) return '';
  
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  
  // Converte para número e divide por 100 para ter os centavos
  const num = parseInt(digits, 10) / 100;
  
  // Formata com separador de milhar e vírgula decimal
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Remove a máscara de moeda e retorna o número (ex: "1.234,56" -> 1234.56)
 */
export function parseCurrency(value) {
  if (value == null || value === '') return 0;
  const s = String(value).trim();
  const num = parseFloat(s.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(num) ? num : 0;
}

