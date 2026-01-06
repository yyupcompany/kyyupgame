import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 启动全局Playwright页面检测设置...')
  
  // 启动浏览器进行预热检查
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // 检查应用是否可访问
    console.log('🔍 检查应用可访问性...')
    await page.goto(config.use?.baseURL || 'http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    })
    
    // 检查登录页面
    const loginVisible = await page.locator('form').isVisible()
    if (loginVisible) {
      console.log('✅ 应用访问正常，登录页面可见')
    } else {
      console.log('⚠️  登录页面不可见，可能需要检查')
    }
    
    // 创建测试报告目录
    const fs = await import('fs')
    const path = await import('path')
    const url = await import('url')
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
    const reportsDir = path.join(__dirname, 'reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }
    
    console.log('✅ 全局设置完成')
    
  } catch (error) {
    console.error('❌ 全局设置失败:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup