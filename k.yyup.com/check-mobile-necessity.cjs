const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 移动端页面必要性检查');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log('检查原则：PC端没有的模块，移动端也不需要开发\n');

const pcPagesPath = '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages';

// 22个移动端占位页面，检查PC端是否有对应开发
const mobilePagesToCheck = [
  { mobile: 'centers/activity-center', name: '活动中心' },
  { mobile: 'centers/ai-billing-center', name: 'AI账单中心' },
  { mobile: 'centers/ai-center', name: 'AI中心' },
  { mobile: 'centers/assessment-center', name: '评估中心' },
  { mobile: 'centers/attendance', name: '考勤管理' },
  { mobile: 'centers/document-center', name: '文档中心' },
  { mobile: 'centers/document-editor', name: '文档编辑器' },
  { mobile: 'centers/enrollment-center', name: '招生中心' },
  { mobile: 'centers/inspection-center', name: '检查中心' },
  { mobile: 'centers/marketing-center', name: '营销中心' },
  { mobile: 'centers/media-center', name: '媒体中心' },
  { mobile: 'centers/system-center', name: '系统中心' },
  { mobile: 'centers/teacher-center', name: '教师中心' },
  { mobile: 'centers/teaching-center', name: '教学中心' },
  { mobile: 'centers/template-detail', name: '模板详情' },
  { mobile: 'centers/user-center', name: '用户中心' },
  { mobile: 'document-instance/edit', name: '文档实例编辑' },
  { mobile: 'parent-center/ai-assistant', name: '家长AI助手' },
  { mobile: 'parent-center/profile', name: '家长个人中心' },
  { mobile: 'teacher-center/enrollment', name: '教师招生' },
  { mobile: 'teacher-center/teaching', name: '教师教学' },
];

console.log('📱 移动端页面 → PC端必要性评估');
console.log('═══════════════════════════════════════════════════════════════\n');

let unnecessaryPages = [];
let necessaryPages = [];
let centerPages = [];
let needAction = [];

mobilePagesToCheck.forEach(page => {
  // 检查PC端对应目录
  const pcPath = path.join(pcPagesPath, page.mobile);
  const pcDirExists = fs.existsSync(pcPath) && fs.statSync(pcPath).isDirectory();
  
  // 检查是否有相关文件（包括子目录）
  let pcFileCount = 0;
  if (pcDirExists) {
    try {
      const files = fs.readdirSync(pcPath, { recursive: true });
      pcFileCount = files.filter(f => f.endsWith('.vue')).length;
    } catch (e) {
      pcFileCount = 0;
    }
  }
  
  console.log(`${page.name}`);
  console.log(`📱 移动端路径: ${page.mobile}/`);
  
  if (pcDirExists && pcFileCount > 0) {
    console.log(`✅ PC端状态: 已开发 (${pcFileCount}个Vue文件)`);
    console.log(`📋 评估: 需要开发移动端`);
    necessaryPages.push({
      page: page.mobile,
      name: page.name,
      pcFiles: pcFileCount,
      action: '需要开发',
      priority: '必要'
    });
    
    if (pcFileCount > 20) {
      console.log(`   ⚠️ 警告: PC端已有${pcFileCount}个文件，移动端需要同步开发`);
      needAction.push(page.name);
    }
  } else {
    console.log(`❌ PC端状态: 未开发`);
    console.log(`📋 评估: 不需要开发移动端`);
    unnecessaryPages.push({
      page: page.mobile,
      name: page.name,
      pcFiles: 0,
      action: '无需开发',
      priority: '删除移动端占位'
    });
  }
  console.log('');
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 统计结果');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`✅ 需要开发: ${necessaryPages.length} 个`);
console.log(`❌ 无需开发: ${unnecessaryPages.length} 个`);
console.log(`📱 总计: ${mobilePagesToCheck.length} 个移动端页面\n`);

console.log('═══════════════════════════════════════════════════════════════');
console.log('🗑️  建议删除的移动端占位页面（PC端未开发）');
console.log('═══════════════════════════════════════════════════════════════\n');

if (unnecessaryPages.length > 0) {
  unnecessaryPages.forEach(page => {
    console.log(`❌ ${page.name}`);
    console.log(`   路径: ${page.mobile}/`);
    console.log(`   操作: 删除移动端占位页面`);
    console.log(`   原因: PC端无此功能模块\n`);
  });
  
  console.log(`总计可删除: ${unnecessaryPages.length} 个占位页面\n`);
} else {
  console.log('没有需要删除的页面\n');
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ 需要开发的移动端页面（PC端已开发）');
console.log('═══════════════════════════════════════════════════════════════\n');

if (necessaryPages.length > 0) {
  necessaryPages.forEach(page => {
    console.log(`✅ ${page.name}`);
    console.log(`   路径: ${page.mobile}/`);
    console.log(`   PC端文件数: ${page.pcFiles}`);
    console.log(`   操作: 启动移动端开发`);
    console.log(`   优先级: ${page.priority}\n`);
  });
  
  console.log(`总计需要开发: ${necessaryPages.length} 个移动端页面\n`);
} else {
  console.log('没有需要开发的页面\n');
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('💡 最终建议');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('1. 删除以下移动端占位页面:');
console.log(`   数量: ${unnecessaryPages.length} 个\n`);

console.log('2. 开发以下移动端功能:');
console.log(`   数量: ${necessaryPages.length} 个\n`);

console.log('3. 未来新建模块时应遵循:');
console.log('   - PC端先开发 → 移动端跟随');
console.log('   - 或PC端+移动端同时开发');
console.log('   - 不要在移动端创建无PC端对应的功能占位');

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('✅ 检查完成');
console.log('═══════════════════════════════════════════════════════════════');

// 生成删除脚本
if (unnecessaryPages.length > 0) {
  const deleteScript = `#!/bin/bash
# 批量删除不必要的移动端占位页面
# 生成时间: ${new Date().toISOString()}

echo "正在删除 ${unnecessaryPages.length} 个不必要的移动端页面..."

${unnecessaryPages.map(page => `rm -rf ${mobilePagesPath}/${page.page}`).join('\n')}

echo "删除完成！"
echo "建议: 提交代码更改并更新文档"
`;
  
  fs.writeFileSync('/home/zhgue/kyyupgame/k.yyup.com/delete-unnecessary-mobile-pages.sh', deleteScript);
  console.log('\n💾 删除脚本已生成: delete-unnecessary-mobile-pages.sh');
  console.log('⚠️  请审查后再执行！');
}
