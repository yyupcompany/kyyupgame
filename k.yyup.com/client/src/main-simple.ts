import { createApp } from 'vue'

console.log('🚀 开始创建最简单的Vue应用...')

// 创建最简单的Vue应用
const app = createApp({
  template: `
    <div id="simple-app" style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #1890ff;">🎉 Vue应用成功启动！</h1>
      <p>这是一个最简单的Vue应用测试</p>
      <p>当前时间: {{ currentTime }}</p>
      <button @click="updateTime" style="padding: 10px 20px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        更新时间
      </button>
    </div>
  `,
  data() {
    return {
      currentTime: new Date().toLocaleString()
    }
  },
  methods: {
    updateTime() {
      this.currentTime = new Date().toLocaleString()
      console.log('时间已更新:', this.currentTime)
    }
  },
  mounted() {
    console.log('✅ Vue应用已成功挂载到DOM!')
  }
})

console.log('📦 Vue应用创建完成，准备挂载...')

// 挂载应用
console.log('🔗 开始挂载Vue应用到 #app...')
app.mount('#app')

console.log('🎊 Vue应用挂载完成!')

// 全局暴露Vue应用实例，便于调试
if (typeof window !== 'undefined') {
  ;(window as any).__VUE_APP__ = app
  console.log('🔧 Vue应用实例已暴露到全局 window.__VUE_APP__')
}
