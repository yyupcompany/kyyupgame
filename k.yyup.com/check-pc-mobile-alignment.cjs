const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 PC端与移动端开发对齐情况检查');
console.log('═══════════════════════════════════════════════════════════════\n');

const pcPagesPath = '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages';
const mobilePagesPath = '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile';

// 22个移动端占位页面
const placeholderPages = [
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

console.log('📱 移动端占位页面 → PC端开发状态');
console.log('═══════════════════════════════════════════════════════════════\n');

let fullyDeveloped = 0;
let partiallyDeveloped = 0;
let notDeveloped = 0;
let overDeveloped = []; // PC端已开发但移动端未开发

placeholderPages.forEach(page => {
  // 检查PC端对应目录
  const pcPath = path.join(pcPagesPath, page.mobile.split('/')[1] || page.mobile);
  const exists = fs.existsSync(pcPath);

  if (exists) {
    const stats = getDirectoryStats(pcPath);

    if (stats.vueFiles > 10) {
      console.log(`✅ ${page.name}`);
      console.log(`   📂 PC端: ${page.mobile}/`);
      console.log(`   📊 状态: 已开发 (${stats.vueFiles}个Vue文件, ${stats.components}个组件)`);
      console.log(`   ⚠️  警告: 移动端仍为占位页面，需要开发`);
      fullyDeveloped++;

      // 检查是否符合1:1复制
      const mobilePath = path.join(mobilePagesPath, page.mobile);
      const mobileExists = fs.existsSync(mobilePath) && fs.existsSync(path.join(mobilePath, 'index.vue'));

      if (!mobileExists) {
        overDeveloped.push({
          name: page.name,
          pcPath: page.mobile,
          pcFiles: stats.vueFiles,
          mobileStatus: '占位页面'
        });
      }
    } else if (stats.vueFiles > 0) {
      console.log(`⚠️  ${page.name}`);
      console.log(`   📂 PC端: ${page.mobile}/`);
      console.log(`   📊 状态: 部分开发 (${stats.vueFiles}个Vue文件)`);
      console.log(`   💡 建议: 评估是否需要继续开发`);
      partiallyDeveloped++;
    } else {
      console.log(`❌ ${page.name}`);
      console.log(`   📂 PC端: ${page.mobile}/`);
      console.log(`   📊 状态: 未开发`);
      notDeveloped++;
    }
  } else {
    // 检查是否有同名但路径不同的模块
    const alternativePaths = findAlternativePaths(page.name, page.mobile);
    if (alternativePaths.length > 0) {
      console.log(`⚠️  ${page.name}`);
      console.log(`   📂 PC端: 路径不匹配`);
      console.log(`   📊 状态: 可能已开发在其他路径`);
      console.log(`   🔍 可能路径: ${alternativePaths.join(', ')}`);
      partiallyDeveloped++;
    } else {
      console.log(`❌ ${page.name}`);
      console.log(`   📂 PC端: 未找到 ${page.mobile}/`);
      console.log(`   📊 状态: 未开发`);
      notDeveloped++;
    }
  }
  console.log('');
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 总体统计');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`✅ 已完全开发: ${fullyDeveloped} 个`);
console.log(`⚠️  部分开发: ${partiallyDeveloped} 个`);
console.log(`❌ 未开发: ${notDeveloped} 个`);
console.log(`📱 总计: ${placeholderPages.length} 个移动端占位页面\n`);

// 检查PC端过度开发的情况
if (overDeveloped.length > 0) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚨 过度开发警告（PC端已开发但移动端为占位）');
  console.log('═══════════════════════════════════════════════════════════════\n');

  overDeveloped.forEach(item => {
    console.log(`⚠️  ${item.name}`);
    console.log(`   PC端: ${item.pcPath}/ (${item.pcFiles}个文件)`);
    console.log(`   移动端: ${item.mobileStatus}\n`);
  });
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('💡 建议和优先级');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('🟥 高优先级（PC端已完整开发，需移动端1:1复制）：');
overDeveloped.forEach(item => {
  console.log(`   - ${item.name} (${item.pcFiles}个PC端文件)`);
});

console.log('\n🟨 中优先级（部分开发，评估需求）：');
console.log('   - 评估是否继续PC端开发，或暂停等待移动端需求');

console.log('\n🟩 低优先级（未开发）：');
console.log('   - 根据业务需求排期开发');

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('✅ 检查完成');
console.log('═══════════════════════════════════════════════════════════════');

// 获取目录统计信息
function getDirectoryStats(dirPath) {
  try {
    const files = fs.readdirSync(dirPath, { recursive: true });
    const vueFiles = files.filter(f => f.endsWith('.vue')).length;
    const components = files.filter(f => f.includes('components')).length;

    return { vueFiles, components };
  } catch (e) {
    return { vueFiles: 0, components: 0 };
  }
}

// 查找可能的替代路径
function findAlternativePaths(name, expectedPath) {
  const keywords = name.replace(/(中心|管理|页面)/g, '').trim();
  const paths = [];

  try {
    const allPaths = fs.readdirSync(pcPagesPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    allPaths.forEach(dir => {
      if (dir.includes(keywords) || keywords.includes(dir)) {
        paths.push(dir);
      }
    });
  } catch (e) {
    // 忽略错误
  }

  return paths;
}
