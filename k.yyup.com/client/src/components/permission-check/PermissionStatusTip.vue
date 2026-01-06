<template>
  <div v-if="showTip" class="permission-status-tip">
    <el-alert
      :type="alertType"
      :title="alertTitle"
      :description="alertDescription"
      :closable="false"
      show-icon
    >
      <template #default>
        <div class="tip-content">
          <p>{{ alertDescription }}</p>
          <div v-if="permissionResult?.status === 'pending'" class="pending-actions">
            <el-button type="primary" size="small" @click="showRequestDialog = true">
              主动申请权限
            </el-button>
            <el-button type="info" size="small" @click="contactPrincipal">
              联系园长
            </el-button>
          </div>
          <div v-else-if="permissionResult?.status === 'rejected'" class="rejected-info">
            <p v-if="permissionResult?.confirmation?.rejectReason" class="reject-reason">
              拒绝原因：{{ permissionResult.confirmation.rejectReason }}
            </p>
            <el-button type="primary" size="small" @click="showRequestDialog = true">
              重新申请权限
            </el-button>
          </div>
        </div>
      </template>
    </el-alert>

    <!-- 权限申请对话框 -->
    <el-dialog
      v-model="showRequestDialog"
      title="申请访问权限"
      width="500px"
    >
      <el-form :model="requestForm" :rules="requestRules" ref="requestFormRef" label-width="100px">
        <el-form-item label="关联学生" prop="studentId">
          <el-select v-model="requestForm.studentId" placeholder="请选择关联学生" style="width: 100%">
            <el-option
              v-for="student in childrenList"
              :key="student.id"
              :label="student.name"
              :value="student.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="权限范围" prop="permissionScope">
          <el-radio-group v-model="requestForm.permissionScope">
            <el-radio label="basic">基础权限（个人信息）</el-radio>
            <el-radio label="album">相册权限</el-radio>
            <el-radio label="notification">通知权限</el-radio>
            <el-radio label="activity">活动权限</el-radio>
            <el-radio label="academic">学业权限</el-radio>
            <el-radio label="all">全部权限</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="申请说明">
          <el-input
            v-model="requestForm.description"
            type="textarea"
            :rows="3"
            placeholder="请简要说明申请原因（可选）"
          />
        </el-form-item>

        <el-form-item label="证明材料">
          <el-upload
            v-model:file-list="requestForm.evidenceFiles"
            :action="uploadUrl"
            :headers="uploadHeaders"
            multiple
            :limit="5"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            list-type="text"
          >
            <el-button type="primary">上传证明材料</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持上传身份证、户口本等证明材料，最多5个文件
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="权限期限">
          <el-radio-group v-model="requestForm.isPermanent">
            <el-radio :label="true">永久权限</el-radio>
            <el-radio :label="false">临时权限</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="!requestForm.isPermanent" label="过期时间">
          <el-date-picker
            v-model="requestForm.expiryDate"
            type="datetime"
            placeholder="选择权限过期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showRequestDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="submitPermissionRequest"
        >
          提交申请
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { parentPermissionAPI } from '@/api/modules/parent-permission'
import { userAPI } from '@/api/modules/user'

interface Props {
  requiredPermission?: string
  showAlways?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  requiredPermission: 'album',
  showAlways: false
})

const emit = defineEmits<{
  permissionGranted: []
  permissionDenied: [reason: string]
}>()

// 状态
const showTip = ref(false)
const showRequestDialog = ref(false)
const submitting = ref(false)
const permissionResult = ref(null)
const childrenList = ref([])

// 表单数据
const requestForm = reactive({
  studentId: '',
  permissionScope: 'album',
  description: '',
  evidenceFiles: [],
  isPermanent: true,
  expiryDate: ''
})

const requestRules = {
  studentId: [
    { required: true, message: '请选择关联学生', trigger: 'change' }
  ],
  permissionScope: [
    { required: true, message: '请选择权限范围', trigger: 'change' }
  ]
}

const requestFormRef = ref()

// 计算属性
const alertType = computed(() => {
  if (!permissionResult.value) return 'info'
  const status = permissionResult.value.status
  switch (status) {
    case 'pending': return 'warning'
    case 'rejected': return 'error'
    case 'suspended': return 'warning'
    default: return 'info'
  }
})

