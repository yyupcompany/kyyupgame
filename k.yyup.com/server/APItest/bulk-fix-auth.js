#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'activities.comprehensive.test.ts',
  'activity-extended-management.comprehensive.test.ts',
  'activity-planner.comprehensive.test.ts',
  'admission-notification-result.comprehensive.test.ts',
  'ai-analytics.comprehensive.test.ts',
  'ai-conversation.comprehensive.test.ts',
  'ai-memory.comprehensive.test.ts',
  'ai-model.comprehensive.test.ts',
  'ai-user.comprehensive.test.ts',
  'consultations.comprehensive.test.ts',
  'dashboard.comprehensive.test.ts',
  'enrollment-management.comprehensive.test.ts',
  'enrollments.comprehensive.test.ts',
  'expert-consultation.comprehensive.test.ts',
  'files.comprehensive.test.ts',
  'marketing.comprehensive.test.ts',
  'parent.comprehensive.test.ts',
  'performance-management.comprehensive.test.ts',
  'permissions.comprehensive.test.ts',
  'role-permission-management.comprehensive.test.ts',
  'system.comprehensive.test.ts'
];

const comprehensiveDir = '/home/devbox/project/server/APItest/comprehensive';

function fixAuthInFile(filePath) {
  console.log(`🔧 修复文件: ${path.basename(filePath)}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. 添加认证帮助器导入
  const importFix = `import axios, { AxiosResponse } from 'axios';
import { TestDataFactory } from '../helpers/testUtils';
import { getAuthToken, TEST_CREDENTIALS } from '../helpers/authHelper';`;

  content = content.replace(
    /import axios, { AxiosResponse } from 'axios';\nimport { TestDataFactory } from '\.\.\/helpers\/testUtils';/,
    importFix
  );

  // 2. 修复beforeAll中的认证逻辑
  const oldAuthPattern = /\/\/ 获取认证token[\s\S]*?const loginResponse = await apiClient\.post\('\/auth\/login', \{[\s\S]*?email: 'admin@k\.yyup\.cc',[\s\S]*?password: 'admin123'[\s\S]*?\}\);[\s\S]*?if \(loginResponse\.status === 200 && loginResponse\.data\.success\) \{[\s\S]*?authToken = loginResponse\.data\.data\.token;[\s\S]*?console\.log\('✅ 获取认证token成功'\);[\s\S]*?\} else \{[\s\S]*?\/\/ 尝试备用登录[\s\S]*?const altResponse = await apiClient\.post\('\/auth\/login', \{[\s\S]*?username: 'admin',[\s\S]*?password: 'admin123'[\s\S]*?\}\);[\s\S]*?if \(altResponse\.status === 200 && altResponse\.data\.success\) \{[\s\S]*?authToken = altResponse\.data\.data\.token;[\s\S]*?\}[\s\S]*?\}/;

  const newAuthCode = `try {
      // 使用真实的认证凭据获取token
      authToken = await getAuthToken('admin');
      apiClient.defaults.headers.common['Authorization'] = \`Bearer \${authToken}\`;
      console.log('✅ 管理员认证成功');
    } catch (error) {
      console.error('❌ 管理员认证失败:', error);
      throw new Error('Failed to authenticate admin user');
    }`;

  content = content.replace(oldAuthPattern, newAuthCode);

  // 3. 处理简化版本的认证代码
  const simpleAuthPattern = /\/\/ 获取认证token[\s\S]*?const loginResponse = await apiClient\.post\('\/auth\/login', \{[\s\S]*?email: 'admin@k\.yyup\.cc',[\s\S]*?password: 'admin123'[\s\S]*?\}\);[\s\S]*?if \(loginResponse\.status === 200 && loginResponse\.data\.success\) \{[\s\S]*?authToken = loginResponse\.data\.data\.token;[\s\S]*?console\.log\('✅ 获取认证token成功'\);[\s\S]*?\}/;

  content = content.replace(simpleAuthPattern, newAuthCode);

  // 4. 处理更简化的模式
  const verySimplePattern = /const loginResponse = await apiClient\.post\('\/auth\/login', \{[\s\S]*?email: 'admin@k\.yyup\.cc',[\s\S]*?password: 'admin123'[\s\S]*?\}\);[\s\S]*?if \(loginResponse\.status === 200 && loginResponse\.data\.success\) \{[\s\S]*?authToken = loginResponse\.data\.data\.token;[\s\S]*?console\.log\('✅ 获取认证token成功'\);[\s\S]*?\}/;

  content = content.replace(verySimplePattern, newAuthCode);

  // 5. 处理email认证尝试的任何残留
  content = content.replace(/email: 'admin@k\.yyup\.cc'/g, "username: 'admin'");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ 修复完成: ${path.basename(filePath)}`);
}

// 执行批量修复
console.log('🚀 开始批量修复认证问题...');
console.log(`📋 需要修复 ${filesToFix.length} 个文件`);

for (const fileName of filesToFix) {
  const filePath = path.join(comprehensiveDir, fileName);
  if (fs.existsSync(filePath)) {
    try {
      fixAuthInFile(filePath);
    } catch (error) {
      console.error(`❌ 修复失败 ${fileName}:`, error.message);
    }
  } else {
    console.warn(`⚠️ 文件不存在: ${fileName}`);
  }
}

console.log('🎯 批量修复完成！');
console.log('✅ 所有comprehensive测试文件现在都使用真实登录页面凭据');