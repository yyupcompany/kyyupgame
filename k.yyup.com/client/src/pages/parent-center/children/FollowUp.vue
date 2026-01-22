<template>
  <div class="page-container">
    <div class="app-card">
      <div class="app-card-header">
        <div class="app-card-title">添加跟进记录</div>
        <div class="card-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
        </div>
      </div>
      
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else class="follow-up-form">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="var(--spacing-2xl)"
          label-position="right"
        >
          <el-form-item label="家长信息">
            <div class="parent-info">
              <span class="parent-name">{{ parentInfo.name }}</span>
              <el-tag :type="getParentStatusType(parentInfo.status)">{{ parentInfo.status }}</el-tag>
              <span class="parent-phone">{{ parentInfo.phone }}</span>
            </div>
          </el-form-item>
          
          <el-form-item label="跟进标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入跟进记录标题" />
          </el-form-item>
          
          <el-row class="form-row">
            <el-col :span="12">
              <el-form-item label="跟进类型" prop="type">
                <el-select v-model="form.type" placeholder="请选择跟进类型" class="full-width-select">
                  <el-option label="电话咨询" value="电话咨询" />
                  <el-option label="实地参观" value="实地参观" />
                  <el-option label="家长会谈" value="家长会谈" />
                  <el-option label="电话回访" value="电话回访" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="跟进时间" prop="time">
                <el-date-picker
                  v-model="form.time"
                  type="datetime"
                  placeholder="选择日期时间"
                  class="full-width-select"
                  value-format="YYYY-MM-DD HH:mm"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="跟进内容" prop="content">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="6"
              placeholder="请输入跟进内容详情"
            />
          </el-form-item>
          
          <el-form-item label="下次跟进">
            <el-row class="form-row">
              <el-col :span="12">
                <el-form-item prop="nextFollowUpTime">
                  <el-date-picker
                    v-model="form.nextFollowUpTime"
                    type="datetime"
                    placeholder="选择下次跟进时间"
                    class="full-width-select"
                    value-format="YYYY-MM-DD HH:mm"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="nextFollowUpType">
                  <el-select v-model="form.nextFollowUpType" placeholder="请选择下次跟进类型" class="full-width-select">
                    <el-option label="电话咨询" value="电话咨询" />
                    <el-option label="实地参观" value="实地参观" />
                    <el-option label="家长会谈" value="家长会谈" />
                    <el-option label="电话回访" value="电话回访" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
          
          <el-form-item label="跟进结果" prop="result">
            <el-select v-model="form.result" placeholder="请选择跟进结果" class="full-width-select">
              <el-option label="有意向" value="有意向" />
              <el-option label="考虑中" value="考虑中" />
              <el-option label="无意向" value="无意向" />
              <el-option label="待定" value="待定" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="提醒设置">
            <el-switch
              v-model="form.enableReminder"
              active-text="开启提醒"
              inactive-text="关闭提醒"
            />
          </el-form-item>
          
          <el-form-item v-if="form.enableReminder" label="提醒时间" prop="reminderTime">
            <el-date-picker
              v-model="form.reminderTime"
              type="datetime"
              placeholder="选择提醒时间"
              class="full-width-select"
              value-format="YYYY-MM-DD HH:mm"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, FormInstance } from 'element-plus';
import { PARENT_ENDPOINTS } from '@/api/endpoints';
import { request } from '@/utils/request';
import type { ApiResponse } from '@/api/endpoints';

interface ParentInfo {
  id: number;
  name: string;
  phone: string;
  status: string;
}

interface FollowUpForm {
  parentId: number;
  title: string;
  type: string;
  time: string;
  content: string;
  nextFollowUpTime?: string;
  nextFollowUpType?: string;
  result: string;
  enableReminder: boolean;
  reminderTime?: string;
}

