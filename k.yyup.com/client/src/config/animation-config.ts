/**
 * 动画配置系统
 * 用于统一管理系统中的动画时长、延迟和缓动函数
 */

export interface AnimationConfig {
  // 动画时长配置
  duration: {
    instant: number;     // 0ms - 立即执行
    fast: number;        // 150ms - 快速动画
    normal: number;      // 300ms - 正常动画
    slow: number;        // 500ms - 慢速动画
    slower: number;      // 800ms - 更慢动画
    slowest: number;     // 1200ms - 最慢动画
  };

  // 延迟时间配置
  delay: {
    none: number;        // 0ms - 无延迟
    short: number;       // 100ms - 短延迟
    normal: number;      // 200ms - 正常延迟
    medium: number;      // 500ms - 中等延迟
    long: number;        // 1000ms - 长延迟
    longer: number;      // 2000ms - 更长延迟
  };

  // 缓动函数配置
  easing: {
    linear: string;      // 线性
    easeIn: string;       // 缓入
    easeOut: string;      // 缓出
    easeInOut: string;    // 缓入缓出
    easeInQuad: string;   // 二次方缓入
    easeOutQuad: string;  // 二次方缓出
    easeInCubic: string;  // 三次方缓入
    easeOutCubic: string; // 三次方缓出
    easeInBack: string;   // 回弹缓入
    easeOutBack: string;  // 回弹缓出
    easeInBounce: string; // 弹跳缓入
    easeOutBounce: string;// 弹跳缓出
  };

  // 动画类型配置
  types: {
    fadeIn: {
      duration: number;
      easing: string;
      delay: number;
    };
    fadeOut: {
      duration: number;
      easing: string;
      delay: number;
    };
    slideIn: {
      duration: number;
      easing: string;
      delay: number;
    };
    slideOut: {
      duration: number;
      easing: string;
      delay: number;
    };
    scaleIn: {
      duration: number;
      easing: string;
      delay: number;
    };
    scaleOut: {
      duration: number;
      easing: string;
      delay: number;
    };
    rotateIn: {
      duration: number;
      easing: string;
      delay: number;
    };
    rotateOut: {
      duration: number;
      easing: string;
      delay: number;
    };
  };

  // 序列动画配置
  sequence: {
    staggerDelay: number;  // 序列动画间隔延迟
    maxItems: number;      // 最大序列项目数
  };

  // 加载动画配置
  loading: {
    spinnerDuration: number;  // 旋转动画周期
    pulseDuration: number;    // 脉冲动画周期
    bounceDuration: number;   // 弹跳动画周期
  };

  // 过渡动画配置
  transition: {
    routeChange: number;      // 路由切换动画
    pageLoad: number;         // 页面加载动画
    modalShow: number;        // 模态框显示动画
    modalHide: number;        // 模态框隐藏动画
    tooltipShow: number;      // 提示框显示动画
    tooltipHide: number;      // 提示框隐藏动画
  };
}

// 默认动画配置
export const defaultAnimationConfig: AnimationConfig = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
    slowest: 1200
  },

  delay: {
    none: 0,
    short: 100,
    normal: 200,
    medium: 500,
    long: 1000,
    longer: 2000
  },

  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
    easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    easeInBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    easeOutBounce: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
  },

  types: {
    fadeIn: {
      duration: 300,
      easing: 'easeOut',
      delay: 0
    },
    fadeOut: {
      duration: 200,
      easing: 'easeIn',
      delay: 0
    },
    slideIn: {
      duration: 400,
      easing: 'easeOutBack',
      delay: 0
    },
    slideOut: {
      duration: 300,
      easing: 'easeInBack',
      delay: 0
    },
    scaleIn: {
      duration: 200,
      easing: 'easeOutBack',
      delay: 0
    },
    scaleOut: {
      duration: 150,
      easing: 'easeInBack',
      delay: 0
    },
    rotateIn: {
      duration: 600,
      easing: 'easeOutBack',
      delay: 0
    },
    rotateOut: {
      duration: 400,
      easing: 'easeInBack',
      delay: 0
    }
  },

  sequence: {
    staggerDelay: 100,
    maxItems: 10
  },

  loading: {
    spinnerDuration: 1000,
    pulseDuration: 1500,
    bounceDuration: 800
  },

  transition: {
    routeChange: 300,
    pageLoad: 500,
    modalShow: 200,
    modalHide: 150,
    tooltipShow: 150,
    tooltipHide: 100
  }
};

