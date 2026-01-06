# 教师客户跟踪SOP深度解决方案

## 🎯 核心理念

**让每个老师都能成为销售高手** - 通过标准化的SOP流程 + AI智能辅助，即使是新手教师也能高效转化客户。

---

## 📋 完整SOP流程设计

### 阶段划分（7个核心阶段）

```
陌生客户 → 初次接触 → 需求挖掘 → 方案呈现 → 异议处理 → 临门一脚 → 成交签约
```

每个阶段都有：
- ✅ **标准动作清单** - 必须完成的动作
- ✅ **话术模板** - 可直接使用的沟通话术
- ✅ **成功标志** - 进入下一阶段的标准
- ✅ **常见问题** - 该阶段常见问题及应对
- ✅ **AI建议入口** - 一键获取个性化建议

---

## 🎨 UI/UX设计方案

### 1. 主界面布局

```
┌─────────────────────────────────────────────────────────────────┐
│  客户：张女士 (3岁男孩)                    [AI全局分析] [导出报告] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SOP进度条                                              │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│  │  ① ② ③ ④ ⑤ ⑥ ⑦                                        │   │
│  │  初 需 方 异 临 成 售                                    │   │
│  │  次 求 案 议 门 交 后                                    │   │
│  │  接 挖 呈 处 一 签                                       │   │
│  │  触 掘 现 理 脚 约                                       │   │
│  │                                                         │   │
│  │  当前阶段：③ 方案呈现  进度：42%  预计成交：7天后        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────┬───────────────────────────────────────┐   │
│  │  SOP任务清单    │  沟通记录 & Timeline                  │   │
│  ├─────────────────┤                                       │   │
│  │                 │  ┌─────────────────────────────────┐ │   │
│  │ ☑ 发送课程介绍  │  │ 2025-10-06 14:30                │ │   │
│  │ ☑ 了解孩子情况  │  │ 📞 电话沟通 [AI建议]            │ │   │
│  │ ☐ 邀请试听课    │  │                                 │ │   │
│  │   [AI建议]      │  │ 💬 对话记录：                   │ │   │
│  │ ☐ 发送成功案例  │  │ 老师：您好张女士...             │ │   │
│  │   [AI建议]      │  │ 客户：我想了解...               │ │   │
│  │ ☐ 解答疑问      │  │                                 │ │   │
│  │   [AI建议]      │  │ 📷 [截图1] [截图2]              │ │   │
│  │                 │  │                                 │ │   │
│  │ 下一步建议：    │  │ 🤖 AI分析：                     │ │   │
│  │ 48小时内邀请    │  │ 客户意向度：85%                 │ │   │
│  │ 试听课          │  │ 关注点：价格、师资              │ │   │
│  │ [查看AI分析]    │  │ 建议：强调性价比...             │ │   │
│  │                 │  └─────────────────────────────────┘ │   │
│  └─────────────────┴───────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 核心功能设计

### 功能1: 对话记录 + 截图分析

#### 1.1 对话记录组件

```vue
<template>
  <div class="conversation-record">
    <!-- 对话输入区 -->
    <div class="conversation-input">
      <el-button @click="startRecording" type="primary">
        <el-icon><Microphone /></el-icon>
        语音转文字
      </el-button>
      <el-button @click="uploadScreenshot">
        <el-icon><Picture /></el-icon>
        上传截图
      </el-button>
      <el-button @click="quickInput">
        <el-icon><ChatDotRound /></el-icon>
        快速输入
      </el-button>
    </div>

    <!-- 对话内容 -->
    <div class="conversation-content">
      <div class="message teacher">
        <div class="avatar">👨‍🏫</div>
        <div class="bubble">
          <div class="text">您好张女士，我是XX幼儿园的李老师...</div>
          <div class="time">14:30</div>
        </div>
      </div>

      <div class="message customer">
        <div class="bubble">
          <div class="text">你好，我想了解一下你们的课程...</div>
          <div class="time">14:32</div>
        </div>
        <div class="avatar">👩</div>
      </div>

      <!-- 截图展示 -->
      <div class="message teacher">
        <div class="avatar">👨‍🏫</div>
        <div class="bubble">
          <div class="text">这是我们的课程介绍</div>
          <div class="screenshots">
            <el-image 
              v-for="img in screenshots" 
              :key="img.id"
              :src="img.url"
              :preview-src-list="allScreenshots"
              fit="cover"
            >
              <template #error>
                <div class="image-error">加载失败</div>
              </template>
            </el-image>
          </div>
          <el-button size="small" @click="analyzeScreenshots">
            🤖 AI分析截图
          </el-button>
        </div>
      </div>
    </div>

    <!-- AI分析结果 -->
    <div v-if="aiAnalysis" class="ai-analysis-result">
      <el-alert type="success" :closable="false">
        <template #title>
          <el-icon><MagicStick /></el-icon>
          AI截图分析
        </template>
        <div class="analysis-content">
          <p><strong>识别内容：</strong>{{ aiAnalysis.recognizedText }}</p>
          <p><strong>客户关注点：</strong>{{ aiAnalysis.focusPoints.join('、') }}</p>
          <p><strong>建议话术：</strong>{{ aiAnalysis.suggestedResponse }}</p>
        </div>
      </el-alert>
    </div>
  </div>
