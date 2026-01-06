import { test, expect } from '@playwright/test'
import { expectNoConsoleErrors } from '../setup/console-monitoring'

test.describe('跨角色业务流程完整测试', () => {
  // 测试用户账号
  const users = {
    parent: {
      username: 'parent_test',
      password: 'password123',
      role: 'parent'
    },
    teacher: {
      username: 'teacher_test',
      password: 'password123',
      role: 'teacher'
    },
    principal: {
      username: 'principal_test',
      password: 'password123',
      role: 'principal'
    },
    admin: {
      username: 'admin_test',
      password: 'password123',
      role: 'admin'
    }
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test.afterEach(async () => {
    expectNoConsoleErrors()
  })

  test.describe('完整招生流程：家长报名 → 园长审核 → 教师跟进', () => {
    test('should complete full enrollment process across roles', async ({ page }) => {
      // 第1步：家长角色登录并提交报名申请
      await test.step('家长提交报名申请', async () => {
        // 家长登录
        await page.fill('[data-testid="username-input"]', users.parent.username)
        await page.fill('[data-testid="password-input"]', users.parent.password)
        await page.click('[data-testid="login-button"]')

        // 等待登录成功并验证角色
        await expect(page.locator('[data-testid="user-role"]')).toHaveText('家长')

        // 导航到招生报名页面
        await page.click('[data-testid="enrollment-menu"]')
        await page.click('[data-testid="new-application"]')

        // 填写报名信息
        const studentData = {
          childName: '测试小朋友',
          childGender: '男',
          childBirthdate: '2021-01-01',
          parentName: '测试家长',
          parentPhone: '13800138000',
          parentEmail: 'test@example.com',
          address: '测试地址123号',
          emergencyContact: '紧急联系人',
          emergencyPhone: '13900139000',
          applyingClass: '小班',
          enrollmentDate: '2024-03-01'
        }

        await page.fill('[data-testid="child-name"]', studentData.childName)
        await page.selectOption('[data-testid="child-gender"]', studentData.childGender)
        await page.fill('[data-testid="child-birthdate"]', studentData.childBirthdate)
        await page.fill('[data-testid="parent-name"]', studentData.parentName)
        await page.fill('[data-testid="parent-phone"]', studentData.parentPhone)
        await page.fill('[data-testid="parent-email"]', studentData.parentEmail)
        await page.fill('[data-testid="address"]', studentData.address)
        await page.fill('[data-testid="emergency-contact"]', studentData.emergencyContact)
        await page.fill('[data-testid="emergency-phone"]', studentData.emergencyPhone)
        await page.selectOption('[data-testid="applying-class"]', studentData.applyingClass)
        await page.fill('[data-testid="enrollment-date"]', studentData.enrollmentDate)

        // 提交申请
        await page.click('[data-testid="submit-application"]')

        // 验证提交成功
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
        await expect(page.locator('[data-testid="application-id"]')).toBeVisible()

        // 保存申请ID用于后续步骤
        const applicationId = await page.locator('[data-testid="application-id"]').textContent()
        expect(applicationId).toBeTruthy()

        // 记录申请ID到页面状态
        await page.evaluate((id) => {
          window.testApplicationId = id
        }, applicationId)
      })

      // 第2步：园长角色审核并批准报名
      await test.step('园长审核报名申请', async () => {
        // 退出登录
        await page.click('[data-testid="user-menu"]')
        await page.click('[data-testid="logout-button"]')

        // 园长登录
        await page.fill('[data-testid="username-input"]', users.principal.username)
        await page.fill('[data-testid="password-input"]', users.principal.password)
        await page.click('[data-testid="login-button"]')

        // 验证角色
        await expect(page.locator('[data-testid="user-role"]')).toHaveText('园长')

        // 导航到报名审核页面
        await page.click('[data-testid="enrollment-management"]')
        await page.click('[data-testid="pending-approvals"]')

        // 获取之前保存的申请ID
        const applicationId = await page.evaluate(() => window.testApplicationId)

        // 查找并点击申请记录
        await page.fill('[data-testid="search-input"]', applicationId)
        await page.click(`[data-testid="application-row-${applicationId}"]`)

        // 查看申请详情
        await expect(page.locator('[data-testid="application-details"]')).toBeVisible()
        await expect(page.locator('[data-testid="child-name-display"]')).toHaveText('测试小朋友')
        await expect(page.locator('[data-testid="parent-name-display"]')).toHaveText('测试家长')

        // 审核申请（批准）
        await page.click('[data-testid="approve-button"]')

        // 填写审批意见
        await page.fill('[data-testid="approval-comment"]', '材料齐全，符合招生条件，同意录取')
        await page.click('[data-testid="confirm-approval"]')

        // 验证审批成功
        await expect(page.locator('[data-testid="approval-success"]')).toBeVisible()
        await expect(page.locator('[data-testid="application-status"]')).toHaveText('已批准')

        // 生成学生记录
        await page.click('[data-testid="generate-student-record"]')
        await expect(page.locator('[data-testid="student-created-success"]')).toBeVisible()

        // 获取生成的学生ID
        const studentId = await page.locator('[data-testid="new-student-id"]').textContent()
        await page.evaluate((id) => {
          window.testStudentId = id
        }, studentId)
      })

      // 第3步：教师角色跟进并安排入学
      await test.step('教师跟进新生安排', async () => {
        // 退出登录
        await page.click('[data-testid="user-menu"]')
        await page.click('[data-testid="logout-button"]')

        // 教师登录
        await page.fill('[data-testid="username-input"]', users.teacher.username)
        await page.fill('[data-testid="password-input"]', users.teacher.password)
        await page.click('[data-testid="login-button"]')

        // 验证角色
        await expect(page.locator('[data-testid="user-role"]')).toHaveText('教师')

        // 获取学生ID
        const studentId = await page.evaluate(() => window.testStudentId)

        // 导航到学生管理页面
        await page.click('[data-testid="student-management"]')

        // 查找新生
        await page.fill('[data-testid="student-search"]', studentId)
        await page.click(`[data-testid="student-row-${studentId}"]`)

        // 查看学生详情
        await expect(page.locator('[data-testid="student-details"]')).toBeVisible()
        await expect(page.locator('[data-testid="student-status"]')).toHaveText('待分配班级')

        // 分配班级
        await page.click('[data-testid="assign-class-button"]')
        await page.selectOption('[data-testid="class-select"]', '小班A')
        await page.click('[data-testid="confirm-assignment"]')

        // 验证分配成功
        await expect(page.locator('[data-testid="assignment-success"]')).toBeVisible()
        await expect(page.locator('[data-testid="assigned-class"]')).toHaveText('小班A')

        // 创建入学准备清单
        await page.click('[data-testid="create-checklist"]')

        const checklistItems = [
          '准备个人用品清单',
          '安排健康检查',
          '准备教室座位',
          '通知班主任',
          '准备欢迎卡片'
        ]

        for (const item of checklistItems) {
          await page.click('[data-testid="add-checklist-item"]')
          await page.fill('[data-testid="checklist-item-input"]', item)
          await page.click('[data-testid="save-item"]')
        }

        await page.click('[data-testid="save-checklist"]')

        // 验证清单创建成功
        await expect(page.locator('[data-testid="checklist-success"]')).toBeVisible()
        await expect(page.locator('[data-testid="checklist-count"]')).toHaveText('5')

        // 通知家长入学安排
        await page.click('[data-testid="notify-parent"]')
        await page.fill('[data-testid="notification-message"]', '尊敬的家长，您孩子的入学手续已办理完成，请于3月1日到校报到。')
        await page.click('[data-testid="send-notification"]')

        await expect(page.locator('[data-testid="notification-sent"]')).toBeVisible()
      })

      // 第4步：验证数据流转一致性
      await test.step('验证数据流转一致性', async () => {
        // 以管理员身份登录验证数据
        await page.click('[data-testid="user-menu"]')
        await page.click('[data-testid="logout-button"]')

        await page.fill('[data-testid="username-input"]', users.admin.username)
        await page.fill('[data-testid="password-input"]', users.admin.password)
        await page.click('[data-testid="login-button"]')

        // 验证招生统计数据
        await page.click('[data-testid="dashboard"]')
        await page.click('[data-testid="enrollment-stats"]')

        await expect(page.locator('[data-testid="total-applications"]')).toBeVisible()
        await expect(page.locator('[data-testid="approved-applications"]')).toBeVisible()
        await expect(page.locator('[data-testid="enrolled-students"]')).toBeVisible()

        // 验证申请状态流转
        const applicationId = await page.evaluate(() => window.testApplicationId)
        await page.goto(`http://localhost:5173/admin/applications/${applicationId}`)

        await expect(page.locator('[data-testid="application-status-history"]')).toBeVisible()

        // 验证状态流转记录
        const statusHistory = await page.locator('[data-testid="status-timeline"]').allTextContents()
        expect(statusHistory).toContain('已提交')
        expect(statusHistory).toContain('审核中')
        expect(statusHistory).toContain('已批准')
        expect(statusHistory).toContain('已录取')

        // 验证学生记录创建
        const studentId = await page.evaluate(() => window.testStudentId)
        await page.goto(`http://localhost:5173/admin/students/${studentId}`)

        await expect(page.locator('[data-testid="student-basic-info"]')).toBeVisible()
        await expect(page.locator('[data-testid="student-class-info"]')).toBeVisible()
        await expect(page.locator('[data-testid="student-enrollment-date"]')).toHaveText('2024-03-01')
      })
    })
  })

  test.describe('完整教学活动流程：教师创建 → 家长参与 → 园长评估', () => {
    test('should complete full activity process across roles', async ({ page }) => {
      let activityId: string | undefined

      // 第1步：教师创建活动
      await test.step('教师创建教学活动', async () => {
        await page.fill('[data-testid="username-input"]', users.teacher.username)
        await page.fill('[data-testid="password-input"]', users.teacher.password)
        await page.click('[data-testid="login-button"]')

        await expect(page.locator('[data-testid="user-role"]')).toHaveText('教师')

        // 导航到活动管理
        await page.click('[data-testid="activity-management"]')
        await page.click('[data-testid="create-activity"]')

        // 填写活动信息
        const activityData = {
          title: '春季亲子运动会',
          type: 'parent_child',
          description: '增进亲子关系，培养团队合作精神',
          startDate: '2024-03-15',
          endDate: '2024-03-15',
          startTime: '09:00',
          endTime: '12:00',
          location: '学校操场',
          maxParticipants: 50,
          targetAge: '3-6岁',
          materials: '运动器材、奖品、饮用水',
          objectives: [
            '增强亲子互动',
            '培养运动兴趣',
            '提高团队协作能力'
          ]
        }

        await page.fill('[data-testid="activity-title"]', activityData.title)
        await page.selectOption('[data-testid="activity-type"]', activityData.type)
        await page.fill('[data-testid="activity-description"]', activityData.description)
        await page.fill('[data-testid="start-date"]', activityData.startDate)
        await page.fill('[data-testid="end-date"]', activityData.endDate)
        await page.fill('[data-testid="start-time"]', activityData.startTime)
        await page.fill('[data-testid="end-time"]', activityData.endTime)
        await page.fill('[data-testid="location"]', activityData.location)
        await page.fill('[data-testid="max-participants"]', activityData.maxParticipants.toString())
        await page.selectOption('[data-testid="target-age"]', activityData.targetAge)
        await page.fill('[data-testid="materials"]', activityData.materials)

        // 添加活动目标
        for (const objective of activityData.objectives) {
          await page.click('[data-testid="add-objective"]')
          await page.fill('[data-testid="objective-input"]', objective)
          await page.click('[data-testid="save-objective"]')
        }

        // 发布活动
        await page.click('[data-testid="publish-activity"]')

        // 验证发布成功
        await expect(page.locator('[data-testid="publish-success"]')).toBeVisible()

        // 获取活动ID
        activityId = await page.locator('[data-testid="activity-id"]').textContent()
        await page.evaluate((id) => {
          window.testActivityId = id
        }, activityId)
      })

      // 第2步：家长报名参与
      await test.step('家长报名参与活动', async () => {
        await page.click('[data-testid="user-menu"]')
        await page.click('[data-testid="logout-button"]')

        await page.fill('[data-testid="username-input"]', users.parent.username)
        await page.fill('[data-testid="password-input"]', users.parent.password)
        await page.click('[data-testid="login-button"]')

        await expect(page.locator('[data-testid="user-role"]')).toHaveText('家长')

        // 导航到活动列表
        await page.click('[data-testid="activities"]')

        // 查找并报名活动
        const activityId = await page.evaluate(() => window.testActivityId)
        await page.fill('[data-testid="activity-search"]', activityId)

        await page.click(`[data-testid="activity-card-${activityId}"]`)

        // 查看活动详情
        await expect(page.locator('[data-testid="activity-details"]')).toBeVisible()
        await expect(page.locator('[data-testid="activity-title"]')).toHaveText('春季亲子运动会')

        // 检查报名条件
        await expect(page.locator('[data-testid="registration-open"]')).toBeVisible()

        // 填写报名信息
        await page.click('[data-testid="register-button"]')

        const registrationData = {
          participantName: '测试小朋友',
          participantAge: '4',
          parentName: '测试家长',
          parentPhone: '13800138000',
          specialNeeds: '无特殊要求',
          emergencyContact: '同联系人',
          agreedToTerms: true
        }

        await page.fill('[data-testid="participant-name"]', registrationData.participantName)
        await page.fill('[data-testid="participant-age"]', registrationData.participantAge)
        await page.fill('[data-testid="parent-name"]', registrationData.parentName)
        await page.fill('[data-testid="parent-phone"]', registrationData.parentPhone)
        await page.fill('[data-testid="special-needs"]', registrationData.specialNeeds)
        await page.fill('[data-testid="emergency-contact"]', registrationData.emergencyContact)
        await page.check('[data-testid="agree-terms"]')

        await page.click('[data-testid="submit-registration"]')

        // 验证报名成功
        await expect(page.locator('[data-testid="registration-success"]')).toBeVisible()
        await expect(page.locator('[data-testid="registration-status"]')).toHaveText('已报名')

        // 获取报名ID
        const registrationId = await page.locator('[data-testid="registration-id"]').textContent()
        await page.evaluate((id) => {
          window.testRegistrationId = id
        }, registrationId)
      })

      // 第3步：教师执行活动
      await test.step('教师执行活动并记录', async () => {
        await page.click('[data-testid="user-menu"]')
        await page.click('[data-testid="logout-button"]')

        await page.fill('[data-testid="username-input"]', users.teacher.username)
        await page.fill('[data-testid="password-input"]', users.teacher.password)
        await page.click('[data-testid="login-button"]')

        const activityId = await page.evaluate(() => window.testActivityId)

        // 导航到活动管理
        await page.click('[data-testid="activity-management"]')
        await page.fill('[data-testid="activity-search"]', activityId)
        await page.click(`[data-testid="activity-row-${activityId}"]`)

        // 开始活动
        await page.click('[data-testid="start-activity"]')
        await page.fill('[data-testid="start-reason"]', '所有参与者已到位，活动正式开始')
        await page.click('[data-testid="confirm-start"]')

        // 验证活动开始
        await expect(page.locator('[data-testid="activity-status"]')).toHaveText('进行中')

        // 签到管理
        await page.click('[data-testid="check-in-management"]')

        const registrationId = await page.evaluate(() => window.testRegistrationId)
        await page.fill('[data-testid="search-registration"]', registrationId)
        await page.click(`[data-testid="check-in-${registrationId}"]`)

        // 记录签到
        await page.fill('[data-testid="check-in-notes"]', '家长和孩子准时到达，状态良好')
        await page.click('[data-testid="confirm-check-in"]')

        await expect(page.locator('[data-testid="check-in-success"]')).toBeVisible()

        // 结束活动
        await page.click('[data-testid="end-activity"]')
        await page.fill('[data-testid="activity-summary"]', '活动圆满成功，家长和孩子们参与积极，达到了预期效果')
        await page.click('[data-testid="confirm-end"]')

        await expect(page.locator('[data-testid="activity-ended"]')).toBeVisible()
        await expect(page.locator('[data-testid="activity-status"]')).toHaveText('已结束')
      })

      // 第4步：园长评估活动效果
      await test.step('园长评估活动效果', async () => {
        await page.click('[data-testid="user-menu"]')
        await page.click('[data-testid="logout-button"]')

        await page.fill('[data-testid="username-input"]', users.principal.username)
        await page.fill('[data-testid="password-input"]', users.principal.password)
        await page.click('[data-testid="login-button"]')

        const activityId = await page.evaluate(() => window.testActivityId)

        // 导航到活动评估
        await page.click('[data-testid="activity-evaluation"]')
        await page.fill('[data-testid="activity-search"]', activityId)
        await page.click(`[data-testid="evaluate-${activityId}"]`)

        // 查看活动数据
        await expect(page.locator('[data-testid="activity-stats"]')).toBeVisible()
        await expect(page.locator('[data-testid="participant-count"]')).toBeVisible()
        await expect(page.locator('[data-testid="attendance-rate"]')).toBeVisible()

        // 填写评估表单
        const evaluationData = {
          overallRating: 5,
          organizationRating: 5,
          contentRating: 4,
          engagementRating: 5,
          achievementRating: 5,
          strengths: [
            '组织有序',
            '参与度高',
            '氛围良好',
            '目标达成'
          ],
          improvements: [
            '增加更多游戏环节',
            '准备更多奖品',
            '改善音响设备'
          ],
          suggestions: '继续保持高质量的活动组织',
          followUpActions: [
            '整理活动照片',
            '发送感谢信',
            '准备下次活动方案'
          ]
        }

        await page.selectOption('[data-testid="overall-rating"]', evaluationData.overallRating.toString())
        await page.selectOption('[data-testid="organization-rating"]', evaluationData.organizationRating.toString())
        await page.selectOption('[data-testid="content-rating"]', evaluationData.contentRating.toString())
        await page.selectOption('[data-testid="engagement-rating"]', evaluationData.engagementRating.toString())
        await page.selectOption('[data-testid="achievement-rating"]', evaluationData.achievementRating.toString())

        // 添加优点
        for (const strength of evaluationData.strengths) {
          await page.click('[data-testid="add-strength"]')
          await page.fill('[data-testid="strength-input"]', strength)
          await page.click('[data-testid="save-strength"]')
        }

        // 添加改进建议
        for (const improvement of evaluationData.improvements) {
          await page.click('[data-testid="add-improvement"]')
          await page.fill('[data-testid="improvement-input"]', improvement)
          await page.click('[data-testid="save-improvement"]')
        }

        await page.fill('[data-testid="suggestions"]', evaluationData.suggestions)

        // 添加后续行动
        for (const action of evaluationData.followUpActions) {
          await page.click('[data-testid="add-action"]')
          await page.fill('[data-testid="action-input"]', action)
          await page.click('[data-testid="save-action"]')
        }

        // 提交评估
        await page.click('[data-testid="submit-evaluation"]')

        // 验证评估提交成功
        await expect(page.locator('[data-testid="evaluation-success"]')).toBeVisible()
        await expect(page.locator('[data-testid="evaluation-status"]')).toHaveText('已评估')
      })
    })
  })

  test.describe('完整财务流程：系统计费 → 家长缴费 → 园长审核', () => {
    test('should complete full financial process across roles', async ({ page }) => {
      let billId: string | undefined

      // 第1步：系统自动生成缴费单（模拟系统流程）
      await test.step('系统生成缴费单', async () => {
        await page.fill('[data-testid="username-input"]', users.admin.username)
        await page.fill('[data-testid="password-input"]', users.admin.password)
        await page.click('[data-testid="login-button"]')

        // 导航到财务系统
        await page.click('[data-testid="finance-management"]')
        await page.click('[data-testid="bill-generation"]')

        // 设置缴费单生成参数
        await page.selectOption('[data-testid="billing-period"]', 'monthly')
        await page.fill('[data-testid="billing-month"]', '2024-03')
        await page.selectOption('[data-testid="student-filter"]', 'all-active')

        // 生成缴费单
        await page.click('[data-testid="generate-bills"]')

        // 等待生成完成
        await expect(page.locator('[data-testid="generation-complete"]')).toBeVisible()

        // 查看生成的缴费单
        await page.click('[data-testid="view-generated-bills"]')

        // 获取第一个缴费单ID
        const billElements = await page.locator('[data-testid^="bill-row-"]').all()
        expect(billElements.length).toBeGreaterThan(0)

        const firstBillElement = billElements[0]
        billId = await firstBillElement.getAttribute('data-testid')
        if (billId) {
          billId = billId.replace('bill-row-', '')
          await page.evaluate((id) => {
            window.testBillId = id
          }, billId)
        }
      })

      // 第2步：家长查看并缴费
      await test.step('家长在线缴费', async () => {
        await page.click('[data-testid="user-menu"]')
        await page.click('[data-testid="logout-button"]')

        await page.fill('[data-testid="username-input"]', users.parent.username)
        await page.fill('[data-testid="password-input"]', users.parent.password)
        await page.click('[data-testid="login-button"]')

        // 导航到缴费中心
        await page.click('[data-testid="payment-center"]')

        const billId = await page.evaluate(() => window.testBillId)

        // 查看待缴费账单
        await page.click('[data-testid="pending-bills"]')
        await page.fill('[data-testid="bill-search"]', billId)

        await page.click(`[data-testid="bill-item-${billId}"]`)

        // 查看账单详情
        await expect(page.locator('[data-testid="bill-details"]')).toBeVisible()
        await expect(page.locator('[data-testid="bill-amount"]')).toBeVisible()
        await expect(page.locator('[data-testid="bill-due-date"]')).toBeVisible()

        // 选择缴费方式
        await page.click('[data-testid="pay-now"]')
        await page.selectOption('[data-testid="payment-method"]', 'wechat')

        // 确认缴费信息
        await expect(page.locator('[data-testid="payment-confirm"]')).toBeVisible()
        await page.click('[data-testid="confirm-payment"]')

        // 模拟支付成功（测试环境）
        await page.click('[data-testid="mock-payment-success"]')

        // 验证缴费成功
        await expect(page.locator('[data-testid="payment-success"]')).toBeVisible()
        await expect(page.locator('[data-testid="payment-status"]')).toHaveText('已支付')

        // 获取支付记录ID
        const paymentId = await page.locator('[data-testid="payment-id"]').textContent()
        await page.evaluate((id) => {
          window.testPaymentId = id
        }, paymentId)
      })

      // 第3步：园长审核财务记录
      await test.step('园长审核财务记录', async () => {
        await page.click('[data-testid="user-menu"]')
        await page.click('[data-testid="logout-button"]')

        await page.fill('[data-testid="username-input"]', users.principal.username)
        await page.fill('[data-testid="password-input"]', users.principal.password)
        await page.click('[data-testid="login-button"]')

        // 导航到财务管理
        await page.click('[data-testid="financial-management"]')
        await page.click('[data-testid="payment-records"]')

        const paymentId = await page.evaluate(() => window.testPaymentId)

        // 查找支付记录
        await page.fill('[data-testid="payment-search"]', paymentId)
        await page.click(`[data-testid="payment-record-${paymentId}"]`)

        // 审核支付记录
        await expect(page.locator('[data-testid="payment-details"]')).toBeVisible()
        await expect(page.locator('[data-testid="payment-amount"]')).toBeVisible()
        await expect(page.locator('[data-testid="payment-method"]')).toHaveText('微信支付')

        // 核实支付信息
        await page.click('[data-testid="verify-payment"]')
        await page.fill('[data-testid="verification-note"]', '支付信息核实无误，金额准确')
        await page.click('[data-testid="confirm-verification"]')

        // 验证审核成功
        await expect(page.locator('[data-testid="verification-success"]')).toBeVisible()
        await expect(page.locator('[data-testid="payment-verified"]')).toBeVisible()

        // 生成收据
        await page.click('[data-testid="generate-receipt"]')
        await expect(page.locator('[data-testid="receipt-generated"]')).toBeVisible()

        const receiptId = await page.locator('[data-testid="receipt-id"]').textContent()
        await page.evaluate((id) => {
          window.testReceiptId = id
        }, receiptId)
      })

      // 第4步：验证财务数据完整性
      await test.step('验证财务数据完整性', async () => {
        // 生成财务报表
        await page.click('[data-testid="financial-reports"]')
        await page.click('[data-testid="generate-report"]')

        await page.selectOption('[data-testid="report-type"]', 'monthly')
        await page.fill('[data-testid="report-period"]', '2024-03')
        await page.click('[data-testid="create-report"]')

        // 等待报表生成
        await expect(page.locator('[data-testid="report-ready"]')).toBeVisible()

        // 查看报表内容
        await page.click('[data-testid="view-report"]')

        // 验证数据包含测试交易
        const billId = await page.evaluate(() => window.testBillId)
        const paymentId = await page.evaluate(() => window.testPaymentId)
        const receiptId = await page.evaluate(() => window.testReceiptId)

        await expect(page.locator(`[data-testid="report-bill-${billId}"]`)).toBeVisible()
        await expect(page.locator(`[data-testid="report-payment-${paymentId}"]`)).toBeVisible()
        await expect(page.locator(`[data-testid="report-receipt-${receiptId}"]`)).toBeVisible()

        // 验证数据一致性
        await page.click('[data-testid="data-verification"]')

        await expect(page.locator('[data-testid="verification-passed"]')).toBeVisible()
        await expect(page.locator('[data-testid="data-consistency"]')).toHaveText('数据一致')
      })
    })
  })

  test.describe('角色权限边界完整测试', () => {
    test('should enforce proper role-based access control', async ({ page }) => {
      // 测试家长权限边界
      await test.step('家长权限边界测试', async () => {
        await page.fill('[data-testid="username-input"]', users.parent.username)
        await page.fill('[data-testid="password-input"]', users.parent.password)
        await page.click('[data-testid="login-button"]')

        // 验证家长能访问的功能
        await expect(page.locator('[data-testid="student-info"]')).toBeVisible()
        await expect(page.locator('[data-testid="payment-center"]')).toBeVisible()
        await expect(page.locator('[data-testid="activities"]')).toBeVisible()
        await expect(page.locator('[data-testid="notifications"]')).toBeVisible()

        // 验证家长不能访问的功能
        await page.goto('http://localhost:5173/admin/dashboard')
        await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()

        await page.goto('http://localhost:5173/teacher/grade-management')
        await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()

        await page.goto('http://localhost:5173/principal/staff-management')
        await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()
      })

      // 测试教师权限边界
      await test.step('教师权限边界测试', async () => {
        await page.click('[data-testid="user-menu"]')
        await page.click('[data-testid="logout-button"]')

        await page.fill('[data-testid="username-input"]', users.teacher.username)
        await page.fill('[data-testid="password-input"]', users.teacher.password)
        await page.click('[data-testid="login-button"]')

        // 验证教师能访问的功能
        await expect(page.locator('[data-testid="student-management"]')).toBeVisible()
        await expect(page.locator('[data-testid="class-management"]')).toBeVisible()
        await expect(page.locator('[data-testid="activity-management"]')).toBeVisible()
        await expect(page.locator('[data-testid="teaching-plan"]')).toBeVisible()

        // 验证教师不能访问的功能
        await page.goto('http://localhost:5173/admin/user-management')
        await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()

        await page.goto('http://localhost:5173/finance/budget-management')
        await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()

        await page.goto('http://localhost:5173/principal/performance-evaluation')
        await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()
      })

      // 测试园长权限边界
      await test.step('园长权限边界测试', async () => {
        await page.click('[data-testid="user-menu"]')
        await page.click('[data-testid="logout-button"]')

        await page.fill('[data-testid="username-input"]', users.principal.username)
        await page.fill('[data-testid="password-input"]', users.principal.password)
        await page.click('[data-testid="login-button"]')

        // 验证园长能访问的功能
        await expect(page.locator('[data-testid="staff-management"]')).toBeVisible()
        await expect(page.locator('[data-testid="financial-management"]')).toBeVisible()
        await expect(page.locator('[data-testid="enrollment-management"]')).toBeVisible()
        await expect(page.locator('[data-testid="activity-evaluation"]')).toBeVisible()

        // 验证园长不能访问的系统级功能
        await page.goto('http://localhost:5173/admin/system-settings')
        await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()

        await page.goto('http://localhost:5173/admin/role-management')
        await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()
      })

      // 测试管理员权限边界
      await test.step('管理员权限边界测试', async () => {
        await page.click('[data-testid="user-menu"]')
        await page.click('[data-testid="logout-button"]')

        await page.fill('[data-testid="username-input"]', users.admin.username)
        await page.fill('[data-testid="password-input"]', users.admin.password)
        await page.click('[data-testid="login-button"]')

        // 验证管理员能访问所有功能
        await expect(page.locator('[data-testid="system-management"]')).toBeVisible()
        await expect(page.locator('[data-testid="user-management"]')).toBeVisible()
        await expect(page.locator('[data-testid="role-management"]')).toBeVisible()
        await expect(page.locator('[data-testid="system-settings"]')).toBeVisible()

        // 验证管理员可以访问业务功能（但通常不直接操作）
        await page.goto('http://localhost:5173/student-management')
        await expect(page.locator('[data-testid="access-granted"]')).toBeVisible()

        await page.goto('http://localhost:5173/finance/overview')
        await expect(page.locator('[data-testid="access-granted"]')).toBeVisible()
      })
    })

    test('should ensure data isolation between roles', async ({ page }) => {
      // 测试数据隔离：教师只能看到自己的班级数据
      await test.step('数据隔离测试', async () => {
        // 教师登录
        await page.fill('[data-testid="username-input"]', users.teacher.username)
        await page.fill('[data-testid="password-input"]', users.teacher.password)
        await page.click('[data-testid="login-button"]')

        // 访问学生列表
        await page.click('[data-testid="student-management"]')

        // 验证只显示该教师负责的学生
        const studentRows = await page.locator('[data-testid^="student-row-"]').all()
        expect(studentRows.length).toBeGreaterThan(0)

        // 验证每个学生都属于该教师的班级
        for (const row of studentRows) {
          const classElement = await row.locator('[data-testid="student-class"]')
          expect(classElement).toBeVisible()
        }

        // 尝试访问其他班级的学生数据（应该被拒绝）
        const firstStudent = studentRows[0]
        const studentId = await firstStudent.getAttribute('data-testid')

        if (studentId) {
          const cleanStudentId = studentId.replace('student-row-', '')

          // 尝试通过URL直接访问其他学生（应该被阻止）
          await page.goto(`http://localhost:5173/teacher/students/other-student-${cleanStudentId}`)
          await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()
        }
      })
    })
  })
})