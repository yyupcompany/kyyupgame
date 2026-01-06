<template>
  <div class="script-templates-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>话术模板管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建话术
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="分类">
          <el-select v-model="queryParams.category" placeholder="全部分类" clearable @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="问候语" value="greeting" />
            <el-option label="介绍话术" value="introduction" />
            <el-option label="常见问答" value="qa" />
            <el-option label="邀约话术" value="invitation" />
            <el-option label="结束语" value="closing" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索关键词"
            clearable
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="stat in categoryStats" :key="stat.category">
        <el-card class="stat-card">
          <div class="stat-title">{{ getCategoryLabel(stat.category) }}</div>
          <div class="stat-value">{{ stat.count }}</div>
          <div class="stat-detail">
            使用次数: {{ stat.totalUsage }} | 成功率: {{ stat.avgSuccessRate }}%
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 话术列表 -->
    <el-card class="table-card">
      <el-table
        :data="templateList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="话术标题" min-width="150" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)">
              {{ getCategoryLabel(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="keywords" label="关键词" min-width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="话术内容" min-width="250" show-overflow-tooltip />
        <el-table-column prop="priority" label="优先级" width="100" sortable>
          <template #default="{ row }">
            <el-rate v-model="row.priority" disabled :max="10" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="inactive"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="usageCount" label="使用次数" width="100" sortable />
        <el-table-column prop="successRate" label="成功率" width="100" sortable>
          <template #default="{ row }">
            {{ row.successRate }}%
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleTest(row)">测试</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div class="batch-actions" v-if="selectedIds.length > 0">
        <el-button type="danger" @click="handleBatchDelete">
          批量删除 ({{ selectedIds.length }})
        </el-button>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleQuery"
        @current-change="handleQuery"
      />
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="话术标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入话术标题" />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类">
            <el-option label="问候语" value="greeting" />
            <el-option label="介绍话术" value="introduction" />
            <el-option label="常见问答" value="qa" />
            <el-option label="邀约话术" value="invitation" />
            <el-option label="结束语" value="closing" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="关键词" prop="keywords">
          <el-input
            v-model="formData.keywords"
            type="textarea"
            :rows="2"
            placeholder="请输入关键词，多个关键词用逗号分隔，例如：你好,您好,喂"
          />
          <div class="form-tip">多个关键词用逗号分隔，用于匹配客户的语音输入</div>
        </el-form-item>

        <el-form-item label="话术内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="6"
            placeholder="请输入话术内容"
          />
          <div class="form-tip">这是AI将要说的话，请确保语言自然流畅</div>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-slider v-model="formData.priority" :min="1" :max="10" show-stops />
          <div class="form-tip">优先级越高，匹配时越优先使用（1-10）</div>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 测试对话框 -->
    <el-dialog v-model="testDialogVisible" title="测试话术匹配" width="600px">
      <el-form>
        <el-form-item label="测试输入">
          <el-input
            v-model="testInput"
            placeholder="请输入客户可能说的话"
            @keyup.enter="handleTestMatch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleTestMatch">测试匹配</el-button>
        </el-form-item>
      </el-form>

      <div v-if="testResult" class="test-result">
        <el-alert
          :title="`匹配得分: ${testResult.score}`"
          :type="testResult.score > 5 ? 'success' : 'warning'"
          :closable="false"
        />
        <div class="matched-keywords" v-if="testResult.matchedKeywords.length > 0">
          <strong>匹配的关键词:</strong>
          <el-tag v-for="kw in testResult.matchedKeywords" :key="kw" style="margin-left: var(--spacing-base)">
            {{ kw }}
          </el-tag>
        </div>
        <div class="matched-content" v-if="testResult.template">
          <strong>匹配的话术:</strong>
          <p>{{ testResult.template.content }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import {
  getScriptTemplates,
  createScriptTemplate,
  updateScriptTemplate,
  deleteScriptTemplate,
  batchDeleteScriptTemplates,
  matchScriptTemplate,
  getScriptCategoryStats,
  type ScriptTemplate,
  type ScriptTemplateQuery,
  type ScriptTemplateForm,
  type ScriptMatchResult
} from '@/api/endpoints/script-template';

// 查询参数
const queryParams = reactive<ScriptTemplateQuery>({
  page: 1,
  pageSize: 10,
  category: '',
  status: '',
  keyword: ''
});

// 列表数据
const templateList = ref<ScriptTemplate[]>([]);
const total = ref(0);
const loading = ref(false);
const selectedIds = ref<number[]>([]);

// 统计数据
const categoryStats = ref<any[]>([]);

// 对话框
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref<FormInstance>();
const formData = reactive<ScriptTemplateForm>({
  title: '',
  category: '',
  keywords: '',
  content: '',
  priority: 5,
  status: 'active'
});
const submitting = ref(false);
const editingId = ref<number | null>(null);

// 测试对话框
const testDialogVisible = ref(false);
const testInput = ref('');
const testResult = ref<ScriptMatchResult | null>(null);
const testingTemplateId = ref<number | null>(null);

// 表单验证规则
const formRules: FormRules = {
  title: [{ required: true, message: '请输入话术标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  keywords: [{ required: true, message: '请输入关键词', trigger: 'blur' }],
  content: [{ required: true, message: '请输入话术内容', trigger: 'blur' }]
};

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    greeting: '问候语',
    introduction: '介绍话术',
    qa: '常见问答',
    invitation: '邀约话术',
    closing: '结束语',
    other: '其他'
  };
  return labels[category] || category;
};

// 获取分类标签类型
const getCategoryTagType = (category: string) => {
  const types: Record<string, any> = {
    greeting: 'success',
    introduction: 'primary',
    qa: 'info',
    invitation: 'warning',
    closing: 'danger',
    other: ''
  };
  return types[category] || '';
};

// 加载列表
const loadTemplates = async () => {
  loading.value = true;
  try {
    const res = await getScriptTemplates(queryParams);
    templateList.value = res.data.items;
    total.value = res.data.total;
  } catch (error) {
    ElMessage.error('加载话术模板失败');
  } finally {
    loading.value = false;
  }
};

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getScriptCategoryStats();
    categoryStats.value = res.data;
  } catch (error) {
    console.error('加载统计数据失败', error);
  }
};

// 查询
const handleQuery = () => {
  queryParams.page = 1;
  loadTemplates();
};

// 重置
const handleReset = () => {
  queryParams.category = '';
  queryParams.status = '';
  queryParams.keyword = '';
  handleQuery();
};

// 创建
const handleCreate = () => {
  dialogTitle.value = '新建话术';
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: ScriptTemplate) => {
  dialogTitle.value = '编辑话术';
  editingId.value = row.id;
  Object.assign(formData, {
    title: row.title,
    category: row.category,
    keywords: row.keywords,
    content: row.content,
    priority: row.priority,
    status: row.status
  });
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row: ScriptTemplate) => {
  try {
    await ElMessageBox.confirm(`确定要删除话术"${row.title}"吗？`, '提示', {
      type: 'warning'
    });
    await deleteScriptTemplate(row.id);
    ElMessage.success('删除成功');
    loadTemplates();
    loadStats();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条话术吗？`, '提示', {
      type: 'warning'
    });
    await batchDeleteScriptTemplates(selectedIds.value);
    ElMessage.success('批量删除成功');
    selectedIds.value = [];
    loadTemplates();
    loadStats();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败');
    }
  }
};

// 状态切换
const handleStatusChange = async (row: ScriptTemplate) => {
  try {
    await updateScriptTemplate(row.id, {
      title: row.title,
      category: row.category,
      keywords: row.keywords,
      content: row.content,
      priority: row.priority,
      status: row.status
    });
    ElMessage.success('状态更新成功');
  } catch (error) {
    ElMessage.error('状态更新失败');
    // 恢复原状态
    row.status = row.status === 'active' ? 'inactive' : 'active';
  }
};

// 选择变化
const handleSelectionChange = (selection: ScriptTemplate[]) => {
  selectedIds.value = selection.map(item => item.id);
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    submitting.value = true;
    try {
      if (editingId.value) {
        await updateScriptTemplate(editingId.value, formData);
        ElMessage.success('更新成功');
      } else {
        await createScriptTemplate(formData);
        ElMessage.success('创建成功');
      }
      dialogVisible.value = false;
      loadTemplates();
      loadStats();
    } catch (error) {
      ElMessage.error(editingId.value ? '更新失败' : '创建失败');
    } finally {
      submitting.value = false;
    }
  });
};

// 测试话术
const handleTest = (row: ScriptTemplate) => {
  testingTemplateId.value = row.id;
  testInput.value = '';
  testResult.value = null;
  testDialogVisible.value = true;
};

// 测试匹配
const handleTestMatch = async () => {
  if (!testInput.value.trim()) {
    ElMessage.warning('请输入测试内容');
    return;
  }
  
  try {
    const res = await matchScriptTemplate({
      userInput: testInput.value,
      category: testingTemplateId.value ? undefined : undefined
    });
    testResult.value = res.data;
  } catch (error) {
    ElMessage.error('测试失败');
  }
};

// 重置表单
const resetForm = () => {
  formData.title = '';
  formData.category = '';
  formData.keywords = '';
  formData.content = '';
  formData.priority = 5;
  formData.status = 'active';
  formRef.value?.clearValidate();
};

// 对话框关闭
const handleDialogClose = () => {
  resetForm();
};

// 初始化
onMounted(() => {
  loadTemplates();
  loadStats();
});
</script>

<style scoped lang="scss">
.script-templates-container {
  padding: var(--text-2xl);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h2 {
      margin: 0;
      font-size: var(--text-3xl);
      font-weight: 600;
    }
  }

  .filter-card {
    margin-bottom: var(--text-2xl);
  }

  .stats-row {
    margin-bottom: var(--text-2xl);

    .stat-card {
      text-align: center;

      .stat-title {
        font-size: var(--text-base);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-2xl);
      }

      .stat-value {
        font-size: var(--spacing-3xl);
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: var(--spacing-2xl);
      }

      .stat-detail {
        font-size: var(--text-sm);
        color: var(--text-tertiary);
      }
    }
  }

  .table-card {
    .batch-actions {
      margin: var(--spacing-4xl) 0;
    }

    .el-pagination {
      margin-top: var(--text-2xl);
      justify-content: flex-end;
    }
  }

  .form-tip {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin-top: var(--spacing-base);
  }

  .test-result {
    margin-top: var(--text-2xl);

    .matched-keywords {
      margin: var(--spacing-4xl) 0;
    }

    .matched-content {
      margin-top: var(--spacing-4xl);
      padding: var(--spacing-4xl);
      background: var(--bg-hover);
      border-radius: var(--spacing-xs);

      p {
        margin: var(--spacing-2xl) 0 0;
        line-height: 1.6;
      }
    }
  }
}
</style>

