// 通知项接口定义
export interface Notification {
  id: number
  title: string
  content: string
  time: Date
  read: boolean
  type: string
}

// 面包屑项接口定义
export interface BreadcrumbNav {
  title?: string
  name?: string
  path: string
} 