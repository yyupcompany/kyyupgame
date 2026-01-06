<template>
  <div class="group-form-page">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">{{ isEdit ? '编辑集团' : '创建集团' }}</span>
      </template>
    </el-page-header>

    <div class="form-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        v-loading="loading"
      >
        <el-card header="基本信息" class="form-card">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="集团名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入集团名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="集团编码" prop="code">
                <el-input v-model="formData.code" placeholder="留空自动生成" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="集团类型" prop="type">
                <el-select v-model="formData.type" placeholder="请选择集团类型" style="width: 100%">
                  <el-option label="教育集团" :value="1" />
                  <el-option label="连锁品牌" :value="2" />
                  <el-option label="投资集团" :value="3" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="品牌名称" prop="brandName">
                <el-input v-model="formData.brandName" placeholder="请输入品牌名称" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="品牌口号" prop="slogan">
            <el-input v-model="formData.slogan" placeholder="请输入品牌口号" />
          </el-form-item>

          <el-form-item label="集团简介" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入集团简介"
            />
          </el-form-item>
        </el-card>

        <el-card header="法人信息" class="form-card">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="法人代表" prop="legalPerson">
                <el-input v-model="formData.legalPerson" placeholder="请输入法人代表" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="营业执照号" prop="businessLicense">
                <el-input v-model="formData.businessLicense" placeholder="请输入营业执照号" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="注册资本" prop="registeredCapital">
                <el-input-number
                  v-model="formData.registeredCapital"
                  :min="0"
                  :precision="2"
                  placeholder="请输入注册资本"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="成立日期" prop="establishedDate">
                <el-date-picker
                  v-model="formData.establishedDate"
                  type="date"
                  placeholder="请选择成立日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card header="联系信息" class="form-card">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="formData.phone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系邮箱" prop="email">
                <el-input v-model="formData.email" placeholder="请输入联系邮箱" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="官方网站" prop="website">
            <el-input v-model="formData.website" placeholder="请输入官方网站" />
          </el-form-item>

          <el-form-item label="总部地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入总部地址" />
          </el-form-item>
        </el-card>

        <el-card header="管理信息" class="form-card">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="董事长" prop="chairman">
                <el-input v-model="formData.chairman" placeholder="请输入董事长姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="CEO/总经理" prop="ceo">
                <el-input v-model="formData.ceo" placeholder="请输入CEO/总经理姓名" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="愿景使命" prop="vision">
            <el-input
              v-model="formData.vision"
              type="textarea"
              :rows="3"
              placeholder="请输入愿景使命"
            />
          </el-form-item>

          <el-form-item label="企业文化" prop="culture">
            <el-input
              v-model="formData.culture"
              type="textarea"
              :rows="3"
              placeholder="请输入企业文化"
            />
          </el-form-item>
        </el-card>

        <div class="form-actions">
          <el-button @click="handleBack">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { useGroupStore } from '@/stores/group';

const route = useRoute();
const router = useRouter();
const groupStore = useGroupStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const submitting = ref(false);

const isEdit = computed(() => !!route.params.id);
const groupId = computed(() => Number(route.params.id));

// 表单数据
const formData = reactive({
  name: '',
  code: '',
  type: 1,
  legalPerson: '',
  registeredCapital: undefined as number | undefined,
  businessLicense: '',
  establishedDate: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  logoUrl: '',
  brandName: '',
  slogan: '',
  description: '',
  vision: '',
  culture: '',
  chairman: '',
  ceo: '',
});

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入集团名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择集团类型', trigger: 'change' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
};

// 获取集团详情（编辑模式）
async function fetchGroupDetail() {
  if (!isEdit.value) return;

  try {
    loading.value = true;
    const detail = await groupStore.fetchGroupDetail(groupId.value);
    
    // 填充表单数据
    Object.assign(formData, {
      name: detail.name,
      code: detail.code,
      type: detail.type,
      legalPerson: detail.legalPerson,
      registeredCapital: detail.registeredCapital,
      businessLicense: detail.businessLicense,
      establishedDate: detail.establishedDate,
      address: detail.address,
      phone: detail.phone,
      email: detail.email,
      website: detail.website,
      logoUrl: detail.logoUrl,
      brandName: detail.brandName,
      slogan: detail.slogan,
      description: detail.description,
      vision: detail.vision,
      culture: detail.culture,
      chairman: detail.chairman,
      ceo: detail.ceo,
    });
  } catch (error: any) {
    ElMessage.error(error.message || '获取集团详情失败');
  } finally {
    loading.value = false;
  }
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    if (isEdit.value) {
      await groupStore.updateGroup(groupId.value, formData);
      ElMessage.success('更新成功');
    } else {
      await groupStore.createGroup(formData);
      ElMessage.success('创建成功');
    }

    router.push('/group/list');
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败');
    }
  } finally {
    submitting.value = false;
  }
}

// 返回
function handleBack() {
  router.back();
}

onMounted(() => {
  fetchGroupDetail();
});
</script>

<style scoped lang="scss">
.group-form-page {
  padding: var(--text-2xl);

  .page-title {
    font-size: var(--text-xl);
    font-weight: 600;
  }

  .form-content {
    margin-top: var(--text-2xl);

    .form-card {
      margin-bottom: var(--text-2xl);
    }

    .form-actions {
      display: flex;
      justify-content: center;
      gap: var(--text-2xl);
      margin-top: var(--spacing-8xl);
    }
  }
}
</style>

