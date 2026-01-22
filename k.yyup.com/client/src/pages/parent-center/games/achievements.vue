<template>
  <div class="game-achievements">
    <div class="page-header">
      <h1>我的成就</h1>
      <p>查看游戏成就和奖章</p>
    </div>

    <div class="achievement-summary">
      <el-row :gutter="32">
        <el-col :span="6">
          <div class="summary-card">
            <UnifiedIcon name="default" />
            <div class="card-content">
              <div class="card-value">{{ totalAchievements }}</div>
              <div class="card-label">总成就数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-card">
            <UnifiedIcon name="default" />
            <div class="card-content">
              <div class="card-value">{{ unlockedCount }}</div>
              <div class="card-label">已解锁</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-card">
            <UnifiedIcon name="default" />
            <div class="card-content">
              <div class="card-value">{{ lockedCount }}</div>
              <div class="card-label">未解锁</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-card">
            <UnifiedIcon name="default" />
            <div class="card-content">
              <div class="card-value">{{ totalStars }}</div>
              <div class="card-label">总星数</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="achievements-list">
      <el-tabs v-model="activeCategory" @tab-click="handleCategoryChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="专注力" name="attention" />
        <el-tab-pane label="记忆力" name="memory" />
        <el-tab-pane label="逻辑思维" name="logic" />
      </el-tabs>

      <el-row :gutter="32" style="margin-top: var(--spacing-2xl);">
        <el-col v-for="achievement in filteredAchievements" :key="achievement.id" :span="6">
          <el-card class="achievement-card" :class="{ locked: !achievement.unlocked }">
            <div class="achievement-icon">
              <UnifiedIcon name="default" />
              <div v-if="!achievement.unlocked" class="lock-overlay">
                <UnifiedIcon name="default" />
              </div>
            </div>
            <div class="achievement-info">
              <h3 class="achievement-name">{{ achievement.name }}</h3>
              <p class="achievement-desc">{{ achievement.description }}</p>
              <div class="achievement-progress">
                <el-progress 
                  :percentage="achievement.progress" 
                  :status="achievement.unlocked ? 'success' : undefined"
                />
                <div class="progress-text">
                  {{ achievement.current }}/{{ achievement.target }}
                </div>
              </div>
              <div v-if="achievement.unlocked" class="unlock-info">
                <el-tag type="success" size="small">已解锁</el-tag>
                <span class="unlock-time">{{ achievement.unlockTime }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Trophy, Medal, Lock, Star } from '@element-plus/icons-vue'

// 统计数据
const totalAchievements = ref(12)
const unlockedCount = ref(3)
const lockedCount = computed(() => totalAchievements.value - unlockedCount.value)
const totalStars = ref(45)

// 分类筛选
const activeCategory = ref('all')

// 成就列表
const achievements = ref<any[]>([
  {
    id: 1,
    name: '初次尝试',
    description: '完成第一个游戏',
    icon: 'star',
    category: 'memory',
    unlocked: true,
    progress: 100,
    current: 1,
    target: 1,
    unlockTime: '2024-10-30 10:00'
  },
  {
    id: 2,
    name: '记忆大师',
    description: '连续完成10次记忆游戏',
    icon: 'Medal',
    category: 'memory',
    unlocked: true,
    progress: 100,
    current: 10,
    target: 10,
    unlockTime: '2024-10-31 14:00'
  },
  {
    id: 3,
    name: '完美记忆',
    description: '获得3星通关',
    icon: 'star',
    category: 'memory',
    unlocked: true,
    progress: 100,
    current: 3,
    target: 3,
    unlockTime: '2024-10-31 15:00'
  },
  {
    id: 4,
    name: '专注新手',
    description: '完成5次专注力游戏',
    icon: 'star',
    category: 'attention',
    unlocked: false,
    progress: 40,
    current: 2,
    target: 5,
    unlockTime: ''
  },
  {
    id: 5,
    name: '逻辑探索者',
    description: '完成所有逻辑游戏',
    icon: 'Medal',
    category: 'logic',
    unlocked: false,
    progress: 0,
    current: 0,
    target: 10,
    unlockTime: ''
  }
])

