/**
 * 测试报告生成器
 * 生成JSON、Markdown和HTML格式的测试报告
 */

import type { Page } from 'playwright'
import type { UserRole } from '../config/test-users'
import type { ButtonCheckResult } from './button-checker'
import type { ConsoleMonitorResult } from './console-monitor'
import type { ContentValidationResult } from './content-validator'
import type { DataCheckResult } from './data-checker'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export interface PageTestResult {
  path: string
  title?: string
  timestamp: Date
  buttonIssues: ButtonCheckResult
  consoleErrors: ConsoleMonitorResult
  contentIssues: ContentValidationResult
  dataIssues: DataCheckResult
  screenshot?: Buffer
  hasErrors: boolean
}

export interface RoleTestResult {
  role: UserRole
  pages: PageTestResult[]
  summary: {
    totalPages: number
    pagesWithErrors: number
    totalButtonIssues: number
    totalConsoleErrors: number
    totalContentIssues: number
    totalDataIssues: number
  }
  startTime: Date
  endTime: Date
}

export interface TestReport {
  timestamp: string
  summary: {
    totalRoles: number
    totalPages: number
    pagesWithErrors: number
    totalButtonIssues: number
    totalConsoleErrors: number
    totalContentIssues: number
    totalDataIssues: number
  }
  results: RoleTestResult[]
}

/**
 * 测试报告生成器类
 */
export class TestReporter {
  private role: UserRole
  private results: RoleTestResult
  private startTime: Date

  constructor(role: UserRole) {
    this.role = role
    this.startTime = new Date()
    this.results = {
      role,
      pages: [],
      summary: {
        totalPages: 0,
        pagesWithErrors: 0,
        totalButtonIssues: 0,
        totalConsoleErrors: 0,
        totalContentIssues: 0,
        totalDataIssues: 0
      },
      startTime: this.startTime,
      endTime: this.startTime
    }
  }

  /**
   * 添加页面测试结果
   */
  addPageResult(result: PageTestResult): void {
    this.results.pages.push(result)

    // 更新汇总
    this.results.summary.totalPages++
    if (result.hasErrors) {
      this.results.summary.pagesWithErrors++
    }
    this.results.summary.totalButtonIssues += result.buttonIssues.issues.length
    this.results.summary.totalConsoleErrors += result.consoleErrors.total
    this.results.summary.totalContentIssues += result.contentIssues.issues.length
    this.results.summary.totalDataIssues += result.dataIssues.totalIssues
  }

  /**
   * 生成完整报告
   */
  async generate(): Promise<void> {
    this.results.endTime = new Date()

    const reportDir = join(process.cwd(), 'client', 'tests', 'comprehensive-e2e', 'reports')
    await mkdir(reportDir, { recursive: true })

    // 生成JSON报告
    await this.generateJsonReport(reportDir)

    // 生成Markdown报告
    await this.generateMarkdownReport(reportDir)

    // 生成HTML报告
    await this.generateHtmlReport(reportDir)

    console.log(`\n✓ ${this.role} 角色测试报告已生成`)
    console.log(`  - JSON: ${join(reportDir, `${this.role}-results.json`)}`)
    console.log(`  - Markdown: ${join(reportDir, `${this.role}-report.md`)}`)
    console.log(`  - HTML: ${join(reportDir, `${this.role}-report.html`)}`)
  }

  /**
   * 生成JSON报告
   */
  private async generateJsonReport(reportDir: string): Promise<void> {
    const filePath = join(reportDir, `${this.role}-results.json`)
    await writeFile(filePath, JSON.stringify(this.results, null, 2), 'utf-8')
  }

  /**
   * 生成Markdown报告
   */
  private async generateMarkdownReport(reportDir: string): Promise<void> {
    const { role, pages, summary, startTime, endTime } = this.results

    const markdown = `# ${role.toUpperCase()} 角色测试报告

## 测试概览

- **开始时间**: ${startTime.toLocaleString('zh-CN')}
- **结束时间**: ${endTime.toLocaleString('zh-CN')}
- **测试时长**: ${Math.round((endTime.getTime() - startTime.getTime()) / 1000)}秒

## 汇总统计

| 项目 | 数量 |
|------|------|
| 测试页面数 | ${summary.totalPages} |
| 有问题的页面 | ${summary.pagesWithErrors} |
| 按钮问题 | ${summary.totalButtonIssues} |
| 控制台错误 | ${summary.totalConsoleErrors} |
| 内容问题 | ${summary.totalContentIssues} |
| 数据问题 | ${summary.totalDataIssues} |

## 页面详细结果

${pages.map((page, index) => this.generatePageMarkdown(page, index + 1)).join('\n')}

---

*生成时间: ${new Date().toLocaleString('zh-CN')}*
`

    const filePath = join(reportDir, `${this.role}-report.md`)
    await writeFile(filePath, markdown, 'utf-8')
  }

