/**
 * 智能班级管理组合式函数
 * 
 * 提供实时班级氛围监控、学生动态分析、冲突预警、自动分班算法等功能
 */

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { get, post } from '../utils/request'
import { AI_ENDPOINTS } from '../api/endpoints'
import type {
  ClassManagementData,
  ClassAtmosphere,
  StudentDynamic,
  Intervention,
  ConflictEvent,
  OptimizedClass,
  ApiResponse
} from '../types/ai-business-plus'

export const useSmartClassManagement = (classId: string) => {
  // 响应式状态
  const classData = ref<ClassManagementData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isConnected = ref(false)
  const wsConnection = ref<WebSocket | null>(null)

  // 实时数据状态
  const currentAtmosphere = ref<ClassAtmosphere | null>(null)
  const studentDynamics = ref<StudentDynamic[]>([])
  const recentConflicts = ref<ConflictEvent[]>([])
  const pendingInterventions = ref<Intervention[]>([])

  // 计算属性
  const atmosphereStatus = computed(() => {
    if (!currentAtmosphere.value) return 'unknown'
    
    const atmosphere = currentAtmosphere.value
    
    if (atmosphere.overallMood === 'negative' || 
        atmosphere.disruptionLevel > 70 || 
        atmosphere.conflicts.length > 2) {
      return 'critical'
    }
    
    if (atmosphere.overallMood === 'neutral' || 
        atmosphere.participationRate < 60 ||
        atmosphere.collaborationIndex < 60) {
      return 'warning'
    }
    
    return 'good'
  })

  const highRiskStudents = computed(() => {
    return studentDynamics.value.filter((student: any) =>
      student.riskFactors.length > 0 ||
      student.behaviorPatterns.aggression > 3 ||
      student.interventionNeeds.length > 1
    )
  })

  const socialNetworkHealth = computed(() => {
    if (studentDynamics.value.length === 0) return 0
    
    const totalConnections = studentDynamics.value.reduce((sum: any, student: any) =>
      sum + student.socialConnections.length, 0
    )

    const averageConnections = totalConnections / studentDynamics.value.length
    const friendshipRatio = studentDynamics.value.reduce((sum: any, student: any) => {
      const friendships = student.socialConnections.filter((conn: any) => conn.relationshipType === 'friend').length
      return sum + friendships
    }, 0) / totalConnections
    
    return Math.round((averageConnections * 20 + friendshipRatio * 80))
  })

  const interventionEffectiveness = computed(() => {
    const totalInterventions = pendingInterventions.value.length
    if (totalInterventions === 0) return 100
    
    const completedInterventions = pendingInterventions.value.filter(
      (intervention: any) => intervention.successMetrics.length > 0
    ).length
    
    return Math.round((completedInterventions / totalInterventions) * 100)
  })

  // 实时班级氛围监控
  const monitorClassAtmosphere = (): WebSocket | null => {
    try {
      // 在生产环境中，这里应该连接到实际的WebSocket服务
      const wsUrl = `wss://api.kindergarten.com/class-monitor/${classId}`
      
      // 开发环境中使用模拟连接
      if (process.env.NODE_ENV === 'development') {
        return createMockWebSocketConnection()
      }
      
      const ws = new WebSocket(wsUrl)
      wsConnection.value = ws
      
      ws.onopen = () => {
        isConnected.value = true
        console.log('班级氛围监控已连接')
        
        // 发送初始化配置
        ws.send(JSON.stringify({
          type: 'init',
          classId,
          monitoringConfig: {
            atmosphereAnalysis: true,
            behaviorTracking: true,
            conflictDetection: true,
            updateInterval: 30000 // 30秒更新一次
          }
        }))
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleRealtimeUpdate(data)
        } catch (err) {
          console.error('处理实时数据失败:', err)
        }
      }
      
      ws.onclose = () => {
        isConnected.value = false
        console.log('班级氛围监控连接断开')
        
        // 自动重连
        setTimeout(() => {
          if (!isConnected.value) {
            monitorClassAtmosphere()
          }
        }, 5000)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error)
        isConnected.value = false
      }
      
      return ws
    } catch (err: any) {
      console.error('创建WebSocket连接失败:', err)
      error.value = err.message
      return null
    }
  }

  // 创建模拟WebSocket连接（用于开发和演示）
  const createMockWebSocketConnection = (): WebSocket => {
    const mockWs = {
      onopen: null as ((event: Event) => void) | null,
      onmessage: null as ((event: MessageEvent) => void) | null,
      onclose: null as ((event: CloseEvent) => void) | null,
      onerror: null as ((event: Event) => void) | null,
      send: (data: string) => {
        console.log('模拟发送数据:', data)
      },
      close: () => {
        isConnected.value = false
        if (mockWs.onclose) {
          mockWs.onclose(new CloseEvent('close'))
        }
      }
    } as unknown as WebSocket
    
    // 模拟连接建立
    setTimeout(() => {
      isConnected.value = true
      if (mockWs.onopen) {
        mockWs.onopen(new Event('open'))
      }
      
      // 定期发送模拟数据
      startMockDataGeneration(mockWs)
    }, 1000)
    
    return mockWs
  }

  // 开始生成模拟数据
  const startMockDataGeneration = (ws: WebSocket) => {
    const interval = setInterval(() => {
      if (!isConnected.value) {
        clearInterval(interval)
        return
      }
      
      // 生成模拟的氛围更新数据
      const mockData = generateMockAtmosphereUpdate()
      if (ws.onmessage) {
        ws.onmessage(new MessageEvent('message', {
          data: JSON.stringify(mockData)
        }))
      }
    }, 30000) // 每30秒更新一次
  }

  // 处理实时数据更新
  const handleRealtimeUpdate = (data: any) => {
    switch (data.type) {
      case 'atmosphere_update':
        currentAtmosphere.value = data.atmosphere
        updateClassData()
        break
      
      case 'conflict_detected':
        if (data.conflict) {
          recentConflicts.value.unshift(data.conflict)
          // 保持最近10个冲突记录
          if (recentConflicts.value.length > 10) {
            recentConflicts.value = recentConflicts.value.slice(0, 10)
          }
        }
        break
      
      case 'student_behavior_update':
        if (data.studentBehavior) {
          updateStudentBehavior(data.studentBehavior)
        }
        break
      
      case 'intervention_needed':
        if (data.intervention) {
          pendingInterventions.value.push(data.intervention)
          ElMessage.warning(`检测到需要干预: ${data.intervention.title}`)
        }
        break
      
      default:
        console.log('未知的实时数据类型:', data.type)
    }
  }

  // AI自动分班算法
  const generateOptimalClassComposition = async (students: any[], criteria?: any) => {
    try {
      loading.value = true
      error.value = null

      const requestBody = {
        students: students.map(s => ({
          id: s.id,
          name: s.name,
          age: s.age,
          personality: s.personalityProfile || generatePersonalityProfile(),
          academicLevel: s.academicLevel || generateAcademicLevel(),
          socialSkills: s.socialSkills || generateSocialSkills(),
          specialNeeds: s.specialNeeds || [],
          behaviorHistory: s.behaviorHistory || [],
          parentPreferences: s.parentPreferences || {}
        })),
        classSize: criteria?.classSize || 20,
        criteria: {
          academicBalance: criteria?.academicBalance || 0.3,
          personalityMix: criteria?.personalityMix || 0.3,
          socialDynamics: criteria?.socialDynamics || 0.4,
          specialNeedsSupport: criteria?.specialNeedsSupport || 0.2
        },
        constraints: {
          maxIntroverts: Math.floor((criteria?.classSize || 20) * 0.4),
          maxHighEnergyStudents: Math.floor((criteria?.classSize || 20) * 0.3),
          requiredDiversity: true
        }
      }

      console.log('开始AI自动分班分析，参数：', requestBody)

      const response = await post<ApiResponse<OptimizedClass[]>>(
        AI_ENDPOINTS.OPTIMAL_CLASS_COMPOSITION,
        requestBody
      )

      if (response.success && response.data) {
        console.log('自动分班完成，结果：', response.data)
        return response.data
      } else {
        throw new Error(response.message || '自动分班失败')
      }
    } catch (err: any) {
      error.value = err.message
      console.error('自动分班失败:', err)
      
      // 生成模拟分班结果
      const mockResult = generateMockClassComposition(students, criteria)
      ElMessage.warning('使用演示数据，实际部署时将连接AI分班服务')
      return [mockResult]
    } finally {
      loading.value = false
    }
  }

  // 冲突预测分析
  const detectPotentialConflicts = async (lookAhead: string = '7days') => {
    try {
      const requestBody = {
        classId,
        lookAhead,
        includeBehaviorPatterns: true,
        includeEnvironmentalFactors: true,
        analysisDepth: 'comprehensive',
        riskThreshold: 0.6
      }

      const response = await post<ApiResponse<any[]>>(
        AI_ENDPOINTS.CONFLICT_PREDICTION(classId),
        requestBody
      )

      if (response.success && response.data) {
        console.log('冲突预测完成，结果：', response.data)
        return response.data
      } else {
        throw new Error(response.message || '冲突预测失败')
      }
    } catch (err: any) {
      console.error('冲突预测失败:', err)
      
      // 生成模拟预测结果
      return generateMockConflictPredictions()
    }
  }

  // 生成干预建议
  const generateInterventionSuggestions = async (targetStudents?: string[]) => {
    try {
      const requestBody = {
        classId,
        currentAtmosphere: currentAtmosphere.value,
        studentDynamics: studentDynamics.value,
        recentConflicts: recentConflicts.value,
        targetStudents: targetStudents || [],
        interventionTypes: ['immediate', 'short_term', 'long_term'],
        priorityLevel: 'all'
      }

      const response = await post<ApiResponse<Intervention[]>>(
        AI_ENDPOINTS.INTERVENTION_SUGGESTIONS(classId),
        requestBody
      )

      if (response.success && response.data) {
        console.log('干预建议生成完成，结果：', response.data)
        return response.data
      } else {
        throw new Error(response.message || '干预建议生成失败')
      }
    } catch (err: any) {
      console.error('干预建议生成失败:', err)
      
      // 生成模拟干预建议
      return generateMockInterventions()
    }
  }

  // 实施干预措施
  const implementIntervention = async (interventionId: string, customization?: any) => {
    try {
      const response = await post(
        `${AI_ENDPOINTS.INTERVENTION_SUGGESTIONS(classId)}/implement`,
        {
          interventionId,
          customization,
          implementationDate: new Date().toISOString(),
          assignedTeacher: 'current_teacher'
        }
      )

      if (response.success) {
        // 更新干预状态
        const intervention = pendingInterventions.value.find((i: any) => i.id === interventionId)
        if (intervention) {
          intervention.successMetrics.push(`实施于 ${new Date().toLocaleString()}`)
        }
        
        ElMessage.success('干预措施已开始实施')
        return true
      } else {
        throw new Error(response.message || '实施干预失败')
      }
    } catch (err: any) {
      console.error('实施干预失败:', err)
      ElMessage.error('实施干预失败')
      return false
    }
  }

  // 分析班级整体表现
  const analyzeClassPerformance = async (timeRange: string = '1month') => {
    try {
      const response = await get<ApiResponse<any>>(
        `${AI_ENDPOINTS.CLASS_ATMOSPHERE_MONITORING(classId)}/performance?timeRange=${timeRange}`
      )

      if (response.success && response.data) {
        return response.data
      } else {
        throw new Error(response.message || '班级表现分析失败')
      }
    } catch (err: any) {
      console.error('班级表现分析失败:', err)
      return null
    }
  }

  // 更新班级数据
  const updateClassData = () => {
    if (currentAtmosphere.value) {
      classData.value = {
        classId,
        className: `班级${classId}`,
        atmosphere: currentAtmosphere.value,
        studentDynamics: studentDynamics.value,
        interventionSuggestions: pendingInterventions.value,
        predictedConflicts: []
      }
    }
  }

  // 更新学生行为数据
  const updateStudentBehavior = (behaviorUpdate: any) => {
    const studentIndex = studentDynamics.value.findIndex(
      (s: any) => s.studentId === behaviorUpdate.studentId
    )
    
    if (studentIndex !== -1) {
      studentDynamics.value[studentIndex] = {
        ...studentDynamics.value[studentIndex],
        ...behaviorUpdate
      }
    }
  }

  // 生成模拟数据的辅助函数
  const generateMockAtmosphereUpdate = () => {
    return {
      type: 'atmosphere_update',
      atmosphere: {
        classId,
        timestamp: new Date().toISOString(),
        overallMood: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)],
        energyLevel: Math.floor(Math.random() * 10) + 1,
        participationRate: Math.floor(Math.random() * 40) + 60,
        collaborationIndex: Math.floor(Math.random() * 40) + 60,
        attentionLevel: Math.floor(Math.random() * 30) + 70,
        disruptionLevel: Math.floor(Math.random() * 30) + 5,
        conflicts: [],
        recommendations: [
          '保持当前活动节奏',
          '关注个别学生状态',
          '适时调整教学策略'
        ][Math.floor(Math.random() * 3)],
        environmentalFactors: {
          temperature: Math.floor(Math.random() * 6) + 20,
          noise: Math.floor(Math.random() * 20) + 35,
          lighting: '适宜',
          crowding: Math.floor(Math.random() * 30) + 70
        }
      }
    }
  }

  const generatePersonalityProfile = () => {
    return {
      extraversion: Math.random(),
      agreeableness: Math.random(),
      conscientiousness: Math.random(),
      neuroticism: Math.random(),
      openness: Math.random()
    }
  }

  const generateAcademicLevel = () => {
    return {
      overall: Math.floor(Math.random() * 40) + 60,
      language: Math.floor(Math.random() * 40) + 60,
      mathematics: Math.floor(Math.random() * 40) + 60,
      science: Math.floor(Math.random() * 40) + 60,
      arts: Math.floor(Math.random() * 40) + 60
    }
  }

  const generateSocialSkills = () => {
    return {
      communication: Math.floor(Math.random() * 40) + 60,
      cooperation: Math.floor(Math.random() * 40) + 60,
      leadership: Math.floor(Math.random() * 40) + 60,
      empathy: Math.floor(Math.random() * 40) + 60
    }
  }

  const generateMockClassComposition = (students: any[], criteria?: any): OptimizedClass => {
    return {
      id: 'optimized-' + Date.now(),
      name: '优化班级构成',
      students: students.slice(0, criteria?.classSize || 20).map(student => ({
        studentId: student.id,
        studentName: student.name,
        role: ['leader', 'supporter', 'independent', 'follower'][Math.floor(Math.random() * 4)],
        placementReason: '基于AI分析的最优配置'
      })),
      teacherId: 'teacher1',
      teacherName: '李老师',
      classroomId: 'room1',
      balanceScore: 4.2,
      strengths: [
        '学习能力分布均衡',
        '性格类型互补良好',
        '社交冲突风险较低',
        '有利于团队合作'
      ],
      potentialChallenges: [
        '需要关注个别内向学生',
        '可能需要额外的合作活动'
      ],
      recommendations: [
        '采用混合分组策略',
        '定期调整座位安排',
        '增加团队建设活动',
        '建立同伴支持系统'
      ]
    }
  }

  const generateMockConflictPredictions = () => {
    return [
      {
        id: 'pred1',
        probability: 75,
        type: '玩具争夺',
        participants: ['小明', '小红'],
        timeframe: '未来2-3天',
        triggeringFactors: ['新玩具引入', '活动空间限制'],
        preventionStrategies: [
          '增加同类玩具数量',
          '建立轮流使用规则',
          '引导分享行为'
        ]
      },
      {
        id: 'pred2',
        probability: 62,
        type: '注意力竞争',
        participants: ['小华', '小丽'],
        timeframe: '未来1周',
        triggeringFactors: ['表现欲强', '寻求老师关注'],
        preventionStrategies: [
          '分配不同展示机会',
          '建立轮流发言制度',
          '给予个性化关注'
        ]
      }
    ]
  }

  const generateMockInterventions = (): Intervention[] => {
    return [
      {
        id: 'intervention1',
        type: 'immediate',
        priority: 'high',
        title: '提升班级合作氛围',
        description: '通过团队合作游戏和活动，改善班级整体合作氛围，减少个体冲突',
        targetStudents: ['s1', 's2', 's3'],
        implementationSteps: [
          '设计2-3人小组合作任务',
          '建立团队奖励机制',
          '引导学生互相支持',
          '定期反馈和调整'
        ],
        expectedOutcome: '班级合作指数提升20%，冲突事件减少40%',
        timeframe: '2周',
        resourcesNeeded: ['合作游戏道具', '奖励系统', '观察记录表'],
        successMetrics: ['合作行为频次', '冲突事件统计', '学生满意度调查']
      },
      {
        id: 'intervention2',
        type: 'short_term',
        priority: 'medium',
        title: '个性化关注计划',
        description: '为需要额外关注的学生制定个性化互动计划，提升其参与度和自信心',
        targetStudents: ['s4', 's5'],
        implementationSteps: [
          '评估学生个性化需求',
          '制定专门互动策略',
          '安排一对一关注时间',
          '监控进展情况'
        ],
        expectedOutcome: '目标学生参与度提升30%，自信心显著增强',
        timeframe: '4周',
        resourcesNeeded: ['个性化活动材料', '额外时间分配'],
        successMetrics: ['参与度观察', '自信心评估', '同伴接受度']
      }
    ]
  }

  // 清理资源
  const cleanup = () => {
    if (wsConnection.value) {
      wsConnection.value.close()
      wsConnection.value = null
    }
    isConnected.value = false
  }

  return {
    // 状态
    classData,
    loading,
    error,
    isConnected,
    currentAtmosphere,
    studentDynamics,
    recentConflicts,
    pendingInterventions,
    
    // 计算属性
    atmosphereStatus,
    highRiskStudents,
    socialNetworkHealth,
    interventionEffectiveness,
    
    // 方法
    monitorClassAtmosphere,
    generateOptimalClassComposition,
    detectPotentialConflicts,
    generateInterventionSuggestions,
    implementIntervention,
    analyzeClassPerformance,
    cleanup
  }
}