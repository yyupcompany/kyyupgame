/**
 * 批量修复列表组件问题的自动化脚本
 * 针对扫描发现的问题进行自动化修复
 */

const fs = require('fs');
const path = require('path');

// 修复统计
const fixStats = {
  totalFiles: 0,
  fixedFiles: 0,
  fixes: {
    fixedWidth: 0,
    fixedHeight: 0,
    missingResponsive: 0,
    elIconToUnified: 0,
    overflowHidden: 0
  }
};

// 要处理的文件类型
const vueExtensions = ['.vue'];
const ignoreDirs = ['node_modules', '.git', 'dist', 'coverage', 'test-results'];

// 查找所有Vue文件
function findVueFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !ignoreDirs.includes(file)) {
      findVueFiles(filePath, fileList);
    } else if (file.endsWith('.vue')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// 修复单个文件
function fixFile(filePath) {
  const originalContent = fs.readFileSync(filePath, 'utf8');
  let content = originalContent;
  let hasChanges = false;
  const fixes = [];

  console.log(`🔧 处理文件: ${path.relative(__dirname, filePath)}`);

  // 1. 修复固定宽度问题
  const widthFixes = content.match(/width:\s*(\d+)px(?!.*responsive)/g);
  if (widthFixes && widthFixes.length > 0) {
    widthFixes.forEach(match => {
      const pixelValue = match.match(/width:\s*(\d+)px/)[1];

      // 尝试转换为响应式单位或使用max-width
      let replacement;
      if (parseInt(pixelValue) < 100) {
        replacement = match.replace(/width:\s*\d+px/, 'width: auto');
      } else if (parseInt(pixelValue) < 300) {
        replacement = match.replace(/width:\s*\d+px/, `max-width: ${pixelValue}px; width: 100%`);
      } else {
        replacement = match.replace(/width:\s*\d+px/, `width: 100%; max-width: ${pixelValue}px`);
      }

      content = content.replace(match, replacement);
      hasChanges = true;
      fixes.push(`修复固定宽度: ${match} -> ${replacement}`);
    });
    fixStats.fixes.fixedWidth += widthFixes.length;
  }

  // 2. 修复固定高度问题
  const heightFixes = content.match(/height:\s*(\d+)px(?!.*responsive)/g);
  if (heightFixes && heightFixes.length > 0) {
    heightFixes.forEach(match => {
      const pixelValue = match.match(/height:\s*(\d+)px/)[1];

      // 对于固定高度，使用min-height或移除
      let replacement;
      if (parseInt(pixelValue) < 50) {
        replacement = match.replace(/height:\s*\d+px/, 'min-height: 32px; height: auto');
      } else {
        replacement = match.replace(/height:\s*\d+px/, 'min-height: 60px; height: auto');
      }

      content = content.replace(match, replacement);
      hasChanges = true;
      fixes.push(`修复固定高度: ${match} -> ${replacement}`);
    });
    fixStats.fixes.fixedHeight += heightFixes.length;
  }

  // 3. 修复overflow hidden问题
  const overflowFixes = content.match(/overflow:\s*hidden/g);
  if (overflowFixes && overflowFixes.length > 0) {
    overflowFixes.forEach(match => {
      // 添加文本省略类名而不是直接使用overflow hidden
      const replacement = match + '; text-overflow: ellipsis; white-space: nowrap';
      content = content.replace(match, replacement);
      hasChanges = true;
      fixes.push(`修复overflow: ${match} -> ${replacement}`);
    });
    fixStats.fixes.overflowHidden += overflowFixes.length;
  }

  // 4. 将el-icon替换为UnifiedIcon
  const elIconMatches = content.match(/<el-icon[^>]*>\s*<[^>]*\/>\s*<\/el-icon>/g);
  if (elIconMatches && elIconMatches.length > 0) {
    elIconMatches.forEach(match => {
      const iconMatch = match.match(/<([^>]+)\/>/);
      if (iconMatch) {
        const iconTag = iconMatch[1];

        // 尝试提取图标名称
        let iconName = 'default';
        const iconMap = {
          'Plus': 'Plus',
          'Edit': 'Edit',
          'Delete': 'Delete',
          'Search': 'Search',
          'View': 'View',
          'Close': 'Close',
          'Check': 'Check',
          'Download': 'Download',
          'Upload': 'Upload',
          'Refresh': 'Refresh',
          'ArrowLeft': 'ArrowLeft',
          'ArrowRight': 'ArrowRight',
          'ArrowUp': 'ArrowUp',
          'ArrowDown': 'ArrowDown'
        };

        Object.keys(iconMap).forEach(key => {
          if (iconTag.includes(key)) {
            iconName = iconMap[key];
          }
        });

        const replacement = `<UnifiedIcon name="${iconName}" />`;
        content = content.replace(match, replacement);
        hasChanges = true;
        fixes.push(`替换图标: ${match} -> ${replacement}`);
      }
    });
    fixStats.fixes.elIconToUnified += elIconMatches.length;
  }

  // 5. 为表格添加响应式类名
  const tableMatches = content.match(/<el-table([^>]*)>/g);
  if (tableMatches && tableMatches.length > 0) {
    tableMatches.forEach(match => {
      // 检查是否已有responsive类名
      if (!match.includes('responsive-table')) {
        const replacement = match.replace('<el-table', '<el-table class="responsive-table"');
        content = content.replace(match, replacement);
        hasChanges = true;
        fixes.push('添加响应式表格类名');
      }
    });
    fixStats.fixes.missingResponsive += tableMatches.length;
  }

  // 6. 添加响应式容器（如果缺少）
  if (content.includes('<el-table') && !content.includes('table-wrapper')) {
    // 在table周围添加包装容器
    content = content.replace(
      /(<el-table[^>]*>[\s\S]*?<\/el-table>)/,
      '<div class="table-wrapper">\n$1\n</div>'
    );
    hasChanges = true;
    fixes.push('添加表格包装容器');
  }

  // 7. 为列表项添加响应式类名
  if (content.includes('el-table-column') && !content.includes('hidden-')) {
    // 添加一些常见的响应式隐藏类名
    content = content.replace(
      /<el-table-column\s+label="学号"[^>]*>/g,
      '<el-table-column label="学号" class-name="hidden-sm">'
    );
    content = content.replace(
      /<el-table-column\s+label="家长姓名"[^>]*>/g,
      '<el-table-column label="家长姓名" class-name="hidden-md">'
    );
    hasChanges = true;
    fixes.push('添加列响应式隐藏类名');
  }

  // 如果有修改，保存文件
  if (hasChanges) {
    // 创建备份
    const backupPath = filePath + '.backup.' + Date.now();
    fs.writeFileSync(backupPath, originalContent);

    // 保存修复后的文件
    fs.writeFileSync(filePath, content);

    console.log(`  ✅ 已修复 ${fixes.length} 个问题`);
    fixes.forEach(fix => console.log(`     - ${fix}`));

    fixStats.fixedFiles++;
  } else {
    console.log(`  ℹ️  无需修复`);
  }
}

// 主函数
async function main() {
  console.log('🚀 开始批量修复列表组件问题...\n');

  const srcDir = path.join(__dirname, 'src');
  const vueFiles = findVueFiles(srcDir);

  fixStats.totalFiles = vueFiles.length;
  console.log(`📁 找到 ${vueFiles.length} 个Vue文件\n`);

  // 处理每个文件
  for (const filePath of vueFiles) {
    fixFile(filePath);
  }

  // 生成修复报告
  const report = `
# 列表组件批量修复报告

**修复时间**: ${new Date().toLocaleString('zh-CN')}

## 📊 修复统计

- 总扫描文件数: ${fixStats.totalFiles}
- 已修复文件数: ${fixStats.fixedFiles}
- 修复成功率: ${((fixStats.fixedFiles / fixStats.totalFiles) * 100).toFixed(2)}%

## 🔧 各类问题修复数量

- 固定宽度修复: ${fixStats.fixes.fixedWidth}
- 固定高度修复: ${fixStats.fixes.fixedHeight}
- 缺少响应式设计: ${fixStats.fixes.missingResponsive}
- el-icon替换为UnifiedIcon: ${fixStats.fixes.elIconToUnified}
- overflow hidden修复: ${fixStats.fixes.overflowHidden}

## 💡 修复说明

### 1. 固定宽度/高度修复
- 将小尺寸固定宽度改为auto
- 将大尺寸固定宽度改为响应式 (max-width + 100%)
- 将固定高度改为min-height + auto

### 2. 图标统一化
- 将el-icon组件替换为UnifiedIcon组件
- 支持常用图标: Edit, Delete, Plus, Search等

### 3. 响应式设计
- 为表格添加responsive-table类名
- 添加表格包装容器table-wrapper
- 为列添加响应式隐藏类名 (hidden-sm, hidden-md等)

### 4. 溢出处理
- 将overflow hidden改为文本省略处理
- 添加text-overflow: ellipsis

## 📝 后续建议

1. **手动检查**: 建议手动检查关键页面的修复效果
2. **测试验证**: 在不同设备和屏幕尺寸下测试响应式效果
3. **样式优化**: 根据实际效果进一步调整样式
4. **备份恢复**: 如有问题可使用备份文件恢复

## ⚠️ 注意事项

- 所有原文件都已创建备份 (.backup.[timestamp])
- 修复是自动化的，可能不完美，建议人工验证
- 某些特殊情况下可能需要手动调整
`;

  // 保存报告
  const reportsDir = path.join(__dirname, 'docs', 'ui-optimization');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `batch-fix-report-${new Date().toISOString().replace(/[:.]/g, '-')}.md`);
  fs.writeFileSync(reportPath, report);

  console.log('\n🎉 批量修复完成！');
  console.log(`📄 修复报告已保存到: ${reportPath}`);
  console.log(`📊 修复统计:`);
  console.log(`   - 处理文件: ${fixStats.totalFiles}`);
  console.log(`   - 修复文件: ${fixStats.fixedFiles}`);
  console.log(`   - 修复问题: ${Object.values(fixStats.fixes).reduce((sum, count) => sum + count, 0)}`);
}

// 执行修复
main().catch(console.error);