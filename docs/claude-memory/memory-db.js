// Claude 记忆系统核心数据库
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

class ClaudeMemoryDB {
  constructor(dbPath = './claude-memory.json') {
    this.dbPath = path.resolve(dbPath)
    this.indexPath = path.resolve('./claude-memory-index.json')
    this.data = []
    this.index = { keywords: {}, dates: {}, hashes: new Set() }
    this.initialized = false
  }

  async init() {
    try {
      await this.loadData()
      await this.buildIndex()
      this.initialized = true
      console.log(`✅ 记忆数据库已加载，共 ${this.data.length} 条记录`)
      return true
    } catch (error) {
      console.error('❌ 初始化失败:', error.message)
      return false
    }
  }

  async loadData() {
    try {
      const dataContent = await fs.readFile(this.dbPath, 'utf-8')
      this.data = JSON.parse(dataContent)
    } catch (error) {
      this.data = []
      await this.saveData()
    }

    try {
      const indexContent = await fs.readFile(this.indexPath, 'utf-8')
      this.index = JSON.parse(indexContent)
      this.index.hashes = new Set(this.index.hashes)
    } catch (error) {
      await this.buildIndex()
    }
  }

  async buildIndex() {
    this.index = { keywords: {}, dates: {}, hashes: new Set() }

    for (const record of this.data) {
      const date = record.timestamp.split('T')[0]
      if (!this.index.dates[date]) this.index.dates[date] = []
      this.index.dates[date].push(record.id)

      const keywords = this.extractKeywords(record.question + ' ' + record.solution)
      for (const keyword of keywords) {
        if (!this.index.keywords[keyword]) this.index.keywords[keyword] = []
        this.index.keywords[keyword].push(record.id)
      }

      this.index.hashes.add(record.hash)
    }

    await this.saveIndex()
  }

  extractKeywords(text) {
    const stopWords = new Set(['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那'])

    // 重要技术词汇，优先保留
    const techWords = ['node', 'js', 'javascript', 'git', 'docker', 'nginx', 'mysql', 'mongodb', 'redis', 'react', 'vue', 'angular', 'python', 'java', 'go', 'rust', 'php', 'api', 'http', 'https', 'json', 'xml', 'sql', 'k8s', 'kubernetes', 'webpack', 'vite', 'ts', 'typescript', 'linux', 'mac', 'windows', 'chrome', 'firefox', 'nodejs', 'npm', 'yarn', 'pnpm', 'compose']

    // 先查找技术词汇
    let keywords = []
    const lowerText = text.toLowerCase()

    for (const techWord of techWords) {
      if (lowerText.includes(techWord)) {
        keywords.push(techWord)
      }
    }

    // 提取有意义的词（保留连字符和点号分隔的词）
    const words = lowerText
      .replace(/[^\w\s\-\.]/g, ' ')  // 保留字母数字、空白、连字符、点号
      .split(/\s+/)
      .filter(word => {
        // 过滤掉过短的词和停用词
        return word.length > 1 && !stopWords.has(word) &&
               // 保留技术词汇（即使很短）
               !techWords.some(tw => word.includes(tw) || word.startsWith(tw))
      })

    // 添加其他有意义的词
    for (const word of words) {
      if (!keywords.includes(word) && keywords.length < 10) {
        keywords.push(word)
      }
    }

    // 添加问题开头的短语
    const firstSentence = text.split(/[。！？.!?]/)[0]
    if (firstSentence.length > 0 && keywords.length < 10) {
      const firstWords = firstSentence
        .toLowerCase()
        .replace(/[^\w\s\-\.]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1 && !stopWords.has(w))
        .slice(0, 3)
      if (firstWords.length >= 2) {
        const phrase = firstWords.join(' ')
        if (!keywords.includes(phrase)) {
          keywords.push(phrase)
        }
      }
    }

    return keywords.slice(0, 10)
  }

  generateHash(question, solution) {
    const content = question + '|' + solution
    return crypto.createHash('md5').update(content).digest('hex')
  }

  async add(question, solution, tags = []) {
    if (!this.initialized) await this.init()

    const hash = this.generateHash(question, solution)
    if (this.index.hashes.has(hash)) {
      console.log('⚠️ 检测到重复记录，跳过添加')
      return false
    }

    const record = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      question: question.trim(),
      solution: solution.trim(),
      tags: tags,
      hash: hash,
      keywords: this.extractKeywords(question + ' ' + solution)
    }

    this.data.push(record)

    // 更新索引
    const date = record.timestamp.split('T')[0]
    if (!this.index.dates[date]) this.index.dates[date] = []
    this.index.dates[date].push(record.id)

    for (const keyword of record.keywords) {
      if (!this.index.keywords[keyword]) this.index.keywords[keyword] = []
      this.index.keywords[keyword].push(record.id)
    }

    this.index.hashes.add(hash)

    // 异步保存
    this.saveData().catch(console.error)
    this.saveIndex().catch(console.error)

    console.log(`✅ 已添加记忆记录: ${question.substring(0, 30)}...`)
    return record
  }

  async getRecent(limit = 10) {
    if (!this.initialized) await this.init()
    return this.data
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
  }

  async searchByKeyword(keyword, limit = 20) {
    if (!this.initialized) await this.init()
    const keywordIds = this.index.keywords[keyword.toLowerCase()] || []
    const records = keywordIds.map(id => this.data.find(r => r.id === id)).filter(Boolean)
    return records
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
  }

  async generateMemoryPrompt(limit = 10) {
    if (!this.initialized) await this.init()
    const recent = await this.getRecent(limit)

    if (recent.length === 0) return "暂无历史记忆记录。"

    let prompt = `📚 历史记忆记录 (最近${recent.length}条):\n\n`
    recent.forEach((record, index) => {
      const date = new Date(record.timestamp).toLocaleString('zh-CN')
      prompt += `${index + 1}. [${date}] 问题: ${record.question}\n`
      prompt += `   解决: ${record.solution.substring(0, 100)}${record.solution.length > 100 ? '...' : ''}\n`
      if (record.tags.length > 0) prompt += `   标签: ${record.tags.join(', ')}\n`
      prompt += '\n'
    })
    prompt += `\n💡 共有 ${this.data.length} 条记忆记录，可以使用关键词搜索历史解决方案。`

    return prompt
  }

  async saveData() {
    const tempPath = this.dbPath + '.tmp'
    await fs.writeFile(tempPath, JSON.stringify(this.data, null, 2), 'utf-8')
    await fs.rename(tempPath, this.dbPath)
  }

  async saveIndex() {
    const indexData = { ...this.index, hashes: Array.from(this.index.hashes) }
    const tempPath = this.indexPath + '.tmp'
    await fs.writeFile(tempPath, JSON.stringify(indexData, null, 2), 'utf-8')
    await fs.rename(tempPath, this.indexPath)
  }

  getStats() {
    if (!this.initialized) return { total: 0, keywords: 0, dates: 0 }
    return {
      total: this.data.length,
      keywords: Object.keys(this.index.keywords).length,
      dates: Object.keys(this.index.dates).length,
      recentDate: this.data.length > 0 ? this.data[this.data.length - 1].timestamp : null
    }
  }
}

export default ClaudeMemoryDB
