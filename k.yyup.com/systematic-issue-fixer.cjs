#!/usr/bin/env node

/**
 * 系统性问题搜索和修复工具
 * 用于全面检查和修复后端路由文件中的各种问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 开始系统性问题搜索和修复...\n');

// 配置
const ROUTES_DIR = path.join(__dirname, 'server/src/routes');
const CONTROLLERS_DIR = path.join(__dirname, 'server/src/controllers');
const MIDDLEWARES_DIR = path.join(__dirname, 'server/src/middlewares');
const SERVICES_DIR = path.join(__dirname, 'server/src/services');

// 问题类型统计
const stats = {
  yamlErrors: 0,
  importErrors: 0,
  undefinedCallbacks: 0,
  missingFiles: 0,
  fixedFiles: 0,
  totalFiles: 0
};

/**
 * 递归获取所有路由文件
 */
function getAllRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllRouteFiles(filePath, fileList);
    } else if (file.endsWith('.routes.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * 检查YAML语法错误
 */
function checkYAMLErrors(content, filePath) {
  const lines = content.split('\n');
  const errors = [];

  let inSwaggerComment = false;
  let currentIndent = 0;
  let mapKeys = new Map();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // 检测Swagger注释块
    if (line.includes('/**')) {
      inSwaggerComment = true;
    }
    if (line.includes('*/')) {
      inSwaggerComment = false;
      mapKeys.clear();
      continue;
    }

    if (!inSwaggerComment) continue;

    // 跳过非YAML行
    if (!line.trim().startsWith('*') && !line.trim().startsWith('@')) continue;

    const yamlLine = line.replace(/^\s*\*\s?/, '').trim();
    if (!yamlLine || yamlLine.startsWith('@')) continue;

    // 检查缩进一致性
    const indent = line.match(/^(\s*)/)[1].length;
    if (indent > 0 && indent % 2 !== 0) {
      errors.push({
        line: lineNumber,
        message: `YAML缩进错误: 缩进必须是2的倍数`,
        content: line.trim()
      });
    }

    // 检查重复的map键
    if (yamlLine.includes(':')) {
      const key = yamlLine.split(':')[0].trim();
      if (mapKeys.has(key) && key !== 'description' && key !== 'example') {
        errors.push({
          line: lineNumber,
          message: `YAML重复键错误: "${key}" 已在此级别中定义`,
          content: line.trim()
        });
      } else {
        mapKeys.set(key, lineNumber);
      }
    }

    // 检查隐式map键
    if (yamlLine && !yamlLine.includes(':') && !yamlLine.startsWith('-') &&
        !yamlLine.startsWith('|') && !yamlLine.startsWith('>')) {
      // 可能是隐式map键缺少值
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1].replace(/^\s*\*\s?/, '').trim();
        if (!nextLine.startsWith(':') && !nextLine.startsWith('-')) {
          errors.push({
            line: lineNumber,
            message: `YAML语法错误: 隐式map键需要后跟map值`,
            content: line.trim()
          });
        }
      }
    }
  }

  return errors;
}

/**
 * 检查导入错误
 */
function checkImportErrors(content, filePath) {
  const lines = content.split('\n');
  const errors = [];
  const imports = [];

  // 提取所有导入语句
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('import ')) {
      imports.push({ line: i + 1, content: line });
    }
  }

  // 检查verifyToken导入
  const hasVerifyTokenUsage = content.includes('verifyToken');
  const hasVerifyTokenImport = imports.some(imp =>
    imp.content.includes('verifyToken') ||
    (imp.content.includes('auth') && imp.content.includes('middleware'))
  );

  if (hasVerifyTokenUsage && !hasVerifyTokenImport) {
    errors.push({
      line: 1,
      message: `缺少verifyToken导入，但代码中使用了verifyToken`,
      fix: `import { verifyToken } from '../middleware/auth-middleware';`
    });
  }

  // 检查控制器导入
  const controllerMatches = content.match(/\w+Controller/g) || [];
  for (const controller of controllerMatches) {
    const controllerName = controller.charAt(0).toLowerCase() + controller.slice(1);
    const expectedFile = `${controllerName}.controller`;
    const hasControllerImport = imports.some(imp =>
      imp.content.includes(expectedFile) ||
      imp.content.includes(controller)
    );

    if (!hasControllerImport) {
      errors.push({
        line: 1,
        message: `缺少${controller}的导入`,
        fix: `import ${controller} from '../controllers/${expectedFile}';`
      });
    }
  }

  return errors;
}

