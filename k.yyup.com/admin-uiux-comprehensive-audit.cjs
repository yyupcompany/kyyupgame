/**
 * Admin UI/UX 布局综合审计脚本
 * 使用 Playwright 浏览器进行自动化测试
 * 结合 ui/ux pro max 技能进行深度分析
 */

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const { chromium } = require('playwright');

// 要审计的页面列表（Center 页面）
const PAGES_TO_TEST = [
  { path: '/centers/index', name: 'IndexCenter', role: 'admin' },
  { path: '/centers/enrollment', name: 'EnrollmentCenter', role: 'admin' },
  { path: '/centers/personnel', name: 'PersonnelCenter', role: 'admin' },
  { path: '/centers/task', name: 'TaskCenter', role: 'admin' },
  { path: '/centers/teaching', name: 'TeachingCenter', role: 'admin' },
  { path: '/centers/activity', name: 'ActivityCenter', role: 'admin' },
  { path: '/centers/marketing', name: 'MarketingCenter', role: 'admin' },
  { path: '/centers/system', name: 'SystemCenter', role: 'admin' },
  { path: '/centers/attendance', name: 'AttendanceCenter', role: 'admin' },
  { path: '/centers/document-center', name: 'DocumentCenter', role: 'admin' },
  { path: '/centers/finance', name: 'FinanceCenter', role: 'admin' },
  { path: '/centers/customer-pool', name: 'CustomerPoolCenter', role: 'admin' },
  { path: '/centers/business', name: 'BusinessCenter', role: 'admin' },
  { path: '/centers/inspection', name: 'InspectionCenter', role: 'admin' },
  { path: '/centers/assessment', name: 'AssessmentCenter', role: 'admin' },
  { path: '/centers/media', name: 'MediaCenter', role: 'admin' },
  { path: '/centers/ai', name: 'AICenter', role: 'admin' },
  { path: '/centers/analytics', name: 'AnalyticsCenter', role: 'admin' },
  { path: '/centers/call', name: 'CallCenter', role: 'admin' },
  { path: '/centers/usage', name: 'UsageCenter', role: 'admin' },
  { path: '/centers/document-collaboration', name: 'DocumentCollaboration', role: 'admin' },
  { path: '/centers/document-editor', name: 'DocumentEditor', role: 'admin' },
  { path: '/centers/document-template', name: 'DocumentTemplateCenter', role: 'admin' },
  { path: '/centers/document-instances', name: 'DocumentInstanceList', role: 'admin' },
  { path: '/centers/document-statistics', name: 'DocumentStatistics', role: 'admin' },
  { path: '/centers/task/form', name: 'TaskForm', role: 'admin' },
  { path: '/centers/marketing/performance', name: 'MarketingPerformance', role: 'admin' },
  { path: '/centers/template/detail', name: 'TemplateDetail', role: 'admin' },
];

/**
 * 使用 Element Plus 标准选择器检查页面布局
 */