</template>
```

#### 1.2 截图分析功能

**技术实现**:
```typescript
// 截图上传和分析
async function uploadAndAnalyzeScreenshot(file: File) {
  // 1. 上传截图
  const uploadResult = await uploadScreenshot(file);
  
  // 2. OCR识别文字
  const ocrResult = await recognizeText(uploadResult.url);
  
  // 3. AI分析内容
  const analysis = await analyzeConversationScreenshot({
    imageUrl: uploadResult.url,
    recognizedText: ocrResult.text,
    customerInfo: currentCustomer,
    conversationHistory: conversationRecords
  });
  
  // 4. 返回分析结果
  return {
    screenshot: uploadResult,
    recognizedText: ocrResult.text,
    focusPoints: analysis.focusPoints,      // 客户关注点
    sentiment: analysis.sentiment,          // 情感倾向
    suggestedResponse: analysis.response,   // 建议回复
    nextAction: analysis.nextAction         // 下一步动作
  };
}
```

---

### 功能2: SOP标准流程

#### 2.1 SOP阶段配置

```typescript
interface SOPStage {
  id: number;
  name: string;                    // 阶段名称
  description: string;             // 阶段描述
  order: number;                   // 排序
  estimatedDays: number;           // 预计天数
  
  // 任务清单
  tasks: SOPTask[];
  
  // 成功标志
  successCriteria: {
    description: string;
    checkpoints: string[];
  };
  
  // 话术模板
  scripts: {
    opening: string;               // 开场白
    keyPoints: string[];           // 关键话术
    closing: string;               // 结束语
  };
  
  // 常见问题
  faqs: {
    question: string;
    answer: string;
    tips: string[];
  }[];
}

interface SOPTask {
  id: number;
  title: string;                   // 任务标题
  description: string;             // 任务描述
  isRequired: boolean;             // 是否必需
  estimatedTime: number;           // 预计耗时（分钟）
  order: number;                   // 排序
  
  // 任务指导
  guidance: {
    steps: string[];               // 执行步骤
    tips: string[];                // 注意事项
    examples: string[];            // 示例
  };
  
