<template>
  <div class="mobile-assessment-layout">
    <!-- 移动端顶部导航 -->
    <div class="mobile-header">
      <van-nav-bar
        title="测评中心"
        left-arrow
        @click-left="goBack"
        :fixed="true"
        :placeholder="true"
      >
        <template #right>
          <van-icon
            name="question-o"
            size="18"
            @click="showHelp"
          />
        </template>
      </van-nav-bar>
    </div>

    <!-- 主要内容区域 -->
    <div class="mobile-content">
      <!-- 顶部介绍信息 -->
      <div class="assessment-intro">
        <h2 class="intro-title">专业儿童测评</h2>
        <p class="intro-desc">根据孩子年龄与需求选择合适的测评类型</p>
      </div>

      <!-- 测评类型选择卡片 -->
      <div class="assessment-types">
        <div
          v-for="type in assessmentTypes"
          :key="type.key"
          class="type-card"
          :class="{ active: activeType === type.key }"
          @click="selectType(type)"
        >
          <div class="card-icon">
            <van-icon :name="type.icon" size="32" />
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ type.title }}</h3>
            <p class="card-desc">{{ type.description }}</p>
            <div class="card-age">{{ type.ageRange }}</div>
          </div>
          <div class="card-arrow">
            <van-icon name="arrow" />
          </div>
        </div>
      </div>

      <!-- 路由内容区域 -->
      <div class="tab-content">
        <router-view v-slot="{ Component }">
          <transition name="slide-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>

    <!-- 帮助弹窗 -->
    <van-popup
      v-model:show="showHelpPopup"
      position="bottom"
      :style="{ height: '70%' }"
      round
    >
      <div class="help-content">
        <div class="help-header">
          <h3>测评说明</h3>
          <van-icon name="cross" @click="showHelpPopup = false" />
        </div>
        <div class="help-body">
          <div class="help-section">
            <h4>什么是儿童发育评估？</h4>
            <p>通过专业的评估工具，全面了解孩子在认知、语言、运动、社交等各个发展领域的能力水平。</p>
          </div>
          <div class="help-section">
            <h4>评估结果如何使用？</h4>
            <p>评估结果将帮助家长更好地了解孩子的发展特点，为教育决策提供科学依据。</p>
          </div>
          <div class="help-section">
            <h4>多久进行一次评估？</h4>
            <p>建议每3-6个月进行一次评估，以跟踪孩子的成长轨迹。</p>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface AssessmentType {
  key: string
  title: string
  description: string
  ageRange: string
  icon: string
  route: string
}

const route = useRoute()
const router = useRouter()

const activeType = ref<string>('development')
const showHelpPopup = ref(false)

// 测评类型配置
const assessmentTypes: AssessmentType[] = [
  {
    key: 'development',
    title: '2-6岁儿童发育商',
    description: '评估儿童各项发育指标',
    ageRange: '2-6岁',
    icon: 'flower-o',
    route: '/mobile/parent-center/assessment/development'
  },
  {
    key: 'school-readiness',
    title: '幼小衔接',
    description: '评估入学准备能力',
    ageRange: '5-7岁',
    icon: 'book-o',
    route: '/mobile/parent-center/assessment/school-readiness'
  },
  {
    key: 'academic',
    title: '1-6年级学科测试',
    description: '评估学科学习水平',
    ageRange: '6-12岁',
    icon: 'edit',
    route: '/mobile/parent-center/assessment/academic'
  }
]

const syncTypeFromRoute = () => {
  const path = route.path

  if (path.includes('/assessment/school-readiness')) {
    activeType.value = 'school-readiness'
  } else if (path.includes('/assessment/academic')) {
    activeType.value = 'academic'
  } else {
    // 默认显示儿童发育商
    activeType.value = 'development'
  }
}

// 初始同步一次
syncTypeFromRoute()

// 监听路由变化，同步当前激活的类型
watch(
  () => route.path,
  () => {
    syncTypeFromRoute()
  }
)