async function checkPageLayoutPRO(page, pageInfo) {
  const results = {
    page: pageInfo.name,
    path: pageInfo.path,
    issues: [],
    score: 100,
    details: {
      containers: {},
      grid: {},
      spacing: {},
      typography: {},
    }
  };

  try {
    // 1. 检查页面容器结构（使用项目实际的选择器）
    const containerInfo = await page.evaluate(() => {
      const appContainer = document.querySelector('.app-container');
      const mainLayout = document.querySelector('.main-layout-area');
      const sidebarSlot = document.querySelector('.sidebar-slot');
      const contentSlot = document.querySelector('.content-slot');
      const header = document.querySelector('header, [class*="header"], [class*="navbar"]');

      // 检查 Element Plus 容器
      const elContainer = document.querySelector('.el-container');
      const elMain = document.querySelector('.el-main');

      return {
        hasAppContainer: !!appContainer,
        hasMainLayout: !!mainLayout,
        hasSidebarSlot: !!sidebarSlot,
        hasContentSlot: !!contentSlot,
        hasHeader: !!header,
        hasElContainer: !!elContainer,
        hasElMain: !!elMain,
        containerClass: appContainer?.className || 'N/A',
        containerHeight: appContainer?.getBoundingClientRect?.()?.height || 0,
      };
    });
    results.details.containers = containerInfo;

    // 验证容器完整性
    if (!containerInfo.hasAppContainer) {
      results.issues.push('缺少主容器 .app-container');
      results.score -= 15;
    }
    if (!containerInfo.hasContentSlot && !containerInfo.hasElMain) {
      results.issues.push('缺少主要内容区域');
      results.score -= 10;
    }
    if (!containerInfo.hasSidebarSlot && !containerInfo.hasHeader) {
      results.issues.push('侧边栏或头部未找到');
      results.score -= 5;
    }

    // 2. 检查网格系统和对齐
    const gridInfo = await page.evaluate(() => {
      // 检查 flex 布局
      const flexContainers = document.querySelectorAll('[style*="display: flex"], [style*="display:flex"]');
      const gridContainers = document.querySelectorAll('[style*="display: grid"], [style*="display:grid"]');

      // 检查内容对齐
      const contentWrappers = document.querySelectorAll('.main-content-wrapper, .content-wrapper, main');

      return {
        flexCount: flexContainers.length,
        gridCount: gridContainers.length,
        hasContentWrapper: contentWrappers.length > 0,
        flexContainers: Array.from(flexContainers).slice(0, 5).map(el => el.className || el.tagName),
      };
    });
    results.details.grid = gridInfo;

    // 3. 检查间距规范
    const spacingInfo = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const paddingValues = new Set();
      const marginValues = new Set();

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.padding && style.padding !== '0px') paddingValues.add(style.padding);
        if (style.margin && style.margin !== '0px') marginValues.add(style.margin);
      });

      return {
        uniquePaddingCount: paddingValues.size,
        uniqueMarginCount: marginValues.size,
        paddingValues: Array.from(paddingValues).slice(0, 10),
        marginValues: Array.from(marginValues).slice(0, 10),
      };
    });
    results.details.spacing = spacingInfo;

    // 4. 检查字体排版
    const typographyInfo = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
      const fontSizes = new Set();
      const fontWeights = new Set();
      const lineHeights = new Set();

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.fontSize) fontSizes.add(style.fontSize);
        if (style.fontWeight) fontWeights.add(style.fontWeight);
        if (style.lineHeight) lineHeights.add(style.lineHeight);
      });

      return {
        uniqueFonts: Array.from(fontSizes).slice(0, 10),
        uniqueWeights: Array.from(fontWeights),
        uniqueLineHeights: Array.from(lineHeights).slice(0, 5),
      };
    });
    results.details.typography = typographyInfo;

    // 5. 检查元素重叠（使用实际的选择器）
    const overlapInfo = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar-slot');
      const content = document.querySelector('.content-slot');
      const header = document.querySelector('header, [class*="header"]');

      const sidebarRect = sidebar?.getBoundingClientRect();
      const contentRect = content?.getBoundingClientRect();

      let hasOverlap = false;
      let overlapArea = 0;

      if (sidebarRect && contentRect) {
        const overlapX = !(sidebarRect.right < contentRect.left || sidebarRect.left > contentRect.right);
        const overlapY = !(sidebarRect.bottom < contentRect.top || sidebarRect.top > contentRect.bottom);

        if (overlapX && overlapY) {
          hasOverlap = true;
          overlapArea = Math.max(0, Math.min(sidebarRect.right, contentRect.right) - Math.max(sidebarRect.left, contentRect.left)) *
                       Math.max(0, Math.min(sidebarRect.bottom, contentRect.bottom) - Math.max(sidebarRect.top, contentRect.top));
        }
      }

      return { hasOverlap, overlapArea: Math.round(overlapArea), sidebarRect, contentRect };
    });

    if (overlapInfo.hasOverlap && overlapInfo.overlapArea > 100) {
      results.issues.push(`检测到侧边栏和内容区域重叠 (面积: ${overlapInfo.overlapArea}px²)`);
      results.score -= 10;
    }

  } catch (error) {
    results.issues.push(`布局检查出错: ${error.message}`);
    results.score -= 10;
  }

  return results;
}

/**
 * 检查颜色和主题一致性
 */
async function checkThemeConsistency(page) {
  const results = {
    colors: {},
    theme: {},
    inconsistencies: [],
  };

  try {
    // 1. 获取 CSS 变量
    const cssVariables = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      const vars = {};
      for (let i = 0; i < styles.length; i++) {
        const prop = styles[i];
        if (prop.startsWith('--')) {
          vars[prop] = styles.getPropertyValue(prop).trim();
        }
      }
      return vars;
    });

    results.theme = {
      variableCount: Object.keys(cssVariables).length,
      hasBgColor: !!cssVariables['--bg-color-page'],
      hasPrimaryColor: !!cssVariables['--primary-color'],
      hasBorderColor: !!cssVariables['--border-color'],
    };

    // 2. 检查 Element Plus 主题变量
    const elementPlusVars = await page.evaluate(() => {
      const elVars = {};
      const keyVars = ['--el-color-primary', '--el-bg-color', '--el-border-color'];

      keyVars.forEach(key => {
        const style = document.documentElement.style.getPropertyValue(key) ||
                      getComputedStyle(document.documentElement).getPropertyValue(key);
        if (style) elVars[key] = style.trim();
      });

      return elVars;
    });

    results.theme.elementPlus = elementPlusVars;

    // 3. 检查颜色使用一致性
    const colorUsage = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const bgColors = new Set();
      const textColors = new Set();
      const borderColors = new Set();

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'rgb(255, 255, 255)') {
          bgColors.add(style.backgroundColor);
        }
        if (style.color && style.color !== 'rgb(0, 0, 0)') {
          textColors.add(style.color);
        }
        if (style.borderColor && style.borderColor !== 'rgb(0, 0, 0)' && style.borderColor !== 'rgba(0, 0, 0, 0)') {
          borderColors.add(style.borderColor);
        }
      });

      return {
        bgCount: bgColors.size,
        textCount: textColors.size,
        borderCount: borderColors.size,
        topBgColors: Array.from(bgColors).slice(0, 5),
        topTextColors: Array.from(textColors).slice(0, 5),
      };
    });

    results.colors = colorUsage;

    // 检测颜色过多
    if (colorUsage.bgCount > 10) {
      results.inconsistencies.push(`背景颜色过多 (${colorUsage.bgCount} 种，建议使用 CSS 变量统一管理)`);
    }
    if (colorUsage.textCount > 8) {
      results.inconsistencies.push(`文字颜色过多 (${colorUsage.textCount} 种，建议统一)`);
    }

  } catch (error) {
    results.error = error.message;
  }

  return results;
}

