<template>
  <div class="expert-team-demo">
    <div class="demo-header">
      <h1>🧠 动态专家团队 DEMO</h1>
      <p>体验AI专家团队协作决策过程</p>
      
      <!-- 场景选择器 -->
      <div class="scenario-selector">
        <label>选择业务场景:</label>
        <select v-model="selectedScenario" @change="switchScenario">
          <option value="activity">🎪 活动管理</option>
          <option value="enrollment">📈 招生中心</option>
        </select>
      </div>
    </div>
    
    <div class="demo-content">
      <!-- 左侧：专家团队展示 -->
      <div class="experts-panel">
        <h3>👥 专家团队</h3>
        
        <!-- 主策划专家 -->
        <div class="planner-section">
          <h4>主策划专家</h4>
          <ExpertCard
            :expert="currentTeam?.planner"
            :is-active="plannerStatus.active"
            :is-working="plannerStatus.working"
            :work-progress="plannerStatus.progress"
            :last-output="plannerStatus.lastOutput"
          />
        </div>
        
        <!-- 评审专家团队 -->
        <div class="reviewers-section">
          <h4>评审专家团队</h4>
          <div class="reviewers-grid">
            <ExpertCard
              v-for="(expert, index) in currentTeam?.reviewers"
              :key="expert.id"
              :expert="expert"
              :is-active="reviewerStatuses[index]?.active"
              :is-working="reviewerStatuses[index]?.working"
              :work-progress="reviewerStatuses[index]?.progress"
              :last-output="reviewerStatuses[index]?.lastOutput"
              :last-score="reviewerStatuses[index]?.lastScore"
            />
          </div>
        </div>
      </div>
      
      <!-- 右侧：聊天交互 -->
      <div class="chat-panel">
        <StreamingChat
          ref="chatRef"
          :current-scenario="currentTeam?.scenario || ''"
          :experts="allExperts"
          :on-user-request="handleUserRequest"
        />
      </div>
    </div>
    
    <!-- 底部：快速测试按钮 -->
    <div class="quick-actions">
      <h4>🚀 快速测试</h4>
      <div class="action-buttons">
        <button 
          v-for="action in quickActions" 
          :key="action.label"
          @click="sendQuickAction(action.message)"
          :disabled="isProcessing"
          class="action-btn"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import StreamingChat from '@/components/demo/StreamingChat.vue'
import ExpertCard from '@/components/demo/ExpertCard.vue'
import {
  expertTeamConfigs,
  simulateExpertResponse,
  type Expert,
  type ExpertTeam,
  type ExpertResponse
} from '@/services/expert-team.service'
import { request } from '@/utils/request'

// 响应式数据
const selectedScenario = ref<string>('activity')
const isProcessing = ref(false)
const chatRef = ref<InstanceType<typeof StreamingChat>>()

// 专家状态管理
interface ExpertStatus {
  active: boolean
  working: boolean
  progress?: {
    title: string
    percentage: number
    text: string
  }
  lastOutput?: string
  lastScore?: number
}

const plannerStatus = ref<ExpertStatus>({ active: true, working: false })
const reviewerStatuses = ref<ExpertStatus[]>([])

// 计算属性
const currentTeam = computed<ExpertTeam | null>(() => {
  return expertTeamConfigs[selectedScenario.value] || null
})

const allExperts = computed<Expert[]>(() => {
  if (!currentTeam.value) return []
  return [currentTeam.value.planner, ...currentTeam.value.reviewers]
})

const quickActions = computed(() => {
  if (selectedScenario.value === 'activity') {
    return [
      { label: '创建春季运动会', message: '我想为幼儿园创建一个春季运动会活动' },
      { label: '策划亲子活动', message: '帮我策划一个周末的亲子互动活动' },
      { label: '节日庆典活动', message: '六一儿童节快到了，需要策划庆典活动' }
    ]
  } else {
    return [
      { label: '制定招生策略', message: '我需要制定下学期的招生策略' },
      { label: '优化招生渠道', message: '当前招生效果不理想，需要优化渠道配置' },
      { label: '提升转化率', message: '线索量不错但转化率偏低，需要改进' }
    ]
  }
})

