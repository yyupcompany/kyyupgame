/**
 * 日期工具函数
 */

/**
 * 格式化日期时间
 * @param dateString 日期字符串
 * @returns 格式化后的日期时间字符串 (YYYY-MM-DD HH:mm:ss)
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('日期格式化错误:', error);
    return dateString;
  }
}

/**
 * 格式化日期
 * @param dateString 日期字符串或Date对象
 * @param format 格式化模式，默认为'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  dateString: string | Date | undefined | null,
  format: string = 'YYYY-MM-DD'
): string {
  if (!dateString) return '-';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return typeof dateString === 'string' ? dateString : '-';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    if (format === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`;
    }
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  } catch (error) {
    console.error('日期格式化错误:', error);
    return typeof dateString === 'string' ? dateString : '-';
  }
}

/**
 * 格式化时间
 * @param dateString 日期字符串
 * @returns 格式化后的时间字符串 (HH:mm:ss)
 */
export function formatTime(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('时间格式化错误:', error);
    return dateString;
  }
}

/**
 * 格式化为相对时间
 * @param dateString ISO日期字符串或Date对象
 * @returns 相对时间字符串，如"3天前"
 */
export function formatRelativeTime(dateString: string | Date | undefined | null): string {
  if (!dateString) return '-';

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return '-';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
      return '刚刚';
    }
    
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return `${diffMin}分钟前`;
    }
    
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) {
      return `${diffHour}小时前`;
    }
    
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) {
      return `${diffDay}天前`;
    }
    
    const diffMonth = Math.floor(diffDay / 30);
    if (diffMonth < 12) {
      return `${diffMonth}个月前`;
    }
    
    const diffYear = Math.floor(diffMonth / 12);
    return `${diffYear}年前`;
  } catch (error) {
    console.error('相对时间格式化错误:', error);
    return typeof dateString === 'string' ? dateString : '-';
  }
} 