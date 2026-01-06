#!/usr/bin/env node

/**
 * Pre-commit API硬编码检查钩子
 * 在提交代码前自动检查是否有硬编码的API调用
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PrecommitAPICheck {
  constructor() {
    this.hasErrors = false;
    this.warnings = [];
  }

  async run() {
    console.log('🔍 Pre-commit API检查中...\n');

    try {
      // 获取暂存的文件
      const stagedFiles = this.getStagedFiles();

      // 过滤出需要检查的文件
      const filesToCheck = stagedFiles.filter(file =>
        this.shouldCheckFile(file)
      );

      if (filesToCheck.length === 0) {
        console.log('✅ 没有需要检查的前端文件');
        return true;
      }

      console.log(`📄 检查暂存文件: ${filesToCheck.length} 个\n`);

      // 检查每个文件
      for (const file of filesToCheck) {
        await this.checkFile(file);
      }

      // 输出结果
      this.outputResults();

      return !this.hasErrors;

    } catch (error) {
      console.error('❌ 检查过程中出错:', error.message);
      return false;
    }
  }

  /**
   * 获取暂存的文件列表
   */
  getStagedFiles() {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      return output.trim().split('\n').filter(Boolean);
    } catch (error) {
      console.warn('⚠️ 无法获取暂存文件列表:', error.message);
      return [];
    }
  }

  /**
   * 判断文件是否需要检查
   */
  shouldCheckFile(filePath) {
    const extensions = ['.vue', '.js', '.ts', '.jsx', '.tsx'];
    const hasValidExtension = extensions.some(ext => filePath.endsWith(ext));
    const isInClientDir = filePath.startsWith('client/') || filePath.includes('src/');
    const excludePaths = ['node_modules', 'dist', 'build', '.git', 'backups', 'scripts'];

    const shouldExclude = excludePaths.some(exclude => filePath.includes(exclude));

    return hasValidExtension && isInClientDir && !shouldExclude;
  }

  /**
   * 检查单个文件
   */
  async checkFile(filePath) {
    try {
      const fullPath = path.resolve(filePath);
      const content = fs.readFileSync(fullPath, 'utf8');

      // 检查硬编码API模式
      const issues = this.findHardcodedAPIs(content);

      if (issues.length > 0) {
        console.log(`🚨 ${filePath}: 发现 ${issues.length} 个硬编码API问题`);

        issues.forEach(issue => {
          const severity = issue.includes('fetch') || issue.includes('axios') ? '🔴' : '🟡';
          console.log(`  ${severity} 行 ${issue.line}: ${issue.api}`);

          if (issue.includes('fetch') || issue.includes('axios')) {
            this.hasErrors = true;
          } else {
            this.warnings.push(`${filePath}: ${issue.api}`);
          }
        });
      }

    } catch (error) {
      console.warn(`⚠️ 检查文件失败 ${filePath}: ${error.message}`);
    }
  }

  /**
   * 查找硬编码API调用
   */
  findHardcodedAPIs(content) {
    const issues = [];
    const lines = content.split('\n');

    // 硬编码API模式
    const patterns = [
      // 直接的API路径
      /(['"`])(\/api\/[^'"`]+)\1/g,
      // fetch/axios调用
      /(?:fetch|axios|request|get|post|put|delete|patch)\s*\(\s*(['"`])(\/api\/[^'"`]+)\2/g,
      // import语句
      /import.*from\s+(['"`])(\/api\/[^'"`]+)\1/g
    ];

    lines.forEach((line, index) => {
      // 跳过注释
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
        return;
      }

      // 跳过已经使用端点常量的情况
      if (line.includes('ENDPOINTS.') || line.includes('@/api/endpoints/')) {
        return;
      }

      // 检查每个模式
      patterns.forEach(pattern => {
        const matches = [...line.matchAll(pattern)];
        matches.forEach(match => {
          const api = match[2] || match[1]; // 获取API路径
          issues.push({
            line: index + 1,
            api: api,
            lineContent: line.trim()
          });
        });
      });
    });

    return issues;
  }

  /**
   * 输出检查结果
   */
  outputResults() {
    console.log('\n📊 检查结果汇总:');

    if (this.hasErrors) {
      console.log('❌ 发现严重的硬编码API问题，请修复后再提交');
      console.log('💡 建议使用以下命令自动修复:');
      console.log('   npm run api:hardcode:fix:apply');
    } else if (this.warnings.length > 0) {
      console.log('⚠️ 发现一些硬编码API问题，建议修复');
      console.log('💡 使用以下命令检查和修复:');
      console.log('   npm run api:hardcode:scan');
      console.log('   npm run api:hardcode:fix');
    } else {
      console.log('✅ 未发现硬编码API问题');
    }

    if (this.hasErrors || this.warnings.length > 0) {
      console.log('\n📚 API端点配置文档:');
      console.log('   📁 认证端点: client/src/api/endpoints/auth.ts');
      console.log('   📁 活动端点: client/src/api/endpoints/activity.ts');
      console.log('   📁 营销端点: client/src/api/endpoints/marketing.ts');
      console.log('   📁 用户端点: client/src/api/endpoints/user.ts');
    }
  }
}

// 运行检查
if (require.main === module) {
  const checker = new PrecommitAPICheck();
  checker.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ 检查失败:', error);
      process.exit(1);
    });
}

module.exports = PrecommitAPICheck;