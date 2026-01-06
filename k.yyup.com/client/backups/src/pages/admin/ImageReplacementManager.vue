<template>
  <div class="image-replacement-manager">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <h2>AI自动配图管理</h2>
          <p class="subtitle">使用豆包文生图模型替换项目中的展位图片</p>
        </div>
      </template>

      <!-- 服务状态 -->
      <div class="service-status">
        <el-alert
          v-if="serviceStatus.available"
          title="AI配图服务正常"
          :description="`当前使用模型: ${serviceStatus.model}`"
          type="success"
          :closable="false"
        />
        <el-alert
          v-else
          title="AI配图服务不可用"
          :description="serviceStatus.error || '请检查服务配置'"
          type="error"
          :closable="false"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          :icon="Refresh"
          @click="checkServiceStatus"
          :loading="checkingStatus"
        >
          检查服务状态
        </el-button>
        
        <el-button
          type="success"
          :icon="Picture"
          @click="scanImages"
          :disabled="!serviceStatus.available"
        >
          扫描展位图片
        </el-button>
        
        <el-button
          type="warning"
          :icon="MagicStick"
          @click="replaceAllImages"
          :disabled="!serviceStatus.available || selectedItems.length === 0"
          :loading="isReplacing"
        >
          批量替换选中图片
        </el-button>
      </div>
    </el-card>

    <!-- 进度显示 -->
    <el-card v-if="showProgress" class="progress-card">
      <template #header>
        <h3>替换进度</h3>
      </template>
      
      <div class="progress-info">
        <el-progress
          :percentage="progressPercentage"
          :status="progressStatus"
          :stroke-width="20"
        />
        
        <div class="progress-details">
          <p>总计: {{ progress.total }} 张</p>
          <p>已完成: {{ progress.completed }} 张</p>
          <p>成功: {{ progress.success }} 张</p>
          <p>失败: {{ progress.failed }} 张</p>
          <p v-if="progress.current">当前: {{ progress.current }}</p>
        </div>
      </div>
    </el-card>

    <!-- 图片列表 -->
    <el-card class="images-card">
      <template #header>
        <div class="card-header">
          <h3>待替换图片列表</h3>
          <div class="header-actions">
            <el-checkbox
              v-model="selectAll"
              @change="handleSelectAll"
              :indeterminate="isIndeterminate"
            >
              全选
            </el-checkbox>
            <span class="count-info">共 {{ imageItems.length }} 张图片</span>
          </div>
        </div>
      </template>

      <div v-if="imageItems.length === 0" class="empty-state">
        <el-empty description="暂无待替换的图片">
          <el-button type="primary" @click="scanImages">扫描图片</el-button>
        </el-empty>
      </div>

      <div v-else class="images-grid">
        <div
          v-for="item in imageItems"
          :key="item.id"
          class="image-item"
          :class="{ selected: selectedItems.includes(item.id) }"
        >
          <el-checkbox
            :model-value="selectedItems.includes(item.id)"
            @change="(checked) => handleItemSelect(item.id, checked)"
            class="item-checkbox"
          />
          
          <div class="image-preview">
            <el-image
              :src="item.currentImageUrl || '/placeholder.jpg'"
              fit="cover"
              class="preview-img"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>加载失败</span>
                </div>
              </template>
            </el-image>
          </div>
          
          <div class="item-info">
            <h4 class="item-title">{{ item.title }}</h4>
            <p class="item-description">{{ item.description }}</p>
            <div class="item-meta">
              <el-tag :type="getTypeTagType(item.type)" size="small">
                {{ getTypeLabel(item.type) }}
              </el-tag>
            </div>
          </div>
          
          <div class="item-actions">
            <el-button
              size="small"
              type="primary"
              @click="replaceItem(item)"
              :loading="item.isReplacing"
              :disabled="!serviceStatus.available"
            >
              单独替换
            </el-button>
            
            <el-button
              size="small"
              type="danger"
              @click="removeItem(item.id)"
            >
              移除
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 添加自定义图片对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加自定义图片"
      width="500px"
    >
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="addForm.title" placeholder="请输入图片标题" />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="addForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入图片描述"
          />
        </el-form-item>
        
        <el-form-item label="类型" prop="type">
          <el-select v-model="addForm.type" placeholder="请选择图片类型">
            <el-option label="活动场景" value="activity" />
            <el-option label="海报设计" value="poster" />
            <el-option label="模板素材" value="template" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="addCustomItem">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Picture, MagicStick } from '@element-plus/icons-vue'
