# AI助手工具测试提示词清单

> **测试说明**：请在浏览器中打开 http://localhost:5173/ai，然后依次输入以下提示词进行测试

---

## 📊 一、上下文注入工具测试 (1个)

### 1. get_organization_status - 获取机构现状
```
测试提示词：
"帮我查看一下幼儿园当前的运营现状"
```
**预期结果**：调用 get_organization_status 工具，返回机构的生源、师资、招生等全面信息

---

## 🧭 二、页面操作工具测试 (8个)

### 2. navigate_to_page - 页面导航
```
测试提示词：
"帮我打开活动中心页面"
```
**预期结果**：调用 navigate_to_page 工具，跳转到活动中心页面

### 3. capture_screen - 截图
```
测试提示词：
"帮我截取当前页面的截图"
```
**预期结果**：调用 capture_screen 工具，返回页面截图

### 4. fill_form - 填写表单
```
测试提示词：
"帮我打开学生管理页面，然后填写新增学生表单，姓名是张三，年龄5岁"
```
**预期结果**：调用 navigate_to_page 和 fill_form 工具

### 5. get_page_structure - 获取页面结构
```
测试提示词：
"帮我分析一下当前页面的结构"
```
**预期结果**：调用 get_page_structure 工具，返回页面的表单、按钮等元素结构

### 6. validate_page_state - 验证页面状态
```
测试提示词：
"帮我检查一下当前页面是否正常加载"
```
**预期结果**：调用 validate_page_state 工具，验证页面状态

### 7. click_element - 点击元素
```
测试提示词：
"帮我点击页面上的新建按钮"
```
**预期结果**：调用 get_page_structure 找到按钮，然后调用 click_element 工具

### 8. submit_form - 提交表单
```
测试提示词：
"帮我提交当前页面的表单"
```
**预期结果**：调用 submit_form 工具

### 9. wait_for_element - 等待元素
```
测试提示词：
"等待页面加载完成后，点击提交按钮"
```
**预期结果**：调用 wait_for_element 等待元素出现

---

## 📋 三、任务管理工具测试 (5个)

### 10. analyze_task_complexity - 分析任务复杂度
```
测试提示词：
"帮我策划一个春季运动会活动，包括活动方案、预算、人员安排和宣传推广"
```
**预期结果**：先调用 analyze_task_complexity 分析任务复杂度，判断需要创建TodoList

### 11. create_todo_list - 创建待办清单
```
测试提示词：
"帮我创建一个招生季准备工作的清单"
```
**预期结果**：调用 create_todo_list 工具，创建任务清单

### 12. update_todo_task - 更新任务状态
```
测试提示词：
"把第一个任务标记为已完成"
```
**预期结果**：调用 update_todo_task 工具，更新任务状态

### 13. get_todo_list - 获取任务清单
```
测试提示词：
"帮我查看一下当前的任务清单"
```
**预期结果**：调用 get_todo_list 工具，返回当前任务列表

### 14. delete_todo_task - 删除任务
```
测试提示词：
"删除第二个任务"
```
**预期结果**：调用 delete_todo_task 工具

---

## 🎨 四、UI展示工具测试 (1个)

### 15. render_component - 渲染UI组件
```
测试提示词：
"帮我用表格展示最近10个学生的信息"
```
**预期结果**：调用 any_query 查询数据，然后调用 render_component 渲染表格组件

```
测试提示词2：
"用柱状图展示最近3个月的招生趋势"
```
**预期结果**：调用 any_query 查询数据，然后调用 render_component 渲染图表组件

```
测试提示词3：
"用卡片展示当前的招生统计数据"
```
**预期结果**：调用 any_query 查询数据，然后调用 render_component 渲染卡片组件

---

## 🧠 五、专家咨询工具测试 (4个)

### 16. call_expert - 调用专家
```
测试提示词：
"请招生策划专家帮我分析一下当前的招生形势"
```
**预期结果**：调用 call_expert 工具，传入 expert_id: "planner"

