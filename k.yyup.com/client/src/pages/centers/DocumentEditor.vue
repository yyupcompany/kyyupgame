<template>
  <UnifiedCenterLayout>
    <div class="center-container document-editor">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="page-title">{{ template.name }}</span>
      </template>
      <template #extra>
        <el-space>
          <el-tag :type="getStatusType(document.status)">
            {{ getStatusLabel(document.status) }}
          </el-tag>
          <el-progress
            :percentage="document.progress"
            :stroke-width="8"
            class="progress-bar"
          />
          <el-button @click="handleSaveDraft" :loading="saving">
            <UnifiedIcon name="default" />
            保存草稿
          </el-button>
          <el-button type="primary" @click="handlePreview">
            <UnifiedIcon name="eye" />
            预览
          </el-button>
          <el-button type="success" @click="handleSubmit">
            <UnifiedIcon name="Check" />
            提交
          </el-button>
        </el-space>
      </template>
    </el-page-header>

    <el-row :gutter="20" class="editor-container">
      <!-- 左侧：编辑区 -->
      <el-col :span="16">
        <el-card class="editor-card">
          <template #header>
            <div class="card-header">
              <span>文档编辑</span>
              <el-space>
                <el-button size="small" @click="handleAutoFill" :loading="autoFilling">
                  <UnifiedIcon name="default" />
                  自动填充
                </el-button>
                <el-button size="small" @click="handleAIAssist">
                  <UnifiedIcon name="default" />
                  AI辅助
                </el-button>
              </el-space>
            </div>
          </template>

          <!-- Markdown编辑器 -->
          <div class="editor-wrapper">
            <textarea
              v-model="document.content"
              class="markdown-editor"
              placeholder="开始编辑文档内容..."
              @input="handleContentChange"
            ></textarea>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：变量面板和预览 -->
      <el-col :span="8">
        <!-- 变量填充面板 -->
        <el-card class="variables-card">
          <template #header>
            <div class="card-header">
              <span>变量填充</span>
              <el-badge :value="unfilledCount" type="danger" />
            </div>
          </template>

          <el-scrollbar class="variables-scrollbar">
            <el-form :model="filledVariables" label-position="top">
              <el-form-item
                v-for="variable in variableList"
                :key="variable.name"
                :label="variable.label"
                :required="variable.required"
              >
                <template #label>
                  <div class="variable-label">
                    <span>{{ variable.label }}</span>
                    <el-tag v-if="variable.source === 'auto'" type="success" size="small">
                      自动
                    </el-tag>
                  </div>
                </template>

                <!-- 文本输入 -->
                <el-input
                  v-if="variable.type === 'string'"
                  v-model="filledVariables[variable.name]"
                  :placeholder="`请输入${variable.label}`"
                  :readonly="variable.source === 'auto'"
                  @input="handleVariableChange"
                />

                <!-- 数字输入 -->
                <el-input-number
                  v-else-if="variable.type === 'number'"
                  v-model="filledVariables[variable.name]"
                  :placeholder="`请输入${variable.label}`"
                  :readonly="variable.source === 'auto'"
                  @change="handleVariableChange"
                  class="full-width-input"
                />

                <!-- 日期选择 -->
                <el-date-picker
                  v-else-if="variable.type === 'date'"
                  v-model="filledVariables[variable.name]"
                  type="date"
                  :placeholder="`请选择${variable.label}`"
                  :readonly="variable.source === 'auto'"
                  @change="handleVariableChange"
                  class="full-width-input"
                />

                <!-- 布尔选择 -->
                <el-switch
                  v-else-if="variable.type === 'boolean'"
                  v-model="filledVariables[variable.name]"
                  :disabled="variable.source === 'auto'"
                  @change="handleVariableChange"
                />

                <!-- 默认文本 -->
                <el-input
                  v-else
                  v-model="filledVariables[variable.name]"
                  :placeholder="`请输入${variable.label}`"
                  :readonly="variable.source === 'auto'"
                  @input="handleVariableChange"
                />
              </el-form-item>
            </el-form>
          </el-scrollbar>
        </el-card>

        <!-- 快捷操作 -->
        <el-card class="shortcuts-card">
          <template #header>
            <span>快捷操作</span>
          </template>

          <el-space direction="vertical" class="shortcuts-space">
            <el-button class="full-width-button" @click="handleInsertTable">
              <UnifiedIcon name="default" />
              插入表格
            </el-button>
            <el-button class="full-width-button" @click="handleInsertList">
              <UnifiedIcon name="default" />
              插入列表
            </el-button>
            <el-button class="full-width-button" @click="handleInsertImage">
              <UnifiedIcon name="default" />
              插入图片
            </el-button>
            <el-button class="full-width-button" @click="handleFormat">
              <UnifiedIcon name="default" />
              格式化
            </el-button>
          </el-space>
        </el-card>
      </el-col>
    </el-row>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="文档预览"
      class="preview-dialog"
      :close-on-click-modal="false"
    >
      <div class="preview-content" v-html="previewHtml"></div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleExport">
          <UnifiedIcon name="Download" />
          导出PDF
        </el-button>
      </template>
    </el-dialog>
  </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Document, View, Check, MagicStick, ChatDotRound,
  Grid, List, Picture, Brush, Download
} from '@element-plus/icons-vue';
import { marked } from 'marked';
import { getTemplateById } from '@/api/endpoints/document-templates';

