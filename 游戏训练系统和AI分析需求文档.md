# 游戏训练系统与AI智能分析需求文档

## 一、需求背景

当前系统已具备完整的游戏功能（机器人工厂、娃娃屋等），但缺少游戏数据记录和分析功能。需要建立一套完整的游戏训练追踪系统，记录孩子的游戏行为数据，并通过AI智能分析生成能力评估报告，为家长和教师提供科学的成长指导。

## 二、核心需求

### 2.1 游戏数据记录系统

#### 数据库设计
创建`game_training_records`表，记录以下信息：
- **基础信息**：孩子ID、家长ID、游戏类型、关卡/难度
- **时间数据**：开始时间、结束时间、总时长、暂停次数
- **过程数据**：操作步数、错误次数、提示使用次数、完成状态
- **能力维度**：记忆力得分、逻辑思维得分、专注力得分、反应速度

#### 记录时机
- **游戏开始**：创建训练记录，记录开始时间
- **游戏暂停**：累计暂停次数，记录时间段
- **操作记录**：拖拽次数、放置错误次数、重新开始次数
- **游戏结束**：记录结束时间、计算总时长、计算各维度得分、更新完成状态

### 2.2 训练报告中心（新增侧边栏菜单）

#### 页面位置
- **家长中心**：侧边栏新增"训练报告"菜单项
- **路由路径**：`/parent-center/training-report`
- **图标建议**：📊 或 📈

#### 页面布局
分为四大区域：

**区域1：统计卡片（顶部）**
- 总训练时长（小时）
- 本周训练时长
- 累计闯关数
- 平均专注时长

**区域2：训练趋势图表（左侧）**
- **时间增长曲线**：最近30天每日训练时长折线图
- **环比统计**：
  - 周环比：本周vs上周训练时长对比
  - 月环比：本月vs上月训练时长对比
- **难度分布**：各游戏难度（第1-8关）通过率柱状图

**区域3：游戏类型分析（右侧）**
- 饼图展示各游戏类型训练时长占比
- 列表展示每个游戏的详细数据：
  - 游戏名称
  - 训练次数
  - 总时长
  - 最高关卡
  - 平均完成时间

**区域4：AI智能分析（底部，核心功能）**
- **分析触发按钮**："生成AI智能分析报告"
- **AI分析内容**：
  - **能力雷达图**：5-6个维度
    - 专注力（基于游戏时长、暂停次数）
    - 记忆力（基于机器人工厂零件选择正确率）
    - 逻辑思维（基于游戏完成步数vs最优步数）
    - 反应速度（基于操作速度、完成时间）
    - 空间认知（基于拖拽准确度）
    - 学习成长（基于难度提升速度）
  - **文字分析报告**：
    - 综合评价（200-300字）
    - 优势能力（100字）
    - 待提升能力（100字）
    - 训练建议（150字）
  - **对比参考**：同龄儿童平均水平对比

### 2.3 AI分析技术方案

#### AI模型选择
- **使用模型**：豆包1.6 Flash (doubao-1.6-flash)
- **调用场景**：用户点击"生成AI智能分析报告"按钮
- **输入数据**：
  - 孩子的所有游戏记录（最近30天或全部）
  - 聚合后的能力维度得分
  - 游戏类型分布
  - 训练时长趋势

#### Prompt设计策略
系统Prompt示例：
```
你是一位资深儿童教育专家，擅长通过儿童游戏行为数据分析孩子的能力发展。
请基于提供的游戏训练数据，从专注力、记忆力、逻辑思维、反应速度、空间认知等维度进行分析。
分析要求：
1. 客观准确，基于数据说话
2. 语言温暖友好，适合家长阅读
3. 指出优势和待提升能力
4. 提供3-5条具体可行的训练建议
5. 与同龄儿童（3-6岁）平均水平对比
```

用户Prompt示例：
```
孩子基本信息：{childName}，{childAge}岁
游戏训练数据：
- 总训练时长：{totalHours}小时
- 机器人工厂：完成{robotLevels}关，平均时长{avgTime}分钟
- 娃娃屋游戏：完成{dollhouseLevels}关，错误率{errorRate}%
- 专注力得分：{focusScore}/100（基于游戏时长、暂停次数）
- 记忆力得分：{memoryScore}/100（基于零件选择正确率）
- 逻辑思维得分：{logicScore}/100（基于完成步数优化度）
... [其他数据]

请生成能力分析报告，包括：
1. 各维度雷达图数值（JSON格式）
2. 综合评价
3. 优势能力
4. 待提升能力
5. 训练建议
```

