const fs = require('fs');
const path = require('path');

/**
 * 修复日志格式化过程中产生的语法错误
 * 主要是移除多余的逗号
 */

const routesDir = path.join(__dirname, '../server/src/routes');

// 修复单个文件的语法错误
function fixFileSyntax(filePath, fileName) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixCount = 0;

    // 修复模式1: console.error('[MODULE]: message:', , error);
    content = content.replace(/console\.(log|error|warn)\s*\(\s*['"`]([^'"`]+)['"`]:[^,]*,\s*,\s*([^)]+)\)/g,
      (match, logType, message, args) => {
        fixCount++;
        return `console.${logType}('${message}', ${args})`;
      });

    // 修复模式2: console.error('[MODULE]: message:', , error);
    content = content.replace(/console\.(log|error|warn)\s*\(\s*['"`]([^'"`]*\[[^\]]*\][^'"`]*)['"`][^,]*,\s*,\s*([^)]+)\)/g,
      (match, logType, message, args) => {
        fixCount++;
        return `console.${logType}('${message}', ${args})`;
      });

    // 修复模式3: 任何包含', ,'的情况
    content = content.replace(/console\.(log|error|warn)\s*\([^)]*,\s*,[^)]*\)/g,
      (match) => {
        fixCount++;
        return match.replace(/,\s*,/g, ', ');
      });

    // 修复模式4: 模板字符串中的问题
    content = content.replace(/console\.(log|error|warn)\s*\(\s*`([^`]*)`[^,]*,\s*,\s*([^)]*)\)/g,
      (match, logType, template, args) => {
        fixCount++;
        return `console.${logType}(\`${template}\`, ${args})`;
      });

    // 修复模式5: console.error('[MODULE]: message:', , error); - 更精确的匹配
    content = content.replace(/console\.(log|error|warn)\s*\(\s*(['"`])([^'"`]*(?:\[[^\]]*\])[^'"`]*)\2[^,]*,\s*,\s*([^)]*)\)/g,
      (match, logType, quote, message, args) => {
        fixCount++;
        return `console.${logType}(${quote}${message}${quote}, ${args})`;
      });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${fileName} - 修复完成 (${fixCount}处语法错误)`);
      return { fixed: true, fixCount };
    } else {
      console.log(`ℹ️  ${fileName} - 无需修复`);
      return { fixed: false, fixCount: 0 };
    }
  } catch (error) {
    console.error(`❌ ${fileName} - 修复失败: ${error.message}`);
    return { fixed: false, error: error.message };
  }
}

// 批量修复所有文件
function batchFixSyntax() {
  console.log('🚀 开始修复语法错误\n');

  const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.routes.ts'));

  let fixedCount = 0;
  let totalFixes = 0;
  let errorCount = 0;

  console.log(`📁 找到 ${files.length} 个路由文件\n`);

  for (const file of files) {
    const filePath = path.join(routesDir, file);
    const result = fixFileSyntax(filePath, file);

    if (result.fixed) {
      fixedCount++;
      totalFixes += result.fixCount;
    } else if (result.error) {
      errorCount++;
    }
  }

  // 统计结果
  console.log('\n📊 修复统计:');
  console.log(`   - 总文件数: ${files.length}`);
  console.log(`   - 修复文件数: ${fixedCount}`);
  console.log(`   - 总修复数: ${totalFixes}`);
  console.log(`   - 错误文件数: ${errorCount}`);
  console.log(`   - 修复率: ${Math.round(fixedCount / files.length * 100)}%`);

  return { fixedCount, totalFixes, errorCount };
}

// 运行修复
console.log('🚀 开始修复日志格式化产生的语法错误\n');
const result = batchFixSyntax();

console.log('\n🔍 尝试重新编译...\n');

// 尝试编译验证
const { spawn } = require('child_process');
const compileProcess = spawn('npm', ['run', 'build'], {
  cwd: path.join(__dirname, '../server'),
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

compileProcess.stdout.on('data', (data) => {
  output += data.toString();
});

compileProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

compileProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ 编译成功！');
    console.log(output);
  } else {
    console.log('❌ 编译仍然失败:');
    console.log(errorOutput);

    // 统计剩余错误
    const errorMatches = errorOutput.match(/error TS\d+:/g);
    if (errorMatches) {
      console.log(`\n📊 剩余错误数: ${errorMatches.length}个`);
    }
  }
});

compileProcess.on('error', (error) => {
  console.error('\n❌ 编译过程出错:', error.message);
});

module.exports = {
  batchFixSyntax
};