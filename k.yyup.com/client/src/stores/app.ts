import { defineStore } from 'pinia'

interface AppState {
  isCollapse: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    isCollapse: false
  }),

  actions: {
    toggleSidebar() {
      this.isCollapse = !this.isCollapse
      // 手动存储到 localStorage
      localStorage.setItem('app-sidebar-collapsed', String(this.isCollapse))
    },

    setSidebarCollapse(status: boolean) {
      this.isCollapse = status
      // 手动存储到 localStorage
      localStorage.setItem('app-sidebar-collapsed', String(this.isCollapse))
    },

    // 初始化方法，从localStorage恢复状态
    initAppState() {
      const savedCollapse = localStorage.getItem('app-sidebar-collapsed')
      if (savedCollapse !== null) {
        this.isCollapse = savedCollapse === 'true'
      }
    }
  }
}) 