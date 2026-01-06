# Vue3 3D登录入场动画Demo

这个demo包含了8种流行的Vue3登录后入场动画效果：

## 🎨 动画类型

### 1. CSS 3D方块动画 (`blocks-animation/`)
- 纯CSS 3D transforms实现
- 横向方块旋转入场
- 渐变背景效果
- 中间进度条加载

### 2. GSAP 3D卡片动画 (`gsap-cards/`)
- 使用GSAP动画库
- 3D卡片翻转效果
- 立体空间感
- 流畅的动画曲线

### 3. 粒子波浪动画 (`particle-wave/`)
- 粒子系统背景
- 波浪式入场效果
- 动态文字显示
- 现代感设计

### 4. 3D方块矩阵动画 (`matrix-blocks/`)
- 矩阵式方块排列
- 逐个点亮效果
- 进度条显示
- 科技感设计

### 5. 螺旋3D动画 (`helix-spiral/`)
- 星空粒子背景
- 螺旋旋转布局
- 悬浮发光效果
- 螺旋进度条

### 6. 立方体爆炸动画 (`cube-explosion/`)
- 3D立方体爆炸效果
- 模块化组装流程
- 粒子飞散动画
- 立体空间布局

### 7. 液体流动动画 (`liquid-flow/`)
- Canvas液体粒子效果
- 气泡漂浮动画
- 流体形状变换
- 液体进度条

### 8. 霓虹网格动画 (`neon-grid/`)
- 赛博朋克网格效果
- 霓虹发光技术
- 扫描线动画
- 神经网络布局

## 🚀 快速开始

### 安装依赖
```bash
cd login-animation-demo
npm install
```

### 运行demo
```bash
npm run dev
```

### 查看不同动画
访问 http://localhost:5173，然后在URL后添加对应的路径：
- `/blocks` - CSS 3D方块动画
- `/gsap-cards` - GSAP 3D卡片动画
- `/particle-wave` - 粒子波浪动画
- `/matrix-blocks` - 3D方块矩阵动画

## 📁 项目结构
```
login-animation-demo/
├── src/
│   ├── components/
│   │   ├── animations/
│   │   │   ├── BlocksAnimation.vue
│   │   │   ├── GsapCards.vue
│   │   │   ├── ParticleWave.vue
│   │   │   └── MatrixBlocks.vue
│   │   └── common/
│   │       ├── ProgressBar.vue
│   │       └── BackgroundEffect.vue
│   ├── views/
│   │   ├── BlocksView.vue
│   │   ├── GsapCardsView.vue
│   │   ├── ParticleWaveView.vue
│   │   └── MatrixBlocksView.vue
│   ├── router/
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── package.json
├── vite.config.ts
└── README.md
```

## 🎯 使用方法

### 在您的Vue3项目中使用
```vue
<template>
  <div>
    <!-- 方块动画 -->
    <BlocksAnimation
      :show="showAnimation"
      @complete="onAnimationComplete"
    />

    <!-- GSAP卡片动画 -->
    <GsapCards
      :duration="3000"
      :blocks="[
        { text: '招生管理', icon: '🎓', color: '#4CAF50' },
        { text: '教学中心', icon: '📚', color: '#2196F3' },
        { text: '活动管理', icon: '🎪', color: '#FF9800' },
        { text: '财务中心', icon: '💰', color: '#9C27B0' },
        { text: 'AI助手', icon: '🤖', color: '#00BCD4' },
        { text: '系统设置', icon: '⚙️', color: '#607D8B' }
      ]"
      @complete="onAnimationComplete"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BlocksAnimation from '@/components/animations/BlocksAnimation.vue'
import GsapCards from '@/components/animations/GsapCards.vue'

const showAnimation = ref(false)

const onAnimationComplete = () => {
  console.log('动画完成，可以进入主页面')
  // 跳转到主页面
}
</script>
```

## ✨ 特性

- ✅ Vue 3 Composition API
- ✅ TypeScript 支持
- ✅ 响应式设计
- ✅ 可自定义参数
- ✅ 完整的回调事件
- ✅ 现代化UI设计
- ✅ 流畅的动画效果

## 📝 自定义配置

每个动画组件都支持丰富的配置选项：

```typescript
interface AnimationConfig {
  duration?: number        // 动画时长 (毫秒)
  blocks?: BlockConfig[]   // 方块配置
  colors?: string[]        // 颜色配置
  autoStart?: boolean      // 是否自动开始
  showProgress?: boolean   // 是否显示进度条
  background?: string      // 背景颜色/渐变
  onComplete?: Function    // 完成回调
}
```

## 🎨 效果预览

每种动画都有独特的视觉效果：

1. **BlocksAnimation**: 3D方块旋转，适合现代科技风格
2. **GsapCards**: 卡片翻转，优雅立体
3. **ParticleWave**: 粒子效果，动感时尚
4. **MatrixBlocks**: 矩阵点亮，科技感强

选择最适合您项目风格的动画效果！