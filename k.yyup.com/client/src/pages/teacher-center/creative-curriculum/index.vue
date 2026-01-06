<template>
  <UnifiedCenterLayout
    title="互动AI课程"
    description="创建和管理AI生成的互动课程"
    icon="Sparkles"
    :main-col-lg="18"
    :main-col-xl="18"
    :sidebar-col-lg="6"
    :sidebar-col-xl="6"
  >
    <div class="curriculum-management">
      <!-- 页面头部 -->
      <div class="page-header">
        <h2>🎓 互动AI课程</h2>
        <el-button type="primary" size="large" @click="openCreateDialog">
          <UnifiedIcon name="Plus" />
          创建课程
        </el-button>
      </div>

      <!-- 筛选器 -->
      <div class="filters">
        <el-select v-model="filters.ageGroup" placeholder="年龄段" clearable @change="fetchCurriculums">
          <el-option label="3-4岁" value="3-4" />
          <el-option label="4-5岁" value="4-5" />
          <el-option label="5-6岁" value="5-6" />
        </el-select>

        <el-select v-model="filters.domain" placeholder="课程领域" clearable @change="fetchCurriculums">
          <el-option label="健康" value="health" />
          <el-option label="语言" value="language" />
          <el-option label="社会" value="social" />
          <el-option label="科学" value="science" />
          <el-option label="艺术" value="art" />
        </el-select>

        <el-input
          v-model="filters.search"
          placeholder="搜索课程..."
          clearable
          @change="fetchCurriculums"
          style="width: 100%; max-width: 300px"
        >
          <template #prefix>
            <UnifiedIcon name="Search" />
          </template>
        </el-input>
      </div>

      <!-- 课程列表 -->
      <div v-loading="loading" class="curriculum-list">
        <div v-if="!loading && curriculums.length === 0">
          <el-empty description="暂无课程，点击上方创建课程按钮开始">
            <el-button type="primary" @click="openCreateDialog">创建第一个课程</el-button>
          </el-empty>
        </div>

            <el-row v-else :gutter="20">
              <el-col v-for="item in curriculums" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
                <el-card class="curriculum-card" shadow="hover">
              <div class="card-thumbnail">
                <img :src="getThumbnail(item)" alt="课程缩略图" />
              </div>
              <div class="card-content">
                <h3>{{ item.name }}</h3>
                <div class="card-tags">
                  <el-tag size="small">{{ item.ageGroup || '3-6岁' }}</el-tag>
                  <el-tag size="small" type="success">{{ getDomainLabel(item.domain) }}</el-tag>
                </div>
                <div class="card-meta">
                  <span>{{ formatDate(item.createdAt) }}</span>
                </div>
              </div>
                  <div class="card-actions">
                    <el-button size="small" @click="handlePreview(item.id)">
                      <UnifiedIcon name="eye" />
                      预览
                    </el-button>
                    <el-button
                      size="small"
                      type="success"
                      @click="handleStartLesson(item.id)"
                    >
                      <UnifiedIcon name="default" />
                      一键上课
                    </el-button>
                    <el-button size="small" type="danger" @click="handleDelete(item.id)">
                      <UnifiedIcon name="Delete" />
                      删除
                    </el-button>
                  </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 分页 -->
        <el-pagination
          v-if="pagination.total > 0"
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="fetchCurriculums"
          @size-change="fetchCurriculums"
          class="pagination"
        />
      </div>

      <!-- 创建/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogMode === 'create' ? '✨ 创建互动AI课程' : '📝 编辑课程'"
        fullscreen
        :close-on-click-modal="false"
      >
        <InteractiveCurriculumEditor
          v-if="dialogVisible"
          :mode="dialogMode"
          :curriculum-id="currentCurriculumId"
          @save="handleSave"
          @cancel="dialogVisible = false"
        />
      </el-dialog>

      <!-- 预览对话框 -->
      <el-dialog
        v-model="previewDialogVisible"
        title="🎓 课程预览"
        fullscreen
      >
        <CurriculumPreview
          v-if="previewCurriculum"
          ref="curriculumPreviewRef"
          :html-code="previewCurriculum.htmlCode"
          :css-code="previewCurriculum.cssCode"
          :js-code="previewCurriculum.jsCode"
        />
      </el-dialog>
    </div>

    <!-- 右侧边栏 -->
    <template #sidebar>
      <div class="sidebar-panels">
        <!-- 快速开始 -->
        <el-card class="sidebar-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <UnifiedIcon name="default" />
              <span>AI互动课堂</span>
            </div>
          </template>
          <div class="quick-start">
            <el-button type="primary" size="large" @click="openCreateDialog" style="width: 100%">
              <UnifiedIcon name="Plus" />
              创建新课程
            </el-button>
            <div class="tips">
              <p>💡 <strong>提示</strong></p>
              <ul>
                <li>选择适合的年龄段和领域</li>
                <li>AI会自动生成互动课程</li>
                <li>可以预览和编辑生成的内容</li>
                <li>满意后保存到课程库</li>
              </ul>
            </div>
          </div>
        </el-card>

        <!-- 课程统计 -->
        <el-card class="sidebar-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <UnifiedIcon name="default" />
              <span>课程统计</span>
            </div>
          </template>
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">{{ pagination.total }}</div>
              <div class="stat-label">总课程数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ domainStats.length }}</div>
              <div class="stat-label">涵盖领域</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ ageGroupStats.length }}</div>
              <div class="stat-label">年龄段</div>
            </div>
          </div>
        </el-card>

        <!-- 领域分布 -->
        <el-card class="sidebar-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <UnifiedIcon name="default" />
              <span>领域分布</span>
            </div>
          </template>
          <div class="domain-distribution">
            <div v-for="domain in domainStats" :key="domain.name" class="domain-item">
              <div class="domain-info">
                <span class="domain-name">{{ domain.label }}</span>
                <span class="domain-count">{{ domain.count }}</span>
              </div>
              <el-progress
                :percentage="(domain.count / pagination.total) * 100"
                :show-text="false"
                :stroke-width="6"
              />
            </div>
            <el-empty v-if="domainStats.length === 0" description="暂无数据" :image-size="60" />
          </div>
        </el-card>

        <!-- 最近创建 -->
        <el-card class="sidebar-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <UnifiedIcon name="default" />
              <span>最近创建</span>
            </div>
          </template>
          <div class="recent-courses">
            <div
              v-for="course in recentCourses"
              :key="course.id"
              class="recent-item"
              @click="handlePreview(course.id)"
            >
              <div class="recent-thumbnail">
                <img :src="getThumbnail(course)" alt="缩略图" />
              </div>
              <div class="recent-info">
                <div class="recent-name">{{ course.name }}</div>
                <div class="recent-meta">
                  <el-tag size="small">{{ getDomainLabel(course.domain) }}</el-tag>
                  <span class="recent-date">{{ formatDate(course.createdAt) }}</span>
                </div>
              </div>
            </div>
            <el-empty v-if="recentCourses.length === 0" description="暂无课程" :image-size="60" />
          </div>
        </el-card>
      </div>
    </template>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import { ref, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Search, View, Delete, MagicStick, DataAnalysis,
  PieChart, Clock
} from '@element-plus/icons-vue'
import CurriculumPreview from './components/CurriculumPreview.vue'
import InteractiveCurriculumEditor from './interactive-curriculum.vue'
import { request } from '@/utils/request'

