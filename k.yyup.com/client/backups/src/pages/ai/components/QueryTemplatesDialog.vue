<template>
  <el-dialog
    v-model="visible"
    title="查询模板"
    width="900px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="templates-dialog">
      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索模板..."
              clearable
              @input="filterTemplates"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-select
              v-model="selectedCategory"
              placeholder="选择分类"
              clearable
              @change="filterTemplates"
            >
              <el-option
                v-for="category in categories"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="resetFilters">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 模板列表 -->
      <div class="templates-section">
        <el-row :gutter="20" v-loading="loading">
          <el-col
            v-for="template in filteredTemplates"
            :key="template.id"
            :span="12"
            :xs="24"
            class="template-col"
          >
            <el-card 
              class="template-card"
              :class="{ 'selected': selectedTemplate?.id === template.id }"
              shadow="hover"
              @click="selectTemplate(template)"
            >
              <div class="template-header">
                <div class="template-title">
                  <h4>{{ template.displayName }}</h4>
                  <el-tag size="small" :type="getCategoryTagType(template.category)">
                    {{ template.category || '通用' }}
                  </el-tag>
                </div>
                <div class="template-stats">
                  <el-tooltip content="使用次数">
                    <span class="stat-item">
                      <el-icon><TrendCharts /></el-icon>
                      {{ template.usageCount || 0 }}
                    </span>
                  </el-tooltip>
                  <el-tooltip content="成功率">
                    <span class="stat-item success-rate">
                      <el-icon><SuccessFilled /></el-icon>
                      {{ (template.successRate || 0).toFixed(1) }}%
                    </span>
                  </el-tooltip>
                </div>
              </div>

              <div class="template-description">
                <p>{{ template.description || '暂无描述' }}</p>
              </div>

              <div class="template-examples" v-if="template.exampleQueries?.length">
                <div class="examples-label">
                  <el-icon><Star /></el-icon>
                  示例查询：
                </div>
                <div class="examples-list">
                  <el-tag
                    v-for="(example, index) in template.exampleQueries.slice(0, 3)"
                    :key="index"
                    size="small"
                    class="example-tag"
                    @click.stop="selectExample(example)"
                  >
                    {{ example }}
                  </el-tag>
                  <span v-if="template.exampleQueries.length > 3" class="more-examples">
                    +{{ template.exampleQueries.length - 3 }} 更多
                  </span>
                </div>
              </div>

              <div class="template-footer">
                <div class="performance-info">
                  <span class="avg-time">
                    平均耗时: {{ template.avgExecutionTime || 0 }}ms
                  </span>
                </div>
                <div class="template-actions">
                  <el-button 
                    size="small" 
                    type="primary" 
                    @click.stop="useTemplate(template)"
                  >
                    使用模板
                  </el-button>
                  <el-button 
                    size="small" 
                    @click.stop="previewTemplate(template)"
                  >
                    预览
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 空状态 -->
        <el-empty 
          v-if="filteredTemplates.length === 0 && !loading"
          description="没有找到匹配的模板"
          :image-size="100"
        >
          <el-button @click="resetFilters">清除筛选条件</el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <div class="pagination-section" v-if="totalCount > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[6, 12, 24]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="confirmSelection"
          :disabled="!selectedTemplate"
        >
          确定使用
        </el-button>
      </div>
    </template>

    <!-- 模板预览对话框 -->
    <el-dialog
      v-model="showPreview"
      title="模板预览"
      width="600px"
      destroy-on-close
    >
      <div v-if="previewingTemplate" class="template-preview">
        <div class="preview-header">
          <h3>{{ previewingTemplate.displayName }}</h3>
          <el-tag :type="getCategoryTagType(previewingTemplate.category)">
            {{ previewingTemplate.category }}
          </el-tag>
        </div>
        
        <div class="preview-description">
          <p>{{ previewingTemplate.description }}</p>
        </div>

        <div class="preview-sql" v-if="previewingTemplate.templateSql">
          <h4>SQL模板:</h4>
          <pre class="sql-code">{{ previewingTemplate.templateSql }}</pre>
        </div>

        <div class="preview-examples" v-if="previewingTemplate.exampleQueries?.length">
          <h4>示例查询:</h4>
          <ul class="examples-list">
            <li 
              v-for="(example, index) in previewingTemplate.exampleQueries"
              :key="index"
              class="example-item"
            >
              "{{ example }}"
            </li>
          </ul>
        </div>
      </div>

      <template #footer>
        <el-button @click="showPreview = false">关闭</el-button>
        <el-button type="primary" @click="usePreviewingTemplate">
          使用此模板
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, TrendCharts, SuccessFilled, Star } from '@element-plus/icons-vue'
import { useAIQuery } from '@/composables/useAIQuery'

