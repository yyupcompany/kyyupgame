<template>
  <UnifiedCenterLayout
    title="中心目录"
    description="统一管理平台 - 所有业务中心的导航入口"
    :icon="Grid"
  >
    <div class="centers-index-content">

      <!-- 统计概览 -->
      <div class="overview-section">
        <div class="stats-grid-unified">
          <div
            v-for="stat in centerStats"
            :key="stat.key"
            class="stat-card-unified"
            :style="{ borderLeftColor: stat.color }"
          >
            <div class="stat-icon" :style="{ backgroundColor: stat.color + '20' }">
              <UnifiedIcon :name="stat.icon" :size="24" :style="{ color: stat.color }" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中心分组导航 -->
      <div class="centers-sections">
        <div
          v-for="section in centerSections"
          :key="section.id"
          class="section-card"
        >
          <div class="section-header">
            <div class="section-title">
              <UnifiedIcon :name="section.icon" :size="20" />
              <h3>{{ section.title }}</h3>
            </div>
            <p class="section-description">{{ section.description }}</p>
          </div>

          <div class="centers-grid">
            <div
              v-for="center in section.centers"
              :key="center.name"
              class="center-card"
              @click="navigateToCenter(center.route)"
            >
              <div class="center-icon">
                <UnifiedIcon :name="center.icon" :size="32" />
              </div>
              <div class="center-info">
                <h4>{{ center.name }}</h4>
                <p>{{ center.description }}</p>
              </div>
              <div class="center-arrow">
                <UnifiedIcon name="chevron-right" :size="18" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Grid } from '@element-plus/icons-vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { convertIconName } from '@/components/ai-assistant/AIAssistant.vue'

const router = useRouter()

// 统计概览数据
const centerStats = ref([
  { key: 'total', label: '中心总数', value: '24', icon: 'grid', color: '#667eea' },
  { key: 'kindergarten', label: '园所管理', value: '4', icon: 'school', color: '#f093fb' },
  { key: 'business', label: '业务管理', value: '6', icon: 'service', color: '#4facfe' },
  { key: 'finance', label: '财务管理', value: '1', icon: 'money', color: '#43e97b' },
  { key: 'system', label: '系统管理', value: '4', icon: 'settings', color: '#fa709a' },
  { key: 'ai', label: 'AI智能', value: '4', icon: 'ai-center', color: '#fee140' }
])

// 中心分组数据 - 与Admin侧边栏的5分组保持一致
const centerSections = ref([
  {
    id: 'kindergarten-management',
    title: '园所管理',
    description: '人员、班级、考勤、教学等基础管理',
    icon: 'school',
    centers: [
      {
        name: '人员中心',
        route: '/centers/PersonnelCenter',
        description: '管理教师、学生、家长等人员信息',
        icon: 'user'
      },
      {
        name: '考勤中心',
        route: '/centers/AttendanceCenter',
        description: '学生和教师的考勤记录管理',
        icon: 'clock'
      },
      {
        name: '教学中心',
        route: '/centers/TeachingCenter',
        description: '课程安排、教学进度、评估管理',
        icon: 'book'
      },
      {
        name: '评估中心',
        route: '/centers/AssessmentCenter',
        description: '学生能力评估、成长记录分析',
        icon: 'analytics'
      }
    ]
  },
  {
    id: 'business-management',
    title: '业务管理',
    description: '招生、营销、活动等核心业务功能',
    icon: 'service',
    centers: [
      {
        name: '招生中心',
        route: '/centers/EnrollmentCenter',
        description: '招生计划、咨询记录、申请管理',
        icon: 'user-plus'
      },
      {
        name: '营销中心',
        route: '/centers/MarketingCenter',
        description: '营销活动、广告投放、效果分析',
        icon: 'megaphone'
      },
      {
        name: '活动中心',
        route: '/centers/ActivityCenter',
        description: '活动策划、报名管理、效果评估',
        icon: 'calendar'
      },
      {
        name: '客户池中心',
        route: '/centers/CustomerPoolCenter',
        description: '潜在客户管理、跟进记录分析',
        icon: 'user-group'
      },
      {
        name: '呼叫中心',
        route: '/centers/CallCenter',
        description: '来电记录、客户沟通、呼叫分析',
        icon: 'phone'
      },
      {
        name: '业务中心',
        route: '/centers/BusinessCenter',
        description: '业务流程管理、进度跟踪、快捷操作',
        icon: 'grid'
      }
    ]
  },
  {
    id: 'finance-management',
    title: '财务管理',
    description: '收费、收支、报表等财务功能',
    icon: 'money',
    centers: [
      {
        name: '财务中心',
        route: '/centers/FinanceCenter',
        description: '收费管理、收支记录、财务报表',
        icon: 'wallet'
      }
    ]
  },
  {
    id: 'system-management',
    title: '系统管理',
    description: '系统配置、权限、日志等后台功能',
    icon: 'settings',
    centers: [
      {
        name: '系统中心',
        route: '/centers/SystemCenter',
        description: '系统设置、参数配置、基础数据',
        icon: 'cog'
      },
      {
        name: '任务中心',
        route: '/centers/TaskCenter',
        description: '任务分配、进度跟踪、协作管理',
        icon: 'check-square'
      },
      {
        name: '检查中心',
        route: '/centers/InspectionCenter',
        description: '检查计划、记录管理、整改跟踪',
        icon: 'search'
      },
      {
        name: '话术中心',
        route: '/centers/ScriptCenter',
        description: '话术模板、沟通记录、知识库',
        icon: 'message-square'
      }
    ]
  },
  {
    id: 'ai-intelligence',
    title: 'AI智能',
    description: 'AI功能和智能工具',
    icon: 'ai-center',
    centers: [
      {
        name: '智能中心',
        route: '/centers/AICenter',
        description: 'AI助手、智能对话、自动化工具',
        icon: 'message-circle'
      },
      {
        name: '分析中心',
        route: '/centers/AnalyticsCenter',
        description: '数据分析、预测模型、智能洞察',
        icon: 'trending-up'
      },
      {
        name: '文档模板中心',
        route: '/centers/DocumentTemplateCenter',
        description: '模板管理、文档生成、协作编辑',
        icon: 'file-text'
      },
      {
        name: '文档中心',
        route: '/centers/document-center',
        description: '文档模板和实例管理、版本控制、统计分析',
        icon: 'users'
      }
    ]
  }
])

