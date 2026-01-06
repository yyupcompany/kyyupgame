<template>
  <div class="mobile-template-selector">
    <!-- 搜索栏 -->
    <div class="search-section">
      <van-search
        v-model="searchQuery"
        placeholder="搜索课程模板..."
        @search="handleSearch"
        @clear="handleClear"
        show-action
        shape="round"
        background="transparent"
      >
        <template #action>
          <van-button size="small" type="primary" @click="showFilter = true">
            筛选
          </van-button>
        </template>
      </van-search>
    </div>

    <!-- 领域标签 -->
    <div class="domain-tabs">
      <van-tabs v-model:active="activeDomain" @change="handleDomainChange" sticky>
        <van-tab title="全部" name="all">
          <template #title>
            <van-icon name="apps-o" />
            全部
          </template>
        </van-tab>
        <van-tab title="健康" name="health">
          <template #title>
            <span class="domain-icon">🏃</span>
            健康
          </template>
        </van-tab>
        <van-tab title="语言" name="language">
          <template #title>
            <span class="domain-icon">🗣️</span>
            语言
          </template>
        </van-tab>
        <van-tab title="社会" name="social">
          <template #title>
            <span class="domain-icon">👥</span>
            社会
          </template>
        </van-tab>
        <van-tab title="科学" name="science">
          <template #title>
            <span class="domain-icon">🔬</span>
            科学
          </template>
        </van-tab>
        <van-tab title="艺术" name="art">
          <template #title>
            <span class="domain-icon">🎨</span>
            艺术
          </template>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 模板列表 -->
    <div class="templates-container">
      <!-- 列表视图 -->
      <div v-if="viewMode === 'list'" class="list-view">
        <van-cell-group inset>
          <van-cell
            v-for="template in filteredTemplates"
            :key="template.id"
            :title="template.name"
            :label="template.description"
            is-link
            @click="selectTemplate(template)"
          >
            <template #icon>
              <div class="template-icon-small">
                {{ getDomainIcon(template.domain) }}
              </div>
            </template>
            <template #right-icon>
              <div class="template-meta">
                <van-tag type="primary" size="small">{{ template.ageGroup }}</van-tag>
                <van-icon name="arrow" />
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'" class="card-view">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item
            v-for="template in filteredTemplates"
            :key="template.id"
            @click="selectTemplate(template)"
          >
            <div class="template-card">
              <div class="card-header">
                <div class="template-icon">{{ getDomainIcon(template.domain) }}</div>
                <van-tag type="primary" size="small">{{ template.ageGroup }}</van-tag>
              </div>
              <div class="card-content">
                <h4 class="template-title">{{ template.name }}</h4>
                <p class="template-description">{{ template.description }}</p>
              </div>
              <div class="card-footer">
                <van-button
                  type="primary"
                  size="small"
                  block
                  icon="plus"
                >
                  使用模板
                </van-button>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 空状态 -->
      <van-empty
        v-if="filteredTemplates.length === 0"
        image="search"
        description="没有找到匹配的模板"
        image-size="120"
      >
        <van-button
          type="primary"
          size="small"
          @click="resetFilters"
        >
          重置筛选
        </van-button>
      </van-empty>
    </div>

    <!-- 视图切换器 -->
    <div class="view-switcher">
      <van-tabs v-model:active="viewMode">
        <van-tab title="列表" name="list"></van-tab>
        <van-tab title="卡片" name="card"></van-tab>
      </van-tabs>
    </div>

    <!-- 筛选弹窗 -->
    <van-popup
      v-model:show="showFilter"
      position="bottom"
      :style="{ height: '60vh', borderRadius: '20px 20px 0 0' }"
      closeable
    >
      <div class="filter-popup">
        <div class="filter-header">
          <h3>筛选条件</h3>
        </div>

        <div class="filter-content">
          <!-- 年龄段筛选 -->
          <van-cell-group inset title="年龄段">
            <van-checkbox-group v-model="selectedAgeGroups" direction="horizontal">
              <van-checkbox
                v-for="age in ageGroups"
                :key="age.value"
                :name="age.value"
                shape="square"
              >
                {{ age.label }}
              </van-checkbox>
            </van-checkbox-group>
          </van-cell-group>

          <!-- 难度筛选 -->
          <van-cell-group inset title="难度等级">
            <van-radio-group v-model="selectedDifficulty" direction="horizontal">
              <van-radio
                v-for="difficulty in difficulties"
                :key="difficulty.value"
                :name="difficulty.value"
                shape="square"
              >
                {{ difficulty.label }}
              </van-radio>
            </van-radio-group>
          </van-cell-group>

          <!-- 时长筛选 -->
          <van-cell-group inset title="课程时长">
            <van-slider
              v-model="durationRange"
              :min="5"
              :max="60"
              :step="5"
              range
              bar-height="6px"
              button-size="20px"
            />
            <div class="duration-display">
              {{ durationRange[0] }} - {{ durationRange[1] }} 分钟
            </div>
          </van-cell-group>
        </div>

        <div class="filter-actions">
          <van-button-group>
            <van-button
              type="default"
              @click="resetFilters"
            >
              重置
            </van-button>
            <van-button
              type="primary"
              @click="applyFilters"
            >
              应用筛选
            </van-button>
          </van-button-group>
        </div>
      </div>
    </van-popup>

    <!-- 模板详情弹窗 -->
    <van-popup
      v-model:show="showDetail"
      position="bottom"
      :style="{ height: '80vh', borderRadius: '20px 20px 0 0' }"
      closeable
    >
      <div v-if="selectedTemplate" class="detail-popup">
        <div class="detail-header">
          <div class="detail-icon">{{ getDomainIcon(selectedTemplate.domain) }}</div>
          <div class="detail-info">
            <h3>{{ selectedTemplate.name }}</h3>
            <van-tag type="primary">{{ selectedTemplate.ageGroup }}</van-tag>
          </div>
        </div>

        <div class="detail-content">
          <van-cell-group inset>
            <van-cell title="领域" :value="getDomainLabel(selectedTemplate.domain)" />
            <van-cell title="描述" :label="selectedTemplate.description" />
            <van-cell title="难度" :value="selectedTemplate.difficulty || '中等'" />
            <van-cell title="预计时长" :value="selectedTemplate.duration + '分钟'" />
            <van-cell title="目标数量" :value="selectedTemplate.objectives?.length || '0'" />
          </van-cell-group>

          <!-- 学习目标 -->
          <van-cell-group v-if="selectedTemplate.objectives" inset title="学习目标">
            <van-cell
              v-for="(objective, index) in selectedTemplate.objectives"
              :key="index"
              :title="objective"
            />
          </van-cell-group>

          <!-- 所需材料 -->
          <van-cell-group v-if="selectedTemplate.materials" inset title="所需材料">
            <van-cell
              v-for="(material, index) in selectedTemplate.materials"
              :key="index"
              :title="material"
            />
          </van-cell-group>
        </div>

        <div class="detail-actions">
          <van-button
            type="primary"
            size="large"
            block
            @click="confirmSelectTemplate"
            icon="plus"
          >
            使用此模板
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast, showSuccessToast } from 'vant'