  // AI建议配置
  aiSuggestion: {
    enabled: boolean;
    prompt: string;                // AI提示词模板
  };
}
```

#### 2.2 SOP数据示例

```typescript
const sopStages: SOPStage[] = [
  {
    id: 1,
    name: "初次接触",
    description: "与客户建立第一次联系，留下良好印象",
    order: 1,
    estimatedDays: 1,
    
    tasks: [
      {
        id: 1,
        title: "自我介绍",
        description: "专业、亲切地介绍自己和幼儿园",
        isRequired: true,
        estimatedTime: 5,
        order: 1,
        guidance: {
          steps: [
            "1. 问候客户，确认对方方便沟通",
            "2. 简短介绍自己的姓名和职位",
            "3. 说明联系原因（如何获得联系方式）",
            "4. 询问客户是否方便了解我们的课程"
          ],
          tips: [
            "语气要亲切自然，不要太正式",
            "控制时间在3-5分钟",
            "注意倾听客户的反应"
          ],
          examples: [
            "您好，我是XX幼儿园的李老师，看到您在我们官网留了联系方式，想了解一下我们的课程，现在方便聊几分钟吗？"
          ]
        },
        aiSuggestion: {
          enabled: true,
          prompt: "根据客户信息，生成个性化的自我介绍话术"
        }
      },
      {
        id: 2,
        title: "了解基本信息",
        description: "收集客户和孩子的基本信息",
        isRequired: true,
        estimatedTime: 10,
        order: 2,
        guidance: {
          steps: [
            "1. 询问孩子的年龄和性别",
            "2. 了解孩子的性格特点",
            "3. 询问家长的教育理念",
            "4. 了解选择幼儿园的主要考虑因素"
          ],
          tips: [
            "采用开放式提问，让客户多说",
            "认真记录关键信息",
            "表现出对孩子的关心"
          ],
          examples: [
            "宝宝今年多大了？平时性格怎么样？",
            "您在选择幼儿园时，最看重哪些方面呢？"
          ]
        },
        aiSuggestion: {
          enabled: true,
          prompt: "根据已有信息，生成深入了解客户的问题清单"
        }
      },
      {
        id: 3,
        title: "建立信任",
        description: "通过专业和真诚建立初步信任",
        isRequired: true,
        estimatedTime: 10,
        order: 3,
        guidance: {
          steps: [
            "1. 分享相似案例（同龄孩子的成长故事）",
            "2. 展示专业性（教育理念、师资力量）",
            "3. 表达对孩子成长的关注",
            "4. 约定下次沟通时间"
          ],
          tips: [
            "用故事而非数据打动人心",
            "展现真诚，不要过度推销",
            "给客户思考的时间"
          ],
          examples: [
            "我们之前有个和您家宝宝差不多大的孩子，刚来的时候也比较内向，经过半年的培养，现在特别活泼开朗..."
          ]
        },
        aiSuggestion: {
          enabled: true,
          prompt: "根据客户关注点，推荐合适的成功案例"
        }
      }
    ],
    
    successCriteria: {
      description: "客户愿意继续沟通，并约定了下次联系时间",
      checkpoints: [
        "✓ 获得了客户的基本信息",
        "✓ 了解了客户的主要需求",
        "✓ 客户表现出一定兴趣",
        "✓ 约定了下次沟通时间"
      ]
    },
    
    scripts: {
      opening: "您好，我是XX幼儿园的李老师，看到您在我们官网留了联系方式...",
      keyPoints: [
        "我们幼儿园专注于3-6岁儿童的全面发展",
        "我们有15年的办学经验，培养了超过3000名优秀学员",
        "我们的师资团队都是学前教育专业，平均教龄8年以上"
      ],
      closing: "今天先聊到这里，我整理一份详细的课程介绍发给您，明天这个时候我再给您打电话详细介绍，您看可以吗？"
    },
    
    faqs: [
      {
        question: "你们学费多少？",
        answer: "我们的学费根据不同班型有所不同，月费在3000-5000元之间。不过我建议您先了解一下我们的课程内容和师资，看看是否适合您的孩子，然后我们再详细聊费用的事情。",
        tips: [
          "不要在第一次沟通就详细谈价格",
          "先建立价值认同",
          "引导客户关注课程质量"
        ]
      },
      {
        question: "可以试听吗？",
        answer: "当然可以！我们非常欢迎家长带孩子来试听。不过在试听之前，我想先了解一下您的需求，这样我可以为您安排最合适的试听课程。",
        tips: [
          "积极响应试听需求",
          "先了解需求再安排试听",
          "为试听做好铺垫"
        ]
      }
    ]
  },
  
  {
    id: 2,
    name: "需求挖掘",
    description: "深入了解客户需求，找到痛点",
    order: 2,
    estimatedDays: 2,
    tasks: [
      // ... 类似结构
    ]
  },
  
  // ... 其他阶段
];
```

---

### 功能3: AI智能建议系统

#### 3.1 AI建议触发点

**每个任务旁边都有AI建议按钮**:

```vue
<template>
  <div class="sop-task-item">
    <el-checkbox v-model="task.completed">
      {{ task.title }}
    </el-checkbox>
    
    <!-- AI建议按钮 -->
    <el-button 
      size="small" 
      type="primary" 
      text
      @click="showAISuggestion(task)"
    >
      <el-icon><MagicStick /></el-icon>
      AI建议
    </el-button>
    
    <!-- 任务详情 -->
    <el-collapse-transition>
      <div v-show="task.expanded" class="task-detail">
        <div class="guidance">
          <h5>执行步骤：</h5>
          <ol>
            <li v-for="step in task.guidance.steps" :key="step">
              {{ step }}
            </li>
          </ol>
        </div>
        
        <div class="tips">
          <h5>注意事项：</h5>
          <ul>
            <li v-for="tip in task.guidance.tips" :key="tip">
              {{ tip }}
            </li>
          </ul>
        </div>
        
        <div class="examples">
          <h5>话术示例：</h5>
          <el-tag 
            v-for="example in task.guidance.examples" 
            :key="example"
            type="success"
            effect="plain"
          >
            {{ example }}
          </el-tag>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>
