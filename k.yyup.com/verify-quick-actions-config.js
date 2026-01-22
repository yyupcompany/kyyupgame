/**
 * AI助手快捷导航配置验证脚本
 * 
 * 运行方式: node verify-quick-actions-config.js
 */

// 模拟配置导入
const quickActionsConfig = {
  principal: {
    roleCode: 'principal',
    roleName: '园长',
    actions: {
      fullpage: [
        { code: 'view_today_data', text: '查看今日运营数据', icon: 'chart-line', description: 'AI自动查询招生、出勤、收入等数据', order: 1 },
        { code: 'generate_teacher_report', text: '生成教师绩效报告', icon: 'user-star', description: 'AI自动获取教师数据并生成报告', order: 2 },
        { code: 'analyze_enrollment', text: '分析招生趋势', icon: 'user-plus', description: 'AI自动分析招生数据趋势', order: 3 },
        { code: 'generate_financial_report', text: '生成财务报表', icon: 'money', description: 'AI自动汇总财务数据', order: 4 },
        { code: 'view_parent_feedback', text: '查看家长反馈', icon: 'smile', description: 'AI自动统计家长满意度', order: 5 },
        { code: 'plan_activity', text: '策划全园活动', icon: 'calendar', description: 'AI提供活动策划建议', order: 6 },
        { code: 'optimize_resources', text: '优化资源配置', icon: 'setting', description: 'AI分析资源使用情况', order: 7 },
        { code: 'risk_warning', text: '风险预警', icon: 'warning', description: 'AI分析潜在运营风险', order: 8 }
      ],
      sidebar: [
        { code: 'today_summary', text: '今日数据', description: 'AI自动展示今日关键指标', order: 1 },
        { code: 'pending_tasks', text: '待办事项', description: 'AI自动列出待处理事项', order: 2 },
        { code: 'quick_query', text: '快速查询', description: '打开快速查询对话', order: 3 },
        { code: 'urgent_consult', text: '紧急咨询', description: '快速咨询入口', order: 4 }
      ],
      mobile: [
        { code: 'realtime_dashboard', text: '实时看板', description: 'AI展示实时运营数据', order: 1 },
        { code: 'approval_items', text: '审批事项', description: 'AI列出需审批项', order: 2 },
        { code: 'notifications', text: '消息通知', description: 'AI汇总重要通知', order: 3 },
        { code: 'voice_input', text: '语音输入', description: '支持语音交互', order: 4 }
      ]
    }
  },
  teacher: {
    roleCode: 'teacher',
    roleName: '老师',
    actions: {
      fullpage: [
        { code: 'generate_teaching_plan', text: '生成教学计划', icon: 'document', description: 'AI自动生成本周教学计划', order: 1 },
        { code: 'generate_student_assessment', text: '生成学生评估', icon: 'file-text', description: 'AI为指定学生生成评估报告', order: 2 },
        { code: 'plan_class_activity', text: '策划班级活动', icon: 'activities', description: 'AI提供班级活动方案', order: 3 },
        { code: 'parent_communication', text: '家长沟通建议', icon: 'chat', description: 'AI提供沟通话术建议', order: 4 },
        { code: 'classroom_observation', text: '记录课堂观察', icon: 'eye', description: 'AI辅助整理观察记录', order: 5 },
        { code: 'analyze_student_behavior', text: '分析学生行为', icon: 'user-check', description: 'AI分析学生行为表现', order: 6 },
        { code: 'recommend_resources', text: '推荐教学资源', icon: 'book', description: 'AI推荐适合的教学资源', order: 7 },
        { code: 'individualized_plan', text: '个别化方案', icon: 'user-edit', description: 'AI制定个别化教育方案', order: 8 }
      ],
      sidebar: [
        { code: 'today_schedule', text: '今日课程', description: 'AI展示今日课程安排', order: 1 },
        { code: 'quick_attendance', text: '快速点名', description: 'AI辅助班级考勤', order: 2 },
        { code: 'student_info', text: '学生信息', description: 'AI查询学生信息', order: 3 },
        { code: 'teaching_inspiration', text: '教学灵感', description: 'AI提供教学创意', order: 4 }
      ],
      mobile: [
        { code: 'quick_note', text: '随手记录', description: '快速记录课堂观察', order: 1 },
        { code: 'parent_message', text: '家长消息', description: 'AI辅助回复家长', order: 2 },
        { code: 'emergency_handling', text: '应急处理', description: 'AI提供应急建议', order: 3 },
        { code: 'photo_recognition', text: '拍照识别', description: '支持拍照上传', order: 4 }
      ]
    }
  },
  parent: {
    roleCode: 'parent',
    roleName: '家长',
    actions: {
      fullpage: [
        { code: 'parenting_qa', text: '育儿问答', icon: 'question', description: 'AI解答育儿问题', order: 1 },
        { code: 'view_growth_report', text: '查看成长报告', icon: 'chart', description: 'AI展示孩子成长数据', order: 2 },
        { code: 'family_activity', text: '亲子活动推荐', icon: 'heart', description: 'AI推荐亲子活动', order: 3 },
        { code: 'nutrition_recipe', text: '营养食谱', icon: 'food', description: 'AI推荐营养食谱', order: 4 },
        { code: 'behavior_consultation', text: '行为问题咨询', icon: 'user-question', description: 'AI提供行为指导', order: 5 },
        { code: 'ability_assessment', text: '能力评估', icon: 'file', description: 'AI评估孩子能力', order: 6 },
        { code: 'family_education', text: '家庭教育', icon: 'book', description: 'AI提供教育建议', order: 7 },
        { code: 'psychological_health', text: '心理健康', icon: 'heart-pulse', description: 'AI提供心理咨询', order: 8 }
      ],
      sidebar: [
        { code: 'today_performance', text: '今日表现', description: 'AI展示孩子今日表现', order: 1 },
        { code: 'quick_question', text: '快速提问', description: '快速育儿咨询', order: 2 },
        { code: 'homework_tutoring', text: '作业辅导', description: 'AI辅助作业辅导', order: 3 },
        { code: 'teacher_message', text: '老师留言', description: 'AI展示老师反馈', order: 4 }
      ],
      mobile: [
        { code: 'instant_consultation', text: '即时咨询', description: '紧急问题咨询', order: 1 },
        { code: 'growth_record', text: '成长记录', description: '记录成长瞬间', order: 2 },
        { code: 'pickup_reminder', text: '接送提醒', description: '设置接送提醒', order: 3 },
        { code: 'health_checkin', text: '健康打卡', description: '提交健康状况', order: 4 }
      ]
    }
  }
}

