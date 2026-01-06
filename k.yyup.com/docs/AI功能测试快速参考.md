# AI功能测试快速参考指南

> **快速查找**: 工具分类、组件映射、测试用例索引

---

## 🔧 后端工具快速索引

### 按功能分类

#### 📊 查询分析类 (推荐：专家工具生成总结)
```
any_query              - 智能SQL查询（复杂查询）
read_data_record       - 简单数据查询（API直调）
```
**前端渲染**: 表格 + 专家总结

#### ✏️ 数据操作类 (推荐：使用对应对话框)
```
create_data_record     - 创建记录 → MissingFieldsDialog.vue
update_data_record     - 更新记录 → 确认对话框
delete_data_record     - 删除记录 → 确认对话框
batch_import_data      - 批量导入 → BatchImportDialog.vue
```

#### 📄 文档生成类 (推荐：使用DocumentPreview组件)
```
generate_pdf_report         - PDF报告
generate_word_document      - Word文档
generate_excel_report       - Excel报表
generate_ppt_presentation   - PPT演示
```
**前端渲染**: DocumentPreview.vue

#### 🎨 UI渲染类 (推荐：使用RightSidebar显示)
```
render_component       - 渲染图表/表格/待办
generate_html_preview  - HTML预览
```
**前端渲染**: RightSidebar.vue / HtmlPreview.vue

#### 🔄 工作流类
```
analyze_task_complexity           - 任务复杂度分析
create_todo_list                  - 创建待办清单
execute_activity_workflow         - 执行活动工作流
generate_complete_activity_plan   - 生成活动方案
```

#### 🌐 页面操作类
```
capture_screen         - 页面截图
fill_form              - 表单填写
web_search             - 网络搜索
select_option          - 下拉选择
type_text              - 文本输入
wait_for_condition     - 等待条件
console_monitor        - 控制台监控
navigate_back          - 返回上一页
注意：navigate_page 已移除
```

#### 📥 数据导入类
```
import_teacher_data    - 导入教师数据
import_parent_data     - 导入家长数据
```

---

## 🎨 前端组件快速索引

### 核心组件
```
AIAssistant.vue           - AI助手主组件
AIAssistantCore.vue       - 核心逻辑（不渲染UI）
```

### 布局组件
```
FullscreenLayout.vue      - 全屏模式布局
SidebarLayout.vue         - 侧边栏模式布局
```

### 聊天组件
```
ChatContainer.vue         - 聊天容器
MessageList.vue           - 消息列表
MessageItem.vue           - 消息项
WelcomeMessage.vue        - 欢迎消息
```

### AI响应组件
```
ThinkingProcess.vue       - 思考过程
FunctionCallList.vue      - 工具调用列表
FunctionCallItem.vue      - 工具调用项
AnswerDisplay.vue         - 答案显示
ContextOptimization.vue   - 上下文优化
LoadingMessage.vue        - 加载消息
ThinkingSubtitle.vue      - 思考副标题
```

### 对话框组件
```
AIStatistics.vue          - AI统计对话框
MissingFieldsDialog.vue   - 缺失字段补充对话框
QuickQueryGroups.vue      - 快捷查询分组
BatchImportDialog.vue     - 批量导入对话框
```

### 专家组件
```
ExpertSelector.vue        - 专家选择器
CustomExpertDialog.vue    - 自定义专家对话框
```

### 文档组件
```
DocumentPreview.vue                - 文档预览
DocumentGenerationProgress.vue     - 文档生成进度
DocumentGenerationResult.vue       - 文档生成结果
```

### 其他组件
```
InputArea.vue             - 输入区域
RightSidebar.vue          - 右侧栏
MarkdownMessage.vue       - Markdown消息
HtmlPreview.vue           - HTML预览
DraggableTable.vue        - 可拖拽表格
PromptPreview.vue         - 提示预览
```

---

## 🎯 工具调用 → 前端渲染映射

### 查询类工具
| 工具 | 渲染方式 | 组件 |
|------|---------|------|
| `any_query` (复杂查询) | 表格 + 专家总结 | `RightSidebar.vue` + 专家工具 |
| `read_data_record` (简单查询) | 表格/卡片 | `RightSidebar.vue` |

### CRUD类工具
| 工具 | 渲染方式 | 组件 |
|------|---------|------|
| `create_data_record` | 缺失字段对话框 | `MissingFieldsDialog.vue` |
| `update_data_record` | 更新确认对话框 | Element Plus Dialog |
| `delete_data_record` | 删除确认对话框 | Element Plus MessageBox |
| `batch_import_data` | 批量导入对话框 | `BatchImportDialog.vue` |

