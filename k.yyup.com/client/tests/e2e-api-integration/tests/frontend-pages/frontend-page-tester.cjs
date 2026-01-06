/**
 * Frontend Page E2E Tester (Browser-Based)
 * 前端页面E2E测试器 (基于浏览器)
 */

const puppeteer = require('puppeteer')

class FrontendPageTester {
  constructor() {
    this.frontendURL = 'http://k.yyup.cc'
    this.browser = null
    this.page = null
    this.results = []
    this.credentials = {
      username: 'admin',
      password: 'admin123'
    }
  }

  async initialize() {
    console.log('🚀 Initializing browser for frontend page testing...')
    
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      })
      
      this.page = await this.browser.newPage()
      
      // Set viewport and user agent
      await this.page.setViewport({ width: 1920, height: 1080 })
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36')
      
      // Enable request interception for monitoring
      await this.page.setRequestInterception(true)
      
      // Track API calls
      this.apiCalls = []
      this.page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          this.apiCalls.push({
            url: request.url(),
            method: request.method(),
            timestamp: Date.now()
          })
        }
        request.continue()
      })
      
      // Track responses
      this.page.on('response', (response) => {
        if (response.url().includes('/api/')) {
          const callIndex = this.apiCalls.findIndex(call => 
            call.url === response.url() && !call.status
          )
          if (callIndex >= 0) {
            this.apiCalls[callIndex].status = response.status()
            this.apiCalls[callIndex].responseTime = Date.now() - this.apiCalls[callIndex].timestamp
          }
        }
      })
      
      console.log('✅ Browser initialized successfully')
      return true
    } catch (error) {
      console.log('❌ Browser initialization failed:', error.message)
      return false
    }
  }

  async login() {
    console.log('\n🔐 Testing login functionality...')
    
    try {
      const startTime = Date.now()
      
      // Navigate to login page
      await this.page.goto(`${this.frontendURL}/login`, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      })
      
      // Wait for login form to be visible
      await this.page.waitForSelector('input[type="text"], input[placeholder*="用户名"], input[placeholder*="username"]', { timeout: 10000 })
      
      // Find username and password fields
      const usernameSelector = await this.findUsernameField()
      const passwordSelector = await this.findPasswordField()
      const submitSelector = await this.findSubmitButton()
      
      if (!usernameSelector || !passwordSelector || !submitSelector) {
        throw new Error('Could not find login form elements')
      }
      
      // Fill login form
      await this.page.type(usernameSelector, this.credentials.username)
      await this.page.type(passwordSelector, this.credentials.password)
      
      // Submit form
      await this.page.click(submitSelector)
      
      // Wait for navigation or error message
      const result = await Promise.race([
        this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).then(() => 'success'),
        this.page.waitForSelector('.error, .el-message--error, [class*="error"]', { timeout: 5000 }).then(() => 'error'),
        new Promise(resolve => setTimeout(() => resolve('timeout'), 10000))
      ])
      
      const loginTime = Date.now() - startTime
      
      if (result === 'success') {
        // Check if we're redirected to dashboard or main page
        const currentUrl = this.page.url()
        const isLoggedIn = !currentUrl.includes('/login') && 
                          (currentUrl.includes('/dashboard') || currentUrl.includes('/home') || currentUrl === `${this.frontendURL}/`)
        
        if (isLoggedIn) {
          this.results.push({
            test: 'Login Functionality',
            success: true,
            loadTime: loginTime,
            message: `Login successful, redirected to: ${currentUrl}`,
            url: currentUrl
          })
          return true
        }
      }
      
      // Login failed
      const errorText = await this.page.$eval('.error, .el-message--error, [class*="error"]', 
        el => el.textContent).catch(() => 'Unknown error')
      
      this.results.push({
        test: 'Login Functionality',
        success: false,
        loadTime: loginTime,
        message: `Login failed: ${errorText}`,
        url: this.page.url()
      })
      
      return false
    } catch (error) {
      this.results.push({
        test: 'Login Functionality',
        success: false,
        error: error.message,
        url: this.page.url()
      })
      return false
    }
  }

  async findUsernameField() {
    const selectors = [
      'input[type="text"]',
      'input[placeholder*="用户名"]',
      'input[placeholder*="username"]',
      'input[name="username"]',
      'input[id="username"]',
      '.el-input input[type="text"]'
    ]
    
    for (const selector of selectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 1000 })
        return selector
      } catch (e) {
        continue
      }
    }
    return null
  }

  async findPasswordField() {
    const selectors = [
      'input[type="password"]',
      'input[placeholder*="密码"]',
      'input[placeholder*="password"]',
      'input[name="password"]',
      'input[id="password"]'
    ]
    
    for (const selector of selectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 1000 })
        return selector
      } catch (e) {
        continue
      }
    }
    return null
  }

  async findSubmitButton() {
    const selectors = [
      'button[type="submit"]',
      'button:contains("登录")',
      'button:contains("Login")',
      '.el-button--primary',
      'input[type="submit"]',
      'button.login-btn'
    ]
    
    for (const selector of selectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 1000 })
        return selector
      } catch (e) {
        continue
      }
    }
    return null
  }

  async testPageLoad(pagePath, pageName) {
    console.log(`\n📄 Testing ${pageName} page load...`)
    
    try {
      const startTime = Date.now()
      const url = `${this.frontendURL}${pagePath}`
      
      // Reset API calls tracking
      this.apiCalls = []
      
      // Navigate to page
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      })
      
      const loadTime = Date.now() - startTime
      
      // Wait for page content to load
      await this.page.waitForTimeout(2000)
      
      // Check if page loaded successfully
      const pageTitle = await this.page.title().catch(() => 'Unknown')
      const hasContent = await this.page.evaluate(() => {
        return document.body.innerText.length > 100
      })
      
      // Check for Vue app initialization
      const hasVueApp = await this.page.evaluate(() => {
        return !!window.Vue || !!document.querySelector('[data-v-]') || !!document.querySelector('.el-')
      })
      
      // Check for error messages
      const hasErrors = await this.page.evaluate(() => {
        const errorSelectors = ['.error', '.el-message--error', '[class*="error"]', '.404', '.500']
        return errorSelectors.some(selector => document.querySelector(selector))
      })
      
      // Analyze API calls made during page load
      const apiCallsCount = this.apiCalls.length
      const successfulApiCalls = this.apiCalls.filter(call => call.status && call.status < 400).length
      const avgApiResponseTime = this.apiCalls.length > 0 ? 
        this.apiCalls.reduce((sum, call) => sum + (call.responseTime || 0), 0) / this.apiCalls.length : 0
      
      const result = {
        test: `${pageName} Page Load`,
        success: hasContent && hasVueApp && !hasErrors,
        loadTime,
        url,
        pageTitle,
        hasContent,
        hasVueApp,
        hasErrors,
        apiCalls: {
          total: apiCallsCount,
          successful: successfulApiCalls,
          avgResponseTime: Math.round(avgApiResponseTime)
        },
        message: hasErrors ? 'Page has errors' : 
                hasContent && hasVueApp ? 'Page loaded successfully' : 
                'Page may not have loaded completely'
      }
      
      this.results.push(result)
      this.logResult(result)
      
      return result
    } catch (error) {
      const result = {
        test: `${pageName} Page Load`,
        success: false,
        error: error.message,
        url: `${this.frontendURL}${pagePath}`
      }
      
      this.results.push(result)
      this.logResult(result)
      
      return result
    }
  }

  async testPageFunctionality(pagePath, pageName, actions = []) {
    console.log(`\n⚙️ Testing ${pageName} page functionality...`)
    
    try {
      // First load the page
      await this.testPageLoad(pagePath, pageName)
      
      // Perform specific actions for this page type
      const functionalityResults = []
      
      // Test search functionality (if search box exists)
      try {
        const searchSelector = 'input[placeholder*="搜索"], input[placeholder*="search"], .el-input__inner'
        await this.page.waitForSelector(searchSelector, { timeout: 3000 })
        
        await this.page.type(searchSelector, '测试')
        await this.page.keyboard.press('Enter')
        await this.page.waitForTimeout(2000)
        
        functionalityResults.push({
          action: 'Search',
          success: true,
          message: 'Search functionality works'
        })
      } catch (e) {
        functionalityResults.push({
          action: 'Search',
          success: false,
          message: 'No search functionality found or search failed'
        })
      }
      
      // Test pagination (if pagination exists)
      try {
        const paginationSelector = '.el-pagination, .pagination, [class*="page"]'
        await this.page.waitForSelector(paginationSelector, { timeout: 3000 })
        
        const nextButton = '.el-pagination__next, .page-next, [class*="next"]'
        await this.page.click(nextButton)
        await this.page.waitForTimeout(2000)
        
        functionalityResults.push({
          action: 'Pagination',
          success: true,
          message: 'Pagination functionality works'
        })
      } catch (e) {
        functionalityResults.push({
          action: 'Pagination',
          success: false,
          message: 'No pagination found or pagination failed'
        })
      }
      
      // Test add/create button (if exists)
      try {
        const addButtonSelector = 'button:contains("添加"), button:contains("新增"), button:contains("创建"), .el-button--primary'
        await this.page.waitForSelector(addButtonSelector, { timeout: 3000 })
        
        await this.page.click(addButtonSelector)
        await this.page.waitForTimeout(1000)
        
        // Check if dialog/modal opened
        const hasDialog = await this.page.$('.el-dialog, .modal, [class*="dialog"]')
        
        functionalityResults.push({
          action: 'Add/Create',
          success: !!hasDialog,
          message: hasDialog ? 'Add dialog opened successfully' : 'Add button clicked but no dialog'
        })
        
        // Close dialog if opened
        if (hasDialog) {
          await this.page.keyboard.press('Escape')
          await this.page.waitForTimeout(500)
        }
      } catch (e) {
        functionalityResults.push({
          action: 'Add/Create',
          success: false,
          message: 'No add button found or add functionality failed'
        })
      }
      
      const result = {
        test: `${pageName} Functionality`,
        success: functionalityResults.some(r => r.success),
        url: `${this.frontendURL}${pagePath}`,
        actions: functionalityResults,
        message: `Tested ${functionalityResults.length} functionality features`
      }
      
      this.results.push(result)
      this.logResult(result)
      
      return result
    } catch (error) {
      const result = {
        test: `${pageName} Functionality`,
        success: false,
        error: error.message,
        url: `${this.frontendURL}${pagePath}`
      }
      
      this.results.push(result)
      this.logResult(result)
      
      return result
    }
  }

  async runAllPageTests() {
    console.log('🚀 Starting Frontend Page E2E Tests...\n')
    
    // Initialize browser
    const browserReady = await this.initialize()
    if (!browserReady) {
      console.log('❌ Cannot proceed without browser')
      return
    }
    
    try {
      // Step 1: Test login
      const loginSuccess = await this.login()
      if (!loginSuccess) {
        console.log('⚠️ Login failed, some tests may not work properly')
      }
      
      // Step 2: Test main pages
      const pages = [
        { path: '/dashboard', name: 'Dashboard' },
        { path: '/students', name: 'Student Management' },
        { path: '/teachers', name: 'Teacher Management' },
        { path: '/classes', name: 'Class Management' },
        { path: '/users', name: 'User Management' },
        { path: '/activities', name: 'Activity Management' },
        { path: '/parents', name: 'Parent Management' },
        { path: '/enrollment-plan', name: 'Enrollment Management' },
        { path: '/system/roles', name: 'Role Management' },
        { path: '/system/permissions', name: 'Permission Management' }
      ]
      
      // Test page loads
      console.log('\n📄 Testing page loads...')
      for (const page of pages) {
        await this.testPageLoad(page.path, page.name)
        await this.page.waitForTimeout(1000) // Brief pause between tests
      }
      
      // Test page functionality for key pages
      console.log('\n⚙️ Testing page functionality...')
      const functionalityPages = [
        { path: '/students', name: 'Student Management' },
        { path: '/teachers', name: 'Teacher Management' },
        { path: '/classes', name: 'Class Management' }
      ]
      
      for (const page of functionalityPages) {
        await this.testPageFunctionality(page.path, page.name)
        await this.page.waitForTimeout(1000)
      }
      
      // Step 3: Generate summary
      this.generateSummary()
      
    } finally {
      // Always close browser
      if (this.browser) {
        await this.browser.close()
        console.log('\n🔄 Browser closed')
      }
    }
  }

  logResult(result) {
    const icon = result.success ? '✅' : '❌'
    const timeInfo = result.loadTime ? ` (${result.loadTime}ms)` : ''
    const apiInfo = result.apiCalls ? ` [${result.apiCalls.total} API calls]` : ''
    
    console.log(`${icon} ${result.test}${timeInfo}${apiInfo}`)
    
    if (result.message) {
      console.log(`   ${result.message}`)
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`)
    }
    
    if (result.actions && result.actions.length > 0) {
      result.actions.forEach(action => {
        const actionIcon = action.success ? '  ✅' : '  ❌'
        console.log(`${actionIcon} ${action.action}: ${action.message}`)
      })
    }
  }

  generateSummary() {
    console.log('\n📊 Frontend Page Testing Summary:')
    
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const failed = total - successful
    const successRate = ((successful / total) * 100).toFixed(1)
    
    console.log(`   Total Tests: ${total}`)
    console.log(`   Successful: ${successful}`)
    console.log(`   Failed: ${failed}`)
    console.log(`   Success Rate: ${successRate}%`)
    
    // Performance analysis
    const pageLoadTests = this.results.filter(r => r.loadTime && r.success)
    if (pageLoadTests.length > 0) {
      const avgLoadTime = pageLoadTests.reduce((sum, r) => sum + r.loadTime, 0) / pageLoadTests.length
      const maxLoadTime = Math.max(...pageLoadTests.map(r => r.loadTime))
      const minLoadTime = Math.min(...pageLoadTests.map(r => r.loadTime))
      
      console.log('\n⏱️ Page Load Performance:')
      console.log(`   Average Load Time: ${avgLoadTime.toFixed(0)}ms`)
      console.log(`   Max Load Time: ${maxLoadTime}ms`)
      console.log(`   Min Load Time: ${minLoadTime}ms`)
      
      const slowPages = pageLoadTests.filter(r => r.loadTime > 5000)
      if (slowPages.length > 0) {
        console.log(`   ⚠️ Slow pages (>5s): ${slowPages.length}`)
        slowPages.forEach(page => {
          console.log(`     - ${page.test}: ${page.loadTime}ms`)
        })
      }
    }
    
    // API calls analysis
    const apiTests = this.results.filter(r => r.apiCalls && r.apiCalls.total > 0)
    if (apiTests.length > 0) {
      const totalApiCalls = apiTests.reduce((sum, r) => sum + r.apiCalls.total, 0)
      const totalSuccessfulApiCalls = apiTests.reduce((sum, r) => sum + r.apiCalls.successful, 0)
      const avgApiResponseTime = apiTests.reduce((sum, r) => sum + r.apiCalls.avgResponseTime, 0) / apiTests.length
      
      console.log('\n📡 API Integration Analysis:')
      console.log(`   Total API Calls: ${totalApiCalls}`)
      console.log(`   Successful API Calls: ${totalSuccessfulApiCalls}`)
      console.log(`   API Success Rate: ${((totalSuccessfulApiCalls / totalApiCalls) * 100).toFixed(1)}%`)
      console.log(`   Average API Response Time: ${avgApiResponseTime.toFixed(0)}ms`)
    }
    
    // Functionality analysis
    const functionalityTests = this.results.filter(r => r.actions)
    if (functionalityTests.length > 0) {
      const totalActions = functionalityTests.reduce((sum, r) => sum + r.actions.length, 0)
      const successfulActions = functionalityTests.reduce((sum, r) => 
        sum + r.actions.filter(a => a.success).length, 0)
      
      console.log('\n⚙️ Page Functionality Analysis:')
      console.log(`   Total Feature Tests: ${totalActions}`)
      console.log(`   Working Features: ${successfulActions}`)
      console.log(`   Feature Success Rate: ${((successfulActions / totalActions) * 100).toFixed(1)}%`)
    }
    
    // Final assessment
    const overallStatus = successRate >= 80 ? 'EXCELLENT' : 
                         successRate >= 60 ? 'GOOD' : 
                         successRate >= 40 ? 'FAIR' : 'POOR'
    
    console.log(`\n🎯 Overall Frontend Status: ${overallStatus}`)
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results
        .filter(r => !r.success)
        .slice(0, 5)
        .forEach(r => console.log(`   - ${r.test}: ${r.error || r.message || 'Unknown error'}`))
      
      if (failed > 5) {
        console.log(`   ... and ${failed - 5} more`)
      }
    }
    
    console.log('\n💡 Tested Pages:')
    const pageTests = this.results.filter(r => r.test.includes('Page Load'))
    pageTests.forEach(test => {
      const status = test.success ? '✅' : '❌'
      console.log(`   ${status} ${test.url}`)
    })
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new FrontendPageTester()
  tester.runAllPageTests().catch(console.error)
}

module.exports = { FrontendPageTester }