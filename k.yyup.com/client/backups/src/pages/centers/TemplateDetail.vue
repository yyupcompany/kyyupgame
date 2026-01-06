<template>
  <UnifiedCenterLayout>
    <div class="center-container template-detail">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="page-title">模板详情</span>
  </UnifiedCenterLayout>
</template>
    </el-page-header>

    <el-card v-loading="loading" class="detail-card">
      <!-- 模板基本信息 -->
      <div class="template-header">
        <div class="header-left">
          <h1 class="template-title">
            <el-tag v-if="template.priority === 'required'" type="danger" size="large">必填</el-tag>
            <el-tag v-else-if="template.priority === 'recommended'" type="warning" size="large">推荐</el-tag>
            <el-tag v-else type="info" size="large">可选</el-tag>
            {{ template.name }}
          </h1>
          <div class="template-meta">
            <el-tag type="info">{{ template.code }}</el-tag>
            <el-tag type="success">{{ getCategoryName(template.category) }}</el-tag>
            <el-tag>{{ getFrequencyLabel(template.frequency) }}</el-tag>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              预计 {{ template.estimatedFillTime || '-' }} 分钟
            </span>
            <span class="meta-item">
              <el-icon><View /></el-icon>
              使用 {{ template.useCount || 0 }} 次
            </span>
          </div>
        </div>
        <div class="header-right">
          <el-button type="primary" size="large" @click="handleUseTemplate">
            <el-icon><Edit /></el-icon>
            使用此模板
          </el-button>
          <el-button size="large" @click="handleDownload">
            <el-icon><Download /></el-icon>
            下载模板
          </el-button>
        </div>
      </div>

      <el-divider />

      <!-- 模板信息标签页 -->
      <el-tabs v-model="activeTab">
        <!-- 模板预览 -->
        <el-tab-pane label="模板预览" name="preview">
          <div class="preview-container">
            <div class="markdown-preview" v-html="renderedContent"></div>
          </div>
        </el-tab-pane>

        <!-- 变量说明 -->
        <el-tab-pane name="variables">
          <template #label>
            <span>
              变量说明
              <el-badge :value="variableCount" class="variable-badge" />
            </span>
          </template>
          <div class="variables-container">
            <el-alert
              type="info"
              :closable="false"
              class="variables-tip"
            >
              <template #title>
                <div>
                  <el-icon><InfoFilled /></el-icon>
                  使用此模板时，以下变量将自动填充
                </div>
              </template>
            </el-alert>

            <el-table :data="variableList" style="width: 100%" class="variables-table">
              <el-table-column prop="name" label="变量名" width="200">
                <template #default="{ row }">
                  <el-tag type="primary">{{ `{{${row.name}}}` }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="label" label="说明" min-width="150" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getTypeTagType(row.type)" size="small">
                    {{ getTypeLabel(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="source" label="数据来源" width="120">
                <template #default="{ row }">
                  <el-tag v-if="row.source === 'auto'" type="success" size="small">自动获取</el-tag>
                  <el-tag v-else type="warning" size="small">手动填写</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-icon v-if="row.required" color="var(--danger-color)"><CircleCheckFilled /></el-icon>
                  <el-icon v-else color="var(--text-placeholder)"><CircleClose /></el-icon>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 使用说明 -->
        <el-tab-pane label="使用说明" name="instructions">
          <div class="instructions-container">
            <el-steps :active="3" align-center>
              <el-step title="选择模板" description="从模板列表中选择需要的模板" />
              <el-step title="填写信息" description="系统自动填充基础信息，补充其他内容" />
              <el-step title="预览检查" description="预览生成的文档，检查内容是否正确" />
              <el-step title="保存导出" description="保存文档或导出为PDF/Word格式" />
            </el-steps>

            <el-divider />

            <div class="instruction-content">
              <h3>📝 填写指南</h3>
              <ul>
                <li>系统会自动填充幼儿园基础信息（如名称、地址、园长等）</li>
                <li>请根据实际情况填写其他必填项</li>
                <li>可以使用Markdown格式进行排版</li>
                <li>支持插入表格、列表等格式</li>
                <li>填写过程中会自动保存草稿</li>
              </ul>

              <h3>⚡ 快捷操作</h3>
              <ul>
                <li><kbd>Ctrl</kbd> + <kbd>S</kbd> - 保存草稿</li>
                <li><kbd>Ctrl</kbd> + <kbd>P</kbd> - 预览文档</li>
                <li><kbd>Ctrl</kbd> + <kbd>E</kbd> - 导出文档</li>
              </ul>

              <h3>💡 温馨提示</h3>
              <ul>
                <li>建议先完善基础信息，可提高自动填充的准确性</li>
                <li>填写时请注意保存，避免数据丢失</li>
                <li>如有疑问，可查看示例文档或联系管理员</li>
              </ul>
            </div>
          </div>
        </el-tab-pane>

        <!-- 相关模板 -->
        <el-tab-pane name="related">
          <template #label>
            <span>
              相关模板
              <el-badge :value="relatedTemplates.length" class="related-badge" />
            </span>
          </template>
          <div class="related-container">
            <el-row :gutter="20">
              <el-col :span="8" v-for="item in relatedTemplates" :key="item.id">
                <el-card class="related-card" @click="goToTemplate(item.id)">
                  <div class="related-header">
                    <el-tag :type="getPriorityType(item.priority)" size="small">
                      {{ getPriorityLabel(item.priority) }}
                    </el-tag>
                    <span class="related-code">{{ item.code }}</span>
                  </div>
                  <h4 class="related-title">{{ item.name }}</h4>
                  <div class="related-meta">
                    <span>
                      <el-icon><Clock /></el-icon>
                      {{ item.estimatedFillTime || '-' }}分钟
                    </span>
                    <span>
                      <el-icon><View /></el-icon>
                      {{ item.useCount || 0 }}次
                    </span>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Clock, View, Edit, Download, InfoFilled,
  CircleCheckFilled, CircleClose
} from '@element-plus/icons-vue';
import { marked } from 'marked';
import { getTemplateById } from '@/api/endpoints/document-templates';

const router = useRouter();
const route = useRoute();

// 数据
const loading = ref(false);
const activeTab = ref('preview');
const template = ref<any>({
  id: 0,
  code: '',
  name: '',
  category: '',
  frequency: '',
  priority: '',
  estimatedFillTime: 0,
  useCount: 0,
  templateContent: '',
  variables: {}
});

const relatedTemplates = ref<any[]>([]);

// 计算属性
const renderedContent = computed(() => {
  if (!template.value.templateContent) return '';
  return marked(template.value.templateContent);
});

const variableList = computed(() => {
  if (!template.value.variables) return [];
  return Object.entries(template.value.variables).map(([name, config]: [string, any]) => ({
    name,
    label: config.label || name,
    type: config.type || 'string',
    source: config.source || 'auto',
    required: config.required !== false
  }));
});

const variableCount = computed(() => variableList.value.length);

// 方法
const goBack = () => {
  router.back();
};

const getCategoryName = (code: string) => {
  const map: Record<string, string> = {
    annual: '年度检查类',
    special: '专项检查类',
    routine: '常态化督导类',
    staff: '教职工管理类',
    student: '幼儿管理类',
    finance: '财务管理类',
    education: '保教工作类'
  };
  return map[code] || code;
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

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    string: '文本',
    number: '数字',
    date: '日期',
    boolean: '是/否'
  };
  return map[type] || type;
};

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    string: '',
    number: 'success',
    date: 'warning',
    boolean: 'info'
  };
  return map[type] || '';
};

