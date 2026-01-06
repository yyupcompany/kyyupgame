#!/usr/bin/env node

/**
 * 四角色测试运行脚本
 * 提供命令行界面，支持选择测试角色
 */

const { spawn } = require('child_process')
const readline = require('readline')
const path = require('path')

/**
 * 命令行参数解析
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    role: null,
    all: false,
    headed: false,
    debug: false
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--all') {
      options.all = true
    } else if (arg === '--headed') {
      options.headed = true
    } else if (arg === '--debug') {
      options.debug = true
    } else if (arg === '--role') {
      options.role = args[i + 1]
      i++
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
  }

  return options
}

/**
 * 打印帮助信息
 */
function printHelp() {
  console.log(`
四角色完整测试运行脚本

用法:
  node scripts/run-four-role-test.js [选项]

选项:
  --all              测试所有角色
  --role <role>      测试指定角色 (admin/principal/teacher/parent)
  --headed           使用有头模式运行（显示浏览器）
  --debug            调试模式
  --help, -h         显示帮助信息

示例:
  # 测试所有角色
  node scripts/run-four-role-test.js --all

  # 测试Admin角色
  node scripts/run-four-role-test.js --role admin

  # 测试多个角色
  node scripts/run-four-role-test.js --role admin,principal

  # 使用有头模式运行
  node scripts/run-four-role-test.js --role teacher --headed

  # 调试模式
  node scripts/run-four-role-test.js --role parent --debug --headed
`)
}

/**
 * 打印欢迎信息
 */
function printWelcome() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                              ║
║          四角色完整测试系统                                     ║
║          Four Role Complete Test System                           ║
║                                                              ║
║  测试范围:                                                    ║
║  • Admin角色 - 约30个页面                                     ║
║  • 园长角色 - 约30个页面                                     ║
║  • 教师角色 - 约25个页面                                     ║
║  • 家长角色 - 约20个页面                                     ║
║                                                              ║
║  测试内容:                                                    ║
║  • 元素级测试 - 页面元素渲染                                  ║
║  • 功能级测试 - 按钮、表单交互                                 ║
║  • 数据验证 - API数据来源验证                                   ║
║  • 控制台监控 - JavaScript错误检测                              ║
║                                                              ║
╚════════════════════════════════════════════════════════════╝
`)
}

/**
 * 打印角色选择菜单
 */
function printRoleMenu() {
  console.log(`
请选择要测试的角色:

  1. Admin (系统管理员)
  2. 园长
  3. 教师
  4. 家长
  5. 所有角色
  0. 退出

`)
}

/**
 * 获取用户输入
 */
function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => rl.question(query, ans => {
    rl.close()
    resolve(ans)
  }))
}

/**
 * 运行Playwright测试
 */
function runPlaywrightTest(testFile, options) {
  return new Promise((resolve, reject) => {
    const testDir = path.join(process.cwd(), 'client', 'tests', 'comprehensive-e2e')

    const playwrightArgs = [
      'test',
      testFile,
      '--config',
      path.join(testDir, 'playwright.config.ts'),
      '--reporter=list'
    ]

    if (!options.headed) {
      playwrightArgs.push('--headed=false')
    }

    if (options.debug) {
      playwrightArgs.push('--debug')
    }

    console.log(`\n🚀 运行测试...`)
    console.log(`   测试文件: ${testFile}`)
    console.log(`   命令: npx playwright ${playwrightArgs.join(' ')}\n`)

    const testProcess = spawn('npx', playwrightArgs, {
      cwd: testDir,
      stdio: 'inherit',
      shell: true
    })

    testProcess.on('close', code => {
      if (code === 0) {
        console.log(`\n✅ 测试完成`)
        resolve()
      } else {
        console.error(`\n❌ 测试失败，退出码: ${code}`)
        reject(new Error(`测试失败，退出码: ${code}`))
      }
    })

    testProcess.on('error', error => {
      console.error(`\n❌ 测试进程错误:`, error)
      reject(error)
    })
  })
}

/**
 * 运行指定角色的测试
 */
async function runRoleTest(role, options) {
  const testFile = path.join(
    'tests',
    'four-role-complete-test.spec.ts'
  )

  console.log(`\n${'='.repeat(70)}`)
  console.log(`开始测试角色: ${role.toUpperCase()}`)
  console.log(`${'='.repeat(70)}`)

  try {
    await runPlaywrightTest(testFile, options)
  } catch (error) {
    console.error(`\n❌ 测试失败:`, error)
    process.exit(1)
  }
}

/**
 * 运行所有角色的测试
 */
async function runAllRolesTest(options) {
  const testFile = path.join(
    'tests',
    'four-role-complete-test.spec.ts'
  )

  console.log(`\n${'='.repeat(70)}`)
  console.log(`开始测试所有角色`)
  console.log(`${'='.repeat(70)}`)

  try {
    await runPlaywrightTest(testFile, options)
  } catch (error) {
    console.error(`\n❌ 测试失败:`, error)
    process.exit(1)
  }
}

/**
 * 主函数
 */
async function main() {
  const options = parseArgs()

  // 打印欢迎信息
  printWelcome()

  // 如果指定了--all选项，直接运行所有角色测试
  if (options.all) {
    await runAllRolesTest(options)
    return
  }

  // 如果指定了--role选项，运行指定角色测试
  if (options.role) {
    const roles = options.role.split(',').map(r => r.trim().toLowerCase())
    const validRoles = ['admin', 'principal', 'teacher', 'parent']

    for (const role of roles) {
      if (!validRoles.includes(role)) {
        console.error(`\n❌ 无效的角色: ${role}`)
        console.error(`   有效角色: ${validRoles.join(', ')}`)
        process.exit(1)
      }
    }

    if (roles.length === 1) {
      await runRoleTest(roles[0], options)
    } else {
      await runAllRolesTest(options)
    }
    return
  }

  // 交互式选择
  printRoleMenu()

  while (true) {
    const answer = await question('请输入选项 (0-5): ')

    switch (answer.trim()) {
      case '1':
        await runRoleTest('admin', options)
        break
      case '2':
        await runRoleTest('principal', options)
        break
      case '3':
        await runRoleTest('teacher', options)
        break
      case '4':
        await runRoleTest('parent', options)
        break
      case '5':
        await runAllRolesTest(options)
        break
      case '0':
        console.log('\n👋 再见!')
        process.exit(0)
      default:
        console.log('\n⚠️  无效的选项，请重新输入\n')
        printRoleMenu()
        continue
    }

    // 询问是否继续
    const continueAnswer = await question('\n是否继续测试其他角色? (y/n): ')
    if (continueAnswer.toLowerCase() !== 'y') {
      console.log('\n👋 再见!')
      process.exit(0)
    }

    printRoleMenu()
  }
}

/**
 * 运行主函数
 */
main().catch(error => {
  console.error('\n❌ 发生错误:', error)
  process.exit(1)
})
