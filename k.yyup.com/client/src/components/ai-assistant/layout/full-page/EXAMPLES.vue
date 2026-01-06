<!--
  AI助手全屏页面 - 使用示例
  演示如何使用新的插槽式布局系统
-->

<template>
  <div class="example-container">
    <h1>AI助手布局系统使用示例</h1>

    <!-- 示例1: 使用包装组件 -->
    <section class="example-section">
      <h2>示例1: 使用 AIAssistantFullPage (推荐)</h2>
      <p>最简单的使用方式,所有功能开箱即用</p>
      <pre><code>&lt;template&gt;
  &lt;AIAssistantFullPage :visible="true" /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import AIAssistantFullPage from '@/components/ai-assistant/AIAssistantFullPage.vue'
&lt;/script&gt;</code></pre>
    </section>

    <!-- 示例2: 基础自定义 -->
    <section class="example-section">
      <h2>示例2: 基础自定义布局</h2>
      <p>使用布局组件但自定义内容</p>
      <pre><code>&lt;template&gt;
  &lt;FullPageLayout :sidebar-collapsed="collapsed"&gt;
    &lt;!-- 自定义头部 --&gt;
    &lt;template #header&gt;
      &lt;FullPageHeader
        subtitle="自定义副标题"
        :usage-label="usageText"
        :usage-percent="percent"
        @toggle-sidebar="toggleSidebar"
      /&gt;
    &lt;/template&gt;

    &lt;!-- 自定义侧边栏 --&gt;
    &lt;template #sidebar&gt;
      &lt;FullPageSidebar
        :quick-actions="customActions"
        @new-conversation="handleNew"
      /&gt;
    &lt;/template&gt;

    &lt;!-- 自定义对话区 --&gt;
    &lt;template #dialog&gt;
      &lt;FullPageDialog :has-messages="messages.length &gt; 0" /&gt;
    &lt;/template&gt;

    &lt;!-- 自定义输入区 --&gt;
    &lt;template #input&gt;
      &lt;InputArea @send="handleSend" /&gt;
    &lt;/template&gt;
  &lt;/FullPageLayout&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref } from 'vue'
import {
  FullPageLayout,
  FullPageHeader,
  FullPageSidebar,
  FullPageDialog
} from '@/components/ai-assistant/layout/full-page'
import InputArea from '@/components/ai-assistant/input/InputArea.vue'

const collapsed = ref(false)
const messages = ref([])
const usageText = ref('1000 / 10000')
const percent = ref(10)

const customActions = [
  { index: '2', label: '自定义操作', icon: 'star', action: 'custom' }
]

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}

const handleNew = () => {
  messages.value = []
}

const handleSend = (message: string) => {
  messages.value.push({ content: message })
}
&lt;/script&gt;</code></pre>
    </section>

    <!-- 示例3: 完全自定义 -->
    <section class="example-section">
      <h2>示例3: 完全自定义组件</h2>
      <p>只使用布局框架,完全自定义内容</p>
      <pre><code>&lt;template&gt;
  &lt;FullPageLayout&gt;
    &lt;template #header&gt;
      &lt;!-- 自定义头部组件 --&gt;
      &lt;MyCustomHeader /&gt;
    &lt;/template&gt;

    &lt;template #sidebar&gt;
      &lt;!-- 自定义侧边栏组件 --&gt;
      &lt;MyCustomSidebar /&gt;
    &lt;/template&gt;

    &lt;template #dialog&gt;
      &lt;!-- 自定义对话组件 --&gt;
      &lt;MyCustomDialog /&gt;
    &lt;/template&gt;

    &lt;template #input&gt;
      &lt;!-- 自定义输入组件 --&gt;
      &lt;MyCustomInput /&gt;
    &lt;/template&gt;
  &lt;/FullPageLayout&gt;
