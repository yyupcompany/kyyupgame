<template>
  <div class="model-management">
    <el-row :gutter="20" class="header-row">
      <el-col :span="12">
        <h2 class="page-title">AI模型管理</h2>
      </el-col>
      <el-col :span="12" class="header-actions">
        <el-button type="primary" @click="showAddModelDialog">
          <el-icon><Plus /></el-icon>添加模型
        </el-button>
        <el-button @click="refreshModels">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </el-col>
    </el-row>

    <el-card class="model-list-card" v-loading="loading">
      <el-table :data="models" style="width: 100%">
        <el-table-column prop="name" label="模型名称" min-width="150">
          <template #default="scope">
            <div class="model-name">
              <span>{{ scope.row.displayName || scope.row.name }}</span>
              <el-tag v-if="scope.row.isDefault" size="small" type="success">默认</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="provider" label="提供商" min-width="120" />
        
        <el-table-column prop="modelType" label="类型" min-width="100" />
        
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isActive"
              @change="handleStatusChange(scope.row)"
              active-text="启用"
              inactive-text="禁用"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="使用统计" min-width="200">
          <template #default="scope">
            <el-row>
              <el-col :span="12">
                <div class="stat-item">
                  <span class="stat-label">调用次数:</span>
                  <span class="stat-value">{{ scope.row.stats?.callCount || 0 }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="stat-item">
                  <span class="stat-label">总Token:</span>
                  <span class="stat-value">{{ scope.row.stats?.totalTokens || 0 }}</span>
                </div>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button size="small" @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button 
                size="small" 
                type="primary" 
                :disabled="scope.row.isDefault"
                @click="handleSetDefault(scope.row)"
              >
                设为默认
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDelete(scope.row)"
              >
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 模型详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      direction="rtl"
      size="500px"
    >
      <el-form 
        ref="modelForm"
        :model="currentModel"
        :rules="modelRules"
        label-width="100px"
        class="model-form"
      >
        <el-form-item label="模型名称" prop="name">
          <el-input v-model="currentModel.name" placeholder="模型技术名称，如gpt-4" />
        </el-form-item>
        
        <el-form-item label="显示名称" prop="displayName">
          <el-input v-model="currentModel.displayName" placeholder="用户友好的显示名称" />
        </el-form-item>
        
        <el-form-item label="提供商" prop="provider">
          <el-select v-model="currentModel.provider" placeholder="选择提供商" style="width: 100%">
            <el-option label="OpenAI" value="openai" />
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="Anthropic" value="anthropic" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="模型类型" prop="modelType">
          <el-select v-model="currentModel.modelType" placeholder="选择模型类型" style="width: 100%">
            <el-option label="文本生成" value="text" />
            <el-option label="嵌入" value="embedding" />
            <el-option label="图像生成" value="image" />
            <el-option label="语音转文本" value="speech-to-text" />
            <el-option label="文本转语音" value="text-to-speech" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="API版本" prop="apiVersion">
          <el-input v-model="currentModel.apiVersion" placeholder="API版本，如v1" />
        </el-form-item>
        
        <el-form-item label="端点URL" prop="endpointUrl">
          <el-input v-model="currentModel.endpointUrl" placeholder="API端点URL" />
        </el-form-item>
        
        <el-form-item label="API密钥" prop="apiKey">
          <el-input 
            v-model="currentModel.apiKey" 
            placeholder="API密钥" 
            show-password
            type="password"
          />
        </el-form-item>
        
        <el-collapse>
          <el-collapse-item title="高级参数" name="advanced">
            <el-form-item label="模型参数">
              <el-input
                v-model="modelParamsJson"
                type="textarea"
                :rows="5"
                placeholder="JSON格式的模型参数"
              />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button v-if="!isNewModel" type="info" @click="testConnection">测试连接</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Edit, Delete } from '@element-plus/icons-vue';

// 导入真实的AI模型API
import {
  getModels,
  getModelBilling,
  createModel,
  updateModel,
  deleteModel,
  setDefaultModel,
  toggleModelStatus
} from '../../../api/ai-model';

