/**
 * AI助手的本地TodoList管理器
 * 用于管理AI临时创建的任务清单
 */

export interface TodoTask {
  id: string
  title: string
  description: string
  priority: 'highest' | 'high' | 'medium' | 'low' | 'lowest'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  estimatedTime: string
  dueDate?: string
  dependencies: string[]
  completed: boolean
  completedAt: string | null
  order: number
}

export interface TodoList {
  id: string
  title: string
  description: string
  category: string
  assignTo: string
  deadline: string
  createdAt: string
  updatedAt: string
  status: 'active' | 'completed' | 'cancelled'
  progress: number
  tasks: TodoTask[]
  expiresAt?: string
}

export class LocalTodoListManager {
  private static readonly PREFIX = 'ai_todolist_'

  /**
   * 获取所有AI创建的TodoList
   */
  static getAllTodoLists(): TodoList[] {
    const todoLists: TodoList[] = []
    const keys = Object.keys(localStorage)
    
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        try {
          const data = localStorage.getItem(key)
          if (data) {
            const todoList = JSON.parse(data)
            
            // 检查是否过期
            if (todoList.expiresAt && new Date(todoList.expiresAt) < new Date()) {
              localStorage.removeItem(key)
              console.log(`🗑️ 清理过期TodoList: ${key}`)
            } else {
              todoLists.push(todoList)
            }
          }
        } catch (error) {
          console.error(`解析TodoList失败: ${key}`, error)
        }
      }
    })
    
    // 按创建时间倒序排列
    return todoLists.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  /**
   * 获取单个TodoList
   */
  static getTodoList(id: string): TodoList | null {
    try {
      const key = `${this.PREFIX}${id}`
      const data = localStorage.getItem(key)
      
      if (data) {
        const todoList = JSON.parse(data)
        
        // 检查是否过期
        if (todoList.expiresAt && new Date(todoList.expiresAt) < new Date()) {
          localStorage.removeItem(key)
          return null
        }
        
        return todoList
      }
    } catch (error) {
      console.error(`获取TodoList失败: ${id}`, error)
    }
    
    return null
  }

  /**
   * 更新任务状态
   */
  static updateTaskStatus(todoListId: string, taskId: string, status: TodoTask['status']): boolean {
    try {
      const key = `${this.PREFIX}${todoListId}`
      const data = localStorage.getItem(key)
      
      if (data) {
        const todoList = JSON.parse(data)
        const task = todoList.tasks.find((t: TodoTask) => t.id === taskId)
        
        if (task) {
          task.status = status
          task.completed = status === 'completed'
          task.completedAt = status === 'completed' ? new Date().toISOString() : null
          
          // 更新整体进度
          const completedTasks = todoList.tasks.filter((t: TodoTask) => t.completed).length
          todoList.progress = Math.round((completedTasks / todoList.tasks.length) * 100)
          todoList.updatedAt = new Date().toISOString()
          
          // 如果所有任务完成，标记TodoList为完成
          if (completedTasks === todoList.tasks.length) {
            todoList.status = 'completed'
          }
          
          localStorage.setItem(key, JSON.stringify(todoList))
          console.log(`✅ 任务状态已更新: ${taskId} -> ${status}`)
          return true
        }
      }
    } catch (error) {
      console.error(`更新任务状态失败: ${todoListId} - ${taskId}`, error)
    }
    
    return false
  }

  /**
   * 删除TodoList
   */
  static deleteTodoList(id: string): boolean {
    try {
      const key = `${this.PREFIX}${id}`
      localStorage.removeItem(key)
      console.log(`🗑️ TodoList已删除: ${id}`)
      return true
    } catch (error) {
      console.error(`删除TodoList失败: ${id}`, error)
      return false
    }
  }

  /**
   * 清理所有过期的TodoList
   */
  static cleanupExpired(): number {
    let cleanedCount = 0
    const keys = Object.keys(localStorage)
    
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        try {
          const data = localStorage.getItem(key)
          if (data) {
            const todoList = JSON.parse(data)
            if (todoList.expiresAt && new Date(todoList.expiresAt) < new Date()) {
              localStorage.removeItem(key)
              cleanedCount++
            }
          }
        } catch (error) {
          console.error(`清理TodoList失败: ${key}`, error)
        }
      }
    })
    
    if (cleanedCount > 0) {
      console.log(`🗑️ 清理了 ${cleanedCount} 个过期TodoList`)
    }
    
    return cleanedCount
  }

  /**
   * 获取TodoList统计信息
   */
  static getStatistics() {
    const todoLists = this.getAllTodoLists()
    
    const stats = {
      total: todoLists.length,
      active: todoLists.filter(tl => tl.status === 'active').length,
      completed: todoLists.filter(tl => tl.status === 'completed').length,
      totalTasks: todoLists.reduce((sum, tl) => sum + tl.tasks.length, 0),
      completedTasks: todoLists.reduce((sum, tl) => 
        sum + tl.tasks.filter(task => task.completed).length, 0
      ),
      categories: [...new Set(todoLists.map(tl => tl.category))]
    }
    
    return {
      ...stats,
      completionRate: stats.totalTasks > 0 
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
        : 0
    }
  }

  /**
   * 导出TodoList数据（用于备份）
   */
  static exportData(): string {
    const todoLists = this.getAllTodoLists()
    return JSON.stringify({
      exportTime: new Date().toISOString(),
      version: '1.0',
      todoLists
    }, null, 2)
  }
}


