const fs = require('fs');
const path = require('path');

// Centers页面分析脚本
class CentersPageAnalyzer {
  constructor() {
    this.centersDir = '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/centers';
    this.results = {
      summary: {
        totalFiles: 0,
        mainPages: 0,
        components: 0
      },
      pages: [],
      componentStats: {
        'el-button': 0,
        'el-form': 0,
        'el-table': 0,
        'el-dialog': 0,
        'el-card': 0,
        'StatCard': 0,
        'UnifiedIcon': 0,
        'UnifiedCenterLayout': 0
      },
      buttonTypes: {
        'primary': 0,
        'success': 0,
        'danger': 0,
        'warning': 0,
        'info': 0,
        'default': 0,
        'text': 0
      },
      clickHandlers: 0,
      routeNavigations: 0
    };
  }

  // 递归扫描目录获取所有Vue文件
  scanDirectory(dir, relativePath = '') {
    const files = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // 递归扫描子目录
          files.push(...this.scanDirectory(fullPath, relativeItemPath));
        } else if (item.endsWith('.vue')) {
          files.push({
            fullPath,
            relativePath: relativeItemPath,
            fileName: item,
            isComponent: relativeItemPath.includes('components/')
          });
        }
      }
    } catch (error) {
      console.error(`扫描目录失败: ${dir}`, error.message);
    }

    return files;
  }

  // 分析单个Vue文件的内容
  analyzeFileContent(filePath, fileInfo) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      const analysis = {
        ...fileInfo,
        components: this.extractComponents(content),
        buttons: this.extractButtons(content),
        forms: this.extractForms(content),
        tables: this.extractTables(content),
        clickHandlers: this.extractClickHandlers(content),
        routeNavigations: this.extractRouteNavigations(content),
        apiCalls: this.extractApiCalls(content),
        imports: this.extractImports(content),
        hasScript: content.includes('<script'),
        hasStyle: content.includes('<style'),
        lineCount: content.split('\n').length
      };

      // 统计组件数量
      analysis.components.forEach(comp => {
        if (this.results.componentStats[comp]) {
          this.results.componentStats[comp]++;
        } else {
          this.results.componentStats[comp] = 1;
        }
      });

      // 统计按钮类型
      analysis.buttons.forEach(button => {
        if (button.type && this.results.buttonTypes[button.type]) {
          this.results.buttonTypes[button.type]++;
        }
      });

      // 统计点击处理器和路由导航
      this.results.clickHandlers += analysis.clickHandlers.length;
      this.results.routeNavigations += analysis.routeNavigations.length;

      return analysis;
    } catch (error) {
      console.error(`分析文件失败: ${filePath}`, error.message);
      return null;
    }
  }

  // 提取组件使用情况
  extractComponents(content) {
    const components = [];

    // 匹配HTML标签
    const tagMatches = content.match(/<[\w-]+/g);
    if (tagMatches) {
      const tags = tagMatches.map(tag => tag.replace('<', ''));

      // 过滤出Element Plus组件和自定义组件
      tags.forEach(tag => {
        if (tag.startsWith('el-') ||
            ['StatCard', 'UnifiedIcon', 'UnifiedCenterLayout', 'CentersStatCard'].includes(tag) ||
            /^[A-Z][a-zA-Z]+/.test(tag)) {
          if (!components.includes(tag)) {
            components.push(tag);
          }
        }
      });
    }

    return components;
  }

  // 提取按钮信息
  extractButtons(content) {
    const buttons = [];

    // 匹配el-button标签
    const buttonRegex = /<el-button[^>]*>(.*?)<\/el-button>/g;
    let match;

    while ((match = buttonRegex.exec(content)) !== null) {
      const buttonTag = match[0];
      const buttonContent = match[1];

      // 提取type属性
      const typeMatch = buttonTag.match(/type="([^"]*)"/);
      const sizeMatch = buttonTag.match(/size="([^"]*)"/);
      const loadingMatch = buttonTag.match(/:loading="([^"]*)"/);

      buttons.push({
        type: typeMatch ? typeMatch[1] : 'default',
        size: sizeMatch ? sizeMatch[1] : 'default',
        loading: loadingMatch ? loadingMatch[1] : null,
        content: buttonContent.trim(),
        hasClick: buttonTag.includes('@click') || buttonTag.includes('v-on:click')
      });
    }

    return buttons;
  }

  // 提取表单信息
  extractForms(content) {
    const forms = [];

    // 匹配el-form标签
    const formRegex = /<el-form[^>]*>[\s\S]*?<\/el-form>/g;
    let match;

    while ((match = formRegex.exec(content)) !== null) {
      const formTag = match[0];

      // 提取model属性
      const modelMatch = formTag.match(/:model="([^"]*)"/);
      const rulesMatch = formTag.match(/:rules="([^"]*)"/);
      const refMatch = formTag.match(/ref="([^"]*)"/);

      forms.push({
        model: modelMatch ? modelMatch[1] : null,
        rules: rulesMatch ? rulesMatch[1] : null,
        ref: refMatch ? refMatch[1] : null,
        hasSubmit: formTag.includes('@submit') || formTag.includes('v-on:submit')
      });
    }

    return forms;
  }

  // 提取表格信息
  extractTables(content) {
    const tables = [];

    // 匹配el-table标签
    const tableRegex = /<el-table[^>]*>[\s\S]*?<\/el-table>/g;
    let match;

    while ((match = tableRegex.exec(content)) !== null) {
      const tableTag = match[0];

      // 提取data属性
      const dataMatch = tableTag.match(/:data="([^"]*)"/);
      const stripeMatch = tableTag.match(/stripe/);
      const borderMatch = tableTag.match(/border/);

      tables.push({
        data: dataMatch ? dataMatch[1] : null,
        stripe: !!stripeMatch,
        border: !!borderMatch,
        hasSelection: tableTag.includes('@selection-change') || tableTag.includes('type="selection"')
      });
    }

    return tables;
  }

  // 提取点击处理器
  extractClickHandlers(content) {
    const clickHandlers = [];

    // 匹配@click和v-on:click
    const clickRegex = /(@click|v-on:click)="([^"]*)"/g;
    let match;

    while ((match = clickRegex.exec(content)) !== null) {
      clickHandlers.push({
        event: match[1],
        handler: match[2]
      });
    }

    return clickHandlers;
  }

  // 提取路由导航
  extractRouteNavigations(content) {
    const navigations = [];

    // 匹配router.push和router.replace
    const routerRegex = /(router\.(push|replace)\([^)]*\))/g;
    let match;

    while ((match = routerRegex.exec(content)) !== null) {
      navigations.push(match[1]);
    }

    // 匹配<router-link>
    const routerLinkRegex = /<router-link[^>]*to="([^"]*)"[^>]*>/g;
    while ((match = routerLinkRegex.exec(content)) !== null) {
      navigations.push(match[0]);
    }

    return navigations;
  }

  // 提取API调用
  extractApiCalls(content) {
    const apiCalls = [];

    // 匹配get, post, put, delete等HTTP方法调用
    const httpRegex = /\.(get|post|put|delete|patch)\s*\(/g;
    let match;

    while ((match = httpRegex.exec(content)) !== null) {
      apiCalls.push(match[0]);
    }

    return apiCalls;
  }

  // 提取import语句
  extractImports(content) {
    const imports = [];

    // 匹配import语句
    const importRegex = /import\s+.*?\s+from\s+['"][^'"]*['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[0]);
    }

    return imports;
  }

  // 生成分析报告
  generateReport() {
    const report = {
      scanTime: new Date().toISOString(),
      summary: this.results.summary,
      componentStats: this.results.componentStats,
      buttonTypes: this.results.buttonTypes,
      interactionStats: {
        totalClickHandlers: this.results.clickHandlers,
        totalRouteNavigations: this.results.routeNavigations
      },
      pages: this.results.pages
    };

    return report;
  }

  // 运行完整分析
  run() {
    console.log('🔍 开始扫描Centers页面...');

    // 扫描所有Vue文件
    const files = this.scanDirectory(this.centersDir);
    this.results.summary.totalFiles = files.length;
    this.results.summary.mainPages = files.filter(f => !f.isComponent).length;
    this.results.summary.components = files.filter(f => f.isComponent).length;

    console.log(`📁 找到 ${files.length} 个Vue文件`);
    console.log(`   - 主页面: ${this.results.summary.mainPages} 个`);
    console.log(`   - 组件: ${this.results.summary.components} 个`);

    // 分析每个文件
    for (const file of files) {
      console.log(`🔍 分析: ${file.relativePath}`);
      const analysis = this.analyzeFileContent(file.fullPath, file);
      if (analysis) {
        this.results.pages.push(analysis);
      }
    }

    // 生成报告
    const report = this.generateReport();

    // 保存报告
    const reportPath = '/home/zhgue/kyyupgame/k.yyup.com/centers-analysis-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 分析完成！报告已保存到:', reportPath);
    this.printSummary(report);

    return report;
  }

  // 打印分析摘要
  printSummary(report) {
    console.log('\n📈 Centers页面分析摘要:');
    console.log('================================');

    console.log('\n📁 文件统计:');
    console.log(`   总文件数: ${report.summary.totalFiles}`);
    console.log(`   主页面: ${report.summary.mainPages}`);
    console.log(`   组件: ${report.summary.components}`);

    console.log('\n🧩 组件使用统计:');
    Object.entries(report.componentStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([component, count]) => {
        console.log(`   ${component}: ${count} 次`);
      });

    console.log('\n🔘 按钮类型统计:');
    Object.entries(report.buttonTypes)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        if (count > 0) {
          console.log(`   ${type}: ${count} 个`);
        }
      });

    console.log('\n⚡ 交互功能统计:');
    console.log(`   点击处理器: ${report.interactionStats.totalClickHandlers} 个`);
    console.log(`   路由导航: ${report.interactionStats.totalRouteNavigations} 个`);

    console.log('\n📋 主要页面列表:');
    report.pages
      .filter(page => !page.isComponent)
      .forEach(page => {
        console.log(`   - ${page.fileName} (${page.lineCount} 行, ${page.buttons.length} 个按钮)`);
      });
  }
}

// 运行分析
const analyzer = new CentersPageAnalyzer();
const report = analyzer.run();

module.exports = { CentersPageAnalyzer, report };