```

#### 3.2 AI建议弹窗

```vue
<template>
  <el-dialog
    v-model="showAIDialog"
    title="AI智能建议"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="ai-suggestion-dialog">
      <!-- 客户信息摘要 -->
      <el-card class="customer-summary" shadow="never">
        <template #header>
          <div class="card-header">
            <span>客户画像</span>
            <el-tag type="info" size="small">基于历史数据分析</el-tag>
          </div>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户姓名">{{ customer.name }}</el-descriptions-item>
          <el-descriptions-item label="孩子年龄">{{ customer.childAge }}岁</el-descriptions-item>
          <el-descriptions-item label="意向度">
            <el-progress 
              :percentage="aiAnalysis.intentionScore" 
              :color="getIntentionColor(aiAnalysis.intentionScore)"
            />
          </el-descriptions-item>
          <el-descriptions-item label="跟进次数">{{ followRecords.length }}次</el-descriptions-item>
          <el-descriptions-item label="关注点" :span="2">
            <el-tag 
              v-for="point in aiAnalysis.focusPoints" 
              :key="point"
              size="small"
              style="margin-right: 8px"
            >
              {{ point }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- AI分析加载 -->
      <div v-loading="aiLoading" class="ai-analysis-content">
        <!-- 沟通策略 -->
        <el-card class="strategy-card" shadow="never">
          <template #header>
            <el-icon><ChatDotRound /></el-icon>
            沟通策略
          </template>
          <div class="strategy-content">
            <el-alert 
              :title="aiSuggestion.strategy.title"
              type="success"
              :closable="false"
              show-icon
            >
              <p>{{ aiSuggestion.strategy.description }}</p>
            </el-alert>
            
            <div class="strategy-points">
              <h5>关键要点：</h5>
              <ul>
                <li v-for="point in aiSuggestion.strategy.keyPoints" :key="point">
                  <el-icon color="#67C23A"><Check /></el-icon>
                  {{ point }}
                </li>
              </ul>
            </div>
          </div>
        </el-card>

        <!-- 推荐话术 -->
        <el-card class="script-card" shadow="never">
          <template #header>
            <el-icon><ChatLineRound /></el-icon>
            推荐话术
          </template>
          <div class="script-content">
            <el-tabs v-model="activeScriptTab">
              <el-tab-pane label="开场白" name="opening">
                <div class="script-text">
                  {{ aiSuggestion.scripts.opening }}
                </div>
                <el-button size="small" @click="copyScript(aiSuggestion.scripts.opening)">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </el-tab-pane>
              
              <el-tab-pane label="核心话术" name="core">
                <div 
                  v-for="(script, index) in aiSuggestion.scripts.core" 
                  :key="index"
                  class="script-item"
                >
                  <div class="script-text">{{ script }}</div>
                  <el-button size="small" @click="copyScript(script)">
                    <el-icon><CopyDocument /></el-icon>
                    复制
                  </el-button>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="异议处理" name="objection">
                <div 
                  v-for="objection in aiSuggestion.scripts.objections" 
                  :key="objection.question"
                  class="objection-item"
                >
                  <div class="question">
                    <el-tag type="warning" size="small">客户可能说</el-tag>
                    {{ objection.question }}
                  </div>
                  <div class="answer">
                    <el-tag type="success" size="small">建议回复</el-tag>
                    {{ objection.answer }}
                  </div>
                  <el-button size="small" @click="copyScript(objection.answer)">
                    <el-icon><CopyDocument /></el-icon>
                    复制
                  </el-button>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>

        <!-- 下一步行动 -->
        <el-card class="action-card" shadow="never">
          <template #header>
            <el-icon><Promotion /></el-icon>
            下一步行动
          </template>
          <div class="action-content">
            <el-timeline>
              <el-timeline-item
                v-for="(action, index) in aiSuggestion.nextActions"
                :key="index"
                :timestamp="action.timing"
                placement="top"
              >
                <el-card>
                  <h4>{{ action.title }}</h4>
                  <p>{{ action.description }}</p>
                  <div class="action-tips">
                    <el-tag 
                      v-for="tip in action.tips" 
                      :key="tip"
                      size="small"
                      type="info"
                      effect="plain"
                    >
                      {{ tip }}
                    </el-tag>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>

        <!-- 成功概率预测 -->
        <el-card class="prediction-card" shadow="never">
          <template #header>
            <el-icon><TrendCharts /></el-icon>
            成功概率预测
          </template>
          <div class="prediction-content">
            <div class="probability-chart">
              <el-progress 
                type="dashboard" 
                :percentage="aiSuggestion.successProbability"
                :color="getProbabilityColor(aiSuggestion.successProbability)"
              >
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ percentage }}%</span>
                  <span class="percentage-label">成交概率</span>
                </template>
              </el-progress>
            </div>
            
            <div class="factors">
              <h5>影响因素：</h5>
              <el-row :gutter="12">
                <el-col :span="12" v-for="factor in aiSuggestion.factors" :key="factor.name">
                  <div class="factor-item">
                    <div class="factor-name">{{ factor.name }}</div>
                    <el-progress 
                      :percentage="factor.score" 
                      :status="factor.score > 70 ? 'success' : 'warning'"
                    />
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 底部操作 -->
      <template #footer>
        <el-button @click="showAIDialog = false">关闭</el-button>
        <el-button type="primary" @click="applyAISuggestion">
          <el-icon><Select /></el-icon>
          应用建议
        </el-button>
        <el-button type="success" @click="regenerateAISuggestion">
          <el-icon><Refresh /></el-icon>
          重新生成
        </el-button>
      </template>
    </div>
  </el-dialog>
