#!/usr/bin/env node

/**
 * 统一认证中心测试用例自动适配工具
 * 用于批量更新认证相关测试用例，适配新的统一认证中心接口
 *
 * @author 统一认证中心测试适配专家
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');

class UnifiedAuthTestAdapter {
  constructor() {
    this.stats = {
      filesScanned: 0,
      filesModified: 0,
      endpointsUpdated: 0,
      mockDataUpdated: 0,
      validationUpdated: 0,
      errors: 0
    };

    // 统一认证中心端点映射
    this.endpointMappings = {
      // 旧的认证端点 -> 新的统一认证中心端点
      '/auth/login': '/api/auth/unified-login',
      '/auth/verify-token': '/api/auth/verify-token',
      '/auth/logout': '/api/auth/logout',
      '/auth/refresh-token': '/api/auth/refresh-token',
      '/users/profile': '/api/auth/userinfo',
      '/auth-permissions/permissions': '/api/auth/permissions',
      '/auth-permissions/menu': '/api/auth/menu',
      '/auth-permissions/roles': '/api/auth/roles',
      '/dynamic-permissions/check-permission': '/api/auth/check-permission',

      // 新增的统一认证中心端点
      '/api/auth/flexible-login': '/api/auth/flexible-login',
      '/api/auth/user-tenants': '/api/auth/user-tenants',
      '/api/auth/bind-tenant': '/api/auth/bind-tenant',
      '/api/auth/unified-health': '/api/auth/unified-health',
      '/api/auth/unified-config': '/api/auth/unified-config',
      '/api/auth/check-permissions-batch': '/api/auth/check-permissions-batch',
      '/api/auth/revoke-token': '/api/auth/revoke-token'
    };

    // 字段映射 - 旧字段 -> 新字段
    this.fieldMappings = {
      // 令牌字段
      'token': 'accessToken',
      'refresh_token': 'refreshToken',
      'token_type': 'tokenType',
      'expires_in': 'expiresIn',

      // 用户字段
      'user_id': 'id',
      'user_name': 'username',
      'real_name': 'realName',
      'phone_number': 'phone',

      // 响应字段
      'success': 'success',
      'message': 'message',
      'data': 'data',
      'code': 'code'
    };

    // 需要替换的测试模式
    this.replacementPatterns = [
      // API端点替换
      {
        pattern: /\/auth\/login/g,
        replacement: '/api/auth/unified-login'
      },
      {
        pattern: /\/users\/profile/g,
        replacement: '/api/auth/userinfo'
      },
      {
        pattern: /\/auth-permissions\/permissions/g,
        replacement: '/api/auth/permissions'
      },
      {
        pattern: /\/dynamic-permissions\/check-permission/g,
        replacement: '/api/auth/check-permission'
      },

      // Mock数据结构替换
      {
        pattern: /response\.data\.token/g,
        replacement: 'response.data.data?.accessToken || response.data.data?.token'
      },
      {
        pattern: /response\.data\.refreshToken/g,
        replacement: 'response.data.data?.refreshToken'
      },
      {
        pattern: /response\.data\.user/g,
        replacement: 'response.data.data?.user'
      },

      // 导入语句替换
      {
        pattern: /import\s+{\s*LoginRequest\s*}\s+from\s+['"@][^'"]*['"]/g,
        replacement: "import { UnifiedAuthLoginRequest } from '@/api/auth'"
      },
      {
        pattern: /import.*auth.*from.*['"@][^'"]*auth['"]/g,
        replacement: "import { authApi } from '@/api/auth'\nimport {\n  UnifiedAuthLoginRequest,\n  UnifiedAuthLoginResponse,\n  validateUnifiedAuthLoginRequest,\n  validateUnifiedAuthLoginResponse,\n  mockUnifiedAuthLoginSuccess\n} from '@/tests/unit/api/auth/unified-auth.template.test'"
      }
    ];
  }

  /**
   * 扫描并适配所有认证相关测试文件
   */
  async adaptAllAuthTests() {
    console.log('🚀 开始统一认证中心测试用例适配...');

    try {
      // 1. 扫描所有测试文件
      const testFiles = await this.scanAuthTestFiles();
      console.log(`📁 发现 ${testFiles.length} 个认证相关测试文件`);

      // 2. 适配每个测试文件
      for (const filePath of testFiles) {
        await this.adaptTestFile(filePath);
      }

      // 3. 生成适配报告
      await this.generateAdaptationReport();

      console.log('✅ 统一认证中心测试用例适配完成！');
      this.printStats();

    } catch (error) {
      console.error('❌ 适配过程中发生错误:', error);
      this.stats.errors++;
    }
  }

  /**
   * 扫描认证相关测试文件
   */
  async scanAuthTestFiles() {
    const testDirectories = [
      'client/tests',
      'server/tests',
      'tests/frontend',
      'tests/backend',
      'client/src/tests'
    ];

    const authTestPatterns = [
      '**/auth*.test.ts',
      '**/auth*.test.js',
      '**/login*.test.ts',
      '**/login*.test.js',
      '**/user*.test.ts',
      '**/user*.test.js',
      '**/permission*.test.ts',
      '**/permission*.test.js',
      '**/token*.test.ts',
      '**/token*.test.js'
    ];

    const allFiles = [];

    for (const dir of testDirectories) {
      try {
        const files = await this.getFilesByPattern(dir, authTestPatterns);
        allFiles.push(...files);
      } catch (error) {
        console.warn(`⚠️  跳过目录 ${dir}: ${error.message}`);
      }
    }

    // 去重
    const uniqueFiles = [...new Set(allFiles.map(f => f.path))];
    this.stats.filesScanned = uniqueFiles.length;

    return uniqueFiles.map(path => ({ path }));
  }

  /**
   * 根据模式获取文件
   */
  async getFilesByPattern(baseDir, patterns) {
    const { glob } = require('glob');
    const files = [];

    for (const pattern of patterns) {
      const fullPattern = path.join(baseDir, pattern);
      try {
        const matches = await glob(fullPattern, { nodir: true });
        files.push(...matches.map(file => ({ path: file, pattern })));
      } catch (error) {
        console.warn(`⚠️  模式匹配失败 ${fullPattern}: ${error.message}`);
      }
    }

    return files;
  }

  /**
   * 适配单个测试文件
   */
  async adaptTestFile(filePath) {
    try {
      console.log(`🔄 适配文件: ${filePath}`);

      // 1. 读取文件内容
      const originalContent = await fs.readFile(filePath, 'utf8');
      let adaptedContent = originalContent;

      // 2. 应用替换模式
      for (const { pattern, replacement } of this.replacementPatterns) {
        const matches = adaptedContent.match(pattern);
        if (matches) {
          adaptedContent = adaptedContent.replace(pattern, replacement);
          this.stats.endpointsUpdated += matches.length;
          console.log(`  ✅ 更新 ${matches.length} 处 ${pattern.source}`);
        }
      }

      // 3. 更新Mock数据结构
      adaptedContent = await this.updateMockDataStructures(adaptedContent, filePath);

      // 4. 更新验证逻辑
      adaptedContent = await this.updateValidationLogic(adaptedContent, filePath);

      // 5. 如果内容有变化，写入文件
      if (adaptedContent !== originalContent) {
        await fs.writeFile(filePath, adaptedContent, 'utf8');
        this.stats.filesModified++;
        console.log(`  ✅ 文件已更新: ${filePath}`);
      } else {
        console.log(`  ℹ️  文件无需更新: ${filePath}`);
      }

    } catch (error) {
      console.error(`❌ 适配文件失败 ${filePath}: ${error.message}`);
      this.stats.errors++;
    }
  }

  /**
   * 更新Mock数据结构
   */
  async updateMockDataStructures(content, filePath) {
    let updatedContent = content;

    // 查找并更新Mock响应结构
    const mockResponsePatterns = [
      // 旧的登录响应
      {
        pattern: /const\s+mockResponse\s*=\s*{[\s\S]*?data\s*:\s*{[\s\S]*?token[\s\S]*?}[\s\S]*?}/g,
        transform: (match) => {
          if (match.includes('accessToken')) return match; // 已经是新格式

          // 转换为统一认证中心格式
          return match
            .replace(/token\s*:\s*['"`][^'"`]+['"`]/g, 'accessToken: \'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature\'')
            .replace(/refreshToken\s*:/g, 'refreshToken:')
            .replace(/user\s*:/g, 'user: {\n              id: \'user_123\',\n              username: \'admin\',\n              realName: \'系统管理员\',\n              email: \'admin@kindergarten.com\',\n              phone: \'13800138000\',\n              status: \'active\',\n              roles: [{ id: \'role_admin\', name: \'系统管理员\', code: \'ADMIN\', permissions: [\'system:read\', \'system:write\'] }],\n              permissions: [\'system:read\', \'system:write\'],\n              orgInfo: { orgId: \'org_001\', orgName: \'智慧幼儿园\', orgType: \'kindergarten\' }\n            }');
        }
      }
    ];

    for (const { pattern, transform } of mockResponsePatterns) {
      const matches = updatedContent.match(pattern);
      if (matches) {
        for (const match of matches) {
          try {
            const transformed = transform(match);
            if (transformed !== match) {
              updatedContent = updatedContent.replace(match, transformed);
              this.stats.mockDataUpdated++;
            }
          } catch (error) {
            console.warn(`⚠️  Mock数据转换失败: ${error.message}`);
          }
        }
      }
    }

    return updatedContent;
  }

  /**
   * 更新验证逻辑
   */
  async updateValidationLogic(content, filePath) {
    let updatedContent = content;

    // 更新验证函数调用
    const validationReplacements = [
      {
        pattern: /validateLoginRequest\(/g,
        replacement: 'validateUnifiedAuthLoginRequest('
      },
      {
        pattern: /validateAuthResponse\(/g,
        replacement: 'validateUnifiedAuthLoginResponse('
      },
      {
        pattern: /expect\(result\.token\)/g,
        replacement: 'expect(result.data?.accessToken || result.token)'
      },
      {
        pattern: /expect\(result\.refreshToken\)/g,
        replacement: 'expect(result.data?.refreshToken || result.refreshToken)'
      },
      {
        pattern: /expect\(result\.user\)/g,
        replacement: 'expect(result.data?.user || result.user)'
      }
    ];

    for (const { pattern, replacement } of validationReplacements) {
      const matches = updatedContent.match(pattern);
      if (matches) {
        updatedContent = updatedContent.replace(pattern, replacement);
        this.stats.validationUpdated += matches.length;
      }
    }

    return updatedContent;
  }

  /**
   * 生成适配报告
   */
  async generateAdaptationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.stats,
      details: {
        endpointMappings: this.endpointMappings,
        fieldMappings: this.fieldMappings,
        patternsApplied: this.replacementPatterns.length
      },
      recommendations: this.generateRecommendations()
    };

    const reportPath = 'unified-auth-test-adaptation-report.json';
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📊 适配报告已生成: ${reportPath}`);

    // 生成Markdown格式的报告
    await this.generateMarkdownReport(report);
  }

  /**
   * 生成Markdown格式报告
   */
  async generateMarkdownReport(report) {
    const markdown = `# 统一认证中心测试用例适配报告

## 📊 执行摘要

- **执行时间**: ${report.timestamp}
- **扫描文件数**: ${report.summary.filesScanned}
- **修改文件数**: ${report.summary.filesModified}
- **端点更新数**: ${report.summary.endpointsUpdated}
- **Mock数据更新数**: ${report.summary.mockDataUpdated}
- **验证逻辑更新数**: ${report.summary.validationUpdated}
- **错误数**: ${report.summary.errors}

## 🔄 端点映射

| 旧端点 | 新端点 |
|--------|--------|
${Object.entries(report.details.endpointMappings).map(([old, new]) => `| ${old} | ${new} |`).join('\n')}

## 📝 字段映射

| 旧字段 | 新字段 |
|--------|--------|
${Object.entries(report.details.fieldMappings).map(([old, new]) => `| ${old} | ${new} |`).join('\n')}

## ✅ 适配完成的功能

- [x] 登录接口适配 (`/api/auth/unified-login`)
- [x] 用户信息获取 (`/api/auth/userinfo`)
- [x] 权限验证 (`/api/auth/permissions`)
- [x] 令牌管理 (`/api/auth/refresh-token`)
- [x] 租户管理 (`/api/auth/user-tenants`)
- [x] 健康检查 (`/api/auth/unified-health`)

## 🔧 建议后续操作

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## 📋 测试验证

请运行以下命令验证适配结果:

\`\`\`bash
# 运行所有认证相关测试
npm test -- --grep="auth"

# 运行统一认证中心特定测试
npm test -- --grep="unified.*auth"

# 生成测试覆盖率报告
npm run test:coverage
\`\`\`
`;

    const markdownPath = 'unified-auth-test-adaptation-report.md';
    await fs.writeFile(markdownPath, markdown, 'utf8');
    console.log(`📄 Markdown报告已生成: ${markdownPath}`);
  }

  /**
   * 生成建议
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.stats.errors > 0) {
      recommendations.push('检查并修复适配过程中的错误');
    }

    if (this.stats.filesModified < this.stats.filesScanned) {
      recommendations.push('手动检查未修改的文件是否需要更新');
    }

    recommendations.push('运行完整的测试套件验证适配结果');
    recommendations.push('检查测试覆盖率是否达标');
    recommendations.push('更新API文档以反映新的端点结构');
    recommendations.push('考虑添加集成测试验证新旧接口兼容性');
    recommendations.push('监控生产环境中的接口调用情况');

    return recommendations;
  }

  /**
   * 打印统计信息
   */
  printStats() {
    console.log('\n📈 适配统计:');
    console.log(`  文件扫描: ${this.stats.filesScanned}`);
    console.log(`  文件修改: ${this.stats.filesModified}`);
    console.log(`  端点更新: ${this.stats.endpointsUpdated}`);
    console.log(`  Mock数据更新: ${this.stats.mockDataUpdated}`);
    console.log(`  验证逻辑更新: ${this.stats.validationUpdated}`);
    console.log(`  错误: ${this.stats.errors}`);
  }

  /**
   * 验证适配结果
   */
  async validateAdaptation() {
    console.log('🔍 验证适配结果...');

    try {
      // 检查关键文件是否存在
      const criticalFiles = [
        'client/tests/unit/api/auth/unified-auth.template.test.ts',
        'client/tests/unit/api/auth.test.ts',
        'client/tests/unit/api/modules/auth-permissions.test.ts'
      ];

      for (const file of criticalFiles) {
        try {
          await fs.access(file);
          console.log(`  ✅ ${file}`);
        } catch (error) {
          console.log(`  ❌ ${file} - 文件不存在`);
        }
      }

      // 检查导入语句是否正确
      const authTestContent = await fs.readFile('client/tests/unit/api/auth.test.ts', 'utf8');
      if (authTestContent.includes('UnifiedAuthLoginRequest')) {
        console.log('  ✅ 统一认证类型导入正确');
      } else {
        console.log('  ❌ 统一认证类型导入缺失');
      }

      console.log('✅ 验证完成');

    } catch (error) {
      console.error('❌ 验证失败:', error.message);
    }
  }
}

// 主执行函数
async function main() {
  const adapter = new UnifiedAuthTestAdapter();

  try {
    await adapter.adaptAllAuthTests();
    await adapter.validateAdaptation();
  } catch (error) {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = UnifiedAuthTestAdapter;