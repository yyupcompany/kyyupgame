#!/usr/bin/env python3
"""
自动化页面修复脚本
使用Claude Code Python SDK批量修复前端页面问题
支持断线续传和进度保存
"""

import asyncio
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
import argparse

# 安装依赖: pip install claude-code-sdk anyio
try:
    from claude_code_sdk import query, ClaudeCodeOptions, Message
    import anyio
except ImportError:
    print("❌ 请先安装依赖: pip install claude-code-sdk anyio")
    sys.exit(1)

# 配置
class Config:
    PROJECT_PATH = Path.cwd()
    CLIENT_PATH = PROJECT_PATH / "client"
    PROGRESS_FILE = PROJECT_PATH / ".auto_fix_progress.json"
    LOG_FILE = PROJECT_PATH / "auto_fix.log"
    MAX_RETRIES = 3
    DELAY_SECONDS = 2
    MAX_TURNS = 5

# 需要修复的页面列表 (基于实际存在的文件)
PAGES_TO_FIX = [
    # AI系统页面 (优先级1 - 实际存在的文件)
    {"path": "client/src/views/ai/MemoryManagement.vue", "category": "ai", "priority": 1, "description": "AI记忆管理页面"},

    # 活动管理页面 (优先级2 - 实际存在的文件)
    {"path": "client/src/views/principal/activity/index.vue", "category": "activity", "priority": 2, "description": "活动管理页面"},

    # 登录页面 (优先级3 - 实际存在的文件)
    {"path": "client/src/views/Login/index.vue", "category": "system", "priority": 3, "description": "用户登录页面"},
]

# 精准修复提示词模板
FIX_PROMPT_TEMPLATE = """
你是一个Vue.js前端开发专家，专门修复幼儿园招生管理系统的页面问题。

## 当前任务
修复页面：{page_path}
页面分类：{category}
页面描述：{description}

## 系统背景
这是一个基于Vue 3 + TypeScript + Element Plus的幼儿园招生管理系统。
后端API地址：http://localhost:3000/api
前端运行地址：http://localhost:5173

## 技术栈要求
- Vue 3 Composition API (使用 <script setup lang="ts">)
- TypeScript (严格类型检查)
- Element Plus UI组件库
- Pinia状态管理 (stores在 @/stores/ 目录)
- Vue Router (路由配置在 @/router/)
- Axios HTTP客户端 (API调用在 @/api/ 目录)

## 核心修复目标

### 1. 移除硬编码数据
❌ 错误示例：
```javascript
const stats = reactive({{
  totalCount: 128,  // 硬编码数据
  averageImportance: 0.68
}});
```

✅ 正确示例：
```javascript
const stats = reactive({{
  totalCount: 0,
  averageImportance: 0,
  loading: false,
  error: null
}});

// 从API获取真实数据
const fetchStats = async () => {{
  try {{
    stats.loading = true;
    const response = await api.getMemoryStats();
    Object.assign(stats, response.data);
  }} catch (error) {{
    stats.error = error.message;
    ElMessage.error('获取统计数据失败');
  }} finally {{
    stats.loading = false;
  }}
}};
```

### 2. 实现完整的API集成
必须包含：
- API调用函数 (使用 @/api/ 目录下的模块)
- 加载状态管理 (loading: boolean)
- 错误处理 (try-catch + ElMessage)
- 数据验证 (检查响应数据格式)

### 3. 完善TypeScript类型定义
```typescript
// 定义接口类型
interface DataStats {{
  totalCount: number;
  averageValue: number;
  distribution: Record<string, number>;
}}

// 定义组件状态类型
interface ComponentState {{
  loading: boolean;
  error: string | null;
  data: DataStats | null;
}}
```

### 4. 添加用户体验优化
- 加载骨架屏或loading状态
- 空数据状态展示
- 错误状态处理和重试机制
- 操作成功/失败的用户反馈

### 5. 遵循组件结构规范
```vue
<template>
  <!-- 使用v-loading指令 -->
  <div v-loading="loading" class="page-container">
    <!-- 错误状态 -->
    <el-alert v-if="error" type="error" :title="error" show-icon />

    <!-- 空数据状态 -->
    <el-empty v-else-if="!loading && !data" description="暂无数据" />

    <!-- 正常内容 -->
    <div v-else>
      <!-- 页面内容 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import {{ ref, reactive, onMounted }} from 'vue';
import {{ ElMessage }} from 'element-plus';

// 状态管理
const state = reactive({{
  loading: false,
  error: null,
  data: null
}});

// API调用
const fetchData = async () => {{
  // 实现API调用逻辑
}};

// 生命周期
onMounted(() => {{
  fetchData();
}});
</script>

<style scoped>
.page-container {{
  padding: 20px;
}}
</style>
```

## 具体修复指导

### AI系统页面 (ai)
- 集成AI相关API (对话、记忆、模型管理)
- 实现实时数据更新
- 添加AI交互状态管理
- 优化图表和数据可视化

### 活动管理页面 (activity)
- 实现CRUD操作API集成
- 添加活动状态管理
- 实现搜索和筛选功能
- 添加活动时间管理

### 园长功能页面 (principal)
- 集成权限验证
- 实现数据仪表板
- 添加统计图表
- 实现导出功能

### 系统管理页面 (system)
- 实现用户权限管理
- 添加系统配置API
- 实现日志查看功能
- 添加数据备份恢复

## 输出要求
1. 修复后的完整Vue文件代码
2. 确保所有硬编码数据都替换为API调用
3. 添加完整的TypeScript类型定义
4. 实现加载状态和错误处理
5. 优化用户体验和界面交互

## 注意事项
- 保持现有的UI设计风格
- 确保响应式布局正常工作
- 添加适当的注释说明
- 遵循Vue 3最佳实践
- 确保代码可维护性和可读性

请开始修复页面：{page_path}
"""

