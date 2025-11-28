#!/usr/bin/env node

import ClaudeMemoryDB from './memory-db.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const args = process.argv.slice(2)
const flags = {
  init: args.includes('--init'),
  search: args.includes('--search'),
  add: args.includes('--add'),
  recent: args.includes('--recent'),
  start: args.includes('--start'),
  help: args.includes('--help') || args.includes('-h')
}

const getArgValue = (flag) => {
  const index = args.indexOf(flag)
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null
}

async function main() {
  const memory = new ClaudeMemoryDB()

  if (flags.help || args.length === 0) {
    showHelp()
    return
  }

  if (flags.init) {
    console.log('🚀 初始化Claude记忆数据库...')
    const success = await memory.init()
    if (success) console.log('✅ 记忆数据库初始化成功')
    return
  }

  if (flags.search) {
    await memory.init()
    const keyword = getArgValue('--search') || await getInput('请输入搜索关键词: ')
    console.log(`🔍 搜索关键词: ${keyword}`)
    const results = await memory.searchByKeyword(keyword)

    if (results.length === 0) {
      console.log('❌ 未找到相关记录')
    } else {
      console.log(`✅ 找到 ${results.length} 条记录:`)
      results.forEach((record, index) => {
        console.log(`\n${index + 1}. [${new Date(record.timestamp).toLocaleString('zh-CN')}]`)
        console.log(`   问题: ${record.question}`)
        console.log(`   解决: ${record.solution}`)
      })
    }
    return
  }

  if (flags.add) {
    await memory.init()
    const question = getArgValue('--question') || await getInput('问题描述: ')
    const solution = getArgValue('--solution') || await getInput('解决方案: ')

    const record = await memory.add(question, solution)
    if (record) console.log('✅ 记录添加成功')
    return
  }

  if (flags.recent) {
    await memory.init()
    const limit = parseInt(getArgValue('--recent') || '10')
    const recent = await memory.getRecent(limit)

    console.log(`📚 最近 ${limit} 条记录:`)
    recent.forEach((record, index) => {
      console.log(`\n${index + 1}. [${new Date(record.timestamp).toLocaleString('zh-CN')}]`)
      console.log(`   问题: ${record.question}`)
      console.log(`   解决: ${record.solution}`)
    })
    return
  }

  if (flags.start) {
    await memory.init()
    const limit = parseInt(getArgValue('--start') || '10')
    const memoryPrompt = await memory.generateMemoryPrompt(limit)

    console.log('\n' + '='.repeat(60))
    console.log('📋 Claude Code 记忆提示词 (请复制到对话中):')
    console.log('='.repeat(60))
    console.log('\n' + memoryPrompt + '\n')
    console.log('='.repeat(60))
    console.log(`📊 记忆统计:`, memory.getStats())
    console.log('='.repeat(60))
    return
  }

  showHelp()
}

function showHelp() {
  console.log(`
🧠 Claude 记忆数据库工具

使用方法: node memory-cli.js [选项]

选项:
  --init                     初始化数据库
  --search [关键词]           搜索记录
  --add                      添加新记录
  --recent [数量]             显示最近记录 (默认10条)
  --start [数量]              生成Claude启动记忆提示 (默认10条)
  --question "问题"           指定问题内容
  --solution "解决方案"       指定解决方案
  --help, -h                 显示帮助信息

示例:
  node memory-cli.js --init                    # 初始化
  node memory-cli.js --start                   # 生成启动记忆
  node memory-cli.js --search "关键词"         # 搜索记录
  node memory-cli.js --add --question "问题" --solution "解决"  # 添加记录
`)
}

function getInput(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt)
    process.stdin.resume()
    process.stdin.setEncoding('utf-8')
    process.stdin.on('data', (data) => {
      process.stdin.pause()
      resolve(data.trim())
    })
  })
}

main().catch(console.error)
