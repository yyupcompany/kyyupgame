<template>
  <div class="share-stats-page">
    <div class="page-header">
      <h1>分享统计</h1>
      <p class="subtitle">查看您的分享数据和影响力</p>
    </div>

    <div class="stats-summary">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon" :size="40" color="var(--primary-color)"><Share /></el-icon>
            <div class="stat-content">
              <div class="stat-value">{{ totalShares }}</div>
              <div class="stat-label">总分享次数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon" :size="40" color="var(--success-color)"><View /></el-icon>
            <div class="stat-content">
              <div class="stat-value">{{ totalViews }}</div>
              <div class="stat-label">总播放次数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon" :size="40" color="var(--warning-color)"><User /></el-icon>
            <div class="stat-content">
              <div class="stat-value">{{ totalReach }}</div>
              <div class="stat-label">触达人数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <el-icon class="stat-icon" :size="40" color="var(--danger-color)"><TrendingUp /></el-icon>
            <div class="stat-content">
              <div class="stat-value">{{ engagementRate }}%</div>
              <div class="stat-label">互动率</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="share-list">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>分享记录</span>
            <el-button type="primary" @click="refreshData">刷新数据</el-button>
          </div>
        </template>
        
        <el-table :data="shareRecords" style="width: 100%">
          <el-table-column prop="title" label="分享内容" width="300" />
          <el-table-column prop="shareTime" label="分享时间" width="180" />
          <el-table-column prop="shareCount" label="转发次数" width="120" align="center" />
          <el-table-column prop="viewCount" label="播放次数" width="120" align="center" />
          <el-table-column prop="likeCount" label="点赞数" width="120" align="center" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button text type="primary" @click="viewDetail(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="shareRecords.length === 0" class="empty-state">
          <el-empty description="暂无分享记录" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Share, View, User, TrendingUp } from '@element-plus/icons-vue'

// 统计数据
const totalShares = ref(0)
const totalViews = ref(0)
const totalReach = ref(0)
const engagementRate = ref(0)

// 分享记录
const shareRecords = ref<any[]>([])

// 加载数据
const loadData = async () => {
  try {
    // TODO: 调用实际API获取分享统计数据
    // const response = await getShareStats()
    
    // 临时使用模拟数据
    totalShares.value = 156
    totalViews.value = 2340
    totalReach.value = 890
    engagementRate.value = 38.5

    shareRecords.value = [
      {
        id: 1,
        title: '宝宝发育测评报告',
        shareTime: '2025-10-30 14:30',
        shareCount: 12,
        viewCount: 156,
        likeCount: 45
      },
      {
        id: 2,
        title: '脑开发游戏成就',
        shareTime: '2025-10-29 09:15',
        shareCount: 8,
        viewCount: 98,
        likeCount: 23
      },
      {
        id: 3,
        title: '孩子成长轨迹',
        shareTime: '2025-10-28 16:20',
        shareCount: 15,
        viewCount: 234,
        likeCount: 67
      }
    ]
  } catch (error) {
    console.error('加载分享统计失败:', error)
    ElMessage.error('加载数据失败')
  }
}

// 刷新数据
const refreshData = () => {
  loadData()
  ElMessage.success('数据已刷新')
}

// 查看详情
const viewDetail = (row: any) => {
  ElMessage.info(`查看分享详情：${row.title}`)
  // TODO: 跳转到详情页或打开弹窗
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.share-stats-page {
  padding: var(--text-2xl);
}

.page-header {
  margin-bottom: var(--text-3xl);

  h1 {
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }

  .subtitle {
    font-size: var(--text-base);
    color: var(--info-color);
  }
}

.stats-summary {
  margin-bottom: var(--text-3xl);
}

.stat-card {
  background: white;
  border-radius: var(--spacing-sm);
  padding: var(--text-2xl);
  display: flex;
  align-items: center;
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-lighter);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
    transform: translateY(-2px);
  }

  .stat-icon {
    margin-right: var(--text-lg);
  }

  .stat-content {
    .stat-value {
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .stat-label {
      font-size: var(--text-base);
      color: var(--info-color);
    }
  }
}

.share-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .empty-state {
    padding: var(--spacing-10xl) 0;
    text-align: center;
  }
}
</style>

