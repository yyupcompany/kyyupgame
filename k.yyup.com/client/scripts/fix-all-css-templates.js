#!/usr/bin/env node

/**
 * 修复所有CSS模板字符串
 * Fix All CSS Template Strings
 */

import fs from 'fs';

function fixAllCssTemplates() {
  const filePath = './src/pages/teacher-center/creative-curriculum/utils/curriculum-templates.ts';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 修复第一个CSS模板
    content = content.replace(
      /cssTemplate: `\.health-exercise {[\s\S]*?}\s*`/g,
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

.exercise-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
}

.exercise-item {
  background: rgba(255, 255, 255, 0.1);
  padding: var(--spacing-lg);
  border-radius: 8px;
  text-align: center;
}

.exercise-item h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-on-primary);
}

#startBtn {
  display: block;
  margin: var(--spacing-xl) auto 0;
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--success-color);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

#startBtn:hover {
  background: var(--success-hover);
  transform: translateY(-2px);
}\``
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ CSS模板字符串已修复');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

// 运行修复
fixAllCssTemplates();