const router = useRouter();
const route = useRoute();

// 数据
const template = ref<any>({
  id: 0,
  name: '',
  templateContent: '',
  variables: {}
});

const document = ref({
  id: 0,
  templateId: 0,
  title: '',
  content: '',
  status: 'draft',
  progress: 0
});

const filledVariables = ref<Record<string, any>>({});
const saving = ref(false);
const autoFilling = ref(false);
const previewVisible = ref(false);
const autoSaveTimer = ref<any>(null);

// 计算属性
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

const unfilledCount = computed(() => {
  return variableList.value.filter(v => 
    v.required && !filledVariables.value[v.name]
  ).length;
});

const previewHtml = computed(() => {
  if (!document.value.content) return '';
  return marked(document.value.content);
});

// 方法
const goBack = () => {
  if (document.value.content) {
    ElMessageBox.confirm('确定要离开吗？未保存的内容将丢失。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.back();
    }).catch(() => {});
  } else {
    router.back();
  }
};

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'info',
    filling: 'warning',
    review: 'primary',
    completed: 'success'
  };
  return map[status] || 'info';
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    filling: '填写中',
    review: '审核中',
    completed: '已完成'
  };
  return map[status] || status;
};

const handleContentChange = () => {
  // 计算进度
  calculateProgress();
  // 触发自动保存
  scheduleAutoSave();
};

const handleVariableChange = () => {
  // 更新文档内容中的变量
  updateContentWithVariables();
  // 计算进度
  calculateProgress();
  // 触发自动保存
  scheduleAutoSave();
};

const calculateProgress = () => {
  const totalVariables = variableList.value.filter(v => v.required).length;
  const filledCount = variableList.value.filter(v => 
    v.required && filledVariables.value[v.name]
  ).length;
  
  const contentProgress = document.value.content ? 50 : 0;
  const variableProgress = totalVariables > 0 
    ? (filledCount / totalVariables) * 50 
    : 50;
  
  document.value.progress = Math.round(contentProgress + variableProgress);
};

const updateContentWithVariables = () => {
  let content = template.value.templateContent;
  
  for (const [name, value] of Object.entries(filledVariables.value)) {
    const regex = new RegExp(`\\{\\{${name}\\}\\}`, 'g');
    content = content.replace(regex, String(value || ''));
  }
  
  document.value.content = content;
};

const handleAutoFill = async () => {
  autoFilling.value = true;
  try {
    // TODO: 调用自动填充API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟自动填充
    filledVariables.value = {
      kindergarten_name: '阳光幼儿园',
      kindergarten_address: '北京市朝阳区XX街道XX号',
      principal_name: '张园长',
      inspection_date: new Date().toISOString().split('T')[0],
      teacher_count: 25,
      student_count: 150
    };
    
    updateContentWithVariables();
    ElMessage.success('自动填充成功');
  } catch (error) {
    ElMessage.error('自动填充失败');
  } finally {
    autoFilling.value = false;
  }
};

const handleAIAssist = () => {
  ElMessage.info('AI辅助功能开发中...');
};

