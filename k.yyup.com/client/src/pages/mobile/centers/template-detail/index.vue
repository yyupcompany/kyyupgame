<template>
  <MobileMainLayout
    title="模板详情"
    :show-back="true"
    @back="goBack"
  >
    <div class="mobile-template-detail">
      <!-- 加载状态 -->
      <van-loading v-if="loading" type="spinner" color="#1989fa" class="loading-center">
        加载中...
      </van-loading>

      <template v-else>
        <!-- 模板基本信息卡片 -->
        <van-card class="template-info-card">
          <template #title>
            <div class="template-title">
              <van-tag
                :type="getPriorityTagType(template.priority)"
                size="medium"
                class="priority-tag"
              >
                {{ getPriorityLabel(template.priority) }}
              </van-tag>
              <span class="title-text">{{ template.name }}</span>
            </div>
          </template>

          <template #desc>
            <div class="template-meta">
              <van-tag type="primary" size="small">{{ template.code }}</van-tag>
              <van-tag type="success" size="small">{{ getCategoryName(template.category) }}</van-tag>
              <van-tag type="warning" size="small">{{ getFrequencyLabel(template.frequency) }}</van-tag>
            </div>
            
            <div class="template-stats">
              <div class="stat-item">
                <van-icon name="clock-o" />
                <span>{{ template.estimatedFillTime || '-' }} 分钟</span>
              </div>
              <div class="stat-item">
                <van-icon name="eye-o" />
                <span>使用 {{ template.useCount || 0 }} 次</span>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="action-buttons">
              <van-button
                type="primary"
                block
                size="large"
                @click="handleUseTemplate"
                class="use-btn"
              >
                <van-icon name="edit" />
                使用此模板
              </van-button>
              <van-button
                block
                size="large"
                @click="handleDownload"
                class="download-btn"
              >
                <van-icon name="down" />
                下载模板
              </van-button>
            </div>
          </template>
        </van-card>

        <!-- 标签页 -->
        <van-tabs v-model:active="activeTab" sticky class="template-tabs">
          <!-- 模板预览 -->
          <van-tab title="模板预览" name="preview">
            <div class="preview-container">
              <div class="markdown-preview" v-html="renderedContent"></div>
            </div>
          </van-tab>

          <!-- 变量说明 -->
          <van-tab name="variables">
            <template #title>
              <span>变量说明</span>
              <van-badge :content="variableCount.toString()" max="99" />
            </template>
            <div class="variables-container">
              <van-notice-bar
                left-icon="info-o"
                text="使用此模板时，以下变量将自动填充"
                background="#e6f7ff"
                color="#1890ff"
              />
              
              <div class="variables-list">
                <van-cell
                  v-for="variable in variableList"
                  :key="variable.name"
                  :title="`{{${variable.name}}}`"
                  :label="variable.label"
                  class="variable-item"
                >
                  <template #right-icon>
                    <div class="variable-tags">
                      <van-tag :type="getTypeTagType(variable.type)" size="small">
                        {{ getTypeLabel(variable.type) }}
                      </van-tag>
                      <van-tag
                        :type="variable.source === 'auto' ? 'success' : 'warning'"
                        size="small"
                      >
                        {{ variable.source === 'auto' ? '自动获取' : '手动填写' }}
                      </van-tag>
                      <van-tag
                        v-if="variable.required"
                        type="danger"
                        size="small"
                      >
                        必填
                      </van-tag>
                    </div>
                  </template>
                </van-cell>
              </div>
            </div>
          </van-tab>

          <!-- 使用说明 -->
          <van-tab title="使用说明" name="instructions">
            <div class="instructions-container">
              <van-steps :active="3" direction="vertical" active-color="#1989fa">
                <van-step>选择模板 - 从模板列表中选择需要的模板</van-step>
                <van-step>填写信息 - 系统自动填充基础信息，补充其他内容</van-step>
                <van-step>预览检查 - 预览生成的文档，检查内容是否正确</van-step>
                <van-step>保存导出 - 保存文档或导出为PDF/Word格式</van-step>
              </van-steps>

              <van-divider />

              <div class="instruction-content">
                <van-cell-group inset title="📝 填写指南">
                  <van-cell title="•" label="系统会自动填充幼儿园基础信息（如名称、地址、园长等）" />
                  <van-cell title="•" label="请根据实际情况填写其他必填项" />
                  <van-cell title="•" label="可以使用Markdown格式进行排版" />
                  <van-cell title="•" label="支持插入表格、列表等格式" />
                  <van-cell title="•" label="填写过程中会自动保存草稿" />
                </van-cell-group>

                <van-cell-group inset title="⚡ 快捷操作">
                  <van-cell title="Ctrl + S" label="保存草稿" />
                  <van-cell title="Ctrl + P" label="预览文档" />
                  <van-cell title="Ctrl + E" label="导出文档" />
                </van-cell-group>

                <van-cell-group inset title="💡 温馨提示">
                  <van-cell title="•" label="建议先完善基础信息，可提高自动填充的准确性" />
                  <van-cell title="•" label="填写时请注意保存，避免数据丢失" />
                  <van-cell title="•" label="如有疑问，可查看示例文档或联系管理员" />
                </van-cell-group>
              </div>
            </div>
          </van-tab>

          <!-- 相关模板 -->
          <van-tab name="related">
            <template #title>
              <span>相关模板</span>
              <van-badge :content="relatedTemplates.length.toString()" max="99" />
            </template>
            <div class="related-container">
              <van-list>
                <van-card
                  v-for="item in relatedTemplates"
                  :key="item.id"
                  :title="item.name"
                  :desc="`预计 ${item.estimatedFillTime || '-'}分钟 · 使用 ${item.useCount || 0}次`"
                  @click="goToTemplate(item.id)"
                  class="related-card"
                >
                  <template #tags>
                    <van-tag :type="getPriorityTagType(item.priority)" size="small">
                      {{ getPriorityLabel(item.priority) }}
                    </van-tag>
                    <van-tag type="primary" size="small">{{ item.code }}</van-tag>
                  </template>
                  <template #thumb>
                    <van-icon name="description" size="40" color="#1989fa" />
                  </template>
                </van-card>
              </van-list>
            </div>
          </van-tab>
        </van-tabs>
      </template>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showFailToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { marked } from 'marked'
