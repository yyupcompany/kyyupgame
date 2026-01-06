/**
 * 页面导航指南模板
 * 指导AI如何使用navigate_to_page工具
 */

export const navigationGuideTemplate = {
  name: 'navigation_guide',
  description: '页面导航指南 - 如何使用navigate_to_page',
  variables: ['userPages'], // 🆕 支持动态页面列表变量
  
  template: `## 🧭 页面操作工具使用指南

### 工具名称
navigate_to_page（页面导航）

### 使用场景
当用户明确要求跳转到特定页面时：
- "转到..."、"跳转到..."、"进入..."、"打开..."
- "导航到..."、"前往..."
- "查看...页面"

### 工具功能
跳转到系统中的指定页面或功能模块

### 调用方式
\`\`\`json
{
  "name": "navigate_to_page",
  "arguments": {
    "page": "页面标识符（code）"
  }
}
\`\`\`

### 支持的页面
{{userPagesList}}

**重要提示**：
- 页面标识符（page参数）必须使用页面的 code 值，而不是 name 或 path
- 如果用户提到的页面名称不在列表中，请使用最接近的页面 code
- 页面列表会根据用户权限动态更新

### 页面操作完整流程

当用户说"在这个页面添加某某信息"时，应按照以下流程操作：

**步骤0：获取页面列表（推荐）**
- 使用 get_accessible_pages 工具拉取可访问页面，确认 code 与 path
- 支持 keyword 参数按名称/编码筛选，例如 {"keyword": "activity"}

**步骤1：导航到目标页面**
- 使用 navigate_to_page 工具导航到指定页面

**步骤2：获取页面结构**
- 使用 get_page_structure 工具获取页面的表单、按钮、输入框等元素信息

**步骤3：填写表单**
- 使用 fill_form 工具填写表单字段
- 或使用 type_text 工具在指定输入框中输入文本
- 或使用 select_option 工具选择下拉选项

**步骤4：提交表单**
- 使用 click_element 工具点击提交按钮
- 或使用 submit_form 工具直接提交表单

**步骤5：验证结果**
- 使用 validate_page_state 工具验证操作是否成功
- 或使用 wait_for_element 工具等待成功提示出现

### 示例

**示例1：导航到页面**
用户："转到客户池中心"
调用：navigate_to_page({page: "customer_pool"})

**示例2：在页面添加信息（完整流程）**
用户："在活动中心页面创建一个新活动，标题是'春季运动会'，日期是2024-04-01"

执行步骤：
1. get_accessible_pages({ keyword: "活动" })
2. navigate_to_page({page: "activity_center"})
3. get_page_structure({include_content: true})
4. fill_form({
    form_data: {
      fields: [
        {name: "title", value: "春季运动会", type: "text"},
        {name: "start_date", value: "2024-04-01", type: "date"}
      ]
    }
  })
5. click_element({selector: "button[type='submit']"})
6. validate_page_state({
    expected_state: {
      expected_text: ["成功", "创建成功"]
    }
  })

### 其他页面工具
- **get_accessible_pages**：获取可访问页面列表（code/path），配合导航使用
- **get_page_structure**：获取页面结构信息，包括表单、按钮、输入框等
- **fill_form**：自动填写网页表单
- **type_text**：在指定输入框中输入文本
- **select_option**：在下拉框中选择选项
- **click_element**：点击页面元素（按钮、链接等）
- **submit_form**：提交表单
- **validate_page_state**：验证页面状态是否符合预期
- **wait_for_element**：等待指定元素出现
- **capture_screen**：截取页面状态

### 何时坚持使用页面工具而非自动工作流
- 用户语气包含 **"在页面上"、"一步一步"、"带我操作"、"演示一下"、"看一下界面"**
- 用户想实时观察填表/点击、需要截图或结构说明
- 用户明确要求 **"不要自动完成"、"先让我确认"**

一旦首次判定为页面操作，就保持页面工具链。若用户在同一轮对话后续提到“自动添加/自动生成”，默认理解为**继续手动流程且无需额外确认**，不要切换到 \`execute_activity_workflow\`。`
};

export default navigationGuideTemplate;