const selectType = (type: AssessmentType) => {
  activeType.value = type.key
  router.push(type.route)
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/mobile/parent-center')
  }
}

const showHelp = () => {
  showHelpPopup.value = true
}
</script>

<style scoped lang="scss">
.mobile-assessment-layout {
  min-height: 100vh;
  background: var(--van-background-color);
  padding-bottom: var(--van-padding-xs);
}

.mobile-header {
  :deep(.van-nav-bar) {
    background: var(--van-primary-color);
    color: white;

    .van-nav-bar__title {
      color: white;
      font-weight: 600;
    }

    .van-icon {
      color: white;
    }
  }
}

.mobile-content {
  padding-top: var(--van-nav-bar-height);
  padding-bottom: var(--van-padding-md);
}

.assessment-intro {
  padding: var(--van-padding-lg);
  text-align: center;
  background: linear-gradient(135deg, var(--van-primary-color), var(--van-primary-color-light));
  color: white;
  margin: var(--van-padding-md);
  border-radius: var(--van-radius-lg);

  .intro-title {
    font-size: var(--van-font-size-lg);
    font-weight: 600;
    margin: 0 0 var(--van-padding-sm) 0;
  }

  .intro-desc {
    font-size: var(--van-font-size-md);
    opacity: 0.9;
    margin: 0;
    line-height: 1.5;
  }
}

.assessment-types {
  padding: 0 var(--van-padding-md);
  margin-bottom: var(--van-padding-lg);
}

.type-card {
  background: white;
  border-radius: var(--van-radius-lg);
  padding: var(--van-padding-lg);
  margin-bottom: var(--van-padding-md);
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }

  &.active {
    border: 2px solid var(--van-primary-color);
    box-shadow: 0 4px 12px rgba(var(--van-primary-color-rgb), 0.3);

    .card-icon {
      background: var(--van-primary-color);
      color: white;
    }
  }

  .card-icon {
    width: 60px;
    height: 60px;
    border-radius: var(--van-radius-lg);
    background: var(--van-background-color-light);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--van-padding-md);
    color: var(--van-primary-color);
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .card-content {
    flex: 1;

    .card-title {
      font-size: var(--van-font-size-lg);
      font-weight: 600;
      margin: 0 0 var(--van-padding-xs) 0;
      color: var(--van-text-color);
    }

    .card-desc {
      font-size: var(--van-font-size-md);
      color: var(--van-text-color-2);
      margin: 0 0 var(--van-padding-xs) 0;
      line-height: 1.4;
    }

    .card-age {
      font-size: var(--van-font-size-sm);
      color: var(--van-primary-color);
      font-weight: 500;
    }
  }

  .card-arrow {
    color: var(--van-text-color-3);
    margin-left: var(--van-padding-sm);
  }
}

.tab-content {
  min-height: 300px;
  padding: 0 var(--van-padding-md);
}

.help-content {
  height: 100%;
  display: flex;
  flex-direction: column;

  .help-header {
    padding: var(--van-padding-lg);
    border-bottom: 1px solid var(--van-border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: var(--van-font-size-lg);
      font-weight: 600;
    }

    .van-icon {
      color: var(--van-text-color-2);
      cursor: pointer;
    }
  }

  .help-body {
    flex: 1;
    padding: var(--van-padding-lg);
    overflow-y: auto;

    .help-section {
      margin-bottom: var(--van-padding-xl);

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        font-size: var(--van-font-size-md);
        font-weight: 600;
        margin: 0 0 var(--van-padding-sm) 0;
        color: var(--van-text-color);
      }

      p {
        font-size: var(--van-font-size-md);
        line-height: 1.6;
        color: var(--van-text-color-2);
        margin: 0;
      }
    }
  }
}

// 过渡动画
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .type-card {
    background: var(--van-background-color-dark);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .help-content {
    background: var(--van-background-color-dark);
  }
}

// 响应式设计
@media (min-width: 768px) {
  .assessment-types {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--van-padding-md);
    padding: 0 var(--van-padding-xl);
  }

  .type-card {
    margin-bottom: 0;
  }
}
</style>