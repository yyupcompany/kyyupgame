#!/usr/bin/env node

/**
 * 后端路由规范检查工具
 * 检查路由重复、命名规范、文件组织等问题
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class RouteValidator {
  constructor() {
    this.routesDir = path.join(__dirname, '../server/src/routes');
    this.issues = [];
    this.warnings = [];
    this.stats = {
      totalFiles: 0,
      duplicateRoutes: 0,
      namingIssues: 0,
      organizationIssues: 0
    };
  }

  /**
   * 运行所有检查
   */
  async validate() {
    console.log('🔍 开始后端路由规范检查...\n');
    
    try {
      await this.checkFileNaming();
      await this.checkRouteRegistration();
      await this.checkDirectoryStructure();
      await this.checkRESTfulCompliance();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ 检查过程中出现错误:', error);
    }
  }

  /**
   * 检查文件命名规范
   */
  async checkFileNaming() {
    console.log('📁 检查文件命名规范...');
    
    const routeFiles = glob.sync('**/*.routes.ts', { 
      cwd: this.routesDir,
      absolute: false 
    });
    
    this.stats.totalFiles = routeFiles.length;
    
    routeFiles.forEach(file => {
      const fileName = path.basename(file, '.routes.ts');
      
      // 检查命名规范
      if (this.isSingularForm(fileName)) {
        this.addIssue('naming', `文件 ${file} 使用单数形式，建议使用复数形式`);
      }
      
      if (fileName.includes('_')) {
        this.addIssue('naming', `文件 ${file} 使用下划线，建议使用连字符`);
      }
      
      if (fileName !== fileName.toLowerCase()) {
        this.addIssue('naming', `文件 ${file} 包含大写字母，建议使用小写`);
      }
      
      // 检查是否有备份文件
      if (fileName.includes('backup') || fileName.includes('old')) {
        this.addWarning(`发现备份文件 ${file}，建议清理`);
      }
    });
    
    console.log(`  ✅ 检查了 ${routeFiles.length} 个路由文件`);
  }

  /**
   * 检查路由注册重复
   */
  async checkRouteRegistration() {
    console.log('🛣️ 检查路由注册重复...');
    
    const indexFile = path.join(this.routesDir, 'index.ts');
    if (!fs.existsSync(indexFile)) {
      this.addIssue('structure', '缺少主路由文件 index.ts');
      return;
    }
    
    const content = fs.readFileSync(indexFile, 'utf-8');
    const routeRegistrations = this.extractRouteRegistrations(content);
    
    // 检查重复注册
    const pathCounts = {};
    routeRegistrations.forEach(({ path, line }) => {
      if (!pathCounts[path]) {
        pathCounts[path] = [];
      }
      pathCounts[path].push(line);
    });
    
    Object.entries(pathCounts).forEach(([path, lines]) => {
      if (lines.length > 1) {
        this.addIssue('duplicate', `路径 ${path} 重复注册 ${lines.length} 次，行号: ${lines.join(', ')}`);
        this.stats.duplicateRoutes++;
      }
    });
    
    console.log(`  ✅ 检查了 ${routeRegistrations.length} 个路由注册`);
  }

  /**
   * 检查目录结构
   */
  async checkDirectoryStructure() {
    console.log('📂 检查目录结构...');
    
    const expectedDirs = ['auth', 'system', 'business'];
    const actualDirs = fs.readdirSync(this.routesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // 检查是否有推荐的目录结构
    const hasGrouping = actualDirs.some(dir => expectedDirs.includes(dir));
    if (!hasGrouping && this.stats.totalFiles > 20) {
      this.addWarning('建议按功能模块组织路由文件到子目录中');
    }
    
    console.log(`  ✅ 检查了目录结构`);
  }

  /**
   * 检查RESTful规范
   */
  async checkRESTfulCompliance() {
    console.log('🔧 检查RESTful规范...');
    
    const routeFiles = glob.sync('**/*.routes.ts', { 
      cwd: this.routesDir,
      absolute: true 
    });
    
    routeFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const routes = this.extractRouteDefinitions(content);
      
      routes.forEach(route => {
        // 检查路径参数命名
        const paramMatches = route.path.match(/:(\w+)/g);
        if (paramMatches) {
          paramMatches.forEach(param => {
            const paramName = param.substring(1);
            if (paramName.includes('_')) {
              this.addIssue('restful', `参数 ${param} 使用下划线，建议使用驼峰命名`);
            }
          });
        }
        
        // 检查HTTP方法使用
        if (route.method === 'GET' && route.path.includes('/create')) {
          this.addIssue('restful', `GET方法不应包含 /create 路径: ${route.path}`);
        }
      });
    });
    
    console.log(`  ✅ 检查了RESTful规范`);
  }

  /**
   * 提取路由注册信息
   */
  extractRouteRegistrations(content) {
    const registrations = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const match = line.match(/router\.use\(['"`]([^'"`]+)['"`]/);
      if (match) {
        registrations.push({
          path: match[1],
          line: index + 1
        });
      }
    });
    
    return registrations;
  }

  /**
   * 提取路由定义
   */
  extractRouteDefinitions(content) {
    const routes = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const match = line.match(/router\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/);
      if (match) {
        routes.push({
          method: match[1].toUpperCase(),
          path: match[2]
        });
      }
    });
    
    return routes;
  }

  /**
   * 检查是否为单数形式
   */
  isSingularForm(word) {
    const singularWords = [
      'user', 'role', 'permission', 'class', 'teacher', 
      'student', 'parent', 'activity', 'enrollment'
    ];
    return singularWords.includes(word);
  }

  /**
   * 添加问题
   */
  addIssue(type, message) {
    this.issues.push({ type, message });
    this.stats[type + 'Issues'] = (this.stats[type + 'Issues'] || 0) + 1;
  }

  /**
   * 添加警告
   */
  addWarning(message) {
    this.warnings.push(message);
  }

  /**
   * 生成检查报告
   */
  generateReport() {
    console.log('\n📊 检查报告');
    console.log('='.repeat(50));

    // 统计信息
    console.log('\n📈 统计信息:');
    console.log(`- 总文件数: ${this.stats.totalFiles}`);
    console.log(`- 重复路由: ${this.stats.duplicateRoutes}`);
    console.log(`- 命名问题: ${this.stats.namingIssues || 0}`);

    // 问题列表
    if (this.issues.length > 0) {
      console.log('\n❌ 发现的问题:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.type.toUpperCase()}] ${issue.message}`);
      });
    } else {
      console.log('\n✅ 未发现规范问题');
    }

    // 警告列表
    if (this.warnings.length > 0) {
      console.log('\n⚠️ 警告信息:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    // 建议
    console.log('\n💡 改进建议:');
    if (this.stats.duplicateRoutes > 0) {
      console.log('- 清理重复的路由注册');
    }
    if (this.stats.namingIssues > 0) {
      console.log('- 按照命名规范重命名文件');
    }
    if (this.warnings.length > 0) {
      console.log('- 清理备份文件和优化目录结构');
    }

    // 生成修复脚本
    this.generateFixScript();

    console.log('\n🔗 参考文档: docs/backend-route-standards.md');

    // 返回检查结果（用于CI/CD）
    return {
      success: this.issues.length === 0,
      issues: this.issues.length,
      warnings: this.warnings.length
    };
  }

  /**
   * 生成自动修复脚本
   */
  generateFixScript() {
    const fixScript = [];

    // 生成重命名命令
    this.issues.forEach(issue => {
      if (issue.type === 'naming' && issue.message.includes('使用单数形式')) {
        const match = issue.message.match(/文件 (.+) 使用单数形式/);
        if (match) {
          const oldFile = match[1];
          const newFile = oldFile.replace(/(\w+)\.routes\.ts$/, (_, name) => {
            return this.pluralize(name) + '.routes.ts';
          });
          fixScript.push(`mv "${oldFile}" "${newFile}"`);
        }
      }
    });

    if (fixScript.length > 0) {
      console.log('\n🔧 自动修复脚本:');
      console.log('# 运行以下命令修复命名问题:');
      fixScript.forEach(cmd => console.log(cmd));
    }
  }

  /**
   * 将单数转换为复数
   */
  pluralize(word) {
    const pluralRules = {
      'user': 'users',
      'role': 'roles',
      'permission': 'permissions',
      'class': 'classes',
      'teacher': 'teachers',
      'student': 'students',
      'parent': 'parents',
      'activity': 'activities',
      'enrollment': 'enrollments'
    };
    return pluralRules[word] || word + 's';
  }
}

// 运行检查
if (require.main === module) {
  const validator = new RouteValidator();
  validator.validate();
}

module.exports = RouteValidator;