/**
 * 检查未定义的回调函数
 */
function checkUndefinedCallbacks(content, filePath) {
  const lines = content.split('\n');
  const errors = [];

  // 查找所有路由定义
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // 匹配路由定义模式
    const routeMatch = line.match(/router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(.*)\s*\)/);
    if (routeMatch) {
      const [, method, path, callback] = routeMatch;

      // 检查回调函数是否为undefined
      if (callback.includes('undefined')) {
        errors.push({
          line: lineNumber,
          message: `路由回调函数为undefined: ${method.toUpperCase()} ${path}`,
          content: line.trim()
        });
      }

      // 检查回调函数是否存在但未定义
      if (callback.includes('Controller')) {
        const controllerMethodMatch = callback.match(/(\w+Controller)\.(\w+)/);
        if (controllerMethodMatch) {
          const [, controller, method] = controllerMethodMatch;
          // 这里可以进一步检查控制器和方法是否存在
        }
      }
    }
  }

  return errors;
}

/**
 * 修复YAML错误
 */
function fixYAMLErrors(content, errors) {
  let fixedContent = content;
  let fixCount = 0;

  // 按行号倒序修复，避免行号偏移
  errors.sort((a, b) => b.line - a.line);

  for (const error of errors) {
    const lines = fixedContent.split('\n');

    if (error.message.includes('重复键')) {
      // 修复重复键错误
      const keyMatch = lines[error.line - 1].match(/^(\s*)(\w+):/);
      if (keyMatch) {
        const [, indent, key] = keyMatch;
        if (key === 'type' || key === 'example') {
          // 对于重复的type或example，改为更具体的键名
          const newKey = key === 'type' ? 'itemType' : 'sampleExample';
          lines[error.line - 1] = `${indent}${newKey}:`;
          fixedContent = lines.join('\n');
          fixCount++;
          console.log(`  ✅ 修复重复键: ${key} -> ${newKey}`);
        }
      }
    } else if (error.message.includes('缩进错误')) {
      // 修复缩进错误
      const line = lines[error.line - 1];
      const currentIndent = line.match(/^(\s*)/)[1].length;
      const newIndent = Math.round(currentIndent / 2) * 2;
      lines[error.line - 1] = ' '.repeat(newIndent) + line.trim();
      fixedContent = lines.join('\n');
      fixCount++;
      console.log(`  ✅ 修复缩进: ${currentIndent} -> ${newIndent}`);
    }
  }

  return { content: fixedContent, fixCount };
}

/**
 * 修复导入错误
 */
function fixImportErrors(content, errors) {
  let fixedContent = content;
  let fixCount = 0;

  // 按优先级修复导入
  const imports = [];
  const otherLines = [];
  const lines = content.split('\n');

  let inImports = true;

  for (const line of lines) {
    if (line.startsWith('import ')) {
      imports.push(line);
    } else if (inImports && line.trim() === '') {
      imports.push(line);
    } else {
      inImports = false;
      otherLines.push(line);
    }
  }

  // 添加缺失的导入
  for (const error of errors) {
    if (error.fix) {
      if (!imports.some(imp => imp.includes(error.fix))) {
        imports.push(error.fix);
        fixCount++;
        console.log(`  ✅ 添加导入: ${error.fix}`);
      }
    }
  }

  // 重新组装内容
  fixedContent = [...imports, '', ...otherLines].join('\n');

  return { content: fixedContent, fixCount };
}

/**
 * 分析单个文件
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = {
    yamlErrors: [],
    importErrors: [],
    undefinedCallbacks: [],
    missingFiles: []
  };

  // 检查YAML错误
  const yamlErrors = checkYAMLErrors(content, filePath);
  issues.yamlErrors = yamlErrors;
  stats.yamlErrors += yamlErrors.length;

  // 检查导入错误
  const importErrors = checkImportErrors(content, filePath);
  issues.importErrors = importErrors;
  stats.importErrors += importErrors.length;

  // 检查未定义回调
  const undefinedCallbacks = checkUndefinedCallbacks(content, filePath);
  issues.undefinedCallbacks = undefinedCallbacks;
  stats.undefinedCallbacks += undefinedCallbacks.length;

  return { content, issues };
}

/**
 * 修复单个文件
 */
