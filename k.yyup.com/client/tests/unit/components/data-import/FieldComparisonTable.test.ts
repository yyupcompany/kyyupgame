import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import FieldComparisonTable from '@/components/data-import/FieldComparisonTable.vue'
import { ElMessage } from 'element-plus'

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Check: { name: 'Check' },
  Warning: { name: 'Warning' },
  QuestionFilled: { name: 'QuestionFilled' },
  Close: { name: 'Close' }
}))

describe('FieldComparisonTable.vue', () => {
  let router: Router
  let wrapper: any

  beforeEach(() => {
    // Setup Pinia
    const pinia = createPinia()
    setActivePinia(pinia)

    // Setup Router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div></div>' } }
      ]
    })

    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    const defaultProps = {
      comparisonTable: {
        willImport: [],
        willIgnore: [],
        missing: [],
        conflicts: []
      },
      summary: {
        totalSourceFields: 0,
        willImportCount: 0,
        willIgnoreCount: 0,
        missingRequiredCount: 0,
        conflictsCount: 0,
        canProceed: false,
        recommendation: '',
        userFriendlyMessage: ''
      }
    }

    return mount(FieldComparisonTable, {
      props: {
        ...defaultProps,
        ...props
      },
      global: {
        plugins: [router, pinia],
        mocks: {
          $t: (key: string) => key
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('renders the field comparison container correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.field-comparison-container').exists()).toBe(true)
    })

    it('renders summary section', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.summary-section').exists()).toBe(true)
      expect(wrapper.find('.summary-header').exists()).toBe(true)
      expect(wrapper.find('.summary-stats').exists()).toBe(true)
    })

    it('renders comparison tables section', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.comparison-tables').exists()).toBe(true)
    })

    it('renders action buttons', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.action-buttons').exists()).toBe(true)
    })

    it('has proper CSS classes applied', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.field-comparison-container').classes()).toContain('field-comparison-container')
    })
  })

  describe('Summary Section', () => {
    it('displays summary header with title and status tag', () => {
      wrapper = createWrapper({
        summary: {
          totalSourceFields: 10,
          willImportCount: 8,
          willIgnoreCount: 2,
          missingRequiredCount: 0,
          conflictsCount: 0,
          canProceed: true,
          recommendation: 'Can proceed',
          userFriendlyMessage: 'All good'
        }
      })
      
      const header = wrapper.find('.summary-header')
      expect(header.find('h3').text()).toBe('📊 字段映射分析结果')
      
      const statusTag = header.find('el-tag')
      expect(statusTag.exists()).toBe(true)
      expect(statusTag.text()).toBe('✅ 可以导入')
      expect(statusTag.attributes('type')).toBe('success')
    })

    it('shows danger status when cannot proceed', () => {
      wrapper = createWrapper({
        summary: {
          totalSourceFields: 10,
          willImportCount: 5,
          willIgnoreCount: 3,
          missingRequiredCount: 2,
          conflictsCount: 0,
          canProceed: false,
          recommendation: 'Cannot proceed',
          userFriendlyMessage: 'Missing required fields'
        }
      })
      
      const statusTag = wrapper.find('.summary-header el-tag')
      expect(statusTag.text()).toBe('❌ 需要处理')
      expect(statusTag.attributes('type')).toBe('danger')
    })

    it('displays summary statistics correctly', () => {
      wrapper = createWrapper({
        summary: {
          totalSourceFields: 10,
          willImportCount: 7,
          willIgnoreCount: 2,
          missingRequiredCount: 1,
          conflictsCount: 0,
          canProceed: false,
          recommendation: 'Test',
          userFriendlyMessage: 'Test message'
        }
      })
      
      const stats = wrapper.findAll('.stat-item')
      expect(stats.length).toBe(4) // total, willImport, willIgnore, missing
      
      const totalStat = stats[0]
      expect(totalStat.find('.stat-number').text()).toBe('10')
      expect(totalStat.find('.stat-label').text()).toBe('文档字段总数')
      
      const willImportStat = stats[1]
      expect(willImportStat.find('.stat-number').text()).toBe('7')
      expect(willImportStat.find('.stat-label').text()).toBe('将导入字段')
      
      const willIgnoreStat = stats[2]
      expect(willIgnoreStat.find('.stat-number').text()).toBe('2')
      expect(willIgnoreStat.find('.stat-label').text()).toBe('将忽略字段')
      
      const missingStat = stats[3]
      expect(missingStat.find('.stat-number').text()).toBe('1')
      expect(missingStat.find('.stat-label').text()).toBe('缺少必填字段')
    })

    it('applies correct CSS classes to stat items', () => {
      wrapper = createWrapper({
        summary: {
          totalSourceFields: 10,
          willImportCount: 7,
          willIgnoreCount: 2,
          missingRequiredCount: 1,
          conflictsCount: 0,
          canProceed: false,
          recommendation: 'Test',
          userFriendlyMessage: 'Test message'
        }
      })
      
      const stats = wrapper.findAll('.stat-item')
      expect(stats[0].classes()).not.toContain('success')
      expect(stats[1].classes()).toContain('success')
      expect(stats[2].classes()).toContain('warning')
      expect(stats[3].classes()).toContain('danger')
    })

    it('displays user message with alert', () => {
      wrapper = createWrapper({
        summary: {
          totalSourceFields: 5,
          willImportCount: 5,
          willIgnoreCount: 0,
          missingRequiredCount: 0,
          conflictsCount: 0,
          canProceed: true,
          recommendation: 'All fields mapped successfully',
          userFriendlyMessage: 'Your data is ready for import'
        }
      })
      
      const alert = wrapper.find('.user-message el-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.attributes('title')).toBe('All fields mapped successfully')
      expect(alert.attributes('description')).toBe('Your data is ready for import')
      expect(alert.attributes('type')).toBe('success')
    })
  })

  describe('Comparison Tables', () => {
    const mockWillImportData = [
      {
        sourceField: 'name',
        targetField: 'student_name',
        description: 'Student full name',
        dataType: 'string',
        sampleValue: 'John Doe',
        confidence: 0.95,
        required: true
      },
      {
        sourceField: 'age',
        targetField: 'student_age',
        description: 'Student age',
        dataType: 'integer',
        sampleValue: '5',
        confidence: 0.90,
        required: false
      }
    ]

    const mockWillIgnoreData = [
      {
        sourceField: 'notes',
        reason: 'Field not supported in target system',
        suggestion: 'Remove this field from your data',
        sampleValue: 'Some notes'
      }
    ]

    const mockConflictsData = [
      {
        sourceField: 'address',
        suggestedTarget: 'student_address',
        reason: 'Multiple possible matches found',
        confidence: 0.70
      }
    ]

    const mockMissingData = [
      {
        targetField: ' enrollment_date',
        description: 'Date when student enrolled',
        dataType: 'date',
        canUseDefault: true,
        defaultValue: '2024-01-01'
      }
    ]

    it('renders will import table when data exists', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: mockWillImportData,
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      
      const willImportSection = wrapper.find('.table-section.success')
      expect(willImportSection.exists()).toBe(true)
      expect(willImportSection.find('.section-title').text()).toContain('将导入的字段 (2)')
      
      const table = willImportSection.find('el-table')
      expect(table.exists()).toBe(true)
      
      const rows = table.findAll('el-table-column')
      expect(rows.length).toBeGreaterThan(0)
    })

    it('renders will ignore table when data exists', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [],
          willIgnore: mockWillIgnoreData,
          missing: [],
          conflicts: []
        }
      })
      
      const willIgnoreSection = wrapper.find('.table-section.warning')
      expect(willIgnoreSection.exists()).toBe(true)
      expect(willIgnoreSection.find('.section-title').text()).toContain('将忽略的字段 (1)')
    })

    it('renders conflicts table when data exists', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [],
          willIgnore: [],
          missing: [],
          conflicts: mockConflictsData
        }
      })
      
      const conflictsSection = wrapper.find('.table-section.danger')
      expect(conflictsSection.exists()).toBe(true)
      expect(conflictsSection.find('.section-title').text()).toContain('需要确认的字段 (1)')
    })

    it('renders missing table when data exists', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [],
          willIgnore: [],
          missing: mockMissingData,
          conflicts: []
        }
      })
      
      const missingSection = wrapper.find('.table-section.danger')
      expect(missingSection.exists()).toBe(true)
      expect(missingSection.find('.section-title').text()).toContain('缺少的必填字段 (1)')
    })

    it('does not render tables when no data exists', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [],
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      
      const tableSections = wrapper.findAll('.table-section')
      expect(tableSections.length).toBe(0)
    })

    it('displays will import data correctly in table', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: mockWillImportData,
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      
      const table = wrapper.find('.table-section.success el-table')
      const rows = table.findAll('tr')
      
      // Should have header row + data rows
      expect(rows.length).toBeGreaterThan(1)
      
      // Check that confidence progress bars are rendered
      const progressBars = table.findAll('el-progress')
      expect(progressBars.length).toBe(2)
    })

    it('displays ignore notice for will ignore section', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [],
          willIgnore: mockWillIgnoreData,
          missing: [],
          conflicts: []
        }
      })
      
      const ignoreNotice = wrapper.find('.ignore-notice')
      expect(ignoreNotice.exists()).toBe(true)
      expect(ignoreNotice.find('el-alert').exists()).toBe(true)
    })

    it('displays missing notice for missing fields section', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [],
          willIgnore: [],
          missing: mockMissingData,
          conflicts: []
        }
      })
      
      const missingNotice = wrapper.find('.missing-notice')
      expect(missingNotice.exists()).toBe(true)
      expect(missingNotice.find('el-alert').exists()).toBe(true)
    })

    it('shows confirm buttons for conflict fields', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [],
          willIgnore: [],
          missing: [],
          conflicts: mockConflictsData
        }
      })
      
      const confirmButton = wrapper.find('.table-section.danger el-button')
      expect(confirmButton.exists()).toBe(true)
      expect(confirmButton.text()).toBe('确认映射')
    })
  })

  describe('Action Buttons', () => {
    it('renders cancel and confirm buttons', () => {
      wrapper = createWrapper()
      
      const buttons = wrapper.findAll('.action-buttons el-button')
      expect(buttons.length).toBe(2)
      
      expect(buttons[0].text()).toBe('取消导入')
      expect(buttons[1].text()).toBe('确认导入')
    })

    it('disables confirm button when cannot proceed', () => {
      wrapper = createWrapper({
        summary: {
          totalSourceFields: 5,
          willImportCount: 3,
          willIgnoreCount: 2,
          missingRequiredCount: 1,
          conflictsCount: 0,
          canProceed: false,
          recommendation: 'Cannot proceed',
          userFriendlyMessage: 'Missing required fields'
        }
      })
      
      const confirmButton = wrapper.find('.action-buttons el-button[type="primary"]')
      expect(confirmButton.attributes('disabled')).toBeDefined()
      expect(confirmButton.text()).toBe('无法导入')
    })

    it('enables confirm button when can proceed', () => {
      wrapper = createWrapper({
        summary: {
          totalSourceFields: 5,
          willImportCount: 5,
          willIgnoreCount: 0,
          missingRequiredCount: 0,
          conflictsCount: 0,
          canProceed: true,
          recommendation: 'Can proceed',
          userFriendlyMessage: 'Ready for import'
        }
      })
      
      const confirmButton = wrapper.find('.action-buttons el-button[type="primary"]')
      expect(confirmButton.attributes('disabled')).toBeUndefined()
      expect(confirmButton.text()).toBe('确认导入')
    })
  })

  describe('Methods', () => {
    it('calculates confidence color correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.getConfidenceColor(0.95)).toBe('#67C23A')
      expect(wrapper.vm.getConfidenceColor(0.80)).toBe('#E6A23C')
      expect(wrapper.vm.getConfidenceColor(0.60)).toBe('#F56C6C')
    })

    it('handles confirm mapping action', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [
            { sourceField: 'name', targetField: 'student_name', required: true, dataType: 'string' }
          ],
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      
      const consoleSpy = vi.spyOn(console, 'log')
      
      wrapper.vm.confirmMapping({ sourceField: 'test' }, 0)
      
      expect(consoleSpy).toHaveBeenCalledWith('确认映射:', { sourceField: 'test' })
      
      consoleSpy.mockRestore()
    })

    it('emits confirm event with correct mappings', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [
            { sourceField: 'name', targetField: 'student_name', required: true, dataType: 'string' },
            { sourceField: 'age', targetField: 'student_age', required: false, dataType: 'integer' }
          ],
          willIgnore: [],
          missing: [],
          conflicts: []
        },
        summary: {
          totalSourceFields: 2,
          willImportCount: 2,
          willIgnoreCount: 0,
          missingRequiredCount: 0,
          conflictsCount: 0,
          canProceed: true,
          recommendation: 'Good',
          userFriendlyMessage: 'Ready'
        }
      })
      
      wrapper.vm.confirmImport()
      
      expect(wrapper.emitted('confirm')).toBeTruthy()
      const emittedData = wrapper.emitted('confirm')[0][0]
      expect(emittedData).toHaveLength(2)
      expect(emittedData[0]).toEqual({
        sourceField: 'name',
        targetField: 'student_name',
        required: true,
        dataType: 'string'
      })
    })

    it('emits cancel event when cancel button is clicked', async () => {
      wrapper = createWrapper()
      
      const cancelButton = wrapper.find('.action-buttons el-button:not([type="primary"])')
      await cancelButton.trigger('click')
      
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })

  describe('Props Handling', () => {
    it('accepts comparisonTable prop correctly', () => {
      const mockTable = {
        willImport: [{ sourceField: 'test', targetField: 'test_target' }],
        willIgnore: [],
        missing: [],
        conflicts: []
      }
      
      wrapper = createWrapper({ comparisonTable: mockTable })
      
      expect(wrapper.props('comparisonTable')).toEqual(mockTable)
    })

    it('accepts summary prop correctly', () => {
      const mockSummary = {
        totalSourceFields: 5,
        willImportCount: 3,
        willIgnoreCount: 2,
        missingRequiredCount: 0,
        conflictsCount: 0,
        canProceed: true,
        recommendation: 'Good',
        userFriendlyMessage: 'Ready'
      }
      
      wrapper = createWrapper({ summary: mockSummary })
      
      expect(wrapper.props('summary')).toEqual(mockSummary)
    })

    it('handles empty comparison table gracefully', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [],
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      
      expect(wrapper.find('.comparison-tables').exists()).toBe(true)
      expect(wrapper.findAll('.table-section').length).toBe(0)
    })

    it('handles undefined props gracefully', () => {
      wrapper = createWrapper({
        comparisonTable: undefined as any,
        summary: undefined as any
      })
      
      // Should not crash and should render with empty data
      expect(wrapper.find('.field-comparison-container').exists()).toBe(true)
    })
  })

  describe('Reactivity', () => {
    it('updates display when props change', async () => {
      wrapper = createWrapper({
        summary: {
          totalSourceFields: 5,
          willImportCount: 3,
          willIgnoreCount: 2,
          missingRequiredCount: 0,
          conflictsCount: 0,
          canProceed: false,
          recommendation: 'Initial',
          userFriendlyMessage: 'Initial message'
        }
      })
      
      expect(wrapper.find('el-tag').text()).toBe('❌ 需要处理')
      
      await wrapper.setProps({
        summary: {
          totalSourceFields: 5,
          willImportCount: 5,
          willIgnoreCount: 0,
          missingRequiredCount: 0,
          conflictsCount: 0,
          canProceed: true,
          recommendation: 'Updated',
          userFriendlyMessage: 'Updated message'
        }
      })
      
      expect(wrapper.find('el-tag').text()).toBe('✅ 可以导入')
    })

    it('reacts to comparison table changes', async () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [],
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      
      expect(wrapper.findAll('.table-section').length).toBe(0)
      
      await wrapper.setProps({
        comparisonTable: {
          willImport: [{ sourceField: 'test', targetField: 'test_target' }],
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      
      expect(wrapper.findAll('.table-section').length).toBe(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles missing required fields with zero count', () => {
      wrapper = createWrapper({
        summary: {
          totalSourceFields: 5,
          willImportCount: 5,
          willIgnoreCount: 0,
          missingRequiredCount: 0,
          conflictsCount: 0,
          canProceed: true,
          recommendation: 'Good',
          userFriendlyMessage: 'Ready'
        }
      })
      
      const stats = wrapper.findAll('.stat-item')
      expect(stats.length).toBe(3) // Should not show missing stat when count is 0
    })

    it('handles very long field names and descriptions', () => {
      const longName = 'a'.repeat(100)
      const longDescription = 'b'.repeat(200)
      
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [{
            sourceField: longName,
            targetField: 'target',
            description: longDescription,
            dataType: 'string',
            sampleValue: 'test',
            confidence: 0.9,
            required: false
          }],
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      
      expect(wrapper.find('.table-section').exists()).toBe(true)
    })

    it('handles special characters in field data', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [{
            sourceField: 'field_with_特殊字符',
            targetField: 'target_with_特殊字符',
            description: 'Description with <>&" characters',
            dataType: 'string',
            sampleValue: 'Value with special chars: áéíóú',
            confidence: 0.85,
            required: true
          }],
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      
      expect(wrapper.find('.table-section').exists()).toBe(true)
    })
  })

  describe('Styling and Layout', () => {
    it('applies correct CSS classes to summary section', () => {
      wrapper = createWrapper()
      
      const summarySection = wrapper.find('.summary-section')
      expect(summarySection.classes()).toContain('summary-section')
    })

    it('applies correct CSS classes to stat items', () => {
      wrapper = createWrapper({
        summary: {
          totalSourceFields: 5,
          willImportCount: 3,
          willIgnoreCount: 2,
          missingRequiredCount: 0,
          conflictsCount: 0,
          canProceed: true,
          recommendation: 'Good',
          userFriendlyMessage: 'Ready'
        }
      })
      
      const statItems = wrapper.findAll('.stat-item')
      expect(statItems.length).toBe(3)
      
      statItems.forEach(item => {
        expect(item.classes()).toContain('stat-item')
      })
    })

    it('applies correct CSS classes to table sections', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [{ sourceField: 'test', targetField: 'test' }],
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      
      const tableSection = wrapper.find('.table-section')
      expect(tableSection.classes()).toContain('table-section')
      expect(tableSection.classes()).toContain('success')
    })

    it('maintains proper button styling', () => {
      wrapper = createWrapper()
      
      const buttons = wrapper.findAll('.action-buttons el-button')
      expect(buttons.length).toBe(2)
      
      buttons.forEach(button => {
        expect(button.classes()).toContain('el-button')
      })
    })
  })

  describe('Performance', () => {
    it('renders efficiently with minimal data', () => {
      const start = performance.now()
      wrapper = createWrapper()
      const end = performance.now()
      
      expect(wrapper.find('.field-comparison-container').exists()).toBe(true)
      expect(end - start).toBeLessThan(50)
    })

    it('handles large datasets efficiently', () => {
      const largeWillImportData = Array(100).fill(0).map((_, i) => ({
        sourceField: `field_${i}`,
        targetField: `target_${i}`,
        description: `Description ${i}`,
        dataType: 'string',
        sampleValue: `Value ${i}`,
        confidence: 0.8 + (i % 20) * 0.01,
        required: i % 3 === 0
      }))
      
      const start = performance.now()
      wrapper = createWrapper({
        comparisonTable: {
          willImport: largeWillImportData,
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      const end = performance.now()
      
      expect(wrapper.find('.field-comparison-container').exists()).toBe(true)
      expect(end - start).toBeLessThan(200) // Should handle large data efficiently
    })

    it('updates efficiently when props change', async () => {
      wrapper = createWrapper()
      
      const start = performance.now()
      
      // Perform multiple prop updates
      for (let i = 0; i < 5; i++) {
        await wrapper.setProps({
          summary: {
            totalSourceFields: i + 1,
            willImportCount: i,
            willIgnoreCount: 1,
            missingRequiredCount: 0,
            conflictsCount: 0,
            canProceed: i > 0,
            recommendation: `Update ${i}`,
            userFriendlyMessage: `Message ${i}`
          }
        })
      }
      
      const end = performance.now()
      
      expect(wrapper.find('.field-comparison-container').exists()).toBe(true)
      expect(end - start).toBeLessThan(100)
    })
  })

  describe('Accessibility', () => {
    it('renders with semantic HTML structure', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.field-comparison-container').exists()).toBe(true)
      expect(wrapper.find('.summary-section').exists()).toBe(true)
      expect(wrapper.find('.comparison-tables').exists()).toBe(true)
    })

    it('provides proper heading hierarchy', () => {
      wrapper = createWrapper()
      
      const headings = wrapper.findAll('h3, h4')
      expect(headings.length).toBeGreaterThan(0)
      
      const mainHeading = wrapper.find('h3')
      expect(mainHeading.exists()).toBe(true)
      expect(mainHeading.text()).toContain('字段映射分析结果')
    })

    it('maintains proper table structure for data', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [{ sourceField: 'test', targetField: 'test' }],
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      
      const table = wrapper.find('el-table')
      expect(table.exists()).toBe(true)
    })

    it('provides clear status indications', () => {
      wrapper = createWrapper({
        summary: {
          totalSourceFields: 5,
          willImportCount: 5,
          willIgnoreCount: 0,
          missingRequiredCount: 0,
          conflictsCount: 0,
          canProceed: true,
          recommendation: 'All good',
          userFriendlyMessage: 'Ready to import'
        }
      })
      
      const statusTag = wrapper.find('el-tag')
      expect(statusTag.exists()).toBe(true)
      expect(statusTag.text()).toBeDefined()
    })
  })

  describe('Integration with Element Plus', () => {
    it('correctly integrates with ElTag component', () => {
      wrapper = createWrapper({
        summary: {
          totalSourceFields: 5,
          willImportCount: 5,
          willIgnoreCount: 0,
          missingRequiredCount: 0,
          conflictsCount: 0,
          canProceed: true,
          recommendation: 'Good',
          userFriendlyMessage: 'Ready'
        }
      })
      
      const tag = wrapper.find('el-tag')
      expect(tag.exists()).toBe(true)
      expect(tag.attributes('type')).toBe('success')
    })

    it('correctly integrates with ElAlert component', () => {
      wrapper = createWrapper({
        summary: {
          totalSourceFields: 5,
          willImportCount: 5,
          willIgnoreCount: 0,
          missingRequiredCount: 0,
          conflictsCount: 0,
          canProceed: true,
          recommendation: 'Success',
          userFriendlyMessage: 'All systems go'
        }
      })
      
      const alert = wrapper.find('el-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.attributes('type')).toBe('success')
    })

    it('correctly integrates with ElTable component', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [{ sourceField: 'test', targetField: 'test' }],
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      
      const table = wrapper.find('el-table')
      expect(table.exists()).toBe(true)
    })

    it('correctly integrates with ElProgress component', () => {
      wrapper = createWrapper({
        comparisonTable: {
          willImport: [{
            sourceField: 'test',
            targetField: 'test_target',
            confidence: 0.85,
            required: false,
            dataType: 'string',
            description: 'Test field',
            sampleValue: 'test value'
          }],
          willIgnore: [],
          missing: [],
          conflicts: []
        }
      })
      
      const progressBar = wrapper.find('el-progress')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.attributes(':percentage')).toBeDefined()
    })
  })
})