/**
 * 表格工具函数
 * 从 AIAssistant.vue 第436-516行提取
 *
 * 🎯 核心功能：
 * ├─ 从数据自动生成表格列配置
 * ├─ 字段名到中文标签的映射
 * └─ 根据字段类型自动设置列宽度
 * 
 * 💡 使用示例：
 * import { generateColumnsFromData } from './tableUtils'
 * 
 * const columns = generateColumnsFromData(data)
 */

// 字段名到中文标签的映射
export const labelMap: Record<string, string> = {
  // 通用字段
  id: 'ID',
  name: '名称',
  title: '标题',
  description: '描述',
  status: '状态',
  createdAt: '创建时间',
  updatedAt: '更新时间',

  // 学生相关
  studentNo: '学号',
  studentName: '学生姓名',
  gender: '性别',
  birthDate: '出生日期',
  age: '年龄',
  className: '班级',
  classId: '班级ID',

  // 教师相关
  teacherNo: '工号',
  teacherName: '教师姓名',
  subject: '科目',
  phone: '电话',
  email: '邮箱',

  // 班级相关
  grade: '年级',
  capacity: '容量',
  studentCount: '学生人数',

  // 活动相关
  activityName: '活动名称',
  activityType: '活动类型',
  startTime: '开始时间',
  endTime: '结束时间',
  location: '地点',

  // 统计相关
  count: '数量',
  total: '总计',
  average: '平均值',
  percentage: '百分比'
}

/**
 * 从数据自动生成表格列配置
 * @param data 数据数组
 * @returns 表格列配置数组
 */
export const generateColumnsFromData = (data: any[]): Array<{ prop: string; label: string; width?: number }> => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return []
  }

  const firstItem = data[0]
  if (!firstItem || typeof firstItem !== 'object') {
    return []
  }

  // 生成列配置
  const columns = Object.keys(firstItem).map(key => {
    const label = labelMap[key] || key

    // 根据字段类型设置宽度
    let width = 120
    if (key === 'id' || key.endsWith('Id')) {
      width = 80
    } else if (key === 'description' || key === 'content') {
      width = 200
    } else if (key.includes('Time') || key.includes('Date')) {
      width = 150
    } else if (key === 'status') {
      width = 100
    }

    return {
      prop: key,
      label: label,
      width: width
    }
  })

  return columns
}

