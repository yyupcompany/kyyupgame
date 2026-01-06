import { chromium } from 'playwright';

async function detailedCustomerPoolAnalysis() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🚀 开始客户池页面详细分析...');
    
    // 登录流程
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    try {
      await page.fill('input[placeholder*="用户名"], input[type="text"]', 'admin');
      await page.fill('input[placeholder*="密码"], input[type="password"]', 'admin123');
      await page.click('button:has-text("登录"), button[type="submit"]');
      await page.waitForTimeout(3000);
    } catch (loginError) {
      console.log('⚠️ 登录失败，继续访问...');
    }
    
    // 访问客户池页面
    await page.goto('http://localhost:5173/centers/customer-pool', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const analysis = {
      overview: {},
      customers: {},
      followups: {},
      analytics: {}
    };
    
    // 分析概览标签页（默认显示）
    console.log('📊 分析概览标签页...');
    analysis.overview = await analyzeOverviewTab(page);
    await page.screenshot({ path: 'overview-tab.png', fullPage: true });
    
    // 分析客户管理标签页
    console.log('👥 分析客户管理标签页...');
    await page.click('text=客户管理');
    await page.waitForTimeout(2000);
    analysis.customers = await analyzeCustomersTab(page);
    await page.screenshot({ path: 'customers-tab.png', fullPage: true });
    
    // 分析跟进记录标签页
    console.log('📝 分析跟进记录标签页...');
    await page.click('text=跟进记录');
    await page.waitForTimeout(2000);
    analysis.followups = await analyzeFollowupsTab(page);
    await page.screenshot({ path: 'followups-tab.png', fullPage: true });
    
    // 分析数据分析标签页
    console.log('📈 分析数据分析标签页...');
    await page.click('text=数据分析');
    await page.waitForTimeout(2000);
    analysis.analytics = await analyzeAnalyticsTab(page);
    await page.screenshot({ path: 'analytics-tab.png', fullPage: true });
    
    // 输出完整分析结果
    console.log('\n🎯 客户池中心页面完整分析报告：');
    console.log('='.repeat(60));
    console.log(JSON.stringify(analysis, null, 2));
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 分析失败:', error.message);
  } finally {
    await browser.close();
  }
}

async function analyzeOverviewTab(page) {
  return await page.evaluate(() => {
    const result = {
      title: '',
      description: '',
      statsCards: [],
      charts: [],
      quickActions: []
    };
    
    // 主标题和描述
    const welcomeTitle = document.querySelector('.welcome-content h2');
    const welcomeDesc = document.querySelector('.welcome-content p');
    
    if (welcomeTitle) result.title = welcomeTitle.textContent.trim();
    if (welcomeDesc) result.description = welcomeDesc.textContent.trim();
    
    // 统计卡片
    const statCards = document.querySelectorAll('.stats-section .stat-card, [class*="stat-card"]');
    statCards.forEach(card => {
      const title = card.querySelector('.title, h3, [class*="title"]');
      const value = card.querySelector('.value, [class*="value"]');
      const unit = card.querySelector('.unit, [class*="unit"]');
      const trend = card.querySelector('.trend, [class*="trend"]');
      
      if (title && value) {
        result.statsCards.push({
          title: title.textContent.trim(),
          value: value.textContent.trim(),
          unit: unit ? unit.textContent.trim() : '',
          trend: trend ? trend.textContent.trim() : ''
        });
      }
    });
    
    // 图表信息
    const chartContainers = document.querySelectorAll('.chart-container, [class*="chart"]');
    chartContainers.forEach(chart => {
      const title = chart.querySelector('.chart-title, h3, [class*="title"]');
      const subtitle = chart.querySelector('.chart-subtitle, [class*="subtitle"]');
      
      if (title) {
        result.charts.push({
          title: title.textContent.trim(),
          subtitle: subtitle ? subtitle.textContent.trim() : ''
        });
      }
    });
    
    // 快速操作
    const actionButtons = document.querySelectorAll('.quick-actions button, .primary-actions button, .secondary-actions button');
    actionButtons.forEach(btn => {
      const text = btn.textContent.trim();
      if (text && text.length < 20) {
        result.quickActions.push(text);
      }
    });
    
    return result;
  });
}

