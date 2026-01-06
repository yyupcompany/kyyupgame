<template>
  <div class="page-container">
    <div class="page-header">
      <h1>{{ isEdit ? '编辑教师' : '添加教师' }}</h1>
      <div class="page-actions">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </div>
    </div>
    
    <el-card v-loading="loading" class="edit-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        label-position="right"
        status-icon
      >
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入教师姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio :value="'MALE'">男</el-radio>
                <el-radio :value="'FEMALE'">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电子邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入电子邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-select v-model="form.position" placeholder="请选择职位">
                <el-option
                  v-for="(label, value) in positionOptions"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="教师编号" prop="teacherNo">
              <el-input v-model="form.teacherNo" placeholder="请输入教师编号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="幼儿园" prop="kindergartenId">
              <el-select v-model="form.kindergartenId" placeholder="请选择幼儿园">
                <el-option
                  v-for="kindergarten in kindergartenOptions"
                  :key="kindergarten.id"
                  :label="kindergarten.name"
                  :value="kindergarten.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态">
                <el-option
                  v-for="(label, value) in statusOptions"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-input v-model="form.department" placeholder="请输入部门" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职日期" prop="hireDate">
              <el-date-picker
                v-model="form.hireDate"
                type="date"
                placeholder="选择入职日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">教育背景</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学历" prop="education.degree">
              <el-select v-model="form.education.degree" placeholder="请选择学历">
                <el-option label="博士" value="博士" />
                <el-option label="硕士" value="硕士" />
                <el-option label="本科" value="本科" />
                <el-option label="专科" value="专科" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业" prop="education.major">
              <el-input v-model="form.education.major" placeholder="请输入专业" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="毕业院校" prop="education.school">
              <el-input v-model="form.education.school" placeholder="请输入毕业院校" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="毕业年份" prop="education.graduationYear">
              <el-date-picker
                v-model="form.education.graduationYear"
                type="year"
                placeholder="选择毕业年份"
                format="YYYY"
                value-format="YYYY"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">专业技能与证书</el-divider>
        <el-form-item label="专业技能" prop="skills">
          <el-tag
            v-for="(skill, index) in form.skills"
            :key="index"
            closable
            :disable-transitions="false"
            @close="handleRemoveSkill(skill)"
            class="skill-tag"
          >
            {{ skill }}
          </el-tag>
          <el-input
            v-if="skillInputVisible"
            ref="skillInputRef"
            v-model="skillInputValue"
            class="tag-input"
            size="small"
            @keyup.enter="handleAddSkill"
            @blur="handleAddSkill"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showSkillInput">
            + 添加技能
          </el-button>
        </el-form-item>
        
        <el-form-item label="证书" prop="certification">
          <el-tag
            v-for="(cert, index) in form.certification"
            :key="index"
            closable
            type="success"
            :disable-transitions="false"
            @close="handleRemoveCert(cert)"
            class="skill-tag"
          >
            {{ cert }}
          </el-tag>
          <el-input
            v-if="certInputVisible"
            ref="certInputRef"
            v-model="certInputValue"
            class="tag-input"
            size="small"
            @keyup.enter="handleAddCert"
            @blur="handleAddCert"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showCertInput">
            + 添加证书
          </el-button>
        </el-form-item>
        
        <el-divider content-position="left">其他信息</el-divider>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, nextTick, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { TEACHER_ENDPOINTS } from '@/api/endpoints'
import { get, post, put } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { createTeacher, updateTeacher, getTeacherDetail } from '@/api/modules/teacher'

// 教师状态枚举
const TeacherStatus = {
  ACTIVE: 'ACTIVE',
  LEAVE: 'LEAVE',
  RESIGNED: 'RESIGNED',
  SUSPENDED: 'SUSPENDED'
} as const

// 教师类型枚举
const TeacherType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERN: 'INTERN'
} as const

type TeacherStatusType = typeof TeacherStatus[keyof typeof TeacherStatus]
type TeacherTypeType = typeof TeacherType[keyof typeof TeacherType]