export default defineComponent({
  name: 'FollowUp',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const formRef = ref<FormInstance>();
    const loading = ref(false);
    const submitting = ref(false);
    
    const parentId = Number(route.query.parentId);
    
    // 家长基本信息
    const parentInfo = ref<ParentInfo>({
      id: parentId,
  name: '',
  phone: '',
  status: ''
    });
    
    // 表单数据
    const form = reactive<FollowUpForm>({
      parentId: parentId,
  title: '',
  type: '',
  time: new Date().toISOString().slice(0, 16).replace('T', ' '),
  content: '',
  result: '待定',
      enableReminder: false
    });
    
    // 表单验证规则
    const rules = {
      title: [
        { required: true, message: '请输入跟进记录标题', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
  type: [
        { required: true, message: '请选择跟进类型', trigger: 'change' }
      ],
  time: [
        { required: true, message: '请选择跟进时间', trigger: 'change' }
      ],
  content: [
        { required: true, message: '请输入跟进内容', trigger: 'blur' },
        { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' }
      ],
  result: [
        { required: true, message: '请选择跟进结果', trigger: 'change' }
      ],
      reminderTime: [
        { required: true, message: '请选择提醒时间', trigger: 'change' }
      ]
    };
    
    // 获取家长信息
    const fetchParentInfo = async () => {
      loading.value = true;
      
      try {
        const response: ApiResponse = await request.get(PARENT_ENDPOINTS.GET_BY_ID(parentId));
        
        if (response.success && response.data) {
          parentInfo.value = {
            id: response.data.id,
            name: response.data.name,
            phone: response.data.phone,
            status: response.data.status
          };
        } else {
          ElMessage.error(response.message || '获取家长信息失败');
        }
      } catch (error) {
        console.error('获取家长信息失败:', error);
        ElMessage.error('获取家长信息失败');
      } finally {
        loading.value = false;
      }
    };
    
    // 获取家长状态标签类型
    const getParentStatusType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
      switch (status) {
        case '潜在家长':
          return 'primary';
        case '在读家长':
          return 'success';
        case '毕业家长':
          return 'info';
        default:
          return 'info';
      }
    };
    
    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return;
      
      await formRef.value.validate(async (valid, fields) => {
        if (valid) {
          submitting.value = true;
          
          try {
            const response: ApiResponse = await request.post(PARENT_ENDPOINTS.COMMUNICATION_HISTORY(parentId), form);
            
            if (response.success) {
              ElMessage.success('跟进记录添加成功');
              router.push(`/parent/detail/${parentId}`);
            } else {
              ElMessage.error(response.message || '添加跟进记录失败');
            }
          } catch (error) {
            console.error('添加跟进记录失败:', error);
            ElMessage.error('添加跟进记录失败');
          } finally {
            submitting.value = false;
          }
        } else {
          console.error('表单验证失败:', fields);
        }
      });
    };
    
    // 返回上一页
    const goBack = () => {
      router.back();
    };
    
    onMounted(() => {
      if (!parentId) {
        ElMessage.error('缺少家长ID参数');
        router.push('/parent/list');
        return;
      }
      
      fetchParentInfo();
    });
    
    return {
      formRef,
      form,
      rules,
      loading,
      submitting,
      parentInfo,
      getParentStatusType,
      handleSubmit,
      goBack
    };
  }
});
</script>

<style scoped lang="scss">
/* 使用设计令牌，不引入外部SCSS */

/* ==================== 页面容器 ==================== */
.page-container {
  padding: var(--spacing-xl);
  max-width: var(--breakpoint-2xl);
  margin: 0 auto;
}

/* ==================== 应用卡片 ==================== */
.app-card {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.app-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-lighter);
}

.app-card-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* ==================== 加载容器 ==================== */
.loading-container {
  padding: var(--spacing-3xl);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* ==================== 跟进表单 ==================== */
.follow-up-form {
  margin-top: var(--spacing-xl);
}

/* ==================== 家长信息 ==================== */
.parent-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;

  .parent-name {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .parent-phone {
    color: var(--el-text-color-secondary);
    font-size: var(--text-sm);
  }
}

/* ==================== 全宽选择器 ==================== */
.full-width-select {
  width: 100%;
}

/* ==================== 表单行间距 ==================== */
.form-row {
  margin: 0 calc(var(--spacing-lg) / -2);

  .el-col {
    padding: 0 calc(var(--spacing-lg) / 2);
  }
}

/* ==================== 表单样式 ==================== */
:deep(.el-form) {
  .el-form-item {
    margin-bottom: var(--spacing-md);

    .el-form-item__label {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }

  .el-textarea__inner {
    border-radius: var(--radius-md);
    resize: vertical;
    min-height: 100px;
  }

  .el-input__wrapper {
    border-radius: var(--radius-md);
  }

  .el-select .el-input__wrapper {
    border-radius: var(--radius-md);
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--spacing-md);
  }

  .app-card {
    padding: var(--spacing-md);
  }

  .app-card-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .form-row {
    margin: 0;

    .el-col {
      padding: 0;
      margin-bottom: var(--spacing-md);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .parent-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);

    .parent-phone {
      margin-left: 0;
    }
  }
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style> 