import { autoImageApi } from '@/api/auto-image'
import { defaultImageReplacer, type ImageReplaceItem, type ReplaceProgress } from '@/utils/replace-default-images'

// 响应式数据
const serviceStatus = reactive({
  available: false,
  model: '',
  error: ''
})

const checkingStatus = ref(false)
const isReplacing = ref(false)
const showProgress = ref(false)
const showAddDialog = ref(false)

const progress = reactive<ReplaceProgress>({
  total: 0,
  completed: 0,
  success: 0,
  failed: 0,
  current: ''
})

const imageItems = ref<(ImageReplaceItem & { isReplacing?: boolean })[]>([])
const selectedItems = ref<(string | number)[]>([])

// 添加表单
const addFormRef = ref()
const addForm = reactive({
  title: '',
  description: '',
  type: 'activity' as 'activity' | 'poster' | 'template'
})

const addRules = {
  title: [
    { required: true, message: '请输入图片标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入图片描述', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择图片类型', trigger: 'change' }
  ]
}

// 计算属性
const progressPercentage = computed(() => {
  if (progress.total === 0) return 0
  return Math.round((progress.completed / progress.total) * 100)
})

const progressStatus = computed(() => {
  if (progress.completed === progress.total) {
    return progress.failed === 0 ? 'success' : 'warning'
  }
  return undefined
})

const selectAll = computed({
  get: () => selectedItems.value.length === imageItems.value.length && imageItems.value.length > 0,
  set: (value: boolean) => {
    if (value) {
      selectedItems.value = imageItems.value.map(item => item.id)
    } else {
      selectedItems.value = []
    }
  }
})

const isIndeterminate = computed(() => {
  const selected = selectedItems.value.length
  const total = imageItems.value.length
  return selected > 0 && selected < total
})

// 方法
const checkServiceStatus = async () => {
  checkingStatus.value = true
  try {
    const response = await autoImageApi.checkServiceStatus()
    if (response.success) {
      serviceStatus.available = response.data.available
      serviceStatus.model = response.data.model || ''
      serviceStatus.error = response.data.error || ''
    } else {
      serviceStatus.available = false
      serviceStatus.error = response.message || '检查失败'
    }
  } catch (error: any) {
    serviceStatus.available = false
    serviceStatus.error = error.message || '检查异常'
  } finally {
    checkingStatus.value = false
  }
}

const scanImages = () => {
  const scannedItems = defaultImageReplacer.scanDefaultImages()
  imageItems.value = scannedItems
  selectedItems.value = []
  
  ElMessage.success(`扫描到 ${scannedItems.length} 张待替换图片`)
}

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedItems.value = imageItems.value.map(item => item.id)
  } else {
    selectedItems.value = []
  }
}

const handleItemSelect = (id: string | number, checked: boolean) => {
  if (checked) {
    if (!selectedItems.value.includes(id)) {
      selectedItems.value.push(id)
    }
  } else {
    const index = selectedItems.value.indexOf(id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }
  }
}

const replaceAllImages = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要替换的图片')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要替换选中的 ${selectedItems.value.length} 张图片吗？`,
      '确认替换',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const selectedItemsData = imageItems.value.filter(item => 
      selectedItems.value.includes(item.id)
    )

    isReplacing.value = true
    showProgress.value = true

    // 设置进度回调
    defaultImageReplacer.setProgressCallback((newProgress) => {
      Object.assign(progress, newProgress)
    })

    await defaultImageReplacer.replaceImages(selectedItemsData)

  } catch {
    // 用户取消
  } finally {
    isReplacing.value = false
    setTimeout(() => {
      showProgress.value = false
    }, 3000)
  }
}

const replaceItem = async (item: ImageReplaceItem & { isReplacing?: boolean }) => {
  item.isReplacing = true
  try {
    await defaultImageReplacer.replaceImages([item])
  } finally {
    item.isReplacing = false
  }
}

