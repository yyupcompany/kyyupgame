#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const routeFiles = [
  'server/src/routes/ai-billing.routes.ts',
  'server/src/routes/call-center.routes.ts',
  'server/src/routes/business-center.routes.ts',
  'server/src/routes/photo-album.routes.ts',
  'server/src/routes/system.routes.ts',
  'server/src/routes/notifications.routes.ts',
  'server/src/routes/teaching-center.routes.ts',
  'server/src/routes/assessment.routes.ts',
  'server/src/routes/referral-statistics.routes.ts',
  'server/src/routes/smart-promotion.routes.ts',
  'server/src/routes/referral-rewards.routes.ts',
  'server/src/routes/enrollment-interviews.routes.ts',
  'server/src/routes/principal-performance.routes.ts',
  'server/src/routes/document-instance.routes.ts',
  'server/src/routes/inspection-record.routes.ts'
];

for (const file of routeFiles) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${file}`);
    continue;
  }
  
  console.log(`\n📁 ${file}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 提取所有路由定义
  const matches = content.match(/router\.(get|post|put|delete|patch)\('([^']+)'/g) || [];
  const endpoints = [...new Set(matches.map(m => m.match(/'([^']+)'/)[1]))];
  
  if (endpoints.length > 0) {
    endpoints.forEach(ep => {
      console.log(`   GET  ${ep}`);
    });
  } else {
    console.log(`   ⚠️  无路由端点`);
  }
}

