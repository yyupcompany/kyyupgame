const fs = require('fs');
const path = require('path');

/**
 * 扫描Vue文件中的CSS语法错误
 */
function scanCSSErrors() {
  const clientDir = path.join(__dirname, 'client/src');
  const errors = [];

  // 递归扫描所有Vue文件
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (file.endsWith('.vue')) {
        scanVueFile(fullPath);
      }
    }
  }

  function scanVueFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const lineNumber = index + 1;

        // 1. 检查重复的CSS属性语法错误
        if (line.includes('@media') && line.includes(';') && line.includes('max-width')) {
          const match = line.match(/@media\s*\([^)]*\).*max-width:\s*[^;]*;/);
          if (match) {
            const fullMediaQuery = line.match(/@media\s*\([^)]*\)/);
            if (fullMediaQuery && fullMediaQuery[0].includes(';')) {
              errors.push({
                file: filePath,
                line: lineNumber,
                type: 'CSS_MEDIA_QUERY_SYNTAX_ERROR',
                error: 'Invalid CSS media query syntax - semicolon inside media query',
                content: line.trim(),
                suggestion: 'Media queries should not contain semicolins inside parentheses'
              });
            }
          }
        }

        // 2. 检查无效的媒体查询语法 - 重复的max-width
        if (line.includes('@media') && (line.match(/max-width:\s*\d+px/g) || []).length > 1) {
          const matches = line.match(/max-width:\s*\d+px/g);
          if (matches && matches.length > 1) {
            errors.push({
              file: filePath,
              line: lineNumber,
              type: 'CSS_DUPLICATE_MEDIA_QUERY',
              error: 'Duplicate max-width properties in media query',
              content: line.trim(),
              suggestion: 'Use only one max-width property per media query'
            });
          }
        }

        // 3. 检查CSS变量计算错误 - SASS不支持计算
        if (line.includes('calc(') && line.includes('var(')) {
          errors.push({
            file: filePath,
            line: lineNumber,
            type: 'CSS_VARIABLE_CALCULATION_ERROR',
            error: 'SASS does not support CSS calc() with var()',
            content: line.trim(),
            suggestion: 'Avoid using calc() with CSS variables, or use preprocessor-specific syntax'
          });
        }

        // 4. 检查CSS变量乘法错误
        const variableMathMatch = line.match(/var\([^)]+)\)\s*\*\s*[^}]+/);
        if (variableMathMatch) {
          errors.push({
            file: filePath,
            line: lineNumber,
            type: 'CSS_VARIABLE_MATH_ERROR',
            error: 'CSS variable multiplication not supported in SASS',
            content: line.trim(),
            suggestion: 'Replace with calculated pixel value'
          });
        }

        // 5. 检查无效的CSS选择器语法
        if (line.includes('::') && !line.includes('::before') && !line.includes('::after') && !line.includes('::first-child') &&
            !line.includes('::last-child') && !line.includes('::nth-child') && !line.includes('::hover') && !line.includes('::active') &&
            !line.includes('::focus') && !line.includes('::disabled')) {
          const invalidPseudo = line.match(/::([^:\s{]+)/);
          if (invalidPseudo) {
            errors.push({
              file: filePath,
              line: lineNumber,
              type: 'CSS_INVALID_PSEUDO_ELEMENT',
              error: 'Invalid CSS pseudo-element',
              content: line.trim(),
              suggestion: `Invalid pseudo-element ::${invalidPseudo[1]}`
            });
          }
        }

        // 6. 检查未闭合的括号
        const openBrackets = (line.match(/\(/g) || []).length;
        const closeBrackets = (line.match(/\)/g) || []).length;
        if (openBrackets !== closeBrackets) {
          errors.push({
            file: filePath,
            line: lineNumber,
            type: 'CSS_UNBALANCED_BRACKETS',
            error: 'Unbalanced parentheses',
            content: line.trim(),
            suggestion: 'Balance opening and closing parentheses'
          });
        }

        // 7. 检查无效的CSS单位组合
        if (line.match(/\d+px\s*%/)) {
          errors.push({
            file: filePath,
            line: lineNumber,
            type: 'CSS_INVALID_UNIT_COMBINATION',
            error: 'Invalid CSS unit combination',
            content: line.trim(),
            suggestion: 'Do not mix px and % in the same property value'
          });
        }
      });
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error.message);
    }
  }

  console.log('🔍 开始扫描Vue文件中的CSS语法错误...\n');
  scanDirectory(clientDir);

  if (errors.length === 0) {
    console.log('✅ 未发现CSS语法错误');
  } else {
    console.log(`❌ 发现 ${errors.length} 个CSS语法错误:\n`);

    // 按错误类型分组
    const errorsByType = {};
    errors.forEach(error => {
      if (!errorsByType[error.type]) {
        errorsByType[error.type] = [];
      }
      errorsByType[error.type].push(error);
    });

    // 按优先级排序错误类型
    const priorityOrder = [
      'CSS_MEDIA_QUERY_SYNTAX_ERROR',
      'CSS_VARIABLE_CALCULATION_ERROR',
      'CSS_VARIABLE_MATH_ERROR',
      'CSS_DUPLICATE_MEDIA_QUERY',
      'CSS_INVALID_PSEUDO_ELEMENT',
      'CSS_UNBALANCED_BRACKETS',
      'CSS_INVALID_UNIT_COMBINATION'
    ];

    priorityOrder.forEach(errorType => {
      if (errorsByType[errorType]) {
        console.log(`\n🚨 ${errorType} (${errorsByType[errorType].length} 个):`);
        errorsByType[errorType].forEach(error => {
          const relativePath = path.relative(clientDir, error.file);
          console.log(`  📁 ${relativePath}:${error.line}`);
          console.log(`     ❌ ${error.error}`);
          console.log(`     🔧 ${error.suggestion}`);
          console.log(`     📝 ${error.content}`);
          console.log('');
        });
      }
    });

    // 输出修复命令
    console.log('\n🔧 自动修复建议:');
    console.log('\n# 修复媒体查询语法错误:');
    console.log("sed -i 's/@media (max-width: 100%; max-width: \\([0-9]*px\\))/@media (max-width: \\1)/g' /path/to/file.vue");

    console.log('\n# 修复CSS变量计算错误:');
    console.log("# 找到类似 'width: var(--spacing-xs) * 0.125' 的代码");
    console.log("# 替换为具体像素值，例如 'width: 0.5px'");

    console.log('\n# 修复重复max-width:');
    console.log("# 找到类似 '@media (max-width: 100%; max-width: 992px)' 的代码");
    console.log("# 替换为 '@media (max-width: 992px)'");

    console.log('\n📊 错误统计:');
    Object.keys(errorsByType).forEach(type => {
      console.log(`  ${type}: ${errorsByType[type].length}`);
    });

    console.log(`\n📄 总计: ${errors.length} 个错误`);
  }

  return errors;
}

// 运行扫描
scanCSSErrors();