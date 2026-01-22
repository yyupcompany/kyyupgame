<template>
  <UnifiedCenterLayout
    title="文档模板中心"
    description="管理和使用文档模板，提升检查工作效率"
  >
    <div class="center-container document-template-center">
    <!-- 信息完整度提示卡片 -->
    <el-alert
      v-if="!completeness.canUseAdvancedFeatures"
      type="warning"
      :closable="false"
      class="completeness-alert"
    >
      <template #title>
        <div class="alert-title">
          <UnifiedIcon name="default" />
          <span>基础信息不完整，请完善后享受高级服务</span>
        </div>
      </template>
      
      <div class="alert-content">
        <div class="completeness-info">
          <span>当前完整度：{{ completeness.score }}%</span>
          <el-progress
            :percentage="completeness.score"
            :color="getProgressColor(completeness.score)"
            stroke-width="var(--border-radius-md)"
          />
        </div>
        
        <div class="missing-fields" v-if="completeness.missingRequiredLabels?.length">
          <h4>缺少以下必填信息：</h4>
          <div class="field-tags">
            <el-tag
              v-for="field in completeness.missingRequiredLabels.slice(0, 5)"
              :key="field"
              type="danger"
              size="large"
            >
              {{ field }}
            </el-tag>
            <el-tag v-if="completeness.missingRequiredLabels.length > 5" type="info" size="large">
              +{{ completeness.missingRequiredLabels.length - 5 }}个
            </el-tag>
          </div>
        </div>
        
        <el-button
          type="primary"
          size="large"
          @click="goToCompleteInfo"
          class="complete-btn"
        >
          立即完善基础信息
        </el-button>
      </div>
    </el-alert>

    <!-- 功能锁定提示 -->
    <div v-if="!completeness.canUseAdvancedFeatures" class="feature-lock">
      <el-card>
        <h3>🔒 高级功能已锁定</h3>
        <p>完善基础信息后，您将解锁以下功能：</p>
        <ul>
          <li>✨ AI智能填充文档</li>
          <li>✨ 一键生成年检报告</li>
          <li>✨ 智能数据分析</li>
          <li>✨ 自动提醒服务</li>
        </ul>
      </el-card>
    </div>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1>📄 文档模板中心</h1>
      <p>管理和使用文档模板，提升检查工作效率</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <UnifiedIcon name="default" />
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalTemplates }}</div>
              <div class="stat-label">文档模板</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <UnifiedIcon name="Edit" />
            <div class="stat-info">
              <div class="stat-value">{{ stats.myDocuments }}</div>
              <div class="stat-label">我的文档</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <UnifiedIcon name="default" />
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingTasks }}</div>
              <div class="stat-label">待办任务</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <UnifiedIcon name="default" />
            <div class="stat-info">
              <div class="stat-value">{{ stats.favorites }}</div>
              <div class="stat-label">收藏模板</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索模板名称或编号..."
            :prefix-icon="Search"
            @input="handleSearch"
            clearable
            size="large"
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterCategory" placeholder="选择分类" size="large" clearable @change="loadTemplates">
            <el-option label="全部分类" value="" />
            <el-option
              v-for="category in categories"
              :key="category.code"
              :label="category.name"
              :value="category.code"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterPriority" placeholder="重要程度" size="large" clearable @change="loadTemplates">
            <el-option label="全部" value="" />
            <el-option label="必填" value="required" />
            <el-option label="推荐" value="recommended" />
            <el-option label="可选" value="optional" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="sortBy" placeholder="排序方式" size="large" @change="loadTemplates">
            <el-option label="最近使用" value="lastUsedAt" />
            <el-option label="使用次数" value="useCount" />
            <el-option label="创建时间" value="createdAt" />
            <el-option label="名称" value="name" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" size="large" @click="loadTemplates" class="search-btn">
            <UnifiedIcon name="Search" />
            搜索
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 模板分类标签 -->
    <el-card class="category-tabs-card">
      <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
        <el-tab-pane name="all">
          <template #label>
            <el-badge :value="stats.totalTemplates" class="category-badge">
              全部
            </el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane
          v-for="category in categories"
          :key="category.code"
          :name="category.code"
        >
          <template #label>
            <el-badge :value="category.count" class="category-badge">
              {{ category.name }}
            </el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 模板列表 -->
    <el-card class="template-list-card">
      <template #header>
        <div class="card-header">
          <span>模板列表（共 {{ pagination.total }} 个）</span>
        </div>
      </template>

      <div class="table-wrapper">