const handleSaveDraft = async () => {
  saving.value = true;
  try {
    // TODO: 调用保存API
    await new Promise(resolve => setTimeout(resolve, 500));
    ElMessage.success('保存成功');
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};

const scheduleAutoSave = () => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value);
  }
  
  autoSaveTimer.value = setTimeout(() => {
    handleSaveDraft();
  }, 3000); // 3秒后自动保存
};

const handlePreview = () => {
  previewVisible.value = true;
};

const handleSubmit = async () => {
  if (unfilledCount.value > 0) {
    ElMessage.warning(`还有 ${unfilledCount.value} 个必填变量未填写`);
    return;
  }
  
  try {
    await ElMessageBox.confirm('确定要提交文档吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    // TODO: 调用提交API
    document.value.status = 'review';
    ElMessage.success('提交成功');
    router.back();
  } catch (error) {
    // 用户取消
  }
};

const handleExport = () => {
  ElMessage.info('导出功能开发中...');
};

const handleInsertTable = () => {
  const table = '\n\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |\n\n';
  document.value.content += table;
};

const handleInsertList = () => {
  const list = '\n\n- 列表项1\n- 列表项2\n- 列表项3\n\n';
  document.value.content += list;
};

const handleInsertImage = () => {
  const image = '\n\n![图片描述](图片URL)\n\n';
  document.value.content += image;
};

const handleFormat = () => {
  // TODO: 实现格式化功能
  ElMessage.info('格式化功能开发中...');
};

// 加载数据
const loadTemplate = async () => {
  try {
    const id = route.params.id as string;
    const response = await getTemplateById(id);
    if (response.success) {
      template.value = response.data;
      document.value.content = template.value.templateContent;
      document.value.templateId = template.value.id;
      document.value.title = template.value.name;
    }
  } catch (error) {
    console.error('加载模板失败:', error);
    ElMessage.error('加载模板失败');
  }
};

onMounted(() => {
  loadTemplate();
});

onBeforeUnmount(() => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value);
  }
});
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
.document-editor {
  padding: var(--text-2xl);
  height: calc(100vh - var(--spacing-3xl));
  display: flex;
  flex-direction: column;

  .page-header {
    margin-bottom: var(--text-2xl);

    .page-title {
      font-size: var(--text-xl);
      font-weight: bold;
    }
  }

  .editor-container {
    flex: 1;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;

    .editor-card {
      height: 100%;
      display: flex;
      flex-direction: column;

      :deep(.el-card__body) {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .editor-wrapper {
        flex: 1;
        overflow: hidden;

        .markdown-editor {
          width: 100%;
          height: 100%;
          padding: var(--text-lg);
          border: var(--border-width-base) solid var(--border-color);
          border-radius: var(--spacing-xs);
          font-family: var(--font-mono);
          font-size: var(--text-base);
          line-height: 1.6;
          resize: none;

          &:focus {
            outline: none;
            border-color: var(--primary-color);
          }
        }
      }
    }

    .variables-card,
    .shortcuts-card {
      margin-bottom: var(--text-2xl);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .variable-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }

  // 新增的样式类
  .progress-bar {
    max-width: 150px; width: 100%;
  }

  .variables-scrollbar {
    min-height: 60px; height: auto;
  }

  .full-width-input {
    width: 100%;
  }

  .shortcuts-space {
    width: 100%;
  }

  .full-width-button {
    width: 100%;
  }

  .preview-dialog {
    width: 80%;
  }

  .preview-content {
    padding: var(--spacing-8xl);
    background: white;
    border: var(--border-width-base) solid var(--border-light);
    border-radius: var(--spacing-xs);
    min-min-height: 60px; height: auto;
    max-min-height: 60px; height: auto;
    overflow-y: auto;

    :deep(h1) {
      font-size: var(--text-3xl);
      margin-bottom: var(--text-lg);
      border-bottom: var(--border-width-base) solid var(--border-light);
      padding-bottom: var(--spacing-sm);
    }

    :deep(h2) {
      font-size: var(--text-2xl);
      margin: var(--text-2xl) 0 var(--text-sm);
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: var(--text-lg) 0;

      th, td {
        border: var(--border-width-base) solid var(--border-light);
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
</style>
