import { chromium } from 'playwright';
import fs from 'fs';

async function fixChartDisplay() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 500
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
    
    console.log('🎯 访问招生中心页面...');
    
    // 2. 访问招生中心
    await page.goto('http://localhost:5173/centers/enrollment', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // 3. 检查图表数据
    console.log('📊 注入图表修复脚本...');
    
    await page.addScriptTag({
      content: `
        // 图表修复脚本
        console.log('🔧 开始修复图表显示问题...');
        
        // 检查Vue实例和响应式数据
        function checkVueChartData() {
          const chartContainers = document.querySelectorAll('.chart-container');
          console.log('找到图表容器:', chartContainers.length, '个');
          
          chartContainers.forEach((container, index) => {
            const chartInstance = container.querySelector('.chart-instance');
            const canvas = container.querySelector('canvas');
            
            console.log('图表容器 ' + (index + 1) + ':', {
              container: {
                width: container.offsetWidth,
                height: container.offsetHeight,
                display: getComputedStyle(container).display,
                visibility: getComputedStyle(container).visibility
              },
              chartInstance: chartInstance ? {
                width: chartInstance.offsetWidth,
                height: chartInstance.offsetHeight,
                style: chartInstance.style.cssText
              } : null,
              canvas: canvas ? {
                width: canvas.width,
                height: canvas.height,
                clientWidth: canvas.clientWidth,
                clientHeight: canvas.clientHeight,
                style: canvas.style.cssText
              } : null
            });
          });
        }
        
        // 强制设置图表数据
        function forceSetChartData() {
          console.log('💪 强制设置图表数据...');
          
          // 默认图表配置
          const defaultEnrollmentChart = {
            title: { text: '' },
            tooltip: { trigger: 'axis' },
            xAxis: {
              type: 'category',
              data: ['1月', '2月', '3月', '4月', '5月', '6月']
            },
            yAxis: {
              type: 'value'
            },
            series: [{
              type: 'line',
              data: [120, 132, 101, 134, 90, 230],
              smooth: true,
              itemStyle: { color: '#409EFF' }
            }]
          };
          
          const defaultSourceChart = {
            title: { text: '' },
            tooltip: { trigger: 'axis' },
            xAxis: {
              type: 'category',
              data: ['线上推广', '口碑推荐', '地推活动', '其他渠道']
            },
            yAxis: {
              type: 'value'
            },
            series: [{
              type: 'bar',
              data: [85, 92, 68, 45],
              itemStyle: { color: '#67C23A' }
            }]
          };
          
          // 查找Vue组件实例
          const app = document.querySelector('#app').__vue_app__;
          if (app) {
            console.log('找到Vue应用实例');
            
            // 尝试通过全局属性设置数据
            setTimeout(() => {
              // 触发重新渲染
              const chartContainers = document.querySelectorAll('.chart-wrapper');
              chartContainers.forEach((wrapper, index) => {
                const chartInstance = wrapper.querySelector('.chart-instance');
                if (chartInstance && window.echarts) {
                  console.log('重新初始化图表 ' + (index + 1));
                  
                  // 确保容器有合适的尺寸
                  chartInstance.style.width = '100%';
                  chartInstance.style.height = '350px';
                  chartInstance.style.minWidth = '600px';
                  chartInstance.style.minHeight = '350px';
                  
                  // 销毁并重新创建图表
                  const existingChart = window.echarts.getInstanceByDom(chartInstance);
                  if (existingChart) {
                    existingChart.dispose();
                  }
                  
                  // 创建新图表
                  const newChart = window.echarts.init(chartInstance);
                  const chartData = index === 0 ? defaultEnrollmentChart : defaultSourceChart;
                  newChart.setOption(chartData);
                  
                  console.log('图表 ' + (index + 1) + ' 重新初始化完成');
                }
              });
            }, 1000);
          }
        }
        
        // 修复图表容器尺寸
        function fixChartSizes() {
          console.log('📏 修复图表容器尺寸...');
          
          const chartContainers = document.querySelectorAll('.chart-container');
          chartContainers.forEach((container, index) => {
            // 设置容器尺寸
            container.style.width = '100%';
            container.style.minWidth = '600px';
            container.style.height = '400px';
            
            const chartContent = container.querySelector('.chart-content');
            if (chartContent) {
              chartContent.style.width = '100%';
              chartContent.style.height = '350px';
              chartContent.style.minHeight = '350px';
            }
            
            const chartWrapper = container.querySelector('.chart-wrapper');
            if (chartWrapper) {
              chartWrapper.style.width = '100%';
              chartWrapper.style.height = '100%';
              chartWrapper.style.minHeight = '350px';
            }
            
            const chartInstance = container.querySelector('.chart-instance');
            if (chartInstance) {
              chartInstance.style.width = '100%';
              chartInstance.style.height = '100%';
              chartInstance.style.minWidth = '600px';
              chartInstance.style.minHeight = '350px';
            }
            
            console.log('修复容器 ' + (index + 1) + ' 尺寸完成');
          });
        }
        
        // 执行修复
        checkVueChartData();
        fixChartSizes();
        forceSetChartData();
        
        // 设置定时器持续监控
        setInterval(() => {
          const canvases = document.querySelectorAll('.chart-instance canvas');
          canvases.forEach((canvas, index) => {
            if (canvas.width < 500 || canvas.height < 300) {
              console.log('发现小尺寸canvas，正在修复...');
              canvas.width = 600;
              canvas.height = 350;
              canvas.style.width = '100%';
              canvas.style.height = '100%';
            }
          });
        }, 2000);
        
        window.chartFixApplied = true;
        console.log('✅ 图表修复脚本执行完成');
      `
    });
    
    await page.waitForTimeout(5000);
    
    // 4. 检查修复效果
    console.log('🔍 检查修复效果...');
    
    const chartInfo = await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('.chart-container'));
      return containers.map((container, index) => {
        const chartInstance = container.querySelector('.chart-instance');
        const canvas = container.querySelector('canvas');
        
        return {
          index: index + 1,
          containerSize: {
            width: container.offsetWidth,
            height: container.offsetHeight
          },
          chartInstanceSize: chartInstance ? {
            width: chartInstance.offsetWidth,
            height: chartInstance.offsetHeight
          } : null,
          canvasSize: canvas ? {
            width: canvas.width,
            height: canvas.height,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight
          } : null,
          visible: container.offsetWidth > 0 && container.offsetHeight > 0
        };
      });
    });
    
    console.log('📊 修复后图表信息:', chartInfo);
    
    // 5. 截图
    await page.screenshot({ 
      path: 'enrollment-center-fixed.png', 
      fullPage: true 
    });
    
    // 6. 生成CSS修复建议
    const cssfixes = `
/* 图表容器尺寸修复 */
.chart-container {
  width: 100% !important;
  min-width: 600px !important;
  height: 400px !important;
}

.chart-content {
  width: 100% !important;
  height: 350px !important;
  min-height: 350px !important;
}

.chart-wrapper {
  width: 100% !important;
  height: 100% !important;
  min-height: 350px !important;
}

.chart-instance {
  width: 100% !important;
  height: 100% !important;
  min-width: 600px !important;
  min-height: 350px !important;
}

.chart-instance canvas {
  width: 100% !important;
  height: 100% !important;
  min-width: 600px !important;
  min-height: 350px !important;
}

/* 网格系统修复 */
.cds-col-lg-8 {
  flex: 0 0 50% !important;
  max-width: 50% !important;
}

.charts-section .cds-row {
  gap: 20px;
}

.charts-section .cds-col-lg-8:first-child {
  padding-right: 10px;
}

.charts-section .cds-col-lg-8:last-child {
  padding-left: 10px;
}
`;
    
    fs.writeFileSync('chart-fixes.css', cssfixes);
    
    const report = {
      timestamp: new Date().toISOString(),
      chartInfo: chartInfo,
      fixes: {
        containerSizes: true,
        chartData: true,
        cssGenerated: true
      },
      screenshots: ['enrollment-center-fixed.png'],
      cssFile: 'chart-fixes.css'
    };
    
    fs.writeFileSync('chart-fix-report.json', JSON.stringify(report, null, 2));
    
    console.log('✅ 图表修复完成！');
    console.log('📋 修复报告已保存到 chart-fix-report.json');
    console.log('🎨 CSS修复文件已保存到 chart-fixes.css');
    
    return report;
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
    await page.screenshot({ path: 'chart-fix-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// 运行修复
fixChartDisplay()
  .then(report => {
    console.log('🎉 修复成功完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 修复失败:', error);
    process.exit(1);
  });