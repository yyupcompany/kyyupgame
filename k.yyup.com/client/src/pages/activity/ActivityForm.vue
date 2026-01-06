<template>
  <div class="page-container">
    <page-header :title="isEdit ? '编辑活动' : '创建活动'">
      <template #actions>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
      </template>
    </page-header>

    <el-card class="activity-form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
        status-icon
      >
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入活动标题" maxlength="100" show-word-limit />
        </el-form-item>
        
        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入活动描述"
            :rows="4"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="活动地点" prop="location">
          <el-input v-model="formData.location" placeholder="请输入活动地点" maxlength="200" show-word-limit />
        </el-form-item>
        
        <el-form-item label="活动类型" prop="activityType">
          <el-select v-model="formData.activityType" placeholder="请选择活动类型">
            <el-option
              v-for="type in activityTypeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="参与人数" prop="capacity">
          <el-input-number 
            v-model="formData.capacity" 
            :min="1" 
            :max="500" 
            placeholder="请输入参与人数"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="活动费用" prop="fee">
          <el-input-number 
            v-model="formData.fee" 
            :min="0" 
            :precision="2" 
            placeholder="请输入活动费用（元）"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="活动议程" prop="agenda">
          <el-input 
            v-model="formData.agenda" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入活动议程安排" 
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="需要审批">
          <el-switch 
            v-model="formData.needsApproval" 
            active-text="是" 
            inactive-text="否"
          />
        </el-form-item>
        
        <el-form-item label="封面图片" prop="coverImage">
          <el-upload
            class="avatar-uploader"
            action="#"
            :http-request="uploadImage"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
          >
            <img v-if="formData.coverImage" :src="formData.coverImage" class="avatar" />
            <UnifiedIcon name="Plus" />
          </el-upload>
          <div class="upload-tip">建议上传尺寸 750x400 像素的图片，支持 JPG/PNG/GIF 格式，最大 2MB</div>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="formData.remark" 
            type="textarea" 
            :rows="2" 
            placeholder="请输入备注信息" 
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="活动状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择活动状态">
            <el-option
              v-for="status in activityStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { get, post, put } from '@/utils/request'