// 真实AI调用函数
const callRealAI = async (
  expert: Expert,
  context: any,
  action: 'createPlan' | 'review' | 'optimize'
): Promise<ExpertResponse> => {
  const systemPrompt = expert.prompt

  let userPrompt = ''
  if (action === 'createPlan') {
    userPrompt = `用户需求: ${context.userRequest}

请作为${expert.name}，根据用户需求制定详细的方案。请考虑以下方面：
- 方案的可行性和实用性
- 预算和资源配置
- 时间安排和执行步骤
- 风险评估和应对措施

请提供具体、可执行的方案建议。`
  } else if (action === 'review') {
    userPrompt = `请作为${expert.name}，对以下方案进行专业评审：

[方案内容会在这里]

请从您的专业角度评估：
1. 方案的优点和亮点
2. 存在的问题和风险
3. 改进建议
4. 给出1-10分的评分

请提供具体的评审意见。`
  } else if (action === 'optimize') {
    userPrompt = `请作为${expert.name}，根据评审专家的反馈意见优化方案：

[评审意见会在这里]

请提供优化后的方案，说明：
1. 针对哪些问题进行了改进
2. 具体的优化措施
3. 预期的改进效果`
  }

  try {
    const response = await request.post('/ai/chat', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      stream: false
    })

    // 解析评分（如果是评审）
    let score: number | undefined
    if (action === 'review') {
      const scoreMatch = response.data.content.match(/(\d+)分/)
      if (scoreMatch) {
        score = parseInt(scoreMatch[1])
      }
    }

    return {
      expertId: expert.id,
      expertName: expert.name,
      message: response.data.content,
      score,
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('AI调用失败:', error)
    throw error
  }
}

// 方法
const switchScenario = () => {
  // 重置专家状态
  plannerStatus.value = { active: true, working: false }
  reviewerStatuses.value = currentTeam.value?.reviewers.map(() => ({ 
    active: true, 
    working: false 
  })) || []
  
  ElMessage.success(`已切换到${currentTeam.value?.scenario}场景`)
}

const handleUserRequest = async (message: string) => {
  if (!currentTeam.value) return
  
  isProcessing.value = true
  
  try {
    // 阶段1: 主策划专家分析和制定方案
    await runPlannerPhase(message)
    
    // 阶段2: 评审专家团队并行评审
    await runReviewPhase()
    
    // 阶段3: 根据评审结果优化方案
    await runOptimizationPhase()
    
    // 阶段4: 展示最终方案
    await showFinalPlan()
    
  } catch (error) {
    console.error('处理用户请求失败:', error)
    chatRef.value?.addSystemMessage('❌ 处理过程中发生错误，请重试')
  } finally {
    isProcessing.value = false
  }
}

const runPlannerPhase = async (message: string) => {
  const planner = currentTeam.value!.planner
  
  // 更新策划专家状态
  plannerStatus.value.working = true
  plannerStatus.value.progress = {
    title: '分析需求中',
    percentage: 20,
    text: '正在分析用户需求和历史数据...'
  }
  
  chatRef.value?.addSystemMessage('🔍 主策划专家开始分析...')
  chatRef.value?.showTyping(planner)
  
  // 模拟分析过程
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  plannerStatus.value.progress = {
    title: '制定方案中',
    percentage: 80,
    text: '基于分析结果制定初步方案...'
  }
  
  // 调用真实AI模型
  try {
    const response = await callRealAI(planner, { userRequest: message }, 'createPlan')

    chatRef.value?.hideTyping()
    await chatRef.value?.streamText(planner, response.message)

    plannerStatus.value.lastOutput = response.message
  } catch (error) {
    console.error('策划专家调用失败:', error)
    chatRef.value?.hideTyping()
    chatRef.value?.addSystemMessage('❌ AI调用失败，使用备用方案')

    // 使用模拟数据作为备用
    const fallbackResponse = await simulateExpertResponse(planner, { userRequest: message }, 'createPlan')
    await chatRef.value?.streamText(planner, fallbackResponse.message)
    plannerStatus.value.lastOutput = fallbackResponse.message
  }
  
  plannerStatus.value.working = false
  plannerStatus.value.lastOutput = response.message
  plannerStatus.value.progress = undefined
}

