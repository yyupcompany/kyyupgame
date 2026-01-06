#!/usr/bin/env node

/**
 * 分析所有页面的样式现状
 * 检查：
 * 1. 是否使用了统一的容器类（center-container, page-container等）
 * 2. 是否使用了硬编码的颜色值
 * 3. 是否使用了硬编码的间距值
 * 4. 是否使用了硬编码的字体大小
 * 5. 是否使用了硬编码的阴影
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '../client/src/pages');
const STYLES_DIR = path.join(__dirname, '../client/src/styles');

const results = {
  totalPages: 0,
  pagesWithUnifiedStyles: 0,
  pagesWithHardcodedColors: 0,
  pagesWithHardcodedSpacing: 0,
  pagesWithHardcodedFontSize: 0,
  pagesWithHardcodedShadows: 0,
  pages: [],
  styleIssues: {
    colors: [],
    spacing: [],
    fontSize: [],
    shadows: []
  }
};

// 颜色正则表达式
const colorPatterns = [
  /#[0-9a-fA-F]{3,8}/g,  // 十六进制颜色
  /rgb\([^)]+\)/g,        // RGB颜色
  /rgba\([^)]+\)/g,       // RGBA颜色
  /hsl\([^)]+\)/g,        // HSL颜色
];

// 间距正则表达式
const spacingPatterns = [
  /padding:\s*\d+px/g,
  /margin:\s*\d+px/g,
  /gap:\s*\d+px/g,
];

// 字体大小正则表达式
const fontSizePatterns = [
  /font-size:\s*\d+px/g,
];

// 阴影正则表达式
const shadowPatterns = [
  /box-shadow:\s*[^;]+/g,
  /text-shadow:\s*[^;]+/g,
];

function scanDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (item.endsWith('.vue')) {
      analyzeVueFile(fullPath);
    }
  }
}

function analyzeVueFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(PAGES_DIR, filePath);
    
    results.totalPages++;
    
    const pageInfo = {
      path: relativePath,
      hasUnifiedStyles: false,
      issues: {
        colors: [],
        spacing: [],
        fontSize: [],
        shadows: []
      }
    };
    
    // 检查是否使用了统一的容器类
    const unifiedClasses = [
      'center-container',
      'page-container',
      'center-page',
      'dashboard-container'
    ];
    
    const hasUnified = unifiedClasses.some(cls => content.includes(`class="${cls}`) || content.includes(`class='${cls}`));
    pageInfo.hasUnifiedStyles = hasUnified;
    
    if (hasUnified) {
      results.pagesWithUnifiedStyles++;
    }
    
    // 检查样式块中的硬编码值
    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    if (styleMatch) {
      const styleContent = styleMatch[1];
      
      // 检查硬编码颜色
      const colors = styleContent.match(colorPatterns) || [];
      if (colors.length > 0) {
        results.pagesWithHardcodedColors++;
        pageInfo.issues.colors = colors.slice(0, 5); // 只记录前5个
      }
      
      // 检查硬编码间距
      const spacing = styleContent.match(spacingPatterns) || [];
      if (spacing.length > 0) {
        results.pagesWithHardcodedSpacing++;
        pageInfo.issues.spacing = spacing.slice(0, 5);
      }
      
      // 检查硬编码字体大小
      const fontSize = styleContent.match(fontSizePatterns) || [];
      if (fontSize.length > 0) {
        results.pagesWithHardcodedFontSize++;
        pageInfo.issues.fontSize = fontSize.slice(0, 5);
      }
      
      // 检查硬编码阴影
      const shadows = styleContent.match(shadowPatterns) || [];
      if (shadows.length > 0) {
        results.pagesWithHardcodedShadows++;
        pageInfo.issues.shadows = shadows.slice(0, 5);
      }
    }
    
    results.pages.push(pageInfo);
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
  }
}

// 生成报告
function generateReport() {
  const report = `# 全局样式分析报告

## 📊 统计概览

- **总页面数**: ${results.totalPages}
- **使用统一样式的页面**: ${results.pagesWithUnifiedStyles} (${((results.pagesWithUnifiedStyles / results.totalPages) * 100).toFixed(1)}%)
- **包含硬编码颜色的页面**: ${results.pagesWithHardcodedColors} (${((results.pagesWithHardcodedColors / results.totalPages) * 100).toFixed(1)}%)
- **包含硬编码间距的页面**: ${results.pagesWithHardcodedSpacing} (${((results.pagesWithHardcodedSpacing / results.totalPages) * 100).toFixed(1)}%)
- **包含硬编码字体大小的页面**: ${results.pagesWithHardcodedFontSize} (${((results.pagesWithHardcodedFontSize / results.totalPages) * 100).toFixed(1)}%)
- **包含硬编码阴影的页面**: ${results.pagesWithHardcodedShadows} (${((results.pagesWithHardcodedShadows / results.totalPages) * 100).toFixed(1)}%)

## 📋 需要修复的页面

### 未使用统一样式的页面 (${results.totalPages - results.pagesWithUnifiedStyles}个)

\`\`\`
${results.pages
  .filter(p => !p.hasUnifiedStyles)
  .map(p => p.path)
  .join('\n')}
\`\`\`

## 🎯 下一步行动

1. 为所有页面添加统一的容器类
2. 将硬编码的颜色值替换为CSS变量
3. 将硬编码的间距值替换为CSS变量
4. 将硬编码的字体大小替换为CSS变量
5. 将硬编码的阴影替换为CSS变量

---

**生成时间**: ${new Date().toISOString()}
`;

  const outputPath = path.join(__dirname, '../全局样式分析报告.md');
  fs.writeFileSync(outputPath, report);
  console.log(`✅ 报告已生成: ${outputPath}`);
  console.log(`\n📊 统计概览:`);
  console.log(`- 总页面数: ${results.totalPages}`);
  console.log(`- 使用统一样式的页面: ${results.pagesWithUnifiedStyles} (${((results.pagesWithUnifiedStyles / results.totalPages) * 100).toFixed(1)}%)`);
  console.log(`- 包含硬编码颜色的页面: ${results.pagesWithHardcodedColors}`);
  console.log(`- 包含硬编码间距的页面: ${results.pagesWithHardcodedSpacing}`);
  console.log(`- 包含硬编码字体大小的页面: ${results.pagesWithHardcodedFontSize}`);
  console.log(`- 包含硬编码阴影的页面: ${results.pagesWithHardcodedShadows}`);
}

// 执行扫描
console.log('🔍 正在扫描所有页面...');
scanDirectory(PAGES_DIR);
generateReport();

