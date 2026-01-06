const fs = require('fs');
const path = require('path');

/**
 * 修复控制器导入路径
 * 智能匹配控制器文件
 */

const routesDir = path.join(__dirname, '../server/src/routes');
const controllersDir = path.join(__dirname, '../server/src/controllers');

// 获取所有控制器文件
function getAllControllers() {
  try {
    const files = fs.readdirSync(controllersDir);
    return files
      .filter(file => file.endsWith('.controller.ts'))
      .map(file => ({
        fileName: file,
        baseName: file.replace('.controller.ts', ''),
        path: path.join(controllersDir, file)
      }));
  } catch (error) {
    console.error('无法读取控制器目录:', error.message);
    return [];
  }
}

// 路由到控制器的映射规则
const routeControllerMappings = {
  'ai-analysis': ['ai-analysis', 'aiAnalysis', 'ai_analysis'],
  'ai-bridge': ['ai-bridge', 'aiBridge', 'ai_bridge'],
  'ai-performance': ['ai-performance', 'aiPerformance', 'ai_performance'],
  'conversion-tracking': ['conversion-tracking', 'conversionTracking', 'conversion_tracking'],
  'dashboard': ['dashboard', 'Dashboard'],
  'data-import': ['data-import', 'dataImport', 'data_import'],
  'enrollment-ai': ['enrollment-ai', 'enrollmentAI', 'enrollment_ai'],
  'enrollment-center': ['enrollment-center', 'enrollmentCenter', 'enrollment_center'],
  'enrollment-plan': ['enrollment-plan', 'enrollmentPlan', 'enrollment_plan'],
  'enrollment-statistics': ['enrollment-statistics', 'enrollmentStatistics', 'enrollment_statistics'],
  'files': ['files', 'Files', 'file'],
  'marketing-campaign': ['marketing-campaign', 'marketingCampaign', 'marketing_campaign'],
  'marketing-center': ['marketing-center', 'marketingCenter', 'marketing_center'],
  'parent': ['parent', 'Parent'],
  'parent-student-relation': ['parent-student-relation', 'parentStudentRelation', 'parent_student_relation'],
  'poster-upload': ['poster-upload', 'posterUpload', 'poster_upload'],
  'principal': ['principal', 'Principal'],
  'setup-permissions': ['setup-permissions', 'setupPermissions', 'setup_permissions'],
  'student': ['student', 'Student'],
  'task': ['task', 'Task']
};

// AI相关路由的映射
const aiRouteMappings = {
  'ai/conversation': ['ai-conversation', 'aiConversation'],
  'ai/feedback': ['ai-feedback', 'aiFeedback'],
  'ai/message': ['ai-message', 'aiMessage'],
  'ai/model': ['ai-model', 'aiModel'],
  'ai/quota': ['ai-quota', 'aiQuota']
};

// 智能匹配控制器
function findBestController(routeName, allControllers) {
  // 首先检查精确映射
  if (routeControllerMappings[routeName]) {
    const possibleNames = routeControllerMappings[routeName];
    for (const name of possibleNames) {
      const controller = allControllers.find(c =>
        c.baseName.toLowerCase() === name.toLowerCase()
      );
      if (controller) {
        return controller;
      }
    }
  }

  // 模糊匹配
  const routeWords = routeName.toLowerCase().split(/[-_]/);
  let bestMatch = null;
  let bestScore = 0;

  for (const controller of allControllers) {
    const controllerWords = controller.baseName.toLowerCase().split(/[-_]/);
    let score = 0;

    // 计算匹配度
    for (const routeWord of routeWords) {
      for (const controllerWord of controllerWords) {
        if (controllerWord.includes(routeWord) || routeWord.includes(controllerWord)) {
          score += 1;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = controller;
    }
  }

  // 如果匹配度太低，返回null
  return bestScore >= 1 ? bestMatch : null;
}

// 修复单个路由文件
function fixRouteControllerImports(routeFile, allControllers) {
  const filePath = path.join(routesDir, routeFile);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  let fixCount = 0;
  const fixes = [];

  // 查找所有控制器导入
  const importRegex = /from\s+['"]\.\.\/controllers\/([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const expectedController = importPath.replace('.controller', '');

    // 如果控制器不存在，尝试智能匹配
    const controllerExists = allControllers.some(c =>
      c.baseName === expectedController
    );

    if (!controllerExists) {
      const routeBaseName = routeFile.replace('.routes.ts', '');
      const matchedController = findBestController(routeBaseName, allControllers);

      if (matchedController) {
        const newImportPath = `${matchedController.baseName}.controller`;
        content = content.replace(
          `from ['"]../controllers/${importPath}['"]`,
          `from ['"]../controllers/${newImportPath}['"]`
        );
        fixes.push(`${importPath} → ${newImportPath}`);
        fixCount++;
      } else {
        // 尝试直接使用文件名
        const fileNameController = allControllers.find(c =>
          c.baseName.toLowerCase().includes(routeBaseName.toLowerCase()) ||
          routeBaseName.toLowerCase().includes(c.baseName.toLowerCase())
        );

        if (fileNameController) {
          const newImportPath = `${fileNameController.baseName}.controller`;
          content = content.replace(
            `from ['"]../controllers/${importPath}['"]`,
            `from ['"]../controllers/${newImportPath}['"]`
          );
          fixes.push(`${importPath} → ${newImportPath}`);
          fixCount++;
        }
      }
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${routeFile} - 修复 ${fixCount} 个导入: ${fixes.join(', ')}`);
    return { fixed: true, fixCount, fixes };
  } else {
    console.log(`ℹ️  ${routeFile} - 无需修复`);
    return { fixed: false, fixCount: 0 };
  }
}

// 批量修复
function batchFixControllerImports() {
  console.log('🚀 开始修复控制器导入路径\n');

  const allControllers = getAllControllers();
  console.log(`📁 找到 ${allControllers.length} 个控制器文件\n`);

  const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.routes.ts'));

  let totalFixes = 0;
  let fixedFiles = 0;

  for (const routeFile of routeFiles) {
    const result = fixRouteControllerImports(routeFile, allControllers);
    if (result.fixed) {
      totalFixes += result.fixCount;
      fixedFiles++;
    }
  }

  console.log('\n📊 修复统计:');
  console.log(`   - 总路由文件: ${routeFiles.length}`);
  console.log(`   - 修复文件数: ${fixedFiles}`);
  console.log(`   - 总修复数: ${totalFixes}`);
  console.log(`   - 修复率: ${Math.round(fixedFiles / routeFiles.length * 100)}%`);

  return { totalFiles: routeFiles.length, fixedFiles, totalFixes };
}

// 运行修复
batchFixControllerImports();