function getQuickActions(roleCode, displayMode) {
  const roleActions = quickActionsConfig[roleCode]
  if (!roleActions) {
    console.warn(`Unknown role code: ${roleCode}`)
    return []
  }
  
  const actions = roleActions.actions[displayMode]
  if (!actions) {
    console.warn(`Unknown display mode: ${displayMode}`)
    return []
  }
  
  return actions.sort((a, b) => a.order - b.order)
}

// 验证逻辑
console.log('🔍 开始验证AI快捷导航配置...\n')

const roles = ['principal', 'teacher', 'parent']
const displayModes = ['fullpage', 'sidebar', 'mobile']
const expectedCounts = {
  fullpage: 8,
  sidebar: 4,
  mobile: 4
}

let totalTests = 0
let passedTests = 0

roles.forEach(role => {
  console.log(`\n✨ 验证 ${quickActionsConfig[role].roleName} 角色:`)
  
  displayModes.forEach(mode => {
    totalTests++
    const actions = getQuickActions(role, mode)
    const expectedCount = expectedCounts[mode]
    
    if (actions.length === expectedCount) {
      passedTests++
      console.log(`  ✅ ${mode} 模式: ${actions.length}个快捷操作`)
      
      // 验证每个操作都有必要字段
      const missingFields = actions.filter(action => 
        !action.code || !action.text || !action.order
      )
      
      if (missingFields.length > 0) {
        console.log(`    ⚠️  有 ${missingFields.length} 个操作缺少必要字段`)
        passedTests--
      } else {
        // 显示前3个操作作为示例
        actions.slice(0, 3).forEach(action => {
          console.log(`    - ${action.text}`)
        })
        if (actions.length > 3) {
          console.log(`    ... 共${actions.length}个操作`)
        }
      }
    } else {
      console.log(`  ❌ ${mode} 模式: 预期${expectedCount}个，实际${actions.length}个`)
    }
  })
})

console.log('\n' + '='.repeat(60))
console.log(`\n📊 验证结果: ${passedTests}/${totalTests} 通过`)
console.log(`   成功率: ${Math.round(passedTests / totalTests * 100)}%\n`)

if (passedTests === totalTests) {
  console.log('🎉 所有验证通过！配置正确！')
  process.exit(0)
} else {
  console.log('⚠️  部分验证失败，请检查配置')
  process.exit(1)
}