/**
 * 检查组件样式一致性
 */
async function checkComponentStyles(page) {
  const results = {
    buttons: {},
    cards: {},
    tables: {},
    forms: {},
    dialogs: {},
  };

  try {
    // 1. 检查按钮样式
    const buttonStyles = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, .el-button, [class*="btn"]');
      const styles = [];

      buttons.forEach((btn, index) => {
        if (index > 20) return; // 限制检查数量
        const style = window.getComputedStyle(btn);
        styles.push({
          tag: btn.tagName,
          className: btn.className?.substring(0, 50),
          background: style.backgroundColor,
          color: style.color,
          borderRadius: style.borderRadius,
          padding: style.padding,
          fontSize: style.fontSize,
          height: style.height,
        });
      });

      return styles.slice(0, 10);
    });
    results.buttons = { samples: buttonStyles, count: buttonStyles.length };

    // 2. 检查卡片样式
    const cardStyles = await page.evaluate(() => {
      const cards = document.querySelectorAll('.el-card, [class*="card"]');
      const styles = [];

      cards.forEach((card, index) => {
        if (index > 10) return;
        const style = window.getComputedStyle(card);
        styles.push({
          background: style.backgroundColor,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow?.substring(0, 100),
          padding: style.padding,
          border: style.border,
        });
      });

      return styles.slice(0, 5);
    });
    results.cards = { samples: cardStyles, count: cardStyles.length };

    // 3. 检查表格样式
    const tableStyles = await page.evaluate(() => {
      const tables = document.querySelectorAll('.el-table, table, [class*="table"]');
      const styles = [];

      tables.forEach((table, index) => {
        if (index > 5) return;
        const style = window.getComputedStyle(table);
        const rows = table.querySelectorAll('tr').length;
        const cells = table.querySelectorAll('td, th').length;
        styles.push({
          borderCollapse: style.borderCollapse,
          borderSpacing: style.borderSpacing,
          rowCount: rows,
          cellCount: cells,
          hasBorder: style.borderStyle !== 'none',
        });
      });

      return styles;
    });
    results.tables = { samples: tableStyles, count: tableStyles.length };

    // 4. 检查表单布局
    const formStyles = await page.evaluate(() => {
      const forms = document.querySelectorAll('.el-form, form, [class*="form"]');
      const styles = [];

      forms.forEach((form, index) => {
        if (index > 5) return;
        const style = window.getComputedStyle(form);
        const inputs = form.querySelectorAll('input, select, textarea, .el-input').length;
        styles.push({
          labelPosition: style.getPropertyValue('--form-label-position') || 'N/A',
          inputCount: inputs,
          gap: style.gap || 'N/A',
        });
      });

      return styles;
    });
    results.forms = { samples: formStyles, count: formStyles.length };

    // 5. 检查弹窗样式
    const dialogStyles = await page.evaluate(() => {
      const dialogs = document.querySelectorAll('.el-dialog, [class*="dialog"], [class*="modal"]');
      const styles = [];

      dialogs.forEach((dialog, index) => {
        if (index > 5) return;
        const style = window.getComputedStyle(dialog);
        const rect = dialog.getBoundingClientRect();
        styles.push({
          width: style.width || `${rect.width}px`,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow?.substring(0, 80),
          zIndex: style.zIndex,
        });
      });

      return styles;
    });
    results.dialogs = { samples: dialogStyles, count: dialogStyles.length };

  } catch (error) {
    results.error = error.message;
  }

  return results;
}

/**
 * 检查响应式布局
 */
