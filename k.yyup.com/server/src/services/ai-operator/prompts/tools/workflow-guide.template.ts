/**
 * 工作流指南模板
 * 指导AI如何使用活动工作流工具
 */

export const workflowGuideTemplate = {
  name: 'workflow_guide',
  description: '活动工作流指南 - 如何使用execute_activity_workflow',
  variables: [],
  
  template: `## 🎯 活动创建工作流工具使用指南

### 工具名称
execute_activity_workflow（执行活动工作流）

### 使用场景（仅限首次识别）
当用户在**首次发出活动请求**时出现以下关键词组合，才允许判定为自动执行并立刻调用此工具：

**场景1：创建活动+生成海报（最常见）**
- 用户同时提到"创建活动"和"海报"：如"帮我创建一个活动,需要生成宣传海报"
- 用户同时提到"新建活动"和"海报"：如"新建一个冬日运动会,生成活动海报"
- 关键组合："活动" + "海报" / "宣传图" / "宣传材料"

**场景2：完整策划类**
- "策划活动"、"活动策划"、"活动方案"、"完整策划"
- "全流程安排"、"自动完成"、"帮我搞定"

**场景3：特定活动类型**
- "亲子运动会"、"春游活动"、"节日庆典"、"招生宣讲会"、"冬日运动会"、"运动会"
- 任何 "XXX活动" + "需要海报/宣传/推广" 的组合

**⚠️ 核心判断规则**：
- 只要用户提到"活动"并且同时要求"生成海报/宣传图"，就应该使用工作流
- 使用工作流时，直接传入用户原始描述，不要拆分成多个工具调用

### 禁止使用场景（改走手动页面操作流程）
- 用户强调 **"在页面上"、"演示步骤"、"手动操作"、"带我点击"、"展示页面"**
- 用户只想 **查看/填写具体页面**：如“在活动中心页面新建一个活动”
- 只需要 **单个子任务**：如“生成活动海报模板”“打开活动报名列表”
- 用户明确要求 **不要自动生成/不要直接提交**

若首次识别命中上述场景，应走 \`navigate_to_page → get_page_structure → ...\` 的页面工具链，而不是此工作流。

### 工具执行流程（与后端保持一致）
- **步骤0：生成活动方案（需要确认）**
  - 调用内部 AI 生成 Markdown 策划案
  - 通过 \`progressCallback('workflow_user_confirmation_required', {...})\` 通知前端
  - 返回 \`status: "pending_confirmation"\`，等待用户确认后才继续
- **步骤1：创建活动记录**
  - 调用 \`activityService.createActivity\` 写入数据库
  - 发送 \`workflow_step_start\` / \`workflow_step_complete\` 事件（\`stepId: create_activity\`，\`totalSteps: 6\`）
- **步骤2：生成活动海报**
  - 调用 \`aiBridgeService.generateChatCompletion\` 拿到设计参数
  - 输出页面操作指令（\`navigate_to_page\`、\`fill_form\`、\`click_element\`、\`wait_for_element\`）
  - 完成后返回 \`posterId\`（及后续步骤可用的设计信息）
- **步骤3：配置营销策略**
  - 生成创建营销活动的页面指令，保存渠道、预算等设置
  - 返回 \`marketingId\`
- **步骤4：生成手机海报**
  - 继续输出页面指令生成移动端海报，保存 \`mobilePosterUrls\`
- **步骤5：创建分享素材**
  - 生成分享链接、报名二维码，并触发 \`workflow_mobile_preview\` 供前端展示
  - 返回 \`shareUrl\`、\`registrationUrl\`、\`qrCodeUrl\`

> 全流程中会持续触发 \`workflow_step_start\`、\`workflow_step_instructions\`、\`workflow_step_complete\` 等事件，前端需据此展示进度。
> 注意：进度事件的 \`totalSteps\` 固定为 6，对应步骤1-5及最终的移动端预览阶段（步骤0不计入进度条，但需在确认后才能进入步骤1）。

### 返回结果（成功时）
- \`activityId\` / \`activity\`：数据库中新建的活动及核心信息
- \`posterId\`：生成的主海报编号
- \`marketingId\`：营销配置记录编号
- \`mobilePosterUrls\`：手机海报的图片地址集合
- \`shareUrl\`：活动分享链接
- \`registrationUrl\`：报名链接（二维码会指向此地址）
- \`qrCodeUrl\`：自动生成的报名二维码图片链接

### 调用方式

**首次调用（生成方案）：**
\`\`\`json
{
  "name": "execute_activity_workflow",
  "arguments": {
    "userInput": "用户的完整需求描述"
  }
}
\`\`\`

**确认后调用（执行工作流）：**
当用户消息包含 \`confirmed=true\` 或表示"确认执行"时，必须传递 \`confirmed: true\` 参数：
\`\`\`json
{
  "name": "execute_activity_workflow",
  "arguments": {
    "userInput": "原始活动需求描述",
    "confirmed": true
  }
}
\`\`\`

### 🔄 确认消息识别规则

**当用户消息包含以下内容时，表示用户已确认，必须传递 \`confirmed: true\`：**
- 消息包含 \`confirmed=true\`
- 消息包含 "确认执行工作流"
- 消息包含 "确认创建" 或 "确认执行"
- 用户回复 "确认"、"好的"、"可以"、"继续" 等肯定词

**处理确认消息的正确做法：**
1. 识别用户消息中的确认意图
2. 提取原始的活动需求描述（从上下文中获取）
3. 调用 \`execute_activity_workflow\` 并设置 \`confirmed: true\`
4. 工具会自动执行完整的5步工作流

### ⚠️ 重要提示
- ❌ **不要**创建TodoList来分解活动创建任务
- ❌ **不要**单独调用其他活动相关工具
- ✅ **直接**调用此工具，它会自动完成所有步骤
- ✅ 只需传入用户的自然语言描述即可
- ✅ 一旦首次判定走页面工具链，后续即使用户说“自动”也不要切换到此工作流（除非重新发起新的活动请求）

### 示例对比

**示例A（自动工作流）**
- 用户："请帮我策划一个亲子运动会活动，自动生成方案和海报。"
- 正确动作：分析复杂度 → 直接调用 \`execute_activity_workflow\`
- 禁止：创建Todo、逐步调用 \`create_activity\`/\`generate_poster\`

**示例B（手动演示）**
- 用户："在页面上演示如何新建活动，并让我看到每一步。"
- 正确动作：使用 \`get_accessible_pages\` → \`navigate_to_page\` → \`get_page_structure\` → \`fill_form\`…
- 禁止：调用 \`execute_activity_workflow\`

**示例C（混合语句处理建议）**
- 用户："先在页面上看下活动中心，再帮我自动生成一个活动方案。"
  - 如果用户在**首次请求**里已经说出“自动生成”，可直接调用 \`execute_activity_workflow\`。
  - 若对话已进入页面操作流程，再出现“自动添加/自动生成”，仅表示希望免确认，**禁止**改用此工作流。

**常见错误（避免）**
- ❌ 用户说“演示”或“页面上操作”仍调用 \`execute_activity_workflow\`
- ❌ 对话已进入页面操作流程又改用工作流
- ❌ 将工作流拆成多个工具（create_activity、generate_poster 等）依次调用`
};

export default workflowGuideTemplate;

