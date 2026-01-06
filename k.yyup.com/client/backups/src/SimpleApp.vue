<template>
  <div id="simple-app" style="padding: var(--spacing-5xl); font-family: Arial, sans-serif;">
    <h1 style="color: var(--brand-primary);">🎉 Vue应用成功启动！</h1>
    <p>这是一个简单的Vue应用测试</p>
    <p>当前时间: {{ currentTime }}</p>
    <button 
      @click="updateTime" 
      style="padding: var(--spacing-2xl) 20px; background: var(--brand-primary); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; margin-right: var(--spacing-2xl);"
    >
      更新时间
    </button>
    <button 
      @click="goToDashboard" 
      style="padding: var(--spacing-2xl) 20px; background: var(--brand-success); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer;"
    >
      进入仪表板
    </button>
    <div v-if="showMessage" style="margin-top: var(--spacing-2xl); padding: var(--spacing-2xl); background: #f0f9ff; border: var(--border-width-base) solid var(--brand-primary); border-radius: var(--radius-sm);">
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimpleApp',
  data() {
    return {
      currentTime: new Date().toLocaleString(),
      showMessage: false,
      message: ''
    }
  },
  methods: {
    updateTime() {
      this.currentTime = new Date().toLocaleString()
      this.showMessage = true
      this.message = '时间已更新！'
      console.log('时间已更新:', this.currentTime)
      
      // 3秒后隐藏消息
      setTimeout(() => {
        this.showMessage = false
      }, 3000)
    },
    goToDashboard() {
      this.showMessage = true
      this.message = '准备进入仪表板...'
      console.log('准备进入仪表板')
      
      // 模拟跳转
      setTimeout(() => {
        this.message = '仪表板功能正在开发中，请稍后再试'
      }, 1000)
    }
  },
  mounted() {
    console.log('✅ Vue应用已成功挂载到DOM!')
    this.showMessage = true
    this.message = '欢迎使用幼儿园管理系统！'
    
    // 3秒后隐藏欢迎消息
    setTimeout(() => {
      this.showMessage = false
    }, 3000)
  }
}
</script>
