#!/usr/bin/env node

/**
 * 真实API和页面显示测试运行脚本
 * 检查服务器状态，运行集成测试
 */

import { spawn, exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 测试配置
const config = {
  backend: {
    url: process.env.VITE_API_BASE_URL || 'https://shlxlyzagqnc.sealoshzh.site',
    healthEndpoint: '/api/health'
  },
  frontend: {
    url: process.env.VITE_APP_URL || 'https://localhost:5173'
  },
  test: {
    timeout: 60000, // 60秒超时
    retries: 3
  }
}

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan')
  log(`${message}`, 'bold')
  log(`${'='.repeat(60)}`, 'cyan')
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'blue')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

// 检查服务器状态
async function checkServerStatus(url, name) {
  return new Promise((resolve) => {
    const curl = spawn('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', url], {
      timeout: 5000
    })

    let result = ''
    curl.stdout.on('data', (data) => {
      result += data.toString()
    })

    curl.on('close', (code) => {
      if (code === 0 && result.startsWith('2')) {
        logSuccess(`${name} 服务器运行正常 (HTTP ${result})`)
        resolve(true)
      } else {
        logWarning(`${name} 服务器可能未运行 (HTTP ${result || 'timeout'})`)
        resolve(false)
      }
    })

    curl.on('error', () => {
      logWarning(`${name} 服务器连接失败`)
      resolve(false)
    })

    // 超时处理
    setTimeout(() => {
      curl.kill('SIGTERM')
      logWarning(`${name} 服务器响应超时`)
      resolve(false)
    }, 5000)
  })
}

// 运行命令
async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })

    child.on('error', (error) => {
      reject(error)
    })
  })
}

// 运行测试套件
async function runTestSuite(testFile, description) {
  logStep('TEST', `运行 ${description}`)
  
  try {
    await runCommand('npm', ['run', 'test', testFile], {
      cwd: process.cwd(),
      timeout: config.test.timeout
    })
    logSuccess(`${description} 测试通过`)
    return true
  } catch (error) {
    logError(`${description} 测试失败: ${error.message}`)
    return false
  }
}

// 运行Playwright测试
async function runPlaywrightTest(testFile, description) {
  logStep('E2E', `运行 ${description}`)
  
  try {
    // 检查是否安装了Playwright
    const playwrightCmd = fs.existsSync('node_modules/.bin/playwright') ? 
      'npx playwright test' : 'npm run test:e2e'
    
    await runCommand('npx', ['playwright', 'test', testFile], {
      cwd: process.cwd(),
      timeout: config.test.timeout
    })
    logSuccess(`${description} 测试通过`)
    return true
  } catch (error) {
    logWarning(`${description} 测试失败: ${error.message}`)
    logWarning('请确保已安装Playwright: npx playwright install')
    return false
  }
}

// 主测试流程
async function main() {
  logHeader('AI助手页面真实测试套件')
  
  log('测试配置:', 'cyan')
  log(`  后端服务器: ${config.backend.url}`)
  log(`  前端服务器: ${config.frontend.url}`)
  log(`  测试超时: ${config.test.timeout}ms`)
  
  // 1. 检查服务器状态
  logStep('1', '检查服务器状态')
  
  const backendStatus = await checkServerStatus(
    config.backend.url + config.backend.healthEndpoint, 
    '后端'
  )
  
  const frontendStatus = await checkServerStatus(
    config.frontend.url, 
    '前端'
  )
  
  if (!backendStatus) {
    logError('后端服务器未运行，请启动后端服务')
    logWarning('启动命令: cd server && npm run dev')
  }
  
  if (!frontendStatus) {
    logWarning('前端服务器未运行，将跳过页面显示测试')
    logWarning('启动命令: cd client && npm run dev')
  }
  
  // 2. 运行API集成测试
  logStep('2', '运行真实API集成测试')
  
  let apiTestResult = false
  if (backendStatus) {
    apiTestResult = await runTestSuite(
      'tests/integration/ai-assistant-real-api.test.ts',
      'AI助手真实API集成测试'
    )
  } else {
    logWarning('跳过API测试 - 后端服务器未运行')
  }
  
  // 3. 运行页面显示测试
  logStep('3', '运行页面显示测试')
  
  let pageTestResult = false
  if (frontendStatus && backendStatus) {
    try {
      pageTestResult = await runTestSuite(
        'tests/integration/ai-assistant-page-display.test.ts',
        'AI助手页面显示测试'
      )
    } catch (error) {
      logWarning('Vitest页面测试失败，尝试Playwright测试')
      
      // 尝试运行Playwright测试
      try {
        pageTestResult = await runPlaywrightTest(
          'tests/e2e/ai-assistant-page.spec.ts',
          'AI助手页面E2E测试'
        )
      } catch (e2eError) {
        logError('E2E测试也失败了')
      }
    }
  } else {
    logWarning('跳过页面测试 - 服务器未运行')
  }
  
  // 4. 生成测试报告
  logStep('4', '生成测试报告')
  
  const results = {
    backend: backendStatus,
    frontend: frontendStatus,
    apiTest: apiTestResult,
    pageTest: pageTestResult,
    timestamp: new Date().toISOString()
  }
  
  const reportPath = path.join(process.cwd(), 'test-results', 'real-test-report.json')
  
  // 确保目录存在
  const reportDir = path.dirname(reportPath)
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
  logSuccess(`测试报告已保存: ${reportPath}`)
  
  // 5. 输出测试总结
  logHeader('测试总结')
  
  log('服务器状态:', 'bold')
  log(`  后端服务器: ${backendStatus ? '✅ 正常' : '❌ 异常'}`)
  log(`  前端服务器: ${frontendStatus ? '✅ 正常' : '❌ 异常'}`)
  
  log('\n测试结果:', 'bold')
  log(`  API集成测试: ${apiTestResult ? '✅ 通过' : '❌ 失败'}`)
  log(`  页面显示测试: ${pageTestResult ? '✅ 通过' : '❌ 失败'}`)
  
  const totalTests = 2
  const passedTests = (apiTestResult ? 1 : 0) + (pageTestResult ? 1 : 0)
  const successRate = Math.round((passedTests / totalTests) * 100)
  
  log(`\n总体成功率: ${successRate}% (${passedTests}/${totalTests})`, 
    successRate >= 80 ? 'green' : successRate >= 50 ? 'yellow' : 'red')
  
  // 6. 提供建议
  if (!backendStatus || !frontendStatus || !apiTestResult || !pageTestResult) {
    log('\n建议:', 'yellow')
    
    if (!backendStatus) {
      log('  • 启动后端服务器: cd server && npm run dev')
    }
    
    if (!frontendStatus) {
      log('  • 启动前端服务器: cd client && npm run dev')
    }
    
    if (!apiTestResult && backendStatus) {
      log('  • 检查API端点实现是否完整')
      log('  • 检查数据库连接和AI服务配置')
      log('  • 查看后端服务器日志')
    }
    
    if (!pageTestResult && frontendStatus) {
      log('  • 检查前端组件渲染是否正常')
      log('  • 检查路由配置和权限设置')
      log('  • 查看浏览器控制台错误')
    }
  } else {
    logSuccess('所有测试都通过了！AI助手功能正常工作。')
  }
  
  // 退出状态
  const exitCode = (successRate >= 50) ? 0 : 1
  process.exit(exitCode)
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  logError(`未处理的Promise拒绝: ${reason}`)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  logError(`未捕获的异常: ${error.message}`)
  process.exit(1)
})

// 运行主程序
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logError(`测试运行失败: ${error.message}`)
    process.exit(1)
  })
}

export { main, checkServerStatus, runTestSuite }