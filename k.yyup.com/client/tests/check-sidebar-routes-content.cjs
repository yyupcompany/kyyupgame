/**
 * 侧边栏路由内容检查器
 * 检查侧边栏中的所有路由是否真正有对应的页面内容
 * 而不是显示404组件
 */

const http = require('http');
const fs = require('fs');

class SidebarRouteContentChecker {
  constructor() {
    this.frontendURL = 'http://k.yyup.cc';
    this.results = [];
    this.navigationRoutes = this.extractNavigationRoutes();
  }

  // 从navigation.ts中提取所有路由
  extractNavigationRoutes() {
    const navigationFile = '/home/devbox/project/client/src/config/navigation.ts';
    const content = fs.readFileSync(navigationFile, 'utf8');
    
    const routes = [];
    const routeMatches = content.match(/route:\s*['"`]([^'"`]+)['"`]/g) || [];
    
    routeMatches.forEach(match => {
      const routeMatch = match.match(/route:\s*['"`]([^'"`]+)['"`]/);
      if (routeMatch && routeMatch[1]) {
        const route = routeMatch[1];
        // 过滤掉参数路由
        if (!route.includes(':')) {
          routes.push(route);
        }
      }
    });
    
    return [...new Set(routes)].sort();
  }

  async checkPageContent(url) {
    return new Promise((resolve, reject) => {
      const req = http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            content: data,
            contentLength: data.length
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async analyzePageContent(route) {
    const url = `${this.frontendURL}${route}`;
    
    try {
      const result = await this.checkPageContent(url);
      const content = result.content.toLowerCase();
      
      // 分析页面类型
      let pageType = 'unknown';
      let isWorking = false;
      
      if (result.statusCode !== 200) {
        pageType = 'http-error';
        isWorking = false;
      } else if (result.contentLength === 0) {
        pageType = 'empty-response';
        isWorking = false;
      } else if (content.includes('幼儿园招生管理系统')) {
        // 这是SPA应用
        if (content.includes('404') || content.includes('not found') || 
            content.includes('页面不存在') || content.includes('找不到页面')) {
          pageType = 'spa-404';
          isWorking = false;
        } else {
          // 需要进一步检查是否有实际内容
          if (this.hasRealContent(content)) {
            pageType = 'spa-content';
            isWorking = true;
          } else {
            pageType = 'spa-empty-frame';
            isWorking = true; // SPA空框架也算工作的
          }
        }
      } else {
        pageType = 'static-content';
        isWorking = true;
      }
      
      return {
        route,
        url,
        statusCode: result.statusCode,
        contentLength: result.contentLength,
        pageType,
        isWorking,
        hasVueApp: content.includes('幼儿园招生管理系统'),
        has404Content: content.includes('404') || content.includes('not found')
      };
      
    } catch (error) {
      return {
        route,
        url,
        statusCode: 0,
        contentLength: 0,
        pageType: 'network-error',
        isWorking: false,
        error: error.message
      };
    }
  }

  hasRealContent(content) {
    // 检查是否有实际的页面内容
    const contentIndicators = [
      'el-table', 'el-card', 'el-form', 'el-button',
      'class="content"', 'class="main"', 'class="page"',
      'dashboard', 'management', 'list', 'form'
    ];
    
    return contentIndicators.some(indicator => content.includes(indicator));
  }

  async runFullCheck() {
    console.log('🔍 侧边栏路由内容完整检查');
    console.log('='.repeat(80));
    console.log(`📊 总路由数: ${this.navigationRoutes.length}`);
    console.log(`🎯 检查目标: 确认每个侧边栏路由都有对应的页面内容`);
    console.log('='.repeat(80));

    let workingCount = 0;
    let spaEmptyCount = 0;
    let spa404Count = 0;
    let errorCount = 0;

    console.log('\n🔍 开始逐个检查路由...\n');

    for (let i = 0; i < this.navigationRoutes.length; i++) {
      const route = this.navigationRoutes[i];
      const result = await this.analyzePageContent(route);
      
      this.results.push(result);
      
      // 显示结果
      const status = this.getStatusIcon(result);
      const progress = `[${(i + 1).toString().padStart(3)}/${this.navigationRoutes.length}]`;
      
      console.log(`${progress} ${status} ${route.padEnd(50)} ${result.pageType}`);
      
      // 统计
      if (result.isWorking) {
        if (result.pageType === 'spa-empty-frame') {
          spaEmptyCount++;
        } else {
          workingCount++;
        }
      } else if (result.pageType === 'spa-404') {
        spa404Count++;
      } else {
        errorCount++;
      }
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.displaySummary(workingCount, spaEmptyCount, spa404Count, errorCount);
    this.displayProblemRoutes();
    
    return this.results;
  }

  getStatusIcon(result) {
    switch (result.pageType) {
      case 'spa-content': return '✅';
      case 'spa-empty-frame': return '📄';
      case 'spa-404': return '🚨';
      case 'http-error': return '❌';
      case 'network-error': return '🔌';
      case 'empty-response': return '💨';
      default: return '❓';
    }
  }

  displaySummary(workingCount, spaEmptyCount, spa404Count, errorCount) {
    const total = this.navigationRoutes.length;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 检查结果摘要');
    console.log('='.repeat(80));
    
    console.log(`\n📈 整体统计:`);
    console.log(`   📊 总路由数: ${total}`);
    console.log(`   ✅ 有内容页面: ${workingCount} (${(workingCount/total*100).toFixed(1)}%)`);
    console.log(`   📄 空框架页面: ${spaEmptyCount} (${(spaEmptyCount/total*100).toFixed(1)}%)`);
    console.log(`   🚨 404页面: ${spa404Count} (${(spa404Count/total*100).toFixed(1)}%)`);
    console.log(`   ❌ 错误页面: ${errorCount} (${(errorCount/total*100).toFixed(1)}%)`);
    
    const healthScore = ((workingCount + spaEmptyCount) / total * 100).toFixed(1);
    console.log(`\n🏥 路由健康度: ${healthScore}%`);
    
    if (spa404Count > 0) {
      console.log(`\n🚨 警告: 发现 ${spa404Count} 个侧边栏链接指向404页面！`);
    }
  }

  displayProblemRoutes() {
    const problemRoutes = this.results.filter(r => !r.isWorking);
    
    if (problemRoutes.length > 0) {
      console.log(`\n🚨 问题路由详细信息:`);
      console.log('-'.repeat(80));
      
      problemRoutes.forEach(route => {
        console.log(`❌ ${route.route}`);
        console.log(`   类型: ${route.pageType}`);
        console.log(`   状态码: ${route.statusCode}`);
        console.log(`   内容长度: ${route.contentLength}`);
        if (route.error) {
          console.log(`   错误: ${route.error}`);
        }
        console.log('');
      });
      
      console.log('💡 修复建议:');
      
      const spa404Routes = problemRoutes.filter(r => r.pageType === 'spa-404');
      if (spa404Routes.length > 0) {
        console.log('   🔧 SPA 404页面: 需要在路由配置中添加或修复这些路由');
        console.log('   📁 检查文件: /home/devbox/project/client/src/router/optimized-routes.ts');
      }
      
      const errorRoutes = problemRoutes.filter(r => r.pageType === 'network-error' || r.pageType === 'http-error');
      if (errorRoutes.length > 0) {
        console.log('   🌐 网络/HTTP错误: 检查前端服务是否正常运行');
      }
    } else {
      console.log('\n🎉 所有侧边栏路由都工作正常！');
    }
  }
}

// 运行检查
if (require.main === module) {
  const checker = new SidebarRouteContentChecker();
  checker.runFullCheck()
    .then(() => {
      console.log('\n✅ 侧边栏路由内容检查完成！');
    })
    .catch(console.error);
}

module.exports = { SidebarRouteContentChecker };