</template>
```

#### 3.3 AI建议API调用

```typescript
// AI建议服务
class AISuggestionService {
  /**
   * 获取任务级AI建议
   */
  async getTaskSuggestion(params: {
    customerId: number;
    taskId: number;
    stage: number;
    conversationHistory: ConversationRecord[];
    followRecords: FollowRecord[];
  }) {
    // 调用后端AIBridge服务
    const response = await request.post('/api/ai-bridge/task-suggestion', {
      customer: {
        id: params.customerId,
        info: await this.getCustomerInfo(params.customerId),
        profile: await this.getCustomerProfile(params.customerId)
      },
      task: {
        id: params.taskId,
        stage: params.stage,
        sopConfig: await this.getSOPConfig(params.stage, params.taskId)
      },
      context: {
        conversationHistory: params.conversationHistory,
        followRecords: params.followRecords,
        screenshots: await this.getScreenshots(params.customerId),
        previousSuggestions: await this.getPreviousSuggestions(params.customerId)
      },
      prompt: this.buildPrompt(params)
    });

    return response.data;
  }

  /**
   * 构建AI提示词
   */
  private buildPrompt(params: any): string {
    return `
你是一位经验丰富的幼儿园招生顾问，现在需要帮助教师完成客户跟进任务。

【客户信息】
- 姓名：${params.customer.name}
- 孩子年龄：${params.customer.childAge}岁
- 关注点：${params.customer.focusPoints.join('、')}
- 意向度：${params.customer.intentionScore}%

【当前阶段】
- 阶段：${params.stage.name}
- 任务：${params.task.title}
- 目标：${params.task.description}

【历史沟通记录】
${this.formatConversationHistory(params.conversationHistory)}

【跟进记录】
${this.formatFollowRecords(params.followRecords)}

请基于以上信息，提供：
1. 针对性的沟通策略
2. 3-5条可直接使用的话术
3. 可能遇到的异议及应对方法
4. 下一步具体行动建议（包括时机）
5. 成交概率评估及影响因素分析

要求：
- 话术要自然、亲切、专业
- 策略要具体、可执行
- 考虑客户的个性化需求
- 提供实用的技巧和注意事项
    `.trim();
  }

