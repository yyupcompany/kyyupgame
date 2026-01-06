# 幼儿园AI助手工具完整测试报告
## 园长视角的工具使用指南与测试结果

---

## 📝 前言

亲爱的老师们，作为园长，我经常需要处理各种幼儿园管理事务。今天，我想和大家分享一套强大的AI工具，它们可以帮助我们更高效地管理幼儿园的方方面面。

这些工具就像我们的贴心助手，无论是查询学生信息、分析教学数据，还是创建活动方案，都能快速准确地帮到我们。让我们一起看看它们如何工作吧！

---

## 🔧 工具分类说明

我将这些工具按照我们幼儿园日常工作的需要，分为以下几个类别：

### 📚 第一类：数据查询与管理类 (6个工具)
这些工具帮助我们快速查询和管理各类基础数据。

### 🎨 第二类：页面操作类 (8个工具)
这些工具帮助我们在系统中进行各种操作。

### ✅ 第三类：任务管理类 (5个工具)
这些工具帮助我们分解和管理复杂任务。

### 🎭 第四类：UI展示类 (2个工具)
这些工具帮助我们创建美观的展示界面。

### 👨‍🏫 第五类：专家咨询类 (4个工具)
这些工具帮助我们获取专业建议。

### 🔄 第六类：工作流类 (2个工具)
这些工具帮助我们自动化复杂的工作流程。

### 🌐 第七类：网络搜索类 (1个工具)
这个工具帮助我们获取最新的行业信息。

### 📄 第八类：文档生成类 (4个工具)
这些工具帮助我们生成各种专业文档。

### 🛠️ 第九类：其他工具类 (4个工具)
这些工具提供系统级的辅助功能。

---

## 📋 工具详细测试

### 第一类：数据查询与管理类

#### 1. any_query - 万能数据查询工具

**园长的话**：
"老师们，这个工具就像我们的万能数据库查询器。无论你想了解学生情况、教师信息，还是活动数据，只需要用自然语言描述你的需求，它就能帮你找到答案。"

