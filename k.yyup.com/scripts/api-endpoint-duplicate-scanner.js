#!/usr/bin/env node

/**
 * API端点重复检测工具
 * 扫描前后端代码，识别可能重复的API端点定义
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class ApiEndpointScanner {
  constructor() {
    this.frontendEndpoints = new Map();
    this.backendEndpoints = new Map();
    this.potentialConflicts = [];
    this.stats = {
      frontendFiles: 0,
      backendFiles: 0,
      frontendEndpoints: 0,
      backendEndpoints: 0,
      conflicts: 0
    };
  }

  /**
   * 主扫描函数
   */
  async scan() {
    console.log('🔍 开始扫描前后端API端点...\n');

    // 并行扫描前端和后端
    await Promise.all([
      this.scanFrontend(),
      this.scanBackend()
    ]);

    // 分析结果
    this.analyzeResults();

    // 生成报告
    this.generateReport();
  }

  /**
   * 扫描前端API调用和路由
   */
  async scanFrontend() {
    console.log('📱 扫描前端API调用...');

    const frontendPatterns = [
      'client/src/api/**/*.ts',
      'client/src/api/**/*.js',
      'client/src/router/**/*.ts',
      'client/src/router/**/*.js',
      'client/src/pages/**/*.(ts|js|vue)',
      'client/src/components/**/*.(ts|js|vue)'
    ];

    const files = this.getFiles(frontendPatterns);
    this.stats.frontendFiles = files.length;

    console.log(`   找到 ${files.length} 个前端文件`);

    for (const file of files) {
      await this.scanFrontendFile(file);
    }

    console.log(`   ✅ 前端扫描完成，发现 ${this.stats.frontendEndpoints} 个API端点\n`);
  }

  /**
   * 扫描后端路由定义
   */
  async scanBackend() {
    console.log('🖥️  扫描后端API路由...');

    const backendPatterns = [
      'server/src/routes/**/*.ts',
      'server/src/routes/**/*.js',
      'server/src/controllers/**/*.ts',
      'server/src/controllers/**/*.js',
      'server/src/app.ts',
      'server/src/server.ts'
    ];

    const files = this.getFiles(backendPatterns);
    this.stats.backendFiles = files.length;

    console.log(`   找到 ${files.length} 个后端文件`);

    for (const file of files) {
      await this.scanBackendFile(file);
    }

    console.log(`   ✅ 后端扫描完成，发现 ${this.stats.backendEndpoints} 个API端点\n`);
  }

  /**
   * 获取匹配的文件列表
   */
  getFiles(patterns) {
    const files = new Set();

    for (const pattern of patterns) {
      const matches = glob.sync(pattern, {
        cwd: process.cwd(),
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**']
      });
      matches.forEach(file => files.add(file));
    }

    return Array.from(files);
  }

  /**
   * 扫描单个前端文件
   */
  async scanFrontendFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);

      // 扫描API调用模式
      const apiPatterns = [
        // fetch/axios调用
        /(?:fetch|axios|request)\s*\(\s*['"`]([^'"`]+)['"`]/g,
        // API端点常量
        /(?:API_BASE|API_URL|endpoint)\s*[=:]\s*['"`]([^'"`]+)['"`]/g,
        // 路由定义
        /path:\s*['"`]([^'"`]+)['"`]/g,
        // URL构建
        /url\s*[=:]\s*['"`]([^'"`]+)['"`]/g,
        // API调用方法
        /(?:get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
        // 接口注释中的API路径
        /(?:@api|API)\s*:\s*['"`]?\/?([^'"`\s]+)/g
      ];

      let match;
      apiPatterns.forEach(pattern => {
        while ((match = pattern.exec(content)) !== null) {
          const endpoint = this.normalizeEndpoint(match[1]);
          if (this.isValidEndpoint(endpoint)) {
            this.addFrontendEndpoint(endpoint, relativePath, content);
          }
        }
      });
    } catch (error) {
      console.warn(`   ⚠️  警告: 无法读取文件 ${filePath}: ${error.message}`);
    }
  }

  /**
   * 扫描单个后端文件
   */
  async scanBackendFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);

      // 扫描路由定义模式
      const routePatterns = [
        // Express路由
        /router\.(?:get|post|put|delete|patch|all)\s*\(\s*['"`]([^'"`]+)['"`]/g,
        // app路由
        /app\.(?:get|post|put|delete|patch|all)\s*\(\s*['"`]([^'"`]+)['"`]/g,
        // 路由定义数组
        /routes?\s*[=:]\s*\[(['"`]([^'"`]+)['"`]([^,]*)[^\]]*)\]/g,
        // 路由常量
        /(?:ROUTE|ENDPOINT)\s*[=:]\s*['"`]([^'"`]+)['"`]/g,
        // Swagger API路径
        /@api\s*\{[^}]*\}\s*\/([^\\s]+)/g,
        // Fastify风格路由
        /\.(?:get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g
      ];

      let match;
      routePatterns.forEach(pattern => {
        while ((match = pattern.exec(content)) !== null) {
          const endpoint = this.normalizeEndpoint(match[1]);
          if (this.isValidEndpoint(endpoint)) {
            this.addBackendEndpoint(endpoint, relativePath, content);
          }
        }
      });
    } catch (error) {
      console.warn(`   ⚠️  警告: 无法读取文件 ${filePath}: ${error.message}`);
    }
  }

  /**
   * 标准化端点路径
   */
  normalizeEndpoint(endpoint) {
    // 移除查询参数
    endpoint = endpoint.split('?')[0];

    // 移除域名和协议
    endpoint = endpoint.replace(/^https?:\/\/[^\/]+/, '');

    // 移除前导斜杠（用于统一比较）
    if (endpoint.startsWith('/')) {
      endpoint = endpoint.substring(1);
    }

    // 处理路径参数（如 /users/:id -> /users/{id})
    endpoint = endpoint.replace(/:([^\/]+)/g, '{$1}');

    return endpoint.toLowerCase();
  }

  /**
   * 验证端点是否有效
   */
  isValidEndpoint(endpoint) {
    return endpoint &&
           endpoint.length > 1 &&
           !endpoint.includes('localhost') &&
           !endpoint.includes('127.0.0.1') &&
           !endpoint.startsWith('http') &&
           !endpoint.startsWith('#') &&
           !endpoint.startsWith('//') &&
           !endpoint.includes('node_modules') &&
           !endpoint.includes('static') &&
           !endpoint.includes('public');
  }

  /**
   * 添加前端端点记录
   */
  addFrontendEndpoint(endpoint, filePath, content) {
    if (!this.frontendEndpoints.has(endpoint)) {
      this.frontendEndpoints.set(endpoint, {
        endpoint,
        locations: [],
        type: 'frontend',
        methods: new Set()
      });
    }

    const endpointData = this.frontendEndpoints.get(endpoint);
    endpointData.locations.push({
      file: filePath,
      line: this.getLineNumber(content, endpoint),
      type: 'api_call'
    });

    // 提取HTTP方法
    const methods = this.extractMethods(content, endpoint);
    methods.forEach(method => endpointData.methods.add(method));

    this.stats.frontendEndpoints++;
  }

  /**
   * 添加后端端点记录
   */
  addBackendEndpoint(endpoint, filePath, content) {
    if (!this.backendEndpoints.has(endpoint)) {
      this.backendEndpoints.set(endpoint, {
        endpoint,
        locations: [],
        type: 'backend',
        methods: new Set()
      });
    }

    const endpointData = this.backendEndpoints.get(endpoint);
    endpointData.locations.push({
      file: filePath,
      line: this.getLineNumber(content, endpoint),
      type: 'route_definition'
    });

    // 提取HTTP方法
    const methods = this.extractMethods(content, endpoint);
    methods.forEach(method => endpointData.methods.add(method));

    this.stats.backendEndpoints++;
  }

  /**
   * 提取HTTP方法
   */
  extractMethods(content, endpoint) {
    const methods = new Set();
    const methodPatterns = [
      /\.(get|post|put|delete|patch|all)\s*\(/gi,
      /(GET|POST|PUT|DELETE|PATCH|ALL)\s*:/gi
    ];

    methodPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        methods.add(match[1].toLowerCase());
      }
    });

    return methods;
  }

  /**
   * 获取端点在文件中的行号
   */
  getLineNumber(content, endpoint) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(endpoint)) {
        return i + 1;
      }
    }
    return 0;
  }

  /**
   * 分析扫描结果
   */
  analyzeResults() {
    console.log('🔬 分析扫描结果...\n');

    // 检查完全重复的端点
    for (const [endpoint, frontendData] of this.frontendEndpoints) {
      if (this.backendEndpoints.has(endpoint)) {
        const backendData = this.backendEndpoints.get(endpoint);

        this.potentialConflicts.push({
          type: 'exact_match',
          endpoint,
          frontend: frontendData,
          backend: backendData,
          severity: 'high'
        });
      }
    }

    // 检查相似的端点（模糊匹配）
    this.checkSimilarEndpoints();

    this.stats.conflicts = this.potentialConflicts.length;
    console.log(`   ✅ 分析完成，发现 ${this.stats.conflicts} 个潜在冲突\n`);
  }

  /**
   * 检查相似的端点
   */
  checkSimilarEndpoints() {
    const frontendEndpoints = Array.from(this.frontendEndpoints.keys());
    const backendEndpoints = Array.from(this.backendEndpoints.keys());

    for (const frontendEndpoint of frontendEndpoints) {
      for (const backendEndpoint of backendEndpoints) {
        if (this.areEndpointsSimilar(frontendEndpoint, backendEndpoint)) {
          this.potentialConflicts.push({
            type: 'similar_match',
            frontendEndpoint,
            backendEndpoint,
            similarity: this.calculateSimilarity(frontendEndpoint, backendEndpoint),
            severity: 'medium'
          });
        }
      }
    }
  }

  /**
   * 判断两个端点是否相似
   */
  areEndpointsSimilar(endpoint1, endpoint2) {
    // 计算编辑距离
    const distance = this.levenshteinDistance(endpoint1, endpoint2);
    const maxLength = Math.max(endpoint1.length, endpoint2.length);
    const similarity = 1 - distance / maxLength;

    return similarity > 0.7; // 70%以上相似度
  }

  /**
   * 计算字符串相似度
   */
  calculateSimilarity(str1, str2) {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return ((maxLength - distance) / maxLength * 100).toFixed(1);
  }

  /**
   * 计算编辑距离
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 生成详细的检测报告
   */
  generateReport() {
    console.log('📋 生成API端点重复检测报告...\n');

    let report = '# API端点重复检测报告\n\n';
    report += `**生成时间**: ${new Date().toLocaleString()}\n\n`;

    // 统计信息
    report += '## 📊 扫描统计\n\n';
    report += `- **前端文件数量**: ${this.stats.frontendFiles}\n`;
    report += `- **后端文件数量**: ${this.stats.backendFiles}\n`;
    report += `- **前端端点数量**: ${this.stats.frontendEndpoints}\n`;
    report += `- **后端端点数量**: ${this.stats.backendEndpoints}\n`;
    report += `- **潜在冲突数量**: ${this.stats.conflicts}\n\n`;

    // 冲突详情
    if (this.potentialConflicts.length > 0) {
      report += '## 🚨 潜在冲突详情\n\n';

      const highSeverityConflicts = this.potentialConflicts.filter(c => c.severity === 'high');
      const mediumSeverityConflicts = this.potentialConflicts.filter(c => c.severity === 'medium');

      if (highSeverityConflicts.length > 0) {
        report += `### 严重冲突 (${highSeverityConflicts.length}个)\n\n`;
        highSeverityConflicts.forEach((conflict, index) => {
          report += this.formatExactMatchConflict(conflict, index + 1);
        });
      }

      if (mediumSeverityConflicts.length > 0) {
        report += `### 相似端点 (${mediumSeverityConflicts.length}个)\n\n`;
        mediumSeverityConflicts.forEach((conflict, index) => {
          report += this.formatSimilarMatchConflict(conflict, index + 1);
        });
      }
    } else {
      report += '✅ **好消息**: 未发现API端点重复问题！\n\n';
    }

    // 前端端点列表
    report += '## 📱 前端API端点列表\n\n';
    const sortedFrontendEndpoints = Array.from(this.frontendEndpoints.keys()).sort();
    sortedFrontendEndpoints.forEach(endpoint => {
      const data = this.frontendEndpoints.get(endpoint);
      report += `- \`/${endpoint}\` - ${data.locations.length}个调用位置\n`;
    });

    // 后端端点列表
    report += '\n## 🖥️  后端API端点列表\n\n';
    const sortedBackendEndpoints = Array.from(this.backendEndpoints.keys()).sort();
    sortedBackendEndpoints.forEach(endpoint => {
      const data = this.backendEndpoints.get(endpoint);
      report += `- \`/${endpoint}\` - ${data.locations.length}个定义位置\n`;
    });

    // 建议
    report += '\n## 💡 修复建议\n\n';
    report += '1. **严重冲突**: 前后端完全相同的端点，需要明确职责分工\n';
    report += '2. **相似端点**: 功能重叠的端点，建议合并或明确区分\n';
    report += '3. **命名规范**: 建立统一的API命名规范\n';
    report += '4. **文档同步**: 确保前后端API文档保持同步\n';
    report += '5. **代码审查**: 建立API设计的代码审查流程\n\n';

    // 保存报告文件
    const reportPath = path.join(process.cwd(), 'API_ENDPOINT_DUPLICATE_REPORT.md');
    fs.writeFileSync(reportPath, report);

    // 输出控制台摘要
    this.printConsoleSummary();

    console.log(`📄 详细报告已保存到: ${reportPath}\n`);
  }

  /**
   * 格式化完全匹配冲突
   */
  formatExactMatchConflict(conflict, index) {
    let formatted = `#### ${index}. 完全重复: /${conflict.endpoint}\n\n`;

    formatted += '**前端调用位置**:\n';
    conflict.frontend.locations.forEach(location => {
      formatted += `- \`${location.file}:${location.line}\`\n`;
    });

    formatted += '\n**后端定义位置**:\n';
    conflict.backend.locations.forEach(location => {
      formatted += `- \`${location.file}:${location.line}\`\n`;
    });

    formatted += '\n**建议**: 确定该API的单一数据源，避免前后端重复实现\n\n';
    return formatted;
  }

  /**
   * 格式化相似匹配冲突
   */
  formatSimilarMatchConflict(conflict, index) {
    let formatted = `#### ${index}. 相似端点 (${conflict.similarity}% 相似)\n\n`;

    formatted += `- **前端**: \`${conflict.frontendEndpoint}\`\n`;
    formatted += `- **后端**: \`${conflict.backendEndpoint}\`\n`;

    formatted += '\n**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名\n\n';
    return formatted;
  }

  /**
   * 输出控制台摘要
   */
  printConsoleSummary() {
    console.log('📈 扫描结果摘要:');
    console.log('─'.repeat(50));
    console.log(`📁 文件统计: 前端 ${this.stats.frontendFiles} 个，后端 ${this.stats.backendFiles} 个`);
    console.log(`🔗 端点统计: 前端 ${this.stats.frontendEndpoints} 个，后端 ${this.stats.backendEndpoints} 个`);

    if (this.potentialConflicts.length > 0) {
      const highSeverity = this.potentialConflicts.filter(c => c.severity === 'high').length;
      const mediumSeverity = this.potentialConflicts.filter(c => c.severity === 'medium').length;

      console.log(`\n🚨 发现 ${this.potentialConflicts.length} 个潜在冲突:`);
      console.log(`   - 严重冲突: ${highSeverity} 个（完全重复）`);
      console.log(`   - 相似端点: ${mediumSeverity} 个（命名相似）`);

      console.log('\n⚠️  需要重点关注的前后端重复API:');
      this.potentialConflicts
        .filter(c => c.severity === 'high')
        .slice(0, 5)
        .forEach((conflict, index) => {
          console.log(`   ${index + 1}. /${conflict.endpoint}`);
        });
    } else {
      console.log('✅ 未发现API端点重复问题');
    }

    console.log('─'.repeat(50));
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🔧 API端点重复检测工具\n');
  console.log('🎯 检测目标: 识别前后端可能重复的API端点定义\n');

  const scanner = new ApiEndpointScanner();

  try {
    await scanner.scan();
    console.log('🎉 扫描完成！');
  } catch (error) {
    console.error('❌ 扫描过程中出错:', error);
    process.exit(1);
  }
}

// 运行检测
if (require.main === module) {
  main();
}

module.exports = ApiEndpointScanner;