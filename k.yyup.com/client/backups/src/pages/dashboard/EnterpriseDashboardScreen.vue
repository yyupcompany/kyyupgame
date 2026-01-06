<template>
  <div class="dashboard-container data-screen">
    <!-- 顶部标题栏 -->
    <div class="screen-header">
      <div class="header-decoration left"></div>
      <div class="header-title">
        <h1>阳光幼儿园企业综合仪表盘</h1>
      </div>
      <div class="header-decoration right"></div>
      <div class="header-time">{{ currentTime }}</div>
    </div>

    <!-- 主要内容区域 - 三列布局 -->
    <div class="screen-content">
      <!-- 左侧区域 - 3个大卡片 -->
      <div class="left-section">
        <div class="big-card">
          <div class="card-header">
            <div class="card-icon orange">
              <el-icon :size="40"><Calendar /></el-icon>
            </div>
            <div class="card-info">
              <h3>活动中心</h3>
              <span class="status-badge">正常</span>
            </div>
          </div>
          <div class="card-metrics">
            <div class="metric-row">
              <span class="label">本月活动</span>
              <span class="value">63场</span>
            </div>
            <div class="metric-row">
              <span class="label">参与人次</span>
              <span class="value">1,245人次</span>
            </div>
          </div>
          <div class="card-trend positive">
            <span>+8.5%</span>
          </div>
        </div>

        <div class="big-card">
          <div class="card-header">
            <div class="card-icon pink">
              <el-icon :size="40"><User /></el-icon>
            </div>
            <div class="card-info">
              <h3>青少年中心</h3>
              <span class="status-badge">正常</span>
            </div>
          </div>
          <div class="card-metrics">
            <div class="metric-row">
              <span class="label">在读学生</span>
              <span class="value">1,245人</span>
            </div>
            <div class="metric-row">
              <span class="label">教师总数</span>
              <span class="value">85人</span>
            </div>
          </div>
          <div class="card-trend positive">
            <span>+5.2%</span>
          </div>
        </div>

        <div class="big-card">
          <div class="card-header">
            <div class="card-icon blue">
              <el-icon :size="40"><School /></el-icon>
            </div>
            <div class="card-info">
              <h3>招生中心</h3>
              <span class="status-badge">正常</span>
            </div>
          </div>
          <div class="card-metrics">
            <div class="metric-row">
              <span class="label">在读学生</span>
              <span class="value">1,245人</span>
            </div>
            <div class="metric-row">
              <span class="label">本月新增</span>
              <span class="value">32人</span>
            </div>
          </div>
          <div class="card-trend positive">
            <span>+12.3%</span>
          </div>
        </div>
      </div>

      <!-- 中间区域 -->
      <div class="center-section">
        <div class="section-title">核心业务指标</div>
        
        <div class="flip-cards-area">
          <div class="flip-card-group">
            <div class="flip-label">今日订单</div>
            <div class="flip-numbers">
              <div class="flip-digit">5</div>
              <div class="flip-digit">8</div>
              <div class="flip-digit">1</div>
              <div class="flip-digit">9</div>
            </div>
          </div>
          <div class="flip-card-group">
            <div class="flip-label">昨日订单</div>
            <div class="flip-numbers">
              <div class="flip-digit">5</div>
              <div class="flip-digit">8</div>
              <div class="flip-digit">1</div>
              <div class="flip-digit">9</div>
            </div>
          </div>
        </div>

        <div class="data-table">
          <div class="table-row" v-for="item in tableData" :key="item.name">
            <span class="table-label">{{ item.name }}</span>
            <span class="table-value">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧区域 -->
      <div class="right-section">
        <div class="section-title">重要业务指标</div>
        
        <div class="right-cards-grid">
          <div class="medium-card" v-for="center in rightCenters" :key="center.name">
            <div class="card-header">
              <div class="card-icon" :class="center.colorClass">
                <el-icon :size="28"><component :is="center.icon" /></el-icon>
              </div>
              <h4>{{ center.name }}</h4>
            </div>
            <div class="card-data">
              <div class="data-item">
                <span class="label">{{ center.metric1.label }}</span>
                <span class="value">{{ center.metric1.value }}</span>
              </div>
              <div class="data-item">
                <span class="label">{{ center.metric2.label }}</span>
                <span class="value">{{ center.metric2.value }}</span>
              </div>
            </div>
            <div class="card-trend positive">+{{ center.trend }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Calendar, User, School, Reading, Clock, Money, List, View } from '@element-plus/icons-vue'

const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const tableData = ref([
  { name: '广西省', value: '¥21,425.60' },
  { name: '云南省', value: '¥21,425.60' },
  { name: '安徽省', value: '¥21,425.60' },
  { name: '湖南省', value: '¥21,425.60' }
])

