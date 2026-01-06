<template>
  <div class="chat-settings">
    <div class="settings-overlay" @click="$emit('close')"></div>
    <div class="settings-panel">
      <div class="settings-header">
        <h3>AI助手设置</h3>
        <el-button type="text" :icon="Close" @click="$emit('close')" title="关闭" />
      </div>
      
      <div class="settings-body">
        <el-form 
          :model="form" 
          label-position="top" 
          class="settings-form"
          ref="formRef"
        >
          <el-form-item label="AI模型">
            <el-select 
              v-model="form.modelId"
              placeholder="选择AI模型"
              class="w-full"
            >
              <el-option
                v-for="model in availableModels"
                :key="model.id"
                :label="model.displayName"
                :value="model.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item 
            v-if="selectedModel" 
            label="上下文窗口大小" 
            class="slider-item"
          >
            <div class="slider-container">
              <div class="slider-value">{{ form.contextWindow }} tokens</div>
              <el-slider 
                v-model="form.contextWindow"
                :min="1024"
                :max="selectedModel.maxContextWindow"
                :step="512"
                show-stops
              />
            </div>
            <div class="setting-description">
              上下文窗口决定AI能记住的对话历史长度
            </div>
          </el-form-item>
          
          <el-form-item 
            v-if="selectedModel" 
            label="最大回复长度" 
            class="slider-item"
          >
            <div class="slider-container">
              <div class="slider-value">{{ form.maxTokens }} tokens</div>
              <el-slider 
                v-model="form.maxTokens"
                :min="256"
                :max="selectedModel.maxOutputTokens"
                :step="256"
                show-stops
              />
            </div>
            <div class="setting-description">
              控制AI回复的最大长度
            </div>
          </el-form-item>
          
          <el-form-item label="高级选项">
            <el-collapse>
              <el-collapse-item title="模型参数">
                <el-form-item label="Temperature" class="slider-item">
                  <div class="slider-container">
                    <div class="slider-value">{{ form.temperature.toFixed(1) }}</div>
                    <el-slider 
                      v-model="form.temperature"
                      :min="0"
                      :max="1"
                      :step="0.1"
                      show-stops
                    />
                  </div>
                  <div class="setting-description">
                    较低的值使回答更精确，较高的值使回答更有创造性
                  </div>
                </el-form-item>
                
                <el-form-item label="Top P" class="slider-item">
                  <div class="slider-container">
                    <div class="slider-value">{{ form.topP.toFixed(1) }}</div>
                    <el-slider 
                      v-model="form.topP"
                      :min="0"
                      :max="1"
                      :step="0.1"
                      show-stops
                    />
                  </div>
                  <div class="setting-description">
                    控制回答的多样性
                  </div>
                </el-form-item>
              </el-collapse-item>
            </el-collapse>
          </el-form-item>
          
          <el-form-item>
            <div class="settings-actions">
              <el-button 
                @click="restoreDefaults"
              >
                恢复默认值
              </el-button>
              <el-button 
                type="primary" 
                @click="saveSettings"
              >
                保存设置
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, PropType } from 'vue';
import { Close } from '@element-plus/icons-vue';
import { useStore } from '../../store';

// 定义模型类型
interface AIModel {
  id: number;
  modelName: string;
  displayName: string;
  maxContextWindow: number;
  maxOutputTokens: number;
}

// 定义设置类型
interface ModelConfig {
  modelId: number;
  modelName: string;
  contextWindow: number;
  maxTokens: number;
  temperature?: number;
  topP?: number;
}

