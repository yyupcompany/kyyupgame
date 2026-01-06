#!/usr/bin/env node

/**
 * 修复CSS模板字符串
 * Fix CSS Template Strings
 */

import fs from 'fs';

function fixCssTemplates() {
  const filePath = './src/pages/teacher-center/creative-curriculum/utils/curriculum-templates.ts';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 找到所有cssTemplate并修复它们
    const cssTemplateRegex = /cssTemplate:\s*`([^`]*(?:[^`]*`[^`]*[^`]*)*)`/gs;
    
    let match;
    let fixed = false;
    
    while ((match = cssTemplateRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const cssContent = match[1];
      
      // 检查CSS内容是否以反引号结束
      if (!fullMatch.endsWith('`')) {
        console.log('发现未闭合的CSS模板字符串');
        fixed = true;
      }
    }
    
    // 如果发现问题，手动修复每个CSS模板
    if (fixed) {
      // 修复第一个CSS模板
      content = content.replace(
        /cssTemplate:\s*`\.health-exercise {[\s\S]*?\.exercise-container {/,
        `cssTemplate: \`.health-exercise {
  padding: var(--spacing-4xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-radius: 10px;
  color: var(--text-on-primary);
  font-family: 'Arial', sans-serif;
}

.health-exercise h1 {
  text-align: center;
  font-size: 2em;
  margin-bottom: var(--spacing-4xl);
}

.exercise-container {`
      );
      
      // 修复第二个CSS模板
      content = content.replace(
        /cssTemplate:\s*`\.story-container {[\s\S]*?font-size: 2em;/,
        `cssTemplate: \`.story-container {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-4xl);
  background: var(--bg-warning-light);
  border-radius: 15px;
  box-shadow: var(--shadow-md);
}

.story-container h1 {
  text-align: center;
  color: var(--warning-color);
  font-size: 2em;`
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ CSS模板字符串已修复');
    } else {
      console.log('✅ CSS模板字符串格式正确');
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

// 运行修复
fixCssTemplates();