enum CurriculumDomain {
  HEALTH = 'health',
  LANGUAGE = 'language',
  SOCIAL = 'social',
  SCIENCE = 'science',
  ART = 'art'
}

interface CurriculumTemplate {
  id: string
  name: string
  description: string
  domain: CurriculumDomain
  ageGroup: string
  difficulty?: string
  duration?: number
  objectives?: string[]
  materials?: string[]
  htmlCode?: string
  cssCode?: string
  jsCode?: string
}

interface Props {
  templates?: CurriculumTemplate[]
  showDetail?: boolean
}

interface Emits {
  (e: 'select', template: CurriculumTemplate): void
}

const props = withDefaults(defineProps<Props>(), {
  templates: () => [],
  showDetail: true
})

const emit = defineEmits<Emits>()

// 响应式数据
const searchQuery = ref('')
const activeDomain = ref<string>('all')
const viewMode = ref<'list' | 'card'>('card')
const showFilter = ref(false)
const showDetail = ref(false)
const selectedTemplate = ref<CurriculumTemplate | null>(null)

// 筛选条件
const selectedAgeGroups = ref<string[]>([])
const selectedDifficulty = ref<string>('')
const durationRange = ref<[number, number]>([5, 60])

// 选项数据
const ageGroups = [
  { value: '3-4岁', label: '3-4岁' },
  { value: '4-5岁', label: '4-5岁' },
  { value: '5-6岁', label: '5-6岁' },
  { value: '6-7岁', label: '6-7岁' }
]

const difficulties = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' }
]