  /**
   * 分析截图内容
   */
  async analyzeScreenshot(params: {
    imageUrl: string;
    customerId: number;
    context: string;
  }) {
    const response = await request.post('/api/ai-bridge/analyze-screenshot', {
      imageUrl: params.imageUrl,
      customerId: params.customerId,
      context: params.context,
      prompt: `
分析这张聊天截图，提取以下信息：
1. 对话内容摘要
2. 客户的关注点和疑虑
3. 客户的情感倾向（积极/中性/消极）
4. 建议的回复话术
5. 需要注意的关键信息
      `.trim()
    });

    return response.data;
  }

  /**
   * 全局客户分析
   */
  async getGlobalAnalysis(customerId: number) {
    const response = await request.post('/api/ai-bridge/global-analysis', {
      customerId,
      includeHistory: true,
      includeScreenshots: true,
      includePrediction: true
    });

    return response.data;
  }
}
```

---

## 📊 数据库设计

### 新增表结构

#### 1. sop_stages（SOP阶段表）

```sql
CREATE TABLE sop_stages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '阶段名称',
  description TEXT COMMENT '阶段描述',
  order_num INT NOT NULL COMMENT '排序',
  estimated_days INT COMMENT '预计天数',
  success_criteria JSON COMMENT '成功标志',
  scripts JSON COMMENT '话术模板',
  faqs JSON COMMENT '常见问题',
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. sop_tasks（SOP任务表）

```sql
CREATE TABLE sop_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stage_id INT NOT NULL COMMENT '所属阶段',
  title VARCHAR(200) NOT NULL COMMENT '任务标题',
  description TEXT COMMENT '任务描述',
  is_required BOOLEAN DEFAULT FALSE COMMENT '是否必需',
  estimated_time INT COMMENT '预计耗时（分钟）',
  order_num INT NOT NULL COMMENT '排序',
  guidance JSON COMMENT '任务指导',
  ai_suggestion_config JSON COMMENT 'AI建议配置',
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (stage_id) REFERENCES sop_stages(id)
);
```

#### 3. customer_sop_progress（客户SOP进度表）

```sql
CREATE TABLE customer_sop_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL COMMENT '客户ID',
  teacher_id INT NOT NULL COMMENT '教师ID',
  current_stage_id INT NOT NULL COMMENT '当前阶段',
  stage_progress DECIMAL(5,2) COMMENT '阶段进度百分比',
  completed_tasks JSON COMMENT '已完成任务ID列表',
  estimated_close_date DATE COMMENT '预计成交日期',
  success_probability DECIMAL(5,2) COMMENT '成功概率',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (current_stage_id) REFERENCES sop_stages(id)
);
```

#### 4. conversation_records（对话记录表）