class AutoFixManager:
    def __init__(self):
        self.setup_logging()
        self.progress = self.load_progress()
        
    def setup_logging(self):
        """设置日志"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(Config.LOG_FILE),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def load_progress(self) -> Dict[str, Any]:
        """加载进度"""
        try:
            if Config.PROGRESS_FILE.exists():
                with open(Config.PROGRESS_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            self.logger.warning(f"无法加载进度文件: {e}")
            
        return {
            "completed": [],
            "failed": [],
            "current_index": 0,
            "start_time": datetime.now().isoformat()
        }
        
    def save_progress(self):
        """保存进度"""
        try:
            with open(Config.PROGRESS_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.progress, f, indent=2, ensure_ascii=False)
        except Exception as e:
            self.logger.error(f"无法保存进度文件: {e}")
            
    def generate_prompt(self, page: Dict[str, Any]) -> str:
        """生成修复提示词"""
        return FIX_PROMPT_TEMPLATE.format(
            page_path=page["path"],
            category=page["category"],
            priority=page["priority"],
            description=page["description"]
        )
        
    async def fix_page(self, page: Dict[str, Any], retry_count: int = 0) -> Dict[str, Any]:
        """修复单个页面"""
        try:
            self.logger.info(f"开始修复页面: {page['path']} (分类: {page['category']}, 优先级: {page['priority']})")

            # 检查文件是否存在
            full_path = Config.PROJECT_PATH / page["path"]
            if not full_path.exists():
                self.logger.warning(f"文件不存在，跳过: {page['path']}")
                return {"success": False, "reason": "file_not_found"}

            # 生成提示词
            prompt = self.generate_prompt(page)

            # 配置Claude Code选项
            options = ClaudeCodeOptions(
                max_turns=Config.MAX_TURNS,
                cwd=Config.PROJECT_PATH,
                allowed_tools=["Read", "Write", "Bash"],
                permission_mode="acceptEdits"
            )

            # 执行修复
            messages: List[Message] = []
            message_count = 0
            async for message in query(prompt=prompt, options=options):
                messages.append(message)
                message_count += 1
                self.logger.info(f"📨 收到消息 {message_count}: {type(message).__name__}")

            # 处理结果
            if messages:
                self.logger.info(f"✅ 页面修复完成: {page['path']} (收到 {len(messages)} 条消息)")
                return {
                    "success": True,
                    "messages": len(messages),
                    "details": "修复完成"
                }
            else:
                self.logger.warning(f"⚠️ 页面修复无响应: {page['path']}")
                return {"success": False, "reason": "no_response"}

        except Exception as e:
            self.logger.error(f"❌ 页面修复失败: {page['path']} - {str(e)}")

            if retry_count < Config.MAX_RETRIES:
                self.logger.info(f"重试 {retry_count + 1}/{Config.MAX_RETRIES}: {page['path']}")
                await asyncio.sleep(Config.DELAY_SECONDS * (retry_count + 1))
                return await self.fix_page(page, retry_count + 1)

            return {"success": False, "error": str(e)}
            
    async def run(self, category_filter: Optional[str] = None, priority_filter: Optional[int] = None):
        """主执行函数"""
        self.logger.info("🚀 开始自动修复页面")
        
        # 过滤页面
        pages_to_fix = PAGES_TO_FIX
        if category_filter:
            pages_to_fix = [p for p in pages_to_fix if p["category"] == category_filter]
        if priority_filter:
            pages_to_fix = [p for p in pages_to_fix if p["priority"] == priority_filter]
            
        # 按优先级排序
        pages_to_fix.sort(key=lambda x: x["priority"])
        
        self.logger.info(f"总页面数: {len(pages_to_fix)}")
        self.logger.info(f"已完成: {len(self.progress['completed'])}")
        self.logger.info(f"已失败: {len(self.progress['failed'])}")
        
        # 从上次中断的地方继续
        for i, page in enumerate(pages_to_fix[self.progress["current_index"]:], self.progress["current_index"]):
            # 跳过已完成的页面
            if page["path"] in self.progress["completed"]:
                self.logger.info(f"跳过已完成的页面: {page['path']}")
                continue
                
            # 更新当前索引
            self.progress["current_index"] = i
            self.save_progress()
            
            # 修复页面
            result = await self.fix_page(page)
            
            if result["success"]:
                self.progress["completed"].append(page["path"])
                self.logger.info(f"✅ 成功修复: {page['path']}")
            else:
                self.progress["failed"].append({
                    "path": page["path"],
                    "reason": result.get("reason", result.get("error", "unknown")),
                    "timestamp": datetime.now().isoformat()
                })
                self.logger.error(f"❌ 修复失败: {page['path']}")
                
            # 保存进度
            self.save_progress()
            
            # 延迟避免过于频繁的调用
            if i < len(pages_to_fix) - 1:
                await asyncio.sleep(Config.DELAY_SECONDS)
                
        # 完成总结
        self.logger.info("🎉 自动修复完成！")
        self.logger.info(f"✅ 成功: {len(self.progress['completed'])}")
        self.logger.info(f"❌ 失败: {len(self.progress['failed'])}")
        
        if self.progress["failed"]:
            self.logger.info("\n失败的页面:")
            for failed in self.progress["failed"]:
                self.logger.info(f"  - {failed['path']}: {failed['reason']}")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="自动化页面修复脚本")
    parser.add_argument("--reset", action="store_true", help="重置进度，从头开始")
    parser.add_argument("--category", type=str, help="只修复指定分类的页面")
    parser.add_argument("--priority", type=int, help="只修复指定优先级的页面")
    parser.add_argument("--list", action="store_true", help="列出所有页面")
    
    args = parser.parse_args()
    
    if args.list:
        print("📋 所有页面列表:")
        for page in sorted(PAGES_TO_FIX, key=lambda x: (x["priority"], x["category"])):
            print(f"  优先级{page['priority']} | {page['category']} | {page['path']} | {page['description']}")
        return
        
    # 重置进度
    if args.reset and Config.PROGRESS_FILE.exists():
        Config.PROGRESS_FILE.unlink()
        print("✅ 进度已重置")
        
    # 创建管理器并运行
    manager = AutoFixManager()
    
    try:
        anyio.run(manager.run, args.category, args.priority)
    except KeyboardInterrupt:
        print("\n⚠️ 用户中断，进度已保存")
    except Exception as e:
        print(f"❌ 执行失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
