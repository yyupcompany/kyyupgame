#!/usr/bin/env node

/**
 * API硬编码自动修复工具
 * 用于自动修复前端代码中的硬编码API调用，替换为端点常量
 */

const fs = require('fs');
const path = require('path');

class APIHardcodedFixer {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.dryRun = options.dryRun !== false; // 默认为预览模式
    this.backup = options.backup !== false; // 默认创建备份

    // 端点映射配置
    this.endpointMappings = {
      // 认证相关
      '/api/auth/login': 'AUTH_ENDPOINTS.LOGIN',
      '/api/auth/logout': 'AUTH_ENDPOINTS.LOGOUT',
      '/api/auth/refresh': 'AUTH_ENDPOINTS.REFRESH',
      '/api/auth/register': 'AUTH_ENDPOINTS.REGISTER',
      '/api/auth/profile': 'AUTH_ENDPOINTS.PROFILE',

      // 活动相关
      '/api/activities': 'ACTIVITY_ENDPOINTS.BASE',
      '/api/activities/types': 'ACTIVITY_STATISTICS_ENDPOINTS.TYPE_OPTIONS',
      '/api/activities/status-options': 'ACTIVITY_STATISTICS_ENDPOINTS.STATUS_OPTIONS',

      // 营销相关
      '/api/marketing/group-buy': 'GROUP_BUY_ENDPOINTS.BASE',
      '/api/marketing/collect-activities': 'COLLECT_ACTIVITY_ENDPOINTS.BASE',
      '/api/marketing/referrals': 'REFERRAL_ENDPOINTS.BASE',
      '/api/marketing/tiered-rewards': 'TIERED_REWARD_ENDPOINTS.BASE',
      '/api/marketing/coupons': 'COUPON_ENDPOINTS.BASE',

      // 用户管理
      '/api/users': 'USER_ENDPOINTS.BASE',
      '/api/roles': 'ROLE_ENDPOINTS.BASE',
      '/api/permissions': 'PERMISSION_ENDPOINTS.BASE',

      // 其他模式匹配
      '/api/activities/(\\d+)': 'ACTIVITY_ENDPOINTS.GET_BY_ID($1)',
      '/api/activities/(\\d+)/statistics': 'ACTIVITY_STATISTICS_ENDPOINTS.BY_ID($1)',
      '/api/activities/(\\d+)/logs': 'ACTIVITY_STATISTICS_ENDPOINTS.LOGS($1)'
    };

    // 需要的导入语句
    this.requiredImports = {
      AUTH_ENDPOINTS: '@/api/endpoints/auth',
      ACTIVITY_ENDPOINTS: '@/api/endpoints/activity',
      ACTIVITY_STATISTICS_ENDPOINTS: '@/api/endpoints/activity',
      GROUP_BUY_ENDPOINTS: '@/api/endpoints/marketing',
      COLLECT_ACTIVITY_ENDPOINTS: '@/api/endpoints/marketing',
      REFERRAL_ENDPOINTS: '@/api/endpoints/marketing',
      TIERED_REWARD_ENDPOINTS: '@/api/endpoints/marketing',
      COUPON_ENDPOINTS: '@/api/endpoints/marketing',
      USER_ENDPOINTS: '@/api/endpoints/user',
      ROLE_ENDPOINTS: '@/api/endpoints/user',
      PERMISSION_ENDPOINTS: '@/api/endpoints/user'
    };