<el-table class="responsive-table template-table"
        v-loading="loading"
        :data="templates"
        style="width: 100%"
        @row-click="handleTemplateClick"
        stripe
      >
        <el-table-column prop="code" label="编号" width="100" />
        <el-table-column prop="name" label="模板名称" width="280" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="template-name">
              <el-tag v-if="row.priority === 'required'" type="danger" size="small">必填</el-tag>
              <el-tag v-else-if="row.priority === 'recommended'" type="warning" size="small">推荐</el-tag>
              <el-tag v-else type="info" size="small">可选</el-tag>
              <span class="name-text">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            {{ getCategoryName(row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="frequency" label="使用频率" width="100">
          <template #default="{ row }">
            {{ getFrequencyLabel(row.frequency) }}
          </template>
        </el-table-column>
        <el-table-column prop="estimatedFillTime" label="预计时间" width="100">
          <template #default="{ row }">
            {{ row.estimatedFillTime || '-' }}分钟
          </template>
        </el-table-column>
        <el-table-column prop="useCount" label="使用次数" width="100" sortable />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click.stop="handleUseTemplate(row)">
              <UnifiedIcon name="Edit" />
              使用
            </el-button>
            <el-button type="default" size="small" @click.stop="handleViewTemplate(row)">
              <UnifiedIcon name="eye" />
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
</div>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Warning, Document, Edit, Clock, Star, Search, View } from '@element-plus/icons-vue';
import { BusinessCenterService, type UIConfig } from '@/api/modules/business-center';

const router = useRouter();

// UI配置
const uiConfig = ref<UIConfig>({
  progressColors: {
    excellent: 90,
    good: 70,
    warning: 50
  },
  milestones: {
    default: [25, 50, 75, 100]
  },
  colors: {
    excellent: 'var(--success-color)',
    good: 'var(--warning-color)',
    warning: 'var(--danger-color)',
    default: 'var(--info-color)'
  }
});

// 数据
const completeness = ref({
  score: 0,
  level: 'incomplete',
  missingRequired: [],
  missingRequiredLabels: [],
  canUseAdvancedFeatures: false,
  message: ''
});

const stats = ref({
  totalTemplates: 73,
  myDocuments: 0,
  pendingTasks: 0,
  favorites: 0
});

const categories = ref<any[]>([]);
const templates = ref<any[]>([]);
const loading = ref(false);
const activeCategory = ref('all');
const searchKeyword = ref('');
const filterCategory = ref('');
const filterPriority = ref('');
const sortBy = ref('lastUsedAt');

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
});

// 方法
const getProgressColor = (score: number) => {
  const config = uiConfig.value;
  if (score >= config.progressColors.excellent) return config.colors.excellent;
  if (score >= config.progressColors.good) return config.colors.good;
  if (score >= config.progressColors.warning) return config.colors.warning;
  return config.colors.default;
};

const goToCompleteInfo = () => {
  router.push('/settings/base-info?highlight=missing');
};

// 加载UI配置
const loadUIConfig = async () => {
  try {
    const config = await BusinessCenterService.getUIConfig();
    uiConfig.value = config;
    console.log('✅ UI配置加载成功:', config);
  } catch (error) {
    console.error('❌ 加载UI配置失败:', error);
    // 保持默认配置
  }
};

const getCategoryName = (code: string) => {
  const category = categories.value.find(c => c.code === code);
  return category ? category.name : code;
};

const getFrequencyLabel = (frequency: string) => {
  const map: Record<string, string> = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    quarterly: '每季度',
    yearly: '每年',
    as_needed: '按需'
  };
  return map[frequency] || '-';
};

const handleCategoryChange = (category: string) => {
  activeCategory.value = category;
  filterCategory.value = category === 'all' ? '' : category;
  loadTemplates();
};

const handleSearch = () => {
  pagination.value.page = 1;
  loadTemplates();
};

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  loadTemplates();
};

const handlePageChange = (page: number) => {
  pagination.value.page = page;
  loadTemplates();
};

