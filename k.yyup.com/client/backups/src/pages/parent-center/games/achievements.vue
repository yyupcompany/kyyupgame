<template>
  <div class="game-achievements">
    <div class="page-header">
      <h1>我的成就</h1>
      <p>查看游戏成就和奖章</p>
    </div>

    <div class="achievement-summary">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="summary-card">
            <el-icon class="card-icon" :size="40" color="#FFD700"><Trophy /></el-icon>
            <div class="card-content">
              <div class="card-value">{{ totalAchievements }}</div>
              <div class="card-label">总成就数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-card">
            <el-icon class="card-icon" :size="40" color="#67C23A"><Medal /></el-icon>
            <div class="card-content">
              <div class="card-value">{{ unlockedCount }}</div>
              <div class="card-label">已解锁</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-card">
            <el-icon class="card-icon" :size="40" color="var(--info-color)"><Lock /></el-icon>
            <div class="card-content">
              <div class="card-value">{{ lockedCount }}</div>
              <div class="card-label">未解锁</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-card">
            <el-icon class="card-icon" :size="40" color="#E6A23C"><Star /></el-icon>
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

      <el-row :gutter="20" style="margin-top: var(--text-2xl);">
        <el-col v-for="achievement in filteredAchievements" :key="achievement.id" :span="6">
          <el-card class="achievement-card" :class="{ locked: !achievement.unlocked }">
            <div class="achievement-icon">
              <el-icon :size="60" :color="achievement.unlocked ? '#FFD700' : 'var(--info-color)'">
                <component :is="achievement.icon" />
              </el-icon>
              <div v-if="!achievement.unlocked" class="lock-overlay">
                <el-icon :size="30"><Lock /></el-icon>
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
    icon: 'Trophy',
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
    icon: 'Star',
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
    icon: 'Trophy',
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
.game-achievements {
  padding: var(--text-2xl);

  .page-header {
    margin-bottom: var(--text-2xl);

    h1 {
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
    }

    p {
      font-size: var(--text-base);
      color: var(--info-color);
    }
  }

  .achievement-summary {
    margin-bottom: var(--spacing-8xl);

    .summary-card {
      display: flex;
      align-items: center;
      padding: var(--text-2xl);
      background: white;
      border-radius: var(--spacing-sm);
      box-shadow: 0 2px var(--text-sm) 0 var(--shadow-light);

      .card-icon {
        margin-right: var(--text-2xl);
      }

      .card-content {
        .card-value {
          font-size: var(--spacing-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--spacing-sm);
        }

        .card-label {
          font-size: var(--text-base);
          color: var(--info-color);
        }
      }
    }
  }

  .achievements-list {
    background: white;
    padding: var(--text-2xl);
    border-radius: var(--spacing-sm);

    .achievement-card {
      margin-bottom: var(--text-2xl);
      text-align: center;
      position: relative;

      &.locked {
        opacity: 0.6;
        filter: grayscale(50%);
      }

      .achievement-icon {
        position: relative;
        display: inline-block;
        margin-bottom: var(--spacing-4xl);

        .lock-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
      }

      .achievement-info {
        .achievement-name {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .achievement-desc {
          font-size: var(--text-base);
          color: var(--text-regular);
          margin-bottom: var(--spacing-4xl);
          min-height: 40px;
        }

        .achievement-progress {
          margin-bottom: var(--spacing-4xl);

          .progress-text {
            font-size: var(--text-sm);
            color: var(--info-color);
            margin-top: var(--spacing-lg);
          }
        }

        .unlock-info {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .unlock-time {
            font-size: var(--text-sm);
            color: var(--info-color);
          }
        }
      }
    }
  }
}
</style>