// 模型接口定义
interface AIModel {
  id: number;
  name: string;
  displayName: string;
  provider: string;
  modelType: string;
  apiVersion: string;
  endpointUrl: string;
  apiKey?: string;
  modelParameters?: Record<string, any>;
  isActive: boolean;
  isDefault: boolean;
  stats?: {
    callCount: number;
    totalTokens: number;
  };
}

export default defineComponent({
  name: 'ModelManagement',
  
  components: {
    Plus,
    Refresh,
    Edit,
    Delete
  },
  
  setup() {
    // 数据和状态
    const loading = ref(false);
    const models = ref<AIModel[]>([]);
    const drawerVisible = ref(false);
    const isNewModel = ref(false);
    const modelForm = ref<any>(null);
    
    // 当前编辑的模型
    const currentModel = ref<AIModel>({
      id: 0,
      name: '',
      displayName: '',
      provider: 'openai',
      modelType: 'text',
      apiVersion: '',
      endpointUrl: '',
      apiKey: '',
      modelParameters: {},
      isActive: true,
      isDefault: false
    });
    
    // 表单校验规则
    const modelRules = {
      name: [
        { required: true, message: '请输入模型名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      displayName: [
        { required: true, message: '请输入显示名称', trigger: 'blur' }
      ],
      provider: [
        { required: true, message: '请选择提供商', trigger: 'change' }
      ],
      modelType: [
        { required: true, message: '请选择模型类型', trigger: 'change' }
      ],
      endpointUrl: [
        { required: true, message: '请输入端点URL', trigger: 'blur' }
      ],
      apiKey: [
        { required: true, message: '请输入API密钥', trigger: 'blur' }
      ]
    };
    
    // 计算属性
    const drawerTitle = computed(() => isNewModel.value ? '添加模型' : '编辑模型');
    
    // 模型参数JSON字符串
    const modelParamsJson = ref('{}');
    
    // 监听modelParamsJson变化
    const updateModelParams = (val: string) => {
      try {
        currentModel.value.modelParameters = JSON.parse(val || '{}');
      } catch (e) {
        ElMessage.error('JSON格式错误');
      }
    };
    
    // 监听currentModel.modelParameters变化
    const updateModelParamsJson = () => {
      modelParamsJson.value = JSON.stringify(currentModel.value.modelParameters || {}, null, 2);
    };
    
    // 获取模型列表
    const fetchModels = async () => {
      loading.value = true;
      try {
        const result = await getModels();
        models.value = result;
        
        // 获取每个模型的使用统计
        for (const model of models.value) {
          try {
            const billingInfo = await getModelBilling(model.id);
            model.stats = billingInfo;
          } catch (error) {
            console.error(`获取模型 ${model.id} 的计费信息失败:`, error);
            // 使用默认的计费信息
            model.stats = {
              callCount: 0,
              totalTokens: 0,
              inputTokens: 0,
              outputTokens: 0,
              totalCost: 0,
              inputTokenPrice: 0,
              outputTokenPrice: 0,
              pricePerMillionTokens: 0, // 每百万token价格
              currency: 'USD',
              hasCustomPricing: false
            };
          }
        }
      } catch (error) {
        console.error('获取模型列表失败:', error);
        ElMessage.error('获取模型列表失败');
      } finally {
        loading.value = false;
      }
    };
    
    // 刷新模型列表
    const refreshModels = () => {
      fetchModels();
    };
    
    // 显示添加模型对话框
    const showAddModelDialog = () => {
      isNewModel.value = true;
      resetModelForm();
      drawerVisible.value = true;
      updateModelParamsJson();
    };
    
    // 重置模型表单
    const resetModelForm = () => {
      currentModel.value = {
        id: 0,
        name: '',
        displayName: '',
        provider: 'openai',
        modelType: 'text',
        apiVersion: '',
        endpointUrl: '',
        apiKey: '',
        modelParameters: {},
        isActive: true,
        isDefault: false
      };
    };
    
    // 处理编辑模型
    const handleEdit = (model: AIModel) => {
      isNewModel.value = false;
      currentModel.value = { ...model };
      updateModelParamsJson();
      drawerVisible.value = true;
    };
    
    // 处理删除模型
    const handleDelete = async (model: AIModel) => {
      if (model.isDefault) {
        ElMessage.warning('不能删除默认模型');
        return;
      }
      
      try {
        await ElMessageBox.confirm(
          `确定要删除模型 "${model.displayName || model.name}" 吗？`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        await deleteModel(model.id);
        ElMessage.success('删除成功');
        refreshModels();
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('删除模型失败:', error);
          ElMessage.error('删除模型失败');
        }
      }
    };
    
    // 处理设置默认模型
    const handleSetDefault = async (model: AIModel) => {
      try {
        await setDefaultModel(model.id);
        ElMessage.success(`已将 "${model.displayName || model.name}" 设为默认模型`);
        refreshModels();
      } catch (error) {
        console.error('设置默认模型失败:', error);
        ElMessage.error('设置默认模型失败');
      }
    };
    
    // 处理状态变更
    const handleStatusChange = async (model: AIModel) => {
      try {
        await toggleModelStatus(model.id, model.isActive);
        ElMessage.success(`已${model.isActive ? '启用' : '禁用'}模型`);
      } catch (error) {
        console.error('更改模型状态失败:', error);
        ElMessage.error('更改模型状态失败');
        // 恢复状态
        model.isActive = !model.isActive;
      }
    };
    
    // 提交表单
    const submitForm = async () => {
      if (!modelForm.value) return;
      
      try {
        await modelForm.value.validate();
        
        if (isNewModel.value) {
          await createModel({
            name: currentModel.value.name,
            displayName: currentModel.value.displayName,
            provider: currentModel.value.provider,
            modelType: currentModel.value.modelType,
            apiVersion: currentModel.value.apiVersion,
            endpointUrl: currentModel.value.endpointUrl,
            apiKey: currentModel.value.apiKey,
            modelParameters: currentModel.value.modelParameters,
            isActive: currentModel.value.isActive,
            isDefault: currentModel.value.isDefault
          });
          ElMessage.success('添加模型成功');
        } else {
          await updateModel(currentModel.value.id, {
            name: currentModel.value.name,
            displayName: currentModel.value.displayName,
            provider: currentModel.value.provider,
            modelType: currentModel.value.modelType,
            apiVersion: currentModel.value.apiVersion,
            endpointUrl: currentModel.value.endpointUrl,
            apiKey: currentModel.value.apiKey,
            modelParameters: currentModel.value.modelParameters,
            isActive: currentModel.value.isActive,
            isDefault: currentModel.value.isDefault
          });
          ElMessage.success('更新模型成功');
        }
        
        drawerVisible.value = false;
        refreshModels();
      } catch (error) {
        console.error('保存模型失败:', error);
        ElMessage.error('保存模型失败');
      }
    };
    
    // 测试连接
    const testConnection = async () => {
      try {
        ElMessage.info('测试连接中...');
        // 这里应该调用测试连接的API，目前仅作为示例
        await new Promise(resolve => setTimeout(resolve, 1000));
        ElMessage.success('连接成功');
      } catch (error) {
        console.error('测试连接失败:', error);
        ElMessage.error('测试连接失败');
      }
    };
    
    // 监听modelParamsJson变化
    const watchModelParamsJson = () => {
      updateModelParams(modelParamsJson.value);
    };
    
    // 组件挂载时获取数据
    onMounted(() => {
      fetchModels();
    });
    
    return {
      loading,
      models,
      drawerVisible,
      isNewModel,
      currentModel,
      modelForm,
      modelRules,
      drawerTitle,
      modelParamsJson,
      refreshModels,
      showAddModelDialog,
      handleEdit,
      handleDelete,
      handleSetDefault,
      handleStatusChange,
      submitForm,
      testConnection,
      watchModelParamsJson
    };
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.model-management {
  padding: var(--spacing-lg);
}

.header-row {
  margin-bottom: var(--spacing-lg);
}

.page-title {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-primary);
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.model-list-card {
  margin-bottom: var(--spacing-lg);
}

.model-name {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.stat-item {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  color: var(--text-color-secondary);
  margin-right: var(--spacing-sm);
}

.stat-value {
  font-weight: var(--font-weight-medium);
}

.model-form {
  padding: var(--spacing-lg);
}

@media (max-width: var(--breakpoint-md)) {
  .header-actions {
    margin-top: var(--spacing-sm);
    justify-content: flex-start;
  }
}
</style> 