// 模拟模板数据
const defaultTemplates: CurriculumTemplate[] = [
  {
    id: '1',
    name: '认识颜色',
    description: '通过游戏和互动帮助幼儿认识基本颜色',
    domain: CurriculumDomain.ART,
    ageGroup: '3-4岁',
    difficulty: 'easy',
    duration: 30,
    objectives: ['认识红、黄、蓝三种基本颜色', '培养颜色辨识能力', '提高观察力'],
    materials: ['彩色卡片', '彩色积木', '绘画工具']
  },
  {
    id: '2',
    name: '数字入门',
    description: '通过有趣的活动学习数字1-10',
    domain: CurriculumDomain.SCIENCE,
    ageGroup: '4-5岁',
    difficulty: 'medium',
    duration: 40,
    objectives: ['认识数字1-10', '学习点数', '理解数量关系'],
    materials: ['数字卡片', '计数玩具', '练习册']
  },
  {
    id: '3',
    name: '社交礼仪',
    description: '学习基本的社交礼仪和礼貌用语',
    domain: CurriculumDomain.SOCIAL,
    ageGroup: '4-5岁',
    difficulty: 'medium',
    duration: 35,
    objectives: ['学会使用礼貌用语', '培养分享意识', '学习团队合作'],
    materials: ['情景卡片', '角色扮演道具']
  },
  {
    id: '4',
    name: '健康饮食',
    description: '了解健康食物和良好饮食习惯',
    domain: CurriculumDomain.HEALTH,
    ageGroup: '5-6岁',
    difficulty: 'medium',
    duration: 45,
    objectives: ['认识健康食物', '培养良好饮食习惯', '了解食物营养'],
    materials: ['食物模型', '图片卡片', '食谱']
  },
  {
    id: '5',
    name: '故事演讲',
    description: '通过讲故事培养语言表达能力',
    domain: CurriculumDomain.LANGUAGE,
    ageGroup: '5-6岁',
    difficulty: 'hard',
    duration: 50,
    objectives: ['提高语言表达能力', '培养想象力', '增强自信心'],
    materials: ['故事书', '图片道具', '录音设备']
  }
]

const templates = computed(() => props.templates.length > 0 ? props.templates : defaultTemplates)

// 过滤后的模板
const filteredTemplates = computed(() => {
  let result = templates.value

  // 领域筛选
  if (activeDomain.value !== 'all') {
    result = result.filter(template => template.domain === activeDomain.value)
  }

  // 年龄段筛选
  if (selectedAgeGroups.value.length > 0) {
    result = result.filter(template => selectedAgeGroups.value.includes(template.ageGroup))
  }

  // 难度筛选
  if (selectedDifficulty.value) {
    result = result.filter(template => template.difficulty === selectedDifficulty.value)
  }

  // 时长筛选
  if (durationRange.value[0] > 5 || durationRange.value[1] < 60) {
    result = result.filter(template => {
      const duration = template.duration || 30
      return duration >= durationRange.value[0] && duration <= durationRange.value[1]
    })
  }

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(template =>
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query)
    )
  }

  return result
})

// 工具函数
function getDomainIcon(domain: CurriculumDomain): string {
  const icons: Record<CurriculumDomain, string> = {
    [CurriculumDomain.HEALTH]: '🏃',
    [CurriculumDomain.LANGUAGE]: '🗣️',
    [CurriculumDomain.SOCIAL]: '👥',
    [CurriculumDomain.SCIENCE]: '🔬',
    [CurriculumDomain.ART]: '🎨'
  }
  return icons[domain] || '📚'
}

function getDomainLabel(domain: CurriculumDomain): string {
  const labels: Record<CurriculumDomain, string> = {
    [CurriculumDomain.HEALTH]: '健康领域',
    [CurriculumDomain.LANGUAGE]: '语言领域',
    [CurriculumDomain.SOCIAL]: '社会领域',
    [CurriculumDomain.SCIENCE]: '科学领域',
    [CurriculumDomain.ART]: '艺术领域'
  }
  return labels[domain] || '其他领域'
}

// 事件处理
function handleDomainChange(domainName: string) {
  activeDomain.value = domainName
}

function handleSearch() {
  // 搜索逻辑已在计算属性中处理
  showToast(`搜索: ${searchQuery.value}`)
}

function handleClear() {
  searchQuery.value = ''
  showToast('已清除搜索')
}

function selectTemplate(template: CurriculumTemplate) {
  if (props.showDetail) {
    selectedTemplate.value = template
    showDetail.value = true
  } else {
    emit('select', template)
    showSuccessToast(`已选择模板: ${template.name}`)
  }
}

function confirmSelectTemplate() {
  if (selectedTemplate.value) {
    emit('select', selectedTemplate.value)
    showDetail.value = false
    showSuccessToast(`已选择模板: ${selectedTemplate.value.name}`)
  }
}

function applyFilters() {
  showFilter.value = false
  showToast('筛选条件已应用')
}