// 定义Props
interface Props {
  modelValue: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

// 定义Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [template: any]
}>()

// 使用AI查询组合式函数
const { getQueryTemplates } = useAIQuery()

// 响应式数据
const visible = ref(false)
const loading = ref(false)
const templates = ref<any[]>([])
const filteredTemplates = ref<any[]>([])
const selectedTemplate = ref<any>(null)
const searchKeyword = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)
const showPreview = ref(false)
const previewingTemplate = ref<any>(null)

// 分类选项
const categories = [
  { label: '学生管理', value: '学生管理' },
  { label: '教师管理', value: '教师管理' },
  { label: '班级管理', value: '班级管理' },
  { label: '招生管理', value: '招生管理' },
  { label: '活动管理', value: '活动管理' },
  { label: '家长管理', value: '家长管理' },
  { label: '数据分析', value: '数据分析' },
  { label: '系统管理', value: '系统管理' }
]

// 计算属性
const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTemplates.value.slice(start, end)
})

// 方法
const fetchTemplates = async () => {
  loading.value = true
  try {
    const result = await getQueryTemplates()
    templates.value = result || []
    filterTemplates()
  } catch (error: any) {
    console.error('获取模板失败:', error)
    ElMessage.error('获取模板失败')
  } finally {
    loading.value = false
  }
}

const filterTemplates = () => {
  let filtered = [...templates.value]

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(template => 
      template.displayName.toLowerCase().includes(keyword) ||
      template.description?.toLowerCase().includes(keyword) ||
      template.exampleQueries?.some((query: string) => 
        query.toLowerCase().includes(keyword)
      )
    )
  }

  // 按分类筛选
  if (selectedCategory.value) {
    filtered = filtered.filter(template => 
      template.category === selectedCategory.value
    )
  }

  filteredTemplates.value = filtered
  totalCount.value = filtered.length
  currentPage.value = 1
}

const resetFilters = () => {
  searchKeyword.value = ''
  selectedCategory.value = ''
  filterTemplates()
}

const selectTemplate = (template: any) => {
  selectedTemplate.value = template
}

const useTemplate = (template: any) => {
  emit('select', template)
  handleClose()
}

const selectExample = (example: string) => {
  emit('select', { exampleQueries: [example], displayName: example })
  handleClose()
}

const previewTemplate = (template: any) => {
  previewingTemplate.value = template
  showPreview.value = true
}

const usePreviewingTemplate = () => {
  if (previewingTemplate.value) {
    useTemplate(previewingTemplate.value)
  }
  showPreview.value = false
}

const confirmSelection = () => {
  if (selectedTemplate.value) {
    useTemplate(selectedTemplate.value)
  }
}

const getCategoryTagType = (category: string) => {
  const typeMap: { [key: string]: string } = {
    '学生管理': 'primary',
    '教师管理': 'success',
    '班级管理': 'warning',
    '招生管理': 'danger',
    '活动管理': 'info',
    '家长管理': 'primary',
    '数据分析': 'success',
    '系统管理': 'warning'
  }
  return typeMap[category] || 'default'
}

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
}