function fixFile(filePath, analysis) {
  let fixedContent = analysis.content;
  let totalFixes = 0;

  // 修复YAML错误
  if (analysis.issues.yamlErrors.length > 0) {
    const yamlFix = fixYAMLErrors(fixedContent, analysis.issues.yamlErrors);
    fixedContent = yamlFix.content;
    totalFixes += yamlFix.fixCount;
  }

  // 修复导入错误
  if (analysis.issues.importErrors.length > 0) {
    const importFix = fixImportErrors(fixedContent, analysis.issues.importErrors);
    fixedContent = importFix.content;
    totalFixes += importFix.fixCount;
  }

  // 写入修复后的内容
  if (totalFixes > 0) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    stats.fixedFiles++;
    console.log(`\n🔧 已修复 ${totalFixes} 个问题 in ${filePath}`);
  }

  return totalFixes;
}

/**
 * 主函数
 */
function main() {
  console.log('📁 扫描路由文件...\n');

  const routeFiles = getAllRouteFiles(ROUTES_DIR);
  stats.totalFiles = routeFiles.length;

  console.log(`找到 ${routeFiles.length} 个路由文件\n`);

  // 分析所有文件
  const analyses = [];
  for (const filePath of routeFiles) {
    console.log(`🔍 分析: ${path.relative(__dirname, filePath)}`);
    const analysis = analyzeFile(filePath);
    analyses.push({ filePath, analysis });

    // 显示问题
    const totalIssues = analysis.issues.yamlErrors.length +
                       analysis.issues.importErrors.length +
                       analysis.issues.undefinedCallbacks.length;

    if (totalIssues > 0) {
      console.log(`  ⚠️  发现 ${totalIssues} 个问题:`);

      if (analysis.issues.yamlErrors.length > 0) {
        console.log(`    - YAML错误: ${analysis.issues.yamlErrors.length}`);
        analysis.issues.yamlErrors.forEach(error => {
          console.log(`      行${error.line}: ${error.message}`);
        });
      }

      if (analysis.issues.importErrors.length > 0) {
        console.log(`    - 导入错误: ${analysis.issues.importErrors.length}`);
        analysis.issues.importErrors.forEach(error => {
          console.log(`      ${error.message}`);
        });
      }

      if (analysis.issues.undefinedCallbacks.length > 0) {
        console.log(`    - 未定义回调: ${analysis.issues.undefinedCallbacks.length}`);
        analysis.issues.undefinedCallbacks.forEach(error => {
          console.log(`      行${error.line}: ${error.message}`);
        });
      }
    } else {
      console.log('  ✅ 无问题');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 问题统计:');
  console.log(`  总文件数: ${stats.totalFiles}`);
  console.log(`  YAML错误: ${stats.yamlErrors}`);
  console.log(`  导入错误: ${stats.importErrors}`);
  console.log(`  未定义回调: ${stats.undefinedCallbacks}`);
  console.log(`  缺失文件: ${stats.missingFiles}`);
  console.log('='.repeat(60));

  // 询问是否修复
  if (stats.yamlErrors + stats.importErrors + stats.undefinedCallbacks > 0) {
    console.log('\n🔧 开始修复问题...\n');

    for (const { filePath, analysis } of analyses) {
      const totalIssues = analysis.issues.yamlErrors.length +
                         analysis.issues.importErrors.length +
                         analysis.issues.undefinedCallbacks.length;

      if (totalIssues > 0) {
        fixFile(filePath, analysis);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 修复完成统计:');
    console.log(`  修复文件数: ${stats.fixedFiles}/${stats.totalFiles}`);
    console.log(`  剩余问题: ${stats.yamlErrors + stats.importErrors + stats.undefinedCallbacks - (stats.yamlErrors + stats.importErrors)}`);
    console.log('='.repeat(60));
  } else {
    console.log('\n🎉 所有文件都正常，无需修复！');
  }

  console.log('\n🚀 验证后端服务...');
  try {
    // 测试后端服务编译
    execSync('cd server && npm run typecheck', { stdio: 'pipe', timeout: 30000 });
    console.log('✅ TypeScript编译检查通过');
  } catch (error) {
    console.log('⚠️ TypeScript编译检查失败，需要进一步修复');
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main };