const getPriorityType = (priority: string) => {
  const map: Record<string, string> = {
    required: 'danger',
    recommended: 'warning',
    optional: 'info'
  };
  return map[priority] || 'info';
};

const getPriorityLabel = (priority: string) => {
  const map: Record<string, string> = {
    required: '必填',
    recommended: '推荐',
    optional: '可选'
  };
  return map[priority] || priority;
};

const handleUseTemplate = () => {
  router.push(`/inspection-center/templates/${template.value.id}/use`);
};

const handleDownload = () => {
  // TODO: 实现下载功能
  ElMessage.success('下载功能开发中...');
};

const goToTemplate = (id: number) => {
  router.push(`/inspection-center/templates/${id}`);
};

// 加载数据
const loadTemplate = async () => {
  loading.value = true;
  try {
    const id = route.params.id as string;
    const response = await getTemplateById(id);
    if (response.success) {
      template.value = response.data;
      // 加载相关模板
      loadRelatedTemplates();
    }
  } catch (error) {
    console.error('加载模板详情失败:', error);
    ElMessage.error('加载模板详情失败');
  } finally {
    loading.value = false;
  }
};

const loadRelatedTemplates = () => {
  // TODO: 调用真实API
  relatedTemplates.value = [
    {
      id: 2,
      code: '01-02',
      name: '幼儿园年检评分表',
      priority: 'required',
      estimatedFillTime: 60,
      useCount: 10
    },
    {
      id: 3,
      code: '01-03',
      name: '幼儿园年检整改报告',
      priority: 'recommended',
      estimatedFillTime: 90,
      useCount: 5
    }
  ];
};

