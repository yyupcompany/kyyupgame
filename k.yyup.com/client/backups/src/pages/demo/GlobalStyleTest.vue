<template>
  <div class="auxiliary-functionality-container demo-page">
    <div class="page-header">
      <h1 class="page-title">全局样式测试展板</h1>
      <p class="page-description">此页面用于独立验证全局样式系统，不依赖任何主布局组件</p>
    </div>

    <div class="demo-section">
      <h2 class="section-title">1. 颜色系统 (Colors)</h2>
      <div class="color-grid">
        <div class="color-swatch" style="background: var(--gradient-primary);">
          <span>主色调</span>
        </div>
        <div class="color-swatch" style="background: var(--gradient-success);">
          <span>成功色</span>
        </div>
        <div class="color-swatch" style="background: linear-gradient(135deg, var(--warning-color), var(--warning-light));">
          <span>警告色</span>
        </div>
        <div class="color-swatch" style="background: linear-gradient(135deg, var(--danger-color), var(--danger-light));">
          <span>危险色</span>
        </div>
        <div class="color-swatch" style="background: linear-gradient(135deg, var(--info-color), var(--info-light));">
          <span>信息色</span>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2 class="section-title">2. 字体系统 (Typography)</h2>
      <div class="typography-showcase">
        <div class="typography-item">
          <h1 style="font-size: var(--text-3xl); font-weight: 700; color: var(--text-primary); margin: 0;">H1 标题 (4xl, bold)</h1>
        </div>
        <div class="typography-item">
          <h2 style="font-size: var(--text-2xl); font-weight: 600; color: var(--text-primary); margin: 0;">H2 标题 (3xl, semibold)</h2>
        </div>
        <div class="typography-item">
          <h3 style="font-size: var(--text-xl); font-weight: 500; color: var(--text-secondary); margin: 0;">H3 标题 (2xl, medium)</h3>
        </div>
        <div class="typography-item">
          <p style="font-size: var(--text-base); color: var(--text-muted); line-height: 1.6; margin: 0;">
            这是一个标准段落。用于测试正文的字体大小、颜色和行高。我们优化了字体层次结构，确保最佳的可读性和视觉层次。
          </p>
        </div>
        <div class="typography-item">
          <small style="font-size: var(--text-sm); color: var(--text-disabled);">这是一个 small 标签，用于次要信息 (sm, tertiary)。</small>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2 class="section-title">3. 间距系统 (Spacing)</h2>
      <div class="component-showcase">
        <div class="showcase-item">
          <div class="showcase-title">外边距演示</div>
          <div style="background: #f3f4f6; padding: var(--spacing-lg); border-radius: var(--spacing-sm);">
            <div style="width: var(--avatar-size); height: var(--avatar-size); background: linear-gradient(135deg, var(--primary-color), #2563eb); border-radius: var(--spacing-sm); margin: var(--text-2xl) auto;"></div>
            <p style="text-align: center; margin: 0; font-size: 0.875rem; color: var(--text-secondary);">var(--text-3xl) 外边距</p>
          </div>
        </div>
        <div class="showcase-item">
          <div class="showcase-title">内边距演示</div>
          <div style="background: linear-gradient(135deg, var(--success-color), #059669); padding: var(--text-4xl); border-radius: var(--spacing-sm);">
            <div style="width: var(--avatar-size); height: var(--avatar-size); background: white; border-radius: var(--spacing-sm); margin: 0 auto;"></div>
            <p style="text-align: center; margin: var(--spacing-sm) 0 0 0; font-size: 0.875rem; color: white;">var(--spacing-3xl) 内边距</p>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2 class="section-title">4. 卡片与阴影 (Cards & Shadows)</h2>
      <div class="component-showcase">
        <div class="showcase-item">
          <div class="showcase-title">轻微阴影</div>
          <div style="padding: var(--spacing-lg); background: white; border-radius: var(--text-sm); box-shadow: 0 var(--border-width-base) 3px var(--shadow-light);">Small Shadow</div>
        </div>
        <div class="showcase-item">
          <div class="showcase-title">中等阴影</div>
          <div style="padding: var(--spacing-lg); background: white; border-radius: var(--text-sm); box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);">Medium Shadow</div>
        </div>
        <div class="showcase-item">
          <div class="showcase-title">深度阴影</div>
          <div style="padding: var(--spacing-lg); background: white; border-radius: var(--text-sm); box-shadow: 0 var(--spacing-sm) var(--text-3xl) var(--shadow-heavy);">Large Shadow</div>
        </div>
        <div class="showcase-item">
          <div class="showcase-title">特大阴影</div>
          <div style="padding: var(--spacing-lg); background: white; border-radius: var(--text-sm); box-shadow: 0 var(--text-2xl) 40px rgba(0, 0, 0, 0.25);">XL Shadow</div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2 class="section-title">5. 按钮系统 (Buttons)</h2>
      <div class="component-showcase">
        <div class="showcase-item">
          <div class="showcase-title">主要按钮</div>
          <div style="display: flex; gap: var(--text-xs); flex-wrap: wrap;">
            <button style="padding: var(--text-xs) var(--text-3xl); border: none; border-radius: var(--text-sm); background: linear-gradient(135deg, var(--primary-color), #2563eb); color: white; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">主要按钮</button>
            <button style="padding: var(--text-xs) var(--text-3xl); border: 2px solid var(--primary-color); border-radius: var(--text-sm); background: transparent; color: var(--primary-color); font-weight: 600; cursor: pointer; transition: all 0.3s ease;">次要按钮</button>
          </div>
        </div>
        <div class="showcase-item">
          <div class="showcase-title">状态按钮</div>
          <div style="display: flex; gap: var(--text-xs); flex-wrap: wrap;">
            <button style="padding: var(--spacing-sm) var(--text-2xl); border: none; border-radius: var(--radius-xl); background: linear-gradient(135deg, var(--success-color), #059669); color: white; font-weight: 600; cursor: pointer;">成功</button>
            <button style="padding: var(--spacing-sm) var(--text-2xl); border: none; border-radius: var(--radius-xl); background: linear-gradient(135deg, var(--warning-color), #d97706); color: white; font-weight: 600; cursor: pointer;">警告</button>
            <button style="padding: var(--spacing-sm) var(--text-2xl); border: none; border-radius: var(--radius-xl); background: linear-gradient(135deg, var(--danger-color), #dc2626); color: white; font-weight: 600; cursor: pointer;">危险</button>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2 class="section-title">6. 主题切换</h2>
      <div class="component-showcase">
        <div class="showcase-item">
          <div class="showcase-title">主题切换器</div>
          <p style="margin-bottom: var(--spacing-md); color: var(--text-muted);">点击下方按钮，观察以上所有元素的颜色变化</p>
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ThemeSwitcher from '../../components/ThemeSwitcher.vue';

export default defineComponent({
  name: 'GlobalStyleTest',
  components: {
    ThemeSwitcher,
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';
@import '../auxiliary-functionality-ux-styles.scss';

/* 演示页面样式 - 所有样式已在 auxiliary-functionality-ux-styles.scss 中统一定义 */
</style> 