const runReviewPhase = async () => {
  const reviewers = currentTeam.value!.reviewers

  chatRef.value?.addSystemMessage('🔍 开始专家评审，按顺序进行...')

  // 队列式处理，一个接一个
  for (let index = 0; index < reviewers.length; index++) {
    const expert = reviewers[index]

    // 更新专家状态
    reviewerStatuses.value[index].working = true
    reviewerStatuses.value[index].progress = {
      title: '评审中',
      percentage: 50,
      text: '正在评估方案...'
    }

    chatRef.value?.showTyping(expert)

    try {
      // 调用真实AI模型
      const response = await callRealAI(expert, {}, 'review')

      chatRef.value?.hideTyping()
      await chatRef.value?.streamText(expert, `${response.message} ${response.score ? `(${response.score}/10分)` : ''}`)

      // 更新专家状态
      reviewerStatuses.value[index].working = false
      reviewerStatuses.value[index].lastOutput = response.message
      reviewerStatuses.value[index].lastScore = response.score
      reviewerStatuses.value[index].progress = undefined

    } catch (error) {
      console.error(`专家 ${expert.name} 评审失败:`, error)
      chatRef.value?.hideTyping()
      chatRef.value?.addSystemMessage(`❌ ${expert.name} 评审失败，使用备用方案`)

      // 使用模拟数据作为备用
      const fallbackResponse = await simulateExpertResponse(expert, {}, 'review')
      await chatRef.value?.streamText(expert, `${fallbackResponse.message} (${fallbackResponse.score}/10分)`)

      reviewerStatuses.value[index].working = false
      reviewerStatuses.value[index].lastOutput = fallbackResponse.message
      reviewerStatuses.value[index].lastScore = fallbackResponse.score
      reviewerStatuses.value[index].progress = undefined
    }

    // 短暂延迟，让用户看到队列效果
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

const runOptimizationPhase = async () => {
  const planner = currentTeam.value!.planner
  
  chatRef.value?.addSystemMessage('🔄 主策划专家根据评审意见优化方案...')
  
  plannerStatus.value.working = true
  plannerStatus.value.progress = {
    title: '优化方案中',
    percentage: 60,
    text: '根据专家建议优化方案...'
  }
  
  chatRef.value?.showTyping(planner)
  
  try {
    const response = await callRealAI(planner, {}, 'optimize')

    chatRef.value?.hideTyping()
    await chatRef.value?.streamText(planner, response.message)

    plannerStatus.value.working = false
    plannerStatus.value.lastOutput = response.message
    plannerStatus.value.progress = undefined
  } catch (error) {
    console.error('方案优化失败:', error)
    chatRef.value?.hideTyping()
    chatRef.value?.addSystemMessage('❌ 优化失败，使用备用方案')

    // 使用模拟数据作为备用
    const fallbackResponse = await simulateExpertResponse(planner, {}, 'optimize')
    await chatRef.value?.streamText(planner, fallbackResponse.message)

    plannerStatus.value.working = false
    plannerStatus.value.lastOutput = fallbackResponse.message
    plannerStatus.value.progress = undefined
  }
}

const showFinalPlan = async () => {
  chatRef.value?.addSystemMessage('✅ 专家团队协作完成！方案已优化，请查看最终结果。')
  
  // 这里可以添加最终方案的展示逻辑
  setTimeout(() => {
    chatRef.value?.addSystemMessage('💡 您可以继续提出新的需求，或选择其他场景进行测试。')
  }, 1000)
}

const sendQuickAction = (message: string) => {
  if (chatRef.value) {
    // 模拟用户输入
    chatRef.value.addSystemMessage(`🎯 快速测试: ${message}`)
    handleUserRequest(message)
  }
}

// 初始化
onMounted(() => {
  switchScenario()
})
</script>

<style scoped lang="scss">
.expert-team-demo {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 1400px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--spacing-8xl);
  
  h1 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: var(--text-2xl);
  }
  
  .scenario-selector {
    display: inline-flex;
    align-items: center;
    gap: var(--text-sm);
    
    label {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    select {
      padding: var(--spacing-sm) var(--text-sm);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-card);
      color: var(--text-primary);
      font-size: var(--text-base);
    }
  }
}

.demo-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--spacing-8xl);
  margin-bottom: var(--spacing-8xl);
}

.experts-panel {
  h3, h4 {
    color: var(--text-primary);
    margin-bottom: var(--text-lg);
  }
  
  .planner-section {
    margin-bottom: var(--spacing-8xl);
  }
  
  .reviewers-grid {
    display: grid;
    gap: var(--text-lg);
  }
}

.quick-actions {
  text-align: center;
  
  h4 {
    color: var(--text-primary);
    margin-bottom: var(--text-lg);
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
    gap: var(--text-sm);
    flex-wrap: wrap;
    
    .action-btn {
      padding: var(--spacing-sm) var(--text-lg);
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--text-base);
      
      &:hover:not(:disabled) {
        background: var(--primary-color-hover);
      }
      
      &:disabled {
        background: var(--bg-disabled);
        cursor: not-allowed;
      }
    }
  }
}

@media (max-width: var(--breakpoint-xl)) {
  .demo-content {
    grid-template-columns: 1fr;
    gap: var(--text-2xl);
  }
}
</style>