```sql
CREATE TABLE conversation_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL COMMENT '客户ID',
  teacher_id INT NOT NULL COMMENT '教师ID',
  follow_record_id INT COMMENT '关联的跟进记录ID',
  speaker_type ENUM('teacher', 'customer') NOT NULL COMMENT '说话人类型',
  content TEXT NOT NULL COMMENT '对话内容',
  message_type ENUM('text', 'image', 'voice', 'video') DEFAULT 'text',
  media_url VARCHAR(500) COMMENT '媒体文件URL',
  sentiment VARCHAR(50) COMMENT '情感倾向',
  ai_analysis JSON COMMENT 'AI分析结果',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (follow_record_id) REFERENCES customer_follow_records(id)
);
```

#### 5. conversation_screenshots（对话截图表）

```sql
CREATE TABLE conversation_screenshots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL COMMENT '对话记录ID',
  customer_id INT NOT NULL COMMENT '客户ID',
  image_url VARCHAR(500) NOT NULL COMMENT '截图URL',
  recognized_text TEXT COMMENT 'OCR识别文字',
  ai_analysis JSON COMMENT 'AI分析结果',
  uploaded_by INT NOT NULL COMMENT '上传者ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversation_records(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

#### 6. ai_suggestions_history（AI建议历史表）

```sql
CREATE TABLE ai_suggestions_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL COMMENT '客户ID',
  teacher_id INT NOT NULL COMMENT '教师ID',
  task_id INT COMMENT '任务ID',
  suggestion_type VARCHAR(50) COMMENT '建议类型',
  input_context JSON COMMENT '输入上下文',
  ai_response JSON COMMENT 'AI响应内容',
  is_applied BOOLEAN DEFAULT FALSE COMMENT '是否已应用',
  feedback_score INT COMMENT '反馈评分(1-5)',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (task_id) REFERENCES sop_tasks(id)
);
```

---

## 🔌 后端API设计

### API路由结构

```
/api/teacher-sop/
├── stages                          # SOP阶段管理
│   ├── GET /                      # 获取所有阶段
│   ├── GET /:id                   # 获取阶段详情
│   └── GET /:id/tasks             # 获取阶段任务列表
│
├── customers/:customerId/
│   ├── progress                    # 客户SOP进度
│   │   ├── GET /                  # 获取进度
│   │   ├── PUT /                  # 更新进度
│   │   └── POST /advance          # 推进到下一阶段
│   │
│   ├── tasks                       # 任务管理
│   │   ├── GET /                  # 获取任务列表
│   │   ├── POST /:taskId/complete # 完成任务
│   │   └── POST /:taskId/skip     # 跳过任务
│   │
│   ├── conversations               # 对话记录
│   │   ├── GET /                  # 获取对话记录
│   │   ├── POST /                 # 添加对话记录
│   │   ├── POST /batch            # 批量添加对话
│   │   └── POST /voice-to-text    # 语音转文字
│   │
│   ├── screenshots                 # 截图管理
│   │   ├── POST /upload           # 上传截图
│   │   ├── POST /:id/analyze      # 分析截图
│   │   └── GET /                  # 获取截图列表
│   │
│   └── ai-suggestions              # AI建议
│       ├── POST /task             # 获取任务建议
│       ├── POST /global           # 获取全局分析
│       ├── POST /regenerate       # 重新生成建议
│       └── POST /:id/feedback     # 提交建议反馈
│
└── analytics                       # 统计分析
    ├── GET /conversion-rate       # 转化率统计
    ├── GET /stage-distribution    # 阶段分布
    └── GET /teacher-performance   # 教师业绩
```

---

## 🎨 完整实现示例

由于篇幅限制，完整代码将在后续文件中提供。

---

## 📈 预期效果

### 对教师的价值

1. **降低学习成本** - 新手教师也能快速上手
2. **提高转化率** - 标准化流程 + AI辅助，转化率提升30%+
3. **节省时间** - 减少50%的思考和准备时间
4. **增强信心** - 有SOP和AI支持，沟通更有底气

### 对机构的价值

1. **标准化管理** - 统一的服务标准
2. **数据沉淀** - 积累优秀案例和话术
3. **持续优化** - 基于数据不断优化SOP
4. **规模化复制** - 成功经验可快速复制

---

**下一步**: 我将为你创建详细的代码实现文档。

