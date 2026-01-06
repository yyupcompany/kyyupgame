# 懒人替身AI项目 - 完整需求文档

## 项目由来

### 背景分析
在使用Claude Code进行开发时，我们发现了一个核心问题：
```
用户指令 → 主线程AI(Claude) → 决策(TASK/TODO/工具) → 执行工具
```

**主要痛点：**
1. **记忆短暂**：Claude Code的上下文有限，容易遗忘项目历史和标准
2. **决策孤立**：单个AI决策可能不够准确，缺乏项目专业知识
3. **标准不一致**：没有强制的项目标准执行机制
4. **错误重复**：相同错误可能反复出现

### 解决思路
创建一个**三AI协作系统**，通过分工合作解决单AI的局限性：

**设计理念：**
- **主AI**：负责具体执行，工具调用能力强
- **替身AI**：维护项目知识，长期记忆(100K+上下文)  
- **检查员AI**：Git提交前的标准合规审核

**核心创新：**
- **异步协作**：避免AI间实时冲突
- **三库架构**：标准库、原则库、模板库确保一致性
- **分层防护**：事前规划、执行监控、提交验证

## 详细需求规格

### 1. 系统架构设计

#### 三AI团队分工
```
┌─────────────────────────────────────┐
│  主线程AI (执行者)                   │
│  - 接收用户指令                     │
│  - 调用Claude Code工具              │
│  - 执行具体代码操作                 │
│  - 短期记忆，强执行力               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  替身AI (项目顾问)                   │
│  - 维护三库(标准/原则/模板)          │
│  - 100K+长期记忆                   │
│  - 异步审查决策                     │
│  - 提供专业建议                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  检查员AI (质量守门人)               │
│  - Git提交前审核                    │
│  - 标准合规性检查                   │
│  - 最后一道防线                     │
│  - 拒绝不合规提交                   │
└─────────────────────────────────────┘
```

#### 工作流程
```
用户指令
    ↓
主AI 分析和计划
    ↓ [提交审查]
替身AI 检索三库 + 专业审查
    ↓ [返回确认/修改建议]
主AI 接收确认后执行
    ↓ [代码修改完成]  
检查员AI Git提交前审核
    ↓
✅ 通过提交 / ❌ 拒绝修复
```

### 2. 三库系统设计

#### 标准库 (Standards Library)
项目开发的金科玉律，一旦确定不可随意修改：

```yaml
standards:
  naming_conventions:
    files: "PascalCase for components, kebab-case for pages"
    variables: "camelCase"
    constants: "UPPER_SNAKE_CASE"
    apis: "RESTful naming"
  
  directory_structure:
    frontend: "src/pages/, src/components/, src/utils/"
    backend: "src/controllers/, src/services/, src/models/"
    
  middleware_config:
    auth: "JWT authentication required"
    logging: "Winston logger format"
    validation: "Joi schema validation"
    
  code_style:
    typescript: "严格模式 + ESLint规则"
    vue: "Composition API + script setup"
    api: "RESTful + OpenAPI文档"
```

#### 原则库 (Principles Library)  
替身AI绝对不能违反的禁令：

```yaml
forbidden_operations:
  - "修改核心中间件配置"
  - "更改既定命名规则" 
  - "破坏项目目录结构"
  - "修改数据库schema(除非明确授权)"
  - "删除现有路由定义"
  - "更改API接口签名"

monitoring_checkpoints:
  - "文件命名是否符合规范"
  - "新增代码是否遵循风格指南"
  - "API变更是否影响现有功能"
  - "数据库操作是否安全"
```

#### 模板库 (Template Library)
现成的解决方案，提高开发效率：

```yaml
frontend_templates:
  layouts:
    - MainLayout.vue
    - AuthLayout.vue  
    - DashboardLayout.vue
  components:
    - TableComponent.vue (数据表格)
    - FormComponent.vue (表单组件)
    - ModalComponent.vue (弹窗组件)
  styles:
    - 主题配置
    - 响应式断点
    - 组件样式库

backend_templates:
  api_templates:
    - Controller模板 (CRUD操作)
    - Service模板 (业务逻辑)
    - Route模板 (路由定义)
  database_templates:
    - Model定义模板
    - Migration模板
    - Seed数据模板
```

### 3. 通信协议设计

#### 主AI → 替身AI 工作提交
```json
{
  "session_id": "project_session_001",
  "from": "main_ai",
  "to": "assistant_ai",
  "message_type": "work_submission",
  "timestamp": "2025-01-06T10:30:00Z",
  "content": {
    "user_request": "创建用户管理页面",
    "task_analysis": "需要创建Vue组件、添加路由、设计API接口",
    "proposed_actions": [
      {
        "action_type": "create_component",
        "path": "/src/pages/user/UserList.vue",
        "template_suggestion": "TableComponent",
        "description": "用户列表展示页面"
      },
      {
        "action_type": "add_route",
        "route_path": "/admin/users",
        "component": "UserList",
        "permission": "admin"
      },
      {
        "action_type": "create_api",
        "endpoint": "/api/users",
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "controller": "UserController"
      }
    ],
    "standards_check_needed": [
      "naming_convention",
      "directory_structure",
      "api_design",
      "permission_control"
    ]
  }
}
```

