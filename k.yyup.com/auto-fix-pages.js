#!/usr/bin/env node

/**
 * 自动化页面修复脚本
 * 使用Claude Code SDK批量修复前端页面问题
 * 支持断线续传和进度保存
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 配置
const CONFIG = {
  // Claude Code 命令
  claudeCodeCommand: 'claude-code',
  
  // 项目路径
  projectPath: process.cwd(),
  clientPath: path.join(process.cwd(), 'client'),
  
  // 进度文件
  progressFile: path.join(process.cwd(), '.auto-fix-progress.json'),
  
  // 日志文件
  logFile: path.join(process.cwd(), 'auto-fix.log'),
  
  // 并发数量
  concurrency: 1,
  
  // 重试次数
  maxRetries: 3,
  
  // 延迟时间（毫秒）
  delay: 2000
};

// 需要修复的页面列表
const PAGES_TO_FIX = [
  // 用户管理页面
  { path: 'client/src/views/system/User.vue', category: 'system', priority: 1 },
  { path: 'client/src/views/system/Role.vue', category: 'system', priority: 1 },
  { path: 'client/src/views/system/Permission.vue', category: 'system', priority: 1 },
  
  // 教育管理页面
  { path: 'client/src/views/student/Student.vue', category: 'education', priority: 2 },
  { path: 'client/src/views/student/StudentDetail.vue', category: 'education', priority: 2 },
  { path: 'client/src/views/teacher/Teacher.vue', category: 'education', priority: 2 },
  { path: 'client/src/views/teacher/TeacherDetail.vue', category: 'education', priority: 2 },
  { path: 'client/src/views/teacher/TeacherEdit.vue', category: 'education', priority: 2 },
  { path: 'client/src/views/parent/Parent.vue', category: 'education', priority: 2 },
  { path: 'client/src/views/parent/ParentDetail.vue', category: 'education', priority: 2 },
  { path: 'client/src/views/parent/ParentChildren.vue', category: 'education', priority: 2 },
  { path: 'client/src/views/class/Class.vue', category: 'education', priority: 2 },
  { path: 'client/src/views/class/ClassDetail.vue', category: 'education', priority: 2 },
  
  // 招生管理页面
  { path: 'client/src/views/enrollment/EnrollmentOverview.vue', category: 'enrollment', priority: 3 },
  { path: 'client/src/views/enrollment/EnrollmentPlan.vue', category: 'enrollment', priority: 3 },
  { path: 'client/src/views/enrollment/EnrollmentPlanDetail.vue', category: 'enrollment', priority: 3 },
  { path: 'client/src/views/enrollment/EnrollmentPlanEdit.vue', category: 'enrollment', priority: 3 },
  { path: 'client/src/views/enrollment/EnrollmentPlanStatistics.vue', category: 'enrollment', priority: 3 },
  
  // 活动管理页面
  { path: 'client/src/views/activity/Activity.vue', category: 'activity', priority: 4 },
  { path: 'client/src/views/activity/ActivityCreate.vue', category: 'activity', priority: 4 },
  { path: 'client/src/views/activity/ActivityDetail.vue', category: 'activity', priority: 4 },
  
  // AI系统页面
  { path: 'client/src/views/ai/AIChat.vue', category: 'ai', priority: 5 },
  { path: 'client/src/views/ai/AIAssistant.vue', category: 'ai', priority: 5 },
  { path: 'client/src/views/ai/AIMemory.vue', category: 'ai', priority: 5 },
  { path: 'client/src/views/ai/AIModel.vue', category: 'ai', priority: 5 },
  
  // 系统管理页面
  { path: 'client/src/views/system/SystemSettings.vue', category: 'system', priority: 6 },
  { path: 'client/src/views/system/SystemLogs.vue', category: 'system', priority: 6 },
  { path: 'client/src/views/system/SystemBackup.vue', category: 'system', priority: 6 },
  { path: 'client/src/views/system/AIModelConfig.vue', category: 'system', priority: 6 },
  { path: 'client/src/views/system/MessageTemplate.vue', category: 'system', priority: 6 },
  
  // 园长功能页面
  { path: 'client/src/views/principal/PrincipalDashboard.vue', category: 'principal', priority: 7 },
  { path: 'client/src/views/principal/PrincipalPerformance.vue', category: 'principal', priority: 7 },
  { path: 'client/src/views/principal/PrincipalCustomerPool.vue', category: 'principal', priority: 7 },
  
  // 业务扩展页面
  { path: 'client/src/views/business/Statistics.vue', category: 'business', priority: 8 },
  { path: 'client/src/views/business/Customer.vue', category: 'business', priority: 8 },
  { path: 'client/src/views/business/Advertisement.vue', category: 'business', priority: 8 },
  { path: 'client/src/views/business/Marketing.vue', category: 'business', priority: 8 },
  { path: 'client/src/views/business/Application.vue', category: 'business', priority: 8 },
  { path: 'client/src/views/business/Chat.vue', category: 'business', priority: 8 }
];

// 修复提示词模板
const FIX_PROMPT_TEMPLATE = `
你是一个Vue.js前端开发专家，需要修复幼儿园招生管理系统的页面。

## 当前任务
修复页面：{PAGE_PATH}
页面分类：{CATEGORY}
优先级：{PRIORITY}

## 系统背景
这是一个基于Vue 3 + TypeScript + Element Plus的幼儿园招生管理系统，包含以下功能模块：
- 用户管理（用户、角色、权限）
- 教育管理（学生、教师、家长、班级）
- 招生管理（招生计划、统计）
- 活动管理（活动列表、创建、详情）
- AI系统（对话、助手、记忆、模型）
- 系统管理（设置、日志、备份）
- 园长功能（仪表板、绩效、客户池）
- 业务扩展（统计、客户、广告、营销）

## 技术栈
- Vue 3 Composition API
- TypeScript
- Element Plus UI组件库
- Pinia状态管理
- Vue Router路由
- Axios HTTP客户端

## 修复要求

### 1. 页面结构规范
- 使用Vue 3 Composition API语法
- 正确的TypeScript类型定义
- 合理的组件结构和布局

### 2. UI组件使用
- 使用Element Plus组件库
- 遵循设计系统规范
- 响应式布局设计

### 3. 数据管理
- 使用Pinia进行状态管理
- 正确的API调用和错误处理
- 数据验证和表单验证

### 4. 用户体验
- 加载状态和错误提示
- 操作反馈和确认
- 无障碍访问支持

### 5. 代码质量
- 清晰的代码结构
- 适当的注释说明
- 性能优化考虑

## 具体修复指导

根据页面分类提供具体指导：

### 系统管理页面 (system)
- 实现CRUD操作（增删改查）
- 权限控制和角色验证
- 数据表格和分页
- 搜索和筛选功能

### 教育管理页面 (education)
- 学生/教师/家长信息管理
- 关联关系处理
- 详情页面和编辑功能
- 数据导入导出

### 招生管理页面 (enrollment)
- 招生计划管理
- 统计图表展示
- 报名流程处理
- 数据分析功能

### 活动管理页面 (activity)
- 活动列表和详情
- 活动创建和编辑
- 参与者管理
- 活动状态跟踪

### AI系统页面 (ai)
- 对话界面设计
- AI助手功能
- 记忆管理
- 模型配置

### 园长功能页面 (principal)
- 数据仪表板
- 绩效分析
- 客户池管理
- 决策支持

### 业务扩展页面 (business)
- 统计分析图表
- 客户关系管理
- 营销活动管理
- 应用集成

## 输出要求
1. 修复后的完整Vue文件代码
2. 简要说明修复的问题和改进点
3. 如果需要新增依赖或配置，请说明

请开始修复页面：{PAGE_PATH}
`;

// 工具函数
class AutoFixManager {
  constructor() {
    this.progress = this.loadProgress();
    this.setupLogging();
  }

  // 加载进度
  loadProgress() {
    try {
      if (fs.existsSync(CONFIG.progressFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.progressFile, 'utf8'));
      }
    } catch (error) {
      this.log('警告：无法加载进度文件，将从头开始');
    }
    return {
      completed: [],
      failed: [],
      currentIndex: 0,
      startTime: new Date().toISOString()
    };
  }

  // 保存进度
  saveProgress() {
    try {
      fs.writeFileSync(CONFIG.progressFile, JSON.stringify(this.progress, null, 2));
    } catch (error) {
      this.log(`错误：无法保存进度文件 - ${error.message}`);
    }
  }

  // 设置日志
  setupLogging() {
    this.logStream = fs.createWriteStream(CONFIG.logFile, { flags: 'a' });
  }

  // 记录日志
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    if (this.logStream) {
      this.logStream.write(logMessage);
    }
  }

  // 生成修复提示词
  generatePrompt(page) {
    return FIX_PROMPT_TEMPLATE
      .replace(/{PAGE_PATH}/g, page.path)
      .replace(/{CATEGORY}/g, page.category)
      .replace(/{PRIORITY}/g, page.priority);
  }

  // 执行Claude Code命令
  async executeClaudeCode(page, prompt) {
    return new Promise((resolve, reject) => {
      const args = [
        'fix',
        '--file', page.path,
        '--prompt', prompt,
        '--auto-apply'
      ];

      this.log(`执行命令: ${CONFIG.claudeCodeCommand} ${args.join(' ')}`);

      const process = spawn(CONFIG.claudeCodeCommand, args, {
        cwd: CONFIG.projectPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output: stdout });
        } else {
          reject(new Error(`命令执行失败 (退出码: ${code})\n${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`无法启动进程: ${error.message}`));
      });
    });
  }

  // 修复单个页面
  async fixPage(page, retryCount = 0) {
    try {
      this.log(`开始修复页面: ${page.path} (分类: ${page.category}, 优先级: ${page.priority})`);

      // 检查文件是否存在
      const fullPath = path.join(CONFIG.projectPath, page.path);
      if (!fs.existsSync(fullPath)) {
        this.log(`警告：文件不存在，跳过 - ${page.path}`);
        return { success: false, reason: 'file_not_found' };
      }

      // 生成提示词
      const prompt = this.generatePrompt(page);

      // 执行修复
      const result = await this.executeClaudeCode(page, prompt);

      this.log(`✅ 页面修复成功: ${page.path}`);
      return { success: true, output: result.output };

    } catch (error) {
      this.log(`❌ 页面修复失败: ${page.path} - ${error.message}`);

      if (retryCount < CONFIG.maxRetries) {
        this.log(`重试 ${retryCount + 1}/${CONFIG.maxRetries}: ${page.path}`);
        await this.delay(CONFIG.delay * (retryCount + 1));
        return this.fixPage(page, retryCount + 1);
      }

      return { success: false, error: error.message };
    }
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 主执行函数
  async run() {
    this.log('🚀 开始自动修复页面');
    this.log(`总页面数: ${PAGES_TO_FIX.length}`);
    this.log(`已完成: ${this.progress.completed.length}`);
    this.log(`已失败: ${this.progress.failed.length}`);

    // 按优先级排序
    const sortedPages = PAGES_TO_FIX.sort((a, b) => a.priority - b.priority);

    // 从上次中断的地方继续
    for (let i = this.progress.currentIndex; i < sortedPages.length; i++) {
      const page = sortedPages[i];

      // 跳过已完成的页面
      if (this.progress.completed.includes(page.path)) {
        this.log(`跳过已完成的页面: ${page.path}`);
        continue;
      }

      // 更新当前索引
      this.progress.currentIndex = i;
      this.saveProgress();

      // 修复页面
      const result = await this.fixPage(page);

      if (result.success) {
        this.progress.completed.push(page.path);
      } else {
        this.progress.failed.push({
          path: page.path,
          reason: result.reason || result.error,
          timestamp: new Date().toISOString()
        });
      }

      // 保存进度
      this.saveProgress();

      // 延迟避免过于频繁的调用
      if (i < sortedPages.length - 1) {
        await this.delay(CONFIG.delay);
      }
    }

    // 完成总结
    this.log('🎉 自动修复完成！');
    this.log(`✅ 成功: ${this.progress.completed.length}`);
    this.log(`❌ 失败: ${this.progress.failed.length}`);

    if (this.progress.failed.length > 0) {
      this.log('\n失败的页面:');
      this.progress.failed.forEach(failed => {
        this.log(`  - ${failed.path}: ${failed.reason}`);
      });
    }

    // 清理
    if (this.logStream) {
      this.logStream.end();
    }
  }
}

// 命令行参数处理
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--reset':
        options.reset = true;
        break;
      case '--category':
        options.category = args[++i];
        break;
      case '--priority':
        options.priority = parseInt(args[++i]);
        break;
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

// 显示帮助信息
function showHelp() {
  console.log(`
自动化页面修复脚本

用法:
  node auto-fix-pages.js [选项]

选项:
  --reset              重置进度，从头开始
  --category <类型>    只修复指定分类的页面
  --priority <数字>    只修复指定优先级的页面
  --help              显示此帮助信息

示例:
  node auto-fix-pages.js                    # 修复所有页面
  node auto-fix-pages.js --reset            # 重置进度重新开始
  node auto-fix-pages.js --category system  # 只修复系统管理页面
  node auto-fix-pages.js --priority 1       # 只修复优先级1的页面
`);
}

// 主函数
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  // 重置进度
  if (options.reset && fs.existsSync(CONFIG.progressFile)) {
    fs.unlinkSync(CONFIG.progressFile);
    console.log('✅ 进度已重置');
  }

  // 过滤页面
  let pagesToFix = PAGES_TO_FIX;
  if (options.category) {
    pagesToFix = pagesToFix.filter(page => page.category === options.category);
  }
  if (options.priority) {
    pagesToFix = pagesToFix.filter(page => page.priority === options.priority);
  }

  // 更新页面列表
  PAGES_TO_FIX.length = 0;
  PAGES_TO_FIX.push(...pagesToFix);

  // 创建管理器并运行
  const manager = new AutoFixManager();
  await manager.run();
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 运行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AutoFixManager, CONFIG, PAGES_TO_FIX };
