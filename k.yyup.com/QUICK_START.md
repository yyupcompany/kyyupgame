# 🚀 快速入门指南

## 5分钟开始使用AI助手工具

### 第1步：准备环境 (1分钟)

```bash
# 确保后端服务运行
cd server && npm run dev &

# 回到项目根目录
cd ..
```

### 第2步：获取Token (1分钟)

1. 登录系统：http://localhost:5173
2. 打开浏览器开发者工具 (F12)
3. 在Console中输入：
   ```javascript
   localStorage.getItem('token') || localStorage.getItem('kindergarten_token')
   ```
4. 复制返回的token

### 第3步：设置Token (1分钟)

```bash
# 编辑测试脚本
nano batch_test_tools.sh

# 找到这行：
-H "Authorization: Bearer YOUR_JWT_TOKEN"

# 替换为：
-H "Authorization: Bearer YOUR_ACTUAL_TOKEN"
```

### 第4步：运行测试 (1分钟)

```bash
# 给脚本执行权限
chmod +x batch_test_tools.sh

# 运行测试
./batch_test_tools.sh
```

### 第5步：查看结果 (1分钟)

```bash
# 生成汇总报告
chmod +x generate_test_summary.sh
./generate_test_summary.sh

# 查看报告
cat TOOL_TEST_SUMMARY.md
```

---

## 🎯 立即测试最常用的5个工具

### 1️⃣ 查询学生信息 (any_query)

```bash
./test_single_tool.sh 1 any_query "查询大班A的学生名单"
```

### 2️⃣ 生成Excel报表 (generate_excel_report)

```bash
./test_single_tool.sh 29 generate_excel_report "生成本月学生出勤报表"
```

### 3️⃣ 创建待办清单 (create_todo_list)

```bash
./test_single_tool.sh 16 create_todo_list "新学期准备工作清单"
```

### 4️⃣ 制定活动方案 (generate_complete_activity_plan)

```bash
./test_single_tool.sh 26 generate_complete_activity_plan "母亲节活动方案"
```

### 5️⃣ 网络搜索最新政策 (web_search)

```bash
./test_single_tool.sh 28 web_search "2025年幼儿园安全管理新规"
```

---

## 📖 详细文档

- **完整指南**: [TOOLS_TESTING_README.md](./TOOLS_TESTING_README.md)
- **园长视角**: [TOOLS_TESTING_WITH_PRINCIPAL_PROMPTS.md](./TOOLS_TESTING_WITH_PRINCIPAL_PROMPTS.md)
- **API分析**: [AI_STREAM_CHAT_ANALYSIS_REPORT.md](./AI_STREAM_CHAT_ANALYSIS_REPORT.md)

---

## ❓ 需要帮助？

```bash
# 查看所有可用工具
./test_single_tool.sh

# 查看工具详细信息
cat TOOLS_TESTING_WITH_PRINCIPAL_PROMPTS.md | grep "#### [0-9]"
```

---

*祝您使用愉快！🎉*
