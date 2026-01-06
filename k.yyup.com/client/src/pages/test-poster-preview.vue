<template>
  <div class="test-poster-preview-page">
    <div class="header">
      <h2>海报预览功能测试</h2>
      <p>测试营销配置在海报预览中的显示效果</p>
    </div>

    <div class="content">
      <div class="controls">
        <el-button @click="generateTestContent">生成测试内容</el-button>
        <el-button @click="toggleMarketingConfig">切换营销配置</el-button>
        <el-radio-group v-model="currentTheme" style="margin-left: var(--text-2xl);">
          <el-radio-button value="warm">温馨</el-radio-button>
          <el-radio-button value="fresh">清新</el-radio-button>
          <el-radio-button value="elegant">优雅</el-radio-button>
          <el-radio-button value="playful">活泼</el-radio-button>
        </el-radio-group>
      </div>

      <div class="preview-area">
        <div class="poster-preview-container">
          <PosterPreview
            :content="testContent"
            :theme="currentTheme"
            :schoolName="'阳光幼儿园'"
            :logoUrl="'/api/placeholder/60/60'"
            :phone="'400-123-4567'"
            :address="'北京市朝阳区阳光街123号'"
            :showQR="true"
            :marketingConfig="showMarketingConfig ? marketingConfig : {}"
            @theme-change="handleThemeChange"
          />
        </div>
        
        <div class="config-panel">
          <h3>营销配置</h3>
          <el-switch 
            v-model="showMarketingConfig" 
            active-text="显示营销配置"
            inactive-text="隐藏营销配置"
          />
          
          <div v-if="showMarketingConfig" class="marketing-controls">
            <el-form label-width="100px">
              <el-form-item label="团购">
                <el-switch v-model="marketingConfig.groupBuy.enabled" />
                <span v-if="marketingConfig.groupBuy.enabled" style="margin-left: var(--spacing-2xl);">
                  {{ marketingConfig.groupBuy.minPeople }}人成团
                </span>
              </el-form-item>
              
              <el-form-item label="集赞">
                <el-switch v-model="marketingConfig.collect.enabled" />
                <span v-if="marketingConfig.collect.enabled" style="margin-left: var(--spacing-2xl);">
                  集{{ marketingConfig.collect.target }}个赞
                </span>
              </el-form-item>
              
              <el-form-item label="优惠券">
                <el-switch v-model="marketingConfig.coupon.enabled" />
                <span v-if="marketingConfig.coupon.enabled" style="margin-left: var(--spacing-2xl);">
                  {{ marketingConfig.coupon.quantity }}张
                </span>
              </el-form-item>
              
              <el-form-item label="推荐奖励">
                <el-switch v-model="marketingConfig.referral.enabled" />
                <span v-if="marketingConfig.referral.enabled" style="margin-left: var(--spacing-2xl);">
                  奖励{{ marketingConfig.referral.reward }}元
                </span>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PosterPreview from '@/components/preview/PosterPreview.vue'

const route = useRoute()

const currentTheme = ref('warm')
const showMarketingConfig = ref(true)

const testContent = ref('🌸春暖花开，正是孩子们成长的好时节！\n\n今天在幼儿园里，看到小朋友们认真学习的样子，真的很感动。他们专注的眼神，天真的笑容，每一个瞬间都让我们感受到教育的美好。\n\n我们相信，每一个孩子都是独特的花朵，在阳光幼儿园这片沃土上，他们将绽放出最美丽的光彩！✨')

const marketingConfig = reactive({
  groupBuy: {
    enabled: true,
    minPeople: 3,
    price: 299,
    deadline: '2024-12-31'
  },
  collect: {
    enabled: true,
    target: 50,
    rewardType: 'discount',
    discountPercent: 80
  },
  coupon: {
    enabled: true,
    type: 'reduce',
    quantity: 100,
    condition: '满500减50'
  },
  referral: {
    enabled: true,
    reward: 50,
    maxRewards: 5
  }
})

const generateTestContent = () => {
  const contents = [
    '🌸春暖花开，正是孩子们成长的好时节！我们相信，每一个孩子都是独特的花朵，在阳光幼儿园这片沃土上，他们将绽放出最美丽的光彩！',
    '🎈欢乐亲子活动即将开始！让我们一起陪伴孩子度过美好的时光，见证他们的每一个成长瞬间。',
    '📚新学期开始啦！我们为孩子们准备了丰富多彩的课程和活动，让学习变得更加有趣和充实。',
    '🎭精彩的文艺表演等你来！孩子们将展示他们的才艺，让我们一起为他们加油喝彩！'
  ]
  testContent.value = contents[Math.floor(Math.random() * contents.length)]
}

const toggleMarketingConfig = () => {
  showMarketingConfig.value = !showMarketingConfig.value
}

const handleThemeChange = (theme: string) => {
  currentTheme.value = theme
}

// 从路由参数初始化数据
onMounted(() => {
  // 如果有活动信息，使用活动信息初始化内容
  if (route.query.activityTitle) {
    const activityInfo = `${route.query.activityTitle}\n\n${route.query.activityDescription || ''}`
    testContent.value = activityInfo
  }

  // 如果有营销配置，使用营销配置
  if (route.query.marketingConfig) {
    try {
      const config = JSON.parse(route.query.marketingConfig as string)
      Object.assign(marketingConfig, config)
    } catch (error) {
      console.warn('Failed to parse marketing config:', error)
    }
  }
})
</script>

<style lang="scss" scoped>
.test-poster-preview-page {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 1200px;
  margin: 0 auto;

  .header {
    text-align: center;
    margin-bottom: var(--spacing-8xl);

    h2 {
      color: var(--text-primary);
      margin-bottom: var(--spacing-2xl);
    }

    p {
      color: var(--text-secondary);
      font-size: var(--text-base);
    }
  }

  .content {
    .controls {
      display: flex;
      align-items: center;
      gap: var(--text-2xl);
      margin-bottom: var(--spacing-8xl);
      padding: var(--text-2xl);
      background: var(--bg-secondary);
      border-radius: var(--spacing-sm);
    }

    .preview-area {
      display: flex;
      gap: var(--spacing-8xl);
      align-items: flex-start;

      .poster-preview-container {
        flex: 0 0 auto;
      }

      .config-panel {
        flex: 1;
        background: var(--bg-white);
        padding: var(--text-2xl);
        border-radius: var(--spacing-sm);
        box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

        h3 {
          margin-bottom: var(--text-2xl);
          color: var(--text-primary);
        }

        .marketing-controls {
          margin-top: var(--text-2xl);
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .test-poster-preview-page {
    .content {
      .controls {
        flex-direction: column;
        align-items: stretch;
      }

      .preview-area {
        flex-direction: column;
      }
    }
  }
}
</style>
