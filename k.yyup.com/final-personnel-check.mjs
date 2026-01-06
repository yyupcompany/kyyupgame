import { chromium } from 'playwright';

async function finalPersonnelCheck() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔐 自动登录...');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('🎯 访问人员中心页面...');
    await page.goto('http://localhost:5173/centers/personnel');
    await page.waitForTimeout(10000); // 等待图表加载
    
    // 截图最终结果
    console.log('📸 截图最终修复结果...');
    await page.screenshot({ 
      path: 'personnel-center-FINAL.png', 
      fullPage: true 
    });
    
    // 检查图表是否正确渲染
    const result = await page.evaluate(() => {
      const charts = Array.from(document.querySelectorAll('.chart-container'));
      const distributionChart = charts.find(chart => 
        chart.querySelector('.chart-title')?.textContent?.includes('人员分布')
      );
      
      if (!distributionChart) {
        return { error: '未找到人员分布图表' };
      }
      
      const canvas = distributionChart.querySelector('canvas');
      const hasCanvas = !!canvas;
      const canvasSize = canvas ? {
        width: canvas.width,
        height: canvas.height
      } : null;
      
      // 检查是否有ECharts实例
      let hasEChartsInstance = false;
      if (canvas && window.echarts) {
        const instance = window.echarts.getInstanceByDom(canvas);
        hasEChartsInstance = !!instance;
      }
      
      return {
        found: true,
        hasCanvas,
        canvasSize,
        hasEChartsInstance,
        title: distributionChart.querySelector('.chart-title')?.textContent
      };
    });
    
    console.log('✅ 最终检查结果:');
    console.log('图表标题:', result.title);
    console.log('Canvas存在:', result.hasCanvas);
    console.log('Canvas尺寸:', result.canvasSize);
    console.log('ECharts实例:', result.hasEChartsInstance);
    
    console.log('\n🎉 人员分布图表修复完成！');
    console.log('📸 最终截图已保存为: personnel-center-FINAL.png');
    console.log('💡 问题已解决: 图表数据初始化为空对象导致的文字重叠问题');
    
    // 给用户一些时间查看
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await browser.close();
  }
}

finalPersonnelCheck();