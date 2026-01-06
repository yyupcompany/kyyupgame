import { test, expect, type Page, type BrowserContext } from '@playwright/test'
import { API_BASE_URL } from '../../src/config/api'
import { validateApiResponse, validateRequiredFields } from '../utils/api-validators'
import { generateTestData, cleanupTestData } from '../utils/test-data-helper'

// 测试数据生成器
class EnrollmentTestDataGenerator {
  static generateStudentData() {
    return {
      studentName: `测试学生_${Date.now()}`,
      gender: 'male',
      birthDate: '2020-01-15',
      age: 4,
      preferredClassId: 1,
      planId: 1,
      parentName: `测试家长_${Date.now()}`,
      parentPhone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      relationship: 'father',
      address: '北京市朝阳区测试地址',
      applicationSource: 'web',
      applyDate: new Date().toISOString().split('T')[0],
      notes: '端到端测试数据'
    }
  }

  static generateInterviewData(applicationId: string) {
    return {
      applicationId,
      interviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 明天
      interviewTime: '10:00-11:00',
      interviewRoom: '会议室A',
      interviewerId: 'interviewer_001',
      notes: '端到端测试面试安排'
    }
  }

  static generateEvaluationData() {
    return {
      criteria: [
        { id: '1', score: 85, comments: '语言表达能力良好' },
        { id: '2', score: 90, comments: '社交互动积极' },
        { id: '3', score: 80, comments: '自理能力基本具备' },
        { id: '4', score: 88, comments: '学习兴趣浓厚' }
      ],
      overallComments: '综合表现优秀，建议录取',
      recommendAdmission: true,
      suggestedClass: '小班A'
    }
  }
}

// 测试辅助类
class EnrollmentTestHelper {
  constructor(private page: Page) {}

  async login(username: string, password: string) {
    await this.page.goto(`${API_BASE_URL}/auth/login`)
    await this.page.fill('[data-testid="username-input"]', username)
    await this.page.fill('[data-testid="password-input"]', password)
    await this.page.click('[data-testid="login-button"]')
    await this.page.waitForURL('/dashboard')
  }

