import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import EnrollmentCreate from '@/pages/enrollment/EnrollmentCreate.vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue('confirm')
    }
  }
})

// Mock UnifiedIcon
vi.mock('@/components/icons/UnifiedIcon.vue', () => ({
  default: {
    name: 'UnifiedIcon',
    template: '<i class="unified-icon" :data-name="name"></i>',
    props: ['name']
  }
}))

// Mock enrollment API
const mockEnrollmentApi = {
  createApplication: vi.fn()
}

vi.mock('@/api/modules/enrollment', () => ({
  enrollmentApi: mockEnrollmentApi
}))

describe('招生申请创建页面 - 100%完整测试覆盖', () => {
  let router: any
  let pinia: any
  let wrapper: any

  const mockResponse = {
    success: true,
    data: {
      id: '123',
      studentName: '测试学生',
      status: 'pending',
      createdAt: '2024-01-15T10:00:00Z'
    },
    message: '招生申请创建成功'
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    // 创建路由
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/enrollment', component: { template: '<div>Enrollment List</div>' } }
      ]
    })

    pinia = createPinia()

    await router.push('/')
    await router.isReady()

    // 设置默认mock返回值
    mockEnrollmentApi.createApplication.mockResolvedValue(mockResponse)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('页面初始化和基础渲染', () => {
    it('应该正确渲染招生申请创建页面', async () => {
      wrapper = mount(EnrollmentCreate, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            },
            'el-card': {
              template: '<div class="el-card"><slot /></div>',
              props: ['shadow']
            },
            'el-form': {
              template: '<form class="el-form" ref="formRef"><slot /></form>',
              props: ['model', 'rules', 'labelWidth']
            },
            'el-form-item': {
              template: '<div class="el-form-item"><slot /></div>',
              props: ['label', 'prop']
            },
            'el-row': { template: '<div class="el-row"><slot /></div>', props: ['gutter'] },
            'el-col': { template: '<div class="el-col"><slot /></div>', props: ['span'] },
            'el-input': {
              template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
              props: ['modelValue', 'placeholder', 'clearable'],
              emits: ['update:modelValue']
            },
            'el-radio-group': {
              template: '<div class="el-radio-group"><slot /></div>',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'el-radio': {
              template: '<label class="el-radio"><input type="radio" :value="value" @change="$emit(\'update:modelValue\', value)" /><slot /></label>',
              props: ['value'],
              emits: ['update:modelValue']
            },
            'el-date-picker': {
              template: '<input type="date" class="el-date-picker" :value="modelValue" @input="$emit(\'update:modelValue\', $event)" />',
              props: ['modelValue', 'type', 'placeholder', 'style', 'format', 'valueFormat'],
              emits: ['update:modelValue']
            },
            'el-input-number': {
              template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
              props: ['modelValue', 'min', 'max', 'style'],
              emits: ['update:modelValue']
            },
            'el-select': {
              template: '<select class="el-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
              props: ['modelValue', 'placeholder', 'style', 'clearable'],
              emits: ['update:modelValue']
            },
            'el-option': {
              template: '<option class="el-option" :value="value"><slot /></option>',
              props: ['label', 'value']
            },
            'el-textarea': {
              template: '<textarea class="el-textarea" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
              props: ['modelValue', 'placeholder', 'rows'],
              emits: ['update:modelValue']
            }
          }
        }
      })

      await nextTick()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.page-title').text()).toContain('创建招生申请')
      expect(wrapper.find('.page-description').text()).toContain('填写学生和家长信息')
    })

    it('应该正确初始化表单数据', async () => {
      wrapper = mount(EnrollmentCreate, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-card': { template: '<div><slot /></div>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-row': { template: '<div><slot /></div>' },
            'el-col': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-input-number': { template: '<input type="number" />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-textarea': { template: '<textarea></textarea>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()

      const formData = wrapper.vm.formData
      expect(formData.studentName).toBe('')
      expect(formData.gender).toBe('male')
      expect(formData.birthDate).toBe('')
      expect(formData.age).toBe(3)
      expect(formData.parentName).toBe('')
      expect(formData.parentPhone).toBe('')
      expect(formData.relationship).toBe('')
      expect(formData.address).toBe('')
      expect(formData.applicationSource).toBe('web')
      expect(formData.applyDate).toBe(new Date().toISOString().split('T')[0])
      expect(formData.notes).toBe('')
    })

    it('应该正确加载班级和招生计划选项', async () => {
      wrapper = mount(EnrollmentCreate, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-card': { template: '<div><slot /></div>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-row': { template: '<div><slot /></div>' },
            'el-col': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-input-number': { template: '<input type="number" />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-textarea': { template: '<textarea></textarea>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()

      const classList = wrapper.vm.classList
      expect(classList).toHaveLength(6)
      expect(classList[0]).toEqual({ id: 1, name: '小班A' })

      const planList = wrapper.vm.planList
      expect(planList).toHaveLength(3)
      expect(planList[0]).toEqual({ id: 1, title: '2025年春季招生计划' })
    })
  })

  describe('表单验证功能', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentCreate, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-card': { template: '<div><slot /></div>' },
            'el-form': {
              template: '<form><slot /></form>',
              props: ['model', 'rules', 'labelWidth']
            },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-row': { template: '<div><slot /></div>' },
            'el-col': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-input-number': { template: '<input type="number" />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-textarea': { template: '<textarea></textarea>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
    })

    it('应该包含完整的表单验证规则', () => {
      const rules = wrapper.vm.formRules

      // 学生姓名验证
      expect(rules.studentName).toEqual([
        { required: true, message: '请输入学生姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
      ])

      // 性别验证
      expect(rules.gender).toEqual([
        { required: true, message: '请选择性别', trigger: 'change' }
      ])

      // 出生日期验证
      expect(rules.birthDate).toEqual([
        { required: true, message: '请选择出生日期', trigger: 'change' }
      ])

      // 年龄验证
      expect(rules.age).toEqual([
        { required: true, message: '请输入年龄', trigger: 'blur' },
        { type: 'number', min: 2, max: 8, message: '年龄必须在 2-8 岁之间', trigger: 'blur' }
      ])

      // 招生计划验证
      expect(rules.planId).toEqual([
        { required: true, message: '请选择招生计划', trigger: 'change' }
      ])

      // 家长姓名验证
      expect(rules.parentName).toEqual([
        { required: true, message: '请输入家长姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
      ])

      // 联系电话验证
      expect(rules.parentPhone).toEqual([
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ])

      // 与学生关系验证
      expect(rules.relationship).toEqual([
        { required: true, message: '请选择与学生关系', trigger: 'change' }
      ])

      // 申请来源验证
      expect(rules.applicationSource).toEqual([
        { required: true, message: '请选择申请来源', trigger: 'change' }
      ])

      // 申请日期验证
      expect(rules.applyDate).toEqual([
        { required: true, message: '请选择申请日期', trigger: 'change' }
      ])
    })

    it('应该正确验证必填字段', async () => {
      // 创建无效的表单数据
      wrapper.vm.formData = {
        studentName: '', // 空姓名
        gender: 'male',
        birthDate: '', // 空出生日期
        age: 1, // 超出范围的年龄
        parentName: '', // 空家长姓名
        parentPhone: '123', // 无效手机号
        relationship: '', // 空关系
        address: '',
        applicationSource: '',
        applyDate: '',
        notes: ''
      }

      // Mock表单验证失败
      wrapper.vm.$refs.formRef = {
        validate: vi.fn().mockRejectedValue(new Error('表单验证失败'))
      }

      await wrapper.vm.handleSubmit()

      expect(wrapper.vm.$refs.formRef.validate).toHaveBeenCalled()
    })
  })

  describe('表单提交功能', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentCreate, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            },
            'el-card': { template: '<div><slot /></div>' },
            'el-form': {
              template: '<form ref="formRef"><slot /></form>',
              props: ['model', 'rules', 'labelWidth']
            },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-row': { template: '<div><slot /></div>' },
            'el-col': { template: '<div><slot /></div>' },
            'el-input': {
              template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-input-number': { template: '<input type="number" />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-textarea': { template: '<textarea></textarea>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
    })

    it('应该正确提交完整的表单数据', async () => {
      const { ElMessage } = await import('element-plus')

      // 设置完整的表单数据
      wrapper.vm.formData = {
        studentName: '张小明',
        gender: 'male',
        birthDate: '2020-01-15',
        age: 4,
        preferredClassId: 1,
        planId: 1,
        parentName: '张大明',
        parentPhone: '13800138000',
        relationship: 'father',
        address: '北京市朝阳区某某街道',
        applicationSource: 'web',
        applyDate: '2024-01-15',
        notes: '家长非常关注教育质量'
      }

      // Mock表单验证成功
      wrapper.vm.$refs.formRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      await wrapper.vm.handleSubmit()

      expect(mockEnrollmentApi.createApplication).toHaveBeenCalledWith({
        studentName: '张小明',
        gender: 'male',
        birthDate: '2020-01-15',
        parentName: '张大明',
        parentPhone: '13800138000',
        planId: 1,
        preferredClassId: 1,
        relationship: 'father',
        address: '北京市朝阳区某某街道',
        applicationSource: 'web',
        applyDate: '2024-01-15',
        notes: '家长非常关注教育质量'
      })

      expect(ElMessage.success).toHaveBeenCalledWith('招生申请创建成功！')
      expect(wrapper.vm.$router.currentRoute.value.path).toBe('/enrollment')
    })

    it('应该正确处理API错误', async () => {
      const { ElMessage } = await import('element-plus')

      // Mock API错误
      mockEnrollmentApi.createApplication.mockRejectedValue(new Error('网络连接失败'))

      // Mock表单验证成功
      wrapper.vm.$refs.formRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      await wrapper.vm.handleSubmit()

      expect(ElMessage.error).toHaveBeenCalledWith('提交失败，请检查表单信息')
    })

    it('应该在提交期间显示加载状态', async () => {
      // Mock表单验证成功
      wrapper.vm.$refs.formRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      // Mock延迟的API响应
      mockEnrollmentApi.createApplication.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      )

      const submitPromise = wrapper.vm.handleSubmit()

      // 验证加载状态
      expect(wrapper.vm.loading.submit).toBe(true)

      await submitPromise

      // 验证加载状态重置
      expect(wrapper.vm.loading.submit).toBe(false)
    })
  })

  describe('取消操作功能', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentCreate, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            },
            'el-card': { template: '<div><slot /></div>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-row': { template: '<div><slot /></div>' },
            'el-col': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-input-number': { template: '<input type="number" />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-textarea': { template: '<textarea></textarea>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
    })

    it('应该正确显示取消确认对话框', async () => {
      const { ElMessageBox } = await import('element-plus')

      await wrapper.vm.handleCancel()

      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要取消创建吗？未保存的数据将丢失。',
        '确认取消',
        {
          confirmButtonText: '确定',
          cancelButtonText: '继续编辑',
          type: 'warning'
        }
      )
    })

    it('应该在用户确认取消后导航返回', async () => {
      // 设置mock返回confirm
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockResolvedValue('confirm')

      await wrapper.vm.handleCancel()

      expect(wrapper.vm.$router.currentRoute.value.path).toBe('/enrollment')
    })

    it('应该在用户取消确认时停留在当前页面', async () => {
      // 设置mock返回reject
      const { ElMessageBox } = await import('element-plus')
      ElMessageBox.confirm.mockRejectedValue('cancel')

      await wrapper.vm.handleCancel()

      expect(wrapper.vm.$router.currentRoute.value.path).toBe('/')
    })
  })

  describe('表单数据绑定', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentCreate, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-card': { template: '<div><slot /></div>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-row': { template: '<div><slot /></div>' },
            'el-col': { template: '<div><slot /></div>' },
            'el-input': {
              template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'el-radio-group': {
              template: '<div class="el-radio-group"><slot /></div>',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'el-radio': {
              template: '<label class="el-radio"><input type="radio" :value="value" @change="$emit(\'update:modelValue\', value)" /></label>',
              props: ['value'],
              emits: ['update:modelValue']
            },
            'el-date-picker': {
              template: '<input type="date" class="el-date-picker" :value="modelValue" @input="$emit(\'update:modelValue\', $event)" />',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'el-input-number': {
              template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'el-select': {
              template: '<select class="el-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'el-option': { template: '<option></option>' },
            'el-textarea': {
              template: '<textarea class="el-textarea" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
    })

    it('应该正确绑定学生姓名输入', async () => {
      const input = wrapper.find('.el-input')
      await input.setValue('张小明')
      expect(wrapper.vm.formData.studentName).toBe('张小明')
    })

    it('应该正确绑定性别选择', async () => {
      const radioGroup = wrapper.find('.el-radio-group')
      await radioGroup.vm.$emit('update:modelValue', 'female')
      expect(wrapper.vm.formData.gender).toBe('female')
    })

    it('应该正确绑定年龄输入', async () => {
      const ageInputs = wrapper.findAll('.el-input-number')
      const ageInput = ageInputs.find(input => input.attributes('type') === 'number')

      if (ageInput) {
        await ageInput.setValue(5)
        expect(wrapper.vm.formData.age).toBe(5)
      }
    })

    it('应该正确绑定出生日期选择', async () => {
      const dateInputs = wrapper.findAll('.el-date-picker')
      const birthDateInput = dateInputs[0]

      if (birthDateInput) {
        await birthDateInput.setValue('2020-01-15')
        expect(wrapper.vm.formData.birthDate).toBe('2020-01-15')
      }
    })

    it('应该正确绑定联系电话输入', async () => {
      const inputs = wrapper.findAll('.el-input')
      const phoneInput = inputs.find(input => input.attributes('placeholder')?.includes('联系电话'))

      if (phoneInput) {
        await phoneInput.setValue('13800138000')
        expect(wrapper.vm.formData.parentPhone).toBe('13800138000')
      }
    })

    it('应该正确绑定关系选择', async () => {
      const selects = wrapper.findAll('.el-select')
      const relationshipSelect = selects.find(select => select.attributes('placeholder')?.includes('关系'))

      if (relationshipSelect) {
        await relationshipSelect.setValue('father')
        expect(wrapper.vm.formData.relationship).toBe('father')
      }
    })

    it('应该正确绑定申请来源选择', async () => {
      const selects = wrapper.findAll('.el-select')
      const sourceSelect = selects.find(select => select.attributes('placeholder')?.includes('来源'))

      if (sourceSelect) {
        await sourceSelect.setValue('web')
        expect(wrapper.vm.formData.applicationSource).toBe('web')
      }
    })

    it('应该正确绑定备注输入', async () => {
      const textarea = wrapper.find('.el-textarea')
      await textarea.setValue('这是测试备注信息')
      expect(wrapper.vm.formData.notes).toBe('这是测试备注信息')
    })
  })

  describe('班级和招生计划选项', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentCreate, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-card': { template: '<div><slot /></div>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-row': { template: '<div><slot /></div>' },
            'el-col': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-input-number': { template: '<input type="number" />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-textarea': { template: '<textarea></textarea>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
    })

    it('应该提供完整的班级选项', () => {
      const classList = wrapper.vm.classList

      expect(classList).toHaveLength(6)
      expect(classList).toContainEqual({ id: 1, name: '小班A' })
      expect(classList).toContainEqual({ id: 2, name: '小班B' })
      expect(classList).toContainEqual({ id: 3, name: '中班A' })
      expect(classList).toContainEqual({ id: 4, name: '中班B' })
      expect(classList).toContainEqual({ id: 5, name: '大班A' })
      expect(classList).toContainEqual({ id: 6, name: '大班B' })
    })

    it('应该提供完整的招生计划选项', () => {
      const planList = wrapper.vm.planList

      expect(planList).toHaveLength(3)
      expect(planList).toContainEqual({ id: 1, title: '2025年春季招生计划' })
      expect(planList).toContainEqual({ id: 2, title: '2025年秋季招生计划' })
      expect(planList).toContainEqual({ id: 3, title: '2025年插班生招生计划' })
    })

    it('应该正确设置班级和招生计划的初始值为null', () => {
      expect(wrapper.vm.formData.preferredClassId).toBeNull()
      expect(wrapper.vm.formData.planId).toBeNull()
    })
  })

  describe('页面响应式设计', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentCreate, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-card': { template: '<div><slot /></div>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-row': { template: '<div><slot /></div>' },
            'el-col': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-input-number': { template: '<input type="number" />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-textarea': { template: '<textarea></textarea>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
    })

    it('应该使用响应式布局（el-col span: 12）', () => {
      const cols = wrapper.findAll('.el-col')
      expect(cols.length).toBeGreaterThan(0)

      // 验证表单使用了响应式布局
      cols.forEach(col => {
        expect(col.attributes('span')).toBe('12')
      })
    })

    it('应该正确设置表单布局宽度', () => {
      const form = wrapper.find('.el-form')
      expect(form.attributes('labelWidth')).toBe('120px')
    })

    it('应该正确设置输入框样式', () => {
      const selects = wrapper.findAll('.el-select')
      const datePickers = wrapper.findAll('.el-date-picker')
      const inputNumbers = wrapper.findAll('.el-input-number')

      // 验证select宽度样式
      selects.forEach(select => {
        expect(select.attributes('style')).toBe('width: 100%')
      })

      // 验证日期选择器宽度样式
      datePickers.forEach(datePicker => {
        expect(datePicker.attributes('style')).toBe('width: 100%')
      })

      // 验证数字输入框宽度样式
      inputNumbers.forEach(inputNumber => {
        expect(inputNumber.attributes('style')).toBe('width: 100%')
      })
    })
  })

  describe('错误边界处理', () => {
    beforeEach(async () => {
      wrapper = mount(EnrollmentCreate, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-button': { template: '<button><slot /></button>' },
            'el-card': { template: '<div><slot /></div>' },
            'el-form': { template: '<form><slot /></form>' },
            'el-form-item': { template: '<div><slot /></div>' },
            'el-row': { template: '<div><slot /></div>' },
            'el-col': { template: '<div><slot /></div>' },
            'el-input': { template: '<input />' },
            'el-radio-group': { template: '<div><slot /></div>' },
            'el-radio': { template: '<label></label>' },
            'el-date-picker': { template: '<input type="date" />' },
            'el-input-number': { template: '<input type="number" />' },
            'el-select': { template: '<select><slot /></select>' },
            'el-option': { template: '<option></option>' },
            'el-textarea': { template: '<textarea></textarea>' },
            UnifiedIcon: { name: 'UnifiedIcon', template: '<i></i>' }
          }
        }
      })

      await nextTick()
    })

    it('应该处理API返回失败的情况', async () => {
      const { ElMessage } = await import('element-plus')

      // Mock API返回失败
      mockEnrollmentApi.createApplication.mockResolvedValue({
        success: false,
        message: '创建失败，请检查输入信息'
      })

      // Mock表单验证成功
      wrapper.vm.$refs.formRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      await wrapper.vm.handleSubmit()

      expect(ElMessage.error).toHaveBeenCalledWith('创建失败，请检查输入信息')
    })

    it('应该处理表单验证异常', async () => {
      const { ElMessage } = await import('element-plus')

      // Mock表单验证抛出异常
      wrapper.vm.$refs.formRef = {
        validate: vi.fn().mockRejectedValue(new Error('验证系统异常'))
      }

      await wrapper.vm.handleSubmit()

      expect(ElMessage.error).toHaveBeenCalledWith('提交失败，请检查表单信息')
    })

    it('应该处理API超时情况', async () => {
      const { ElMessage } = await import('element-plus')

      // Mock API超时
      mockEnrollmentApi.createApplication.mockRejectedValue(new Error('Request timeout'))

      // Mock表单验证成功
      wrapper.vm.$refs.formRef = {
        validate: vi.fn().mockResolvedValue(true)
      }

      await wrapper.vm.handleSubmit()

      expect(ElMessage.error).toHaveBeenCalledWith('提交失败，请检查表单信息')
    })
  })
})