// 对话框状态
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const currentCurriculumId = ref<number | null>(null)
const previewDialogVisible = ref(false)
const previewCurriculum = ref<any>(null)
const curriculumPreviewRef = ref<InstanceType<typeof CurriculumPreview>>()

// 列表数据
const loading = ref(false)
const curriculums = ref<any[]>([])
const pagination = ref({
  page: 1,
  limit: 12,
  total: 0
})

// 筛选器
const filters = ref({
  ageGroup: '',
  domain: '',
  search: ''
})

/**
 * 获取课程列表
 */
async function fetchCurriculums() {
  try {
    loading.value = true
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }

    if (filters.value.ageGroup) {
      params.ageGroup = filters.value.ageGroup
    }
    if (filters.value.domain) {
      params.domain = filters.value.domain
    }
    if (filters.value.search) {
      params.search = filters.value.search
    }

    const response = await request.get('/teacher-center/creative-curriculum', { params })

    if (response.data.code === 200) {
      curriculums.value = response.data.data.rows || []
      pagination.value.total = response.data.data.total || 0
    }
  } catch (error) {
    console.error('❌ 获取课程列表失败:', error)
    ElMessage.error('获取课程列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 打开创建对话框
 */
function openCreateDialog() {
  dialogMode.value = 'create'
  currentCurriculumId.value = null
  dialogVisible.value = true
}

/**
 * 处理保存
 */
function handleSave() {
  dialogVisible.value = false
  ElMessage.success('课程已保存')
  fetchCurriculums() // 刷新列表
}

/**
 * 处理预览
 */
async function handlePreview(id: number) {
  try {
    const response = await request.get(`/teacher-center/creative-curriculum/${id}`)
    if (response.data.code === 200) {
      previewCurriculum.value = response.data.data
      previewDialogVisible.value = true
    }
  } catch (error) {
    console.error('❌ 获取课程详情失败:', error)
    ElMessage.error('获取课程详情失败')
  }
}

/**
 * 一键上课：预览并自动进入全屏模式
 */
async function handleStartLesson(id: number) {
  await handlePreview(id)
  await nextTick()

  if (previewDialogVisible.value && curriculumPreviewRef.value) {
    curriculumPreviewRef.value.enterFullscreen()
  }
}

/**
 * 处理删除
 */
async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这个课程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await request.delete(`/teacher-center/creative-curriculum/${id}`)
    if (response.data.code === 200) {
      ElMessage.success('删除成功')
      fetchCurriculums() // 刷新列表
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('❌ 删除课程失败:', error)
      ElMessage.error('删除课程失败')
    }
  }
}

