<template>
  <van-popup
    v-model:show="dialogVisible"
    position="bottom"
    :style="{ height: '80%' }"
    round
    closeable
    @closed="handleClosed"
  >
    <div class="ranking-detail-dialog">
      <!-- 头部 -->
      <div class="dialog-header">
        <van-icon name="medal-o" size="24" color="#409eff" />
        <h3>学生出勤排行榜</h3>
      </div>

      <!-- 排行榜统计 -->
      <div class="ranking-stats">
        <div class="stat-card gold">
          <div class="stat-icon">🥇</div>
          <div class="stat-info">
            <div class="stat-label">出勤冠军</div>
            <div class="stat-value">{{ topStudent?.studentName || '-' }}</div>
            <div class="stat-rate">{{ topStudent?.attendanceRate || 0 }}%</div>
          </div>
        </div>
      </div>

      <!-- 筛选选项 -->
      <div class="filter-options">
        <van-button-group>
          <van-button
            :type="sortBy === 'rate' ? 'primary' : 'default'"
            size="small"
            @click="sortBy = 'rate'"
          >
            按出勤率
          </van-button>
          <van-button
            :type="sortBy === 'days' ? 'primary' : 'default'"
            size="small"
            @click="sortBy = 'days'"
          >
            按出勤天数
          </van-button>
          <van-button
            :type="sortBy === 'name' ? 'primary' : 'default'"
            size="small"
            @click="sortBy = 'name'"
          >
            按姓名
          </van-button>
        </van-button-group>
      </div>

      <!-- 排行榜列表 -->
      <div class="ranking-list">
        <van-loading v-if="loading" size="24px" vertical>加载中...</van-loading>
        <van-empty v-else-if="sortedRanking.length === 0" description="暂无排行数据" />
        <div v-else class="ranking-items">
          <div
            v-for="(student, index) in sortedRanking"
            :key="student.studentId || index"
            class="ranking-item"
            :class="{ 'top-three': index < 3 }"
          >
            <div class="rank-badge" :class="getRankClass(index)">
              <template v-if="index === 0">🥇</template>
              <template v-else-if="index === 1">🥈</template>
              <template v-else-if="index === 2">🥉</template>
              <template v-else>{{ index + 1 }}</template>
            </div>

            <div class="student-info">
              <div class="student-header">
                <span class="student-name">{{ student.studentName }}</span>
                <van-tag :type="getRateType(student.attendanceRate)" size="small">
                  {{ student.attendanceRate }}%
                </van-tag>
              </div>
              <div class="student-stats">
                <div class="stat-item">
                  <van-icon name="calendar-check-o" size="14" />
                  <span>出勤: {{ student.attendanceDays }}天</span>
                </div>
                <div class="stat-item" v-if="student.lateCount > 0">
                  <van-icon name="clock-o" size="14" color="#ff976a" />
                  <span>迟到: {{ student.lateCount }}次</span>
                </div>
                <div class="stat-item" v-if="student.earlyLeaveCount > 0">
                  <van-icon name="logistics" size="14" color="#ff976a" />
                  <span>早退: {{ student.earlyLeaveCount }}次</span>
                </div>
                <div class="stat-item" v-if="student.absentDays > 0">
                  <van-icon name="close" size="14" color="#ee0a24" />
                  <span>缺勤: {{ student.absentDays }}天</span>
                </div>
              </div>
            </div>

            <div class="student-actions">
              <van-button
                size="mini"
                type="primary"
                @click="handleViewDetail(student)"
              >
                详情
              </van-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 导出按钮 -->
      <div class="export-section">
        <van-button type="primary" block @click="handleExport">
          <van-icon name="down" />
          导出排行榜
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from 'vant'

interface StudentRanking {
  studentId: string
  studentName: string
  attendanceDays: number
  absentDays: number
  lateCount: number
  earlyLeaveCount: number
  attendanceRate: number
}

interface Props {
  modelValue: boolean
  rankings: StudentRanking[]
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'view-detail', student: StudentRanking): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const sortBy = ref<'rate' | 'days' | 'name'>('rate')

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const topStudent = computed(() => {
  if (props.rankings.length === 0) return null
  return [...props.rankings].sort((a, b) => b.attendanceRate - a.attendanceRate)[0]
})

