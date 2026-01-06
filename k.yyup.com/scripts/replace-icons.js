#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 图标映射表：el-icon -> LucideIcon 名称
const iconMapping = {
  'el-icon-arrow-down': 'chevron-down',
  'el-icon-arrow-left': 'arrow-left',
  'el-icon-arrow-right': 'arrow-right',
  'el-icon-arrow-up': 'chevron-up',
  'el-icon-plus': 'plus',
  'el-icon-minus': 'minus',
  'el-icon-edit': 'edit',
  'el-icon-delete': 'delete',
  'el-icon-search': 'search',
  'el-icon-close': 'x',
  'el-icon-check': 'check',
  'el-icon-warning': 'alert-triangle',
  'el-icon-info': 'info',
  'el-icon-success': 'check-circle',
  'el-icon-error': 'x-circle',
  'el-icon-loading': 'loader',
  'el-icon-refresh': 'refresh',
  'el-icon-menu': 'menu',
  'el-icon-more': 'more-horizontal',
  'el-icon-more-vertical': 'more-vertical',
  'el-icon-setting': 'settings',
  'el-icon-user': 'user',
  'el-icon-users': 'users',
  'el-icon-phone': 'phone',
  'el-icon-message': 'message-square',
  'el-icon-star': 'star',
  'el-icon-heart': 'heart',
  'el-icon-share': 'share',
  'el-icon-download': 'download',
  'el-icon-upload': 'upload',
  'el-icon-picture': 'image',
  'el-icon-picture-outline': 'image',
  'el-icon-video-camera': 'video',
  'el-icon-video-play': 'play',
  'el-icon-grid': 'grid',
  'el-icon-list': 'list',
  'el-icon-calendar': 'calendar',
  'el-icon-clock': 'clock',
  'el-icon-location': 'map-pin',
  'el-icon-document': 'file-text',
  'el-icon-folder': 'folder',
  'el-icon-tag': 'tag',
  'el-icon-bookmark': 'bookmark',
  'el-icon-link': 'link',
  'el-icon-copy': 'copy',
  'el-icon-print': 'printer',
  'el-icon-filter': 'filter',
  'el-icon-sort': 'arrow-up-down',
  'el-icon-zoom-in': 'zoom-in',
  'el-icon-zoom-out': 'zoom-out',
  'el-icon-fullscreen': 'maximize',
  'el-icon-bell': 'bell',
  'el-icon-view': 'eye',
  'el-icon-hide': 'eye-off',
  'el-icon-lock': 'lock',
  'el-icon-unlock': 'unlock',
  'el-icon-tickets': 'ticket',
  'el-icon-wallet': 'credit-card',
  'el-icon-shopping-cart': 'shopping-cart',
  'el-icon-goods': 'package',
  'el-icon-sold-out': 'x-circle',
  'el-icon-present': 'gift',
  'el-icon-umbrella': 'umbrella',
  'el-icon-sun': 'sun',
  'el-icon-moon': 'moon',
  'el-icon-cloudy': 'cloud',
  'el-icon-sunny': 'sun',
  'el-icon-time': 'clock',
  'el-icon-timer': 'timer',
  'el-icon-position': 'navigation',
  'el-icon-pointer': 'mouse-pointer',
  'el-icon-data-analysis': 'bar-chart-3',
  'el-icon-trend-charts': 'trending-up',
  'el-icon-pie-chart': 'pie-chart',
  'el-icon-camera': 'camera'
};

// 递归遍历目录
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 跳过 node_modules 和 .git
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        walkDir(filePath, callback);
      }
    } else if (file.match(/\.(vue|ts|js|tsx|jsx)$/)) {
      callback(filePath);
    }
  }
}

// 替换文件中的图标
function replaceIconsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let hasChanges = false;

  // 替换 <i class="el-icon-xxx"> 为 <LucideIcon name="xxx">
  for (const [oldIcon, newIcon] of Object.entries(iconMapping)) {
    // 匹配 <i class="el-icon-xxx"> 或 <i class="xxx el-icon-xxx yyy">
    const regex = new RegExp(`<i[^>]*class="[^"]*\\b${oldIcon}\\b[^"]*"[^>]*>\\s*</i>`, 'g');
    const replacement = `<UnifiedIcon name="${newIcon}" :size="16" />`;

    if (regex.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(regex, replacement);
      hasChanges = true;
      console.log(`✅ ${filePath}: 替换 ${oldIcon} -> ${newIcon}`);
    }

    // 替换 JavaScript 对象中的图标字符串，如: navigate: 'el-icon-position' -> navigate: 'navigation'
    const jsRegex = new RegExp(`'${oldIcon}'|"${oldIcon}"`, 'g');
    const jsReplacement = `'${newIcon}'`;

    if (jsRegex.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(jsRegex, jsReplacement);
      hasChanges = true;
      console.log(`✅ ${filePath}: 替换 JS 对象 ${oldIcon} -> ${newIcon}`);
    }
  }

  // 如果有修改，写回文件
  if (hasChanges) {
    // 检查是否已经导入了 UnifiedIcon
    if (!modifiedContent.includes('import UnifiedIcon')) {
      // 在 <script setup> 标签后添加导入
      const scriptSetupRegex = /(<script setup[^>]*>)/;
      const match = modifiedContent.match(scriptSetupRegex);

      if (match) {
        modifiedContent = modifiedContent.replace(
          match[1],
          `${match[1]}\nimport UnifiedIcon from '@/components/icons/UnifiedIcon.vue'\n`
        );
        console.log(`📦 ${filePath}: 添加 UnifiedIcon 导入`);
      }
    }

    fs.writeFileSync(filePath, modifiedContent);
    console.log(`💾 ${filePath}: 已保存修改`);
  }
}

// 主函数
function main() {
  // 项目根目录的 client/src
  const srcDir = path.join(__dirname, '..', 'client', 'src');

  console.log('🚀 开始批量替换图标...\n');

  if (!fs.existsSync(srcDir)) {
    console.error(`❌ 错误：目录不存在: ${srcDir}`);
    process.exit(1);
  }

  walkDir(srcDir, (filePath) => {
    replaceIconsInFile(filePath);
  });

  console.log('\n✨ 图标替换完成！');
  console.log('\n📝 接下来需要手动检查：');
  console.log('1. 确认 UnifiedIcon 组件已正确导入');
  console.log('2. 检查图标大小是否合适');
  console.log('3. 测试页面显示是否正常');
}

// 检查是否直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { replaceIconsInFile, iconMapping };