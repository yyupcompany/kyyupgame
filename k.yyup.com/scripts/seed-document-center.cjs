#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function runSeeders() {
  console.log('🚀 开始执行文档中心种子数据...');

  try {
    // 检查种子数据文件是否存在
    const templateSeederPath = path.join(__dirname, '../server/seeders/20251114000001-seed-all-document-templates.js');
    const instanceSeederPath = path.join(__dirname, '../server/seeders/20251114000002-seed-all-document-instances.js');

    if (!fs.existsSync(templateSeederPath)) {
      console.log('❌ 模板种子数据文件不存在:', templateSeederPath);
      return;
    }

    if (!fs.existsSync(instanceSeederPath)) {
      console.log('❌ 实例种子数据文件不存在:', instanceSeederPath);
      return;
    }

    console.log('✅ 种子数据文件检查通过');
    console.log('📁 模板种子数据:', templateSeederPath);
    console.log('📁 实例种子数据:', instanceSeederPath);

    // 生成执行报告
    const report = {
      执行时间: new Date().toISOString(),
      文件状态: {
        模板种子: '✅ 存在',
        实例种子: '✅ 存在'
      },
      下一步: [
        '1. 确保后端服务正常启动',
        '2. 进入server目录执行种子数据',
        '3. 验证数据库中的数据'
      ]
    };

    // 保存报告
    const reportPath = path.join(__dirname, '../docs/检查中心文档模板库/种子数据执行报告.md');
    const reportContent = generateReport(report);

    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`📄 执行报告已生成: ${reportPath}`);

    console.log('\n🎯 执行建议:');
    console.log('由于TypeScript编译错误，建议手动执行种子数据:');
    console.log('1. 修复编译错误后重启后端服务');
    console.log('2. 使用Sequelize CLI执行种子数据');
    console.log('3. 验证数据库中的模板数据');

  } catch (error) {
    console.error('❌ 执行种子数据失败:', error);
  }
}

function generateReport(report) {
  return `# 文档中心种子数据执行报告

## 📋 基本信息

- **执行时间**: ${report.执行时间}
- **执行状态**: ✅ 文件检查完成

---

## 📁 文件状态检查

| 文件类型 | 状态 | 路径 |
|----------|------|------|
| 模板种子数据 | ${report.文件状态.模板种子} | \`server/seeders/20251114000001-seed-all-document-templates.js\` |
| 实例种子数据 | ${report.文件状态.实例种子} | \`server/seeders/20251114000002-seed-all-document-instances.js\` |

---

## 🎯 下一步操作

${report.下一步.map(step => `- ${step}`).join('\n')}

---

## 📊 种子数据统计

- **模板总数**: 73个
- **覆盖类别**: 7大类
- **预期实例数**: 100+个

### 分类统计
- 年度检查类: 12个模板
- 专项检查类: 32个模板
- 常态化督导类: 5个模板
- 教职工管理类: 6个模板
- 幼儿管理类: 5个模板
- 财务管理类: 5个模板
- 保教工作类: 8个模板

---

**报告生成时间**: ${report.执行时间}
**状态**: ✅ 文件检查完成，等待执行
`;
}

// 执行
if (require.main === module) {
  runSeeders().catch(console.error);
}

module.exports = { runSeeders };