/**
 * 获取缩略图
 */
function getThumbnail(curriculum: any): string {
  if (curriculum.thumbnail) {
    return curriculum.thumbnail
  }
  if (curriculum.media?.images?.length > 0) {
    return curriculum.media.images[0].url || curriculum.media.images[0]
  }
  return 'https://via.placeholder.com/300x200?text=课程封面'
}

/**
 * 获取领域标签
 */
function getDomainLabel(domain: string): string {
  const labels: Record<string, string> = {
    health: '健康',
    language: '语言',
    social: '社会',
    science: '科学',
    art: '艺术'
  }
  return labels[domain] || domain
}

/**
 * 格式化日期
 */
function formatDate(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return `${Math.floor(days / 365)}年前`
}

/**
 * 计算领域统计
 */
const domainStats = computed(() => {
  const stats: Record<string, number> = {}
  curriculums.value.forEach(course => {
    stats[course.domain] = (stats[course.domain] || 0) + 1
  })

  return Object.entries(stats).map(([domain, count]) => ({
    name: domain,
    label: getDomainLabel(domain),
    count
  })).sort((a, b) => b.count - a.count)
})

/**
 * 计算年龄段统计
 */
const ageGroupStats = computed(() => {
  const stats: Record<string, number> = {}
  curriculums.value.forEach(course => {
    const ageGroup = course.ageGroup || '3-6'
    stats[ageGroup] = (stats[ageGroup] || 0) + 1
  })

  return Object.entries(stats).map(([ageGroup, count]) => ({
    ageGroup,
    count
  }))
})

/**
 * 最近创建的课程（前5个）
 */
const recentCourses = computed(() => {
  return curriculums.value.slice(0, 5)
})

// 组件挂载时获取课程列表
onMounted(() => {
  fetchCurriculums()
})
</script>

<style scoped lang="scss">
@import "@/styles/design-tokens.scss";
@import "@/styles/list-components-optimization.scss";