#### 响应格式
```json
{
  "radarData": {
    "专注力": 85,
    "记忆力": 78,
    "逻辑思维": 82,
    "反应速度": 75,
    "空间认知": 80,
    "学习成长": 88
  },
  "overallEvaluation": "您的孩子在游戏训练中表现出色...",
  "strengths": "专注力和学习成长能力突出...",
  "areasToImprove": "反应速度方面还有提升空间...",
  "suggestions": [
    "建议增加快节奏游戏训练，提升反应速度",
    "保持每天20-30分钟的训练时长",
    "适时增加难度，挑战更高关卡"
  ],
  "peerComparison": "您的孩子在同龄儿童中处于前30%水平"
}
```

### 2.4 游戏记录触发点修改

#### 机器人工厂游戏
修改`RobotFactory.vue`：
- **onMounted**：调用API创建训练记录
- **handleDrop**：记录每次拖拽操作
- **handleLevelComplete**：更新关卡完成数据
- **handleBack/onUnmounted**：结束记录，计算总时长

#### 其他游戏同理
所有游戏都需要遵循相同的数据记录规范。

### 2.5 API接口设计

#### 创建训练记录
```
POST /api/game-training/start
Body: {
  childId, gameType, level, difficulty
}
Response: { recordId }
```

#### 更新训练记录
```
PUT /api/game-training/:recordId
Body: {
  operationCount, errorCount, pauseCount, status
}
```

#### 结束训练记录
```
POST /api/game-training/:recordId/complete
Body: {
  completionStatus, finalScore, abilityScores
}
```

#### 获取训练报告数据
```
GET /api/game-training/report/:childId
Params: { dateRange, gameType }
Response: {
  statistics, trendData, gameDistribution
}
```

#### AI分析生成
```
POST /api/game-training/ai-analysis/:childId
Body: { dateRange }
Response: {
  radarData, evaluation, suggestions
}
```

## 三、角色页面完善需求

### 3.1 教师中心未实现页面
经初步分析，以下教师专属页面需要实现或完善：
- **训练数据查看**：查看所有学生的游戏训练数据
- **班级训练报告**：班级整体游戏训练情况分析
- **学生能力对比**：班级内学生能力雷达图对比

### 3.2 Admin/园长中心未实现页面
需要实现的统计和分析页面：
- **全园训练概览**：所有孩子的游戏训练总体数据
- **游戏参与率分析**：各游戏的参与度、完成率统计
- **能力分布分析**：全园孩子的能力雷达图分布

### 3.3 AI功能统一规范
所有涉给出及AI分析的功能：
- **统一使用模型**：doubao-1.6-flash（豆包AI Bridge）
- **调用方式**：通过`RefactoredMultimodalService`
- **响应时间优化**：使用流式响应，避免长时间等待
- **错误处理**：API调用失败时友好提示

## 四、数据库Schema设计

### game_training_records表
```sql
CREATE TABLE game_training_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  child_id INT NOT NULL,
  parent_id INT NOT NULL,
  game_type VARCHAR(50) NOT NULL, -- 'robot-factory', 'dollhouse'等
  game_level INT, -- 关卡/难度
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_seconds INT, -- 总时长（秒）
  pause_count INT DEFAULT 0,
  operation_count INT DEFAULT 0, -- 操作次数
  error_count INT DEFAULT 0, -- 错误次数
  hint_count INT DEFAULT 0, -- 提示使用次数
  completion_status ENUM('ongoing', 'completed', 'abandoned') DEFAULT 'ongoing',
  -- 能力维度得分
  focus_score INT, -- 专注力
  memory_score INT, -- 记忆力
  logic_score INT, -- 逻辑思维
  reaction_score INT, -- 反应速度
  spatial_score INT, -- 空间认知
  learning_score INT, -- 学习成长
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_child_game (child_id, game_type),
  INDEX idx_parent (parent_id),
  INDEX idx_date (start_time)
);
```

### game_ai_analysis表（AI分析结果缓存）
```sql
CREATE TABLE game_ai_analysis (
  id INT PRIMARY KEY AUTO_INCREMENT,
  child_id INT NOT NULL,
  analysis_date DATE NOT NULL,
  date_range_start DATE,
  date_range_end DATE,
  radar_data JSON, -- 雷达图数据
  overall_evaluation TEXT, -- 综合评价
  strengths TEXT, -- 优势能力
  areas_to_improve TEXT, -- 待提升能力
  suggestions JSON, -- 训练建议（数组）
  peer_comparison TEXT, -- 同龄对比
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_child_date (child_id, analysis_date)
);
```

