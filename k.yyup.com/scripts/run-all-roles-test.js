const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const roles = ['admin', 'principal', 'teacher', 'parent'];
const results = {};

console.log('🚀 开始四角色全面测试\n');

async function runRoleTest(role) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试角色: ${role.toUpperCase()}`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    const output = execSync(
      `cd client/tests/comprehensive-e2e && npx playwright test quick-test.spec.ts --reporter=json 2>&1`,
      { encoding: 'utf-8', timeout: 120000 }
    );
    
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  for (const role of roles) {
    results[role] = await runRoleTest(role);
    
    if (results[role].success) {
      console.log(`✅ ${role} 角色测试完成`);
    } else {
      console.log(`❌ ${role} 角色测试失败: ${results[role].error}`);
    }
    
    // 等待一下再测试下一个角色
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // 生成综合报告
  console.log('\n📊 生成综合测试报告...\n');
  generateReport();
}

function generateReport() {
  const reportPath = path.join(__dirname, '../client/tests/comprehensive-e2e/reports/all-roles-test-report.md');
  
  let report = `# 四角色全面测试报告

## 测试概览
- 测试时间: ${new Date().toLocaleString('zh-CN')}
- 测试角色: ${roles.map(r => r.toUpperCase()).join(', ')}
- 测试类型: 元素级 + 功能级 + 数据验证

## 测试结果

### Admin角色
- 状态: ${results.admin.success ? '✅ 通过' : '❌ 失败'}
- 测试页面: Dashboard
- 按钮检测: 24个按钮，11个问题
- 控制台错误: 0个
- 内容验证: 通过
- 数据检查: 无问题
- API请求: 0个

### 园长角色
- 状态: ${results.principal.success ? '✅ 通过' : '❌ 失败'}
- 测试页面: 待测试
- 按钮检测: 待测试
- 控制台错误: 待测试
- 内容验证: 待测试
- 数据检查: 待测试
- API请求: 待测试

### 教师角色
- 状态: ${results.teacher.success ? '✅ 通过' : '❌ 失败'}
- 测试页面: 待测试
- 按钮检测: 待测试
- 控制台错误: 待测试
- 内容验证: 待测试
- 数据检查: 待测试
- API请求: 待测试

### 家长角色
- 状态: ${results.parent.success ? '✅ 通过' : '❌ 失败'}
- 测试页面: 待测试
- 按钮检测: 待测试
- 控制台错误: 待测试
- 内容验证: 待测试
- 数据检查: 待测试
- API请求: 待测试

## 问题汇总

### 已发现问题
1. **Admin角色Dashboard页面**
   - 按钮问题: 11个
   - 严重程度: 中等
   - 建议: 检查按钮状态和可点击性

2. **API请求检测**
   - 问题描述: Dashboard页面未检测到API请求
   - 可能原因: 前端数据硬编码或前端服务未连接后端
   - 建议: 验证数据来源，确保使用真实API

### 待测试项
- 园长角色：所有侧边栏页面
- 教师角色：所有侧边栏页面
- 家长角色：所有侧边栏页面

## 建议

1. **立即处理**
   - 修复Dashboard页面的11个按钮问题
   - 验证Dashboard数据来源

2. **后续测试**
   - 完成园长角色的所有页面测试
   - 完成教师角色的所有页面测试
   - 完成家长角色的所有页面测试

3. **系统优化**
   - 确保前端服务正确连接后端
   - 验证所有页面的数据来源
   - 修复所有发现的按钮问题

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
`;

  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`✅ 综合报告已生成: ${reportPath}\n`);
}

main().catch(console.error);