const removeItem = (id: string | number) => {
  const index = imageItems.value.findIndex(item => item.id === id)
  if (index > -1) {
    imageItems.value.splice(index, 1)
    
    // 同时从选中列表中移除
    const selectedIndex = selectedItems.value.indexOf(id)
    if (selectedIndex > -1) {
      selectedItems.value.splice(selectedIndex, 1)
    }
  }
}

const addCustomItem = async () => {
  try {
    const valid = await addFormRef.value?.validate()
    if (!valid) return

    const newItem: ImageReplaceItem = {
      id: `custom_${Date.now()}`,
      title: addForm.title,
      description: addForm.description,
      type: addForm.type
    }

    imageItems.value.push(newItem)
    showAddDialog.value = false
    
    // 重置表单
    addForm.title = ''
    addForm.description = ''
    addForm.type = 'activity'
    
    ElMessage.success('添加成功')
  } catch {
    // 验证失败
  }
}

const getTypeLabel = (type: string) => {
  const labels = {
    activity: '活动场景',
    poster: '海报设计',
    template: '模板素材'
  }
  return labels[type as keyof typeof labels] || type
}

const getTypeTagType = (type: string) => {
  const types = {
    activity: 'success',
    poster: 'warning',
    template: 'info'
  }
  return types[type as keyof typeof types] || 'info'
}

// 生命周期
onMounted(() => {
  checkServiceStatus()
})
</script>

<style scoped lang="scss">
.image-replacement-manager {
  padding: var(--text-2xl);

  .header-card {
    margin-bottom: var(--text-2xl);

    .card-header {
      h2 {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--text-primary);
      }

      .subtitle {
        margin: 0;
        color: var(--info-color);
        font-size: var(--text-base);
      }
    }

    .service-status {
      margin: var(--text-2xl) 0;
    }

    .action-buttons {
      display: flex;
      gap: var(--text-sm);
      flex-wrap: wrap;
    }
  }

  .progress-card {
    margin-bottom: var(--text-2xl);

    .progress-info {
      .progress-details {
        margin-top: var(--text-lg);
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--spacing-sm);

        p {
          margin: 0;
          font-size: var(--text-base);
          color: var(--text-regular);
        }
      }
    }
  }

  .images-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: var(--text-lg);

        .count-info {
          font-size: var(--text-base);
          color: var(--info-color);
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-10xl) 0;
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--text-2xl);
      margin-top: var(--text-2xl);

      .image-item {
        border: var(--border-width-base) solid var(--border-color-lighter);
        border-radius: var(--spacing-sm);
        padding: var(--text-lg);
        transition: all 0.3s;
        position: relative;

        &:hover {
          border-color: var(--primary-color);
          box-shadow: 0 2px var(--text-sm) rgba(64, 158, 255, 0.1);
        }

        &.selected {
          border-color: var(--primary-color);
          background-color: #f0f9ff;
        }

        .item-checkbox {
          position: absolute;
          top: var(--text-sm);
          right: var(--text-sm);
          z-index: 1;
        }

        .image-preview {
          margin-bottom: var(--text-sm);

          .preview-img {
            width: 100%;
            height: 150px;
            border-radius: var(--radius-md);
          }

          .image-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 150px;
            color: var(--text-placeholder);
            background-color: var(--bg-hover);
            border-radius: var(--radius-md);

            .el-icon {
              font-size: var(--spacing-3xl);
              margin-bottom: var(--spacing-sm);
            }

            span {
              font-size: var(--text-base);
            }
          }
        }

        .item-info {
          margin-bottom: var(--text-sm);

          .item-title {
            margin: 0 0 var(--spacing-sm) 0;
            font-size: var(--text-lg);
            font-weight: 500;
            color: var(--text-primary);
            line-height: 1.4;
          }

          .item-description {
            margin: 0 0 var(--spacing-sm) 0;
            font-size: var(--text-base);
            color: var(--text-regular);
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .item-meta {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
          }
        }

        .item-actions {
          display: flex;
          gap: var(--spacing-sm);

          .el-button {
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
