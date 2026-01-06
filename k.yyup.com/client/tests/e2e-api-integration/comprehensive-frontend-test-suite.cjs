/**
 * Comprehensive Frontend + Backend Test Suite
 * 综合前端+后端测试套件
 */

const { APIConnectivityTester } = require('./tests/api-only/api-connectivity.cjs')
const { DynamicDataMonitor } = require('./tests/data-loading/dynamic-data-monitor.cjs')
const { ErrorStateMonitor } = require('./tests/error-states/error-state-monitor.cjs')

class ComprehensiveFrontendTestSuite {
  constructor() {
    this.results = {
      connectivity: null,
      dataLoading: null,
      errorHandling: null,
      frontendPages: null,
      overall: null
    }
    this.frontendURL = 'http://k.yyup.cc'
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Frontend + Backend Test Suite')
    console.log('=' .repeat(80))
    console.log()

    const startTime = Date.now()

    try {
      // Phase 1: Backend API Tests
      console.log('📡 Phase 1: API Connectivity Testing')
      console.log('-'.repeat(50))
      const connectivityTester = new APIConnectivityTester()
      await connectivityTester.runAllTests()
      this.results.connectivity = this.analyzeConnectivityResults(connectivityTester.results)
      console.log()

      // Phase 2: Data Loading Tests
      console.log('📊 Phase 2: Dynamic Data Loading Testing')
      console.log('-'.repeat(50))
      const dataMonitor = new DynamicDataMonitor()
      await dataMonitor.runAllDataLoadingTests()
      this.results.dataLoading = this.analyzeDataLoadingResults(dataMonitor.results)
      console.log()

      // Phase 3: Error Handling Tests
      console.log('🛡️ Phase 3: Error State and Security Testing')
      console.log('-'.repeat(50))
      const errorMonitor = new ErrorStateMonitor()
      await errorMonitor.runAllErrorStateTests()
      this.results.errorHandling = this.analyzeErrorHandlingResults(errorMonitor.results)
      console.log()

      // Phase 4: Frontend Page Tests (without puppeteer dependency)
      console.log('🌐 Phase 4: Frontend Page Accessibility Testing')
      console.log('-'.repeat(50))
      await this.runFrontendAccessibilityTests()
      console.log()

      // Generate overall summary
      const totalTime = Date.now() - startTime
      this.generateOverallSummary(totalTime)

    } catch (error) {
      console.error('❌ Test suite execution failed:', error.message)
      throw error
    }
  }

