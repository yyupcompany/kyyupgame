<template>
  <UnifiedCenterLayout
    title="成长报告"
    description="查看孩子的成长轨迹和发展记录"
    icon="TrendingUp"
  >
    <template #stats>
      <StatCard
        title="成长记录"
        :value="growthRecords.length"
        unit="条"
        icon-name="document"
        type="primary"
      />
      <StatCard
        title="本月记录"
        :value="monthlyRecords"
        unit="条"
        icon-name="calendar"
        type="success"
      />
      <StatCard
        title="里程碑"
        :value="milestonesCount"
        unit="个"
        icon-name="flag"
        type="warning"
      />
      <StatCard
        title="成长相册"
        :value="photosCount"
        unit="张"
        icon-name="picture"
        type="info"
      />
    </template>

    <div class="main-content">
      <!-- 孩子选择器 -->
      <el-row :gutter="24" class="content-row">
        <el-col :span="24">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <h3>选择孩子</h3>
              </div>
            </template>
            <el-select
              v-model="selectedChildId"
              placeholder="请选择孩子"
              @change="loadGrowthData"
              style="width: 300px;"
            >
              <el-option
                v-for="child in children"
                :key="child.id"
                :label="child.name"
                :value="child.id"
              />
            </el-select>
          </el-card>
        </el-col>
      </el-row>

      <!-- 成长时间线 -->
      <el-row :gutter="24" class="content-row">
        <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <h3>成长时间线</h3>
                <el-button
                  type="primary"
                  size="small"
                  @click="addGrowthRecord"
                  :icon="Plus"
                >
                  添加记录
                </el-button>
              </div>
            </template>

            <el-timeline class="growth-timeline">
              <el-timeline-item
                v-for="record in growthRecords"
                :key="record.id"
                :timestamp="formatDate(record.date)"
                :color="getTimelineColor(record.type)"
              >
                <el-card class="timeline-card">
                  <div class="record-header">
                    <div class="record-title">
                      <el-tag :type="getTagType(record.type)" size="small">
                        {{ record.typeName }}
                      </el-tag>
                      <h4>{{ record.title }}</h4>
                    </div>
                    <div class="record-actions">
                      <el-button
                        type="text"
                        size="small"
                        @click="editRecord(record)"
                      >
                        编辑
                      </el-button>
                      <el-button
                        type="text"
                        size="small"
                        class="delete-button"
                        @click="deleteRecord(record)"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                  <p class="record-content">{{ record.content }}</p>
                  <div v-if="record.photos && record.photos.length > 0" class="record-photos">
                    <el-image
                      v-for="(photo, index) in record.photos"
                      :key="index"
                      :src="photo.url"
                      :preview-src-list="[photo.url]"
                      fit="cover"
                      class="photo-item"
                    />
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>

            <el-empty
              v-if="growthRecords.length === 0"
              description="暂无成长记录"
              :image-size="120"
            />
          </el-card>
        </el-col>

        <!-- 里程碑和统计 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <el-card class="content-card milestones-card">
            <template #header>
              <div class="card-header">
                <h3>成长里程碑</h3>
              </div>
            </template>

            <div class="milestones-list">
              <div
                v-for="milestone in milestones"
                :key="milestone.id"
                class="milestone-item"
              >
                <div class="milestone-icon">
                  <UnifiedIcon :name="milestone.icon" size="20" />
                </div>
                <div class="milestone-content">
                  <h4>{{ milestone.title }}</h4>
                  <p>{{ milestone.description }}</p>
                  <span class="milestone-date">{{ formatDate(milestone.date) }}</span>
                </div>
              </div>
            </div>

            <el-empty
              v-if="milestones.length === 0"
              description="暂无里程碑记录"
              :image-size="80"
            />
          </el-card>

          <!-- 成长统计 -->
          <el-card class="content-card stats-card">
            <template #header>
              <div class="card-header">
                <h3>本月统计</h3>
              </div>
            </template>

            <div class="growth-stats">
              <div class="stat-item">
                <span class="stat-label">身高增长</span>
                <span class="stat-value">+{{ stats.heightGrowth }}cm</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">体重增长</span>
                <span class="stat-value">+{{ stats.weightGrowth }}kg</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">新技能</span>
                <span class="stat-value">{{ stats.newSkills }}个</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">活动参与</span>
                <span class="stat-value">{{ stats.activities }}次</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import StatCard from '@/components/statistics/StatCard.vue'

// 响应式数据
const selectedChildId = ref<number | null>(null)
const children = ref([
  { id: 1, name: '小明', age: 5, class: '大班' },
  { id: 2, name: '小红', age: 4, class: '中班' }
])

