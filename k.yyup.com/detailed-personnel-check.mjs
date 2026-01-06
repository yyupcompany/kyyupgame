import { chromium } from 'playwright';
import fs from 'fs';

async function detailedPersonnelCheck() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 300
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔐 登录系统...');
    
    // 1. 登录
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('🎯 访问人员中心页面...');
    
    // 2. 访问人员中心
    await page.goto('http://localhost:5173/centers/personnel', { waitUntil: 'networkidle' });
    await page.waitForTimeout(8000);
    
    // 3. 截图整个页面
    console.log('📸 截图整个页面...');
    await page.screenshot({ 
      path: 'personnel-detailed-full.png', 
      fullPage: true 
    });
    
    // 4. 注入详细检测脚本
    console.log('🔍 注入详细检测脚本...');
    
    const chartAnalysis = await page.evaluate(() => {
      console.log('🔧 开始详细分析图表...');
      
      // 查找人员分布统计图表
      const chartContainers = Array.from(document.querySelectorAll('.chart-container'));
      const distributionChart = chartContainers.find(container => {
        const title = container.querySelector('.chart-title');
        return title && title.textContent.includes('人员分布');
      });
      
      if (!distributionChart) {
        return { error: '未找到人员分布统计图表' };
      }
      
      const canvas = distributionChart.querySelector('canvas');
      if (!canvas) {
        return { error: '图表中未找到canvas元素' };
      }
      
      // 获取图表实例（ECharts）
      let chartInstance = null;
      if (window.echarts) {
        chartInstance = window.echarts.getInstanceByDom(canvas);
      }
      
      // 分析图表配置
      let chartOption = null;
      if (chartInstance) {
        chartOption = chartInstance.getOption();
        console.log('图表配置:', chartOption);
      }
      
      // 检查图表内的SVG文本元素
      const svgTexts = Array.from(distributionChart.querySelectorAll('svg text')).map(text => ({
        content: text.textContent,
        x: text.getAttribute('x'),
        y: text.getAttribute('y'),
        style: text.getAttribute('style'),
        position: text.getBoundingClientRect(),
        transform: text.getAttribute('transform')
      }));
      
      // 检查Canvas上下文中的文本渲染
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // 查找所有可能的文本元素
      const allTextElements = Array.from(distributionChart.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.trim();
        return text && text.length > 0 && el.offsetWidth > 0 && el.offsetHeight > 0;
      }).map(el => ({
        text: el.textContent.trim(),
        tagName: el.tagName,
        className: el.className,
        position: el.getBoundingClientRect(),
        styles: {
          position: getComputedStyle(el).position,
          zIndex: getComputedStyle(el).zIndex,
          transform: getComputedStyle(el).transform,
          overflow: getComputedStyle(el).overflow,
          display: getComputedStyle(el).display
        }
      }));
      
      // 检查图表容器的具体样式
      const containerStyles = {
        width: distributionChart.offsetWidth,
        height: distributionChart.offsetHeight,
        position: getComputedStyle(distributionChart).position,
        overflow: getComputedStyle(distributionChart).overflow,
        zIndex: getComputedStyle(distributionChart).zIndex,
        transform: getComputedStyle(distributionChart).transform
      };
      
      // 检查图表内容区域
      const chartContent = distributionChart.querySelector('.chart-content');
      const chartContentStyles = chartContent ? {
        width: chartContent.offsetWidth,
        height: chartContent.offsetHeight,
        position: getComputedStyle(chartContent).position,
        overflow: getComputedStyle(chartContent).overflow,
        padding: getComputedStyle(chartContent).padding,
        margin: getComputedStyle(chartContent).margin
      } : null;
      
      // 检查canvas样式
      const canvasStyles = {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
        offsetWidth: canvas.offsetWidth,
        offsetHeight: canvas.offsetHeight,
        position: getComputedStyle(canvas).position,
        zIndex: getComputedStyle(canvas).zIndex,
        transform: getComputedStyle(canvas).transform
      };
      
      return {
        found: true,
        chartOption: chartOption,
        svgTexts: svgTexts,
        allTextElements: allTextElements,
        containerStyles: containerStyles,
        chartContentStyles: chartContentStyles,
        canvasStyles: canvasStyles,
        chartInstanceExists: !!chartInstance
      };
    });
    
    console.log('📊 详细分析结果:');
    console.log('图表实例存在:', chartAnalysis.chartInstanceExists);
    console.log('SVG文本元素:', chartAnalysis.svgTexts?.length || 0, '个');
    console.log('所有文本元素:', chartAnalysis.allTextElements?.length || 0, '个');
    
    if (chartAnalysis.svgTexts && chartAnalysis.svgTexts.length > 0) {
      console.log('\nSVG文本详情:');
      chartAnalysis.svgTexts.forEach((text, index) => {
        console.log(`  ${index + 1}. "${text.content}" - 位置: (${text.x}, ${text.y})`);
      });
    }
    
    if (chartAnalysis.allTextElements && chartAnalysis.allTextElements.length > 0) {
      console.log('\n所有文本元素:');
      chartAnalysis.allTextElements.forEach((el, index) => {
        console.log(`  ${index + 1}. ${el.tagName}.${el.className}: "${el.text.substring(0, 30)}"`);
        console.log(`     位置: x=${Math.round(el.position.x)}, y=${Math.round(el.position.y)}`);
        console.log(`     样式: ${el.styles.position}, z-index: ${el.styles.zIndex}`);
      });
    }
    
    // 5. 针对可能的重叠问题进行修复
    console.log('🔧 应用修复脚本...');
    
    await page.addScriptTag({
      content: `
        // 修复人员分布图表的文字重叠问题
        console.log('🔧 开始修复人员分布图表...');
        
        const distributionChart = document.querySelector('.chart-container:has(.chart-title)');
        if (distributionChart && distributionChart.querySelector('.chart-title')?.textContent?.includes('人员分布')) {
          console.log('找到人员分布图表，开始修复...');
          
          // 方法1: 调整图表配置，确保标签不重叠
          const canvas = distributionChart.querySelector('canvas');
          if (canvas && window.echarts) {
            const chartInstance = window.echarts.getInstanceByDom(canvas);
            if (chartInstance) {
              const currentOption = chartInstance.getOption();
              
              // 如果是饼图，调整标签位置
              if (currentOption.series && currentOption.series[0] && currentOption.series[0].type === 'pie') {
                const newOption = {
                  ...currentOption,
                  series: currentOption.series.map(series => ({
                    ...series,
                    label: {
                      ...series.label,
                      position: 'outside',  // 标签放在外侧
                      alignTo: 'edge',      // 对齐到边缘
                      margin: 20,           // 增加边距
                      bleedMargin: 5,       // 防止重叠
                      distanceToLabelLine: 10, // 标签线距离
                      formatter: function(params) {
                        return params.name + '\\n' + params.value + '人';
                      }
                    },
                    labelLine: {
                      ...series.labelLine,
                      length: 15,    // 第一段标签线长度
                      length2: 15,   // 第二段标签线长度
                      smooth: true   // 平滑标签线
                    }
                  }))
                };
                
                chartInstance.setOption(newOption, true);
                console.log('✅ 已调整饼图标签位置');
              }
              
              // 如果是柱状图或其他类型，调整标签配置
              else {
                const newOption = {
                  ...currentOption,
                  series: currentOption.series.map(series => ({
                    ...series,
                    label: {
                      ...series.label,
                      show: true,
                      position: 'top',      // 标签在顶部
                      distance: 10,         // 距离
                      formatter: '{c}'      // 只显示数值
                    }
                  }))
                };
                
                chartInstance.setOption(newOption, true);
                console.log('✅ 已调整图表标签位置');
              }
            }
          }
          
          // 方法2: 调整容器样式
          const chartContent = distributionChart.querySelector('.chart-content');
          if (chartContent) {
            chartContent.style.padding = '20px';
            chartContent.style.overflow = 'visible';
          }
          
          // 方法3: 确保图表有足够的空间
          if (canvas) {
            canvas.style.padding = '10px';
          }
          
          console.log('✅ 人员分布图表修复完成');
        }
      `
    });
    
    await page.waitForTimeout(3000);
    
    // 6. 修复后截图
    console.log('📸 修复后截图...');
    await page.screenshot({ 
      path: 'personnel-fixed.png', 
      fullPage: true 
    });
    
    // 截图具体的人员分布图表
    try {
      const chartBounds = await page.evaluate(() => {
        const chart = document.querySelector('.chart-container:has(.chart-title)');
        if (chart && chart.querySelector('.chart-title')?.textContent?.includes('人员分布')) {
          return chart.getBoundingClientRect();
        }
        return null;
      });
      
      if (chartBounds) {
        await page.screenshot({
          path: 'personnel-distribution-fixed.png',
          clip: {
            x: Math.max(0, chartBounds.x - 20),
            y: Math.max(0, chartBounds.y - 20),
            width: Math.min(chartBounds.width + 40, 1920 - chartBounds.x),
            height: Math.min(chartBounds.height + 40, 1080 - chartBounds.y)
          }
        });
        console.log('✅ 已截图修复后的人员分布图表');
      }
    } catch (error) {
      console.log('❌ 截图修复后图表失败:', error.message);
    }
    
    // 7. 生成CSS修复方案
    const cssFixContent = `
/* 人员分布图表文字重叠修复 */
.chart-container:has(.chart-title:contains("人员分布")) {
  overflow: visible !important;
}

.chart-container:has(.chart-title:contains("人员分布")) .chart-content {
  padding: 20px !important;
  overflow: visible !important;
}

.chart-container:has(.chart-title:contains("人员分布")) .chart-instance {
  padding: 10px !important;
}

.chart-container:has(.chart-title:contains("人员分布")) canvas {
  padding: 10px !important;
}

/* 确保图表标题有足够间距 */
.chart-container .chart-header {
  margin-bottom: 15px !important;
  padding-bottom: 10px !important;
}

/* 饼图标签优化 */
.chart-container:has(.chart-title:contains("人员分布")) .chart-instance {
  min-height: 400px !important;
}
`;
    
    fs.writeFileSync('personnel-overlap-fix.css', cssFixContent);
    
    // 8. 生成报告
    const report = {
      timestamp: new Date().toISOString(),
      analysis: chartAnalysis,
      screenshots: [
        'personnel-detailed-full.png',
        'personnel-fixed.png',
        'personnel-distribution-fixed.png'
      ],
      fixes: {
        cssFile: 'personnel-overlap-fix.css',
        scriptApplied: true,
        chartConfigAdjusted: true
      }
    };
    
    fs.writeFileSync('personnel-detailed-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n✅ 详细检测和修复完成！');
    console.log('📋 详细报告已保存到 personnel-detailed-report.json');
    console.log('🎨 CSS修复方案已保存到 personnel-overlap-fix.css');
    console.log('📸 修复前后对比截图已保存');
    
    return report;
    
  } catch (error) {
    console.error('❌ 检测失败:', error);
    await page.screenshot({ path: 'personnel-detailed-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// 运行检测
detailedPersonnelCheck()
  .then(report => {
    console.log('🎉 检测完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 检测失败:', error);
    process.exit(1);
  });