// 动画配置管理器
export class AnimationConfigManager {
  private static config: AnimationConfig = defaultAnimationConfig;

  /**
   * 获取动画配置
   */
  static getConfig(): AnimationConfig {
    return this.config;
  }

  /**
   * 更新动画配置
   */
  static updateConfig(newConfig: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 重置为默认配置
   */
  static resetToDefault(): void {
    this.config = defaultAnimationConfig;
  }

  /**
   * 获取动画时长
   */
  static getDuration(type: keyof AnimationConfig['duration']): number {
    return this.config.duration[type];
  }

  /**
   * 获取延迟时间
   */
  static getDelay(type: keyof AnimationConfig['delay']): number {
    return this.config.delay[type];
  }

  /**
   * 获取缓动函数
   */
  static getEasing(type: keyof AnimationConfig['easing']): string {
    return this.config.easing[type];
  }

  /**
   * 获取动画类型配置
   */
  static getAnimationType(type: keyof AnimationConfig['types']): AnimationConfig['types'][keyof AnimationConfig['types']] {
    return this.config.types[type];
  }

  /**
   * 获取序列动画延迟
   */
  static getSequenceDelay(index: number): number {
    return index * this.config.sequence.staggerDelay;
  }

  /**
   * 生成CSS动画属性
   */
  static generateCSSAnimation(
    type: keyof AnimationConfig['types'],
    customDuration?: number,
    customDelay?: number,
    customEasing?: string
  ): string {
    const animationType = this.getAnimationType(type);
    const duration = customDuration || animationType.duration;
    const delay = customDelay || animationType.delay;
    const easing = customEasing || this.getEasing(animationType.easing as keyof AnimationConfig['easing']);

    return `${duration}ms ${easing} ${delay}ms`;
  }

  /**
   * 生成CSS过渡属性
   */
  static generateCSSTransition(
    properties: string,
    duration: keyof AnimationConfig['duration'] = 'normal',
    easing: keyof AnimationConfig['easing'] = 'easeInOut',
    delay: keyof AnimationConfig['delay'] = 'none'
  ): string {
    const durationMs = this.getDuration(duration);
    const delayMs = this.getDelay(delay);
    const easingFn = this.getEasing(easing);

    return `${properties} ${durationMs}ms ${easingFn} ${delayMs}ms`;
  }

  /**
   * 创建setTimeout的配置化版本
   */
  static setTimeout(callback: () => void, delay: keyof AnimationConfig['delay']): number {
    return window.setTimeout(callback, this.getDelay(delay));
  }

  /**
   * 创建setInterval的配置化版本
   */
  static setInterval(callback: () => void, interval: keyof AnimationConfig['duration']): number {
    return window.setInterval(callback, this.getDuration(interval));
  }

  /**
   * 创建防抖函数的配置化版本
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: keyof AnimationConfig['duration'] = 'normal',
    immediate = false
  ): (...args: Parameters<T>) => void {
    let timeout: number | null = null;

    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };

      const callNow = immediate && !timeout;

      if (timeout) clearTimeout(timeout);
      timeout = window.setTimeout(later, this.getDuration(wait));

      if (callNow) func(...args);
    };
  }

  /**
   * 创建节流函数的配置化版本
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: keyof AnimationConfig['duration'] = 'normal'
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        this.setTimeout(() => {
          inThrottle = false;
        }, 'normal');
      }
    };
  }

  /**
   * 获取推荐动画配置
   */
  static getRecommendedAnimation(purpose: string): {
    duration: keyof AnimationConfig['duration'];
    easing: keyof AnimationConfig['easing'];
    delay: keyof AnimationConfig['delay'];
  } {
    const recommendations: Record<string, {
      duration: keyof AnimationConfig['duration'];
      easing: keyof AnimationConfig['easing'];
      delay: keyof AnimationConfig['delay'];
    }> = {
      'tooltip': { duration: 'fast', easing: 'easeOut', delay: 'none' },
      'modal': { duration: 'normal', easing: 'easeOut', delay: 'none' },
      'slide': { duration: 'slow', easing: 'easeOut', delay: 'short' },
      'fade': { duration: 'normal', easing: 'easeInOut', delay: 'none' },
      'loading': { duration: 'slow', easing: 'easeInOut', delay: 'none' },
      'success': { duration: 'fast', easing: 'easeOut', delay: 'none' },
      'error': { duration: 'fast', easing: 'easeOut', delay: 'none' },
      'navigation': { duration: 'normal', easing: 'easeInOut', delay: 'none' }
    };

    return recommendations[purpose] || {
      duration: 'normal',
      easing: 'easeInOut',
      delay: 'none'
    };
  }

  /**
   * 检查动画配置是否合理
   */
  static validateAnimationConfig(config: Partial<AnimationConfig>): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let isValid = true;

    // 检查时长是否合理
    if (config.duration) {
      Object.entries(config.duration).forEach(([key, value]) => {
        if (value < 0) {
          warnings.push(`动画时长 ${key} 不能为负数`);
          isValid = false;
        }
        if (value > 5000) {
          warnings.push(`动画时长 ${key} 过长，可能影响用户体验`);
        }
      });
    }

    // 检查延迟是否合理
    if (config.delay) {
      Object.entries(config.delay).forEach(([key, value]) => {
        if (value < 0) {
          warnings.push(`延迟时间 ${key} 不能为负数`);
          isValid = false;
        }
        if (value > 10000) {
          warnings.push(`延迟时间 ${key} 过长，可能影响用户体验`);
        }
      });
    }

    return { isValid, warnings };
  }