### 17. get_expert_list - 获取专家列表
```
测试提示词：
"有哪些专家可以咨询？"
```
**预期结果**：调用 get_expert_list 工具，返回可用专家列表

### 18. consult_recruitment_planner - 咨询招生策划专家
```
测试提示词：
"请招生策划专家给我一些提高招生率的建议"
```
**预期结果**：调用 consult_recruitment_planner 工具

### 19. 综合专家咨询测试
```
测试提示词：
"请教育专家帮我设计一个幼儿科学启蒙课程"
```
**预期结果**：调用 call_expert 工具，传入 expert_id: "education_expert"

---

## 🔍 六、智能查询工具测试 (2个)

### 20. any_query - 复杂智能查询
```
测试提示词：
"查询最近10个活动的参与人数和满意度评分"
```
**预期结果**：调用 any_query 工具进行复杂查询

```
测试提示词2：
"统计每个班级的学生人数和师资配比"
```
**预期结果**：调用 any_query 工具，自动调用多个API整合数据

```
测试提示词3：
"分析最近6个月的招生趋势和转化率"
```
**预期结果**：调用 any_query 工具进行趋势分析

### 21. read_data_record - 简单数据查询
```
测试提示词：
"查询ID为1的学生信息"
```
**预期结果**：调用 read_data_record 工具进行简单查询

```
测试提示词2：
"查询所有教师列表"
```
**预期结果**：调用 read_data_record 工具

---

## 🌐 七、网络搜索工具测试 (1个)

### 22. web_search - 网络搜索
```
测试提示词：
"搜索一下最新的学前教育政策"
```
**预期结果**：调用 web_search 工具，返回搜索结果

```
测试提示词2：
"帮我查一下2024年幼儿园招生的行业趋势"
```
**预期结果**：调用 web_search 工具，searchType: "industry"

---

## 🚀 八、工作流工具测试 (2个)

### 23. generate_complete_activity_plan - 生成活动方案
```
测试提示词：
"帮我策划一个六一儿童节活动"
```
**预期结果**：调用 generate_complete_activity_plan 工具，生成完整的活动方案（Markdown格式）

### 24. execute_activity_workflow - 执行活动工作流
```
测试提示词：
"帮我创建一个中秋节亲子活动，主题是月饼制作，时间是9月15日下午2点"
```
**预期结果**：
1. 先调用 generate_complete_activity_plan 生成方案
2. 用户确认后，调用 execute_activity_workflow 自动创建活动、生成海报、配置营销策略

---

## 📝 九、数据库CRUD工具测试 (5个)

### 25. create_data_record - 创建数据
```
测试提示词：
"帮我创建一个新的活动，名称是春游踏青，时间是4月15日"
```
**预期结果**：调用 create_data_record 工具创建活动记录

```
测试提示词2：
"添加一个新教师，姓名李老师，科目是英语"
```
**预期结果**：调用 create_data_record 工具创建教师记录

### 26. update_data_record - 更新数据
```
测试提示词：
"把刚才创建的活动的时间改为4月20日"
```
**预期结果**：调用 update_data_record 工具更新活动记录

### 27. delete_data_record - 删除数据
```
测试提示词：
"删除刚才创建的活动"
```
**预期结果**：调用 delete_data_record 工具删除记录

```
测试提示词2（软删除）：
"软删除ID为10的活动记录"
```
**预期结果**：调用 delete_data_record 工具，deleteType: "soft"

### 28. batch_import_data - 批量导入
```
测试提示词：
"帮我批量导入学生数据：
张三，5岁，小班
李四，4岁，小班
王五，6岁，大班"
```
**预期结果**：调用 batch_import_data 工具批量创建学生记录

### 29. read_data_record - 读取数据（已在查询工具中测试）
```
测试提示词：
"查询活动表中最近创建的5条记录"
```
**预期结果**：调用 read_data_record 工具

---

## 📄 十、文档生成工具测试 (4个)

### 30. generate_pdf_report - 生成PDF报告
```
测试提示词：
"帮我生成一份最近一个月的招生数据分析PDF报告"
```
**预期结果**：调用 any_query 查询数据，然后调用 generate_pdf_report 生成PDF