async function checkResponsiveLayout(page) {
  const results = {
    breakpoints: {},
    issues: [],
  };

  const viewports = [
    { width: 1920, height: 1080, name: 'Desktop Large (1920x1080)' },
    { width: 1440, height: 900, name: 'Desktop Normal (1440x900)' },
    { width: 1280, height: 720, name: 'Laptop (1280x720)' },
    { width: 1024, height: 768, name: 'Tablet (1024x768)' },
    { width: 768, height: 1024, name: 'Tablet Portrait (768x1024)' },
    { width: 425, height: 667, name: 'Mobile Large (425x667)' },
    { width: 375, height: 667, name: 'Mobile Normal (375x667)' },
    { width: 320, height: 568, name: 'Mobile Small (320x568)' },
  ];

  for (const viewport of viewports) {
    try {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(300);

      const pageInfo = await page.evaluate((width) => {
        const container = document.querySelector('.app-container, .el-container');
        const content = document.querySelector('.content-slot, .el-main, main');
        const sidebar = document.querySelector('.sidebar-slot, .el-aside');
        const body = document.body;

        return {
          // 容器宽度
          containerWidth: container?.getBoundingClientRect?.()?.width || 0,
          contentWidth: content?.getBoundingClientRect?.()?.width || 0,
          sidebarWidth: sidebar?.getBoundingClientRect?.()?.width || 0,

          // 溢出检测
          bodyScrollWidth: body?.scrollWidth || 0,
          bodyClientWidth: body?.clientWidth || 0,
          hasOverflowX: (body?.scrollWidth || 0) > (body?.clientWidth || 0),

          // 视口信息
          viewportWidth: width,
          viewportHeight: window.innerHeight,
        };
      }, viewport.width);

      // 检测响应式问题
      const issues = [];
      if (pageInfo.hasOverflowX) {
        issues.push('水平溢出');
      }
      if (pageInfo.containerWidth > pageInfo.viewportWidth) {
        issues.push('容器超出视口');
      }

      results.breakpoints[viewport.name] = {
        viewport: viewport,
        metrics: pageInfo,
        issues,
        status: issues.length === 0 ? 'OK' : 'ISSUE',
      };

      if (issues.length > 0) {
        results.issues.push(`${viewport.name}: ${issues.join(', ')}`);
      }

    } catch (error) {
      results.breakpoints[viewport.name] = { error: error.message };
    }
  }

  // 恢复默认视口
  await page.setViewportSize({ width: 1280, height: 720 });

  return results;
}

/**
 * 检查无障碍访问
 */
async function checkAccessibility(page) {
  const results = {
    score: 100,
    issues: [],
    details: {},
  };

  try {
    // 1. 图片 alt 属性检查
    const missingAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const missing = [];
      images.forEach((img, index) => {
        if (!img.alt || img.alt.trim() === '') {
          missing.push({
            src: img.src?.substring(0, 50),
            index,
          });
        }
      });
      return missing;
    });
    results.details.missingAlt = missingAlt;

    if (missingAlt.length > 0) {
      results.issues.push(`${missingAlt.length} 个图片缺少 alt 属性`);
      results.score -= missingAlt.length * 2;
    }

    // 2. 按钮尺寸检查
    const smallButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, .el-button, [role="button"]');
      const small = [];
      buttons.forEach((btn, index) => {
        const rect = btn.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
          small.push({
            index,
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
            className: btn.className?.substring(0, 30),
          });
        }
      });
      return small;
    });
    results.details.smallButtons = smallButtons;

    if (smallButtons.length > 0) {
      results.issues.push(`${smallButtons.length} 个按钮尺寸小于 44x44px`);
      results.score -= smallButtons.length * 3;
    }

    // 3. 表单标签检查
    const inputsWithoutLabels = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
      const missing = [];

      inputs.forEach((input, index) => {
        const id = input.id;
        const ariaLabel = input.getAttribute('aria-label');
        const placeholder = input.getAttribute('placeholder');

        if (!id || !document.querySelector(`label[for="${id}"]`)) {
          if (!ariaLabel && !placeholder) {
            missing.push({
              index,
              tag: input.tagName,
              type: input.type,
              hasAriaLabel: !!ariaLabel,
              hasPlaceholder: !!placeholder,
            });
          }
        }
      });

      return missing;
    });
    results.details.inputsWithoutLabels = inputsWithoutLabels;

    if (inputsWithoutLabels.length > 0) {
      results.issues.push(`${inputsWithoutLabels.length} 个表单元素缺少标签或 aria-label`);
      results.score -= inputsWithoutLabels.length * 3;
    }

    // 4. 颜色对比度检查
    const lowContrast = await page.evaluate(() => {
      const textElements = document.querySelectorAll('p, span, div, a, h1, h2, h3, h4, h5, h6, li, td, th');
      const issues = [];

      textElements.forEach((el, index) => {
        if (index > 50) return; // 限制检查数量
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;

        // 简单的对比度检测
        if (color.includes('rgba') && (color.includes(', 0.5') || color.includes(', 0.6') || color.includes(', 0.7'))) {
          issues.push({
            tag: el.tagName,
            color: color.substring(0, 30),
            text: el.textContent?.substring(0, 20),
          });
        }
      });

      return issues;
    });
    results.details.lowContrast = lowContrast;

    if (lowContrast.length > 0) {
      results.issues.push(`${lowContrast.length} 个元素可能存在低对比度问题`);
      results.score -= lowContrast.length * 1;
    }

    // 5. 焦点状态检查
    const focusStyles = await page.evaluate(() => {
      const focusable = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
      let hasOutline = 0;
      let noOutline = 0;

      focusable.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.outline !== 'none' && style.outline !== '0px') {
          hasOutline++;
        } else {
          noOutline++;
        }
      });

      return { hasOutline, noOutline };
    });
    results.details.focusStyles = focusStyles;

    if (focusStyles.noOutline > 10) {
      results.issues.push(`${focusStyles.noOutline} 个可聚焦元素缺少焦点轮廓`);
      results.score -= 5;
    }

  } catch (error) {
    results.issues.push(`无障碍检查出错: ${error.message}`);
    results.score -= 10;
  }

  return results;
}