.curriculum-management {
  padding: var(--text-3xl);
  background: var(--bg-hover);
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-3xl);
    padding: var(--text-2xl);
    background: var(--bg-color);
    border-radius: var(--border-radius-base);
    box-shadow: var(--shadow-sm);

    h2 {
      margin: 0;
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .filters {
    display: flex;
    gap: var(--text-lg);
    margin-bottom: var(--text-3xl);
    padding: var(--text-lg);
    background: var(--bg-color);
    border-radius: var(--border-radius-base);
    box-shadow: var(--shadow-sm);
  }

  .curriculum-list {
    min-height: 200px;

    .curriculum-card {
      margin-bottom: var(--text-2xl);
      transition: var(--transition-base);
      cursor: pointer;

      &:hover {
        transform: translateY(-var(--spacing-xs));
        box-shadow: var(--shadow-lg);
      }

      .card-thumbnail {
        width: 100%;
        height: 160px;
        overflow: hidden;
        border-radius: var(--border-radius-base) var(--border-radius-base) 0 0;
        background: var(--bg-color-page);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .card-content {
        padding: var(--text-lg);

        h3 {
          margin: 0 0 var(--text-sm) 0;
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .card-tags {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--text-sm);
        }

        .card-meta {
          font-size: var(--text-sm);
          color: var(--info-color);
        }
      }

      .card-actions {
        display: flex;
        gap: var(--spacing-sm);
        padding: 0 var(--text-lg) var(--text-lg);
        border-top: 1px solid var(--border-color-light);
        padding-top: var(--text-sm);

        .el-button {
          flex: 1;
        }
      }
    }

    .pagination {
      margin-top: var(--text-3xl);
      display: flex;
      justify-content: center;
    }
  }
}

// 侧边栏样式
.sidebar-panels {
  display: flex;
  flex-direction: column;
  gap: var(--text-2xl);

  .sidebar-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-weight: 600;
      color: var(--text-primary);

      .el-icon {
        font-size: var(--text-xl);
        color: var(--primary-color);
      }
    }

    .quick-start {
      .tips {
        margin-top: var(--text-lg);
        padding: var(--text-sm);
        background: var(--bg-color-info);
        border-radius: var(--border-radius-base);
        border-left: 3px solid var(--primary-color);

        p {
          margin: 0 0 var(--spacing-sm) 0;
          font-size: var(--text-base);
          color: var(--text-primary);
        }

        ul {
          margin: 0;
          padding-left: var(--text-2xl);
          font-size: var(--text-sm);
          color: var(--text-regular);
          line-height: 1.8;

          li {
            margin-bottom: var(--spacing-xs);
          }
        }
      }
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--text-lg);

      .stat-item {
        text-align: center;
        padding: var(--text-sm);
        background: var(--bg-hover);
        border-radius: var(--radius-md);

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--info-color);
        }
      }
    }

    .domain-distribution {
      .domain-item {
        margin-bottom: var(--text-lg);

        &:last-child {
          margin-bottom: 0;
        }

        .domain-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
          font-size: var(--text-sm);

          .domain-name {
            color: var(--text-regular);
          }

          .domain-count {
            color: var(--info-color);
            font-weight: 600;
          }
        }
      }
    }

    .recent-courses {
      .recent-item {
        display: flex;
        gap: var(--text-sm);
        padding: var(--text-sm);
        margin-bottom: var(--text-sm);
        background: var(--bg-color-hover);
        border-radius: var(--border-radius-base);
        cursor: pointer;
        transition: var(--transition-base);

        &:hover {
          background: var(--bg-color-info);
          transform: translateX(var(--spacing-xs));
        }

        &:last-child {
          margin-bottom: 0;
        }

        .recent-thumbnail {
          width: 60px;
          height: 60px;
          flex-shrink: 0;
          border-radius: var(--border-radius-sm);
          overflow: hidden;
          background: var(--bg-color);

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .recent-info {
          flex: 1;
          min-width: 0;

          .recent-name {
            font-size: var(--text-base);
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: var(--spacing-lg);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .recent-meta {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            font-size: var(--text-sm);

            .recent-date {
              color: var(--info-color);
            }
          }
        }
      }
    }
  }
}
</style>