### 文档类工具
| 工具 | 渲染方式 | 组件 |
|------|---------|------|
| `generate_pdf_report` | 文档预览 | `DocumentPreview.vue` |
| `generate_word_document` | 文档预览 | `DocumentPreview.vue` |
| `generate_excel_report` | 直接下载 | - |
| `generate_ppt_presentation` | 文档预览 | `DocumentPreview.vue` |

### UI类工具
| 工具 | 渲染方式 | 组件 |
|------|---------|------|
| `render_component` (图表) | 右侧栏图表 | `RightSidebar.vue` + ECharts |
| `render_component` (表格) | 右侧栏表格 | `RightSidebar.vue` + DataTable |
| `render_component` (待办) | 右侧栏待办 | `RightSidebar.vue` + TodoList |
| `generate_html_preview` | 全屏HTML预览 | `HtmlPreview.vue` |

---

## 📋 测试用例快速索引

### 基础功能测试 (TC-001 ~ TC-010)
```
TC-001  AI助手侧边栏打开
TC-002  AI助手全屏模式切换
TC-003  消息发送和接收
TC-004  快捷建议点击
TC-005  清空对话
TC-006  主题切换
TC-007  语音输入
TC-008  文件上传
TC-009  图片上传
TC-010  AI统计查看
```

### 工具调用测试 (TC-101 ~ TC-128)

#### 查询工具 (TC-101 ~ TC-102)
```
TC-101  any_query - 简单查询
TC-102  read_data_record - API直调查询
```

#### CRUD工具 (TC-103 ~ TC-107)
```
TC-103  create_data_record - 创建记录（完整数据）
TC-104  create_data_record - 缺失字段补充 ⭐
TC-105  update_data_record - 更新记录
TC-106  delete_data_record - 删除记录
TC-107  batch_import_data - 批量导入
```

#### 文档工具 (TC-108 ~ TC-111)
```
TC-108  generate_pdf_report - 生成PDF
TC-109  generate_word_document - 生成Word
TC-110  generate_excel_report - 生成Excel
TC-111  generate_ppt_presentation - 生成PPT
```

#### UI工具 (TC-112 ~ TC-113)
```
TC-112  render_component - 图表渲染
TC-113  render_component - 待办列表渲染
```

#### 工作流工具 (TC-114 ~ TC-117)
```
TC-114  analyze_task_complexity - 复杂度分析
TC-115  create_todo_list - 创建待办
TC-116  execute_activity_workflow - 活动工作流 ⭐
TC-117  generate_complete_activity_plan - 生成活动方案
```

#### 页面操作工具 (TC-118 ~ TC-125)
```
TC-118  capture_screen - 页面截图
TC-119  fill_form - 表单填写
TC-120  web_search - 网络搜索
TC-121  select_option - 下拉选择
TC-122  type_text - 文本输入
TC-123  wait_for_condition - 等待条件
TC-124  console_monitor - 控制台监控
TC-125  navigate_back - 返回上一页
注意：navigate_page 已移除
```

#### 数据导入工具 (TC-127 ~ TC-128)
```
TC-127  import_teacher_data - 导入教师
TC-128  import_parent_data - 导入家长
```

### UI渲染测试 (TC-201 ~ TC-215)
```
TC-201  思考过程显示
TC-202  工具调用列表显示
TC-203  答案显示
TC-204  右侧栏工具调用面板
TC-205  右侧栏渲染组件面板
TC-206  专家选择器显示
TC-207  自定义专家对话框
TC-208  文档预览组件
TC-209  HTML预览组件
TC-210  上下文优化显示
TC-211  加载消息显示
TC-212  快捷查询分组
TC-213  批量导入对话框
TC-214  缺失字段对话框 ⭐
TC-215  可拖拽表格
```

### 交互流程测试 (TC-301 ~ TC-312)
```
TC-301  多轮对话流程 ⭐
TC-302  工具链执行流程 ⭐
TC-303  智能代理模式 ⭐
TC-304  专家咨询流程
TC-305  活动创建完整流程
TC-306  数据导入完整流程
TC-307  文档生成完整流程
TC-308  缺失字段补充流程
TC-309  批量操作流程
TC-310  错误重试流程
TC-311  会话恢复流程
TC-312  偏好设置流程
```

### 错误处理测试 (TC-401 ~ TC-408)
```
TC-401  网络错误处理
TC-402  API错误处理
TC-403  工具调用失败处理
TC-404  超时错误处理
TC-405  权限错误处理
TC-406  数据验证错误处理
TC-407  文件上传错误处理
TC-408  并发请求错误处理
```

### 性能测试 (TC-501 ~ TC-505)
```
TC-501  大量消息加载性能
TC-502  大数据量查询性能
TC-503  文档生成性