#!/usr/bin/env node
/**
 * 页面对齐审计工具
 * 检测移动端和PC端页面的布局对齐情况
 */

const fs = require('fs');
const path = require('path');

const CLIENT_DIR = '/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages';
const MOBILE_CENTERS_DIR = path.join(CLIENT_DIR, 'mobile/centers');
const PC_CENTERS_DIR = path.join(CLIENT_DIR, 'centers');
const MOBILE_TEACHER_DIR = path.join(CLIENT_DIR, 'mobile/teacher-center');
const MOBILE_PARENT_DIR = path.join(CLIENT_DIR, 'mobile/parent-center');

// 结果存储
const results = {
  mobileCenters: [],
  pcCenters: [],
  mobileTeacher: [],
  mobileParent: [],
  layoutUsage: {
    mobile: {
      MobileCenterLayout: 0,
      UnifiedMobileLayout: 0,
      MobileMainLayout: 0,
      RoleBasedMobileLayout: 0,
      none: 0
    },
    pc: {
      UnifiedCenterLayout: 0,
      CentersSidebar: 0,
      MainLayout: 0,
      none: 0
    }
  },
  alignmentIssues: []
};

/**
 * 递归获取目录下所有Vue文件
 */
function getVueFiles(dir, excludeDirs = []) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const traverse = (currentDir) => {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          traverse(fullPath);
        }
      } else if (item.endsWith('.vue')) {
        files.push(fullPath);
      }
    }
  };

  traverse(dir);
  return files;
}

/**
 * 分析Vue文件的布局使用情况
 */
function analyzeLayout(filePath, category) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(CLIENT_DIR, filePath);

  const info = {
    path: relativePath,
    layouts: [],
    hasSidebar: false,
    hasResponsive: false,
    issues: []
  };

  // 检测布局组件
  const layoutPatterns = {
    mobile: [
      'MobileCenterLayout',
      'UnifiedMobileLayout',
      'MobileMainLayout',
      'RoleBasedMobileLayout',
      'MobileLayout',
      'BaseMobileLayout'
    ],
    pc: [
      'UnifiedCenterLayout',
      'CentersSidebar',
      'MainLayout',
      'CenterLayout'
    ]
  };

  const relevantLayouts = category === 'mobile' ? layoutPatterns.mobile : layoutPatterns.pc;

  for (const layout of relevantLayouts) {
    if (content.includes(layout)) {
      info.layouts.push(layout);
      results.layoutUsage[category][layout] = (results.layoutUsage[category][layout] || 0) + 1;
    }
  }

  // 检测侧边栏
  if (content.includes('el-aside') || content.includes('sidebar') || content.includes('Sidebar')) {
    info.hasSidebar = true;
  }

  // 检测响应式设计
  if (content.includes('@media') || content.includes('responsive') || content.includes('breakpoint')) {
    info.hasResponsive = true;
  }

  // 检测问题
  if (info.layouts.length === 0) {
    info.issues.push('未使用任何标准布局组件');
    results.layoutUsage[category].none = (results.layoutUsage[category].none || 0) + 1;
  }

  // 检测是否使用PC端布局组件
  if (category === 'mobile') {
    for (const pcLayout of layoutPatterns.pc) {
      if (content.includes(pcLayout)) {
        info.issues.push(`移动端页面使用了PC端布局: ${pcLayout}`);
      }
    }
  }

  // 检测Element Plus直接使用
  if (content.includes('el-container') && !info.layouts.some(l => l.includes('Layout'))) {
    info.issues.push('直接使用el-container而不是布局组件');
  }

  return info;
}

/**
 * 对比移动端和PC端页面功能
 */
function compareFeatures() {
  console.log('\n=== 功能对齐分析 ===\n');

  // 获取所有中心页面
  const mobileCenters = fs.readdirSync(MOBILE_CENTERS_DIR)
    .filter(item => {
      const stat = fs.statSync(path.join(MOBILE_CENTERS_DIR, item));
      return stat.isDirectory();
    });

  const pcCenterFiles = fs.readdirSync(PC_CENTERS_DIR)
    .filter(item => item.endsWith('.vue'))
    .map(item => item.replace('.vue', ''));

  console.log(`移动端中心数量: ${mobileCenters.length}`);
  console.log(`PC端中心数量: ${pcCenterFiles.length}\n`);

  // 检查缺失的移动端页面
  const missingMobilePages = [];
  const mobilePageNames = mobileCenters.map(name =>
    name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      .replace(/^./, c => c.toUpperCase())
  );

  for (const pcPage of pcCenterFiles) {
    const mobilePage = pcPage.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    if (!mobileCenters.includes(mobilePage)) {
      missingMobilePages.push({
        pcPage,
        expectedMobilePage: mobilePage
      });
    }
  }

  return {
    mobileCenters,
    pcCenterFiles,
    missingMobilePages
  };
}

