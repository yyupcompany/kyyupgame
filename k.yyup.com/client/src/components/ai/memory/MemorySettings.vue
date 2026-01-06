<!--
  AI记忆设置管理组件
  提供记忆归档、清理等高级功能
-->
<template>
  <div class="memory-settings">
    <!-- 记忆归档设置 -->
    <el-card class="setting-card">
      <template #header>
        <div class="card-header">
          <UnifiedIcon name="default" />
          <span>记忆归档管理</span>
        </div>
      </template>
      
      <div class="setting-content">
        <p class="setting-description">
          将重要的短期记忆归档为长期记忆，以便长期保存。
        </p>
        
        <el-form :model="archiveForm" label-width="120px">
          <el-form-item label="记忆ID">
            <el-input 
              v-model="archiveForm.memoryId" 
              placeholder="请输入要归档的记忆ID"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="归档原因">
            <el-input 
              v-model="archiveForm.reason" 
              type="textarea" 
              placeholder="请输入归档原因（可选）"
              :rows="3"
            />
          </el-form-item>
          
          <el-form-item label="保留期限">
            <el-input-number 
              v-model="archiveForm.retentionPeriod" 
              :min="1" 
              :max="3650"
              placeholder="天数"
            />
            <span class="form-tip">天（1-3650天）</span>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleArchive"
              :loading="archiveLoading"
            >
              <UnifiedIcon name="Upload" />
              归档记忆
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 过期记忆清理 -->
    <el-card class="setting-card">
      <template #header>
        <div class="card-header">
          <UnifiedIcon name="Delete" />
          <span>过期记忆清理</span>
        </div>
      </template>
      
      <div class="setting-content">
        <p class="setting-description">
          清理过期的记忆以释放存储空间。建议定期执行此操作。
        </p>
        
        <el-form :model="cleanupForm" label-width="120px">
          <el-form-item label="清理范围">
            <el-input-number 
              v-model="cleanupForm.daysOld" 
              :min="1" 
              :max="365"
              placeholder="天数"
            />
            <span class="form-tip">天前的记忆</span>
          </el-form-item>
          
          <el-form-item label="记忆类型">
            <el-select v-model="cleanupForm.memoryType" placeholder="选择要清理的记忆类型">
              <el-option label="所有类型" value="" />
              <el-option label="短期记忆" value="short_term" />
              <el-option label="长期记忆" value="long_term" />
              <el-option label="工作记忆" value="working" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="执行模式">
            <el-switch 
              v-model="cleanupForm.dryRun"
              active-text="试运行"
              inactive-text="实际执行"
            />
            <span class="form-tip">试运行模式不会实际删除数据</span>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="danger" 
              @click="handleCleanup"
              :loading="cleanupLoading"
            >
              <UnifiedIcon name="Delete" />
              {{ cleanupForm.dryRun ? '预览清理' : '执行清理' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 记忆阈值设置 -->
    <el-card class="setting-card">
      <template #header>
        <div class="card-header">
          <UnifiedIcon name="default" />
          <span>记忆阈值设置</span>
        </div>
      </template>
      
      <div class="setting-content">
        <p class="setting-description">
          配置记忆管理的各种阈值参数。
        </p>
        
        <el-form :model="thresholdForm" label-width="140px">
          <el-form-item label="重要性阈值">
            <el-slider 
              v-model="thresholdForm.importanceThreshold" 
              :min="0" 
              :max="1" 
              :step="0.1"
              show-input
            />
            <span class="form-tip">低于此值的记忆将被标记为低重要性</span>
          </el-form-item>
          
          <el-form-item label="相似度阈值">
            <el-slider 
              v-model="thresholdForm.similarityThreshold" 
              :min="0" 
              :max="1" 
              :step="0.1"
              show-input
            />
            <span class="form-tip">用于相似记忆搜索的阈值</span>
          </el-form-item>
          
          <el-form-item label="短期记忆上限">
            <el-input-number 
              v-model="thresholdForm.shortTermLimit" 
              :min="10" 
              :max="1000"
            />
            <span class="form-tip">条</span>
          </el-form-item>
          
          <el-form-item label="长期记忆上限">
            <el-input-number 
              v-model="thresholdForm.longTermLimit" 
              :min="100" 
              :max="10000"
            />
            <span class="form-tip">条</span>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              @click="saveThresholds"
              :loading="thresholdLoading"
            >
              <UnifiedIcon name="Check" />
              保存设置
            </el-button>
            <el-button @click="resetThresholds">
              <UnifiedIcon name="Refresh" />
              重置默认
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  FolderOpened, 
  Delete, 
  Setting, 
  Upload, 
  Check, 
  RefreshLeft 
} from '@element-plus/icons-vue';

// Props
interface Props {
  userId: number;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  archive: [memoryId: string, options: any];
  cleanup: [options: any];
}>();

// 归档表单
const archiveForm = reactive({
  memoryId: '',
  reason: '',
  retentionPeriod: 365
});

// 清理表单
const cleanupForm = reactive({
  daysOld: 30,
  memoryType: '',
  dryRun: true
});

// 阈值表单
const thresholdForm = reactive({
  importanceThreshold: 0.5,
  similarityThreshold: 0.7,
  shortTermLimit: 100,
  longTermLimit: 1000
});

// 加载状态
const archiveLoading = ref(false);
const cleanupLoading = ref(false);
const thresholdLoading = ref(false);

// 处理记忆归档
const handleArchive = async () => {
  if (!archiveForm.memoryId.trim()) {
    ElMessage.warning('请输入记忆ID');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要将记忆 ${archiveForm.memoryId} 归档为长期记忆吗？`,
      '确认归档',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    archiveLoading.value = true;
    
    emit('archive', archiveForm.memoryId, {
      reason: archiveForm.reason,
      retentionPeriod: archiveForm.retentionPeriod
    });

    // 重置表单
    archiveForm.memoryId = '';
    archiveForm.reason = '';
    archiveForm.retentionPeriod = 365;
    
  } catch (error) {
    // 用户取消操作
  } finally {
    archiveLoading.value = false;
  }
};

// 处理过期记忆清理
const handleCleanup = async () => {
  const action = cleanupForm.dryRun ? '预览清理' : '执行清理';
  const message = cleanupForm.dryRun 
    ? `确定要预览清理 ${cleanupForm.daysOld} 天前的记忆吗？`
    : `确定要清理 ${cleanupForm.daysOld} 天前的记忆吗？此操作不可撤销！`;

  try {
    await ElMessageBox.confirm(message, `确认${action}`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: cleanupForm.dryRun ? 'info' : 'warning'
    });

    cleanupLoading.value = true;
    
    emit('cleanup', {
      daysOld: cleanupForm.daysOld,
      memoryType: cleanupForm.memoryType || undefined,
      dryRun: cleanupForm.dryRun
    });
    
  } catch (error) {
    // 用户取消操作
  } finally {
    cleanupLoading.value = false;
  }
};

// 保存阈值设置
const saveThresholds = async () => {
  try {
    thresholdLoading.value = true;
    
    // 这里应该调用API保存设置
    // await saveMemorySettings(props.userId, thresholdForm);
    
    ElMessage.success('设置保存成功');
  } catch (error) {
    ElMessage.error('设置保存失败');
  } finally {
    thresholdLoading.value = false;
  }
};

// 重置阈值设置
const resetThresholds = () => {
  thresholdForm.importanceThreshold = 0.5;
  thresholdForm.similarityThreshold = 0.7;
  thresholdForm.shortTermLimit = 100;
  thresholdForm.longTermLimit = 1000;
  
  ElMessage.success('已重置为默认设置');
};
</script>

<style lang="scss" scoped>
.memory-settings {
  padding: var(--spacing-lg);
}

.setting-card {
  margin-bottom: var(--text-3xl);

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: 600;
  }
}

.setting-content {
  .setting-description {
    color: var(--text-regular);
    margin-bottom: var(--spacing-xl);
    line-height: 1.6;
  }
}

.form-tip {
  margin-left: var(--spacing-sm);
  color: var(--info-color);
  font-size: var(--text-xs);
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-slider) {
  margin-right: var(--spacing-xl);
}
</style>