  /**
   * 生成单个页面的Markdown报告
   */
  private generatePageMarkdown(page: PageTestResult, index: number): string {
    const hasErrors = page.hasErrors ? '❌' : '✅'

    return `
### ${index}. ${page.path} ${hasErrors}

**时间**: ${page.timestamp.toLocaleString('zh-CN')}

#### 按钮检测 (${page.buttonIssues.totalButtons} 个按钮)

| 类型 | 数量 |
|------|------|
| 禁用 | ${page.buttonIssues.summary.disabled} |
| 无尺寸 | ${page.buttonIssues.summary.noSize} |
| 无事件 | ${page.buttonIssues.summary.noEvent} |
| 隐藏 | ${page.buttonIssues.summary.hidden} |
| 被遮挡 | ${page.buttonIssues.summary.blocked} |
| 无文本 | ${page.buttonIssues.summary.noText} |

${page.buttonIssues.issues.length > 0 ? `
**问题列表**:
${page.buttonIssues.issues.slice(0, 10).map(issue => `- **${issue.type}**: \`${issue.selector}\`${issue.text ? ` - "${issue.text}"` : ''}`).join('\n')}
${page.buttonIssues.issues.length > 10 ? `\n... 还有 ${page.buttonIssues.issues.length - 10} 个问题` : ''}
` : '✓ 无按钮问题'}

#### 控制台错误 (${page.consoleErrors.total} 个)

${page.consoleErrors.total > 0 ? `
- JavaScript错误: ${page.consoleErrors.javascript.length}
- 警告: ${page.consoleErrors.warnings.length}
- API错误: ${page.consoleErrors.api.length}
- 资源错误: ${page.consoleErrors.resource.length}

**错误列表**:
${page.consoleErrors.javascript.slice(0, 5).map(err => `- \`${err.message.slice(0, 80)}\``).join('\n')}
${page.consoleErrors.javascript.length > 5 ? `\n... 还有 ${page.consoleErrors.javascript.length - 5} 个错误` : ''}
` : '✓ 无控制台错误'}

#### 内容验证

| 检查项 | 状态 |
|--------|------|
| 页面空白 | ${page.contentIssues.isEmpty ? '❌ 是' : '✅ 否'} |
| 骨架屏 | ${page.contentIssues.hasSkeleton ? '⚠️ 是' : '✅ 否'} |
| 错误消息 | ${page.contentIssues.hasError ? '❌ 是' : '✅ 否'} |
| 加载中 | ${page.contentIssues.hasLoading ? '⚠️ 是' : '✅ 否'} |
| 有数据 | ${page.contentIssues.hasData ? '✅ 是' : '❌ 否'} |
| 空卡片 | ${page.contentIssues.emptyCards} |
| 空表格 | ${page.contentIssues.emptyTables} |

${page.contentIssues.issues.length > 0 ? `
**问题列表**:
${page.contentIssues.issues.map(issue => `- ${issue}`).join('\n')}
` : ''}

#### 数据检查 (${page.dataIssues.totalIssues} 个问题)

${page.dataIssues.totalIssues > 0 ? `
- API错误: ${page.dataIssues.apiErrors.length}
- 空数据卡片: ${page.dataIssues.emptyDataCards.length}
- 空表格: ${page.dataIssues.emptyTables.length}
- 加载超时: ${page.dataIssues.loadingTimeouts.length}

**问题列表**:
${page.dataIssues.apiErrors.slice(0, 5).map(err => `- \`${err.url}\` [${err.status}]`).join('\n')}
` : '✓ 无数据问题'}

---
`
  }

