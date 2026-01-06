/**
 * 视觉调试工具 - 用于精确测量和标注页面布局
 * Visual Debugger - For precise layout measurement and annotation
 */

class VisualDebugger {
  constructor() {
    this.overlayId = 'visual-debugger-overlay';
    this.measurements = [];
    this.isActive = false;
  }

  // 初始化调试器
  init() {
    if (this.isActive) return;
    
    this.createOverlay();
    this.attachStyles();
    this.isActive = true;
    console.log('🔍 Visual Debugger 已启动');
  }

  // 创建覆盖层
  createOverlay() {
    // 移除已存在的覆盖层
    const existing = document.getElementById(this.overlayId);
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = this.overlayId;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 99999;
      font-family: monospace;
    `;
    document.body.appendChild(overlay);
  }

  // 添加样式
  attachStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .vd-measurement {
        position: absolute;
        background: rgba(255, 0, 0, 0.1);
        border: 2px solid #ff0000;
        pointer-events: none;
        box-sizing: border-box;
      }
      .vd-label {
        position: absolute;
        background: #ff0000;
        color: white;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: bold;
        border-radius: 4px;
        white-space: nowrap;
        z-index: 100000;
        font-family: monospace;
        line-height: 1;
      }
      .vd-grid-line {
        position: absolute;
        background: rgba(0, 255, 0, 0.3);
        pointer-events: none;
      }
      .vd-ruler {
        position: absolute;
        background: rgba(0, 0, 255, 0.8);
        color: white;
        font-size: 10px;
        padding: 2px 4px;
        font-family: monospace;
      }
      .vd-gap-indicator {
        position: absolute;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 5px,
          rgba(255, 165, 0, 0.5) 5px,
          rgba(255, 165, 0, 0.5) 10px
        );
        border: 2px dashed orange;
      }
    `;
    document.head.appendChild(style);
  }

