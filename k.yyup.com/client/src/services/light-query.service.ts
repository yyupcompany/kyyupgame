import { request } from '../utils/request'

export type LightQueryResult = {
  content: string
  componentData?: any
}

export type LightQueryType =
  | 'activity_month_stats'

function includesAny(target: string, keywords: string[]) {
  return keywords.some(k => target.includes(k))
}

export const LightQueryService = {
  // 粗粒度轻量级提示词识别：本月/最近30天 活动 统计
  detect(userInput: string): LightQueryType | null {
    const text = (userInput || '').toLowerCase()
      .replace(/\s+/g, '')

    const cnText = userInput.replace(/\s+/g, '')

    const monthHints = ['最近一个月', '近30天', '近三十天', '本月', '近1个月']
    const activityHints = ['活动']
    const statsHints = ['统计', '数据', '概览', '分析']

    if (includesAny(cnText, monthHints) && includesAny(cnText, activityHints) && includesAny(cnText, statsHints)) {
      return 'activity_month_stats'
    }

    // 英文兜底
    if (text.includes('last30days') || (text.includes('last') && text.includes('30') && (text.includes('day') || text.includes('days')))) {
      if (text.includes('activity') && (text.includes('stats') || text.includes('statistics') || text.includes('overview'))) {
        return 'activity_month_stats'
      }
    }

    return null
  },

  // 处理轻量级查询：优先直连统计API，毫秒级返回
  async handle(type: LightQueryType, _userInput: string): Promise<LightQueryResult> {
    if (type === 'activity_month_stats') {
      // 计算最近30天
      const end = new Date()
      const start = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
      const yyyyMmDd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const startDate = yyyyMmDd(start)
      const endDate = yyyyMmDd(end)

      // 使用统一统计API detailed 类型（支持日期范围）
      const res = await request.get('/api/statistics', {
        params: { module: 'activities', type: 'detailed', startDate, endDate }
      })

      const data = res?.data || {}
      const totalActivities = data.total_activities ?? data.totalActivities ?? 0
      const avgParticipationRate = data.avg_participation_rate ?? data.avgParticipationRate ?? 0
      const totalParticipants = data.total_participants ?? data.totalParticipants ?? 0

      const content = [
        `本地轻量级查询已完成（未调用大模型）`,
        `时间范围：${startDate} ~ ${endDate}`,
        `最近30天活动统计：`,
        `- 活动总数：${totalActivities} 场`,
        `- 参与总人数：${totalParticipants} 人`,
        `- 平均参与率：${Number(avgParticipationRate).toFixed(1)}%`
      ].join('\n')

      // 可选：提供一个简单的组件数据给渲染器
      const componentData = {
        type: 'stat-card',
        title: '最近30天活动统计',
        value: String(totalActivities),
        unit: '场',
        extra: `参与人数：${totalParticipants} | 平均参与率：${Number(avgParticipationRate).toFixed(1)}%`
      }

      return { content, componentData }
    }

    // 未识别类型兜底
    return { content: '未能识别的轻量级查询类型。', componentData: null }
  }
}