  /**
   * 生成HTML报告
   */
  private async generateHtmlReport(reportDir: string): Promise<void> {
    const { role, pages, summary, startTime, endTime } = this.results

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${role.toUpperCase()} 角色测试报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; margin-bottom: 10px; }
    .meta { color: #666; margin-bottom: 20px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .summary-card h3 { font-size: 14px; color: #666; margin-bottom: 10px; }
    .summary-card .value { font-size: 32px; font-weight: bold; color: #409EFF; }
    .summary-card .value.error { color: #F56C6C; }
    .page-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .page-card.has-errors { border-left: 4px solid #F56C6C; }
    .page-card.no-errors { border-left: 4px solid #67C23A; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .page-title { font-size: 18px; font-weight: bold; }
    .page-status { padding: 4px 12px; border-radius: 12px; font-size: 12px; }
    .page-status.success { background: #67C23A; color: white; }
    .page-status.error { background: #F56C6C; color: white; }
    .issue-list { margin-top: 15px; }
    .issue-item { padding: 8px 12px; background: #F5F7FA; border-radius: 4px; margin-bottom: 8px; font-size: 14px; }
    .issue-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px; }
    .issue-tag.disabled { background: #E4E7ED; color: #606266; }
    .issue-tag.error { background: #FEF0F0; color: #F56C6C; }
    .issue-tag.warning { background: #FDF6EC; color: #E6A23C; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #EBEEF5; }
    th { background: #F5F7FA; font-weight: 600; }
    .screenshot { max-width: 100%; border-radius: 4px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${role.toUpperCase()} 角色测试报告</h1>
    <div class="meta">
      开始时间: ${startTime.toLocaleString('zh-CN')} | 结束时间: ${endTime.toLocaleString('zh-CN')} | 测试时长: ${Math.round((endTime.getTime() - startTime.getTime()) / 1000)}秒
    </div>

    <div class="summary">
      <div class="summary-card">
        <h3>测试页面</h3>
        <div class="value">${summary.totalPages}</div>
      </div>
      <div class="summary-card">
        <h3>有问题页面</h3>
        <div class="value ${summary.pagesWithErrors > 0 ? 'error' : ''}">${summary.pagesWithErrors}</div>
      </div>
      <div class="summary-card">
        <h3>按钮问题</h3>
        <div class="value ${summary.totalButtonIssues > 0 ? 'error' : ''}">${summary.totalButtonIssues}</div>
      </div>
      <div class="summary-card">
        <h3>控制台错误</h3>
        <div class="value ${summary.totalConsoleErrors > 0 ? 'error' : ''}">${summary.totalConsoleErrors}</div>
      </div>
      <div class="summary-card">
        <h3>内容问题</h3>
        <div class="value ${summary.totalContentIssues > 0 ? 'error' : ''}">${summary.totalContentIssues}</div>
      </div>
      <div class="summary-card">
        <h3>数据问题</h3>
        <div class="value ${summary.totalDataIssues > 0 ? 'error' : ''}">${summary.totalDataIssues}</div>
      </div>
    </div>

    ${pages.map(page => this.generatePageHtml(page)).join('\n')}
  </div>
</body>
</html>`

    const filePath = join(reportDir, `${this.role}-report.html`)
    await writeFile(filePath, html, 'utf-8')
  }

  /**
   * 生成单个页面的HTML报告
   */
  private generatePageHtml(page: PageTestResult): string {
    const hasErrorsClass = page.hasErrors ? 'has-errors' : 'no-errors'
    const statusClass = page.hasErrors ? 'error' : 'success'
    const statusText = page.hasErrors ? '发现问题' : '通过'

    return `
    <div class="page-card ${hasErrorsClass}">
      <div class="page-header">
        <div class="page-title">${page.path}</div>
        <div class="page-status ${statusClass}">${statusText}</div>
      </div>

      <div>
        <strong>按钮检测</strong>: ${page.buttonIssues.totalButtons} 个按钮, ${page.buttonIssues.issues.length} 个问题
        ${page.buttonIssues.issues.length > 0 ? `
          <div class="issue-list">
            ${page.buttonIssues.issues.slice(0, 5).map(issue => `
              <div class="issue-item">
                <span class="issue-tag ${issue.type}">${issue.type}</span>
                <code>${issue.selector}</code>
                ${issue.text ? `"${issue.text}"` : ''}
              </div>
            `).join('')}
            ${page.buttonIssues.issues.length > 5 ? `<div class="issue-item">... 还有 ${page.buttonIssues.issues.length - 5} 个问题</div>` : ''}
          </div>
        ` : ''}
      </div>

      <div style="margin-top: 15px;">
        <strong>控制台错误</strong>: ${page.consoleErrors.total} 个
        ${page.consoleErrors.total > 0 ? `
          <div class="issue-list">
            ${page.consoleErrors.javascript.slice(0, 3).map(err => `
              <div class="issue-item">
                <span class="issue-tag error">JS Error</span>
                ${err.message.slice(0, 100)}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div style="margin-top: 15px;">
        <strong>内容验证</strong>:
        ${page.contentIssues.isEmpty ? '<span class="issue-tag error">空白</span>' : '<span class="issue-tag warning">正常</span>'}
        ${page.contentIssues.hasError ? '<span class="issue-tag error">有错误</span>' : '<span class="issue-tag warning">无错误</span>'}
        ${page.contentIssues.hasData ? '<span class="issue-tag warning">有数据</span>' : '<span class="issue-tag error">无数据</span>'}
        ${page.contentIssues.emptyCards > 0 ? `<span class="issue-tag error">空卡片: ${page.contentIssues.emptyCards}</span>` : ''}
        ${page.contentIssues.emptyTables > 0 ? `<span class="issue-tag error">空表格: ${page.contentIssues.emptyTables}</span>` : ''}
      </div>

      <div style="margin-top: 15px;">
        <strong>数据检查</strong>:
        ${page.dataIssues.apiErrors.length > 0 ? `<span class="issue-tag error">API错误: ${page.dataIssues.apiErrors.length}</span>` : '<span class="issue-tag warning">无API错误</span>'}
        ${page.dataIssues.emptyDataCards.length > 0 ? `<span class="issue-tag error">空卡片: ${page.dataIssues.emptyDataCards.length}</span>` : ''}
        ${page.dataIssues.emptyTables.length > 0 ? `<span class="issue-tag error">空表格: ${page.dataIssues.emptyTables.length}</span>` : ''}
      </div>
    </div>`
  }

  /**
   * 获取当前结果
   */
  getResults(): RoleTestResult {
    return { ...this.results }
  }
}

/**
 * 创建测试报告生成器实例
 */
export function createTestReporter(role: UserRole): TestReporter {
  return new TestReporter(role)
}