// 导航到中心页面
const navigateToCenter = (route: string) => {
  router.push(route)
}
</script>

<style scoped lang="scss">
.centers-index-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xl);
  padding: 0;
}

// 概览部分
.overview-section {
  .stats-grid-unified {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-xl);
  }

  .stat-card-unified {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
    background: var(--el-bg-color);
    border-radius: var(--radius-xl);
    border-left: 4px solid;
    box-shadow: var(--el-box-shadow-light);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--el-box-shadow);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-info {
      .stat-value {
        font-size: var(--text-2xl);
        font-weight: 700;
        color: var(--el-text-color-primary);
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
      }
    }
  }
}

// 中心分组部分
.centers-sections {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xl);
}

.section-card {
  background: var(--el-bg-color);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3xl);
  box-shadow: var(--el-box-shadow-light);

  .section-header {
    margin-bottom: var(--spacing-2xl);
    padding-bottom: var(--spacing-xl);
    border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);

      h3 {
        margin: 0;
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      :deep(.el-icon) {
        color: var(--el-color-primary);
      }
    }

    .section-description {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--el-text-color-regular);
      line-height: 1.6;
    }
  }

  .centers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-lg);
  }

  .center-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
    background: var(--el-fill-color-lighter);
    border-radius: var(--radius-lg);
    border: var(--border-width-base) solid var(--el-border-color-lighter);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--el-box-shadow-light);
      border-color: var(--el-color-primary-light-5);
      background: var(--el-fill-color-light);
    }

    .center-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--el-color-primary-light-9);
      border-radius: var(--radius-md);
      flex-shrink: 0;

      :deep(.el-icon) {
        color: var(--el-color-primary);
      }
    }

    .center-info {
      flex: 1;
      min-width: 0;

      h4 {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--el-text-color-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      p {
        margin: 0;
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .center-arrow {
      color: var(--el-text-color-placeholder);
      transition: color 0.3s ease;
    }

    &:hover .center-arrow {
      color: var(--el-color-primary);
    }
  }
}

// ✅ 响应式设计 - 统一使用design-tokens断点
@media (max-width: var(--breakpoint-xl)) {
  .centers-index-content {
    .centers-sections .section-card .centers-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .centers-index-content {
    gap: var(--spacing-xl);
  }

  .overview-section .stats-grid-unified {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }

  .centers-sections .section-card {
    padding: var(--spacing-xl);

    .centers-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
