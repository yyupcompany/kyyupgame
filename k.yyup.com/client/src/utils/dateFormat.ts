/**
 * 日期格式化工具函数
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
 * 格式化日期时间
 * @param dateStr 日期字符串或Date对象
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '-';
  
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '-';
  }
}

/**
 * 格式化时间
 * @param dateStr 日期字符串或Date对象
 * @returns 格式化后的时间字符串
 */
export function formatTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '-';
  
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('时间格式化错误:', error);
    return '-';
  }
}
