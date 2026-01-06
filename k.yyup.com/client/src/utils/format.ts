/**
 * 格式化工具函数
 */

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date 日期对象或日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '-';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 格式化数字，添加千分位分隔符
 * @param num 数字
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined || num === '') return '-';
  
  const n = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(n)) return '-';
  
  return n.toLocaleString();
}

/**
 * 格式化百分比
 * @param num 数字
 * @param decimals 小数位数，默认1位
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(num: number | string | null | undefined, decimals: number = 1): string {
  if (num === null || num === undefined || num === '') return '-';
  
  const n = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(n)) return '-';
  
  return `${n.toFixed(decimals)}%`;
}

/**
 * 格式化货币
 * @param num 数字
 * @param currency 货币符号，默认为¥
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(num: number | string | null | undefined, currency: string = '¥'): string {
  if (num === null || num === undefined || num === '') return '-';
  
  const n = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(n)) return '-';
  
  return `${currency}${n.toLocaleString()}`;
}
