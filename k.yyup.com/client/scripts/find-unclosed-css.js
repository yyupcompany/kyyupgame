#!/usr/bin/env node

/**
 * 查找未闭合的CSS模板字符串
 * Find Unclosed CSS Template Strings
 */

import fs from 'fs';

function findUnclosedCssTemplates() {
  const filePath = './src/pages/teacher-center/creative-curriculum/utils/curriculum-templates.ts';
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let inCssTemplate = false;
    let currentTemplate = '';
    let templateStartLine = 0;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('cssTemplate: `')) {
        inCssTemplate = true;
        templateStartLine = i + 1;
        currentTemplate = line;
        braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      } else if (inCssTemplate) {
        currentTemplate += '\n' + line;
        braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
        
        if (line.includes('`') && braceCount === 0) {
          // CSS模板正确闭合
          console.log(`✅ CSS模板在第 ${templateStartLine} 行正确闭合`);
          inCssTemplate = false;
          currentTemplate = '';
        }
      }
    }
    
    if (inCssTemplate) {
      console.log(`❌ 发现未闭合的CSS模板，开始于第 ${templateStartLine} 行`);
      console.log('模板内容:');
      console.log(currentTemplate);
    }
    
  } catch (error) {
    console.error('❌ 查找失败:', error);
  }
}

// 运行查找
findUnclosedCssTemplates();
