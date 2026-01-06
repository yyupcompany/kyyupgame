<template>
  <div class="game-records">
    <div class="page-header">
      <h1>游戏记录</h1>
      <p>查看历史游戏记录和统计</p>
    </div>

    <div class="stats-section">
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="stat-card">
            <UnifiedIcon name="default" />
            <div class="stat-content">
              <div class="stat-value">{{ totalGames }}</div>
              <div class="stat-label">总游戏次数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <UnifiedIcon name="Check" />
            <div class="stat-content">
              <div class="stat-value">{{ winRate }}%</div>
              <div class="stat-label">胜率</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <UnifiedIcon name="default" />
            <div class="stat-content">
              <div class="stat-value">{{ avgStars }}</div>
              <div class="stat-label">平均星数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <UnifiedIcon name="default" />
            <div class="stat-content">
              <div class="stat-value">{{ totalTime }}分钟</div>
              <div class="stat-label">总游戏时长</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="records-section">
      <div class="section-header">
        <h2>游戏记录</h2>
        <el-radio-group v-model="filterGame" @change="loadRecords">
          <el-radio-button label="">全部游戏</el-radio-button>
          <el-radio-button label="fruit-sequence">水果记忆</el-radio-button>
          <el-radio-button label="attention">专注力游戏</el-radio-button>
          <el-radio-button label="logic">逻辑游戏</el-radio-button>
        </el-radio-group>
      </div>

      <div class="table-wrapper">
<el-table class="responsive-table" :data="records" stripe style="width: 100%">
        <el-table-column prop="gameName" label="游戏名称" width="180" />
        <el-table-column prop="level" label="关卡" width="100">
          <template #default="{ row }">
            <el-tag size="small">第{{ row.level }}关</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="120">
          <template #default="{ row }">
            <span class="score-text">{{ row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stars" label="星级" width="150">
          <template #default="{ row }">
            <el-rate
              v-model="row.stars"
              disabled
              show-score
              :text-color="var(--warning-color)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="result" label="结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.result === 'win' ? 'success' : 'danger'" size="small">
              {{ row.result === 'win' ? '胜利' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="120">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="playTime" label="游戏时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewDetail(row.id)">
              查看详情
            </el-button>
            <el-button size="small" type="success" @click="playAgain(row.gameKey)">
              再玩一次
            </el-button>
          </template>
        </el-table-column>
      </el-table>
</div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadRecords"
          @size-change="loadRecords"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Trophy, Medal, Lock, Star, DataLine, CircleCheck, Timer } from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const totalGames = ref(156)
const winRate = ref(78)
const avgStars = ref(2.4)
const totalTime = ref(480)

// 成就统计
const totalAchievements = ref(12)
const unlockedCount = ref(3)

// 筛选
const filterGame = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 记录列表
const records = ref<any[]>([])

// 加载记录
const loadRecords = async () => {
  // TODO: 从API加载游戏记录
  records.value = [
    {
      id: 1,
      gameName: '水果记忆大师',
      gameKey: 'fruit-sequence',
      level: 5,
      score: 850,
      stars: 3,
      result: 'win',
      duration: 180,
      playTime: '2024-10-31 15:30'
    },
    {
      id: 2,
      gameName: '水果记忆大师',
      gameKey: 'fruit-sequence',
      level: 4,
      score: 720,
      stars: 2,
      result: 'win',
      duration: 165,
      playTime: '2024-10-31 14:20'
    },
    {
      id: 3,
      gameName: '水果记忆大师',
      gameKey: 'fruit-sequence',
      level: 3,
      score: 450,
      stars: 1,
      result: 'lose',
      duration: 120,
      playTime: '2024-10-30 16:45'
    }
  ]
  total.value = 50
}

// 格式化时长
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}分${secs}秒`
}

// 查看详情
const viewDetail = (id: number) => {
  // TODO: 显示游戏详情
  console.log('查看记录', id)
}

// 再玩一次
const playAgain = (gameKey: string) => {
  router.push(`/parent-center/games/play/${gameKey}`)
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped lang="scss">
.game-records {
  padding: var(--spacing-2xl);

  .page-header {
    margin-bottom: var(--spacing-2xl);

    h1 {
      font-size: var(--text-3xl);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
    }

    p {
      font-size: var(--text-base);
      color: var(--text-secondary);
    }
  }

  .stats-section {
    margin-bottom: var(--spacing-2xl);

    .stat-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-2xl);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      transition: var(--transition-base);

      &:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
      }

      .stat-icon {
        margin-right: var(--spacing-xl);
      }

      .stat-content {
        .stat-value {
          font-size: var(--text-4xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          line-height: var(--leading-none);
          margin-bottom: var(--spacing-sm);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-weight: var(--font-medium);
        }
      }
    }
  }

  .records-section {
    background: var(--bg-card);
    padding: var(--spacing-2xl);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-2xl);

      h2 {
        font-size: var(--text-xl);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
      }
    }

    .score-text {
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
      color: var(--primary-color);
    }

    .pagination {
      margin-top: var(--spacing-2xl);
      display: flex;
      justify-content: center;
    }
  }
}
</style>