import type { ApiResponse } from '@/utils/request'
import { ACTIVITY_PLAN_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'

// 活动状态枚举（与后端对齐）
enum ActivityStatus {
  PLANNED = 0,        // 计划中
  REGISTRATION_OPEN = 1,  // 报名开放
  FULL = 2,           // 名额已满
  IN_PROGRESS = 3,    // 进行中
  FINISHED = 4,       // 已结束
  CANCELLED = 5       // 已取消
}

// 活动类型枚举（与后端对齐）
enum ActivityType {
  OUTDOOR = 1,        // 户外活动
  INDOOR = 2,         // 室内活动
  EDUCATIONAL = 3,    // 教育活动
  ENTERTAINMENT = 4,  // 娱乐活动
  SPORTS = 5,         // 体育活动
  ART = 6             // 艺术活动
}

// 活动表单接口（与后端API对齐）
interface ActivityCreateParams {
  title: string;
  description: string;
  activityType: ActivityType;
  status: ActivityStatus;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  fee?: number;
  agenda?: string;
  registrationStartTime: string;
  registrationEndTime: string;
  needsApproval?: boolean;
  coverImage?: string;
  remark?: string;
}

// 图片上传处理
const uploadImage = async (options: any) => {
  const { file } = options
  
  try {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      if (e.target) {
        formData.coverImage = e.target.result as string
        ElMessage.success('图片上传成功')
      }
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  }
}

// 上传前验证
const beforeImageUpload = (file: File) => {
  const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传图片只能是 JPG/PNG/GIF 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

export default defineComponent({
  name: 'ActivityForm',
  components: {
    Plus
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const formRef = ref<InstanceType<typeof ElForm> | null>(null)
    const loading = ref(false)
    const isEdit = computed(() => !!route.params.id)
    const timeRange = ref<string[]>([])
    
    // 表单数据
    const formData = reactive<ActivityCreateParams>({
      title: '',
      description: '',
      activityType: ActivityType.EDUCATIONAL,
      status: ActivityStatus.PLANNED,
      startTime: '',
      endTime: '',
      location: '',
      capacity: 50,
      fee: 0,
      agenda: '',
      registrationStartTime: '',
      registrationEndTime: '',
      needsApproval: false,
      coverImage: '',
      remark: ''
    })
    
    // 表单验证规则
    const formRules = {
      title: [
        { required: true, message: '请输入活动标题', trigger: 'blur' },
        { min: 2, max: 100, message: '长度在2到100个字符之间', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入活动描述', trigger: 'blur' }
      ],
      activityType: [
        { required: true, message: '请选择活动类型', trigger: 'change' }
      ],
      timeRange: [
        { required: true, message: '请选择活动时间', trigger: 'change' }
      ],
      location: [
        { required: true, message: '请输入活动地点', trigger: 'blur' }
      ],
      capacity: [
        { required: true, message: '请输入参与人数', trigger: 'blur' },
        { type: 'number', min: 1, message: '参与人数必须大于0', trigger: 'blur' }
      ],
      status: [
        { required: true, message: '请选择活动状态', trigger: 'change' }
      ]
    }
    
    // 活动状态选项（与后端对齐）
    const activityStatusOptions = [
      { label: '计划中', value: ActivityStatus.PLANNED },
      { label: '报名开放', value: ActivityStatus.REGISTRATION_OPEN },
      { label: '名额已满', value: ActivityStatus.FULL },
      { label: '进行中', value: ActivityStatus.IN_PROGRESS },
      { label: '已结束', value: ActivityStatus.FINISHED },
      { label: '已取消', value: ActivityStatus.CANCELLED }
    ]
    
    // 活动类型选项（与后端对齐）
    const activityTypeOptions = [
      { label: '户外活动', value: ActivityType.OUTDOOR },
      { label: '室内活动', value: ActivityType.INDOOR },
      { label: '教育活动', value: ActivityType.EDUCATIONAL },
      { label: '娱乐活动', value: ActivityType.ENTERTAINMENT },
      { label: '体育活动', value: ActivityType.SPORTS },
      { label: '艺术活动', value: ActivityType.ART }
    ]
    
    // 监听时间范围变化
    const updateTimeFromRange = () => {
      if (timeRange.value && timeRange.value.length === 2) {
        formData.startTime = timeRange.value[0]
        formData.endTime = timeRange.value[1]
        
        // 自动设置报名时间（默认为活动开始前一周到活动开始）
        const startDate = new Date(timeRange.value[0])
        const registrationStart = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        formData.registrationStartTime = registrationStart.toISOString().slice(0, 19).replace('T', ' ')
        formData.registrationEndTime = timeRange.value[0]
      }
    }
    
    // 获取活动详情
    const fetchActivityDetail = async (id: string) => {
      loading.value = true
      try {
        const response = await get(ACTIVITY_PLAN_ENDPOINTS.GET_BY_ID(id))
        if (response.success && response.data) {
          const activity = response.data
          Object.assign(formData, activity)
          
          // 设置时间范围
          if (activity.startTime && activity.endTime) {
            timeRange.value = [activity.startTime, activity.endTime]
          }
        } else {
          const errorInfo = ErrorHandler.handle(new Error(response.message || '获取活动详情失败'), true)
        }
      } catch (error) {
        const errorInfo = ErrorHandler.handle(error, true)
      } finally {
        loading.value = false
      }
    }
    
    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (!valid) return
        
        updateTimeFromRange()
        
        loading.value = true
        try {
          let response
          
          if (isEdit.value) {
            // 更新活动计划
            response = await put(ACTIVITY_PLAN_ENDPOINTS.UPDATE(route.params.id as string), formData)
          } else {
            // 创建活动计划
            response = await post(ACTIVITY_PLAN_ENDPOINTS.BASE, formData)
          }
          
          if (response.success) {
            ElMessage.success(isEdit.value ? '活动计划更新成功' : '活动计划创建成功')
            router.push('/activity')
          } else {
            const errorInfo = ErrorHandler.handle(new Error(response.message || (isEdit.value ? '活动更新失败' : '活动创建失败')), true)
          }
        } catch (error) {
          const errorInfo = ErrorHandler.handle(error, true)
        } finally {
          loading.value = false
        }
      })
    }
    
    // 取消
    const handleCancel = () => {
      router.back()
    }
    
    // 组件挂载时获取数据
    onMounted(() => {
      if (isEdit.value && route.params.id) {
        fetchActivityDetail(route.params.id as string)
      }
    })
    
    return {
      formRef,
      formData,
      formRules,
      loading,
      isEdit,
      timeRange,
      activityStatusOptions,
      activityTypeOptions,
      handleSubmit,
      handleCancel,
      uploadImage,
      beforeImageUpload
    }
  }
})
</script>

<style lang="scss" scoped>
@import "@/styles/design-tokens.scss";
@import "@/styles/list-components-optimization.scss";
/* 使用全局样式 page-container 替代 activity-form-page */
/* 容器样式通过全局样式提供 */

.activity-form-container {
  margin-top: var(--app-margin);
  padding: var(--spacing-xl);
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);