import { getTemplateById, type Template } from '@/api/endpoints/document-templates'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const activeTab = ref('preview')
const template = ref<Template>({
  id: 0,
  code: '',
  name: '',
  category: '',
  frequency: '',
  priority: '',
  estimatedFillTime: 0,
  useCount: 0,
  templateContent: '',
  variables: {},
  version: '',
  isActive: false,
  createdAt: '',
  updatedAt: ''
})

const relatedTemplates = ref<Template[]>([])

// 计算属性
const renderedContent = computed(() => {
  if (!template.value.templateContent) return ''
  return marked(template.value.templateContent)
})

const variableList = computed(() => {
  if (!template.value.variables) return []
  return Object.entries(template.value.variables).map(([name, config]: [string, any]) => ({
    name,
    label: config.label || name,
    type: config.type || 'string',
    source: config.source || 'auto',
    required: config.required !== false
  }))
})

const variableCount = computed(() => variableList.value.length)

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

const getFrequencyLabel = (frequency: string) => {
  const map: Record<string, string> = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    quarterly: '每季度',
    yearly: '每年',
    as_needed: '按需'
  }
  return map[frequency] || '-'
}

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    string: '文本',
    number: '数字',
    date: '日期',
    boolean: '是/否'
  }
  return map[type] || type
}

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    string: '',
    number: 'success',
    date: 'warning',
    boolean: 'info'
  }
  return map[type] || ''
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

const handleUseTemplate = () => {
  // 跳转到文档中心的实例创建页面
  router.push({
    path: '/mobile/centers/document-center',
    query: { createFrom: template.value.id }
  })
}

const handleDownload = () => {
  // TODO: 实现下载功能
  showToast('下载功能开发中...')
}

const goToTemplate = (id: number) => {
  router.push(`/mobile/centers/template-detail/${id}`)
}

// 数据加载
const loadTemplate = async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    const response = await getTemplateById(id)
    if (response.success) {
      template.value = response.data
      // 加载相关模板
      loadRelatedTemplates()
    } else {
      showFailToast('加载模板详情失败')
    }
  } catch (error) {
    console.error('加载模板详情失败:', error)
    showFailToast('加载模板详情失败')
  } finally {
    loading.value = false
  }
}

