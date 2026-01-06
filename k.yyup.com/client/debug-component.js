import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import AIQueryInterface from './src/pages/ai/AIQueryInterface.vue'

// 创建基本的挂载选项
const mountOptions = {
  global: {
    stubs: {
      'el-card': { template: '<div class="el-card-stub"><slot /></div>' },
      'el-input': { template: '<div class="el-input-stub"><slot /></div>' },
      'el-button': { template: '<button class="el-button-stub"><slot /></button>' },
      'el-tooltip': { template: '<div class="el-tooltip-stub"><slot /></div>' },
      'el-dropdown': { template: '<div class="el-dropdown-stub"><slot /></div>' },
      'el-dropdown-menu': { template: '<div class="el-dropdown-menu-stub"><slot /></div>' },
      'el-dropdown-item': { template: '<div class="el-dropdown-item-stub"><slot /></div>' },
      'el-empty': { template: '<div class="el-empty-stub"><slot /></div>' },
      'el-dialog': { template: '<div class="el-dialog-stub"><slot /></div>' },
      // Stub all icons
      'DataAnalysis': { template: '<span class="data-analysis-icon"></span>' },
      'ChatLineRound': { template: '<span class="chat-line-round-icon"></span>' },
      'QuestionFilled': { template: '<span class="question-filled-icon"></span>' },
      'Clock': { template: '<span class="clock-icon"></span>' },
      'Delete': { template: '<span class="delete-icon"></span>' },
      'Collection': { template: '<span class="collection-icon"></span>' },
      'Search': { template: '<span class="search-icon"></span>' },
      'Lightbulb': { template: '<span class="lightbulb-icon"></span>' },
      'InfoFilled': { template: '<span class="info-filled-icon"></span>' }
    }
  }
}

try {
  console.log('🔍 开始调试AIQueryInterface组件...')
  
  // 挂载组件
  const wrapper = mount(AIQueryInterface, mountOptions)
  
  console.log('=== 组件挂载成功 ===')
  console.log('组件存在:', wrapper.exists())
  console.log('组件VM:', !!wrapper.vm)
  
  console.log('\n=== 组件HTML结构 ===')
  console.log(wrapper.html())
  
  console.log('\n=== 组件文本内容 ===')
  console.log(wrapper.text())
  
  console.log('\n=== 查找关键元素 ===')
  console.log('ai-query-interface 根元素:', wrapper.find('.ai-query-interface').exists())
  console.log('页面标题存在:', wrapper.find('.page-title').exists())
  console.log('页面描述存在:', wrapper.find('.page-description').exists())
  console.log('el-card-stub 存在:', wrapper.find('.el-card-stub').exists())
  console.log('el-input-stub 存在:', wrapper.find('.el-input-stub').exists())
  console.log('el-button-stub 存在:', wrapper.find('.el-button-stub').exists())
  
  console.log('\n=== 文本内容检查 ===')
  const text = wrapper.text()
  console.log('包含"AI智能查询":', text.includes('AI智能查询'))
  console.log('包含"通过自然语言描述":', text.includes('通过自然语言描述'))
  console.log('包含"智能查询":', text.includes('智能查询'))
  console.log('包含"执行查询":', text.includes('执行查询'))
  console.log('包含"清空":', text.includes('清空'))
  console.log('包含"模板":', text.includes('模板'))
  console.log('包含"示例":', text.includes('示例'))
  console.log('包含"历史":', text.includes('历史'))
  
  console.log('\n=== 按钮元素检查 ===')
  const buttons = wrapper.findAll('button')
  console.log('按钮数量:', buttons.length)
  buttons.forEach((btn, index) => {
    console.log(`按钮${index + 1}文本:`, btn.text())
    console.log(`按钮${index + 1}HTML:`, btn.html())
  })
  
  wrapper.unmount()
  console.log('\n✅ 调试完成')
  
} catch (error) {
  console.error('❌ 组件挂载失败:', error)
  console.error('错误堆栈:', error.stack)
}