**测试提示词（园长风格）**：
```json
{
  "message": "园长您好，我最近想了解一下咱们幼儿园的整体情况，特别是学生人数、班级数量和师资配比这些关键数据。另外，我也想看看最近一个月的招生情况如何，是否达到了预期目标？请您帮我分析一下这些数据，为下学期的工作规划提供参考。",
  "userId": "1",
  "conversationId": "conv_001",
  "context": {
    "role": "admin",
    "enableTools": true
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "园长您好，我最近想了解一下咱们幼儿园的整体情况，特别是学生人数、班级数量和师资配比这些关键数据。",
    "userId": "1",
    "conversationId": "conv_001",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**预期返回**：
```
🤔 AI开始思考...
🔍 识别到需要使用工具
🚀 开始执行工具调用
✅ 工具调用执行完成
💡 AI回答完成
🎉 对话完成
```

**实际返回记录**：
[待测试后填写]

---

#### 2. read_data_record - 简单数据读取工具

**园长的话**：
"当我们只需要快速查看某个具体数据时，这个工具最方便。比如想看看某个班的学生名单，或者某个老师的详细信息，它都能快速返回。"

**测试提示词（园长风格）**：
```json
{
  "message": "小王老师想查看一下大班A的学生名单，方便安排明天的亲子活动。请帮我查询一下这个班的所有学生信息，包括姓名、年龄和联系方式，谢谢！",
  "userId": "2",
  "context": {
    "role": "teacher"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请帮我查询大班A的学生名单",
    "userId": "2",
    "context": {
      "role": "teacher",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 3. create_data_record - 数据创建工具

**园长的话**：
"当我们需要添加新记录时，这个工具很实用。比如新来了一个学生，或者要创建一个新的活动，使用这个工具可以确保数据准确录入。"

**测试提示词（园长风格）**：
```json
{
  "message": "李主任，今天有个新孩子要入园，小名叫豆豆，5岁了，家长希望他能上大班。请帮忙创建一条学生记录，包含姓名、年龄、班级等信息。如果需要其他必需信息，请告诉我。",
  "userId": "3",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请帮我创建一个新的学生记录：姓名豆豆，年龄5岁，班级大班A",
    "userId": "3",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 4. update_data_record - 数据更新工具

**园长的话**：
"信息变更是在所难免的，比如孩子升班了、换老师了，或者家长联系方式变了。这个工具可以帮我们快速准确地更新这些信息。"

**测试提示词（园长风格）**：
```json
{
  "message": "陈老师，豆豆这个孩子表现很棒，经过和家长商量，决定让他从中班A升到大班A。请帮忙更新一下他的班级信息。另外，他妈妈的联系电话也换了，新号码是138****5678，也请帮忙更新一下。",
  "userId": "4",
  "context": {
    "role": "teacher"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请更新学生豆豆的班级信息，从中班A改为大班A，并更新联系电话为138****5678",
    "userId": "4",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 5. delete_data_record - 数据删除工具

**园长的话**：
"数据删除需要谨慎，这个工具会先检查是否有关联数据，确保不会影响系统的完整性。就像我们处理退园孩子的手续一样，要确保所有相关手续都办完。"

**测试提示词（园长风格）**：
```json
{
  "message": "张主任，小明这个孩子因为家庭原因要退园了，家长已经办完了所有手续。请帮忙删除他的学生记录。删除前请检查一下是否有关联的费用记录、活动参与记录等需要一并处理。",
  "userId": "5",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请删除退园学生小明的记录，并检查关联数据",
    "userId": "5",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 6. batch_import_data - 批量数据导入工具

**园长的话**：
"有时候我们需要一次性录入很多数据，比如新学期来了十几个新生，或者要导入所有孩子的体检数据。这个工具可以大大提高我们的工作效率。"

**测试提示词（园长风格）**：
```json
{
  "message": "王主任，新学期要到了，这次我们新招了15个学生。家长已经把孩子们的信息表格发给我了，包含姓名、年龄、性别、家长电话等信息。麻烦您帮忙批量导入这些学生信息，这样我们就不用一个个手动录入了。",
  "userId": "6",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请帮我批量导入15个新学生的信息，包含姓名、年龄、性别、家长电话",
    "userId": "6",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

### 第二类：页面操作类

#### 7. navigate_to_page - 页面导航工具

**园长的话**：
"有时候我们想快速跳转到某个功能页面，比如想去财务中心查看费用，或者去活动中心查看下周的安排。这个工具可以帮我们快速导航。"

**测试提示词（园长风格）**：
```json
{
  "message": "小李，我想去查看一下这个月的费用收支情况，麻烦导航到财务中心页面。另外，我也想看看最近的活动安排，方便和家长们沟通。",
  "userId": "7",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请导航到财务中心页面查看费用情况",
    "userId": "7",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 8. capture_screen - 页面截图工具

**园长的话**：
"有时候我们需要截图保存某些信息，比如系统显示的重要数据、或者某个页面的配置信息。这个工具可以帮我们快速截图。"

**测试提示词（园长风格）**：
```json
{
  "message": "陈老师，麻烦你把当前页面的学生统计信息截图保存一下，我要把它放到下周的工作汇报里。另外，如果可以的话，把整体数据概况也截个图，方便我向董事会汇报。",
  "userId": "8",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请截图保存当前页面的学生统计信息",
    "userId": "8",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 9. type_text - 文本输入工具

**园长的话**：
"当需要在系统中输入文本信息时，这个工具很方便。比如填写孩子的评语、备注信息，或者在系统中添加通知公告。"

**测试提示词（园长风格）**：
```json
{
  "message": "周老师，麻烦你帮我在这份学生评估表上输入一下评语。这个孩子的评语可以这样写：'小明这学期进步很大，特别是在语言表达和社交能力方面有了明显提升。希望下学期继续保持，做一个快乐健康的好孩子。'",
  "userId": "9",
  "context": {
    "role": "teacher"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请在学生评估表中输入评语：小明这学期进步很大...",
    "userId": "9",
    "context": {
      "role": "teacher",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 10. select_option - 选项选择工具

**园长的话**：
"有时候我们需要在下拉菜单中选择选项，比如选择孩子的年龄段、选择班级，或者选择活动类型。这个工具可以帮我们快速选择。"

**测试提示词（园长风格）**：
```json
{
  "message": "刘老师，麻烦你帮我填写一份活动报名表。请在活动类型那里选择'亲子活动'，年龄段选择'3-4岁'，参与班级选择'小班A'和'小班B'。这样就能快速定位到我们需要的选项了。",
  "userId": "10",
  "context": {
    "role": "teacher"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请在活动报名表中选择：活动类型-亲子活动，年龄段-3-4岁，参与班级-小班A、小班B",
    "userId": "10",
    "context": {
      "role": "teacher",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 11. navigate_back - 页面返回工具

**园长的话**：
"有时候我们会点错页面，或者需要回到上一步操作。这个工具可以帮我们快速返回到上一个页面，或者返回多步。"

**测试提示词（园长风格）**：
```json
{
  "message": "小王，我刚才点错页面了，本来想去学生管理，结果点到活动管理了。麻烦你帮我返回到上一个页面，也就是学生管理页面吧。",
  "userId": "11",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请返回到上一个页面",
    "userId": "11",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 12. fill_form - 表单填写工具

**园长的话**：
"填写表单是日常工作中经常遇到的事情，比如新孩子入园要填表、活动报名要填表。这个工具可以帮我们自动填写表单内容。"

**测试提示词（园长风格）**：
```json
{
  "message": "李主任，新入园的小花同学需要填写入园登记表。家长已经提供了所有信息，我来口述，你帮忙填写一下：姓名：花朵朵，性别：女，年龄：4岁，家长姓名：李女士，电话：139****1234，地址：阳光小区3号楼2单元501。",
  "userId": "12",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请填写入园登记表：姓名花朵朵，性别女，年龄4岁，家长李女士，电话139****1234",
    "userId": "12",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 13. submit_form - 表单提交工具

**园长的话**：
"填写完表单后，我们需要提交表单才能保存信息。这个工具可以帮我们快速提交表单。"

**测试提示词（园长风格）**：
```json
{
  "message": "陈老师，刚才填写的新生活动报名表已经填完了，麻烦你点击提交按钮，把信息保存到系统中吧。这样家长们就能看到活动信息了。",
  "userId": "13",
  "context": {
    "role": "teacher"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请提交新生活动报名表",
    "userId": "13",
    "context": {
      "role": "teacher",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 14. click_element - 元素点击工具

**园长的话**：
"有时候我们需要点击页面上的某个按钮或链接，比如点击'查看详情'、点击'编辑'按钮等。这个工具可以帮我们精确点击。"

**测试提示词（园长风格）**：
```json
{
  "message": "张老师，麻烦你点击一下学生列表中'小明'这个名字，我想查看他的详细信息，包括家长联系方式和入园时间等。",
  "userId": "14",
  "context": {
    "role": "teacher"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请点击学生列表中'小明'的名字，查看详细信息",
    "userId": "14",
    "context": {
      "role": "teacher",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

### 第三类：任务管理类

#### 15. analyze_task_complexity - 任务复杂度分析工具

**园长的话**：
"在安排工作时，我们经常需要判断一个任务的复杂程度。这个工具可以帮我们分析任务难度，决定是需要简单处理还是制定详细的执行计划。"

**测试提示词（园长风格）**：
```json
{
  "message": "各位老师，下个月我们要举办春季亲子运动会，请大家评估一下这个任务的复杂度。包括场地布置、活动策划、人员安排、道具准备、安全保障等多个环节。请帮忙分析一下这个任务的复杂程度，看看我们需要制定多详细的计划。",
  "userId": "15",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请分析春季亲子运动会活动的复杂程度，包括场地布置、活动策划、人员安排、道具准备、安全保障等",
    "userId": "15",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 16. create_todo_list - 创建待办清单工具

**园长的话**：
"当我们面对复杂任务时，把它分解成一个个小步骤会更容易完成。这个工具可以帮我们创建待办清单，确保每个环节都不遗漏。"

**测试提示词（园长风格）**：
```json
{
  "message": "刚才分析了春季运动会的复杂性，我觉得需要制定一个详细的计划。麻烦你帮我创建一个待办清单，把运动会的准备工作分解成具体的任务。比如：确定活动日期、制定活动方案、招募志愿者、准备活动道具、联系家长等。",
  "userId": "16",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请为春季运动会创建待办清单，包含确定活动日期、制定活动方案、招募志愿者、准备道具、联系家长等任务",
    "userId": "16",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 17. update_todo_task - 更新待办任务工具

**园长的话**：
"随着工作的推进，我们的待办事项也在不断变化。有些任务完成了，有些任务需要修改时间或内容。这个工具可以帮我们实时更新待办清单。"

**测试提示词（园长风格）**：
```json
{
  "message": "小李，我们运动会的待办清单中有个任务叫'确定活动日期'，之前计划是下月15号，但是考虑到天气因素，我们决定推迟到下月22号。请帮忙更新一下这个任务的状态和时间。另外，'准备道具'这个任务我们已经完成了，请标记为已完成。",
  "userId": "17",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请更新待办清单：将'确定活动日期'推迟到22号，将'准备道具'标记为已完成",
    "userId": "17",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 18. get_todo_list - 获取待办清单工具

**园长的话**：
"有时候我们需要查看当前有哪些待办事项，特别是当任务很多的时候。这个工具可以帮我们快速查看所有待办清单。"

**测试提示词（园长风格）**：
```json
{
  "message": "王主任，我需要查看一下当前运动会准备工作的待办清单，方便我安排下周的工作重点。请帮忙列出所有待办任务，并显示它们的完成状态和优先级。",
  "userId": "18",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请查看运动会准备工作的待办清单，显示所有任务、状态和优先级",
    "userId": "18",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 19. delete_todo_task - 删除待办任务工具

**园长的话**：
"有时候我们会发现某些任务其实不需要，或者已经被其他任务包含了。这时候我们就可以删除这些冗余的任务，保持清单的整洁。"

**测试提示词（园长风格）**：
```json
{
  "message": "陈老师，经过讨论，我们发现'准备音响设备'这个任务其实可以合并到'准备活动道具'里面，不需要单独列出。请帮忙删除这个重复的任务，保持我们的待办清单简洁明了。",
  "userId": "19",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请删除待办清单中的'准备音响设备'任务，因为它已包含在'准备活动道具'中",
    "userId": "19",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

### 第四类：UI展示类

#### 20. render_component - UI组件渲染工具

**园长的话**：
"有时候我们需要把数据以更直观的方式展示出来，比如制作一个数据表格、统计图表，或者创建一个互动组件。这个工具可以帮我们快速生成美观的展示界面。"

**测试提示词（园长风格）**：
```json
{
  "message": "李老师，下周要开家长会了，我想把孩子们这学期的表现数据做一个可视化展示。能不能制作一个互动式的图表，显示每个班级的出勤率、家长满意度、孩子的进步情况等关键指标？这样家长们看起来会更直观。",
  "userId": "20",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请创建一个互动式图表，展示班级出勤率、家长满意度、孩子进步情况等数据，用于家长会展示",
    "userId": "20",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 21. generate_html_preview - HTML预览生成工具

**园长的话**：
"有时候我们需要创建一些网页内容，比如制作一个简单的活动介绍页面，或者创建一个教学互动游戏。这个工具可以帮我们快速生成HTML页面并预览效果。"

**测试提示词（园长风格）**：
```json
{
  "message": "小王老师，我想为下周的'认识颜色'主题课制作一个简单的互动网页，让孩子们可以在电脑上玩颜色识别游戏。页面要色彩丰富、操作简单，适合3-4岁的孩子使用。能不能帮忙生成一个这样的HTML页面？",
  "userId": "21",
  "context": {
    "role": "teacher"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请生成一个互动式'认识颜色'教学游戏网页，适合3-4岁孩子，色彩丰富、操作简单",
    "userId": "21",
    "context": {
      "role": "teacher",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

### 第五类：专家咨询类

#### 22. consult_recruitment_planner - 招生策划咨询工具

**园长的话**：
"招生工作是我们幼儿园的重要任务之一，涉及到市场分析、策略制定、家长沟通等多个方面。这个工具可以帮我们获取专业的招生策划建议。"

**测试提示词（园长风格）**：
```json
{
  "message": "张园长，今年我们幼儿园计划在新学期扩招2个班级，预计新增60个学位。但是考虑到周边竞争越来越激烈，我想咨询一下专业的招生策略。请问我们应该重点突出哪些特色？如何吸引更多优质生源？另外，定价策略有什么建议吗？",
  "userId": "22",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请提供招生策划建议：幼儿园计划扩招2个班级，新增60个学位，如何制定招生策略和定价方案？",
    "userId": "22",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 23. call_expert - 调用特定专家工具

**园长的话**：
"在我们幼儿园的日常工作中，经常需要不同领域的专业建议。比如教育专家可以给我们教学指导，心理专家可以帮助我们更好地了解孩子的发展特点。"

**测试提示词（园长风格）**：
```json
{
  "message": "李主任，我们最近发现有些孩子在入园时表现出较强的分离焦虑，家长也很担心。我想咨询一下儿童心理学专家，请教如何帮助这些孩子更快适应幼儿园生活？另外，在家长沟通方面有什么建议吗？",
  "userId": "23",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请调用儿童心理学专家，咨询如何帮助有分离焦虑的孩子适应幼儿园生活，以及家长沟通建议",
    "userId": "23",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 24. get_expert_list - 获取专家列表工具

**园长的话**：
"有时候我们不确定哪个专家能帮助我们解决特定问题。这个工具可以帮我们查看所有可用的专家领域和他们的专长。"

**测试提示词（园长风格）**：
```json
{
  "message": "王老师，我想了解一下系统中都有哪些领域的专家可以帮助我们。比如在活动策划、教学方法、幼儿心理、营养健康、安全管理等方面，我们能获得哪些专业建议？",
  "userId": "24",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请列出所有可用的专家领域，包括活动策划、教学方法、幼儿心理、营养健康、安全管理等方面的专家",
    "userId": "24",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 25. list_available_tools - 工具发现器

**园长的话**：
"有时候我们不知道系统中有哪些工具可以帮助我们。这个工具就像一个工具目录，可以帮我们发现所有可用的功能。"

**测试提示词（园长风格）**：
```json
{
  "message": "陈主任，作为新入职的老师，我想了解一下我们幼儿园系统都有哪些实用的工具和功能？特别是可以帮助我更好地管理班级、了解孩子、与家长沟通的工具。请帮我列出所有的工具及其功能说明。",
  "userId": "25",
  "context": {
    "role": "teacher"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请列出幼儿园管理系统中的所有工具及其功能，帮助新老师了解系统能力",
    "userId": "25",
    "context": {
      "role": "teacher",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

### 第六类：工作流类

#### 26. generate_complete_activity_plan - 生成完整活动方案工具

**园长的话**：
"举办一个成功的活动需要周密的计划和准备。这个工具可以帮我们制定一个完整的活动方案，包括各个环节的安排和注意事项。"

**测试提示词（园长风格）**：
```json
{
  "message": "张老师，下个月是母亲节，我想为孩子们举办一个'感恩妈妈'的主题活动。请帮忙制定一个完整的活动方案，包括活动目标、活动流程、材料准备、人员分工、安全考虑等各个环节。这样我们就能确保活动顺利进行了。",
  "userId": "26",
  "context": {
    "role": "teacher"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请制定母亲节'感恩妈妈'主题活动的完整方案，包含活动目标、流程、材料准备、人员分工、安全考虑",
    "userId": "26",
    "context": {
      "role": "teacher",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 27. execute_activity_workflow - 执行活动工作流工具

**园长的话**：
"当我们有了活动方案后，需要一步步执行。这个工具可以帮我们自动化活动执行的流程，确保每个环节都能按计划进行。"

**测试提示词（园长风格）**：
```json
{
  "message": "李主任，母亲节活动方案已经制定好了，现在需要开始执行。请按照方案中的步骤，一步步执行活动准备工作：先采购活动材料，然后通知家长，接着培训老师，最后进行活动彩排。每个步骤完成后请告诉我结果。",
  "userId": "27",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请按照母亲节活动方案执行工作流：采购材料→通知家长→培训老师→活动彩排，每步完成后报告结果",
    "userId": "27",
    "context": {
      "role": "admin",
      "enableTools": true,
      "userInput": "母亲节活动执行"
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

### 第七类：网络搜索类

#### 28. web_search - 网络搜索工具

**园长的话**：
"有时候我们需要了解最新的教育政策、行业动态或者育儿知识。这个工具可以帮我们从互联网上搜索相关信息。"

**测试提示词（园长风格）**：
```json
{
  "message": "王园长，我想了解一下2025年最新的学前教育政策，特别是关于幼儿园安全管理和家园共育方面的新规定。另外，也想看看最近有什么好的亲子活动创意，可以借鉴到我们的工作中。",
  "userId": "28",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请搜索2025年学前教育政策、幼儿园安全管理规定、家园共育新规定，以及最新亲子活动创意",
    "userId": "28",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

### 第八类：文档生成类

#### 29. generate_excel_report - Excel报表生成工具

**园长的话**：
"制作各种报表是我们日常工作的重要组成部分。这个工具可以帮我们快速生成专业的Excel报表，包括数据统计、分析图表等。"

**测试提示词（园长风格）**：
```json
{
  "message": "陈老师，本学期快要结束了，需要制作一份学生成长报告的Excel表格。请包含以下内容：每个学生的基本信息、出勤记录、学习表现、老师评语、家长反馈等。最好还能生成一些统计图表，显示整体的教学成果。",
  "userId": "29",
  "context": {
    "role": "teacher"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请生成学生成长报告Excel报表，包含学生信息、出勤记录、学习表现、评语、家长反馈，并附上统计图表",
    "userId": "29",
    "context": {
      "role": "teacher",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 30. generate_word_document - Word文档生成工具

**园长的话**：
"有时候我们需要制作正式的通知、方案或者报告。这个工具可以帮我们快速生成格式规范的Word文档。"

**测试提示词（园长风格）**：
```json
{
  "message": "李主任，下周要召开全园家长会，需要准备一份正式的通知文档。请帮忙生成一份Word格式的家长会通知，包含：会议时间、地点、议程、注意事项等信息。格式要正式规范，便于打印和发放。",
  "userId": "30",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请生成家长会通知Word文档，包含会议时间、地点、议程、注意事项，格式正式规范",
    "userId": "30",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 31. generate_pdf_report - PDF报告生成工具

**园长的话**：
"当我们需要制作正式的报告或者证书时，PDF格式是最佳选择。这个工具可以帮我们生成专业的PDF文档。"

**测试提示词（园长风格）**：
```json
{
  "message": "王园长，学期末我们要向教育局提交一份教学质量评估报告。这份报告需要包含我们的教学成果、师资情况、安全管理、家园合作等多个方面的内容。请帮忙生成一份专业的PDF报告，格式要正式严谨。",
  "userId": "31",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请生成教学质量评估PDF报告，包含教学成果、师资情况、安全管理、家园合作等内容，格式正式严谨",
    "userId": "31",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 32. generate_ppt_presentation - PPT演示文稿生成工具

**园长的话**：
"做展示汇报时，PPT是最常用的工具。这个工具可以帮我们快速制作美观的演示文稿。"

**测试提示词（园长风格）**：
```json
{
  "message": "陈老师，下周要在园务会议上汇报本学期的教学工作总结。请制作一份PPT演示文稿，包含：工作回顾、教学成果、亮点活动、存在问题、下学期计划等内容。设计要简洁专业，便于理解和展示。",
  "userId": "32",
  "context": {
    "role": "teacher"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请制作教学工作总结PPT，包含工作回顾、教学成果、亮点活动、存在问题、下学期计划，设计简洁专业",
    "userId": "32",
    "context": {
      "role": "teacher",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

### 第九类：其他工具类

#### 33. get_organization_status - 获取机构现状工具

**园长的话**：
"了解我们幼儿园的整体运营状况对管理工作很重要。这个工具可以帮我们快速了解当前的各项数据。"

**测试提示词（园长风格）**：
```json
{
  "message": "李主任，我需要了解幼儿园的当前运营状况，包括学生总数、各班人数、师资配备、出勤率、家长满意度等关键指标。请帮忙汇总这些信息，方便我向董事会汇报。",
  "userId": "33",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请提供幼儿园当前运营状况，包括学生总数、各班人数、师资配备、出勤率、家长满意度等指标",
    "userId": "33",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 34. get_accessible_pages - 获取可访问页面工具

**园长的话**：
"有时候我们需要了解系统中都有哪些功能页面，特别是新老师可能不熟悉所有功能。"

**测试提示词（园长风格）**：
```json
{
  "message": "小张老师，刚入职可能还不太熟悉系统的所有功能。请帮忙列出系统中所有的功能页面，包括学生管理、教师管理、活动中心、财务管理等功能区域，方便我快速熟悉工作环境。",
  "userId": "34",
  "context": {
    "role": "teacher"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请列出系统中所有可访问的功能页面，包括学生管理、教师管理、活动中心、财务管理等",
    "userId": "34",
    "context": {
      "role": "teacher",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 35. get_page_structure - 获取页面结构工具

**园长的话**：
"有时候我们需要了解某个页面的具体功能和布局，这个工具可以帮我们分析页面结构。"

**测试提示词（园长风格）**：
```json
{
  "message": "王老师，我想了解一下学生管理页面的详细结构，包括有哪些功能模块、数据字段、操作按钮等。这样我可以更好地安排培训和制定操作规范。",
  "userId": "35",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请分析学生管理页面的结构，包括功能模块、数据字段、操作按钮等详细信息",
    "userId": "35",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

#### 36. validate_page_state - 验证页面状态工具

**园长的话**：
"有时候我们需要检查页面是否正常工作，数据是否完整加载。这个工具可以帮我们验证页面状态。"

**测试提示词（园长风格）**：
```json
{
  "message": "陈老师，刚才系统提示学生管理页面可能有问题，麻烦你检查一下这个页面是否正常加载，数据是否完整显示。特别要确认学生列表、搜索功能、添加按钮等关键功能是否可用。",
  "userId": "36",
  "context": {
    "role": "admin"
  }
}
```

**curl测试命令**：
```bash
curl -X POST http://localhost:3000/api/ai/unified-stream/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "请检查学生管理页面是否正常，包括数据加载、搜索功能、添加按钮等是否正常工作",
    "userId": "36",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' \
  --no-buffer
```

**实际返回记录**：
[待测试后填写]

---

## 📊 测试总结

### 工具使用建议

作为园长，我建议大家在日常工作中这样使用这些工具：

1. **数据查询与管理** - 适合日常信息查询和数据维护
2. **页面操作** - 适合快速系统操作和导航
3. **任务管理** - 适合复杂项目规划和进度跟踪
4. **UI展示** - 适合创建可视化内容和互动组件
5. **专家咨询** - 适合获取专业建议和指导
6. **工作流** - 适合自动化复杂业务流程
7. **网络搜索** - 适合获取最新行业信息
8. **文档生成** - 适合制作各类报表和文档
9. **其他工具** - 适合系统维护和状态检查

### 注意事项

1. 所有工具都需要在登录状态下使用
2. 部分工具需要相应权限才能使用
3. 工具返回的数据仅供参考，最终决策还需人工判断
4. 建议在使用前先熟悉工具的功能和使用方法

---

## 📝 测试记录

| 工具编号 | 工具名称 | 测试状态 | 返回结果记录 | 测试时间 |
|---------|---------|---------|-------------|----------|
| 1 | any_query | 待测试 | [待填写] | [待填写] |
| 2 | read_data_record | 待测试 | [待填写] | [待填写] |
| 3 | create_data_record | 待测试 | [待填写] | [待填写] |
| 4 | update_data_record | 待测试 | [待填写] | [待填写] |
| 5 | delete_data_record | 待测试 | [待填写] | [待填写] |
| 6 | batch_import_data | 待测试 | [待填写] | [待填写] |
| 7 | navigate_to_page | 待测试 | [待填写] | [待填写] |
| 8 | capture_screen | 待测试 | [待填写] | [待填写] |
| 9 | type_text | 待测试 | [待填写] | [待填写] |
| 10 | select_option | 待测试 | [待填写] | [待填写] |
| 11 | navigate_back | 待测试 | [待填写] | [待填写] |
| 12 | fill_form | 待测试 | [待填写] | [待填写] |
| 13 | submit_form | 待测试 | [待填写] | [待填写] |
| 14 | click_element | 待测试 | [待填写] | [待填写] |
| 15 | analyze_task_complexity | 待测试 | [待填写] | [待填写] |
| 16 | create_todo_list | 待测试 | [待填写] | [待填写] |
| 17 | update_todo_task | 待测试 | [待填写] | [待填写] |
| 18 | get_todo_list | 待测试 | [待填写] | [待填写] |
| 19 | delete_todo_task | 待测试 | [待填写] | [待填写] |
| 20 | render_component | 待测试 | [待填写] | [待填写] |
| 21 | generate_html_preview | 待测试 | [待填写] | [待填写] |
| 22 | consult_recruitment_planner | 待测试 | [待填写] | [待填写] |
| 23 | call_expert | 待测试 | [待填写] | [待填写] |
| 24 | get_expert_list | 待测试 | [待填写] | [待填写] |
| 25 | list_available_tools | 待测试 | [待填写] | [待填写] |
| 26 | generate_complete_activity_plan | 待测试 | [待填写] | [待填写] |
| 27 | execute_activity_workflow | 待测试 | [待填写] | [待填写] |
| 28 | web_search | 待测试 | [待填写] | [待填写] |
| 29 | generate_excel_report | 待测试 | [待填写] | [待填写] |
| 30 | generate_word_document | 待测试 | [待填写] | [待填写] |
| 31 | generate_pdf_report | 待测试 | [待填写] | [待填写] |
| 32 | generate_ppt_presentation | 待测试 | [待填写] | [待填写] |
| 33 | get_organization_status | 待测试 | [待填写] | [待填写] |
| 34 | get_accessible_pages | 待测试 | [待填写] | [待填写] |
| 35 | get_page_structure | 待测试 | [待填写] | [待填写] |
| 36 | validate_page_state | 待测试 | [待填写] | [待填写] |

---

## 🎯 结语

这套AI工具是我们幼儿园数字化管理的好帮手，它们能够帮助我们提高工作效率，更好地服务孩子和家长。希望大家能够熟练掌握这些工具的使用方法，让它们在我们的工作中发挥最大的价值。

如果在使用过程中遇到任何问题，欢迎随时交流讨论。让我们一起为孩子们创造更好的成长环境！

---

*报告生成时间: 2025-11-20*  
*园长办公室*