// 筛选成就
const filteredAchievements = computed(() => {
  if (activeCategory.value === 'all') {
    return achievements.value
  }
  return achievements.value.filter(a => a.category === activeCategory.value)
})

// 切换分类
const handleCategoryChange = () => {
  // 筛选逻辑已通过computed实现
}

// 加载数据
const loadData = async () => {
  // TODO: 从API加载成就数据
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
/* 使用设计令牌 */

/* ==================== 游戏成就页面 ==================== */
.game-achievements {
  padding: var(--spacing-xl);
  max-width: var(--breakpoint-2xl);
  margin: 0 auto;

  .page-header {
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--border-color-lighter);

    h1 {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: var(--spacing-xs);

      &::before {
        content: '';
        display: inline-block;
        width: 3px;
        height: 16px;
        background: linear-gradient(180deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
        border-radius: 2px;
        margin-right: var(--spacing-sm);
        vertical-align: middle;
      }
    }

    p {
      font-size: var(--text-sm);
      color: var(--el-text-color-secondary);
      margin: 0;
      padding-left: var(--spacing-md);
    }
  }

  .achievement-summary {
    margin-bottom: var(--spacing-xl);

    .summary-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-lg);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color-lighter);
      transition: all var(--transition-base);

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }

      :deep(.el-icon) {
        font-size: var(--text-2xl);
        color: var(--el-color-primary);
        margin-right: var(--spacing-md);
      }

      .card-content {
        .card-value {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--el-text-color-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }

        .card-label {
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .achievements-list {
    background: var(--bg-card);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color-lighter);

    :deep(.el-tabs) {
      .el-tabs__header {
        margin-bottom: var(--spacing-lg);
      }

      .el-tabs__item {
        font-size: var(--text-base);
      }
    }

    .achievement-card {
      margin-bottom: var(--spacing-lg);
      text-align: center;
      position: relative;
      border-radius: var(--radius-lg);
      transition: all var(--transition-base);
      border: 1px solid var(--border-color-lighter);

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }

      &.locked {
        opacity: 0.6;
        filter: grayscale(50%);
      }

      .achievement-icon {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 72px;
        height: 72px;
        margin-bottom: var(--spacing-md);
        background: linear-gradient(135deg, var(--el-color-warning-light-3) 0%, var(--el-color-warning-light-7) 100%);
        border-radius: var(--radius-full);
        font-size: var(--text-2xl);

        :deep(.el-icon) {
          color: var(--el-color-warning);
        }

        .lock-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.5);
          border-radius: var(--radius-full);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
      }

      .achievement-info {
        padding: 0 var(--spacing-md) var(--spacing-md);

        .achievement-name {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: var(--spacing-xs);
        }

        .achievement-desc {
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);
          margin-bottom: var(--spacing-md);
          min-height: 40px;
          line-height: var(--leading-normal);
        }

        .achievement-progress {
          margin-bottom: var(--spacing-md);

          :deep(.el-progress) {
            .el-progress__text {
              font-size: var(--text-xs) !important;
              min-width: 30px;
            }
          }

          .progress-text {
            font-size: var(--text-xs);
            color: var(--el-text-color-secondary);
            margin-top: var(--spacing-xs);
          }
        }

        .unlock-info {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--spacing-sm);

          .unlock-time {
            font-size: var(--text-xs);
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }

  /* ==================== 响应式设计 ==================== */
  @media (max-width: var(--breakpoint-md)) {
    padding: var(--spacing-md);

    .achievement-summary {
      .el-col {
        margin-bottom: var(--spacing-md);
      }
    }

    .achievements-list .achievement-card {
      .achievement-icon {
        width: 56px;
        height: 56px;
        font-size: var(--text-xl);
      }
    }
  }
}
</style>





