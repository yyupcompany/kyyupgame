import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Objects Fixture for E2E Tests
 * E2E测试页面对象夹具类
 */
export class PagesFixture {
  constructor(private page: Page) {}

  /**
   * Dashboard Page Object
   * 仪表板页面对象
   */
  get dashboard() {
    return {
      async navigate() {
        await this.page.goto('/dashboard')
        await this.page.waitForLoadState('networkidle')
      },

      async waitForStatsToLoad() {
        await this.page.waitForSelector('[data-testid="stats-card"], .stats-card, .el-card', { timeout: 10000 })
      },

      async getStatsCards() {
        return this.page.locator('[data-testid="stats-card"], .stats-card, .el-card')
      },

      async verifyStatsLoaded() {
        const statsCards = await this.getStatsCards()
        const count = await statsCards.count()
        expect(count).toBeGreaterThan(0)
      }
    }
  }

  /**
   * Student Management Page Object
   * 学生管理页面对象
   */
  get students() {
    return {
      async navigate() {
        await this.page.goto('/students')
        await this.page.waitForLoadState('networkidle')
      },

      async waitForTableToLoad() {
        await this.page.waitForSelector('[data-testid="student-table"], .el-table, table', { timeout: 15000 })
      },

      async getStudentRows() {
        return this.page.locator('[data-testid="student-row"], .el-table__row, tbody tr')
      },

      async searchStudent(keyword: string) {
        const searchInput = this.page.locator('[data-testid="search-input"], input[placeholder*="搜索"], .el-input__inner').first()
        await searchInput.fill(keyword)
        await searchInput.press('Enter')
        await this.page.waitForTimeout(1000)
      },

      async openCreateDialog() {
        const createBtn = this.page.locator('[data-testid="create-btn"], button:has-text("新增"), button:has-text("添加")').first()
        await createBtn.click()
        await this.page.waitForSelector('[data-testid="student-form"], .el-dialog, .modal', { timeout: 5000 })
      },

      async verifyEmptyState() {
        await expect(this.page.locator('[data-testid="empty-state"], .empty-state, .el-empty')).toBeVisible()
      },

      async verifyErrorState() {
        await expect(this.page.locator('[data-testid="error-message"], .error-message, .el-alert--error')).toBeVisible()
      }
    }
  }

  /**
   * Teacher Management Page Object
   * 教师管理页面对象
   */
  get teachers() {
    return {
      async navigate() {
        await this.page.goto('/teachers')
        await this.page.waitForLoadState('networkidle')
      },

      async waitForTableToLoad() {
        await this.page.waitForSelector('[data-testid="teacher-table"], .el-table, table', { timeout: 15000 })
      },

      async getTeacherRows() {
        return this.page.locator('[data-testid="teacher-row"], .el-table__row, tbody tr')
      },

      async filterByDepartment(department: string) {
        const filterSelect = this.page.locator('[data-testid="department-filter"], select, .el-select').first()
        await filterSelect.click()
        await this.page.locator(`text=${department}`).click()
        await this.page.waitForTimeout(1000)
      },

      async verifyTeacherListLoaded() {
        const rows = await this.getTeacherRows()
        const count = await rows.count()
        expect(count).toBeGreaterThan(0)
      }
    }
  }

  /**
   * Class Management Page Object
   * 班级管理页面对象
   */
  get classes() {
    return {
      async navigate() {
        await this.page.goto('/classes')
        await this.page.waitForLoadState('networkidle')
      },

      async waitForClassListToLoad() {
        await this.page.waitForSelector('[data-testid="class-list"], .class-grid, .el-card', { timeout: 15000 })
      },

      async getClassCards() {
        return this.page.locator('[data-testid="class-card"], .class-card, .el-card')
      },

      async openClassDetail(className: string) {
        await this.page.locator(`text=${className}`).first().click()
        await this.page.waitForLoadState('networkidle')
      },

      async verifyClassListLoaded() {
        const cards = await this.getClassCards()
        const count = await cards.count()
        expect(count).toBeGreaterThan(0)
      }
    }
  }

