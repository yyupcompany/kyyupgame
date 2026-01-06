<template>
  <MobileMainLayout
    title="文档模板"
    :show-back="true"
    @back="goBack"
  >
    <div class="mobile-document-template-center">
      <!-- 搜索栏 -->
      <div class="search-section">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索模板..."
          @search="handleSearch"
          @clear="handleSearchClear"
        />
      </div>

      <!-- 分类筛选 -->
      <div class="category-section">
        <van-tabs v-model:active="activeCategory" @change="handleCategoryChange" sticky>
          <van-tab title="全部" name="" />
          <van-tab title="年度检查" name="annual" />
          <van-tab title="专项检查" name="special" />
          <van-tab title="常态督导" name="routine" />
          <van-tab title="教职工管理" name="staff" />
          <van-tab title="幼儿管理" name="student" />
          <van-tab title="财务管理" name="finance" />
          <van-tab title="保教工作" name="education" />
        </van-tabs>
      </div>

      <!-- 模板列表 -->
      <div class="template-list">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <van-card
              v-for="template in templates"
              :key="template.id"
              :title="template.name"
              :desc="template.description || `预计 ${template.estimatedFillTime || '-'}分钟`"
              @click="goToTemplateDetail(template.id)"
              class="template-card"
            >
              <template #tags>
                <van-tag :type="getPriorityTagType(template.priority)" size="small">
                  {{ getPriorityLabel(template.priority) }}
                </van-tag>
                <van-tag type="primary" size="small">{{ template.code }}</van-tag>
                <van-tag type="success" size="small">{{ getCategoryName(template.category) }}</van-tag>
              </template>
              <template #thumb>
                <van-icon name="description" size="40" color="#1989fa" />
              </template>
              <template #footer>
                <div class="template-meta">
                  <span>
                    <van-icon name="clock-o" />
                    {{ template.estimatedFillTime || '-' }}分钟
                  </span>
                  <span>
                    <van-icon name="eye-o" />
                    {{ template.useCount || 0 }}次
                  </span>
                </div>
                <div class="template-actions">
                  <van-button
                    type="primary"
                    size="small"
                    @click.stop="handleUseTemplate(template)"
                  >
                    使用模板
                  </van-button>
                </div>
              </template>
            </van-card>

            <!-- 空状态 -->
            <van-empty
              v-if="!loading && templates.length === 0"
              description="暂无模板"
              image="search"
            />
          </van-list>
        </van-pull-refresh>
      </div>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { getTemplates, type Template } from '@/api/endpoints/document-templates'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const searchKeyword = ref('')
const activeCategory = ref('')
const templates = ref<Template[]>([])

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

// 方法
const goBack = () => {
  router.back()
}

const getCategoryName = (code: string) => {
  const map: Record<string, string> = {
    annual: '年度检查类',
    special: '专项检查类',
    routine: '常态化督导类',
    staff: '教职工管理类',
    student: '幼儿管理类',
    finance: '财务管理类',
    education: '保教工作类'
  }
  return map[code] || code
}

const getPriorityTagType = (priority: string) => {
  const map: Record<string, string> = {
    required: 'danger',
    recommended: 'warning',
    optional: ''
  }
  return map[priority] || ''
}

const getPriorityLabel = (priority: string) => {
  const map: Record<string, string> = {
    required: '必填',
    recommended: '推荐',
    optional: '可选'
  }
  return map[priority] || priority
}

const handleSearch = () => {
  pagination.value.page = 1
  templates.value = []
  loadTemplates()
}

const handleSearchClear = () => {
  searchKeyword.value = ''
  handleSearch()
}

const handleCategoryChange = () => {
  pagination.value.page = 1
  templates.value = []
  loadTemplates()
}

const goToTemplateDetail = (id: number) => {
  router.push(`/mobile/centers/template-detail/${id}`)
}

const handleUseTemplate = (template: Template) => {
  router.push(`/mobile/centers/document-template-center/use/${template.id}`)
}

const onRefresh = () => {
  pagination.value.page = 1
  templates.value = []
  loadTemplates().then(() => {
    refreshing.value = false
  })
}

const onLoad = () => {
  loadTemplates()
}

// 加载数据
const loadTemplates = async () => {
  if (loading.value && !refreshing.value) return

  loading.value = true

  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      category: activeCategory.value || undefined,
      keyword: searchKeyword.value || undefined,
      isActive: true
    }

    const response = await getTemplates(params)
    if (response.success) {
      const newItems = response.data.items

      if (refreshing.value || pagination.value.page === 1) {
        templates.value = newItems
      } else {
        templates.value.push(...newItems)
      }

      pagination.value.total = response.data.total
      pagination.value.page++

      // 判断是否加载完成
      finished.value = templates.value.length >= pagination.value.total
    }
  } catch (error) {
    console.error('加载模板列表失败:', error)
    showToast.fail('加载模板列表失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 生命周期
onMounted(() => {
  loadTemplates()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
.mobile-document-template-center {
  background: var(--van-background-color-light);
  min-height: 100vh;

  .search-section {
    padding: var(--van-padding-md);
    background: white;
    margin-bottom: var(--van-padding-xs);
  }

  .category-section {
    background: white;
    margin-bottom: var(--van-padding-xs);
  }

  .template-list {
    padding: var(--van-padding-md);

    .template-card {
      margin-bottom: var(--van-padding-md);
      border-radius: var(--van-border-radius-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s;

      &:active {
        transform: scale(0.98);
      }

      .van-card__thumb {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--van-background-color-light);
        border-radius: var(--van-border-radius-sm);
      }

      .template-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--van-padding-sm);
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-2);

        span {
          display: flex;
          align-items: center;
          gap: var(--van-padding-xs);
        }
      }

      .template-actions {
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  :deep(.van-empty) {
    padding: var(--van-padding-xl) var(--van-padding-md);
  }
}
</style>