async function analyzeCustomersTab(page) {
  return await page.evaluate(() => {
    const result = {
      tableColumns: [],
      hasDetailPanel: false,
      actionButtons: [],
      pagination: false
    };
    
    // 表格列头
    const tableHeaders = document.querySelectorAll('table th, .el-table__header th');
    tableHeaders.forEach(th => {
      const text = th.textContent.trim();
      if (text) result.tableColumns.push(text);
    });
    
    // 检查是否有详情面板
    const detailPanel = document.querySelector('.customer-detail, [class*="detail-panel"]');
    result.hasDetailPanel = !!detailPanel;
    
    // 操作按钮
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      const text = btn.textContent.trim();
      if (text && text.length < 20 && !result.actionButtons.includes(text)) {
        result.actionButtons.push(text);
      }
    });
    
    // 分页信息
    const pagination = document.querySelector('.el-pagination, [class*="pagination"]');
    result.pagination = !!pagination;
    
    return result;
  });
}

async function analyzeFollowupsTab(page) {
  return await page.evaluate(() => {
    const result = {
      tableColumns: [],
      hasDetailPanel: false,
      followupMethods: [],
      followupResults: []
    };
    
    // 表格列头
    const tableHeaders = document.querySelectorAll('table th, .el-table__header th');
    tableHeaders.forEach(th => {
      const text = th.textContent.trim();
      if (text) result.tableColumns.push(text);
    });
    
    // 检查详情面板
    const detailPanel = document.querySelector('.followup-detail, [class*="detail-panel"]');
    result.hasDetailPanel = !!detailPanel;
    
    // 跟进方式和结果（从数据中提取）
    const methodTags = document.querySelectorAll('[class*="followup-method"] .el-tag, .followup-method');
    methodTags.forEach(tag => {
      const text = tag.textContent.trim();
      if (text && !result.followupMethods.includes(text)) {
        result.followupMethods.push(text);
      }
    });
    
    const resultTags = document.querySelectorAll('[class*="followup-result"] .el-tag, .followup-result');
    resultTags.forEach(tag => {
      const text = tag.textContent.trim();
      if (text && !result.followupResults.includes(text)) {
        result.followupResults.push(text);
      }
    });
    
    return result;
  });
}

async function analyzeAnalyticsTab(page) {
  return await page.evaluate(() => {
    const result = {
      analyticsStats: [],
      charts: [],
      actions: []
    };
    
    // 分析统计卡片
    const statCards = document.querySelectorAll('.analytics-stats .stat-card, [class*="stat-card"]');
    statCards.forEach(card => {
      const title = card.querySelector('.title, h3, [class*="title"]');
      const value = card.querySelector('.value, [class*="value"]');
      const unit = card.querySelector('.unit, [class*="unit"]');
      
      if (title && value) {
        result.analyticsStats.push({
          title: title.textContent.trim(),
          value: value.textContent.trim(),
          unit: unit ? unit.textContent.trim() : ''
        });
      }
    });
    
    // 分析图表
    const chartContainers = document.querySelectorAll('.analytics-charts .chart-container, [class*="chart"]');
    chartContainers.forEach(chart => {
      const title = chart.querySelector('.chart-title, h3, [class*="title"]');
      const subtitle = chart.querySelector('.chart-subtitle, [class*="subtitle"]');
      
      if (title) {
        result.charts.push({
          title: title.textContent.trim(),
          subtitle: subtitle ? subtitle.textContent.trim() : ''
        });
      }
    });
    
    // 分析操作按钮
    const actionButtons = document.querySelectorAll('.analytics-actions button');
    actionButtons.forEach(btn => {
      const text = btn.textContent.trim();
      if (text) result.actions.push(text);
    });
    
    return result;
  });
}

// 运行分析
detailedCustomerPoolAnalysis().catch(console.error);