/**
 * 测量页面性能
 */
async function measurePerformance(page) {
  const results = {
    timing: {},
    metrics: {},
    score: 100,
  };

  try {
    const perfData = await page.evaluate(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0];

      // 计算关键指标
      const fcp = performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint');
      const lcp = performance.getEntriesByType('paint').find(e => e.name === 'largest-contentful-paint');

      return {
        // 时间指标 (ms)
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnection: timing.connectEnd - timing.connectStart,
        serverResponse: timing.responseStart - timing.requestStart,
        ttfb: timing.responseStart - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        domComplete: timing.domComplete - timing.navigationStart,
        fullPageLoad: timing.loadEventEnd - timing.navigationStart,
        fcp: fcp?.startTime || 0,
        lcp: lcp?.startTime || 0,

        // 资源指标
        resourceCount: performance.getEntriesByType('resource').length,
        totalResourceSize: performance.getEntriesByType('resource')
          .reduce((sum, r) => sum + (r.transferSize || 0), 0),

        // 网络状态
        connectionType: (navigator.connection?.effectiveType) || 'unknown',
      };
    });

    results.timing = perfData;

    // 计算性能评分
    let score = 100;

    // FCP 评分
    if (perfData.fcp > 2000) score -= 10;
    if (perfData.fcp > 3000) score -= 10;

    // LCP 评分
    if (perfData.lcp > 2500) score -= 10;
    if (perfData.lcp > 4000) score -= 10;

    // 页面加载时间评分
    if (perfData.fullPageLoad > 3000) score -= 5;
    if (perfData.fullPageLoad > 5000) score -= 10;

    // TTFB 评分
    if (perfData.ttfb > 1000) score -= 5;

    // 资源数量评分
    if (perfData.resourceCount > 100) score -= 5;
    if (perfData.resourceCount > 200) score -= 5;

    results.metrics = {
      score: Math.max(0, score),
      fcp: `${(perfData.fcp / 1000).toFixed(2)}s`,
      lcp: `${(perfData.lcp / 1000).toFixed(2)}s`,
      ttfb: `${(perfData.ttfb / 1000).toFixed(2)}s`,
      loadTime: `${(perfData.fullPageLoad / 1000).toFixed(2)}s`,
      resourceCount: perfData.resourceCount,
      resourceSize: `${(perfData.totalResourceSize / 1024 / 1024).toFixed(2)}MB`,
    };
    results.score = score;

  } catch (error) {
    results.metrics = { error: error.message };
    results.score = 50;
  }

  return results;
}

/**
 * 检测控制台错误
 */
async function checkConsoleErrors(page) {
  const errors = [];
  const warnings = [];

  // 收集错误
  const errorPromise = new Promise((resolve) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    // 等待收集
    setTimeout(resolve, 2000);
  });

  await errorPromise;

  // 过滤无关的错误
  const relevantErrors = errors.filter(err => {
    const ignorePatterns = [
      'favicon.ico',
      'ResizeObserver',
      'layout.css',
      '404',
      'net::ERR',
    ];
    return !ignorePatterns.some(pattern => err.toLowerCase().includes(pattern.toLowerCase()));
  });

  return {
    errors: relevantErrors,
    warnings: warnings.slice(0, 10),
    errorCount: relevantErrors.length,
  };
}

/**
 * 主测试函数
 */
