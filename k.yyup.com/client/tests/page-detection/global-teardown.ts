import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 开始全局清理...')
  
  try {
    const fs = await import('fs')
    const path = await import('path')
    const url = await import('url')
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
    
    // 生成最终测试报告摘要
    const reportsDir = path.join(__dirname, 'reports')
    const summaryPath = path.join(reportsDir, 'test-summary.json')
    
    const summary = {
      timestamp: new Date().toISOString(),
      testRun: '页面检测测试完成',
      config: {
        baseURL: config.use?.baseURL,
        projects: config.projects?.map(p => p.name)
      }
    }
    
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
    console.log('📊 测试摘要已生成:', summaryPath)
    
    // 清理临时文件
    console.log('🗑️  清理临时文件...')
    
    console.log('✅ 全局清理完成')
    
  } catch (error) {
    console.error('❌ 全局清理失败:', error)
  }
}

export default globalTeardown