onMounted(() => {
  loadTemplate();
});
</script>

<style scoped lang="scss">
.template-detail {
  padding: var(--text-2xl);

  .page-header {
    margin-bottom: var(--text-2xl);

    .page-title {
      font-size: var(--text-xl);
      font-weight: bold;
    }
  }

  .detail-card {
    .template-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .header-left {
        flex: 1;

        .template-title {
          margin: 0 0 var(--text-sm) 0;
          font-size: var(--text-3xl);
          display: flex;
          align-items: center;
          gap: var(--text-sm);
        }

        .template-meta {
          display: flex;
          align-items: center;
          gap: var(--text-sm);
          flex-wrap: wrap;

          .meta-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            color: var(--text-secondary);
          }
        }
      }

      .header-right {
        display: flex;
        gap: var(--text-sm);
      }
    }

    .preview-container {
      padding: var(--text-2xl);
      background: var(--bg-hover);
      border-radius: var(--spacing-xs);

      .markdown-preview {
        background: white;
        padding: var(--spacing-8xl);
        border-radius: var(--spacing-xs);
        min-height: 400px;

        :deep(h1) {
          font-size: var(--text-3xl);
          margin-bottom: var(--text-lg);
          border-bottom: var(--transform-drop) solid #eee;
          padding-bottom: var(--spacing-sm);
        }

        :deep(h2) {
          font-size: var(--text-2xl);
          margin: var(--text-2xl) 0 var(--text-sm);
        }

        :deep(h3) {
          font-size: var(--text-xl);
          margin: var(--text-lg) 0 var(--spacing-sm);
        }

        :deep(p) {
          margin: var(--spacing-sm) 0;
          line-height: 1.6;
        }

        :deep(table) {
          width: 100%;
          border-collapse: collapse;
          margin: var(--text-lg) 0;

          th, td {
            border: var(--border-width-base) solid #ddd;
            padding: var(--spacing-sm) var(--text-sm);
            text-align: left;
          }

          th {
            background: var(--bg-hover);
            font-weight: bold;
          }
        }
      }
    }

    .variables-container {
      .variables-tip {
        margin-bottom: var(--text-2xl);
      }
    }

    .instructions-container {
      padding: var(--text-2xl);

      .instruction-content {
        h3 {
          margin: var(--text-2xl) 0 var(--text-sm);
          font-size: var(--text-lg);
        }

        ul {
          margin: 0;
          padding-left: var(--text-3xl);

          li {
            margin-bottom: var(--spacing-sm);
            line-height: 1.6;
          }
        }

        kbd {
          padding: var(--spacing-sm) 6px;
          background: var(--bg-hover);
          border: var(--border-width-base) solid #ddd;
          border-radius: var(--radius-xs);
          font-family: monospace;
        }
      }
    }

    .related-container {
      padding: var(--text-2xl);

      .related-card {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 2px var(--text-sm) 0 var(--shadow-light);
          transform: translateY(var(--transform-hover-lift));
        }

        .related-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);

          .related-code {
            color: var(--text-tertiary);
            font-size: var(--text-sm);
          }
        }

        .related-title {
          margin: 0 0 var(--text-sm) 0;
          font-size: var(--text-base);
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .related-meta {
          display: flex;
          gap: var(--text-lg);
          font-size: var(--text-sm);
          color: var(--text-secondary);

          span {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
          }
        }
      }
    }
  }
}
</style>