function resetFilters() {
  searchQuery.value = ''
  activeDomain.value = 'all'
  selectedAgeGroups.value = []
  selectedDifficulty.value = ''
  durationRange.value = [5, 60]
  showToast('筛选条件已重置')
}

// 暴露方法给父组件
defineExpose({
  templates: filteredTemplates,
  resetFilters,
  selectTemplate
})
</script>

<style scoped lang="scss">
.mobile-template-selector {
  padding: var(--van-padding-sm);
  background: var(--van-background-color);
  min-height: 100vh;

  .search-section {
    margin-bottom: var(--van-padding-sm);
  }

  .domain-tabs {
    margin-bottom: var(--van-padding-sm);

    :deep(.van-tabs) {
      .van-tab__text {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);

        .domain-icon {
          font-size: var(--text-base);
        }
      }
    }
  }

  .templates-container {
    min-height: 400px;

    .list-view {
      .template-icon-small {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-lg);
        background: var(--van-background-2);
        border-radius: var(--van-radius-md);
        margin-right: var(--van-padding-sm);
      }

      .template-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--spacing-xs);
      }
    }

    .card-view {
      .template-card {
        background: var(--van-background-2);
        border-radius: var(--van-radius-lg);
        padding: var(--van-padding-md);
        height: 200px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:active {
          transform: scale(0.98);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--van-padding-sm);

          .template-icon {
            font-size: var(--text-2xl);
          }
        }

        .card-content {
          flex: 1;
          overflow: hidden;

          .template-title {
            font-size: var(--van-font-size-md);
            font-weight: 600;
            color: var(--van-text-color-1);
            margin: 0 0 var(--van-padding-xs) 0;
            line-height: 1.3;
          }

          .template-description {
            font-size: var(--van-font-size-sm);
            color: var(--van-text-color-3);
            margin: 0;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        .card-footer {
          margin-top: var(--van-padding-sm);
        }
      }
    }
  }

  .view-switcher {
    position: fixed;
    bottom: var(--van-padding-lg);
    right: var(--van-padding-md);
    background: var(--van-background-2);
    padding: var(--van-padding-sm);
    border-radius: var(--van-radius-lg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

// 筛选弹窗
.filter-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .filter-header {
    padding: var(--van-padding-lg) var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      text-align: center;
      font-size: var(--van-font-size-lg);
      font-weight: 600;
    }
  }

  .filter-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--van-padding-sm);

    :deep(.van-checkbox-group),
    :deep(.van-radio-group) {
      display: flex;
      flex-wrap: wrap;
      gap: var(--van-padding-sm);

      .van-checkbox,
      .van-radio {
        margin-right: 0;
      }
    }

    .duration-display {
      text-align: center;
      margin-top: var(--van-padding-sm);
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);
    }
  }

  .filter-actions {
    padding: var(--van-padding-md);
    background: var(--van-background-2);
    border-top: 1px solid var(--van-border-color);

    :deep(.van-button-group) {
      display: flex;

      .van-button {
        flex: 1;
      }
    }
  }
}

// 详情弹窗
.detail-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .detail-header {
    display: flex;
    align-items: center;
    gap: var(--van-padding-md);
    padding: var(--van-padding-lg) var(--van-padding-md);
    background: var(--van-background-2);

    .detail-icon {
      font-size: var(--text-4xl);
    }

    .detail-info {
      flex: 1;

      h3 {
        margin: 0 0 var(--van-padding-xs) 0;
        font-size: var(--van-font-size-lg);
        font-weight: 600;
        color: var(--van-text-color-1);
      }
    }
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--van-padding-sm);
  }

  .detail-actions {
    padding: var(--van-padding-md);
    background: var(--van-background-2);
    border-top: 1px solid var(--van-border-color);
  }
}

// 响应式适配
@media (max-width: var(--breakpoint-xs)) {
  .mobile-template-selector {
    padding: var(--van-padding-xs);

    .card-view {
      .template-card {
        height: 180px;
        padding: var(--van-padding-sm);

        .card-content {
          .template-title {
            font-size: var(--van-font-size-sm);
          }

          .template-description {
            font-size: var(--van-font-size-xs);
          }
        }
      }
    }

    .view-switcher {
      bottom: var(--van-padding-md);
      right: var(--van-padding-sm);
    }
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .mobile-template-selector {
    background: var(--van-background-1);

    .card-view {
      .template-card {
        background: var(--van-background-2);
      }
    }

    .view-switcher {
      background: var(--van-background-2);
    }
  }
}
</style>