const alertTitle = computed(() => {
  if (!permissionResult.value) return '权限检查中...'
  const status = permissionResult.value.status
  switch (status) {
    case 'pending': return '权限申请待审核'
    case 'rejected': return '权限申请被拒绝'
    case 'suspended': return '权限已被暂停'
    default: return '权限状态正常'
  }
})

const alertDescription = computed(() => {
  if (!permissionResult.value) return '正在检查您的访问权限...'

  if (permissionResult.value.hasPermission) {
    return '您已获得相应的访问权限，可以正常使用功能。'
  }

  const status = permissionResult.value.status
  const reason = permissionResult.value.reason

  switch (status) {
    case 'pending':
      return '您的权限申请正在等待园长审核，请耐心等待或主动申请权限。'
    case 'rejected':
      return reason || '您的权限申请被拒绝，请重新申请或联系园长了解详情。'
    case 'suspended':
      return '您的访问权限已被暂停，请联系园长了解详情。'
    default:
      return reason || '您暂时没有访问权限，请联系园长进行权限确认。'
  }
})

// 上传配置
const uploadUrl = computed(() => '/api/upload')
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
})

// 方法
const checkPermission = async () => {
  try {
    // 这里需要获取当前用户ID
    const userInfo = await userAPI.getCurrentUser()
    const userId = userInfo.data.id

    const response = await parentPermissionAPI.checkParentPermissionStatus(
      userId,
      props.requiredPermission
    )

    permissionResult.value = response.data

    if (response.data.hasPermission) {
      showTip.value = false
      emit('permissionGranted')
    } else {
      showTip.value = true
      emit('permissionDenied', response.data.reason)
    }

  } catch (error) {
    console.error('检查权限失败:', error)
    if (props.showAlways) {
      showTip.value = true
      permissionResult.value = {
        hasPermission: false,
        status: 'error',
        reason: '权限检查失败，请联系管理员'
      }
    }
  }
}

const loadChildrenList = async () => {
  try {
    // 获取关联的学生列表
    const response = await userAPI.getParentChildren()
    childrenList.value = response.data || []
  } catch (error) {
    console.error('加载学生列表失败:', error)
  }
}

const submitPermissionRequest = async () => {
  try {
    await requestFormRef.value.validate()

    submitting.value = true

    const requestData = {
      studentId: requestForm.studentId,
      permissionScope: requestForm.permissionScope,
      description: requestForm.description,
      evidenceFiles: requestForm.evidenceFiles.map(file => file.url),
      isPermanent: requestForm.isPermanent,
      expiryDate: requestForm.expiryDate
    }

    await parentPermissionAPI.createPermissionRequest(requestData)

    ElMessage.success('权限申请提交成功，请等待园长审核')
    showRequestDialog.value = false

    // 重新检查权限状态
    setTimeout(checkPermission, 1000)

  } catch (error) {
    console.error('提交权限申请失败:', error)
    ElMessage.error('提交权限申请失败')
  } finally {
    submitting.value = false
  }
}

const contactPrincipal = () => {
  // 这里可以实现联系园长的功能
  ElMessage.info('请联系园长进行权限确认')
}

const handleUploadSuccess = (response: any, file: any, fileList: any[]) => {
  if (response.success) {
    file.url = response.data.url
    ElMessage.success('文件上传成功')
  } else {
    ElMessage.error('文件上传失败')
  }
}

const handleUploadError = (error: any, file: any, fileList: any[]) => {
  ElMessage.error('文件上传失败')
  console.error('上传错误:', error)
}

// 初始化
onMounted(async () => {
  await loadChildrenList()
  await checkPermission()
})
</script>

<style lang="scss" scoped>
.permission-status-tip {
  margin: var(--spacing-md) 0;

  .tip-content {
    .pending-actions {
      margin-top: 12px;
      display: flex;
      gap: var(--spacing-md);
    }

    .rejected-info {
      margin-top: 12px;

      .reject-reason {
        color: #f56c6c;
        margin-bottom: 12px;
        padding: var(--spacing-sm);
        background-color: #fef0f0;
        border-radius: 4px;
      }
    }
  }
}

:deep(.el-alert) {
  .el-alert__description {
    margin-top: 8px;
  }
}
</style>