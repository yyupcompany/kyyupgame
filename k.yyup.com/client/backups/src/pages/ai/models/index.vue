<template>
  <div class="ai-models-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1>AI模型管理</h1>
          <p>管理和配置各种AI模型，包括训练、部署、监控和优化</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="createModel">
            <el-icon><Plus /></el-icon>
            创建模型
          </el-button>
          <el-button @click="importModel">
            <el-icon><Upload /></el-icon>
            导入模型
          </el-button>
          <el-button @click="refreshModels">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">🧠</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalModels }}</div>
          <div class="stat-label">总模型数</div>
        </div>
        <div class="stat-trend">
          <el-icon class="trend-icon up"><ArrowUp /></el-icon>
          <span>15.2%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🚀</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.runningModels }}</div>
          <div class="stat-label">运行中模型</div>
        </div>
        <div class="stat-trend">
          <el-icon class="trend-icon up"><ArrowUp /></el-icon>
          <span>8.7%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.avgAccuracy }}%</div>
          <div class="stat-label">平均准确率</div>
        </div>
        <div class="stat-trend">
          <el-icon class="trend-icon up"><ArrowUp /></el-icon>
          <span>2.3%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.avgResponseTime }}ms</div>
          <div class="stat-label">平均响应时间</div>
        </div>
        <div class="stat-trend">
          <el-icon class="trend-icon down"><ArrowDown /></el-icon>
          <span>12.1%</span>
        </div>
      </div>
    </div>

    <!-- 模型分类 -->
    <div class="model-categories">
      <h2>模型分类</h2>
      <div class="categories-grid">
        <div class="category-card" @click="navigateTo('/ai/ModelManagementPage')">
          <div class="category-icon">🎯</div>
          <div class="category-content">
            <h3>预测模型</h3>
            <p>学生成绩预测、招生需求预测等</p>
            <div class="category-count">12 个模型</div>
          </div>
        </div>
        <div class="category-card" @click="navigateTo('/ai/machine-learning/ModelTraining')">
          <div class="category-icon">🔬</div>
          <div class="category-content">
            <h3>机器学习</h3>
            <p>分类、聚类、回归等算法模型</p>
            <div class="category-count">8 个模型</div>
          </div>
        </div>
        <div class="category-card" @click="navigateTo('/ai/deep-learning/prediction-engine')">
          <div class="category-icon">🧠</div>
          <div class="category-content">
            <h3>深度学习</h3>
            <p>神经网络、深度预测引擎</p>
            <div class="category-count">6 个模型</div>
          </div>
        </div>
        <div class="category-card" @click="navigateTo('/ai/nlp/TextAnalysis')">
          <div class="category-icon">💬</div>
          <div class="category-content">
            <h3>自然语言处理</h3>
            <p>文本分析、情感分析等</p>
            <div class="category-count">4 个模型</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模型列表 -->
    <div class="models-list">
      <div class="section-header">
        <h2>模型列表</h2>
        <div class="list-controls">
          <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 120px">
            <el-option label="全部" value="all" />
            <el-option label="运行中" value="running" />
            <el-option label="训练中" value="training" />
            <el-option label="已停止" value="stopped" />
          </el-select>
          <el-input v-model="searchQuery" placeholder="搜索模型..." style="width: 200px">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
      
      <div class="models-grid">
        <div v-for="model in filteredModels" :key="model.id" class="model-card">
          <div class="model-header">
            <div class="model-info">
              <div class="model-name">{{ model.name }}</div>
              <div class="model-type">{{ model.type }}</div>
            </div>
            <el-tag :type="getStatusType(model.status)">{{ model.status }}</el-tag>
          </div>
          
          <div class="model-description">{{ model.description }}</div>
          
          <div class="model-metrics">
            <div class="metric">
              <span class="metric-label">版本</span>
              <span class="metric-value">{{ model.version }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">准确率</span>
              <span class="metric-value">{{ model.accuracy }}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">响应时间</span>
              <span class="metric-value">{{ model.responseTime }}ms</span>
            </div>
          </div>
          
          <div class="model-actions">
            <el-button size="small" @click="viewModel(model.id)">查看</el-button>
            <el-button size="small" type="primary" @click="configureModel(model.id)">配置</el-button>
            <el-dropdown @command="handleModelAction">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="`start-${model.id}`">启动</el-dropdown-item>
                  <el-dropdown-item :command="`stop-${model.id}`">停止</el-dropdown-item>
                  <el-dropdown-item :command="`retrain-${model.id}`">重新训练</el-dropdown-item>
                  <el-dropdown-item :command="`export-${model.id}`">导出</el-dropdown-item>
                  <el-dropdown-item :command="`delete-${model.id}`" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Upload, Refresh, ArrowUp, ArrowDown, Search } from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const stats = ref({
  totalModels: 30,
  runningModels: 18,
  avgAccuracy: 92.4,
  avgResponseTime: 145
})

// 筛选和搜索
const filterStatus = ref('all')
const searchQuery = ref('')

// 模型数据
const models = ref([
  {
    id: 1,
    name: '学生分析模型',
    type: '预测分析',
    description: '基于学生行为数据进行学习效果预测',
    status: '运行中',
    version: 'v2.1.0',
    accuracy: 94.2,
    responseTime: 120
  },
  {
    id: 2,
    name: '招生预测模型',
    type: '趋势预测',
    description: '分析市场趋势预测招生需求',
    status: '运行中',
    version: 'v1.8.3',
    accuracy: 91.7,
    responseTime: 180
  },
  {
    id: 3,
    name: '课程推荐模型',
    type: '推荐系统',
    description: '基于学生兴趣和能力推荐合适课程',
    status: '训练中',
    version: 'v3.0.1',
    accuracy: 88.9,
    responseTime: 95
  },
  {
    id: 4,
    name: '风险评估模型',
    type: '分类模型',
    description: '评估学生学习风险和预警',
    status: '已停止',
    version: 'v1.5.2',
    accuracy: 96.1,
    responseTime: 200
  }
])

