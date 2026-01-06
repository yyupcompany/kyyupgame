<template>
  <UnifiedCenterLayout
    title="个人档案"
    description="管理您的个人信息和账户设置"
  >
    <template #header-actions>
      <el-button v-if="!isEditing" type="primary" @click="isEditing = true">
        <el-icon><Edit /></el-icon>
        编辑资料
      </el-button>
      <el-button v-if="isEditing" @click="cancelEdit">
        取消
      </el-button>
      <el-button v-if="isEditing" type="primary" @click="saveProfile" :loading="saving">
        <el-icon><Check /></el-icon>
        保存
      </el-button>
      <el-button @click="showPasswordDialog = true">
        <el-icon><Lock /></el-icon>
        修改密码
      </el-button>
    </template>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 主要内容 -->
    <div v-else class="profile-content">
      <!-- 用户信息卡片 -->
      <div class="profile-card">
        <div class="user-info-section">
          <div class="avatar-section">
            <div class="user-avatar">
              <img v-if="userInfo.avatar" :src="userInfo.avatar" :alt="userInfo.realName || userInfo.username" />
              <span v-else class="avatar-text">{{ getAvatarText() }}</span>
            </div>
            <div class="avatar-actions">
              <el-button size="small" @click="handleAvatarUpload">更换头像</el-button>
            </div>
          </div>
          
          <div class="user-details">
            <h2 class="user-name">{{ userInfo.realName || userInfo.username }}</h2>
            <div class="user-meta">
              <div class="meta-item">
                <span class="meta-label">用户名:</span>
                <span class="meta-value">{{ userInfo.username }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">邮箱:</span>
                <span class="meta-value">{{ userInfo.email || '未设置' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">手机号:</span>
                <span class="meta-value">{{ userInfo.phone || '未设置' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">角色:</span>
                <span class="meta-value role-tag">{{ getRoleText() }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">状态:</span>
                <el-tag :type="userInfo.status === 'active' ? 'success' : 'danger'" size="small">
                  {{ userInfo.status === 'active' ? '正常' : '禁用' }}
                </el-tag>
              </div>
              <div class="meta-item">
                <span class="meta-label">注册时间:</span>
                <span class="meta-value">{{ formatDate(userInfo.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮已移至页面头部 -->
      </div>

      <!-- 详细信息表单 -->
      <div class="profile-form-card">
        <div class="card-header">
          <h3>详细信息</h3>
          <el-button v-if="!isEditing" type="text" @click="toggleEdit">编辑</el-button>
          <div v-else class="edit-actions">
            <el-button size="small" @click="cancelEdit">取消</el-button>
            <el-button size="small" type="primary" @click="saveProfile">保存</el-button>
          </div>
        </div>

        <el-form
          ref="formRef"
          :model="profileForm"
          :rules="formRules"
          label-width="100px"
          :disabled="!isEditing"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="profileForm.realName" placeholder="请输入真实姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱地址" prop="email">
                <el-input v-model="profileForm.email" placeholder="请输入邮箱地址" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="手机号码" prop="phone">
                <el-input v-model="profileForm.phone" placeholder="请输入手机号码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-select v-model="profileForm.gender" placeholder="请选择性别">
                  <el-option label="男" value="male" />
                  <el-option label="女" value="female" />
                  <el-option label="未设置" value="" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="生日" prop="birthday">
                <el-date-picker
                  v-model="profileForm.birthday"
                  type="date"
                  placeholder="请选择生日"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="学历" prop="education">
                <el-input v-model="profileForm.education" placeholder="请输入学历" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="地址" prop="address">
            <el-input v-model="profileForm.address" placeholder="请输入地址" />
          </el-form-item>

          <el-form-item label="个人介绍" prop="introduction">
            <el-input
              v-model="profileForm.introduction"
              type="textarea"
              :rows="4"
              placeholder="请输入个人介绍"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- AI用量统计 -->
      <div class="usage-stats-card">
        <div class="card-header">
          <h3>AI用量统计</h3>
          <el-date-picker
            v-model="usageDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="loadMyUsage"
            size="small"
            style="width: 280px"
          />
        </div>

        <div v-if="usageLoading" class="usage-loading">
          <el-skeleton :rows="4" animated />
        </div>

        <div v-else-if="myUsage" class="usage-content">
          <!-- 用量概览 -->
          <div class="usage-overview">
            <div class="usage-stat-item">
              <div class="stat-icon text">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">总调用次数</div>
                <div class="stat-value">{{ getTotalCalls() }}</div>
              </div>
            </div>
            <div class="usage-stat-item">
              <div class="stat-icon cost">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">总费用</div>
                <div class="stat-value cost-value">¥{{ getTotalCost() }}</div>
              </div>
            </div>
            <div class="usage-stat-item">
              <div class="stat-icon token">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">总Token数</div>
                <div class="stat-value">{{ getTotalTokens() }}</div>
              </div>
            </div>
          </div>

          <!-- 按类型统计 -->
          <div class="usage-by-type">
            <h4>按类型统计</h4>
            <el-table :data="myUsage.usageByType" stripe size="small">
              <el-table-column prop="type" label="类型" width="120">
                <template #default="{ row }">
                  <span class="type-badge" :class="row.type">
                    {{ getTypeName(row.type) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="count" label="调用次数" align="right" />
              <el-table-column prop="tokens" label="Token数" align="right">
                <template #default="{ row }">
                  {{ formatNumber(row.tokens) }}
                </template>
              </el-table-column>
              <el-table-column prop="cost" label="费用" align="right">
                <template #default="{ row }">
                  <span class="cost-value">¥{{ formatCost(row.cost) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 最近使用记录 -->
          <div class="recent-usage">
            <h4>最近使用记录</h4>
            <el-table :data="myUsage.recentUsage" stripe size="small">
              <el-table-column prop="modelName" label="模型" width="200" />
              <el-table-column prop="usageType" label="类型" width="100">
                <template #default="{ row }">
                  {{ getTypeName(row.usageType) }}
                </template>
              </el-table-column>
              <el-table-column prop="totalTokens" label="Token数" align="right" />
              <el-table-column prop="cost" label="费用" align="right">
                <template #default="{ row }">
                  ¥{{ formatCost(row.cost) }}
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <div v-else class="usage-empty">
          <el-empty description="暂无用量数据" />
        </div>
      </div>

      <!-- 安全设置 -->
      <div class="security-card">
        <div class="card-header">
          <h3>安全设置</h3>
        </div>
        <div class="security-items">
          <div class="security-item">
            <div class="security-info">
              <h4>登录密码</h4>
              <p>定期更换密码可以提高账户安全性</p>
              <p class="tip">点击页面头部的"修改密码"按钮进行操作</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePasswordSubmit">确认修改</el-button>
        </div>
      </template>
    </el-dialog>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Check, Lock, ChatDotRound, Money, Document } from '@element-plus/icons-vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/date'
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar,
  type UserProfile
} from '@/api/endpoints/user-profile'
import {
  getMyUsage,
  type UserUsageDetail,
  UsageType
} from '@/api/endpoints/usage-center'

// 用户store
const userStore = useUserStore()

// 响应式数据
const loading = ref(true)
const isEditing = ref(false)
const saving = ref(false)
const passwordDialogVisible = ref(false)
const showPasswordDialog = ref(false)

// 用量统计相关
const usageLoading = ref(false)
const usageDateRange = ref<[Date, Date]>([
  new Date(new Date().setDate(new Date().getDate() - 30)),
  new Date()
])
const myUsage = ref<UserUsageDetail | null>(null)

// 用户信息
const userInfo = ref<UserProfile>({
  id: 0,
  username: '',
  realName: '',
  email: '',
  phone: '',
  avatar: '',
  role: '',
  status: '',
  createdAt: '',
  lastLoginAt: '',
  loginCount: 0
})

// 表单数据
const profileForm = reactive({
  realName: '',
  email: '',
  phone: '',
  gender: '',
  birthday: null,
  education: '',
  address: '',
  introduction: ''
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const formRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 方法
const getAvatarText = () => {
  const name = userInfo.value.realName || userInfo.value.username || '用户'
  return name.charAt(0).toUpperCase()
}

const getRoleText = () => {
  // 这里可以根据实际的角色映射来显示
  return '用户'
}

const loadUserProfile = async () => {
  try {
    loading.value = true
    const response = await getUserProfile()

    if (response.success && response.data) {
      userInfo.value = response.data

      // 更新表单数据
      Object.assign(profileForm, {
        realName: response.data.realName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        gender: '',
        birthday: null,
        education: '',
        address: '',
        introduction: ''
      })
    } else {
      ElMessage.error(response.message || '加载用户资料失败')
    }
  } catch (error: any) {
    console.error('加载用户资料失败:', error)
    ElMessage.error(error.message || '加载用户资料失败')
  } finally {
    loading.value = false
  }
}

const toggleEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  // 重新加载数据
  loadUserProfile()
}

const saveProfile = async () => {
  try {
    const response = await updateUserProfile({
      realName: profileForm.realName,
      email: profileForm.email,
      phone: profileForm.phone
    })

    if (response.success) {
      ElMessage.success('保存成功')
      isEditing.value = false
      // 重新加载用户信息
      await loadUserProfile()
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error(error.message || '保存失败')
  }
}

const handleEditProfile = () => {
  toggleEdit()
}

const handleAvatarUpload = () => {
  // 创建文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过5MB')
      return
    }

    try {
      const response = await uploadAvatar(file)

      if (response.success && response.data) {
        ElMessage.success('头像上传成功')
        // 更新头像
        userInfo.value.avatar = response.data.avatar
      } else {
        ElMessage.error(response.message || '头像上传失败')
      }
    } catch (error: any) {
      console.error('头像上传失败:', error)
      ElMessage.error(error.message || '头像上传失败')
    }
  }

  input.click()
}

const handleChangePassword = () => {
  passwordDialogVisible.value = true
  // 重置表单
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

const handlePasswordSubmit = async () => {
  try {
    const response = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    if (response.success) {
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
      // 重置表单
      Object.assign(passwordForm, {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } else {
      ElMessage.error(response.message || '修改密码失败')
    }
  } catch (error: any) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.message || '修改密码失败')
  }
}

// 加载个人用量统计
const loadMyUsage = async () => {
  try {
    usageLoading.value = true

    const params = {
      startDate: usageDateRange.value[0].toISOString().split('T')[0],
      endDate: usageDateRange.value[1].toISOString().split('T')[0]
    }

    const response = await getMyUsage(params)

    if (response.success && response.data) {
      myUsage.value = response.data
    } else {
      myUsage.value = null
    }
  } catch (error: any) {
    console.error('加载用量统计失败:', error)
    myUsage.value = null
  } finally {
    usageLoading.value = false
  }
}

// 用量统计辅助方法
const getTotalCalls = (): number => {
  if (!myUsage.value) return 0
  return myUsage.value.usageByType.reduce((sum, item) => sum + item.count, 0)
}

const getTotalCost = (): string => {
  if (!myUsage.value) return '0.000000'
  const total = myUsage.value.usageByType.reduce((sum, item) => sum + item.cost, 0)
  return total.toFixed(6)
}

const getTotalTokens = (): string => {
  if (!myUsage.value) return '0'
  const total = myUsage.value.usageByType.reduce((sum, item) => sum + item.tokens, 0)
  return total.toLocaleString()
}

const getTypeName = (type: UsageType): string => {
  const typeNames = {
    [UsageType.TEXT]: '文本',
    [UsageType.IMAGE]: '图片',
    [UsageType.AUDIO]: '语音',
    [UsageType.VIDEO]: '视频',
    [UsageType.EMBEDDING]: '向量'
  }
  return typeNames[type] || type
}

const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

const formatCost = (cost: number): string => {
  return cost.toFixed(6)
}

// 生命周期
onMounted(() => {
  loadUserProfile()
  loadMyUsage()
})
</script>

<style scoped lang="scss">
.profile-container {
  padding: var(--text-2xl);
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: var(--text-3xl);
  
  .header-content {
    .page-title {
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }
  }
}

.loading-container {
  padding: var(--spacing-10xl);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: var(--text-3xl);
}

.profile-card,
.profile-form-card,
.usage-stats-card,
.security-card {
  background: white;
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  box-shadow: 0 var(--border-width-base) 3px var(--shadow-light);
}

.profile-card {
  .user-info-section {
    display: flex;
    gap: var(--text-3xl);
    margin-bottom: var(--text-3xl);
    
    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--text-sm);
      
      .user-avatar {
        width: var(--avatar-size); height: var(--avatar-size);
        border-radius: var(--radius-full);
        overflow: hidden;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-text {
          font-size: var(--spacing-3xl);
          font-weight: 600;
          color: var(--text-secondary);
        }
      }
    }
    
    .user-details {
      flex: 1;
      
      .user-name {
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--text-lg) 0;
      }
      
      .user-meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--text-sm);
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          
          .meta-label {
            color: var(--text-secondary);
            font-size: var(--text-base);
            min-width: 60px;
          }
          
          .meta-value {
            color: var(--text-primary);
            font-weight: 500;
            
            &.role-tag {
              background: #dbeafe;
              color: #1e40af;
              padding: var(--spacing-sm) var(--spacing-sm);
              border-radius: var(--spacing-xs);
              font-size: var(--text-sm);
            }
          }
        }
      }
    }
  }
  
  .profile-actions {
    display: flex;
    gap: var(--text-sm);
    justify-content: flex-end;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-3xl);
  
  h3 {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
  
  .edit-actions {
    display: flex;
    gap: var(--spacing-sm);
  }
}

.security-items {
  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--text-lg) 0;
    border-bottom: var(--border-width-base) solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
    
    .security-info {
      h4 {
        font-size: var(--text-lg);
        font-weight: 500;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
      }
      
      p {
        color: var(--text-secondary);
        font-size: var(--text-base);
        margin: 0;
      }
    }
  }
}

// AI用量统计卡片样式
.usage-stats-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);
  }

  .usage-loading {
    padding: var(--text-2xl) 0;
  }

  .usage-content {
    .usage-overview {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--text-lg);
      margin-bottom: var(--text-3xl);

      .usage-stat-item {
        display: flex;
        align-items: center;
        gap: var(--text-sm);
        padding: var(--text-lg);
        border-radius: var(--spacing-sm);
        background: #f9fafb;

        .stat-icon {
          width: var(--icon-size); height: var(--icon-size);
          border-radius: var(--spacing-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-2xl);
          color: white;

          &.text {
            background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
          }

          &.cost {
            background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
          }

          &.token {
            background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
          }
        }

        .stat-info {
          flex: 1;

          .stat-label {
            font-size: var(--text-base);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-xs);
          }

          .stat-value {
            font-size: var(--text-2xl);
            font-weight: 600;
            color: var(--text-primary);

            &.cost-value {
              color: var(--success-color);
            }
          }
        }
      }
    }

    .usage-by-type,
    .recent-usage {
      margin-bottom: var(--text-3xl);

      h4 {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--text-sm) 0;
      }

      .type-badge {
        display: inline-block;
        padding: var(--spacing-xs) var(--text-sm);
        border-radius: var(--spacing-xs);
        font-size: var(--text-sm);
        font-weight: 500;

        &.text {
          background: #ede9fe;
          color: var(--ai-dark);
        }

        &.image {
          background: #fce7f3;
          color: #ec4899;
        }

        &.audio {
          background: #dbeafe;
          color: var(--primary-color);
        }

        &.video {
          background: #d1fae5;
          color: var(--success-color);
        }

        &.embedding {
          background: #fed7aa;
          color: var(--warning-color);
        }
      }

      .cost-value {
        color: var(--success-color);
        font-weight: 600;
      }
    }

    .recent-usage {
      margin-bottom: 0;
    }
  }

  .usage-empty {
    padding: var(--spacing-10xl) 0;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

@media (max-width: var(--breakpoint-md)) {
  .profile-container {
    padding: var(--text-lg);
  }
  
  .profile-card .user-info-section {
    flex-direction: column;
    text-align: center;
  }
  
  .user-meta {
    grid-template-columns: 1fr !important;
  }
  
  .profile-actions {
    justify-content: center;
  }
}
</style>
