#!/usr/bin/env node

/**
 * PM2 管理脚本
 * 用于便捷管理 PM2 进程
 */

const { execSync } = require('child_process')
const path = require('path')

const PM2_CONFIG = path.join(__dirname, '..', 'ecosystem.dev.config.js')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function exec(command, description) {
  try {
    log(`→ ${description}...`, 'cyan')
    const output = execSync(command, { encoding: 'utf-8', stdio: 'inherit' })
    log(`✓ ${description}完成`, 'green')
    return output
  } catch (error) {
    log(`✗ ${description}失败: ${error.message}`, 'red')
    process.exit(1)
  }
}

// 命令
const commands = {
  // 启动所有服务
  start: () => {
    log('\n🚀 启动开发环境服务\n', 'yellow')
    exec(`pm2 start ${PM2_CONFIG}`, '启动前后端服务')
    log('\n✅ 服务启动成功！\n', 'green')
    showStatus()
    showAccessInfo()
  },

  // 启动后端
  'start:backend': () => {
    log('\n🚀 启动后端服务\n', 'yellow')
    exec(`pm2 start ${PM2_CONFIG} --only k-backend-dev`, '启动后端服务')
    log('\n✅ 后端服务启动成功！\n', 'green')
    showStatus()
  },

  // 启动前端
  'start:frontend': () => {
    log('\n🚀 启动前端服务\n', 'yellow')
    exec(`pm2 start ${PM2_CONFIG} --only k-frontend-dev`, '启动前端服务')
    log('\n✅ 前端服务启动成功！\n', 'green')
    showStatus()
  },

  // 停止所有服务
  stop: () => {
    log('\n🛑 停止开发环境服务\n', 'yellow')
    exec(`pm2 stop ${PM2_CONFIG}`, '停止前后端服务')
    log('\n✅ 服务已停止\n', 'green')
  },

  // 停止所有
  'stop:all': () => {
    log('\n🛑 停止所有PM2服务\n', 'yellow')
    exec('pm2 stop all', '停止所有服务')
    log('\n✅ 所有服务已停止\n', 'green')
  },

  // 重启服务
  restart: () => {
    log('\n🔄 重启开发环境服务\n', 'yellow')
    exec(`pm2 restart ${PM2_CONFIG}`, '重启前后端服务')
    log('\n✅ 服务重启成功！\n', 'green')
    showStatus()
  },

  // 重载服务
  reload: () => {
    log('\n🔄 重载开发环境服务\n', 'yellow')
    exec(`pm2 reload ${PM2_CONFIG}`, '重载前后端服务')
    log('\n✅ 服务重载成功！\n', 'green')
    showStatus()
  },

  // 删除服务
  delete: () => {
    log('\n🗑️  删除开发环境服务\n', 'yellow')
    exec(`pm2 delete ${PM2_CONFIG}`, '删除前后端服务')
    log('\n✅ 服务已删除\n', 'green')
  },

  // 删除所有
  'delete:all': () => {
    log('\n🗑️  删除所有PM2服务\n', 'yellow')
    exec('pm2 delete all', '删除所有服务')
    log('\n✅ 所有服务已删除\n', 'green')
  },

  // 查看日志
  logs: () => {
    exec('pm2 logs', '查看PM2日志')
  },

  // 查看后端日志
  'logs:backend': () => {
    exec('pm2 logs k-backend-dev', '查看后端日志')
  },

  // 查看前端日志
  'logs:frontend': () => {
    exec('pm2 logs k-frontend-dev', '查看前端日志')
  },

  // 查看状态
  status: () => {
    showStatus()
  },

  // 监控
  monit: () => {
    exec('pm2 monit', '启动PM2监控界面')
  },

  // 保存配置
  save: () => {
    log('\n💾 保存PM2配置\n', 'yellow')
    exec('pm2 save', '保存当前进程列表')
    log('\n✅ 配置已保存\n', 'green')
  },

  // 清除日志
  'flush': () => {
    log('\n🧹 清除PM2日志\n', 'yellow')
    exec('pm2 flush', '清除日志')
    log('\n✅ 日志已清除\n', 'green')
  }
}

// 显示状态
function showStatus() {
  try {
    const output = execSync('pm2 status', { encoding: 'utf-8' })
    log('\n📊 PM2 进程状态:\n', 'cyan')
    console.log(output)
  } catch (error) {
    log('\n⚠️  无法获取PM2状态\n', 'yellow')
  }
}

// 显示访问信息
function showAccessInfo() {
  log('\n🌐 访问地址:\n', 'cyan')
  log('  前端: http://localhost:5173', 'white')
  log('  后端: http://localhost:3000', 'white')
  log('  API文档: http://localhost:3000/api-docs\n', 'white')
}

// 显示帮助
function showHelp() {
  log('\n📖 PM2 管理脚本使用说明\n', 'cyan')
  log('用法: npm run pm2:<command> 或 node scripts/pm2-manager.cjs <command>\n', 'white')
  log('可用命令:\n', 'yellow')
  log('  start              - 启动前后端服务', 'white')
  log('  start:backend      - 只启动后端服务', 'white')
  log('  start:frontend     - 只启动前端服务', 'white')
  log('  stop               - 停止前后端服务', 'white')
  log('  stop:all           - 停止所有PM2服务', 'white')
  log('  restart            - 重启前后端服务', 'white')
  log('  reload             - 重载前后端服务', 'white')
  log('  delete             - 删除前后端服务', 'white')
  log('  delete:all         - 删除所有PM2服务', 'white')
  log('  logs               - 查看所有日志', 'white')
  log('  logs:backend       - 查看后端日志', 'white')
  log('  logs:frontend      - 查看前端日志', 'white')
  log('  status             - 查看服务状态', 'white')
  log('  monit              - 启动监控界面', 'white')
  log('  save               - 保存PM2配置', 'white')
  log('  flush              - 清除日志', 'white')
  log('  help               - 显示此帮助信息\n', 'white')
}

// 主函数
function main() {
  const command = process.argv[2] || 'help'

  if (command === 'help' || command === '--help' || command === '-h') {
    showHelp()
    return
  }

  if (commands[command]) {
    commands[command]()
  } else {
    log(`\n❌ 未知命令: ${command}`, 'red')
    showHelp()
    process.exit(1)
  }
}

// 运行
main()