## 五、开发优先级与分阶段计划

### 阶段一：数据基础（1-2天）
1. 创建数据库表和模型
2. 实现游戏记录的基本API（创建、更新、结束）
3. 在机器人工厂游戏中集成数据记录

### 阶段二：报告页面（2-3天）
1. 创建训练报告页面框架
2. 实现统计数据获取和展示
3. 集成ECharts图表（折线图、柱状图、饼图、雷达图）
4. 实现环比计算和显示

### 阶段三：AI智能分析（2-3天）
1. 设计AI分析Prompt
2. 实现AI分析API接口
3. 集成豆包1.6 Flash模型
4. 实现雷达图数据解析和渲染
5. 优化AI响应展示（流式加载）

### 阶段四：角色权限与扩展（1-2天）
1. 教师中心训练数据查看功能
2. Admin全园训练数据统计
3. 权限控制和数据隔离

## 六、技术关键点

### 6.1 能力得分计算逻辑

**专注力**：
- 游戏时长 ÷ (暂停次数 + 1) × 权重
- 中途放弃扣分

**记忆力**（机器人工厂）：
- 零件选择正确率 × 100
- 重复错误扣分

**逻辑思维**：
- 最优步数 ÷ 实际步数 × 100
- 一次性正确加分

**反应速度**：
- 标准时间 ÷ 实际时间 × 100
- 首次尝试时间最优

**空间认知**：
- 拖拽精准度（命中槽位一次成功）
- 位置理解准确性

**学习成长**：
- 难度提升速度
- 同一关卡重复次数（越少越好）

### 6.2 AI分析调用流程
1. 用户点击"生成AI分析"按钮
2. 前端显示加载动画
3. 后端聚合孩子的训练数据
4. 构建Prompt调用豆包AI
5. 解析AI响应的JSON数据
6. 保存分析结果到数据库（缓存7天）
7. 返回前端并渲染雷达图和文字报告

### 6.3 性能优化
- **数据聚合**：后端预计算能力得分，减少实时计算
- **缓存策略**：AI分析结果缓存7天，同一时间段不重复生成
- **分页加载**：训练记录列表支持分页和筛选
- **图表优化**：ECharts按需加载，减小Bundle体积

## 七、参考设计

### 参考测评报告页面（/parent-center/assessment/report）
- **布局风格**：顶部概况卡片 + 详细维度分析 + AI文字报告
- **雷达图样式**：5-6个维度，彩色填充，清晰标注
- **数据展示**：百分制得分 + 文字描述
- **配色方案**：与测评报告保持一致（蓝色主题，渐变效果）

### 区别点
- **测评报告**：基于问答和互动测试，一次性快照
- **训练报告**：基于持续的游戏行为数据，动态成长轨迹

## 八、用户体验要点

### 8.1 家长端
- 清晰直观的数据可视化
- 一键生成AI分析报告
- 趋势变化一目了然
- 具体可行的训练建议

### 8.2 教师端
- 快速查看学生训练情况
- 班级对比功能
- 导出报告功能

### 8.3 Admin端
- 全园数据概览
- 游戏使用率分析
- 辅助课程设计决策

## 九、开发验收标准

1. ✅ 游戏开始/结束能自动记录数据
2. ✅ 训练报告页面正确展示所有图表
3. ✅ AI分析能正常调用并返回合理结果
4. ✅ 雷达图准确反映各维度得分
5. ✅ 环比计算准确无误
6. ✅ 各角色权限正确，数据隔离
7. ✅ 页面响应速度<2秒，AI分析<10秒
8. ✅ 移动端自适应良好

## 十、后续扩展方向

- 家长和孩子能力对比（家长也可以玩游戏）
- 游戏推荐系统（AI推荐适合孩子当前能力的游戏）
- 成长轨迹视频（自动生成孩子能力成长的动画视频）
- 社交分享（家长可分享孩子的成就到朋友圈）

---

**预估工作量**：6-8个工作日
**技术难点**：AI Prompt设计、能力得分算法、实时数据聚合
**核心价值**：从"游戏娱乐"升级为"科学训练"，为幼儿园提供差异化竞争力