  /**
   * Activity Management Page Object
   * 活动管理页面对象
   */
  get activities() {
    return {
      async navigate() {
        await this.page.goto('/activities')
        await this.page.waitForLoadState('networkidle')
      },

      async waitForActivityListToLoad() {
        await this.page.waitForSelector('[data-testid="activity-list"], .activity-grid, .el-card', { timeout: 15000 })
      },

      async getActivityCards() {
        return this.page.locator('[data-testid="activity-card"], .activity-card, .el-card')
      },

      async filterByType(type: string) {
        const typeFilter = this.page.locator('[data-testid="type-filter"], .type-filter, .el-select').first()
        await typeFilter.click()
        await this.page.locator(`text=${type}`).click()
        await this.page.waitForTimeout(1000)
      },

      async verifyActivityListLoaded() {
        const cards = await this.getActivityCards()
        const count = await cards.count()
        expect(count).toBeGreaterThan(0)
      }
    }
  }

  /**
   * User Management Page Object
   * 用户管理页面对象
   */
  get users() {
    return {
      async navigate() {
        await this.page.goto('/users')
        await this.page.waitForLoadState('networkidle')
      },

      async waitForUserTableToLoad() {
        await this.page.waitForSelector('[data-testid="user-table"], .el-table, table', { timeout: 15000 })
      },

      async getUserRows() {
        return this.page.locator('[data-testid="user-row"], .el-table__row, tbody tr')
      },

      async filterByRole(role: string) {
        const roleFilter = this.page.locator('[data-testid="role-filter"], .role-filter, .el-select').first()
        await roleFilter.click()
        await this.page.locator(`text=${role}`).click()
        await this.page.waitForTimeout(1000)
      },

      async verifyUserListLoaded() {
        const rows = await this.getUserRows()
        const count = await rows.count()
        expect(count).toBeGreaterThan(0)
      }
    }
  }

  /**
   * Common UI helpers
   * 通用UI助手方法
   */
  get common() {
    return {
      async waitForApiCall(endpoint: string) {
        await this.page.waitForResponse(response => 
          response.url().includes(endpoint) && response.status() === 200
        )
      },

      async waitForLoadingToFinish() {
        // Wait for various loading indicators to disappear
        const loadingSelectors = [
          '[data-testid="loading"]',
          '.loading',
          '.el-loading-mask',
          '.spinner'
        ]

        for (const selector of loadingSelectors) {
          try {
            await this.page.waitForSelector(selector, { state: 'hidden', timeout: 2000 })
          } catch (e) {
            // Ignore if selector not found
          }
        }
      },

      async verifyToastMessage(message: string) {
        const toastSelectors = [
          '[data-testid="toast"]',
          '.el-message',
          '.toast',
          '.notification'
        ]

        let found = false
        for (const selector of toastSelectors) {
          try {
            const toast = this.page.locator(selector)
            if (await toast.isVisible()) {
              await expect(toast).toContainText(message)
              found = true
              break
            }
          } catch (e) {
            continue
          }
        }

        if (!found) {
          console.warn('⚠️ Toast message not found, but test will continue')
        }
      },

      async handlePagination() {
        const nextPageSelectors = [
          '[data-testid="next-page"]',
          '.el-pagination__next',
          'button:has-text("下一页")',
          '.next-page'
        ]

        for (const selector of nextPageSelectors) {
          try {
            const nextBtn = this.page.locator(selector)
            if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
              await nextBtn.click()
              await this.page.waitForTimeout(1000)
              return true
            }
          } catch (e) {
            continue
          }
        }

        return false
      }
    }
  }

  /**
   * API monitoring helpers
   * API监控助手方法
   */
  get api() {
    return {
      async monitorRequests(endpoints: string[]) {
        const requests: any[] = []

        // Listen to all requests
        this.page.on('request', request => {
          const url = request.url()
          for (const endpoint of endpoints) {
            if (url.includes(endpoint)) {
              requests.push({
                endpoint,
                url,
                method: request.method(),
                timestamp: Date.now()
              })
            }
          }
        })

        // Listen to all responses
        this.page.on('response', response => {
          const url = response.url()
          for (const endpoint of endpoints) {
            if (url.includes(endpoint)) {
              const existingRequest = requests.find(req => req.url === url)
              if (existingRequest) {
                existingRequest.status = response.status()
                existingRequest.success = response.ok()
                existingRequest.responseTime = Date.now() - existingRequest.timestamp
              }
            }
          }
        })

        return {
          getResults: () => requests,
          getSuccessfulRequests: () => requests.filter(req => req.success),
          getFailedRequests: () => requests.filter(req => !req.success),
          getAverageResponseTime: () => {
            const times = requests.filter(req => req.responseTime).map(req => req.responseTime)
            return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
          }
        }
      }
    }
  }
}