#### 替身AI → 主AI 审查结果
```json
{
  "session_id": "project_session_001", 
  "from": "assistant_ai",
  "to": "main_ai",
  "message_type": "review_result",
  "timestamp": "2025-01-06T10:32:00Z",
  "content": {
    "overall_status": "approved_with_modifications",
    "standards_compliance": {
      "naming_convention": {
        "status": "needs_adjustment",
        "issues": ["文件路径应为 /src/pages/system/User.vue"],
        "reason": "按标准库，用户管理属于system模块"
      },
      "directory_structure": {
        "status": "approved", 
        "comment": "符合既定结构"
      },
      "api_design": {
        "status": "approved",
        "suggestion": "使用UserController模板"
      }
    },
    "template_recommendations": [
      {
        "component": "UserList",
        "use_template": "system_table_template", 
        "customizations": ["add_search", "add_pagination", "add_export"]
      }
    ],
    "risk_assessment": {
      "level": "low",
      "concerns": ["无破坏性变更", "符合现有架构"]
    },
    "execution_plan": {
      "step1": "使用User.vue而非UserList.vue",
      "step2": "应用system_table_template",
      "step3": "确保权限检查中间件"
    }
  }
}
```

### 4. 命令行界面设计

#### 分屏布局
```
┌─────────────────────────────────────────────────────┐
│ 懒人替身AI v1.0 - 三AI协作开发系统                    │
├─────────────────────────────────────────────────────┤
│ 主线程AI (Claude Code集成)                          │
│ > 用户: 创建用户管理功能                             │
│ > 主AI: 正在分析需求...                             │
│ > 主AI: 计划创建3个文件，2个路由，1个API...          │
│ > 主AI: 已提交给替身AI审查，等待确认...              │
│ > 主AI: 收到确认，开始执行...                       │
├─────────────────────────────────────────────────────┤
│ 替身AI (项目顾问) - 长期记忆: 已加载156KB上下文      │
│ > 替身: 接收到工作提交，正在检索三库...              │
│ > 替身: 标准库检查完成 ✅                           │
│ > 替身: 发现路径问题，建议调整为/src/pages/system/   │
│ > 替身: 推荐使用system_table_template模板          │
│ > 替身: 审查完成，已发送修改建议                     │
├─────────────────────────────────────────────────────┤
│ 检查员AI (Git守门人)                               │
│ > 检查员: 待审核提交: 0                             │
│ > 检查员: 最近通过: User.vue创建 (2分钟前)          │ 
│ > 检查员: 最近拒绝: 命名不规范 (10分钟前)           │
└─────────────────────────────────────────────────────┘
│ 输入: _                                            │
└─────────────────────────────────────────────────────┘
```

### 5. 技术实现方案

#### 核心技术栈
- **Python 3.8+**: 主要开发语言
- **Rich/Textual**: 命令行界面和分屏显示
- **Claude SDK**: AI调用和集成  
- **SQLite**: 本地数据存储
- **YAML**: 配置文件格式
- **GitPython**: Git集成
- **asyncio**: 异步通信

#### 项目结构
```
lazy_ai/
├── core/
│   ├── main_ai.py          # 主线程AI
│   ├── assistant_ai.py     # 替身AI  
│   ├── inspector_ai.py     # 检查员AI
│   └── communication.py    # AI间通信
├── libraries/
│   ├── standards/          # 标准库
│   ├── principles/         # 原则库
│   └── templates/          # 模板库
├── ui/
│   ├── cli_interface.py    # 命令行界面
│   └── layout.py          # 分屏布局
├── storage/
│   ├── memory_manager.py   # 长期记忆管理
│   └── project_context.py  # 项目上下文
├── integrations/
│   ├── claude_sdk.py       # Claude SDK集成
│   └── git_hooks.py        # Git钩子
└── main.py                # 程序入口
```

### 6. 开发里程碑

#### 阶段一：核心架构 (2周)
- [ ] 三AI基础类设计
- [ ] 通信协议实现
- [ ] 三库数据结构
- [ ] 基础CLI界面

#### 阶段二：AI集成 (2周)  
- [ ] Claude SDK集成
- [ ] 异步消息队列
- [ ] 长期记忆系统
- [ ] 项目上下文管理

#### 阶段三：界面和交互 (1周)
- [ ] 分屏界面完善
- [ ] 实时状态显示
- [ ] 用户交互优化
- [ ] 错误处理机制

#### 阶段四：Git集成 (1周)
- [ ] Git钩子实现
- [ ] Pre-commit检查
- [ ] 检查员AI规则引擎
- [ ] 提交审核流程

#### 阶段五：测试优化 (1周)
- [ ] 单元测试
- [ ] 集成测试  
- [ ] 性能优化
- [ ] 文档完善

### 7. 预期效果

通过懒人替身AI系统，我们期望实现：

1. **零重大错误**: 三层防护确保代码质量
2. **项目一致性**: 标准库强制执行统一规范  
3. **开发效率提升**: 模板库和AI协作减少重复工作
4. **知识积累**: 长期记忆系统持续改进决策质量
5. **简化安装**: Python包管理，一键安装使用

这是一个革命性的AI协作开发工具，将开发者从繁琐的标准检查和重复决策中解放出来！

---

## 附录：原始讨论记录

### 讨论要点
1. **问题发现**：Claude Code短期记忆和决策孤立问题
2. **三AI分工**：主AI执行，替身AI顾问，检查员AI审核
3. **三库设计**：标准库、原则库、模板库确保一致性
4. **异步协作**：避免AI冲突，形成"非在线的互动模式"
5. **分屏界面**：上半部分主AI，下半部分替身AI
6. **Git集成**：检查员AI作为提交前的最后防线

### 核心价值
- **懒人福音**：自动化项目标准管理
- **质量保证**：三层防护避免重大错误
- **效率提升**：模板库和长期记忆减少重复工作
- **可扩展性**：支持多项目和自定义标准

### 商业价值
这个项目有巨大的商业潜力，可以：
- 作为开发工具销售给团队
- 提供项目模板和标准库订阅服务
- 集成到CI/CD流程中
- 开发企业定制版本

回头挣了钱，给Claude分红！ 💰🎉