export default defineComponent({
  name: 'ChatSettings',
  
  props: {
    modelConfig: {
      type: Object as PropType<ModelConfig>,
      required: true
    }
  },
  
  emits: ['close', 'settings-changed'],
  
  setup(props, { emit }) {
    const store = useStore();
    const formRef = ref(null);
    
    // 表单数据
    const form = ref({
      modelId: props.modelConfig.modelId,
      contextWindow: props.modelConfig.contextWindow,
      maxTokens: props.modelConfig.maxTokens,
      temperature: 0.7, // 默认值
      topP: 0.9 // 默认值
    });
    
    // 可用模型列表
    const availableModels = ref<AIModel[]>([]);
    
    // 加载模型列表
    const loadModels = async () => {
      try {
        const models = await store.ai.getModelList();
        availableModels.value = models.map((model: any) => ({
          id: model.id,
          modelName: model.modelName,
          displayName: model.displayName,
          maxContextWindow: model.contextWindow,
          maxOutputTokens: model.maxTokens
        }));
      } catch (error) {
        console.error('加载模型列表失败:', error);
        // 使用默认模型列表
        availableModels.value = [
          {
            id: 1,
            modelName: 'default-ai',
            displayName: '默认AI模型',
            maxContextWindow: 4096,
            maxOutputTokens: 2048
          }
        ];
      }
    };
    
    // 当前选中的模型
    const selectedModel = computed(() => {
      return availableModels.value.find(model => model.id === form.value.modelId);
    });
    
    // 监听模型ID变化，更新最大Token
    watch(() => form.value.modelId, () => {
      if (selectedModel.value) {
        form.value.contextWindow = Math.min(
          form.value.contextWindow, 
          selectedModel.value.maxContextWindow
        );
        form.value.maxTokens = Math.min(
          form.value.maxTokens, 
          selectedModel.value.maxOutputTokens
        );
      }
    });
    
    // 恢复默认值
    const restoreDefaults = () => {
      form.value = {
        modelId: availableModels.value.length > 0 ? availableModels.value[0].id : 1,
        contextWindow: 4096,
        maxTokens: 2048,
        temperature: 0.7,
        topP: 0.9
      };
    };
    
    // 保存设置
    const saveSettings = () => {
      if (!selectedModel.value) return;
      
      // 创建新的配置对象
      const newConfig: ModelConfig = {
        modelId: form.value.modelId,
        modelName: selectedModel.value.modelName,
        contextWindow: form.value.contextWindow,
        maxTokens: form.value.maxTokens,
        temperature: form.value.temperature,
        topP: form.value.topP
      };
      
      // 发送设置变更事件
      emit('settings-changed', newConfig);
    };
    
    // 组件挂载时加载模型
    onMounted(() => {
      loadModels();
    });
    
    return {
      form,
      formRef,
      availableModels,
      selectedModel,
      restoreDefaults,
      saveSettings,
      // 图标
      Close
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.chat-settings {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-fixed);
  
  .settings-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--overlay-bg, var(--black-alpha-50));
    z-index: var(--z-index-dropdown);
  }
  
  .settings-panel {
    position: relative;
    width: 100%; max-width: 500px;
    max-width: 90%;
    max-height: 90vh;
    background-color: var(--el-bg-color);
    border-radius: var(--spacing-sm);
    box-shadow: var(--shadow-lg);
    z-index: var(--transform-drop);
    display: flex;
    flex-direction: column;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  
  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--text-base) var(--text-3xl);
    border-bottom: var(--z-index-dropdown) solid var(--el-border-color-light);
    
    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  
  .settings-body {
    flex: 1;
    padding: var(--spacing-xl);
    overflow-y: auto;
  }
  
  .settings-form {
    .el-form-item {
      margin-bottom: var(--spacing-xl);
    }
    
    .slider-item {
      .slider-container {
        display: flex;
        align-items: center;
        margin-bottom: var(--spacing-sm);
        
        .el-slider {
          flex: 1;
          margin-right: var(--text-lg);
        }
        
        .slider-value {
          min-width: auto;
          text-align: right;
          font-size: var(--text-xs);
          color: var(--el-text-color-secondary);
        }
      }
      
      .setting-description {
        font-size: var(--text-xs);
        color: var(--el-text-color-secondary);
        line-height: 1.4;
      }
    }
    
    .settings-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--text-xs);
      margin-top: var(--text-3xl);
    }
  }
}

.w-full {
  width: 100%;
}
</style> 