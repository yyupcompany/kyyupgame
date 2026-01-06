// 颜色映射表 - 将硬编码颜色映射到设计令牌
const colorMap = {
  // Element Plus 默认颜色
  '#409eff': 'var(--primary-color)',
  '#79bbff': 'var(--primary-light)',
  '#337ecc': 'var(--primary-hover)',
  '#267cbe': 'var(--primary-darker)',
  
  // 功能色
  '#67c23a': 'var(--success-color)',
  '#85ce61': 'var(--success-light)',
  '#e6a23c': 'var(--warning-color)',
  '#ebb563': 'var(--warning-light)',
  '#f56c6c': 'var(--danger-color)',
  '#f78989': 'var(--danger-light)',
  '#909399': 'var(--info-color)',
  '#a6a9ad': 'var(--info-light)',
  
  // 文本色
  '#303133': 'var(--text-primary)',
  '#606266': 'var(--text-regular)',
  '#909399': 'var(--text-secondary)',
  '#a8abb2': 'var(--text-tertiary)',
  '#c0c4cc': 'var(--text-placeholder)',
  '#dcdfe6': 'var(--text-disabled)',
  
  // 背景色
  '#ffffff': 'var(--bg-color)',
  '#f2f3f5': 'var(--bg-color-page)',
  '#f5f7fa': 'var(--bg-hover)',
  '#fafafa': 'var(--bg-tertiary)',
  
  // 边框色
  '#dcdfe6': 'var(--border-color)',
  '#e4e7ed': 'var(--border-color-light)',
  '#ebeef5': 'var(--border-color-lighter)',
  '#f2f6fc': 'var(--border-color-extra-light)',
  
  // 暗色主题颜色
  '#1d1e1f': 'var(--bg-primary-dark)',
  '#1e293b': 'var(--bg-card-dark)',
  '#334155': 'var(--bg-hover-dark)',
  '#f8fafc': 'var(--text-primary-dark)',
  '#cbd5e1': 'var(--text-secondary-dark)',
  '#94a3b8': 'var(--text-muted-dark)',
  
  // 常见的渐变色
  'linear-gradient(135deg, #409eff 0%, #79bbff 100%)': 'var(--gradient-primary)',
  'linear-gradient(135deg, #67c23a 0%, #85ce61 100%)': 'var(--gradient-success)',
  'linear-gradient(135deg, #e6a23c 0%, #ebb563 100%)': 'var(--gradient-warning)',
  'linear-gradient(135deg, #f56c6c 0%, #f78989 100%)': 'var(--gradient-danger)',
  
  // 中心点缀色
  '#6366F1': 'var(--accent-personnel)',
  '#3B82F6': 'var(--accent-enrollment)',
  '#F59E0B': 'var(--accent-activity)',
  '#8B5CF6': 'var(--accent-marketing)',
  '#06B6D4': 'var(--accent-system)',
  '#0EA5E9': 'var(--accent-ai)',
  
  // 其他常见颜色
  '#000000': 'var(--text-primary)', // 在某些上下文中
  '#333333': 'var(--text-regular)',
  '#666666': 'var(--text-secondary)',
  '#999999': 'var(--text-placeholder)',
  '#cccccc': 'var(--border-color-light)',
  '#eeeeee': 'var(--bg-hover)',
  '#f5f5f5': 'var(--bg-secondary)',
  '#fafafa': 'var(--bg-tertiary)',
  
  // 特殊处理：保留IME相关颜色
  // 这些颜色不会被自动替换，需要手动处理
};

// 需要特殊处理的颜色（IME、输入框等）
const specialColors = [
  '#f8f9fa', // 常用于输入框背景
  '#ffffff', // 纯白，需要根据上下文判断
  '#000000', // 纯黑，需要根据上下文判断
];

// 颜色替换函数
function replaceColors(content) {
  let replacedContent = content;
  
  // 替换所有映射的颜色
  Object.entries(colorMap).forEach(([hexColor, cssVar]) => {
    // 替换各种格式的颜色值
    const patterns = [
      new RegExp(`color:\s*${hexColor}`, 'gi'),
      new RegExp(`background:\s*${hexColor}`, 'gi'),
      new RegExp(`background-color:\s*${hexColor}`, 'gi'),
      new RegExp(`border-color:\s*${hexColor}`, 'gi'),
      new RegExp(`border:\s*1px solid ${hexColor}`, 'gi'),
      new RegExp(`"${hexColor}"`, 'g'),
      new RegExp(`'${hexColor}'`, 'g'),
    ];
    
    patterns.forEach(pattern => {
      replacedContent = replacedContent.replace(pattern, (match) => {
        const property = match.split(':')[0];
        return `${property}: ${cssVar}`;
      });
    });
  });
  
  return replacedContent;
}

// 检测是否需要特殊处理的颜色
function needsSpecialHandling(content, color) {
  // IME相关检测
  if (content.includes('ime') || content.includes('input') || content.includes('composition')) {
    return true;
  }
  
  // 输入框相关检测
  if (content.includes('el-input') || content.includes('textarea') || content.includes('form')) {
    return true;
  }
  
  // 特殊组件检测
  if (content.includes('markdown') || content.includes('editor') || content.includes('rich-text')) {
    return true;
  }
  
  return false;
}

export {
  colorMap,
  specialColors,
  replaceColors,
  needsSpecialHandling
};