  // 测量元素
  measureElement(selector, label) {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`元素未找到: ${selector}`);
      return null;
    }

    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    const measurement = {
      selector,
      label,
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      right: rect.right,
      bottom: rect.bottom,
      // 计算实际占用空间（包括margin）
      outerWidth: rect.width + parseFloat(computedStyle.marginLeft) + parseFloat(computedStyle.marginRight),
      outerHeight: rect.height + parseFloat(computedStyle.marginTop) + parseFloat(computedStyle.marginBottom),
      // 样式信息
      styles: {
        position: computedStyle.position,
        display: computedStyle.display,
        marginLeft: computedStyle.marginLeft,
        marginRight: computedStyle.marginRight,
        paddingLeft: computedStyle.paddingLeft,
        paddingRight: computedStyle.paddingRight,
        left: computedStyle.left,
        transform: computedStyle.transform,
        width: computedStyle.width
      }
    };

    this.measurements.push(measurement);
    this.drawMeasurement(measurement);
    
    return measurement;
  }

  // 绘制测量结果
  drawMeasurement(measurement) {
    const overlay = document.getElementById(this.overlayId);
    if (!overlay) return;

    // 创建测量框
    const box = document.createElement('div');
    box.className = 'vd-measurement';
    box.style.cssText = `
      left: ${measurement.left}px;
      top: ${measurement.top}px;
      width: ${measurement.width}px;
      height: ${measurement.height}px;
    `;
    
    // 创建标签
    const label = document.createElement('div');
    label.className = 'vd-label';
    label.textContent = `${measurement.label}: ${Math.round(measurement.width)}x${Math.round(measurement.height)}px @ (${Math.round(measurement.left)}, ${Math.round(measurement.top)})`;
    label.style.cssText = `
      left: ${measurement.left}px;
      top: ${measurement.top - 25}px;
    `;

    overlay.appendChild(box);
    overlay.appendChild(label);
  }

  // 测量间隙
  measureGap(selector1, selector2, label = 'Gap') {
    const elem1 = document.querySelector(selector1);
    const elem2 = document.querySelector(selector2);
    
    if (!elem1 || !elem2) {
      console.warn('无法测量间隙：元素未找到');
      return null;
    }

    const rect1 = elem1.getBoundingClientRect();
    const rect2 = elem2.getBoundingClientRect();
    
    // 计算水平间隙（假设elem1在左，elem2在右）
    const horizontalGap = rect2.left - rect1.right;
    // 计算垂直间隙（假设elem1在上，elem2在下）
    const verticalGap = rect2.top - rect1.bottom;

    const gap = {
      horizontal: horizontalGap,
      vertical: verticalGap,
      label
    };

    // 绘制间隙指示器（如果有水平间隙）
    if (horizontalGap > 0) {
      this.drawGap(rect1.right, rect1.top, horizontalGap, Math.min(rect1.height, rect2.height), label, horizontalGap);
    }

    return gap;
  }

  // 绘制间隙
  drawGap(left, top, width, height, label, gapSize) {
    const overlay = document.getElementById(this.overlayId);
    if (!overlay) return;

    // 创建间隙指示器
    const gap = document.createElement('div');
    gap.className = 'vd-gap-indicator';
    gap.style.cssText = `
      left: ${left}px;
      top: ${top}px;
      width: ${width}px;
      height: ${height}px;
    `;

    // 创建间隙标签
    const gapLabel = document.createElement('div');
    gapLabel.className = 'vd-label';
    gapLabel.style.background = 'orange';
    gapLabel.textContent = `${label}: ${Math.round(gapSize)}px`;
    gapLabel.style.cssText = `
      left: ${left + width/2 - 50}px;
      top: ${top + height/2 - 10}px;
      background: orange;
    `;

    overlay.appendChild(gap);
    overlay.appendChild(gapLabel);
  }

  // 绘制网格线
  drawGrid(spacing = 240) {
    const overlay = document.getElementById(this.overlayId);
    if (!overlay) return;

    // 垂直网格线
    for (let x = 0; x <= window.innerWidth; x += spacing) {
      const line = document.createElement('div');
      line.className = 'vd-grid-line';
      line.style.cssText = `
        left: ${x}px;
        top: 0;
        width: 1px;
        height: 100vh;
      `;
      
      // 添加标尺
      const ruler = document.createElement('div');
      ruler.className = 'vd-ruler';
      ruler.textContent = `${x}px`;
      ruler.style.cssText = `
        left: ${x + 2}px;
        top: 10px;
      `;
      
      overlay.appendChild(line);
      overlay.appendChild(ruler);
    }
  }

  // 分析布局
  analyzeLayout() {
    console.log('📊 开始布局分析...');
    
    // 清空之前的测量
    this.clear();
    
    // 测量主要元素
    const sidebar = this.measureElement('.sidebar', '侧边栏');
    const mainContainer = this.measureElement('.main-container', '主内容区');
    const appContainer = this.measureElement('.app-container', 'App容器');
    
    // 测量间隙
    if (sidebar && mainContainer) {
      const gap = this.measureGap('.sidebar', '.main-container', '侧边栏-内容间隙');
      
      // 输出分析结果
      console.log('📐 布局测量结果:');
      console.log('├─ 侧边栏:', {
        宽度: `${Math.round(sidebar.width)}px`,
        位置: `left: ${Math.round(sidebar.left)}px`,
        样式: sidebar.styles
      });
      console.log('├─ 主内容区:', {
        宽度: `${Math.round(mainContainer.width)}px`,
        位置: `left: ${Math.round(mainContainer.left)}px`,
        样式: mainContainer.styles
      });
      console.log('├─ 间隙:', {
        水平间隙: `${Math.round(gap.horizontal)}px`,
        垂直间隙: `${Math.round(gap.vertical)}px`
      });
      
      // 检测问题
      if (gap.horizontal > 10) {
        console.warn('⚠️ 检测到异常间隙:', `${Math.round(gap.horizontal)}px`);
        console.log('🔍 可能的原因:');
        console.log('  - CSS变量不一致');
        console.log('  - 自定义样式覆盖');
        console.log('  - margin/padding 设置问题');
      } else {
        console.log('✅ 布局正常，间隙合理');
      }
    }

    // 绘制240px网格线帮助对齐
    this.drawGrid(240);
    
    return this.measurements;
  }

  // 清除所有标注
  clear() {
    const overlay = document.getElementById(this.overlayId);
    if (overlay) {
      overlay.innerHTML = '';
    }
    this.measurements = [];
  }

  // 销毁调试器
  destroy() {
    const overlay = document.getElementById(this.overlayId);
    if (overlay) {
      overlay.remove();
    }
    this.isActive = false;
    console.log('Visual Debugger 已关闭');
  }

  // 获取元素的完整样式链
  getStyleChain(selector) {
    const element = document.querySelector(selector);
    if (!element) return null;

    const styles = window.getComputedStyle(element);
    const styleSheets = Array.from(document.styleSheets);
    const appliedRules = [];

    try {
      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          rules.forEach(rule => {
            if (rule.selectorText && element.matches(rule.selectorText)) {
              appliedRules.push({
                selector: rule.selectorText,
                styles: rule.style.cssText,
                source: sheet.href || 'inline'
              });
            }
          });
        } catch (e) {
          // 跨域样式表可能无法访问
        }
      });
    } catch (e) {
      console.warn('无法访问某些样式表:', e);
    }

    return {
      computed: {
        width: styles.width,
        marginLeft: styles.marginLeft,
        left: styles.left,
        position: styles.position,
        transform: styles.transform
      },
      appliedRules
    };
  }
}

// 创建全局实例
window.visualDebugger = new VisualDebugger();

// 导出供Vue使用
export default VisualDebugger;

// 自动初始化（开发环境）
if (process.env.NODE_ENV === 'development') {
  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🎨 Visual Debugger 可用，使用 window.visualDebugger.init() 启动');
    });
  } else {
    console.log('🎨 Visual Debugger 可用，使用 window.visualDebugger.init() 启动');
  }
}