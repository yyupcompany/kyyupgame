/**
 * 创意课程生成器 - 类型定义
 */

// 五大领域课程类型
export enum CurriculumDomain {
  HEALTH = 'health',           // 健康领域
  LANGUAGE = 'language',       // 语言领域
  SOCIAL = 'social',           // 社会领域
  SCIENCE = 'science',         // 科学领域
  ART = 'art'                  // 艺术领域
}

// 学期类型
export enum Semester {
  SPRING = 'spring',           // 春季学期
  FALL = 'fall'                // 秋季学期
}

// 课程难度等级
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// 课程对象接口
export interface Curriculum {
  id?: string
  name: string                 // 课程名称
  description: string          // 课程描述
  domain: CurriculumDomain     // 所属领域
  semester: Semester            // 学期
  ageGroup: string             // 年龄段（如：3-4岁）
  duration: number             // 课程时长（分钟）
  difficulty: DifficultyLevel  // 难度等级
  objectives: string[]         // 学习目标
  materials: string[]          // 所需材料
  htmlCode: string             // HTML 代码
  cssCode: string              // CSS 代码
  jsCode: string               // JavaScript 代码
  thumbnail?: string           // 缩略图
  createdAt?: Date
  updatedAt?: Date
  teacherId?: number
}

// 课程表项目
export interface ScheduleItem {
  id?: string
  curriculumId?: string        // 关联的课程ID
  curriculumName?: string      // 课程名称（用于显示）
  dayOfWeek: number            // 0-6 (周一-周日)
  startTime: string            // HH:mm 格式
  endTime: string              // HH:mm 格式
  classroom?: string           // 教室
  notes?: string               // 备注
}

// 课程表
export interface CurriculumSchedule {
  id?: string
  name: string                 // 课程表名称
  semester: Semester
  year: number                 // 学年
  ageGroup: string             // 年龄段
  items: ScheduleItem[]        // 课程表项目
  createdAt?: Date
  updatedAt?: Date
  teacherId?: number
}

// 课程模板
export interface CurriculumTemplate {
  id: string
  name: string
  domain: CurriculumDomain
  description: string
  ageGroup: string
  htmlTemplate: string
  cssTemplate: string
  jsTemplate: string
  objectives: string[]
  materials: string[]
}

// 编辑器状态
export interface EditorState {
  htmlCode: string
  cssCode: string
  jsCode: string
  activeTab: 'html' | 'css' | 'js'
}

// 预览数据
export interface PreviewData {
  html: string
  css: string
  js: string
}

