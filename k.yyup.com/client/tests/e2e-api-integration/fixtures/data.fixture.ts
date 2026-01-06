import { Page } from '@playwright/test'

/**
 * Data Fixture for E2E Tests
 * E2E测试数据夹具类
 */
export class DataFixture {
  /**
   * Generate test student data
   * 生成测试学生数据
   */
  generateStudentData() {
    const timestamp = Date.now()
    return {
      name: `测试学生${timestamp}`,
      gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
      birthDate: '2020-01-01',
      phone: `1380000${String(timestamp).slice(-4)}`,
      email: `student${timestamp}@test.com`,
      address: '测试地址123号',
      parentName: '测试家长',
      parentPhone: `1390000${String(timestamp).slice(-4)}`,
      emergencyContact: '紧急联系人',
      emergencyPhone: `1370000${String(timestamp).slice(-4)}`,
      healthCondition: '健康',
      allergyHistory: '无过敏史',
      specialNeeds: '无特殊需求'
    }
  }

  /**
   * Generate test teacher data
   * 生成测试教师数据
   */
  generateTeacherData() {
    const timestamp = Date.now()
    return {
      name: `测试教师${timestamp}`,
      gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
      phone: `1360000${String(timestamp).slice(-4)}`,
      email: `teacher${timestamp}@test.com`,
      employeeId: `T${timestamp}`,
      title: '主班教师',
      department: '大班组',
      hireDate: '2023-01-01',
      education: {
        degree: '本科',
        major: '学前教育',
        school: '师范大学',
        graduationYear: 2022
      },
      certification: ['教师资格证', '普通话二甲'],
      skills: ['音乐', '美术', '体育']
    }
  }

  /**
   * Generate test class data
   * 生成测试班级数据
   */
  generateClassData() {
    const timestamp = Date.now()
    return {
      name: `测试班级${timestamp}`,
      type: 'LARGE_CLASS',
      ageRange: '5-6岁',
      capacity: 30,
      currentStudentCount: 25,
      description: '这是一个测试班级',
      status: 'ACTIVE'
    }
  }

  /**
   * Generate test activity data
   * 生成测试活动数据
   */
  generateActivityData() {
    const timestamp = Date.now()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 7) // 7 days from now
    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 2) // 2 hours duration

    return {
      title: `测试活动${timestamp}`,
      description: '这是一个测试活动的描述',
      activityType: 'EDUCATIONAL',
      location: '大礼堂',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      capacity: 50,
      registrationStartTime: new Date().toISOString(),
      registrationEndTime: startDate.toISOString(),
      needsApproval: false,
      status: 'PUBLISHED'
    }
  }

  /**
   * Generate test user data
   * 生成测试用户数据
   */
  generateUserData() {
    const timestamp = Date.now()
    return {
      username: `testuser${timestamp}`,
      password: 'Test123456',
      email: `user${timestamp}@test.com`,
      realName: `测试用户${timestamp}`,
      phone: `1350000${String(timestamp).slice(-4)}`,
      status: 'ACTIVE',
      role: 'teacher'
    }
  }

  /**
   * Mock API response for empty data state
   * 模拟空数据状态的API响应
   */
  async mockEmptyDataResponse(page: Page, endpoint: string) {
    await page.route(`**${endpoint}*`, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            items: [],
            total: 0,
            page: 1,
            pageSize: 10,
            totalPages: 0
          },
          message: '查询成功'
        })
      })
    })
  }

  /**
   * Mock API response for error state
   * 模拟错误状态的API响应
   */
  async mockErrorResponse(page: Page, endpoint: string, statusCode: number = 500, message: string = '服务器内部错误') {
    await page.route(`**${endpoint}*`, route => {
      route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message,
          code: statusCode
        })
      })
    })
  }

  /**
   * Mock API response for successful data loading
   * 模拟成功数据加载的API响应
   */
  async mockSuccessfulDataResponse(page: Page, endpoint: string, data: any[], total?: number) {
    await page.route(`**${endpoint}*`, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            items: data,
            total: total || data.length,
            page: 1,
            pageSize: 10,
            totalPages: Math.ceil((total || data.length) / 10)
          },
          message: '查询成功'
        })
      })
    })
  }

  /**
   * Mock slow API response for loading state testing
   * 模拟慢速API响应用于加载状态测试
   */
  async mockSlowResponse(page: Page, endpoint: string, delay: number = 3000) {
    await page.route(`**${endpoint}*`, async route => {
      await new Promise(resolve => setTimeout(resolve, delay))
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            items: [],
            total: 0
          },
          message: '查询成功'
        })
      })
    })
  }

  /**
   * Generate batch test data
   * 生成批量测试数据
   */
  generateBatchData<T>(generator: () => T, count: number): T[] {
    return Array.from({ length: count }, () => generator())
  }

  /**
   * Create realistic test scenario data
   * 创建真实的测试场景数据
   */
  createTestScenario(scenarioType: 'classroom' | 'activity' | 'enrollment') {
    switch (scenarioType) {
      case 'classroom':
        return {
          teacher: this.generateTeacherData(),
          students: this.generateBatchData(() => this.generateStudentData(), 5),
          class: this.generateClassData()
        }
      
      case 'activity':
        return {
          activity: this.generateActivityData(),
          participants: this.generateBatchData(() => this.generateStudentData(), 3),
          organizer: this.generateTeacherData()
        }
      
      case 'enrollment':
        return {
          applicant: this.generateStudentData(),
          parent: {
            name: '测试家长',
            phone: '13800138000',
            email: 'parent@test.com',
            relationship: '父亲'
          },
          application: {
            preferredClass: 'LARGE_CLASS',
            enrollmentDate: '2024-09-01',
            specialRequests: '无特殊要求'
          }
        }
      
      default:
        throw new Error(`Unknown scenario type: ${scenarioType}`)
    }
  }

  /**
   * Cleanup test data (placeholder for future implementation)
   * 清理测试数据（为将来实现预留）
   */
  async cleanupTestData(page: Page, dataType: string, identifiers: string[]) {
    console.log(`🧹 Cleaning up ${dataType} test data:`, identifiers)
    // TODO: Implement cleanup logic when DELETE APIs are available
  }
}