async function runComprehensiveAudit() {
  console.log('==========================================');
  console.log('Admin UI/UX 布局综合审计');
  console.log('==========================================');
  console.log(`测试地址: ${BASE_URL}`);
  console.log(`测试时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`待测试页面数: ${PAGES_TO_TEST.length}`);
  console.log('==========================================\n');

  const report = {
    summary: {
      totalPages: PAGES_TO_TEST.length,
      passed: 0,
      failed: 0,
      avgScore: 0,
    },
    layoutResults: [],
    themeResults: [],
    componentResults: [],
    responsiveResults: [],
    accessibilityResults: [],
    performanceResults: [],
    consoleErrors: [],
    recommendations: [],
  };

  // 启动浏览器
  console.log('正在启动浏览器...');
  const browser = await chromium.launch({
    headless: true,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  // 测试每个页面
  for (let i = 0; i < PAGES_TO_TEST.length; i++) {
    const pageInfo = PAGES_TO_TEST[i];
    console.log(`\n[${i + 1}/${PAGES_TO_TEST.length}] ${pageInfo.name} (${pageInfo.path})`);

    try {
      // 导航到页面
      await page.goto(`${BASE_URL}${pageInfo.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      // 等待页面渲染
      await page.waitForTimeout(1500);

      // 检查页面是否正常加载
      const bodyContent = await page.evaluate(() => document.body.innerHTML.length);
      if (bodyContent < 100) {
        console.log(`  ⚠️ 页面内容为空或加载失败`);
        continue;
      }

      // 1. 检查页面布局
      const layoutResult = await checkPageLayoutPRO(page, pageInfo);
      report.layoutResults.push(layoutResult);

      // 2. 检查主题一致性
      const themeResult = await checkThemeConsistency(page);
      report.themeResults.push({
        page: pageInfo.name,
        ...themeResult
      });

      // 3. 检查组件样式
      const componentResult = await checkComponentStyles(page);
      report.componentResults.push({
        page: pageInfo.name,
        ...componentResult
      });

      // 4. 检查响应式布局
      const responsiveResult = await checkResponsiveLayout(page);
      report.responsiveResults.push({
        page: pageInfo.name,
        ...responsiveResult
      });

      // 5. 检查无障碍访问
      const accessibilityResult = await checkAccessibility(page);
      report.accessibilityResults.push({
        page: pageInfo.name,
        ...accessibilityResult
      });

      // 6. 测量性能
      const performanceResult = await measurePerformance(page);
      report.performanceResults.push({
        page: pageInfo.name,
        ...performanceResult
      });

      // 7. 检测控制台错误
      const consoleResult = await checkConsoleErrors(page);
      report.consoleErrors.push({
        page: pageInfo.name,
        ...consoleResult
      });

      // 计算页面综合评分
      const pageScore = Math.round(
        (layoutResult.score +
         (accessibilityResult.score) +
         (performanceResult.score || 100)) / 3
      );

      if (pageScore >= 70 && consoleResult.errorCount === 0) {
        report.summary.passed++;
        console.log(`  ✅ 通过 (综合评分: ${pageScore})`);
      } else {
        report.summary.failed++;
        console.log(`  ⚠️ 需关注 (综合评分: ${pageScore}, 错误: ${consoleResult.errorCount})`);
      }

    } catch (error) {
      console.error(`  ❌ 测试出错: ${error.message}`);
      report.summary.failed++;
    }
  }

  // 关闭浏览器
  await browser.close();

  // 计算平均分
  const totalScore = report.layoutResults.reduce((sum, r) => sum + r.score, 0) +
                     report.performanceResults.reduce((sum, r) => sum + (r.score || 0), 0) +
                     report.accessibilityResults.reduce((sum, r) => sum + r.score, 0);
  report.summary.avgScore = Math.round(totalScore / (report.layoutResults.length * 3));

  // 生成建议
  report.recommendations = generateRecommendations(report);

  // 输出汇总
  console.log('\n==========================================');
  console.log('审计汇总');
  console.log('==========================================');
  console.log(`总页面数: ${report.summary.totalPages}`);
  console.log(`通过: ${report.summary.passed}`);
  console.log(`需关注: ${report.summary.failed}`);
  console.log(`平均评分: ${report.summary.avgScore}/100`);
  console.log(`通过率: ${((report.summary.passed / report.summary.totalPages) * 100).toFixed(1)}%`);

  // 保存报告
  const fs = require('fs-extra');
  const reportPath = './ADMIN-UIUX-COMPREHENSIVE-AUDIT-REPORT.md';
  await fs.writeFile(reportPath, generateMarkdownReport(report));
  console.log(`\n详细报告已保存到: ${reportPath}`);

  return report;
}

/**
 * 生成建议
 */
