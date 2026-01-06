// 使用 date-fns 替代 dayjs
import { format, addDays, addMonths, addYears, isValid, parse } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 创建一个简单的模拟 dayjs 功能的对象
function createDateWrapper(date) {
  const d = date ? new Date(date) : new Date();
  
  return {
    // 格式化方法
    format(formatStr) {
      // 简单映射 dayjs 格式到 date-fns 格式
      const formatMap = {
        'YYYY': 'yyyy',
        'YY': 'yy',
        'MM': 'MM',
        'M': 'M',
        'DD': 'dd',
        'D': 'd',
        'HH': 'HH',
        'H': 'H',
        'mm': 'mm',
        'm': 'm',
        'ss': 'ss',
        's': 's',
        'A': 'a',
        'a': 'a',
      };
      
      // 转换格式字符串
      let dateFnsFormat = formatStr;
      Object.entries(formatMap).forEach(([dayjsToken, dateFnsToken]) => {
        dateFnsFormat = dateFnsFormat.replace(new RegExp(dayjsToken, 'g'), dateFnsToken);
      });
      
      return format(d, dateFnsFormat);
    },
    
    // 添加时间方法
    add(amount, unit) {
      let newDate = d;
      
      switch(unit) {
        case 'day':
        case 'days':
          newDate = addDays(d, amount);
          break;
        case 'month':
        case 'months':
          newDate = addMonths(d, amount);
          break;
        case 'year':
        case 'years':
          newDate = addYears(d, amount);
          break;
        default:
          newDate = d;
      }
      
      return createDateWrapper(newDate);
    },
    
    // 日期校验
    isValid() {
      return isValid(d);
    },
    
    // 获取原始 Date 对象
    toDate() {
      return d;
    }
  };
}

// 创建主函数
export function dayjs(date) {
  return createDateWrapper(date);
}

// 添加静态方法
dayjs.extend = function() {
  // 不执行任何操作，仅为兼容性提供
  console.warn('dayjs.extend() 已被 date-fns 替代，此调用不执行任何操作');
  return dayjs;
};

// 判断是否为 dayjs 对象
dayjs.isDayjs = function(obj) {
  return obj && typeof obj.format === 'function';
};

// 提供默认导出
export default dayjs; 