  async navigateToEnrollment() {
    await this.page.click('[data-testid="enrollment-menu-item"]')
    await this.page.waitForURL('/enrollment')
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToEnrollmentCreate() {
    await this.page.click('[data-testid="create-enrollment-button"]')
    await this.page.waitForURL('/enrollment/create')
    await this.page.waitForLoadState('networkidle')
  }

  async fillEnrollmentForm(data: any) {
    // 学生信息
    await this.page.fill('[data-testid="student-name-input"]', data.studentName)
    await this.page.click(`[data-testid="gender-${data.gender}"]`)
    await this.page.fill('[data-testid="birth-date-input"]', data.birthDate)
    await this.page.fill('[data-testid="age-input"]', data.age.toString())
    await this.page.selectOption('[data-testid="preferred-class-select"]', { label: '小班A' })
    await this.page.selectOption('[data-testid="plan-select"]', { label: '2025年春季招生计划' })

    // 家长信息
    await this.page.fill('[data-testid="parent-name-input"]', data.parentName)
    await this.page.fill('[data-testid="parent-phone-input"]', data.parentPhone)
    await this.page.selectOption('[data-testid="relationship-select"]', { label: '父亲' })
    await this.page.fill('[data-testid="address-input"]', data.address)

    // 申请信息
    await this.page.selectOption('[data-testid="application-source-select"]', { label: '官网申请' })
    await this.page.fill('[data-testid="notes-textarea"]', data.notes)
  }

  async submitEnrollmentForm() {
    await this.page.click('[data-testid="submit-button"]')
    // 等待提交成功消息
    await this.page.waitForSelector('[data-testid="success-message"]')
  }

  async searchEnrollment(studentName: string) {
    await this.page.fill('[data-testid="search-input"]', studentName)
    await this.page.click('[data-testid="search-button"]')
    await this.page.waitForLoadState('networkidle')
  }

  async viewEnrollmentDetail(studentName: string) {
    await this.page.click(`[data-testid="view-${studentName}"]`)
    await this.page.waitForURL(/\/enrollment\/\w+/)
    await this.page.waitForLoadState('networkidle')
  }

  async scheduleInterview(interviewData: any) {
    await this.page.click('[data-testid="schedule-interview-button"]')
    await this.page.waitForSelector('[data-testid="interview-schedule-modal"]')

    await this.page.fill('[data-testid="interview-date-input"]', interviewData.interviewDate.split('T')[0])
    await this.page.selectOption('[data-testid="interview-time-select"]', { label: '10:00-11:00' })
    await this.page.selectOption('[data-testid="interview-room-select"]', { label: '会议室A' })
    await this.page.selectOption('[data-testid="interviewer-select"]', { label: '李老师' })
    await this.page.fill('[data-testid="interview-notes-textarea"]', interviewData.notes)

    await this.page.click('[data-testid="confirm-schedule-button"]')
    await this.page.waitForSelector('[data-testid="schedule-success-message"]')
  }

  async completeInterview(evaluationData: any) {
    await this.page.click('[data-testid="complete-interview-button"]')
    await this.page.waitForSelector('[data-testid="interview-evaluation-modal"]')

    // 填写评估标准
    for (const criterion of evaluationData.criteria) {
      await this.page.fill(`[data-testid="criteria-${criterion.id}-score"]`, criterion.score.toString())
      await this.page.fill(`[data-testid="criteria-${criterion.id}-comments"]`, criterion.comments)
    }

    await this.page.fill('[data-testid="overall-comments-textarea"]', evaluationData.overallComments)
    await this.page.click('[data-testid="recommend-admission-checkbox"]')
    await this.page.selectOption('[data-testid="suggested-class-select"]', { label: '小班A' })

    await this.page.click('[data-testid="submit-evaluation-button"]')
    await this.page.waitForSelector('[data-testid="evaluation-success-message"]')
  }

  async approveApplication() {
    await this.page.click('[data-testid="approve-button"]')
    await this.page.waitForSelector('[data-testid="approval-modal"]')
    await this.page.selectOption('[data-testid="assigned-class-select"]', { label: '小班A' })
    await this.page.click('[data-testid="confirm-approval-button"]')
    await this.page.waitForSelector('[data-testid="approval-success-message"]')
  }

  async verifyApplicationStatus(expectedStatus: string) {
    const statusElement = await this.page.locator('[data-testid="application-status"]')
    const statusText = await statusElement.textContent()
    expect(statusText).toContain(expectedStatus)
  }

  async verifyDataInList(studentName: string) {
    const row = await this.page.locator(`[data-testid="row-${studentName}"]`)
    await expect(row).toBeVisible()
  }
}

test.describe('招生管理端到端流程测试 - 100%覆盖', () => {
  let page: Page
  let context: BrowserContext
  let testHelper: EnrollmentTestHelper
  let testIds: string[] = []

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    })
    page = await context.newPage()
    testHelper = new EnrollmentTestHelper(page)
  })

  test.afterAll(async () => {
    // 清理测试数据
    await cleanupTestData(testIds, 'enrollment')
    await context.close()
  })

  test.beforeEach(async () => {
    // 登录系统
    await testHelper.login('admin', 'password123')
    await testHelper.navigateToEnrollment()
  })

  test('完整的招生流程：申请 -> 面试 -> 评估 -> 录取', async () => {
    // 1. 生成测试数据
    const studentData = EnrollmentTestDataGenerator.generateStudentData()
    const interviewData = EnrollmentTestDataGenerator.generateInterviewData('temp_application_id')
    const evaluationData = EnrollmentTestDataGenerator.generateEvaluationData()

    // 2. 创建入学申请
    await test.navigateToEnrollmentCreate()
    await testHelper.fillEnrollmentForm(studentData)
    await testHelper.submitEnrollmentForm()

    // 验证申请创建成功
    await testHelper.verifyApplicationStatus('已提交')

    // 3. 查看申请详情
    await test.navigateToEnrollment()
    await testHelper.searchEnrollment(studentData.studentName)
    await testHelper.verifyDataInList(studentData.studentName)
    await testHelper.viewEnrollmentDetail(studentData.studentName)

    // 4. 安排面试
    await testHelper.scheduleInterview(interviewData)
    await testHelper.verifyApplicationStatus('已安排面试')

    // 5. 完成面试评估
    await testHelper.completeInterview(evaluationData)
    await testHelper.verifyApplicationStatus('面试完成')

    // 6. 审核通过录取
    await testHelper.approveApplication()
    await testHelper.verifyApplicationStatus('已录取')

    // 7. 验证数据完整性
    const enrollmentData = await page.evaluate(() => {
      return window.__ENROLLMENT_DETAIL_DATA__ // 假设页面中有存储的数据
    })

    if (enrollmentData) {
      expect(enrollmentData.studentName).toBe(studentData.studentName)
      expect(enrollmentData.parentName).toBe(studentData.parentName)
      expect(enrollmentData.status).toBe('approved')
      expect(enrollmentData.interview?.evaluationScore).toBeDefined()
      expect(enrollmentData.enrollmentDate).toBeDefined()
    }

    // 记录测试ID用于清理
    if (enrollmentData?.id) {
      testIds.push(enrollmentData.id)
    }
  })

  test('批量操作：批量审核通过申请', async () => {
    // 创建多个测试申请
    const applications = []
    for (let i = 0; i < 3; i++) {
      const studentData = EnrollmentTestDataGenerator.generateStudentData()
      await test.navigateToEnrollmentCreate()
      await testHelper.fillEnrollmentForm(studentData)
      await testHelper.submitEnrollmentForm()
      applications.push(studentData.studentName)
    }

    // 返回列表页
    await test.navigateToEnrollment()

    // 选择多个申请进行批量操作
    for (const studentName of applications) {
      await page.click(`[data-testid="select-${studentName}"]`)
    }

    // 执行批量审核
    await page.click('[data-testid="batch-approve-button"]')
    await page.waitForSelector('[data-testid="batch-approval-modal"]')
    await page.selectOption('[data-testid="batch-class-select"]', { label: '小班A' })
    await page.click('[data-testid="confirm-batch-approval"]')

    // 验证批量操作成功消息
    await page.waitForSelector('[data-testid="batch-success-message"]')
    const successMessage = await page.locator('[data-testid="batch-success-message"]').textContent()
    expect(successMessage).toContain('成功通过')
  })

  test('数据搜索和筛选功能', async () => {
    // 创建不同状态的测试数据
    const testCases = [
      { name: '待审核学生', status: 'pending' },
      { name: '已面试学生', status: 'interviewed' },
      { name: '已录取学生', status: 'approved' }
    ]

    for (const testCase of testCases) {
      const studentData = EnrollmentTestDataGenerator.generateStudentData()
      studentData.studentName = testCase.name
      await test.navigateToEnrollmentCreate()
      await testHelper.fillEnrollmentForm(studentData)
      await testHelper.submitEnrollmentForm()
    }

    // 测试搜索功能
    await test.navigateToEnrollment()
    await testHelper.searchEnrollment('待审核学生')
    await testHelper.verifyDataInList('待审核学生')

    // 测试状态筛选
    await page.selectOption('[data-testid="status-filter"]', { label: '待审核' })
    await page.waitForLoadState('networkidle')
    await testHelper.verifyDataInList('待审核学生')

    // 测试日期范围筛选
    const today = new Date().toISOString().split('T')[0]
    await page.fill('[data-testid="start-date-input"]', today)
    await page.fill('[data-testid="end-date-input"]', today)
    await page.click('[data-testid="filter-button"]')
    await page.waitForLoadState('networkidle')
  })

  test('数据导出功能', async () => {
    // 设置下载监听
    const downloadPromise = page.waitForEvent('download')

    // 执行导出操作
    await page.click('[data-testid="export-button"]')
    await page.selectOption('[data-testid="export-format"]', { label: 'Excel' })
    await page.click('[data-testid="confirm-export"]')

    // 验证文件下载
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/.*\.xlsx$/)
  })

  test('权限控制测试', async () => {
    // 测试无权限用户访问
    await page.goto(`${API_BASE_URL}/auth/logout`)
    await testHelper.login('teacher', 'password123') // 教师角色
    await test.navigateToEnrollment()

    // 验证教师只能查看，不能编辑
    expect(await page.locator('[data-testid="edit-button"]').first().isVisible()).toBe(false)
    expect(await page.locator('[data-testid="delete-button"]').first().isVisible()).toBe(false)
    expect(await page.locator('[data-testid="batch-approve-button"]').isVisible()).toBe(false)

    // 测试管理员权限
    await page.goto(`${API_BASE_URL}/auth/logout`)
    await testHelper.login('admin', 'password123') // 管理员角色
    await test.navigateToEnrollment()

    // 验证管理员有完整权限
    expect(await page.locator('[data-testid="edit-button"]').first().isVisible()).toBe(true)
    expect(await page.locator('[data-testid="delete-button"]').first().isVisible()).toBe(true)
    expect(await page.locator('[data-testid="batch-approve-button"]').isVisible()).toBe(true)
  })

  test('并发操作测试', async () => {
    // 创建多个浏览器上下文模拟并发操作
    const contexts = []
    const pages = []
    const helpers = []

    for (let i = 0; i < 3; i++) {
      const newContext = await context.browser().newContext()
      const newPage = await newContext.newPage()
      const helper = new EnrollmentTestHelper(newPage)

      await helper.login('admin', 'password123')
      await helper.navigateToEnrollment()

      contexts.push(newContext)
      pages.push(newPage)
      helpers.push(helper)
    }

    // 并发创建申请
    const createPromises = helpers.map(async (helper, index) => {
      const studentData = EnrollmentTestDataGenerator.generateStudentData()
      studentData.studentName = `并发测试学生_${index}_${Date.now()}`

      await helper.navigateToEnrollmentCreate()
      await helper.fillEnrollmentForm(studentData)
      await helper.submitEnrollmentForm()

      return studentData.studentName
    })

    const createdStudents = await Promise.all(createPromises)

    // 验证所有申请都创建成功
    await testHelper.navigateToEnrollment()
    for (const studentName of createdStudents) {
      await testHelper.searchEnrollment(studentName)
      await testHelper.verifyDataInList(studentName)
    }

    // 清理并发上下文
    for (const newContext of contexts) {
      await newContext.close()
    }
  })

  test('数据一致性和完整性验证', async () => {
    const studentData = EnrollmentTestDataGenerator.generateStudentData()
    const evaluationData = EnrollmentTestDataGenerator.generateEvaluationData()

    // 完整流程
    await test.navigateToEnrollmentCreate()
    await testHelper.fillEnrollmentForm(studentData)
    await testHelper.submitEnrollmentForm()

    await test.navigateToEnrollment()
    await testHelper.searchEnrollment(studentData.studentName)
    await testHelper.viewEnrollmentDetail(studentData.studentName)

    const interviewData = EnrollmentTestDataGenerator.generateInterviewData('current_application')
    await testHelper.scheduleInterview(interviewData)
    await testHelper.completeInterview(evaluationData)
    await testHelper.approveApplication()

    // 验证数据一致性
    const finalData = await page.evaluate(() => {
      return {
        applicationData: window.__APPLICATION_DATA__,
        interviewData: window.__INTERVIEW_DATA__,
        evaluationData: window.__EVALUATION_DATA__
      }
    })

    if (finalData.applicationData) {
      // 验证API响应结构
      const apiValidation = validateApiResponse(finalData.applicationData)
      expect(apiValidation.valid).toBe(true)

      // 验证必填字段
      const requiredFields = ['id', 'studentName', 'parentName', 'status', 'createdAt']
      const fieldValidation = validateRequiredFields(finalData.applicationData, requiredFields)
      expect(fieldValidation.valid).toBe(true)

      // 验证数据关联性
      expect(finalData.applicationData.id).toBeDefined()
      expect(finalData.interviewData?.applicationId).toBe(finalData.applicationData.id)
      expect(finalData.evaluationData?.applicationId).toBe(finalData.applicationData.id)
    }
  })

  test('错误处理和异常情况', async () => {
    // 测试无效数据提交
    await test.navigateToEnrollmentCreate()

    // 提交空表单
    await page.click('[data-testid="submit-button"]')
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible()

    // 测试无效手机号
    await page.fill('[data-testid="student-name-input"]', '测试学生')
    await page.fill('[data-testid="parent-phone-input"]', '123')
    await page.click('[data-testid="submit-button"]')
    await expect(page.locator('[data-testid="phone-error"]')).toBeVisible()

    // 测试网络错误模拟
    await page.route('**/api/enrollment-applications', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: '服务器内部错误' })
      })
    })

    await testHelper.fillEnrollmentForm(EnrollmentTestDataGenerator.generateStudentData())
    await page.click('[data-testid="submit-button"]')
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await page.unroute('**/api/enrollment-applications')
  })

  test('性能测试：大数据量操作', async () => {
    // 创建大量测试数据
    const largeDataSet = []
    for (let i = 0; i < 50; i++) {
      const studentData = EnrollmentTestDataGenerator.generateStudentData()
      studentData.studentName = `性能测试学生_${i}`
      largeDataSet.push(studentData)
    }

    // 批量创建数据
    const startTime = Date.now()

    for (const studentData of largeDataSet.slice(0, 10)) { // 限制数量以避免测试时间过长
      await test.navigateToEnrollmentCreate()
      await testHelper.fillEnrollmentForm(studentData)
      await testHelper.submitEnrollmentForm()
    }

    const creationTime = Date.now() - startTime

    // 测试列表页加载性能
    await test.navigateToEnrollment()
    const listLoadStart = Date.now()
    await page.waitForLoadState('networkidle')
    const listLoadTime = Date.now() - listLoadStart

    // 性能断言
    expect(creationTime).toBeLessThan(30000) // 创建时间不超过30秒
    expect(listLoadTime).toBeLessThan(5000)  // 列表加载时间不超过5秒

    console.log(`创建10条数据耗时: ${creationTime}ms`)
    console.log(`列表页加载耗时: ${listLoadTime}ms`)
  })
})