/* Page header styles */
.page-container :deep(h2) {
  font-size: var(--text-2xl);
  color: var(--text-primary);
  font-weight: 600;
  background: var(--gradient-green);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;

/* Page actions */
.page-container :deep([name="actions"]) {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;

/* Form styles */
.activity-form-container :deep(.el-form-item__label) {
  color: var(--text-primary);
  font-weight: 500;
}

.activity-form-container :deep(.el-input__inner),
/* 修复孤立CSS属性 */
.activity-form-container :deep(.el-textarea__inner),
}
.activity-form-container :deep(.el-select__wrapper) {
  background-color: var(--bg-primary);
  border-color: var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);

.activity-form-container :deep(.el-input__inner:focus),
/* 修复孤立CSS属性 */
.activity-form-container :deep(.el-textarea__inner:focus),
}
.activity-form-container :deep(.el-select__wrapper:focus) {
  border-color: var(--primary-color);
  box-shadow: var(--focus-shadow);
}

/* Date picker styles */
.activity-form-container :deep(.el-date-editor) {
  width: 100%;
  background-color: var(--bg-primary);
}

.activity-form-container :deep(.el-date-editor .el-input__inner) {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Select dropdown styles */
.activity-form-container :deep(.el-select-dropdown) {
  background-color: var(--bg-card);
  border-color: var(--border-color);
}

.activity-form-container :deep(.el-select-dropdown__item) {
  color: var(--text-primary);
}

.activity-form-container :deep(.el-select-dropdown__item:hover) {
  background-color: var(--bg-hover);
}

.activity-form-container :deep(.el-select-dropdown__item.selected) {
  color: var(--primary-color);
  font-weight: 600;
  background-color: var(--primary-light-bg);
}

/* Button styles */
.activity-form-container :deep(.el-button) {
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  transition: all var(--transition-fast);
}

.activity-form-container :deep(.el-button--primary) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.activity-form-container :deep(.el-button--primary:hover) {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
  transform: translateY(-var(--border-width-base));
  box-shadow: var(--shadow-sm);
}

/* Card styles */
.activity-form-container {
  transition: all var(--transition-normal);
}

.activity-form-container:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Upload image component styles */
.activity-form-container :deep([class*="upload"]) {
  background-color: var(--bg-secondary);
  border: var(--border-width-base) dashed var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.activity-form-container :deep([class*="upload"]:hover) {
  border-color: var(--primary-color);
  background-color: var(--bg-hover);
}

/* Form validation styles */
.activity-form-container :deep(.el-form-item__error) {
  color: var(--danger-color);
  font-size: var(--text-xs);
}

/* Textarea styles */
.activity-form-container :deep(.el-textarea__inner) {
  min-min-height: 60px; height: auto;
  resize: vertical;
  padding: var(--spacing-sm);
}

/* Loading styles */
.activity-form-container :deep(.el-loading-mask) {
  background-color: var(--bg-card-overlay);
}

/* Icon styles */
.activity-form-container :deep(.el-icon) {
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.activity-form-container :deep(.el-button:hover .el-icon) {
  color: var(--text-primary);
}

/* Date picker icon styles */
.activity-form-container :deep(.el-date-editor .el-range-separator) {
  color: var(--text-muted);
  line-height: var(--spacing-3xl);
}

/* Form item required asterisk */
.activity-form-container :deep(.el-form-item__label-wrap > .el-form-item__label:before) {
  color: var(--danger-color);
  margin-right: var(--spacing-xs);
}

/* Input count styles */
.activity-form-container :deep(.el-input__count) {
  background-color: transparent;
  color: var(--text-muted);
}

/* Textarea count styles */
.activity-form-container :deep(.el-textarea__inner) + .el-input__count {
  background-color: var(--bg-primary);
  border-radius: var(--radius-sm);
  padding: 0 var(--spacing-xs);
}

/* Responsive design */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--spacing-md);
  }
  
  .page-container .activity-form-container {
    padding: var(--spacing-md);
    margin-top: var(--spacing-md);
  
  .activity-form-container :deep(.el-form-item__label) {
    text-align: left;
    font-size: var(--text-sm);
  }
  
  .activity-form-container :deep(.el-button) {
    width: 100%;
  }
}

/* Avatar uploader styles */
.avatar-uploader {
  border: var(--border-width-base) dashed var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  transition: all var(--transition-fast);
  width: 17var(--spacing-sm);
  height: 17var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
}

.avatar-uploader:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-hover);
}

.avatar {
  width: 17var(--spacing-sm);
  height: 17var(--spacing-sm);
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: var(--text-2xl);
  color: var(--text-muted);
}

.upload-tip {
  margin-top: var(--spacing-sm);
  font-size: var(--text-xs);
  color: var(--text-muted);
}
</style> 