const loadRelatedTemplates = () => {
  // TODO: 调用真实API获取相关模板
  relatedTemplates.value = [
    {
      id: 2,
      code: '01-02',
      name: '幼儿园年检评分表',
      priority: 'required',
      estimatedFillTime: 60,
      useCount: 10,
      category: 'annual',
      version: '1.0',
      isActive: true,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 3,
      code: '01-03',
      name: '幼儿园年检整改报告',
      priority: 'recommended',
      estimatedFillTime: 90,
      useCount: 5,
      category: 'annual',
      version: '1.0',
      isActive: true,
      createdAt: '',
      updatedAt: ''
    }
  ]
}

// 生命周期
onMounted(() => {
  loadTemplate()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
.mobile-template-detail {
  background: var(--van-background-color-light);
  min-height: 100vh;

  .loading-center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .template-info-card {
    margin: var(--van-padding-md);
    border-radius: var(--van-border-radius-md);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .template-title {
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      margin-bottom: var(--van-padding-sm);

      .priority-tag {
        flex-shrink: 0;
      }

      .title-text {
        font-size: var(--van-font-size-lg);
        font-weight: 600;
        line-height: 1.4;
      }
    }

    .template-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--van-padding-xs);
      margin-bottom: var(--van-padding-sm);
    }

    .template-stats {
      display: flex;
      gap: var(--van-padding-lg);

      .stat-item {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
        color: var(--van-text-color-2);
        font-size: var(--van-font-size-sm);

        .van-icon {
          font-size: var(--van-font-size-md);
        }
      }
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: var(--van-padding-sm);

      .use-btn {
        background: linear-gradient(135deg, #1989fa, #1e88e5);
        border: none;
        font-weight: 600;
      }

      .download-btn {
        background: var(--van-background-color-light);
        border: 1px solid var(--van-border-color);
      }
    }
  }

  .template-tabs {
    margin-top: var(--van-padding-md);

    .preview-container {
      padding: var(--van-padding-md);

      .markdown-preview {
        background: white;
        padding: var(--van-padding-lg);
        border-radius: var(--van-border-radius-md);
        min-height: 200px;
        line-height: 1.6;

        :deep(h1) {
          font-size: var(--van-font-size-xl);
          font-weight: 600;
          margin-bottom: var(--van-padding-md);
          padding-bottom: var(--van-padding-sm);
          border-bottom: 1px solid var(--van-border-color);
        }

        :deep(h2) {
          font-size: var(--van-font-size-lg);
          font-weight: 600;
          margin: var(--van-padding-lg) 0 var(--van-padding-sm);
        }

        :deep(h3) {
          font-size: var(--van-font-size-md);
          font-weight: 600;
          margin: var(--van-padding-md) 0 var(--van-padding-sm);
        }

        :deep(p) {
          margin: var(--van-padding-sm) 0;
          line-height: 1.6;
        }

        :deep(table) {
          width: 100%;
          border-collapse: collapse;
          margin: var(--van-padding-md) 0;
          font-size: var(--van-font-size-sm);

          th, td {
            border: 1px solid var(--van-border-color);
            padding: var(--van-padding-xs) var(--van-padding-sm);
            text-align: left;
          }

          th {
            background: var(--van-background-color-light);
            font-weight: 600;
          }
        }

        :deep(ul), :deep(ol) {
          padding-left: var(--van-padding-lg);
          margin: var(--van-padding-sm) 0;
        }

        :deep(li) {
          margin-bottom: var(--van-padding-xs);
        }
      }
    }

    .variables-container {
      padding: var(--van-padding-md);

      .van-notice-bar {
        margin-bottom: var(--van-padding-md);
        border-radius: var(--van-border-radius-md);
      }

      .variables-list {
        background: white;
        border-radius: var(--van-border-radius-md);
        overflow: hidden;

        .variable-item {
          .variable-tags {
            display: flex;
            flex-direction: column;
            gap: var(--van-padding-xs);
            align-items: flex-end;
          }
        }
      }
    }

    .instructions-container {
      padding: var(--van-padding-md);

      .van-steps {
        margin-bottom: var(--van-padding-lg);
        background: white;
        padding: var(--van-padding-lg);
        border-radius: var(--van-border-radius-md);
      }

      .instruction-content {
        .van-cell-group {
          margin-bottom: var(--van-padding-md);
        }
      }
    }

    .related-container {
      padding: var(--van-padding-md);

      .related-card {
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
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-template-detail {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>