const rightCenters = ref([
  { name: '教学中心', icon: Reading, colorClass: 'green', metric1: { label: '课程计划', value: '156' }, metric2: { label: '完成率', value: '92.5%' }, trend: 6.8 },
  { name: '考勤中心', icon: Clock, colorClass: 'purple', metric1: { label: '出勤率', value: '96.5%' }, metric2: { label: '今日出勤', value: '1,189' }, trend: 2.1 },
  { name: '财务中心', icon: Money, colorClass: 'cyan', metric1: { label: '本月收入', value: '¥285K' }, metric2: { label: '收缴率', value: '94.2%' }, trend: 15.3 },
  { name: '任务中心', icon: List, colorClass: 'yellow', metric1: { label: '待办任务', value: '12' }, metric2: { label: '今日完成', value: '8' }, trend: 4.5 },
  { name: '督查中心', icon: View, colorClass: 'red', metric1: { label: '检查任务', value: '24' }, metric2: { label: '完成率', value: '87.5%' }, trend: 3.2 }
])

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
})
</script>

<style scoped lang="scss">
.data-screen {
  width: 100%; /* 跟随容器宽度，避免横向溢出 */
  min-height: calc(100vh - 65px); /* 减去导航栏高度 */
  background: linear-gradient(180deg, #0a1929 0%, #1e3a5f 100%);
  padding: var(--text-2xl);
  margin: 0;
  overflow: auto;
  box-sizing: border-box;
  position: relative; /* 确保定位正确 */

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }
}

.screen-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  margin-bottom: var(--text-2xl);
  position: relative;

  .header-decoration {
    flex: 1;
    height: 2px;
    
    &.left {
      background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.6) 100%);
      margin-right: var(--spacing-8xl);
    }
    
    &.right {
      background: linear-gradient(90deg, rgba(59, 130, 246, 0.6) 0%, transparent 100%);
      margin-left: var(--spacing-8xl);
    }
  }

  .header-title {
    h1 {
      font-size: var(--text-4xl);
      font-weight: bold;
      color: var(--bg-white);
      text-shadow: 0 0 var(--text-2xl) rgba(59, 130, 246, 0.8);
      margin: 0;
      letter-spacing: var(--spacing-xs);
      text-align: center;
    }
  }

  .header-time {
    position: absolute;
    right: var(--text-2xl);
    top: 50%;
    transform: translateY(-50%);
    font-size: var(--text-xl);
    color: var(--status-info);
    font-family: 'Courier New', monospace;
  }
}

.screen-content {
  display: grid;
  grid-template-columns: 400px 1fr 500px;
  gap: var(--text-2xl);
  height: calc(100vh - 120px);
  overflow: hidden;
}

// 左侧大卡片
.left-section {
  display: flex;
  flex-direction: column;
  gap: var(--text-2xl);
  height: 100%;
  overflow-y: auto;

  .big-card {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(10px);
    border-radius: var(--text-sm);
    padding: var(--text-2xl);
    border: var(--border-width-base) solid var(--accent-enrollment-heavy);
    box-shadow: 
      0 0 var(--text-2xl) var(--accent-enrollment-medium),
      inset 0 0 var(--text-2xl) rgba(59, 130, 246, 0.05);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-var(--spacing-xs));
      box-shadow: 
        0 0 30px var(--accent-enrollment-heavy),
        inset 0 0 30px var(--accent-enrollment-light);
      border-color: rgba(59, 130, 246, 0.6);
    }

    .card-header {
      display: flex;
      gap: var(--spacing-4xl);
      margin-bottom: var(--spacing-4xl);

      .card-icon {
        width: 70px;
        height: 70px;
        border-radius: var(--text-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 0 var(--text-2xl) var(--accent-enrollment-heavy);
        border: var(--border-width-base) solid var(--accent-enrollment-heavy);

        &.orange { background: linear-gradient(135deg, var(--warning-color) 0%, #f97316 100%); }
        &.pink { background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); }
        &.blue { background: linear-gradient(135deg, var(--primary-color) 0%, var(--status-info) 100%); }
      }

      .card-info {
        flex: 1;

        h3 {
          font-size: var(--text-2xl);
          color: var(--bg-white);
          margin: 0 0 var(--spacing-sm) 0;
          text-shadow: 0 0 10px var(--white-alpha-30);
        }

        .status-badge {
          display: inline-block;
          padding: var(--spacing-2xs) 10px;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          background: rgba(34, 197, 94, 0.1);
          color: var(--success-color);
          border: var(--border-width-base) solid rgba(34, 197, 94, 0.3);
        }
      }
    }

    .card-metrics {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2xl);
      margin-bottom: var(--text-sm);

      .metric-row {
        display: flex;
        justify-content: space-between;
        padding: var(--spacing-2xl);
        background: rgba(30, 58, 95, 0.4);
        border-radius: var(--spacing-sm);
        border: var(--border-width-base) solid var(--accent-enrollment-medium);

        .label {
          font-size: var(--text-sm);
          color: var(--text-muted);
        }

        .value {
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--status-info);
          font-family: 'Courier New', monospace;
        }
      }
    }

    .card-trend {
      padding: var(--spacing-sm) var(--text-sm);
      border-radius: var(--radius-md);
      text-align: center;
      font-weight: 600;

      &.positive {
        background: rgba(34, 197, 94, 0.1);
        color: var(--success-color);
        border: var(--border-width-base) solid rgba(34, 197, 94, 0.3);
      }
    }
  }
}