// 计算属性
const filteredModels = computed(() => {
  let result = models.value
  
  if (filterStatus.value !== 'all') {
    result = result.filter(model => model.status === filterStatus.value)
  }
  
  if (searchQuery.value) {
    result = result.filter(model => 
      model.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return result
})

// 页面方法
const navigateTo = (path: string) => {
  router.push(path)
}

const createModel = () => {
  ElMessage.info('创建模型功能开发中...')
}

const importModel = () => {
  ElMessage.info('导入模型功能开发中...')
}

const refreshModels = () => {
  ElMessage.success('模型列表已刷新')
}

const viewModel = (id: number) => {
  ElMessage.info(`查看模型 ${id}`)
}

const configureModel = (id: number) => {
  ElMessage.info(`配置模型 ${id}`)
}

const handleModelAction = (command: string) => {
  const [action, id] = command.split('-')
  ElMessage.info(`${action} 模型 ${id}`)
}

const getStatusType = (status: string) => {
  switch (status) {
    case '运行中': return 'success'
    case '训练中': return 'warning'
    case '已停止': return 'info'
    default: return 'info'
  }
}

onMounted(() => {
  console.log('AI模型管理页面已加载')
})
</script>

<style scoped lang="scss">
.ai-models-page {
  padding: var(--text-3xl);
  background: var(--bg-hover);
  min-height: 100vh;

  .page-header {
    background: white;
    border-radius: var(--text-sm);
    padding: var(--text-3xl);
    margin-bottom: var(--text-3xl);
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .header-info {
        h1 {
          margin: 0 0 var(--spacing-sm) 0;
          color: #1a1a1a;
          font-size: var(--text-3xl);
          font-weight: 600;
        }

        p {
          margin: 0;
          color: var(--text-secondary);
          font-size: var(--text-lg);
          line-height: 1.5;
        }
      }

      .header-actions {
        display: flex;
        gap: var(--text-sm);
      }
    }
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--text-2xl);
    margin-bottom: var(--spacing-3xl);

    .stat-card {
      background: white;
      border-radius: var(--text-sm);
      padding: var(--text-3xl);
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }

      .stat-icon {
        font-size: var(--spacing-3xl);
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
        border-radius: var(--text-sm);
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: var(--text-base);
        }
      }

      .stat-trend {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-base);
        font-weight: 500;

        .trend-icon {
          &.up {
            color: var(--success-color);
          }
          &.down {
            color: var(--brand-danger);
          }
        }
      }
    }
  }

  .model-categories {
    background: white;
    border-radius: var(--text-sm);
    padding: var(--text-3xl);
    margin-bottom: var(--spacing-3xl);
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

    h2 {
      margin: 0 0 var(--text-2xl) 0;
      color: #1a1a1a;
      font-size: var(--text-2xl);
      font-weight: 600;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--text-lg);

      .category-card {
        border: var(--border-width-base) solid #e8e8e8;
        border-radius: var(--spacing-sm);
        padding: var(--text-2xl);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--primary-color);
          box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(24, 144, 255, 0.15);
        }

        .category-icon {
          font-size: var(--spacing-3xl);
          margin-bottom: var(--text-sm);
        }

        .category-content {
          h3 {
            margin: 0 0 var(--spacing-sm) 0;
            color: #1a1a1a;
            font-size: var(--text-lg);
            font-weight: 600;
          }

          p {
            margin: 0 0 var(--text-sm) 0;
            color: var(--text-secondary);
            font-size: var(--text-base);
            line-height: 1.4;
          }

          .category-count {
            color: var(--primary-color);
            font-size: var(--text-base);
            font-weight: 500;
          }
        }
      }
    }
  }

  .models-list {
    background: white;
    border-radius: var(--text-sm);
    padding: var(--text-3xl);
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--text-2xl);

      h2 {
        margin: 0;
        color: #1a1a1a;
        font-size: var(--text-2xl);
        font-weight: 600;
      }

      .list-controls {
        display: flex;
        gap: var(--text-sm);
      }
    }

    .models-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: var(--text-2xl);

      .model-card {
        border: var(--border-width-base) solid #e8e8e8;
        border-radius: var(--spacing-sm);
        padding: var(--text-2xl);
        transition: border-color 0.2s ease;

        &:hover {
          border-color: var(--border-base);
        }

        .model-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--text-sm);

          .model-info {
            .model-name {
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: var(--spacing-xs);
            }

            .model-type {
              color: var(--primary-color);
              font-size: var(--text-sm);
              background: #f0f9ff;
              padding: var(--spacing-sm) var(--spacing-sm);
              border-radius: var(--spacing-xs);
              display: inline-block;
            }
          }
        }

        .model-description {
          color: var(--text-secondary);
          font-size: var(--text-base);
          margin-bottom: var(--text-lg);
          line-height: 1.4;
        }

        .model-metrics {
          display: flex;
          gap: var(--text-2xl);
          margin-bottom: var(--text-lg);

          .metric {
            text-align: center;

            .metric-label {
              display: block;
              font-size: var(--text-sm);
              color: var(--text-tertiary);
              margin-bottom: var(--spacing-sm);
            }

            .metric-value {
              font-weight: 600;
              color: #1a1a1a;
            }
          }
        }

        .model-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }
    }
  }
}
</style>
