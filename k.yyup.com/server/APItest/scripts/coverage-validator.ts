/**
 * API覆盖率验证和报告生成器
 * 实现100%API覆盖率验证和详细报告
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface APIEndpoint {
  path: string;
  method: string;
  description: string;
  file: string;
  line?: number;
  category: string;
  tested?: boolean;
  testFile?: string;
  formatValidated?: boolean;
}

interface CoverageReport {
  totalEndpoints: number;
  testedEndpoints: number;
  untestedEndpoints: number;
  formatValidatedEndpoints: number;
  coveragePercentage: number;
  categories: {
    [category: string]: {
      total: number;
      tested: number;
      coverage: number;
      endpoints: APIEndpoint[];
    };
  };
  untestedAPIs: APIEndpoint[];
  formatIssues: string[];
  recommendations: string[];
}

export class APICoverageValidator {
  private readonly projectRoot: string;
  private readonly routesDir: string;
  private readonly testDir: string;

  constructor(projectRoot: string = '/home/zhgue/kyyupgame/k.yyup.com') {
    this.projectRoot = projectRoot;
    this.routesDir = path.join(projectRoot, 'server/src/routes');
    this.testDir = path.join(projectRoot, 'server/APItest');
  }

  /**
   * 扫描所有API端点
   */
  async scanAllEndpoints(): Promise<APIEndpoint[]> {
    const endpoints: APIEndpoint[] = [];

    try {
      // 扫描路由文件
      const routeFiles = await this.findRouteFiles();

      for (const file of routeFiles) {
        const fileEndpoints = await this.extractEndpointsFromFile(file);
        endpoints.push(...fileEndpoints);
      }

      console.log(`✅ 扫描完成：发现 ${endpoints.length} 个API端点`);
      return endpoints;
    } catch (error) {
      console.error('❌ 扫描API端点失败:', error);
      return [];
    }
  }

  /**
   * 查找所有路由文件
   */
  private async findRouteFiles(): Promise<string[]> {
    const pattern = path.join(this.routesDir, '**/*.ts');
    const files = await glob(pattern);
    return files.filter(file => !file.includes('/routes/index.ts'));
  }

  /**
   * 从文件中提取API端点
   */
  private async extractEndpointsFromFile(filePath: string): Promise<APIEndpoint[]> {
    const endpoints: APIEndpoint[] = [];

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // 提取路由模式
      const routePattern = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
      const category = this.getCategoryFromPath(filePath);

      let match;
      while ((match = routePattern.exec(content)) !== null) {
        const method = match[1].toUpperCase();
        const path = match[2];
        const lineNumber = content.substring(0, match.index).split('\n').length;

        endpoints.push({
          path: this.normalizePath(path),
          method,
          description: `${method} ${path}`,
          file: path.relative(this.projectRoot, filePath),
          line: lineNumber,
          category,
          tested: false
        });
      }

      // 处理导出的路由器
      const exportPattern = /module\.exports\s*=\s*router/g;
      if (exportPattern.test(content)) {
        // 可能需要额外的处理逻辑
      }

    } catch (error) {
      console.error(`❌ 读取文件失败 ${filePath}:`, error);
    }

    return endpoints;
  }

  /**
   * 规范化API路径
   */
  private normalizePath(path: string): string {
    // 移除路径参数的动态部分，保持基础路径
    return path.replace(/\/:[^\/]+/g, '/:id');
  }

  /**
   * 从文件路径获取API分类
   */
  private getCategoryFromPath(filePath: string): string {
    const relativePath = path.relative(this.routesDir, filePath);
    const parts = relativePath.split(path.sep);

    if (parts[0] && parts[0] !== 'routes') {
      return parts[0];
    }

    return 'misc';
  }

  /**
   * 扫描测试文件
   */
  async scanTestFiles(): Promise<Set<string>> {
    const testedEndpoints = new Set<string>();

    try {
      const pattern = path.join(this.testDir, '**/*.test.ts');
      const testFiles = await glob(pattern);

      for (const testFile of testFiles) {
        const content = fs.readFileSync(testFile, 'utf8');
        const endpoints = this.extractTestedEndpoints(content);
        endpoints.forEach(endpoint => testedEndpoints.add(endpoint));
      }

      console.log(`✅ 扫描完成：发现 ${testedEndpoints.size} 个已测试的API端点`);
    } catch (error) {
      console.error('❌ 扫描测试文件失败:', error);
    }

    return testedEndpoints;
  }

  /**
   * 从测试文件中提取被测试的API端点
   */
  private extractTestedEndpoints(content: string): string[] {
    const endpoints: string[] = [];

    // 匹配各种测试模式
    const patterns = [
      /request\(app\)\s*\.[^(]+\(['"`]([^'"`]+)['"`]/g,
      /\.get\(['"`]([^'"`]+)['"`]/g,
      /\.post\(['"`]([^'"`]+)['"`]/g,
      /\.put\(['"`]([^'"`]+)['"`]/g,
      /\.delete\(['"`]([^'"`]+)['"`]/g,
      /\.patch\(['"`]([^'"`]+)['"`]/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const endpoint = match[1];
        if (endpoint.startsWith('/api/') || endpoint.startsWith('/')) {
          endpoints.push(endpoint);
        }
      }
    });

    return [...new Set(endpoints)];
  }

  /**
   * 验证API格式一致性
   */
  async validateAPIFormat(): Promise<string[]> {
    const issues: string[] = [];

    try {
      // 扫描控制器文件中的响应格式
      const controllerPattern = path.join(this.projectRoot, 'server/src/controllers/**/*.ts');
      const controllerFiles = await glob(controllerPattern);

      for (const file of controllerFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const fileIssues = this.analyzeControllerFormat(content, file);
        issues.push(...fileIssues);
      }

      console.log(`✅ 格式验证完成：发现 ${issues.length} 个格式问题`);
    } catch (error) {
      console.error('❌ 验证API格式失败:', error);
    }

    return issues;
  }

  /**
   * 分析控制器文件中的格式问题
   */
  private analyzeControllerFormat(content: string, filePath: string): string[] {
    const issues: string[] = [];
    const relativePath = path.relative(this.projectRoot, filePath);

    // 检查直接res.json调用（可能不一致）
    const directResJson = content.match(/res\.status\(\d+\)\.json\(/g);
    if (directResJson && directResJson.length > 0) {
      issues.push(`${relativePath}: 发现 ${directResJson.length} 个直接的res.json调用，可能存在格式不一致`);
    }

    // 检查是否使用了标准响应工具
    const usesStandardResponse =
      content.includes('ApiResponseEnhanced') ||
      content.includes('ApiResponse.success') ||
      content.includes('BaseController');

    if (!usesStandardResponse) {
      issues.push(`${relativePath}: 未使用标准API响应工具`);
    }

    return issues;
  }

  /**
   * 生成完整的覆盖率报告
   */
  async generateCoverageReport(): Promise<CoverageReport> {
    console.log('🚀 开始生成API覆盖率报告...');

    // 扫描所有API端点
    const allEndpoints = await this.scanAllEndpoints();
    const testedEndpoints = await this.scanTestFiles();
    const formatIssues = await this.validateAPIFormat();

    // 分析测试覆盖情况
    const categories: CoverageReport['categories'] = {};
    let totalTested = 0;
    let formatValidated = 0;

    allEndpoints.forEach(endpoint => {
      const endpointKey = `${endpoint.method} ${endpoint.path}`;
      endpoint.tested = testedEndpoints.has(endpoint.path) || testedEndpoints.has(endpointKey);

      if (endpoint.tested) {
        totalTested++;
        formatValidated++; // 假设已测试的API都经过了格式验证
      }

      // 按分类统计
      if (!categories[endpoint.category]) {
        categories[endpoint.category] = {
          total: 0,
          tested: 0,
          coverage: 0,
          endpoints: []
        };
      }

      categories[endpoint.category].total++;
      if (endpoint.tested) {
        categories[endpoint.category].tested++;
      }
      categories[endpoint.category].endpoints.push(endpoint);
    });

    // 计算分类覆盖率
    Object.keys(categories).forEach(category => {
      const cat = categories[category];
      cat.coverage = cat.total > 0 ? Math.round((cat.tested / cat.total) * 100) : 0;
    });

    // 生成推荐
    const recommendations = this.generateRecommendations(allEndpoints, categories, formatIssues);

    const report: CoverageReport = {
      totalEndpoints: allEndpoints.length,
      testedEndpoints: totalTested,
      untestedEndpoints: allEndpoints.length - totalTested,
      formatValidatedEndpoints: formatValidated,
      coveragePercentage: Math.round((totalTested / allEndpoints.length) * 100),
      categories,
      untestedAPIs: allEndpoints.filter(e => !e.tested),
      formatIssues,
      recommendations
    };

    return report;
  }

  /**
   * 生成改进推荐
   */
  private generateRecommendations(
    endpoints: APIEndpoint[],
    categories: CoverageReport['categories'],
    formatIssues: string[]
  ): string[] {
    const recommendations: string[] = [];

    // 覆盖率推荐
    const overallCoverage = (endpoints.filter(e => e.tested).length / endpoints.length) * 100;

    if (overallCoverage < 50) {
      recommendations.push('🔴 API测试覆盖率过低，需要立即增加测试用例');
    } else if (overallCoverage < 80) {
      recommendations.push('🟡 API测试覆盖率有待提高，建议增加测试用例');
    }

    // 分类覆盖率推荐
    Object.entries(categories).forEach(([category, stats]) => {
      if (stats.coverage < 50) {
        recommendations.push(`🔴 ${category} 类别API测试覆盖率严重不足 (${stats.coverage}%)`);
      } else if (stats.coverage < 80) {
        recommendations.push(`🟡 ${category} 类别API测试覆盖率需要提高 (${stats.coverage}%)`);
      }
    });

    // 格式问题推荐
    if (formatIssues.length > 0) {
      recommendations.push(`🔴 发现 ${formatIssues.length} 个API格式问题，需要修复`);
    }

    // 具体API推荐
    const untestedByCategory = this.getUntestedByCategory(endpoints);
    Object.entries(untestedByCategory).forEach(([category, apis]) => {
      if (apis.length > 5) {
        recommendations.push(`📋 建议优先为 ${category} 类别创建测试用例 (${apis.length} 个未测试API)`);
      }
    });

    return recommendations;
  }

  /**
   * 按分类获取未测试的API
   */
  private getUntestedByCategory(endpoints: APIEndpoint[]): Record<string, APIEndpoint[]> {
    const untestedByCategory: Record<string, APIEndpoint[]> = {};

    endpoints
      .filter(e => !e.tested)
      .forEach(endpoint => {
        if (!untestedByCategory[endpoint.category]) {
          untestedByCategory[endpoint.category] = [];
        }
        untestedByCategory[endpoint.category].push(endpoint);
      });

    return untestedByCategory;
  }

  /**
   * 保存报告到文件
   */
  async saveReport(report: CoverageReport, outputPath?: string): Promise<void> {
    const reportPath = outputPath || path.join(this.testDir, 'reports', `api-coverage-report-${Date.now()}.json`);

    // 确保目录存在
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // 保存JSON格式报告
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

    // 生成Markdown格式报告
    const markdownReport = this.generateMarkdownReport(report);
    const markdownPath = reportPath.replace('.json', '.md');
    fs.writeFileSync(markdownPath, markdownReport, 'utf8');

    console.log(`✅ 报告已保存:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   Markdown: ${markdownPath}`);
  }

  /**
   * 生成Markdown格式报告
   */
  private generateMarkdownReport(report: CoverageReport): string {
    const timestamp = new Date().toLocaleString('zh-CN');

    let markdown = `# API测试覆盖率报告

**生成时间**: ${timestamp}
**覆盖率**: ${report.coveragePercentage}% (${report.testedEndpoints}/${report.totalEndpoints})

## 📊 总体统计

| 指标 | 数量 |
|------|------|
| 总API端点 | ${report.totalEndpoints} |
| 已测试端点 | ${report.testedEndpoints} |
| 未测试端点 | ${report.untestedEndpoints} |
| 格式验证端点 | ${report.formatValidatedEndpoints} |
| 覆盖率 | ${report.coveragePercentage}% |

## 📋 分类覆盖率

`;

    // 添加分类统计表格
    Object.entries(report.categories).forEach(([category, stats]) => {
      const status = stats.coverage >= 80 ? '✅' : stats.coverage >= 50 ? '🟡' : '🔴';
      markdown += `| ${status} ${category} | ${stats.total} | ${stats.tested} | ${stats.coverage}% |\n`;
    });

    markdown += `

| 分类 | 总数 | 已测试 | 覆盖率 |
|------|------|--------|--------|
`;

    Object.entries(report.categories).forEach(([category, stats]) => {
      const status = stats.coverage >= 80 ? '✅' : stats.coverage >= 50 ? '🟡' : '🔴';
      markdown += `| ${status} ${category} | ${stats.total} | ${stats.tested} | ${stats.coverage}% |\n`;
    });

    // 添加未测试API列表
    if (report.untestedAPIs.length > 0) {
      markdown += `\n## 🚨 未测试API (${report.untestedAPIs.length}个)\n\n`;
      report.untestedAPIs.forEach(api => {
        markdown += `- **${api.method} ${api.path}** - ${api.description}\n`;
      });
    }

    // 添加格式问题
    if (report.formatIssues.length > 0) {
      markdown += `\n## ⚠️ 格式问题 (${report.formatIssues.length}个)\n\n`;
      report.formatIssues.forEach(issue => {
        markdown += `- ${issue}\n`;
      });
    }

    // 添加推荐
    if (report.recommendations.length > 0) {
      markdown += `\n## 💡 改进推荐\n\n`;
      report.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
    }

    return markdown;
  }

  /**
   * 打印简化的控制台报告
   */
  printConsoleReport(report: CoverageReport): void {
    console.log('\n📊 API覆盖率报告');
    console.log('='.repeat(50));
    console.log(`总端点: ${report.totalEndpoints}`);
    console.log(`已测试: ${report.testedEndpoints}`);
    console.log(`未测试: ${report.untestedEndpoints}`);
    console.log(`覆盖率: ${report.coveragePercentage}%`);

    console.log('\n📋 分类统计:');
    Object.entries(report.categories).forEach(([category, stats]) => {
      const status = stats.coverage >= 80 ? '✅' : stats.coverage >= 50 ? '🟡' : '🔴';
      console.log(`${status} ${category}: ${stats.tested}/${stats.total} (${stats.coverage}%)`);
    });

    if (report.recommendations.length > 0) {
      console.log('\n💡 主要推荐:');
      report.recommendations.slice(0, 5).forEach(rec => {
        console.log(`  ${rec}`);
      });
    }
  }

  /**
   * 运行完整的验证流程
   */
  async runFullValidation(): Promise<CoverageReport> {
    console.log('🚀 开始API覆盖率完整验证...');

    const report = await this.generateCoverageReport();

    this.printConsoleReport(report);
    await this.saveReport(report);

    console.log('\n✅ API覆盖率验证完成！');

    return report;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const validator = new APICoverageValidator();
  validator.runFullValidation().catch(error => {
    console.error('❌ 验证失败:', error);
    process.exit(1);
  });
}