### 31. generate_excel_report - 生成Excel报表
```
测试提示词：
"导出所有学生信息为Excel表格"
```
**预期结果**：调用 read_data_record 查询数据，然后调用 generate_excel_report 生成Excel

### 32. generate_word_document - 生成Word文档
```
测试提示词：
"生成一份春季运动会的活动方案Word文档"
```
**预期结果**：调用 generate_complete_activity_plan 生成方案，然后调用 generate_word_document 生成Word

### 33. generate_ppt_presentation - 生成PPT演示文稿
```
测试提示词：
"制作一份招生宣讲PPT，包含幼儿园介绍、师资力量、特色课程"
```
**预期结果**：调用 any_query 查询相关数据，然后调用 generate_ppt_presentation 生成PPT

---

## 🎯 十一、综合场景测试

### 34. 复杂工作流测试
```
测试提示词：
"我要策划一个秋季亲子运动会：
1. 生成活动方案
2. 创建活动记录
3. 生成活动海报
4. 导出活动方案为Word文档
5. 制作宣讲PPT"
```
**预期结果**：
1. analyze_task_complexity 分析任务复杂度
2. create_todo_list 创建任务清单
3. execute_activity_workflow 执行活动工作流
4. generate_word_document 生成Word
5. generate_ppt_presentation 生成PPT
6. update_todo_task 更新任务状态

### 35. 数据分析 + 可视化测试
```
测试提示词：
"分析最近3个月的招生数据，用图表展示趋势，并生成PDF分析报告"
```
**预期结果**：
1. any_query 查询招生数据
2. render_component 渲染趋势图表
3. generate_pdf_report 生成PDF报告

### 36. 专家咨询 + 方案生成测试
```
测试提示词：
"请招生策划专家分析当前招生形势，并给出改进方案，最后生成一份招生改进计划Word文档"
```
**预期结果**：
1. get_organization_status 获取机构现状
2. call_expert 咨询招生专家
3. generate_word_document 生成Word文档

### 37. 页面操作 + 数据创建测试
```
测试提示词：
"打开活动中心，创建一个新活动：六一儿童节文艺汇演，时间6月1日上午9点，然后截图确认"
```
**预期结果**：
1. navigate_to_page 打开活动中心
2. create_data_record 创建活动
3. capture_screen 截图确认

---

## ✅ 测试检查清单

请在测试过程中检查以下内容：

- [ ] **工具调用成功**：每个工具是否被正确调用
- [ ] **参数传递正确**：工具参数是否符合预期
- [ ] **结果返回正确**：工具执行结果是否正确
- [ ] **UI展示正常**：前端是否正确展示工具调用过程和结果
- [ ] **思考过程清晰**：AI的思考过程是否在右侧栏显示
- [ ] **错误处理正常**：遇到错误时是否有合理提示
- [ ] **多轮对话流畅**：复杂任务的多轮工具调用是否流畅
- [ ] **TodoList管理**：复杂任务是否自动创建TodoList并更新状态

---

## 📝 测试记录模板

建议在测试时记录以下信息：

```
工具名称：xxx
测试提示词：xxx
预期结果：xxx
实际结果：xxx
是否通过：✅/❌
问题描述：xxx
截图：xxx
```

---

## 🔧 常见问题排查

如果测试过程中遇到问题：

1. **工具未被调用**
   - 检查提示词是否足够明确
   - 查看AI的思考过程，判断是否理解了意图
   - 尝试更直接的表述

2. **参数错误**
   - 检查工具定义中的参数要求
   - 查看控制台日志中的参数值
   - 补充必要的参数信息

3. **执行失败**
   - 查看错误提示
   - 检查后端服务是否正常
   - 查看浏览器控制台和服务器日志

4. **结果不符合预期**
   - 检查数据库中是否有足够的测试数据
   - 验证工具实现逻辑
   - 查看AI的理解是否有偏差

---

**测试开始时间**：_______________
**测试完成时间**：_______________
**测试人员**：_______________
**通过率**：_______________