/**
 * 生成报告
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('页面对齐审计报告');
  console.log('='.repeat(80) + '\n');

  // 1. 布局使用统计
  console.log('📊 布局组件使用统计\n');

  console.log('移动端布局:');
  for (const [layout, count] of Object.entries(results.layoutUsage.mobile)) {
    if (count > 0) {
      console.log(`  - ${layout}: ${count} 个页面`);
    }
  }

  console.log('\nPC端布局:');
  for (const [layout, count] of Object.entries(results.layoutUsage.pc)) {
    if (count > 0) {
      console.log(`  - ${layout}: ${count} 个页面`);
    }
  }

  // 2. 功能对齐分析
  const comparison = compareFeatures();

  console.log('\n🔍 功能对齐问题\n');
  if (comparison.missingMobilePages.length > 0) {
    console.log(`⚠️  发现 ${comparison.missingMobilePages.length} 个PC端页面缺少移动端对应页面:\n`);
    comparison.missingMobilePages.forEach((item, index) => {
      console.log(`  ${index + 1}. PC: ${item.pcPage}.vue → 缺少移动端: ${item.expectedMobilePage}`);
    });
  } else {
    console.log('✅ 所有PC端页面都有对应的移动端版本');
  }

  // 3. 详细的布局问题
  console.log('\n⚠️  布局问题详情\n');

  const allIssues = [
    ...results.mobileCenters.map(i => ({ ...i, category: 'mobile-center' })),
    ...results.mobileTeacher.map(i => ({ ...i, category: 'mobile-teacher' })),
    ...results.mobileParent.map(i => ({ ...i, category: 'mobile-parent' })),
    ...results.pcCenters.map(i => ({ ...i, category: 'pc-center' }))
  ].filter(item => item.issues.length > 0);

  if (allIssues.length > 0) {
    console.log(`发现 ${allIssues.length} 个页面存在布局问题:\n`);

    allIssues.forEach((item, index) => {
      console.log(`${index + 1}. [${item.category}] ${item.path}`);
      item.issues.forEach(issue => {
        console.log(`   ❌ ${issue}`);
      });
      console.log(`   使用布局: ${item.layouts.length > 0 ? item.layouts.join(', ') : '无'}`);
      console.log('');
    });
  } else {
    console.log('✅ 未发现明显的布局问题');
  }

  // 4. 移动端特有问题
  console.log('\n📱 移动端页面分析\n');

  const mobilePages = [
    ...results.mobileCenters,
    ...results.mobileTeacher,
    ...results.mobileParent
  ];

  const mobileIssues = mobilePages.filter(p => p.issues.length > 0);

  if (mobileIssues.length > 0) {
    console.log(`发现 ${mobileIssues.length} 个移动端页面需要关注:\n`);

    mobileIssues.forEach((item, index) => {
      console.log(`${index + 1}. ${item.path}`);
      item.issues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
      console.log('');
    });
  }

  // 5. 响应式设计检查
  console.log('\n📐 响应式设计检查\n');

  const mobileWithResponsive = mobilePages.filter(p => p.hasResponsive).length;
  const mobileTotal = mobilePages.length;

  console.log(`移动端页面: ${mobileWithResponsive}/${mobileTotal} 包含响应式样式 (${((mobileWithResponsive/mobileTotal)*100).toFixed(1)}%)`);

  if (mobileWithResponsive < mobileTotal) {
    console.log('\n建议为以下页面添加响应式设计:');
    const pagesWithoutResponsive = mobilePages.filter(p => !p.hasResponsive);
    pagesWithoutResponsive.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.path}`);
    });
  }

  // 生成JSON报告
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      mobileCenters: results.mobileCenters.length,
      mobileTeacher: results.mobileTeacher.length,
      mobileParent: results.mobileParent.length,
      pcCenters: results.pcCenters.length,
      totalMobile: mobilePages.length,
      totalPC: results.pcCenters.length,
      pagesWithIssues: allIssues.length,
      missingMobilePages: comparison.missingMobilePages.length
    },
    layoutUsage: results.layoutUsage,
    comparison,
    issues: allIssues
  };

  const reportPath = '/persistent/home/zhgue/kyyupgame/PAGE_ALIGNMENT_AUDIT_REPORT.json';
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 详细报告已保存至: ${reportPath}`);
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始页面对齐审计...\n');

  // 分析移动端中心页面
  console.log('分析移动端中心页面...');
  const mobileCenterFiles = getVueFiles(MOBILE_CENTERS_DIR, ['components']);
  results.mobileCenters = mobileCenterFiles.map(file => analyzeLayout(file, 'mobile'));
  console.log(`  ✓ 已分析 ${mobileCenterFiles.length} 个文件`);

  // 分析PC端中心页面
  console.log('分析PC端中心页面...');
  const pcCenterFiles = getVueFiles(PC_CENTERS_DIR, ['components', 'duplicates-backup']);
  results.pcCenters = pcCenterFiles.map(file => analyzeLayout(file, 'pc'));
  console.log(`  ✓ 已分析 ${pcCenterFiles.length} 个文件`);

  // 分析移动端教师中心
  console.log('分析移动端教师中心...');
  const mobileTeacherFiles = getVueFiles(MOBILE_TEACHER_DIR, ['components']);
  results.mobileTeacher = mobileTeacherFiles.map(file => analyzeLayout(file, 'mobile'));
  console.log(`  ✓ 已分析 ${mobileTeacherFiles.length} 个文件`);

  // 分析移动端家长中心
  console.log('分析移动端家长中心...');
  const mobileParentFiles = getVueFiles(MOBILE_PARENT_DIR, ['components']);
  results.mobileParent = mobileParentFiles.map(file => analyzeLayout(file, 'mobile'));
  console.log(`  ✓ 已分析 ${mobileParentFiles.length} 个文件`);

  // 生成报告
  generateReport();

  console.log('\n✅ 审计完成!\n');
}

// 运行
main();