const growthRecords = ref([
  {
    id: 1,
    title: '学会骑自行车',
    content: '今天在公园里终于学会了骑自行车，虽然摔了几次但是很开心！',
    type: 'skill',
    typeName: '技能发展',
    date: '2024-11-15',
    photos: [
      { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%234facfe" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-family="Arial"%3E骑车%3C/text%3E%3C/svg%3E' }
    ]
  },
  {
    id: 2,
    title: '第一次画画比赛',
    content: '参加了幼儿园的画画比赛，获得了优秀奖，画的是彩虹和太阳。',
    type: 'activity',
    typeName: '活动参与',
    date: '2024-11-10',
    photos: [
      { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%2343e97b" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-family="Arial"%3E画画%3C/text%3E%3C/svg%3E' }
    ]
  },
  {
    id: 3,
    title: '身高体检记录',
    content: '本月身高增长了2cm，体重增加了0.5kg，生长发育正常。',
    type: 'health',
    typeName: '健康成长',
    date: '2024-11-05',
    photos: []
  }
])

const milestones = ref([
  {
    id: 1,
    title: '学会独立穿衣服',
    description: '可以自己穿脱简单的衣服',
    icon: 'user',
    date: '2024-11-01'
  },
  {
    id: 2,
    title: '认识26个字母',
    description: '能够正确认读和书写所有字母',
    icon: 'book',
    date: '2024-10-15'
  }
])

const stats = ref({
  heightGrowth: 2.5,
  weightGrowth: 0.8,
  newSkills: 3,
  activities: 8
})

// 计算属性
const monthlyRecords = computed(() =>
  growthRecords.value.filter(record => {
    const recordDate = new Date(record.date)
    const now = new Date()
    return recordDate.getMonth() === now.getMonth() &&
           recordDate.getFullYear() === now.getFullYear()
  }).length
)

const milestonesCount = computed(() => milestones.value.length)
const photosCount = computed(() =>
  growthRecords.value.reduce((total, record) =>
    total + (record.photos?.length || 0), 0
  )
)

// 方法
const loadGrowthData = () => {
  if (!selectedChildId.value) return

  // 模拟加载不同孩子的数据
  ElMessage.success('已切换到孩子数据')
}

const addGrowthRecord = () => {
  ElMessage.info('添加成长记录功能开发中')
}

const editRecord = (record: any) => {
  ElMessage.info(`编辑记录: ${record.title}`)
}

const deleteRecord = (record: any) => {
  ElMessageBox.confirm(
    `确定要删除记录"${record.title}"吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = growthRecords.value.findIndex(r => r.id === record.id)
    if (index > -1) {
      growthRecords.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const getTimelineColor = (type: string) => {
  const colors: Record<string, string> = {
    skill: '#67c23a',
    activity: '#e6a23c',
    health: '#f56c6c',
    social: '#409eff'
  }
  return colors[type] || '#409eff'
}

const getTagType = (type: string) => {
  const types: Record<string, string> = {
    skill: 'success',
    activity: 'warning',
    health: 'danger',
    social: 'info'
  }
  return types[type] || 'info'
}

// 生命周期
onMounted(() => {
  if (children.value.length > 0) {
    selectedChildId.value = children.value[0].id
  }
})
</script>

<style scoped lang="scss">
.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xl);
}

.content-row {
  margin-bottom: 0;
}

.content-card {
  margin-bottom: 0;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
}

.growth-timeline {
  padding: var(--spacing-lg) 0;

  .timeline-card {
    border: var(--border-width-base) solid var(--el-border-color-lighter);

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-md);

      .record-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        h4 {
          margin: 0;
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .record-actions {
        display: flex;
        gap: var(--spacing-xs);

        .delete-button {
          color: var(--danger-color);

          &:hover {
            color: var(--danger-dark);
            background-color: var(--danger-light-bg);
          }
        }
      }
    }

    .record-content {
      margin: 0 0 var(--spacing-md) 0;
      color: var(--el-text-color-regular);
      line-height: 1.6;
    }

    .record-photos {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;

      .photo-item {
        width: 80px;
        height: 80px;
        border-radius: var(--radius-md);
        cursor: pointer;
      }
    }
  }
}

.milestones-card {
  .milestones-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);

    .milestone-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--el-fill-color-lighter);
      border-radius: var(--radius-md);

      .milestone-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--el-color-primary);
        color: white;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
      }

      .milestone-content {
        flex: 1;

        h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        p {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);
          line-height: 1.5;
        }

        .milestone-date {
          font-size: var(--text-xs);
          color: var(--el-text-color-placeholder);
        }
      }
    }
  }
}

.stats-card {
  .growth-stats {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) 0;

      .stat-label {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
      }

      .stat-value {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .main-content {
    gap: var(--spacing-xl);
  }

  .content-card .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .timeline-card .record-header {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .milestone-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>