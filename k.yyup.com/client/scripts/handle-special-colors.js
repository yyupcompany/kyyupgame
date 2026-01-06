#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 特殊颜色处理映射
const specialColorMap = {
  // 输入框和表单相关
  '#f8f9fa': {
    replacement: 'var(--bg-input)',
    contexts: ['input', 'form', 'textarea', 'el-input', 'el-textarea']
  },
  '#ffffff': {
    replacement: 'var(--bg-color)',
    contexts: ['background', 'bg', 'card', 'panel']
  },
  '#000000': {
    replacement: 'var(--text-primary)',
    contexts: ['text', 'color', 'font']
  },
  
  // Markdown编辑器特殊处理
  '#1f2937': {
    replacement: 'var(--text-primary-light)',
    contexts: ['markdown', 'editor', 'renderer']
  },
  '#374151': {
    replacement: 'var(--text-regular-light)',
    contexts: ['markdown', 'editor', 'renderer']
  },
  '#e5e7eb': {
    replacement: 'var(--text-secondary-dark)',
    contexts: ['markdown', 'editor', 'renderer', 'dark']
  },
  '#f3f4f6': {
    replacement: 'var(--bg-hover)',
    contexts: ['hover', 'background']
  },
  
  // AI组件特殊处理
  '#8b5cf6': {
    replacement: 'var(--accent-marketing)',
    contexts: ['ai', 'assistant', 'icon']
  },
  '#94a3b8': {
    replacement: 'var(--text-muted)',
    contexts: ['muted', 'secondary', 'placeholder']
  },
  '#64748b': {
    replacement: 'var(--text-secondary)',
    contexts: ['secondary', 'muted']
  }
};

// 检测文件上下文
function detectContext(content) {
  const contexts = [];
  
  // 检测组件类型
  if (content.includes('markdown') || content.includes('MarkdownRenderer')) {
    contexts.push('markdown', 'editor', 'renderer');
  }
  
  if (content.includes('input') || content.includes('textarea') || content.includes('form')) {
    contexts.push('input', 'form', 'textarea');
  }
  
  if (content.includes('ai') || content.includes('assistant')) {
    contexts.push('ai', 'assistant');
  }
  
  if (content.includes('el-input') || content.includes('el-textarea')) {
    contexts.push('el-input', 'el-textarea');
  }
  
  // 检测主题相关
  if (content.includes('isDark') || content.includes('dark-theme')) {
    contexts.push('dark');
  }
  
  if (content.includes('background') || content.includes('bg')) {
    contexts.push('background', 'bg');
  }
  
  if (content.includes('color') || content.includes('text')) {
    contexts.push('text', 'color');
  }
  
  return contexts;
}

// 智能颜色替换
function smartReplaceColors(content) {
  let replacedContent = content;
  const contexts = detectContext(content);
  
  Object.entries(specialColorMap).forEach(([color, config]) => {
    // 检查是否有匹配的上下文
    const hasMatchingContext = config.contexts.some(context => 
      contexts.includes(context)
    );
    
    if (hasMatchingContext) {
      // 替换各种格式的颜色值
      const patterns = [
        new RegExp(`color:\\s*${color}`, 'gi'),
        new RegExp(`background:\\s*${color}`, 'gi'),
        new RegExp(`background-color:\\s*${color}`, 'gi'),
        new RegExp(`border-color:\\s*${color}`, 'gi'),
        new RegExp(`"${color}"`, 'g'),
        new RegExp(`'${color}'`, 'g'),
        new RegExp(`:\\s*${color}`, 'g'), // 通用属性值
      ];
      
      patterns.forEach(pattern => {
        replacedContent = replacedContent.replace(pattern, (match) => {
          if (match.includes('color:')) {
            return match.replace(color, config.replacement);
          } else if (match.includes('background') || match.includes('border')) {
            return match.replace(color, config.replacement);
          } else {
            return match.replace(color, config.replacement);
          }
        });
      });
    }
  });
  
  return replacedContent;
}

// 处理特定文件
function processSpecialFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 应用智能替换
    let modifiedContent = smartReplaceColors(content);
    
    // 如果有修改，写回文件
    if (modifiedContent !== originalContent) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ 特殊处理完成: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 特殊处理失败: ${filePath}`, error.message);
    return false;
  }
}

// 主函数
function main() {
  const specialFiles = [
    '/home/zhgue/kyyupgame/k.yyup.com/client/src/components/common/MarkdownRenderer.vue',
    '/home/zhgue/kyyupgame/k.yyup.com/client/src/components/ai-assistant/input/InputArea.vue',
    '/home/zhgue/kyyupgame/k.yyup.com/client/src/components/ai-assistant/panels/RightSidebar.vue',
    '/home/zhgue/kyyupgame/k.yyup.com/client/src/components/common/MonacoEditor.vue'
  ];
  
  console.log('🎯 开始特殊颜色处理...\n');
  
  let processedCount = 0;
  let modifiedCount = 0;
  
  specialFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      processedCount++;
      if (processSpecialFile(filePath)) {
        modifiedCount++;
      }
    } else {
      console.log(`⚠️  文件不存在: ${filePath}`);
    }
  });
  
  console.log(`\n📊 特殊处理完成:`);
  console.log(`   - 处理文件数: ${processedCount}`);
  console.log(`   - 修改文件数: ${modifiedCount}`);
  
  if (modifiedCount > 0) {
    console.log('\n✨ 特殊颜色处理完成！');
  } else {
    console.log('\n💡 没有发现需要修改的特殊颜色。');
  }
}

// 运行脚本
main();