const handleTemplateClick = (row: any) => {
  router.push(`/inspection-center/templates/${row.id}`);
};

const handleUseTemplate = (row: any) => {
  if (!completeness.value.canUseAdvancedFeatures) {
    ElMessage.warning('请先完善基础信息后使用此功能');
    return;
  }
  router.push(`/inspection-center/templates/${row.id}/use`);
};

const handleViewTemplate = (row: any) => {
  router.push(`/inspection-center/templates/${row.id}`);
};

// 加载数据（模拟）
const loadCompleteness = async () => {
  // TODO: 调用真实API
  completeness.value = {
    score: 45,
    level: 'incomplete',
    missingRequired: ['licenseNumber', 'principalQualification', 'cityLevel'],
    missingRequiredLabels: ['办学许可证号', '园长资格证号', '城市级别'],
    canUseAdvancedFeatures: false,
    message: '请完善3个必填字段后使用高级功能'
  };
};

const loadCategories = async () => {
  // TODO: 调用真实API
  categories.value = [
    { code: 'annual', name: '年度检查类', count: 12 },
    { code: 'special', name: '专项检查类', count: 32 },
    { code: 'routine', name: '常态化督导类', count: 5 },
    { code: 'staff', name: '教职工管理类', count: 6 },
    { code: 'student', name: '幼儿管理类', count: 5 },
    { code: 'finance', name: '财务管理类', count: 5 },
    { code: 'education', name: '保教工作类', count: 8 }
  ];
  stats.value.totalTemplates = categories.value.reduce((sum, c) => sum + c.count, 0);
};

const loadTemplates = async () => {
  loading.value = true;
  // TODO: 调用真实API
  setTimeout(() => {
    templates.value = [
      {
        id: 1,
        code: '01-01',
        name: '幼儿园年检自查报告',
        category: 'annual',
        frequency: 'yearly',
        priority: 'required',
        estimatedFillTime: 120,
        useCount: 15
      },
      // 更多模板...
    ];
    pagination.value.total = 73;
    loading.value = false;
  }, 500);
};

onMounted(() => {
  loadUIConfig();        // 首先加载UI配置
  loadCompleteness();
  loadCategories();
  loadTemplates();
});
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
.document-template-center {
  padding: var(--text-2xl);

  .completeness-alert {
    margin-bottom: var(--text-2xl);

    .alert-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-lg);
      font-weight: bold;
    }

    .alert-content {
      margin-top: var(--text-lg);

      .completeness-info {
        margin-bottom: var(--text-lg);

        span {
          display: block;
          margin-bottom: var(--spacing-sm);
          font-weight: 500;
        }
      }

      .missing-fields {
        margin-bottom: var(--text-lg);

        h4 {
          margin-bottom: var(--spacing-sm);
          font-size: var(--text-base);
        }

        .field-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }
      }

      .complete-btn {
        width: 100%;
      }
    }
  }

  .feature-lock {
    margin-bottom: var(--text-2xl);

    h3 {
      margin-bottom: var(--text-sm);
      font-size: var(--text-xl);
    }

    p {
      margin-bottom: var(--spacing-sm);
      color: var(--text-secondary);
    }

    ul {
      margin: 0;
      padding-left: var(--text-2xl);

      li {
        margin-bottom: var(--spacing-sm);
        color: var(--text-secondary);
      }
    }
  }

  .page-header {
    margin-bottom: var(--text-2xl);

    h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-3xl);
    }

    p {
      margin: 0;
      color: var(--text-secondary);
    }
  }

  .stats-row {
    margin-bottom: var(--text-2xl);

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: var(--text-lg);

        .stat-info {
          .stat-value {
            font-size: var(--text-3xl);
            font-weight: bold;
            line-height: 1;
            margin-bottom: var(--spacing-xs);
          }

          .stat-label {
            font-size: var(--text-base);
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  .filter-card,
  .category-tabs-card,
  .template-list-card {
    margin-bottom: var(--text-2xl);
  }

  .template-table {
    .template-name {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .name-text {
        cursor: pointer;
        &:hover {
          color: var(--primary-color);
        }
      }
    }
  }

  .pagination {
    margin-top: var(--text-2xl);
    display: flex;
    justify-content: flex-end;
  }

  .search-btn {
    width: 100%;
  }
}
</style>

