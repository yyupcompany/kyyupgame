const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('📱 移动端页面完整性验证报告');
console.log('═══════════════════════════════════════════════════════════════\n');

const mobilePagesPath = '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile';

// 获取所有移动端页面的index.vue文件
function getAllIndexVueFiles(dir) {
  const results = [];

  function search(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        search(fullPath);
      } else if (entry.name === 'index.vue') {
        results.push(fullPath);
      }
    }
  }

  search(dir);
  return results;
}

// 验证Vue文件的完整性
function validateVueFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // 检查基本的Vue文件结构
  if (!content.includes('<template>')) {
    issues.push('缺少 <template> 标签');
  }

  if (!content.includes('<script')) {
    issues.push('缺少 <script> 标签');
  }

  if (!content.includes('</style>')) {
    issues.push('缺少 <style> 标签');
  }

  // 检查路由路径映射
  const relativePath = filePath.replace('/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile', '');
  const routePath = '/mobile' + relativePath.replace('/index.vue', '');

  // 检查是否是占位符页面
  const isPlaceholder = content.includes('功能开发中，敬请期待') ||
                        content.includes('开发中') ||
                        content.includes('敬请期待');

  return {
    filePath,
    routePath,
    isPlaceholder,
    hasIssues: issues.length > 0,
    issues
  };
}

// 执行验证
console.log('🔍 正在扫描移动端页面...\n');
const indexVueFiles = getAllIndexVueFiles(mobilePagesPath);
console.log(`📊 共发现 ${indexVueFiles.length} 个移动端页面\n`);

console.log('═══════════════════════════════════════════════════════════════');
console.log('📋 验证结果详情');
console.log('═══════════════════════════════════════════════════════════════\n');

let validPages = 0;
let placeholderPages = 0;
let problematicPages = 0;
const problems = [];

for (const filePath of indexVueFiles) {
  const result = validateVueFile(filePath);
  const status = result.hasIssues ? '❌' : (result.isPlaceholder ? '⚠️' : '✅');

  console.log(`${status} ${result.routePath}`);

  if (result.isPlaceholder) {
    placeholderPages++;
    console.log(`   备注: 占位符页面`);
  }

  if (result.hasIssues) {
    problematicPages++;
    console.log(`   问题: ${result.issues.join(', ')}`);
    problems.push(result);
  } else {
    validPages++;
  }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('📊 统计摘要');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`✅ 有效页面: ${validPages} 个`);
console.log(`⚠️  占位符页面: ${placeholderPages} 个`);
console.log(`❌ 问题页面: ${problematicPages} 个`);
console.log(`📱 总计: ${indexVueFiles.length} 个页面\n`);

if (problems.length > 0) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚨 需要修复的问题页面');
  console.log('═══════════════════════════════════════════════════════════════\n');

  for (const problem of problems) {
    console.log(`❌ ${problem.routePath}`);
    console.log(`   文件: ${problem.filePath}`);
    console.log(`   问题: ${problem.issues.join(', ')}\n`);
  }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('✅ 验证完成');
console.log('═══════════════════════════════════════════════════════════════\n');

// 生成JSON报告
const report = {
  summary: {
    totalPages: indexVueFiles.length,
    validPages,
    placeholderPages,
    problematicPages
  },
  validPages: indexVueFiles.filter(f => validateVueFile(f).hasIssues === false && validateVueFile(f).isPlaceholder === false),
  placeholderPages: indexVueFiles.filter(f => validateVueFile(f).isPlaceholder),
  problematicPages: problems,
  verifiedAt: new Date().toISOString()
};

fs.writeFileSync('/home/zhgue/kyyupgame/k.yyup.com/client/tests/mobile/mobile-pages-verification-report.json',
  JSON.stringify(report, null, 2));

console.log('💾 报告已保存到: client/tests/mobile/mobile-pages-verification-report.json\n');