&lt;/template&gt;</code></pre>
    </section>

    <!-- 示例4: 自定义消息列表 -->
    <section class="example-section">
      <h2>示例4: 自定义消息列表</h2>
      <p>使用 FullPageDialog 但自定义消息内容</p>
      <pre><code>&lt;template&gt;
  &lt;FullPageLayout&gt;
    &lt;template #dialog&gt;
      &lt;FullPageDialog :has-messages="messages.length &gt; 0"&gt;
        &lt;template #messages&gt;
          &lt;!-- 自定义消息列表 --&gt;
          &lt;div v-for="msg in messages" :key="msg.id" class="custom-message"&gt;
            &lt;div class="avatar"&gt;{{ msg.sender }}&lt;/div&gt;
            &lt;div class="content"&gt;{{ msg.content }}&lt;/div&gt;
            &lt;div class="time"&gt;{{ msg.time }}&lt;/div&gt;
          &lt;/div&gt;
        &lt;/template&gt;
      &lt;/FullPageDialog&gt;
    &lt;/template&gt;
  &lt;/FullPageLayout&gt;
&lt;/template&gt;</code></pre>
    </section>

    <!-- Props示例 -->
    <section class="example-section">
      <h2>Props 参考</h2>
      
      <h3>FullPageLayout</h3>
      <ul>
        <li><code>sidebarCollapsed?: boolean</code> - 侧边栏折叠状态</li>
      </ul>

      <h3>FullPageHeader</h3>
      <ul>
        <li><code>subtitle?: string</code> - 副标题</li>
        <li><code>mode?: string</code> - 模式说明</li>
        <li><code>features?: string</code> - 功能说明</li>
        <li><code>usageLabel?: string</code> - 用量标签</li>
        <li><code>usagePercent?: number</code> - 用量百分比</li>
        <li><code>sidebarCollapsed?: boolean</code> - 侧边栏状态</li>
      </ul>

      <h3>FullPageSidebar</h3>
      <ul>
        <li><code>activeIndex?: string</code> - 当前激活菜单</li>
        <li><code>quickActions?: MenuItem[]</code> - 快捷操作列表</li>
        <li><code>commonFeatures?: MenuItem[]</code> - 常用功能列表</li>
      </ul>

      <h3>FullPageDialog</h3>
      <ul>
        <li><code>hasMessages?: boolean</code> - 是否有消息</li>
        <li><code>welcomeTitle?: string</code> - 欢迎标题</li>
        <li><code>welcomeText?: string</code> - 欢迎文本</li>
        <li><code>badges?: string[]</code> - 功能标签</li>
        <li><code>quickActions?: QuickAction[]</code> - 快速操作</li>
        <li><code>suggestions?: string[]</code> - 建议问题</li>
      </ul>
    </section>

    <!-- Events示例 -->
    <section class="example-section">
      <h2>Events 参考</h2>
      
      <h3>FullPageHeader</h3>
      <ul>
        <li><code>@toggle-sidebar</code> - 切换侧边栏</li>
      </ul>

      <h3>FullPageSidebar</h3>
      <ul>
        <li><code>@new-conversation</code> - 新建对话</li>
        <li><code>@quick-action(action: string)</code> - 快捷操作</li>
        <li><code>@common-feature(action: string)</code> - 常用功能</li>
      </ul>

      <h3>FullPageDialog</h3>
      <ul>
        <li><code>@quick-action(action: string)</code> - 快速操作点击</li>
        <li><code>@suggestion-click(suggestion: string)</code> - 建议问题点击</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
// 这个文件只是示例文档,不需要实际运行
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入
.example-container {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  color: var(--text-primary);
  margin-bottom: 30px;
}

.example-section {
  margin-bottom: 40px;
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border-radius: 8px;
}

.example-section h2 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.example-section h3 {
  color: var(--text-secondary);
  margin: var(--spacing-lg) 0 10px 0;
}

.example-section p {
  color: var(--text-secondary);
  margin-bottom: 15px;
}

pre {
  background: var(--text-primary);
  color: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: 6px;
  overflow-x: auto;
}

code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--text-sm);
  line-height: 1.6;
}

ul {
  list-style: none;
  padding-left: 0;
}

ul li {
  padding: var(--spacing-xs) 0;
  border-bottom: 1px solid #e0e0e0;
}

ul li code {
  background: var(--text-primary);
  color: var(--primary-color);
  padding: var(--spacing-micro) var(--spacing-xs);
  border-radius: 4px;
  font-size: var(--text-sm);
}
</style>

