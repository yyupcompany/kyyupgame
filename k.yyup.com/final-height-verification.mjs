import { chromium } from 'playwright';

async function finalHeightVerification() {
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
    console.log('🔐 登录系统...');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('🎯 访问人员中心页面...');
    await page.goto('http://localhost:5173/centers/personnel');
    await page.waitForTimeout(8000);
    
    // 截图最终效果
    console.log('📸 截图最终效果...');
    await page.screenshot({ 
      path: 'personnel-final-height.png', 
      fullPage: true 
    });
    
    // 检查所有高度
    const finalCheck = await page.evaluate(() => {
      const charts = Array.from(document.querySelectorAll('.chart-container'));
      
      return charts.map((chart, index) => {
        const title = chart.querySelector('.chart-title')?.textContent || `图表${index + 1}`;
        const chartContent = chart.querySelector('.chart-content');
        const chartInstance = chart.querySelector('.chart-instance');
        const canvas = chart.querySelector('canvas');
        
        return {
          title,
          container: {
            height: chart.offsetHeight,
            computedHeight: getComputedStyle(chart).height,
            minHeight: getComputedStyle(chart).minHeight
          },
          content: chartContent ? {
            height: chartContent.offsetHeight,
            computedHeight: getComputedStyle(chartContent).height,
            minHeight: getComputedStyle(chartContent).minHeight
          } : null,
          instance: chartInstance ? {
            height: chartInstance.offsetHeight,
            computedHeight: getComputedStyle(chartInstance).height,
            minHeight: getComputedStyle(chartInstance).minHeight
          } : null,
          canvas: canvas ? {
            width: canvas.width,
            height: canvas.height,
            offsetHeight: canvas.offsetHeight
          } : null
        };
      });
    });
    
    console.log('\n📊 最终图表高度检查:');
    finalCheck.forEach(chart => {
      console.log(`\n${chart.title}:`);
      console.log(`  📦 容器: ${chart.container.height}px (最小: ${chart.container.minHeight})`);
      if (chart.content) {
        console.log(`  📄 内容: ${chart.content.height}px (最小: ${chart.content.minHeight})`);
      }
      if (chart.instance) {
        console.log(`  📊 实例: ${chart.instance.height}px (最小: ${chart.instance.minHeight})`);
      }
      if (chart.canvas) {
        console.log(`  🎨 Canvas: ${chart.canvas.width}×${chart.canvas.height}px`);
      }
    });
    
    // 检查高度是否满足要求
    const heightRequirementMet = finalCheck.every(chart => 
      chart.container.height >= 480 && 
      (chart.instance ? chart.instance.height >= 480 : true)
    );
    
    console.log(`\n✅ 高度要求满足: ${heightRequirementMet ? '是' : '否'}`);
    
    if (heightRequirementMet) {
      console.log('🎉 人员中心图表高度修复完成！');
      console.log('📈 图表现在有足够空间显示完整内容');
      console.log('📸 最终效果截图: personnel-final-height.png');
    } else {
      console.log('⚠️ 图表高度可能还需要进一步调整');
    }
    
    // 给用户查看时间
    await page.waitForTimeout(8000);
    
  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    await browser.close();
  }
}

finalHeightVerification();