  async runFrontendAccessibilityTests() {
    const http = require('http')
    const https = require('https')
    
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/login', name: 'Login Page' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/students', name: 'Student Management' },
      { path: '/teachers', name: 'Teacher Management' },
      { path: '/classes', name: 'Class Management' },
      { path: '/users', name: 'User Management' },
      { path: '/activities', name: 'Activity Management' },
      { path: '/parents', name: 'Parent Management' },
      { path: '/enrollment-plan', name: 'Enrollment Management' }
    ]
    
    const results = []
    
    for (const page of pages) {
      try {
        const startTime = Date.now()
        const url = `${this.frontendURL}${page.path}`
        
        const response = await this.makeHttpRequest(url)
        const loadTime = Date.now() - startTime
        
        const result = {
          test: `Frontend Page - ${page.name}`,
          success: response.status === 200,
          loadTime,
          url,
          status: response.status,
          contentLength: response.data ? response.data.length : 0,
          hasVueApp: response.data ? this.checkForVueApp(response.data) : false,
          hasElementUI: response.data ? this.checkForElementUI(response.data) : false
        }
        
        results.push(result)
        this.logFrontendResult(result)
        
      } catch (error) {
        results.push({
          test: `Frontend Page - ${page.name}`,
          success: false,
          url: `${this.frontendURL}${page.path}`,
          error: error.message
        })
      }
    }
    
    this.results.frontendPages = this.analyzeFrontendResults(results)
    return results
  }

  async makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https')
      const httpModule = isHttps ? https : http
      
      const req = httpModule.request(url, {
        method: 'GET',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          resolve({ status: res.statusCode, data, headers: res.headers })
        })
      })
      
      req.on('error', reject)
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })
      
      req.end()
    })
  }

  checkForVueApp(htmlContent) {
    const vueIndicators = [
      'vue.js', 'vue.min.js', '__VUE__', 'data-v-',
      'v-if', 'v-for', 'v-show', '{{', 'Vue.createApp'
    ]
    return vueIndicators.some(indicator => htmlContent.includes(indicator))
  }

  checkForElementUI(htmlContent) {
    const elementIndicators = [
      'element-plus', 'el-button', 'el-input', 'el-table',
      'element-ui', 'el-', 'Element Plus'
    ]
    return elementIndicators.some(indicator => htmlContent.includes(indicator))
  }

  analyzeFrontendResults(results) {
    const total = results.length
    const successful = results.filter(r => r.success).length
    const successRate = (successful / total) * 100

    // Performance analysis
    const performanceTests = results.filter(r => r.loadTime && r.success)
    const avgLoadTime = performanceTests.length > 0 ? 
      performanceTests.reduce((sum, r) => sum + r.loadTime, 0) / performanceTests.length : 0

    // Framework detection
    const pagesWithVue = results.filter(r => r.hasVueApp).length
    const pagesWithElement = results.filter(r => r.hasElementUI).length

    return {
      total,
      successful,
      failed: total - successful,
      successRate,
      avgLoadTime: Math.round(avgLoadTime),
      frameworkDetection: {
        vue: pagesWithVue,
        element: pagesWithElement
      },
      status: successRate >= 90 ? 'EXCELLENT' : 
              successRate >= 70 ? 'GOOD' : 
              successRate >= 50 ? 'FAIR' : 'POOR'
    }
  }

  analyzeConnectivityResults(results) {
    const total = results.length
    const successful = results.filter(r => r.success).length
    const successRate = (successful / total) * 100

    return {
      total,
      successful,
      failed: total - successful,
      successRate,
      status: successRate >= 90 ? 'EXCELLENT' : 
              successRate >= 70 ? 'GOOD' : 
              successRate >= 50 ? 'FAIR' : 'POOR'
    }
  }

  analyzeDataLoadingResults(results) {
    const total = results.length
    const successful = results.filter(r => r.success).length
    const successRate = (successful / total) * 100

    // Performance analysis
    const performanceTests = results.filter(r => r.loadTime && r.success)
    const avgLoadTime = performanceTests.length > 0 ? 
      performanceTests.reduce((sum, r) => sum + r.loadTime, 0) / performanceTests.length : 0

    return {
      total,
      successful,
      failed: total - successful,
      successRate,
      avgLoadTime: Math.round(avgLoadTime),
      status: successRate >= 90 ? 'EXCELLENT' : 
              successRate >= 70 ? 'GOOD' : 
              successRate >= 50 ? 'FAIR' : 'POOR'
    }
  }

  analyzeErrorHandlingResults(results) {
    const total = results.length
    const successful = results.filter(r => r.success).length
    const successRate = (successful / total) * 100

    // Security analysis
    const securityTests = results.filter(r => 
      r.test.includes('Unauthorized') || 
      r.test.includes('Invalid Token') || 
      r.test.includes('Invalid Input')
    )
    const securitySuccess = securityTests.filter(r => r.success).length
    const securityRate = securityTests.length > 0 ? (securitySuccess / securityTests.length) * 100 : 0

    return {
      total,
      successful,
      failed: total - successful,
      successRate,
      securityTests: securityTests.length,
      securitySuccess,
      securityRate,
      status: successRate >= 80 ? 'EXCELLENT' : 
              successRate >= 60 ? 'GOOD' : 
              successRate >= 40 ? 'FAIR' : 'POOR'
    }
  }

  logFrontendResult(result) {
    const icon = result.success ? '✅' : '❌'
    const timeInfo = result.loadTime ? ` (${result.loadTime}ms)` : ''
    const statusInfo = result.status ? ` [${result.status}]` : ''
    const sizeInfo = result.contentLength ? ` (${Math.round(result.contentLength/1024)}KB)` : ''
    
    console.log(`${icon} ${result.test}${timeInfo}${statusInfo}${sizeInfo}`)
    
    if (result.hasVueApp || result.hasElementUI) {
      const frameworks = []
      if (result.hasVueApp) frameworks.push('Vue')
      if (result.hasElementUI) frameworks.push('Element')
      console.log(`   Detected: ${frameworks.join(', ')}`)
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`)
    }
  }

  generateOverallSummary(totalTime) {
    console.log('🎯 COMPREHENSIVE FRONTEND + BACKEND TEST SUITE SUMMARY')
    console.log('=' .repeat(80))
    
    // Overall statistics
    const totalTests = (this.results.connectivity?.total || 0) + 
                      (this.results.dataLoading?.total || 0) + 
                      (this.results.errorHandling?.total || 0) +
                      (this.results.frontendPages?.total || 0)
    
    const totalSuccessful = (this.results.connectivity?.successful || 0) + 
                           (this.results.dataLoading?.successful || 0) + 
                           (this.results.errorHandling?.successful || 0) +
                           (this.results.frontendPages?.successful || 0)
    
    const overallSuccessRate = totalTests > 0 ? (totalSuccessful / totalTests) * 100 : 0

    console.log('\n📊 Overall Results:')
    console.log(`   Total Tests Executed: ${totalTests}`)
    console.log(`   Successful Tests: ${totalSuccessful}`)
    console.log(`   Failed Tests: ${totalTests - totalSuccessful}`)
    console.log(`   Overall Success Rate: ${overallSuccessRate.toFixed(1)}%`)
    console.log(`   Total Execution Time: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`)

    // Phase-by-phase breakdown
    console.log('\n📈 Phase-by-Phase Analysis:')
    
    if (this.results.connectivity) {
      console.log(`   🔌 API Connectivity: ${this.results.connectivity.successRate.toFixed(1)}% (${this.results.connectivity.status})`)
      console.log(`      - ${this.results.connectivity.successful}/${this.results.connectivity.total} tests passed`)
    }
    
    if (this.results.dataLoading) {
      console.log(`   📊 Data Loading: ${this.results.dataLoading.successRate.toFixed(1)}% (${this.results.dataLoading.status})`)
      console.log(`      - ${this.results.dataLoading.successful}/${this.results.dataLoading.total} tests passed`)
      console.log(`      - Average load time: ${this.results.dataLoading.avgLoadTime}ms`)
    }
    
    if (this.results.errorHandling) {
      console.log(`   🛡️ Error Handling: ${this.results.errorHandling.successRate.toFixed(1)}% (${this.results.errorHandling.status})`)
      console.log(`      - ${this.results.errorHandling.successful}/${this.results.errorHandling.total} tests passed`)
      console.log(`      - Security tests: ${this.results.errorHandling.securityRate.toFixed(1)}% (${this.results.errorHandling.securitySuccess}/${this.results.errorHandling.securityTests})`)
    }

    if (this.results.frontendPages) {
      console.log(`   🌐 Frontend Pages: ${this.results.frontendPages.successRate.toFixed(1)}% (${this.results.frontendPages.status})`)
      console.log(`      - ${this.results.frontendPages.successful}/${this.results.frontendPages.total} pages accessible`)
      console.log(`      - Average load time: ${this.results.frontendPages.avgLoadTime}ms`)
      console.log(`      - Vue.js detected: ${this.results.frontendPages.frameworkDetection.vue} pages`)
      console.log(`      - Element UI detected: ${this.results.frontendPages.frameworkDetection.element} pages`)
    }

    // Frontend-Backend Integration Assessment
    console.log('\n🔗 Frontend-Backend Integration Assessment:')
    
    const integrationScore = this.calculateIntegrationScore()
    console.log(`   Integration Score: ${integrationScore.score}/100`)
    console.log(`   Status: ${integrationScore.status}`)
    
    integrationScore.strengths.forEach(strength => {
      console.log(`   ✅ ${strength}`)
    })
    
    integrationScore.improvements.forEach(improvement => {
      console.log(`   ⚠️ ${improvement}`)
    })

    // Recommendations
    console.log('\n💡 Recommendations:')
    const recommendations = this.generateRecommendations()
    recommendations.forEach(rec => {
      console.log(`   • ${rec}`)
    })

    // Final assessment
    const finalStatus = overallSuccessRate >= 80 ? 'PRODUCTION READY' :
                       overallSuccessRate >= 60 ? 'NEEDS MINOR FIXES' :
                       overallSuccessRate >= 40 ? 'NEEDS MAJOR FIXES' : 'NOT READY'

    console.log('\n🏆 Final Assessment:')
    console.log(`   System Status: ${finalStatus}`)
    console.log(`   Integration Quality: ${integrationScore.status}`)
    
    if (finalStatus === 'PRODUCTION READY') {
      console.log('   🎉 Frontend + Backend system is ready for production deployment!')
    } else if (finalStatus === 'NEEDS MINOR FIXES') {
      console.log('   🔧 System requires minor fixes before production')
    } else {
      console.log('   🚧 System requires significant improvements')
    }

    console.log('\n' + '=' .repeat(80))
  }

  calculateIntegrationScore() {
    let score = 0
    const strengths = []
    const improvements = []

    // API Connectivity (20 points)
    if (this.results.connectivity) {
      const connectivityPoints = (this.results.connectivity.successRate / 100) * 20
      score += connectivityPoints
      
      if (this.results.connectivity.successRate >= 90) {
        strengths.push('Excellent API connectivity and health')
      } else if (this.results.connectivity.successRate >= 70) {
        strengths.push('Good API connectivity')
      } else {
        improvements.push('API connectivity needs improvement')
      }
    }

    // Data Loading Performance (25 points)
    if (this.results.dataLoading) {
      const dataPoints = (this.results.dataLoading.successRate / 100) * 25
      score += dataPoints

      if (this.results.dataLoading.successRate >= 90) {
        strengths.push('Excellent data loading performance')
      } else if (this.results.dataLoading.successRate >= 70) {
        strengths.push('Good data loading performance')
      } else {
        improvements.push('Data loading performance needs optimization')
      }

      if (this.results.dataLoading.avgLoadTime <= 50) {
        strengths.push('Very fast API response times')
      } else if (this.results.dataLoading.avgLoadTime <= 200) {
        strengths.push('Good API response times')
      } else {
        improvements.push('API response times could be faster')
      }
    }

    // Error Handling and Security (25 points)
    if (this.results.errorHandling) {
      const errorPoints = (this.results.errorHandling.successRate / 100) * 25
      score += errorPoints

      if (this.results.errorHandling.successRate >= 80) {
        strengths.push('Robust error handling and security')
      } else if (this.results.errorHandling.successRate >= 60) {
        strengths.push('Adequate error handling')
      } else {
        improvements.push('Error handling needs strengthening')
      }

      if (this.results.errorHandling.securityRate >= 80) {
        strengths.push('Strong security controls')
      } else {
        improvements.push('Security controls need improvement')
      }
    }

    // Frontend Accessibility (30 points)
    if (this.results.frontendPages) {
      const frontendPoints = (this.results.frontendPages.successRate / 100) * 30
      score += frontendPoints

      if (this.results.frontendPages.successRate >= 90) {
        strengths.push('Excellent frontend accessibility')
      } else if (this.results.frontendPages.successRate >= 70) {
        strengths.push('Good frontend accessibility')
      } else {
        improvements.push('Frontend accessibility needs improvement')
      }

      if (this.results.frontendPages.frameworkDetection.vue > 0) {
        strengths.push('Vue.js framework properly detected')
      }

      if (this.results.frontendPages.frameworkDetection.element > 0) {
        strengths.push('Element UI components detected')
      }

      if (this.results.frontendPages.avgLoadTime <= 2000) {
        strengths.push('Fast frontend page load times')
      } else if (this.results.frontendPages.avgLoadTime > 5000) {
        improvements.push('Frontend page load times could be improved')
      }
    }

    const status = score >= 80 ? 'EXCELLENT' :
                   score >= 60 ? 'GOOD' :
                   score >= 40 ? 'FAIR' : 'POOR'

    return {
      score: Math.round(score),
      status,
      strengths,
      improvements
    }
  }

  generateRecommendations() {
    const recommendations = []

    // Connectivity recommendations
    if (this.results.connectivity?.successRate < 90) {
      recommendations.push('Improve API endpoint reliability and health checks')
    }

    // Performance recommendations
    if (this.results.dataLoading?.avgLoadTime > 100) {
      recommendations.push('Optimize API response times and database queries')
    }

    if (this.results.frontendPages?.avgLoadTime > 3000) {
      recommendations.push('Optimize frontend page load times and asset delivery')
    }

    // Security recommendations
    if (this.results.errorHandling?.securityRate < 80) {
      recommendations.push('Strengthen authentication and input validation')
    }

    if (this.results.errorHandling?.successRate < 70) {
      recommendations.push('Improve error handling and user feedback')
    }

    // Frontend recommendations
    if (this.results.frontendPages?.successRate < 90) {
      recommendations.push('Ensure all frontend pages are accessible and functional')
    }

    // General recommendations
    recommendations.push('Implement comprehensive monitoring for production')
    recommendations.push('Set up automated E2E testing in CI/CD pipeline')
    recommendations.push('Document frontend-backend integration patterns')
    recommendations.push('Consider implementing browser-based testing with Puppeteer')

    return recommendations
  }

  async generateTestReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: (this.results.connectivity?.total || 0) + 
                   (this.results.dataLoading?.total || 0) + 
                   (this.results.errorHandling?.total || 0) +
                   (this.results.frontendPages?.total || 0),
        successfulTests: (this.results.connectivity?.successful || 0) + 
                        (this.results.dataLoading?.successful || 0) + 
                        (this.results.errorHandling?.successful || 0) +
                        (this.results.frontendPages?.successful || 0),
        overallSuccessRate: this.calculateOverallSuccessRate()
      },
      phases: {
        connectivity: this.results.connectivity,
        dataLoading: this.results.dataLoading,
        errorHandling: this.results.errorHandling,
        frontendPages: this.results.frontendPages
      },
      integration: this.calculateIntegrationScore(),
      recommendations: this.generateRecommendations()
    }

    // Write report to file
    const fs = require('fs')
    const reportPath = 'reports/comprehensive-frontend-test-report.json'
    
    try {
      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2))
      console.log(`\n📄 Detailed test report saved to: ${reportPath}`)
    } catch (error) {
      console.warn(`⚠️ Could not save test report: ${error.message}`)
    }

    return reportData
  }

  calculateOverallSuccessRate() {
    const totalTests = (this.results.connectivity?.total || 0) + 
                      (this.results.dataLoading?.total || 0) + 
                      (this.results.errorHandling?.total || 0) +
                      (this.results.frontendPages?.total || 0)
    
    const totalSuccessful = (this.results.connectivity?.successful || 0) + 
                           (this.results.dataLoading?.successful || 0) + 
                           (this.results.errorHandling?.successful || 0) +
                           (this.results.frontendPages?.successful || 0)
    
    return totalTests > 0 ? (totalSuccessful / totalTests) * 100 : 0
  }
}

// Run comprehensive test suite if this file is executed directly
if (require.main === module) {
  const testSuite = new ComprehensiveFrontendTestSuite()
  testSuite.runAllTests()
    .then(() => testSuite.generateTestReport())
    .catch(console.error)
}

module.exports = { ComprehensiveFrontendTestSuite }