  /**
   * 生成CSS变量
   */
  static generateCSSVariables(): string {
    const cssVars: string[] = [];

    // 动画时长变量
    Object.entries(this.config.duration).forEach(([key, value]) => {
      cssVars.push(`  --animation-duration-${key}: ${value}ms;`);
    });

    // 延迟时间变量
    Object.entries(this.config.delay).forEach(([key, value]) => {
      cssVars.push(`  --animation-delay-${key}: ${value}ms;`);
    });

    // 缓动函数变量
    Object.entries(this.config.easing).forEach(([key, value]) => {
      cssVars.push(`  --animation-easing-${key}: ${value};`);
    });

    // 序列动画变量
    cssVars.push(`  --animation-stagger-delay: ${this.config.sequence.staggerDelay}ms;`);

    // 加载动画变量
    cssVars.push(`  --loading-spinner-duration: ${this.config.loading.spinnerDuration}ms;`);
    cssVars.push(`  --loading-pulse-duration: ${this.config.loading.pulseDuration}ms;`);
    cssVars.push(`  --loading-bounce-duration: ${this.config.loading.bounceDuration}ms;`);

    return cssVars.join('\n');
  }

  /**
   * 应用CSS变量到页面
   */
  static applyCSSVariables(): void {
    const root = document.documentElement;
    const cssVariables = this.generateCSSVariables();

    // 创建style元素
    const styleElement = document.createElement('style');
    styleElement.textContent = `:root {\n${cssVariables}\n}`;

    // 添加到head中
    document.head.appendChild(styleElement);
  }
}

export default AnimationConfigManager;