function generateRecommendations(report) {
  const recommendations = [];

  // 统计问题
  const layoutIssues = report.layoutResults.reduce((sum, r) => sum + r.issues.length, 0);
  const accessibilityIssues = report.accessibilityResults.reduce((sum, r) => sum + r.issues.length, 0);
  const consoleErrors = report.consoleErrors.reduce((sum, r) => sum + r.errorCount, 0);

  // 收集所有响应式问题
  const responsiveIssues = new Set();
  report.responsiveResults.forEach(r => {
    Object.entries(r.breakpoints || {}).forEach(([name, data]) => {
      if (data && data.issues) {
        data.issues.forEach(issue => responsiveIssues.add(`${name}: ${issue}`));
      }
    });
  });

  // 布局建议
  if (layoutIssues > 10) {
    recommendations.push({
      category: '布局优化',
      priority: '高',
      description: `${layoutIssues} 个页面发现布局问题`,
      action: '统一检查页面容器结构，确保 .app-container、.sidebar-slot、.content-slot 正确嵌套',
      files: ['client/src/layouts/MainLayout.vue']
    });
  }

  // 响应式建议
  if (responsiveIssues.size > 0) {
    recommendations.push({
      category: '响应式布局',
      priority: '中',
      description: `${responsiveIssues.size} 个响应式问题需要修复`,
      action: '检查各个断点下的布局表现，确保没有水平溢出和元素重叠',
      details: Array.from(responsiveIssues).slice(0, 5)
    });
  }

  // 无障碍建议
  if (accessibilityIssues > 5) {
    recommendations.push({
      category: '无障碍优化',
      priority: '中',
      description: `${accessibilityIssues} 个无障碍问题`,
      action: '为所有图片添加 alt 属性，确保按钮尺寸 >= 44x44px，为表单元素关联标签',
    });
  }

  // 错误建议
  if (consoleErrors > 0) {
    recommendations.push({
      category: '错误修复',
      priority: '高',
      description: `${consoleErrors} 个控制台错误`,
      action: '检查并修复所有 JavaScript 错误，特别是 API 调用失败的情况',
    });
  }

  // 性能建议
  const slowPages = report.performanceResults.filter(r => (r.metrics?.loadTime || '0s').includes('s') && parseFloat(r.metrics.loadTime) > 3);
  if (slowPages.length > 0) {
    recommendations.push({
      category: '性能优化',
      priority: '中',
      description: `${slowPages.length} 个页面加载时间超过 3 秒`,
      action: '优化页面资源，减少 HTTP 请求，开启 gzip 压缩，考虑使用骨架屏',
      pages: slowPages.map(p => p.page)
    });
  }

  return recommendations;
}

/**
 * 生成 Markdown 报告
 */