// 教师接口
interface Teacher {
  id: number | string
  name: string
  gender?: 'MALE' | 'FEMALE'
  phone: string
  email?: string
  employeeId?: string
  department?: string
  title: string
  status: TeacherStatusType
  type: TeacherTypeType
  hireDate: string
  skills?: string[]
  certification?: string[]
  education?: {
    degree: string
    major: string
    school: string
    graduationYear: string | number
  }
  createdAt: string
  updatedAt: string
}

// 表单类型
interface TeacherForm {
  name: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  email: string;
  position: number;
  teacherNo: string;
  kindergartenId: number;
  status: number;
  department: string;
  hireDate: string;
  education: {
    degree: string;
    major: string;
    school: string;
    graduationYear: string;
  };
  skills: string[];
  certification: string[];
  remark?: string;
}

// 创建教师参数
interface TeacherCreateParams {
  name: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  email?: string;
  title: string;
  employeeId?: string;
  type: TeacherTypeType;
  status: TeacherStatusType;
  department?: string;
  hireDate: string;
  education?: {
    degree: string;
    major: string;
    school: string;
    graduationYear?: number;
  };
  skills?: string[];
  certification?: string[];
}

export default defineComponent({
  name: 'TeacherEdit',
  props: {
    id: {
      type: [String, Number],
      default: ''
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const formRef = ref<FormInstance>()
    const loading = ref(false)
    const submitting = ref(false)

    // 计算是否为编辑模式
    const isEdit = computed(() => {
      return props.isEdit || route.path.includes('/edit/') || (route.params.id && route.params.id !== 'undefined')
    })
    
    // 技能输入相关
    const skillInputVisible = ref(false)
    const skillInputValue = ref('')
    const skillInputRef = ref<HTMLInputElement>()
    
    // 证书输入相关
    const certInputVisible = ref(false)
    const certInputValue = ref('')
    const certInputRef = ref<HTMLInputElement>()
    
    // 表单数据
    const form = reactive<TeacherForm>({
      name: '',
      gender: 'MALE',
      phone: '',
      email: '',
      position: 1,
      teacherNo: '',
      kindergartenId: 1,
      status: 1,
      department: '',
      hireDate: '',
      education: {
        degree: '',
        major: '',
        school: '',
        graduationYear: ''
      },
      skills: [],
      certification: [],
      remark: ''
    })
    
    // 状态选项
    const statusOptions = {
      1: '在职',
      0: '离职',
      2: '停职',
      3: '请假'
    }
    
    // 职位选项
    const positionOptions = {
      1: '园长',
      2: '副园长',
      3: '主任',
      4: '主班老师',
      5: '配班老师',
      6: '保育员',
      7: '其他'
    }
    
    // 幼儿园选项
    const kindergartenOptions = ref<Array<{id: number, name: string}>>([])
    
    // 获取幼儿园列表
    const fetchKindergartens = async () => {
      try {
        const res = await get('/api/kindergartens')
        if (res.success) {
          kindergartenOptions.value = res.data || []
        }
      } catch (error) {
        console.error('获取幼儿园列表失败:', error)
      }
    }
    
    // 表单验证规则
    const rules = reactive<FormRules>({
      name: [
        { required: true, message: '请输入教师姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      gender: [
        { required: true, message: '请选择性别', trigger: 'change' }
      ],
      phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      email: [
        { pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, message: '请输入正确的邮箱地址', trigger: 'blur' }
      ],
      position: [
        { required: true, message: '请选择职位', trigger: 'change' }
      ],
      kindergartenId: [
        { required: true, message: '请选择幼儿园', trigger: 'change' }
      ],
      status: [
        { required: true, message: '请选择状态', trigger: 'change' }
      ]
    })
    
    // 获取教师详情
    const fetchTeacherDetail = async () => {
      // 更严格的参数验证
      const id = props.id || route.params.id
      if (!id || id === 'undefined' || id === undefined || id === null || String(id).trim() === '') {
        console.error('❌ TeacherEdit: 教师ID无效', { id, type: typeof id })
        return
      }

      const validId = String(id).trim()
      if (validId === 'undefined' || validId === 'null' || validId === '') {
        console.error('❌ TeacherEdit: 教师ID转换后无效', { id, validId })
        return
      }
      
      console.log('✅ TeacherEdit: 开始获取教师详情', { teacherId: validId })
      loading.value = true
      try {
        const res = await getTeacherDetail(validId) as ApiResponse<Teacher>
        
        if (res.success || res.code === 200) {
          const teacherData = res.data
          
          if (teacherData) {
            // 填充表单数据
            form.name = teacherData.name || ''
            form.gender = teacherData.gender || 'MALE'
            form.phone = teacherData.phone || ''
            form.email = teacherData.email || ''
            form.position = teacherData.position || 1
            form.teacherNo = teacherData.teacherNo || ''
            form.kindergartenId = teacherData.kindergartenId || 1
            form.status = teacherData.status || 1
            form.department = teacherData.department || ''
            form.hireDate = teacherData.hireDate || ''
            form.remark = teacherData.remark || ''
            
            // 教育背景
            if (teacherData.education) {
              form.education.degree = teacherData.education.degree || ''
              form.education.major = teacherData.education.major || ''
              form.education.school = teacherData.education.school || ''
              form.education.graduationYear = teacherData.education.graduationYear?.toString() || ''
            }
            
            // 技能和证书
            form.skills = teacherData.skills || []
            form.certification = teacherData.certification || []
          }
        } else {
          ElMessage.error(res.message || '获取教师详情失败')
        }
      } catch (error) {
        handleError('获取教师详情失败', error)
      } finally {
        loading.value = false
      }
    }
    
    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid: boolean) => {
        if (valid) {
          submitting.value = true
          
          try {
            // 构造提交数据 - 匹配后端API期望的格式
            const submitData = {
              name: form.name,
              gender: form.gender,
              phone: form.phone,
              email: form.email,
              position: form.position,
              teacherNo: form.teacherNo,
              kindergartenId: form.kindergartenId,
              status: form.status,
              department: form.department,
              hireDate: form.hireDate,
              remark: form.remark,
              education: {
                degree: form.education.degree,
                major: form.education.major,
                school: form.education.school,
                graduationYear: form.education.graduationYear ? parseInt(form.education.graduationYear) : undefined
              },
              skills: form.skills,
              certification: form.certification
            }
            
            let res
            if (isEdit.value) {
              // 更新教师 - 添加参数验证
              const id = props.id || route.params.id
              if (!id || id === 'undefined' || id === undefined || id === null || String(id).trim() === '') {
                ElMessage.error('教师ID无效，无法更新')
                return
              }

              const validId = String(id).trim()
              if (validId === 'undefined' || validId === 'null' || validId === '') {
                ElMessage.error('教师ID无效，无法更新')
                return
              }

              console.log('✅ TeacherEdit: 开始更新教师', { teacherId: validId })
              res = await updateTeacher(validId, submitData) as ApiResponse<Teacher>
            } else {
              // 创建教师
              console.log('✅ TeacherEdit: 开始创建教师', submitData)
              res = await createTeacher(submitData) as ApiResponse<Teacher>
            }

            if (res.success || res.code === 200) {
              ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
              router.push('/teacher')
            } else {
              ElMessage.error(res.message || (isEdit.value ? '更新失败' : '添加失败'))
            }
          } catch (error) {
            handleError('保存教师信息失败', error)
          } finally {
            submitting.value = false
          }
        }
      })
    }
    
    // 返回上一页
    const goBack = () => {
      router.back()
    }
    
    // 显示技能输入框
    const showSkillInput = () => {
      skillInputVisible.value = true
      nextTick(() => {
        skillInputRef.value?.focus()
      })
    }
    
    // 添加技能
    const handleAddSkill = () => {
      if (skillInputValue.value) {
        if (!form.skills.includes(skillInputValue.value)) {
          form.skills.push(skillInputValue.value)
        }
      }
      skillInputVisible.value = false
      skillInputValue.value = ''
    }
    
    // 移除技能
    const handleRemoveSkill = (skill: string) => {
      const index = form.skills.indexOf(skill)
      if (index !== -1) {
        form.skills.splice(index, 1)
      }
    }
    
    // 显示证书输入框
    const showCertInput = () => {
      certInputVisible.value = true
      nextTick(() => {
        certInputRef.value?.focus()
      })
    }
    
    // 添加证书
    const handleAddCert = () => {
      if (certInputValue.value) {
        if (!form.certification.includes(certInputValue.value)) {
          form.certification.push(certInputValue.value)
        }
      }
      certInputVisible.value = false
      certInputValue.value = ''
    }
    
    // 移除证书
    const handleRemoveCert = (cert: string) => {
      const index = form.certification.indexOf(cert)
      if (index !== -1) {
        form.certification.splice(index, 1)
      }
    }
    
    // 统一错误处理函数
    const handleError = (message: string, error: unknown): void => {
      console.error(message, error)
      ElMessage.error(`${message}: ${error instanceof Error ? error.message : '未知错误'}`)
    }
    
    // 监听路由参数变化，确保只在有效ID时调用API
    watch(
      () => route.params.id || props.id,
      (newId) => {
        console.log('✅ TeacherEdit: ID变化', { newId, type: typeof newId, isEdit: isEdit.value })
        if (isEdit.value && newId && newId !== 'undefined' && String(newId).trim() !== '') {
          const validId = String(newId).trim()
          if (validId !== 'undefined' && validId !== 'null' && validId !== '') {
            console.log('✅ TeacherEdit: 开始加载教师数据', { teacherId: validId })
            fetchTeacherDetail()
          }
        }
      },
      { immediate: true }
    )

    // 组件挂载时获取数据 - 添加安全检查
    onMounted(() => {
      // 总是加载幼儿园列表
      fetchKindergartens()
      
      if (isEdit.value) {
        // 延迟执行，确保props已经初始化
        nextTick(() => {
          const id = props.id || route.params.id
          if (id && id !== 'undefined' && String(id).trim() !== '') {
            const validId = String(id).trim()
            if (validId !== 'undefined' && validId !== 'null' && validId !== '') {
              console.log('✅ TeacherEdit: 组件挂载后加载数据', { teacherId: validId })
              fetchTeacherDetail()
            } else {
              console.warn('⚠️ TeacherEdit: 组件挂载时教师ID无效', { id })
            }
          } else {
            console.warn('⚠️ TeacherEdit: 组件挂载时教师ID为空', { id })
          }
        })
      }
    })
    
    return {
      formRef,
      form,
      rules,
      loading,
      submitting,
      statusOptions,
      positionOptions,
      kindergartenOptions,
      fetchKindergartens,
      skillInputVisible,
      skillInputValue,
      skillInputRef,
      certInputVisible,
      certInputValue,
      certInputRef,
      isEdit,
      handleSubmit,
      goBack,
      showSkillInput,
      handleAddSkill,
      handleRemoveSkill,
      showCertInput,
      handleAddCert,
      handleRemoveCert,
      handleError
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;
// 引入列表组件优化样式
@import "@/styles/list-components-optimization.scss";

/* 使用全局样式：.page-container, .page-header, .page-actions */

.page-header h1 {
  font-size: var(--text-2xl);
  margin: 0;
}

.edit-card {
  margin-bottom: var(--spacing-lg);
}

.skill-tag {
  margin-right: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.tag-input {
  width: var(--spacing-6xl);
  margin-right: var(--spacing-sm);
  vertical-align: bottom;
}

.button-new-tag {
  margin-bottom: var(--spacing-sm);
}
</style> 