<template>
  <div class="test-preview-page">
    <div class="header">
      <h2>预览功能测试</h2>
      <p>测试微信朋友圈和海报预览效果</p>
    </div>

    <div class="content">
      <div class="controls">
        <el-button @click="generateTestContent">生成测试内容</el-button>
        <el-radio-group v-model="previewMode" style="margin-left: var(--text-2xl);">
          <el-radio-button value="wechat">微信朋友圈</el-radio-button>
          <el-radio-button value="poster">海报预览</el-radio-button>
        </el-radio-group>
      </div>

      <div class="preview-area">
        <!-- 微信朋友圈预览 -->
        <div v-if="previewMode === 'wechat'" class="wechat-preview">
          <WeChatMomentsPreview 
            :content="testContent"
            :userName="'阳光幼儿园'"
            :userAvatar="'/api/placeholder/40/40'"
            :images="[]"
          />
        </div>

        <!-- 海报预览 -->
        <div v-else-if="previewMode === 'poster'" class="poster-preview">
          <PosterPreview 
            :content="testContent"
            :theme="posterTheme"
            :schoolName="'阳光幼儿园'"
            :logoUrl="'/api/placeholder/60/60'"
            :phone="'400-123-4567'"
            :address="'北京市朝阳区xxx街道xxx号'"
            @theme-change="handleThemeChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WeChatMomentsPreview from '@/components/preview/WeChatMomentsPreview.vue'
import PosterPreview from '@/components/preview/PosterPreview.vue'

const previewMode = ref('wechat')
const posterTheme = ref('warm')
const testContent = ref('🌸春暖花开，正是孩子们成长的好时节！\n\n今天在幼儿园里，看到小朋友们认真学习的样子，真的很感动。他们专注的眼神，天真的笑容，每一个瞬间都让我们感受到教育的美好。\n\n我们相信，每一个孩子都是独特的花朵，在阳光幼儿园这片沃土上，他们将绽放出最美丽的光彩！✨\n\n#幼儿园生活 #快乐成长 #教育分享\n\n欢迎家长朋友们分享您家宝贝的成长故事！')

const generateTestContent = () => {
  const contents = [
    '🌸春暖花开，正是孩子们成长的好时节！\n\n今天在幼儿园里，看到小朋友们认真学习的样子，真的很感动。\n\n#幼儿园生活 #快乐成长 #教育分享\n\n欢迎家长朋友们分享您家宝贝的成长故事！',
    '🎨今天的美术课真精彩！\n\n小朋友们用五彩斑斓的画笔，描绘出心中最美的世界。每一幅作品都充满了童真和想象力！\n\n#创意美术 #儿童画作 #艺术启蒙\n\n让我们一起为孩子们的创造力点赞！',
    '🏃‍♀️户外运动时间到！\n\n阳光明媚的午后，孩子们在操场上尽情奔跑，健康快乐地成长着。运动不仅强身健体，更培养了他们的团队合作精神！\n\n#户外运动 #健康成长 #团队合作\n\n运动让童年更精彩！'
  ]
  
  testContent.value = contents[Math.floor(Math.random() * contents.length)]
}

const handleThemeChange = (theme: string) => {
  posterTheme.value = theme
}
</script>

<style lang="scss" scoped>
.test-preview-page {
  padding: var(--text-2xl);
  max-width: 1200px;
  margin: 0 auto;

  .header {
    text-align: center;
    margin-bottom: var(--spacing-8xl);

    h2 {
      color: var(--text-primary);
      margin-bottom: var(--spacing-2xl);
    }

    p {
      color: var(--text-regular);
      font-size: var(--text-base);
    }
  }

  .content {
    .controls {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--spacing-8xl);
      padding: var(--text-2xl);
      background: var(--bg-gray-light);
      border-radius: var(--spacing-sm);
    }

    .preview-area {
      display: flex;
      justify-content: center;
      padding: var(--text-2xl);

      .wechat-preview,
      .poster-preview {
        display: flex;
        justify-content: center;
      }
    }
  }
}
</style>