function generateMarkdownReport(report) {
  let md = `# Admin UI/UX 综合审计报告\n\n`;
  md += `**审计时间**: ${new Date().toLocaleString('zh-CN')}\n`;
  md += `**测试地址**: ${BASE_URL}\n`;
  md += `**测试页面数**: ${report.summary.totalPages}\n\n`;

  // 执行摘要
  md += `## 执行摘要\n\n`;
  md += `| 指标 | 数值 |\n`;
  md += `|------|------|\n`;
  md += `| 总页面数 | ${report.summary.totalPages} |\n`;
  md += `| 通过 | ${report.summary.passed} |\n`;
  md += `| 需关注 | ${report.summary.failed} |\n`;
  md += `| 平均评分 | ${report.summary.avgScore}/100 |\n`;
  md += `| 通过率 | ${((report.summary.passed / report.summary.totalPages) * 100).toFixed(1)}% |\n\n`;

  // 布局检查结果
  md += `## 布局检查结果\n\n`;
  md += `| 页面 | 布局评分 | 问题数 | 状态 |\n`;
  md += `|------|----------|--------|------|\n`;
  report.layoutResults.forEach(r => {
    const status = r.score >= 80 ? '✅ 良好' : (r.score >= 60 ? '⚠️ 需优化' : '❌ 需修复');
    md += `| ${r.page} | ${r.score}/100 | ${r.issues.length} | ${status} |\n`;
  });

  // 主题一致性
  md += `\n## 主题一致性分析\n\n`;
  md += `### CSS 变量使用\n\n`;
  report.themeResults.forEach((r, i) => {
    if (i === 0) {
      md += `- 变量数量: ${r.theme?.variableCount || 0}\n`;
      md += `- 背景变量: ${r.theme?.hasBgColor ? '✅' : '❌'}\n`;
      md += `- 主色变量: ${r.theme?.hasPrimaryColor ? '✅' : '❌'}\n`;
      md += `- 边框颜色: ${r.theme?.hasBorderColor ? '✅' : '❌'}\n`;
    }
  });

  // 响应式布局
  md += `\n## 响应式布局检查\n\n`;
  md += `### 问题汇总\n\n`;
  if (report.responsiveResults.length > 0) {
    const allIssues = new Set();
    report.responsiveResults.forEach(r => {
      Object.entries(r.breakpoints || {}).forEach(([name, data]) => {
        if (data?.issues) {
          data.issues.forEach(issue => allIssues.add(`${name}: ${issue}`));
        }
      });
    });

    if (allIssues.size > 0) {
      allIssues.forEach(issue => {
        md += `- ${issue}\n`;
      });
    } else {
      md += `✅ 所有页面在各个断点下表现正常\n`;
    }
  }

  // 无障碍检查
  md += `\n## 无障碍检查结果\n\n`;
  const totalMissingAlt = report.accessibilityResults.reduce((sum, r) => sum + (r.details?.missingAlt?.length || 0), 0);
  const totalSmallButtons = report.accessibilityResults.reduce((sum, r) => sum + (r.details?.smallButtons?.length || 0), 0);
  const totalMissingLabels = report.accessibilityResults.reduce((sum, r) => sum + (r.details?.inputsWithoutLabels?.length || 0), 0);

  md += `| 问题类型 | 数量 |\n`;
  md += `|----------|------|\n`;
  md += `| 缺少 alt 属性 | ${totalMissingAlt} |\n`;
  md += `| 按钮尺寸过小 | ${totalSmallButtons} |\n`;
  md += `| 缺少表单标签 | ${totalMissingLabels} |\n\n`;

  // 性能指标
  md += `## 性能指标\n\n`;
  const avgLoadTime = report.performanceResults.reduce((sum, r) => {
    const time = parseFloat(r.metrics?.loadTime || '0');
    return sum + (isNaN(time) ? 0 : time);
  }, 0) / report.performanceResults.length;

  md += `| 页面 | FCP | LCP | 加载时间 | 资源数 | 评分 |\n`;
  md += `|------|-----|-----|----------|--------|------|\n`;
  report.performanceResults.forEach(r => {
    md += `| ${r.page} | ${r.metrics?.fcp || 'N/A'} | ${r.metrics?.lcp || 'N/A'} | ${r.metrics?.loadTime || 'N/A'} | ${r.metrics?.resourceCount || 'N/A'} | ${r.score || 'N/A'} |\n`;
  });

  md += `\n平均加载时间: **${avgLoadTime.toFixed(2)}s**\n`;

  // 控制台错误
  md += `\n## 控制台错误统计\n\n`;
  const totalErrors = report.consoleErrors.reduce((sum, r) => sum + r.errorCount, 0);
  if (totalErrors > 0) {
    md += `发现 **${totalErrors}** 个控制台错误：\n\n`;
    report.consoleErrors.filter(r => r.errorCount > 0).forEach(r => {
      md += `### ${r.page}\n`;
      r.errors.forEach(err => {
        md += `- \`${err.substring(0, 150)}\`\n`;
      });
    });
  } else {
    md += `✅ 无控制台错误\n`;
  }

  // 改进建议
  md += `\n## 改进建议\n\n`;
  report.recommendations.forEach((rec, index) => {
    md += `### ${index + 1}. [${rec.priority}] ${rec.category}\n\n`;
    md += `**问题**: ${rec.description}\n\n`;
    md += `**建议**: ${rec.action}\n\n`;
    if (rec.files) {
      md += `**相关文件**:\n`;
      rec.files.forEach(f => md += `- \`${f}\`\n`);
    }
    if (rec.details) {
      md += `**详细问题**:\n`;
      rec.details.forEach(d => md += `- ${d}\n`);
    }
    md += `\n`;
  });

  // UI/UX 设计建议
  md += `\n## UI/UX 设计优化建议\n\n`;
  md += `### 1. 布局结构优化\n\n`;
  md += `- 确保使用统一的布局容器：\`.app-container\` > \`.main-layout-area\` > \`.sidebar-slot\` + \`.content-slot\`\n`;
  md += `- 保持 header 高度为 64px，使用 \`--header-height\` CSS 变量\n`;
  md += `- 侧边栏默认宽度 280px，收缩后 80px\n\n`;

  md += `### 2. 间距系统标准化\n\n`;
  md += `- 使用 CSS 变量统一管理间距：\n`;
  md += `  - \`--spacing-xs\`: 4px\n`;
  md += `  - \`--spacing-sm\`: 8px\n`;
  md += `  - \`--spacing-md\`: 16px\n`;
  md += `  - \`--spacing-lg\`: 24px\n`;
  md += `  - \`--spacing-xl\`: 32px\n\n`;

  md += `### 3. 颜色系统统一\n\n`;
  md += `- 使用 Element Plus 主题变量\n`;
  md += `- 自定义颜色通过 CSS 变量管理：\n`;
  md += `  - \`--primary-color\`: 主色\n`;
  md += `  - \`--bg-color-page\`: 页面背景\n`;
  md += `  - \`--bg-card\`: 卡片背景\n`;
  md += `  - \`--text-primary\`: 主要文字\n`;
  md += `  - \`--border-color\`: 边框颜色\n\n`;

  md += `### 4. 响应式断点\n\n`;
  md += `- \`xs\`: < 640px (移动端)\n`;
  md += `- \`sm\`: 640px - 767px\n`;
  md += `- \`md\`: 768px - 1023px (平板)\n`;
  md += `- \`lg\`: 1024px - 1279px\n`;
  md += `- \`xl\`: >= 1280px (桌面)\n\n`;

  md += `### 5. 组件样式一致性\n\n`;
  md += `- 按钮：高度 32px/40px，圆角 4px\n`;
  md += `- 卡片：圆角 8px，阴影 \`var(--shadow-sm)\`\n`;
  md += `- 表格：表头背景 \`#f5f7fa\`，斑马纹 \`#fafafa\`\n`;
  md += `- 弹窗：圆角 12px，最大宽度 50%\n\n`;

  return md;
}

// 导出
module.exports = {
  runComprehensiveAudit,
};

// 运行
if (require.main === module) {
  runComprehensiveAudit()
    .then(() => {
      console.log('\n审计完成!');
      process.exit(0);
    })
    .catch(error => {
      console.error('审计失败:', error);
      process.exit(1);
    });
}
