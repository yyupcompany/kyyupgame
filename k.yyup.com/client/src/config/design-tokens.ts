/**
 * 设计令牌系统
 * 用于统一管理系统中的UI尺寸、颜色、字体等设计规范
 */

// 颜色系统
export const colorTokens = {
  // 主色调
  primary: {
    50: '#e8f4fd',
    100: '#c6e6fb',
    200: '#9dd0f7',
    300: '#6eb4f1',
    400: '#4a94ea',
    500: '#409eff', // 主色
    600: '#3684e3',
    700: '#2b6fc7',
    800: '#2459a7',
    900: '#1e498b'
  },

  // 成功色
  success: {
    50: '#f0f9ff',
    100: '#dcfde7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#67c23a', // 成功色
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },

  // 警告色
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#e6a23c', // 警告色
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },

  // 危险色
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#f56c6c', // 危险色
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },

  // 中性色
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },

  // 文本色
  text: {
    primary: '#303133',
    regular: '#606266',
    secondary: '#909399',
    placeholder: '#a8abb2',
    disabled: '#c0c4cc'
  },

  // 边框色
  border: {
    light: '#ebeef5',
    base: '#dcdfe6',
    dark: '#cdd0d6'
  },

  // 背景色
  background: {
    primary: '#ffffff',
    secondary: '#f5f7fa',
    tertiary: '#fafafa'
  }
};

// 尺寸系统
export const sizeTokens = {
  // 间距
  spacing: {
    xs: '4px',    // 0.25rem
    sm: '8px',    // 0.5rem
    md: '16px',   // 1rem
    lg: '24px',   // 1.5rem
    xl: '32px',   // 2rem
    xxl: '48px',  // 3rem
    xxxl: '64px'  // 4rem
  },

  // 圆角
  borderRadius: {
    none: '0',
    sm: '4px',
    base: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },

  // 阴影
  shadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },

  // 字体大小
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '30px',
    huge: '36px'
  },

  // 行高
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2'
  },

  // 字重
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },

  // 组件尺寸
  component: {
    // 按钮高度
    buttonHeight: {
      sm: '32px',
      md: '40px',
      lg: '48px'
    },

    // 输入框高度
    inputHeight: {
      sm: '32px',
      md: '40px',
      lg: '48px'
    },

    // 卡片
    card: {
      padding: '24px',
      borderRadius: '8px',
      shadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)'
    },

    // 头像
    avatar: {
      xs: '24px',
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '64px'
    },

    // 图标
    icon: {
      xs: '12px',
      sm: '16px',
      md: '20px',
      lg: '24px',
      xl: '32px'
    }
  },

  // 布局
  layout: {
    // 容器最大宽度
    containerMaxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      xxl: '1536px'
    },

    // 侧边栏
    sidebar: {
      width: '240px',
      collapsedWidth: '64px'
    },

    // 头部
    header: {
      height: '60px'
    },

    // 标签页
    tabs: {
      height: '40px'
    },

    // 表格
    table: {
      cellPadding: '12px 16px',
      headerHeight: '48px',
      rowHeight: '56px'
    },

    // 分页
    pagination: {
      height: '32px',
      itemWidth: '32px'
    }
  }
};

// 动画系统
export const animationTokens = {
  // 过渡时长
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },

  // 缓动函数
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// 响应式断点
export const breakpointTokens = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px'
};

// Z-index层级
export const zIndexTokens = {
  hide: -1,
  auto: 'auto',
  base: 1,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
};

// 设计令牌管理器
export class DesignTokenManager {
  private static tokens = {
    colors: colorTokens,
    sizes: sizeTokens,
    animations: animationTokens,
    breakpoints: breakpointTokens,
    zIndex: zIndexTokens
  };

  /**
   * 获取颜色令牌
   */
  static getColor(path: string): string {
    return this.getNestedValue(this.tokens.colors, path);
  }

  /**
   * 获取尺寸令牌
   */
  static getSize(path: string): string {
    return this.getNestedValue(this.tokens.sizes, path);
  }

  /**
   * 获取动画令牌
   */
  static getAnimation(path: string): string {
    return this.getNestedValue(this.tokens.animations, path);
  }

  /**
   * 获取断点令牌
   */
  static getBreakpoint(name: string): string {
    return this.tokens.breakpoints[name as keyof typeof breakpointTokens] || name;
  }

  /**
   * 获取z-index令牌
   */
  static getZIndex(name: string): number {
    return this.tokens.zIndex[name as keyof typeof zIndexTokens] || 1;
  }

  /**
   * 获取嵌套对象的值
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * 生成CSS变量
   */
  static generateCSSVariables(): string {
    const cssVars: string[] = [];

    // 颜色变量
    Object.entries(this.tokens.colors).forEach(([category, values]) => {
      if (typeof values === 'object' && !Array.isArray(values)) {
        Object.entries(values).forEach(([key, value]) => {
          if (typeof value === 'string') {
            cssVars.push(`  --color-${category}-${key}: ${value};`);
          }
        });
      }
    });

    // 尺寸变量
    Object.entries(this.tokens.sizes).forEach(([category, values]) => {
      if (typeof values === 'object' && !Array.isArray(values)) {
        Object.entries(values).forEach(([key, value]) => {
          if (typeof value === 'string') {
            cssVars.push(`  --size-${category}-${key}: ${value};`);
          }
        });
      }
    });

    return cssVars.join('\n');
  }

  /**
   * 应用CSS变量到根元素
   */
  static applyCSSVariables(): void {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        ${this.generateCSSVariables()}
      }
    `;
    document.head.appendChild(style);
  }
}

export default DesignTokenManager;