// 中间区域
.center-section {
  display: flex;
  flex-direction: column;
  gap: var(--text-2xl);
  height: 100%;
  overflow-y: auto;

  .section-title {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--status-info);
    text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
    margin-bottom: var(--spacing-2xl);
  }

  .flip-cards-area {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-4xl);

    .flip-card-group {
      background: rgba(15, 23, 42, 0.5);
      border: var(--border-width-base) solid var(--accent-enrollment-medium);
      border-radius: var(--radius-xl);
      padding: var(--spacing-4xl);

      .flip-label {
        font-size: var(--text-sm);
        color: var(--text-muted);
        margin-bottom: var(--spacing-2xl);
      }

      .flip-numbers {
        display: flex;
        gap: var(--spacing-lg);
        justify-content: center;

        .flip-digit {
          width: 40px;
          height: 55px;
          background: linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%);
          border: var(--border-width-base) solid var(--accent-enrollment-heavy);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-3xl);
          font-weight: bold;
          color: var(--status-info);
          font-family: 'Courier New', monospace;
          box-shadow: 0 0 10px var(--accent-enrollment-medium);
        }
      }
    }
  }

  .data-table {
    background: rgba(15, 23, 42, 0.5);
    border: var(--border-width-base) solid var(--accent-enrollment-medium);
    border-radius: var(--radius-xl);
    padding: var(--spacing-4xl);

    .table-row {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-2xl);
      border-bottom: var(--border-width-base) solid rgba(59, 130, 246, 0.1);

      &:last-child {
        border-bottom: none;
      }

      .table-label {
        color: var(--text-muted);
        font-size: var(--text-base);
      }

      .table-value {
        color: var(--status-info);
        font-weight: 600;
        font-family: 'Courier New', monospace;
      }
    }
  }
}

// 右侧区域
.right-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4xl);
  height: 100%;
  overflow-y: auto;

  .section-title {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--status-info);
    text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .right-cards-grid {
    display: flex;
    flex-direction: column;
    gap: var(--text-sm);

    .medium-card {
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(var(--spacing-sm));
      border-radius: var(--radius-xl);
      padding: var(--spacing-4xl);
      border: var(--border-width-base) solid var(--accent-enrollment-medium);
      box-shadow: 0 0 15px var(--accent-enrollment-light);
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 0 25px var(--accent-enrollment-heavy);
        border-color: rgba(59, 130, 246, 0.5);
      }

      .card-header {
        display: flex;
        gap: var(--text-sm);
        align-items: center;
        margin-bottom: var(--text-sm);

        .card-icon {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 0 15px var(--accent-enrollment-heavy);
          border: var(--border-width-base) solid var(--accent-enrollment-medium);

          &.green { background: linear-gradient(135deg, var(--success-color) 0%, var(--status-success) 100%); }
          &.purple { background: linear-gradient(135deg, var(--ai-primary) 0%, var(--ai-light) 100%); }
          &.cyan { background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%); }
          &.yellow { background: linear-gradient(135deg, var(--warning-color) 0%, var(--warning-color) 100%); }
          &.red { background: linear-gradient(135deg, var(--danger-color) 0%, var(--status-error) 100%); }
        }

        h4 {
          font-size: var(--text-base);
          color: #e2e8f0;
          margin: 0;
        }
      }

      .card-data {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-2xl);
        margin-bottom: var(--spacing-2xl);

        .data-item {
          padding: var(--spacing-sm);
          background: rgba(30, 58, 95, 0.3);
          border-radius: var(--radius-md);
          border: var(--border-width-base) solid var(--accent-enrollment-light);

          .label {
            display: block;
            font-size: var(--text-xs);
            color: var(--text-muted);
            margin-bottom: var(--spacing-xs);
          }

          .value {
            display: block;
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--status-info);
            font-family: 'Courier New', monospace;
          }
        }
      }

      .card-trend {
        padding: var(--spacing-lg) 10px;
        border-radius: var(--radius-md);
        text-align: center;
        font-size: var(--text-sm);
        font-weight: 600;

        &.positive {
          background: rgba(34, 197, 94, 0.08);
          color: var(--success-color);
          border: var(--border-width-base) solid rgba(34, 197, 94, 0.25);
        }
      }
    }
  }
}
</style>
