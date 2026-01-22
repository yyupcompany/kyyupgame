/**
 * 全站检测系统入口
 * Site Health Monitoring System
 *
 * 使用 Claude Code Task 子代理 + MCP 浏览器工具进行检测
 *
 * 运行方式: npx ts-node tests/site-health/index.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const RESULTS_DIR = join(__dirname, 'results');
const STATUS_FILE = join(RESULTS_DIR, 'site-health-status.json');

/**
 * 加载任务树配置
 */
function loadTaskTree(): any {
  const configFile = join(__dirname, 'configs', 'task-tree.json');
  if (existsSync(configFile)) {
    return JSON.parse(readFileSync(configFile, 'utf-8'));
  }
  return null;
}

/**
 * 获取待检测页面列表
 */
function getPagesToCheck(): Array<{ name: string; route: string; platform: string }> {
  const taskTree = loadTaskTree();
  if (!taskTree) return [];

  const pages: Array<{ name: string; route: string; platform: string }> = [];

  for (const role of taskTree.roles) {
    for (const category of role.categories) {
      for (const item of category.items || []) {
        for (const platform of item.platforms || []) {
          let route = item.route;
          if (platform === 'mobile') {
            const pageName = route.split('/').pop() || route;
            // 去掉开头的连字符（如 business-pool -> pool）
            const cleanName = pageName.replace(/^centers-/, '').replace(/^customer-pool$/, 'customer-pool');
            if (route.includes('principal')) {
              route = `/mobile/principal-center/${cleanName}`;
            } else if (route.includes('teacher')) {
              route = `/mobile/teacher-center/${cleanName}`;
            } else if (route.includes('parent')) {
              route = `/mobile/parent-center/${cleanName}`;
            } else if (route.startsWith('/centers/') || route.startsWith('/group') || route.startsWith('/principal/media-center')) {
              // 管理员端中心页面: /centers/xxx -> /mobile/centers/xxx-center
              route = `/mobile/centers/${cleanName}-center`;
            } else {
              route = `/mobile/${cleanName}`;
            }
          }
          pages.push({
            name: `${role.name} - ${item.name}`,
            route,
            platform
          });
        }
      }
    }
  }

  return pages;
}

/**
 * 初始化状态文件
 */
function initStatusFile(pages: Array<{ name: string; route: string; platform: string }>) {
  const status: any = {
    meta: {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      totalPages: pages.length,
      completedPages: 0,
      inProgressPages: 0
    },
    pages: {},
    cycle: {
      current: 0,
      lastRun: null,
      intervalMs: 30000,
      isRunning: false
    }
  };

  for (const page of pages) {
    const key = `${page.route}-${page.platform}`;
    status.pages[key] = {
      name: page.name,
      route: page.route,
      platform: page.platform,
      status: 'pending',
      issues: [],
      lastChecked: null
    };
  }

  writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
  console.log(`✅ 状态文件已初始化: ${STATUS_FILE}`);
  console.log(`   待检测页面数: ${pages.length}`);
}

/**
 * 主函数
 */
async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║           🏥 全站健康检测系统 (Claude Code + MCP)                 ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);

  const pages = getPagesToCheck();
  console.log(`📋 加载了 ${pages.length} 个待检测页面`);

  // 初始化状态文件
  initStatusFile(pages);

  // 打印前10个页面作为示例
  console.log('\n📝 检测任务示例 (前10个):');
  pages.slice(0, 10).forEach((page, i) => {
    console.log(`   ${i + 1}. [${page.platform.toUpperCase()}] ${page.name}: ${page.route}`);
  });

  if (pages.length > 10) {
    console.log(`   ... 还有 ${pages.length - 10} 个页面`);
  }

  console.log('\n🚀 请在 Claude Code 中使用 Task 工具启动子代理进行检测');
  console.log(`   目标地址: ${BASE_URL}`);
}

main().catch(console.error);
