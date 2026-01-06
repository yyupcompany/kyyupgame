const fs = require('fs');
const path = require('path');

/**
 * 统一错误响应格式
 * 检查并确保401/403/500等错误响应使用统一的格式
 */

const routesDir = path.join(__dirname, 'server/src/routes');

// 标准错误响应格式
const standardErrorResponses = {
  '401': {
    description: '未授权访问',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: '未授权访问，请提供有效的认证令牌' },
            code: { type: 'string', example: 'UNAUTHORIZED' }
          }
        }
      }
    }
  },
  '403': {
    description: '权限不足',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: '权限不足，无法访问此资源' },
            code: { type: 'string', example: 'FORBIDDEN' }
          }
        }
      }
    }
  },
  '500': {
    description: '服务器内部错误',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: '服务器内部错误' },
            code: { type: 'string', example: 'INTERNAL_ERROR' }
          }
        }
      }
    }
  }
};

function checkErrorResponsesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let issues = [];
    let hasStandardErrors = true;

    // 查找Swagger文档中的错误响应定义
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 查找错误响应定义
      if (line.match(/^\s*\d+:/)) { // 如: 401:, 403:, 500:
        const statusCode = line.split(':')[0].trim();

        // 向上查找这个响应的描述
        let descriptionLine = -1;
        let description = '';

        // 向前查找描述行
        for (let j = i - 1; j >= 0; j--) {
          const prevLine = lines[j].trim();
          if (prevLine.startsWith('description:')) {
            descriptionLine = j;
            description = prevLine.replace('description:', '').trim().replace(/['"]/g, '');
            break;
          } else if (prevLine.match(/^\s*\w+\s*:/) || prevLine === 'responses:') {
            break;
          }
        }

        // 检查是否使用标准格式
        if (['401', '403', '500'].includes(statusCode)) {
          const standard = standardErrorResponses[statusCode];

          // 检查描述
          if (description !== standard.description) {
            issues.push({
              type: 'description_mismatch',
              line: descriptionLine + 1,
              statusCode,
              current: description,
              expected: standard.description
            });
            hasStandardErrors = false;
          }

          // 检查响应结构
          const responseBlock = extractResponseBlock(lines, i);
          if (!responseBlock.includes('success:') ||
              !responseBlock.includes('message:') ||
              !responseBlock.includes('code:')) {
            issues.push({
              type: 'structure_mismatch',
              line: i + 1,
              statusCode,
              issue: '缺少标准字段 (success, message, code)'
            });
            hasStandardErrors = false;
          }
        }
      }
    }

    // 检查是否有使用 ApiResponse.handleError 的情况
    const apiResponseUsage = content.match(/ApiResponse\.handleError/g);
    if (apiResponseUsage) {
      // 这是好的，说明使用了标准错误处理
    }

    return {
      hasStandardErrors,
      issues,
      apiResponseUsageCount: apiResponseUsage ? apiResponseUsage.length : 0
    };
  } catch (error) {
    console.error(`❌ 错误处理文件 ${filePath}:`, error.message);
    return { error: error.message };
  }
}

function extractResponseBlock(lines, startIndex) {
  let block = '';
  let braceCount = 0;
  let inObject = false;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    block += line + '\n';

    // 计算大括号
    for (const char of line) {
      if (char === '{') {
        braceCount++;
        inObject = true;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          inObject = false;
          break;
        }
      }
    }

    // 如果没有大括号且遇到下一个响应，停止
    if (!inObject && line.match(/^\s*\d+:/) && i > startIndex) {
      break;
    }
  }

  return block;
}

function scanErrorResponses(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ 目录不存在: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  let standardFilesCount = 0;
  let nonStandardFilesCount = 0;
  let totalIssues = 0;
  let apiResponseUsageCount = 0;
  let scannedCount = 0;

  const filesNeedingFix = [];

  console.log('🔍 扫描并检查错误响应格式...\n');
  console.log('📋 标准错误响应格式:');
  console.log('   - 401 未授权: { success: false, message: "...", code: "UNAUTHORIZED" }');
  console.log('   - 403 权限不足: { success: false, message: "...", code: "FORBIDDEN" }');
  console.log('   - 500 服务器错误: { success: false, message: "...", code: "INTERNAL_ERROR" }\n');

  for (const file of files) {
    if (file.endsWith('.routes.ts')) {
      const filePath = path.join(dir, file);
      scannedCount++;

      const result = checkErrorResponsesInFile(filePath);

      if (result.error) {
        console.log(`❌ 处理错误: ${file} - ${result.error}`);
        continue;
      }

      if (result.hasStandardErrors && result.issues.length === 0) {
        standardFilesCount++;
        console.log(`✅ 错误格式正确: ${file}`);
      } else {
        nonStandardFilesCount++;
        console.log(`⚠️  需要修复: ${file}`);

        if (result.issues.length > 0) {
          totalIssues += result.issues.length;
          filesNeedingFix.push({
            file,
            filePath,
            issues: result.issues
          });

          // 显示主要问题
          console.log(`   - 发现 ${result.issues.length} 个格式问题:`);
          result.issues.slice(0, 3).forEach(issue => {
            switch (issue.type) {
              case 'description_mismatch':
                console.log(`     * 第${issue.line}行: ${issue.statusCode}响应描述不标准`);
                break;
              case 'structure_mismatch':
                console.log(`     * 第${issue.line}行: ${issue.statusCode}响应结构不完整`);
                break;
            }
          });

          if (result.issues.length > 3) {
            console.log(`     * ... 还有 ${result.issues.length - 3} 个问题`);
          }
        }
      }

      apiResponseUsageCount += result.apiResponseUsageCount;
    }
  }

  console.log(`\n📊 统计结果:`);
  console.log(`   - 扫描文件数: ${scannedCount}`);
  console.log(`   - 格式正确文件: ${standardFilesCount}`);
  console.log(`   - 需要修复文件: ${nonStandardFilesCount}`);
  console.log(`   - 问题总数: ${totalIssues}`);
  console.log(`   - ApiResponse使用次数: ${apiResponseUsageCount}`);

  if (filesNeedingFix.length > 0) {
    // 显示主要修复类型
    const issueTypes = {};
    filesNeedingFix.forEach(file => {
      file.issues.forEach(issue => {
        issueTypes[issue.type] = (issueTypes[issue.type] || 0) + 1;
      });
    });

    console.log(`\n📋 主要问题类型:`);
    Object.entries(issueTypes).forEach(([type, count]) => {
      const typeNames = {
        'description_mismatch': '描述不匹配',
        'structure_mismatch': '结构不完整'
      };
      console.log(`   - ${typeNames[type] || type}: ${count}处`);
    });

    console.log(`\n💡 修复建议:`);
    console.log(`   1. 统一错误响应描述文本`);
    console.log(`   2. 确保所有错误响应包含 success, message, code 字段`);
    console.log(`   3. 使用 ApiResponse.handleError 处理错误`);
    console.log(`   4. 保持错误代码的一致性 (UNAUTHORIZED, FORBIDDEN, INTERNAL_ERROR)`);
  } else {
    console.log(`\n✅ 所有文件的错误响应格式都是标准的！`);
  }
}

// 开始执行
console.log('🚀 开始检查错误响应格式...\n');
scanErrorResponses(routesDir);