const handleClose = () => {
  emit('update:modelValue', false)
  selectedTemplate.value = null
  resetFilters()
}

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
  if (newValue) {
    fetchTemplates()
  }
})

watch(visible, (newValue) => {
  if (!newValue) {
    emit('update:modelValue', false)
  }
})

// 生命周期
onMounted(() => {
  visible.value = props.modelValue
})
</script>

<style scoped lang="scss">
.templates-dialog {
  .search-section {
    margin-bottom: var(--text-2xl);
    padding-bottom: var(--spacing-4xl);
    border-bottom: var(--border-width-base) solid #ebeef5;
  }

  .templates-section {
    min-height: 400px;
    max-height: 600px;
    overflow-y: auto;

    .template-col {
      margin-bottom: var(--text-2xl);
    }

    .template-card {
      height: 280px;
      cursor: pointer;
      transition: all 0.3s;
      border: 2px solid transparent;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
      }

      &.selected {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }

      :deep(.el-card__body) {
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: var(--spacing-4xl);
      }

      .template-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-2xl);

        .template-title {
          flex: 1;
          
          h4 {
            margin: 0 0 5px 0;
            font-size: var(--text-lg);
            color: var(--text-primary);
            line-height: 1.3;
          }
        }

        .template-stats {
          display: flex;
          gap: var(--spacing-2xl);
          align-items: center;

          .stat-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            font-size: var(--text-sm);
            color: var(--info-color);

            &.success-rate {
              color: var(--success-color);
            }
          }
        }
      }

      .template-description {
        flex: 1;
        margin-bottom: var(--spacing-2xl);

        p {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--text-regular);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .template-examples {
        margin-bottom: var(--spacing-4xl);

        .examples-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-sm);
          color: var(--info-color);
          margin-bottom: var(--spacing-base);
        }

        .examples-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);

          .example-tag {
            font-size: var(--text-xs);
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              transform: scale(1.05);
            }
          }

          .more-examples {
            font-size: var(--text-xs);
            color: var(--info-color);
            align-self: center;
          }
        }
      }

      .template-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;

        .performance-info {
          .avg-time {
            font-size: var(--text-xs);
            color: var(--info-color);
          }
        }

        .template-actions {
          display: flex;
          gap: var(--spacing-base);
        }
      }
    }
  }

  .pagination-section {
    margin-top: var(--text-2xl);
    text-align: center;
    padding-top: var(--spacing-4xl);
    border-top: var(--border-width-base) solid #ebeef5;
  }
}

.template-preview {
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-4xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
    }
  }

  .preview-description {
    margin-bottom: var(--text-2xl);

    p {
      margin: 0;
      color: var(--text-regular);
      line-height: 1.6;
    }
  }

  .preview-sql {
    margin-bottom: var(--text-2xl);

    h4 {
      margin: 0 0 10px 0;
      font-size: var(--text-base);
      color: var(--text-primary);
    }

    .sql-code {
      background: var(--bg-gray-light);
      border: var(--border-width-base) solid #e9ecef;
      border-radius: var(--spacing-xs);
      padding: var(--text-sm);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: var(--text-sm);
      line-height: 1.4;
      overflow-x: auto;
      margin: 0;
    }
  }

  .preview-examples {
    h4 {
      margin: 0 0 10px 0;
      font-size: var(--text-base);
      color: var(--text-primary);
    }

    .examples-list {
      margin: 0;
      padding-left: var(--text-2xl);

      .example-item {
        margin-bottom: var(--spacing-sm);
        color: var(--text-regular);
        font-style: italic;
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .templates-dialog {
    .search-section {
      .el-row {
        .el-col {
          margin-bottom: var(--spacing-2xl);
        }
      }
    }

    .templates-section {
      .template-card {
        .template-header {
          flex-direction: column;
          gap: var(--spacing-2xl);

          .template-stats {
            align-self: flex-start;
          }
        }
      }
    }
  }
}
</style>