const sortedRanking = computed(() => {
  const sorted = [...props.rankings]
  switch (sortBy.value) {
    case 'rate':
      return sorted.sort((a, b) => b.attendanceRate - a.attendanceRate)
    case 'days':
      return sorted.sort((a, b) => b.attendanceDays - a.attendanceDays)
    case 'name':
      return sorted.sort((a, b) => a.studentName.localeCompare(b.studentName, 'zh'))
    default:
      return sorted
  }
})

const getRankClass = (index: number) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return 'rank-normal'
}

const getRateType = (rate: number) => {
  if (rate >= 95) return 'success'
  if (rate >= 80) return 'primary'
  if (rate >= 60) return 'warning'
  return 'danger'
}

const handleViewDetail = (student: StudentRanking) => {
  emit('view-detail', student)
}

const handleExport = () => {
  if (props.rankings.length === 0) {
    showToast('暂无数据可导出')
    return
  }

  try {
    // CSV头部
    let csvContent = '\uFEFF' // BOM for UTF-8
    csvContent += '排名,学生姓名,出勤率(%),出勤天数,缺勤天数,迟到次数,早退次数\n'

    // 添加数据行
    sortedRanking.value.forEach((student, index) => {
      const row = [
        index + 1,
        student.studentName,
        student.attendanceRate,
        student.attendanceDays,
        student.absentDays,
        student.lateCount,
        student.earlyLeaveCount
      ]
      csvContent += row.join(',') + '\n'
    })

    // 创建Blob并下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const fileName = `学生出勤排行榜_${new Date().toISOString().split('T')[0]}.csv`
    link.setAttribute('download', fileName)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToast(`已导出 ${props.rankings.length} 条记录`)
  } catch (error) {
    console.error('导出失败:', error)
    showToast('导出失败，请重试')
  }
}

const handleClosed = () => {
  // 重置状态
  sortBy.value = 'rate'
}
</script>

<style scoped lang="scss">
.ranking-detail-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--van-background-color-light);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 16px 12px;
  border-bottom: 1px solid var(--van-border-color);

  h3 {
    flex: 1;
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--van-text-color);
  }
}

.ranking-stats {
  padding: var(--spacing-md);

  .stat-card {
    background: white;
    border-radius: 8px;
    padding: var(--spacing-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    &.gold {
      background: linear-gradient(135deg, #fff9e6 0%, #ffe6a7 100%);
      border: 1px solid #ffd700;
    }

    .stat-icon {
      font-size: var(--text-4xl);
    }

    .stat-info {
      flex: 1;

      .stat-label {
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: var(--text-base);
        font-weight: bold;
        color: var(--van-text-color);
        margin-bottom: 2px;
      }

      .stat-rate {
        font-size: var(--text-sm);
        color: #07c160;
        font-weight: 500;
      }
    }
  }
}

.filter-options {
  padding: 0 16px 12px;
}

.ranking-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;

  .ranking-items {
    .ranking-item {
      background: white;
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 12px;
      display: flex;
      gap: var(--spacing-md);
      border: 2px solid transparent;

      &.top-three {
        border-color: #ffd700;
        background: linear-gradient(to right, #fffcf0, #ffffff);
      }

      .rank-badge {
        width: 32px;
        height: 32px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-sm);
        font-weight: bold;
        flex-shrink: 0;

        &.rank-gold {
          background: #ffd700;
          color: white;
        }

        &.rank-silver {
          background: #c0c0c0;
          color: white;
        }

        &.rank-bronze {
          background: #cd7f32;
          color: white;
        }

        &.rank-normal {
          background: var(--van-gray-1);
          color: var(--van-text-color-2);
        }
      }

      .student-info {
        flex: 1;
        min-width: 0;

        .student-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .student-name {
            font-size: var(--text-sm);
            font-weight: 500;
            color: var(--van-text-color);
          }
        }

        .student-stats {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);

          .stat-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-size: 11px;
            color: var(--van-text-color-2);
            background: var(--van-gray-1);
            padding: 2px 6px;
            border-radius: 4px;
          }
        }
      }

      .student-actions {
        display: flex;
        align-items: center;
      }
    }
  }
}

.export-section {
  padding: var(--spacing-md);
  border-top: 1px solid var(--van-border-color);
}

// 暗黑模式适配
:root[data-theme="dark"] {
  .ranking-detail-dialog {
    background: var(--van-background-color-dark);
  }

  .ranking-items .ranking-item {
    background: var(--van-gray-8);

    &.top-three {
      background: linear-gradient(to right, var(--van-gray-7), var(--van-gray-8));
    }
  }
}
</style>