    this.results = {
      totalFiles: 0,
      modifiedFiles: 0,
      fixes: [],
      errors: []
    };
  }

  /**
   * 执行修复
   */
  async fix() {
    console.log(`🔧 ${this.dryRun ? '预览' : '执行'}API硬编码修复...\n`);
    console.log(`📁 工作目录: ${this.rootDir}`);
    console.log(`💾 备份文件: ${this.backup ? '是' : '否'}\n`);

    // 扫描所有Vue和JS文件
    const files = this.scanFiles();

    if (files.length === 0) {
      console.log('❌ 未找到可修复的文件');
      return;
    }

    console.log(`📄 发现 ${files.length} 个文件待检查\n`);

    // 修复每个文件
    for (const file of files) {
      await this.fixFile(file);
    }

    // 生成报告
    this.generateReport();
  }

  /**
   * 扫描需要修复的文件
   */
  scanFiles() {
    const files = [];

    function scanDirectory(dir) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            // 排除特定目录
            const excludeDirs = ['node_modules', 'dist', 'build', '.git', '.vscode', 'scripts', 'coverage', 'server', 'test', 'tests'];
            if (!excludeDirs.some(exclude => fullPath.includes(exclude))) {
              scanDirectory(fullPath);
            }
          } else if (entry.isFile()) {
            const ext = path.extname(fullPath);
            if (['.vue', '.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️  跳过目录 ${dir}: ${error.message}`);
      }
    }

    scanDirectory(this.rootDir);
    return files;
  }

  /**
   * 修复单个文件
   */
  async fixFile(filePath) {
    try {
      this.results.totalFiles++;

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let hasChanges = false;
      const fixes = [];

      // 检查是否包含硬编码API
      const hasHardcodedAPI = /['"`]\/api\//.test(content);
      if (!hasHardcodedAPI) {
        return;
      }

      // 分析需要的导入
      const neededImports = this.analyzeNeededImports(content);

      // 修复硬编码API
      for (const [pattern, replacement] of Object.entries(this.endpointMappings)) {
        const regex = new RegExp(pattern.replace(/\(\\d\+\)/g, '(\\d+)'), 'g');

        content = content.replace(regex, (match, ...args) => {
          hasChanges = true;

          // 如果是动态路径，处理参数
          let finalReplacement = replacement;
          if (args.length > 0) {
            finalReplacement = replacement.replace(/\$1/g, args[0]);
          }

          fixes.push({
            original: match,
            replacement: finalReplacement,
            import: this.getImportForReplacement(finalReplacement)
          });

          return finalReplacement;
        });
      }

      // 如果有变化，添加导入语句
      if (hasChanges && neededImports.length > 0) {
        content = this.addImports(content, neededImports);
      }

      // 保存修复后的文件
      if (hasChanges) {
        this.results.modifiedFiles++;
        this.results.fixes.push({
          file: path.relative(this.rootDir, filePath),
          fixes: fixes,
          imports: neededImports
        });

        if (!this.dryRun) {
          // 创建备份
          if (this.backup) {
            const backupPath = `${filePath}.backup.${Date.now()}`;
            fs.writeFileSync(backupPath, originalContent);
          }

          // 写入修复后的内容
          fs.writeFileSync(filePath, content);
        }
      }

    } catch (error) {
      console.error(`❌ 修复文件失败 ${filePath}: ${error.message}`);
      this.results.errors.push({
        file: filePath,
        error: error.message
      });
    }
  }

  /**
   * 分析需要的导入
   */
  analyzeNeededImports(content) {
    const neededImports = new Set();

    // 检查文件中已经有的导入
    const existingImports = new Set();
    const importRegex = /import\s*{([^}]+)}\s*from\s*['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map(imp => imp.trim());
      const fromPath = match[2];

      imports.forEach(imp => {
        existingImports.add(`${imp}:${fromPath}`);
      });
    }

    // 分析修复后需要的导入
    for (const replacement of Object.values(this.endpointMappings)) {
      const endpointName = replacement.split('.')[0];
      if (this.requiredImports[endpointName]) {
        const importPath = this.requiredImports[endpointName];
        const existingKey = `${endpointName}:${importPath}`;

        if (!existingImports.has(existingKey)) {
          neededImports.add({
            name: endpointName,
            path: importPath
          });
        }
      }
    }

    return Array.from(neededImports);
  }

  /**
   * 获取修复需要的导入
   */
  getImportForReplacement(replacement) {
    const endpointName = replacement.split('.')[0];
    return this.requiredImports[endpointName];
  }

  /**
   * 添加导入语句
   */
  addImports(content, imports) {
    if (imports.length === 0) {
      return content;
    }

    // 查找其他导入语句的位置
    const lines = content.split('\n');
    const importStatements = [];
    const scriptStart = lines.findIndex(line =>
      line.trim().startsWith('<script') ||
      line.trim().startsWith('import ') ||
      line.includes('from ')
    );

    if (scriptStart === -1) {
      return content;
    }

    // 生成导入语句
    const importLines = imports.map(imp =>
      `import { ${imp.name} } from '${imp.path}';`
    );

    // 找到最后一行import语句
    let lastImportLine = scriptStart;
    for (let i = scriptStart; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportLine = i;
      } else if (lines[i].trim() && !lines[i].trim().startsWith('import ') && !lines[i].trim().startsWith('//')) {
        break;
      }
    }

    // 插入新的导入语句
    lines.splice(lastImportLine + 1, 0, ...importLines);

    return lines.join('\n');
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 修复结果统计:');
    console.log(`检查文件数: ${this.results.totalFiles}`);
    console.log(`修改文件数: ${this.results.modifiedFiles}`);
    console.log(`错误数: ${this.results.errors.length}`);
    console.log(`总修复数: ${this.results.fixes.reduce((sum, file) => sum + file.fixes.length, 0)}\n`);

    if (this.results.modifiedFiles > 0) {
      console.log('🔧 修复详情:');

      this.results.fixes.forEach(fileFix => {
        console.log(`\n📄 ${fileFix.file}`);

        if (fileFix.imports.length > 0) {
          console.log('  ➕ 添加导入:');
          fileFix.imports.forEach(imp => {
            console.log(`    import { ${imp.name} } from '${imp.path}';`);
          });
        }

        fileFix.fixes.forEach(fix => {
          console.log(`  🔄 ${fix.original} → ${fix.replacement}`);
        });
      });
    }

    if (this.results.errors.length > 0) {
      console.log('\n❌ 错误详情:');
      this.results.errors.forEach(error => {
        console.log(`  ${error.file}: ${error.error}`);
      });
    }

    if (this.dryRun) {
      console.log('\n💡 这是预览模式，实际文件未被修改');
      console.log('   使用 --apply 参数来应用修复');
    } else {
      console.log('\n✅ 修复完成！');
      if (this.backup) {
        console.log('💾 原文件已备份为 .backup 文件');
      }
    }
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');

  const options = {
    rootDir: path.join(__dirname, '../client'),
    dryRun: !isApply,
    backup: !args.includes('--no-backup')
  };

  const fixer = new APIHardcodedFixer(options);
  fixer.fix().catch(error => {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  });
}

module.exports = APIHardcodedFixer;