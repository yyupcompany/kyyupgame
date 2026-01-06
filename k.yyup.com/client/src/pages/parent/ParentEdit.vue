<template>
  <div class="page-container">
    <div class="app-card">
      <div class="app-card-header">
        <div class="app-card-title">{{ isEdit ? '编辑家长' : '添加家长' }}</div>
        <div class="card-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
        </div>
      </div>
      
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <div v-else class="parent-form">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          label-position="right"
        >
          <el-divider content-position="left">基本信息</el-divider>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" placeholder="请输入家长姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机号" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                  <el-option label="潜在家长" value="潜在家长" />
                  <el-option label="在读家长" value="在读家长" />
                  <el-option label="毕业家长" value="毕业家长" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="来源渠道" prop="source">
                <el-select v-model="form.source" placeholder="请选择来源渠道" style="width: 100%">
                  <el-option label="线上推广" value="线上推广" />
                  <el-option label="朋友介绍" value="朋友介绍" />
                  <el-option label="园区广告" value="园区广告" />
                  <el-option label="活动招生" value="活动招生" />
                  <el-option label="其他渠道" value="其他渠道" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="居住地址" prop="address">
            <el-input v-model="form.address" placeholder="请输入居住地址" />
          </el-form-item>
          
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
            />
          </el-form-item>
          
          <el-divider content-position="left">孩子信息</el-divider>
          
          <div class="children-list">
            <div v-for="(child, index) in form.children" :key="index" class="child-item">
              <div class="child-header">
                <h4>孩子 {{ index + 1 }}</h4>
                <el-button
                  type="danger"
                  size="small"
                  icon="Delete"
                  circle
                  @click="removeChild(index)"
                ></el-button>
              </div>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item
                    :label="'姓名'"
                    :prop="`children.${index}

.name`"
                    :rules="[{ required: true, message: '请输入孩子姓名', trigger: 'blur' }]"
                  >
                    <el-input v-model="child.name" placeholder="请输入孩子姓名" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    :label="'性别'"
                    :prop="`children.${index}

.gender`"
                    :rules="[{ required: true, message: '请选择性别', trigger: 'change' }]"
                  >
                    <el-select v-model="child.gender" placeholder="请选择性别" style="width: 100%">
                      <el-option label="男" value="男" />
                      <el-option label="女" value="女" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item
                    :label="'出生日期'"
                    :prop="`children.${index}

.birthday`"
                    :rules="[{ required: true, message: '请选择出生日期', trigger: 'change' }]"
                  >
                    <el-date-picker
                      v-model="child.birthday"
                      type="date"
                      placeholder="选择日期"
                      style="width: 100%"
                      value-format="YYYY-MM-DD"
                      @change="updateChildAge(index)"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    :label="'状态'"
                    :prop="`children.${index}

