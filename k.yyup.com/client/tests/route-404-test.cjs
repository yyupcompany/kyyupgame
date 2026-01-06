/**
 * 测试特定路由是否返回404
 */

const puppeteer = require('puppeteer')

async function testRoute(url) {
  console.log(`🔍 测试路由: ${url}`)
  
  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // 设置较长的等待时间
    await page.setDefaultTimeout(10000)
    
    // 访问页面
    const response = await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    })
    
    // 等待页面加载
    await page.waitForTimeout(2000)
    
    // 检查页面内容
    const title = await page.title()
    const bodyText = await page.evaluate(() => document.body.innerText)
    
    // 检查是否是404页面
    const is404 = bodyText.includes('404') || 
                  bodyText.includes('页面不存在') ||
                  bodyText.includes('Not Found') ||
                  title.includes('404')
    
    console.log(`📋 页面标题: ${title}`)
    console.log(`🎯 状态码: ${response.status()}`)
    console.log(`❓ 是否404: ${is404 ? '是' : '否'}`)
    
    if (is404) {
      console.log(`❌ 页面返回404错误`)
    } else {
      console.log(`✅ 页面正常加载`)
      
      // 检查是否有具体内容
      const hasContent = bodyText.length > 100 && !bodyText.includes('页面开发中')
      console.log(`📄 内容检查: ${hasContent ? '有实际内容' : '可能是空页面'}`)
    }
    
    await browser.close()
    
    return {
      url,
      status: response.status(),
      title,
      is404,
      hasContent: !is404 && bodyText.length > 100
    }
    
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`)
    return {
      url,
      status: 'error',
      error: error.message,
      is404: true,
      hasContent: false
    }
  }
}

// 测试特定路由
async function main() {
  console.log('🚀 开始测试路由修复效果\n')
  
  const testUrls = [
    'https://k.yyup.cc/dashboard/notification-center',
    'https://k.yyup.cc/dashboard/important-notices'
  ]
  
  for (const url of testUrls) {
    await testRoute(url)
    console.log('-'.repeat(50))
  }
  
  console.log('\n✅ 路由测试完成')
}

main().catch(console.error)