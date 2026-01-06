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
          label-width="100px"
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
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="跟进类型" prop="type">
                <el-select v-model="form.type" placeholder="请选择跟进类型" style="width: 100%">
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
                  style="width: 100%"
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
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item prop="nextFollowUpTime">
                  <el-date-picker
                    v-model="form.nextFollowUpTime"
                    type="datetime"
                    placeholder="选择下次跟进时间"
                    style="width: 100%"
                    value-format="YYYY-MM-DD HH:mm"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="nextFollowUpType">
                  <el-select v-model="form.nextFollowUpType" placeholder="请选择下次跟进类型" style="width: 100%">
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
            <el-select v-model="form.result" placeholder="请选择跟进结果" style="width: 100%">
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
              style="width: 100%"
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
@import '@/styles/index.scss';

.loading-container {
  padding: var(--spacing-lg);
}

.follow-up-form {
  margin-top: var(--text-2xl);
}

.parent-info {
  display: flex;
  align-items: center;
}

.parent-name {
  font-size: var(--text-base);
  font-weight: 500;
  margin-right: var(--spacing-2xl);
}

.parent-phone {
  margin-left: var(--spacing-2xl);
  color: var(--text-regular);
}

.app-card {
  background-color: var(--bg-white);
  border-radius: var(--spacing-xs);
  box-shadow: 0 2px var(--text-sm) 0 var(--shadow-light);
  padding: var(--spacing-lg);
}

.app-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.app-card-title {
  font-size: var(--text-lg);
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
}
</style> 