.status`"
                    :rules="[{ required: true, message: '请选择状态', trigger: 'change' }]"
                  >
                    <el-select v-model="child.status" placeholder="请选择状态" style="width: 100%">
                      <el-option label="未入学" value="未入学" />
                      <el-option label="小班在读" value="小班在读" />
                      <el-option label="中班在读" value="中班在读" />
                      <el-option label="大班在读" value="大班在读" />
                      <el-option label="已毕业" value="已毕业" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-divider v-if="index < form.children.length - 1" />
            </div>
            
            <div class="add-child-button">
              <el-button type="primary" plain @click="addChild" block>
                <UnifiedIcon name="Plus" />
                添加子女
              </el-button>
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { PARENT_ENDPOINTS } from '@/api/endpoints';
import { request } from '@/utils/request';
import type { ApiResponse } from '@/api/endpoints';

interface Child {
  id?: number;
  name: string;
  gender: string;
  age?: number;
  birthday: string;
  status: string;
}

interface ParentForm {
  id?: number;
  name: string;
  phone: string;
  status: string;
  registerDate?: string;
  source: string;
  address: string;
  remark: string;
  children: Child[];
}

export default defineComponent({
  name: 'ParentEdit',
  components: {
    Plus
  },
  props: {
    id: {
      type: Number,
  required: false
    },
    isEdit: {
      type: Boolean,
  default: false
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const formRef = ref<FormInstance>();
    const loading = ref(false);
    const submitting = ref(false);

    // 从路由参数中获取ID和编辑状态
    const parentId = computed(() => route.params.id ? Number(route.params.id) : props.id);
    const isEdit = computed(() => !!parentId.value || props.isEdit);
    
    // 表单数据
    const form = reactive<ParentForm>({
      name: '',
  phone: '',
  status: '潜在家长',
  source: '',
  address: '',
  remark: '',
  children: []
    });
    
    // 表单验证规则
    const rules = {
      name: [
        { required: true, message: '请输入家长姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
  phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ],
  status: [
        { required: true, message: '请选择状态', trigger: 'change' }
      ],
  source: [
        { required: true, message: '请选择来源渠道', trigger: 'change' }
      ],
  address: [
        { required: true, message: '请输入居住地址', trigger: 'blur' }
      ]
    };
    
    // 获取家长详情
    const fetchParentDetail = async () => {
      if (!parentId.value) return;

      loading.value = true;

      try {
        const response: ApiResponse = await request.get(PARENT_ENDPOINTS.GET_BY_ID(parentId.value));

        if (response.success && response.data) {
          // 填充表单
          Object.assign(form, response.data);

          // 获取孩子信息
          try {
            const childrenResponse: ApiResponse = await request.get(PARENT_ENDPOINTS.GET_CHILDREN(parentId.value));
            if (childrenResponse.success && childrenResponse.data) {
              form.children = childrenResponse.data;
            }
          } catch (error) {
            console.warn('获取孩子信息失败:', error);
          }
        } else {
          ElMessage.error(response.message || '获取家长详情失败');
        }
      } catch (error) {
        console.error('获取家长详情失败:', error);
        ElMessage.error('获取家长详情失败');
      } finally {
        loading.value = false;
      }
    };
    
    // 添加孩子
    const addChild = () => {
      form.children.push({
        name: '',
  gender: '',
  birthday: '',
  status: '未入学'
      });
    };
    
    // 删除孩子
    const removeChild = (index: number) => {
      form.children.splice(index, 1);
    };
    
    // 更新孩子年龄
    const updateChildAge = (index: number) => {
      const birthday = form.children[index].birthday;
      if (birthday) {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        form.children[index].age = age;
      }
    };
    
    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return;
      
      await formRef.value.validate(async (valid, fields) => {
        if (valid) {
          submitting.value = true;
          
          try {
            let response: ApiResponse;
            
            if (isEdit.value && parentId.value) {
              // 更新家长信息
              response = await request.put(PARENT_ENDPOINTS.UPDATE(parentId.value), form);
            } else {
              // 添加新家长
              response = await request.post(PARENT_ENDPOINTS.BASE, form);
            }

            if (response.success) {
              ElMessage.success(isEdit.value ? '家长信息更新成功' : '家长添加成功');
              router.push('/parent/list');
            } else {
              ElMessage.error(response.message || (isEdit.value ? '更新家长信息失败' : '添加家长失败'));
            }
          } catch (error) {
            console.error(isEdit.value ? '更新家长信息失败:' : '添加家长失败:', error);
            ElMessage.error(isEdit.value ? '更新家长信息失败' : '添加家长失败');
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
      if (isEdit.value) {
        fetchParentDetail();
      } else {
        // 默认添加一个孩子表单
        addChild();
      }
    });
    
    return {
      formRef,
      form,
      rules,
      loading,
      submitting,
      isEdit,
      parentId,
      addChild,
      removeChild,
      updateChildAge,
      handleSubmit,
      goBack
    };
  }
});
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.loading-container {
  padding: var(--spacing-lg);
}

.parent-form {
  margin-top: var(--text-2xl);
}

.child-item {
  margin-bottom: var(--text-2xl);
  padding: var(--spacing-lg);
  background-color: #f8f8f8;
  border-radius: var(--spacing-xs);
}

.child-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.child-header h4 {
  margin: 0;
  font-size: var(--text-base);
  color: var(--text-primary);
}

.add-child-button {
  margin-top: var(--text-2xl);
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

:deep(.el-button--dashed) {
  border-style: dashed;
}
</style> 