/**
 * Comprehensive E2E API Integration Test Suite
 * 综合E2E API集成测试套件
 */

const { APIConnectivityTester } = require('./tests/api-only/api-connectivity.cjs')
const { DynamicDataMonitor } = require('./tests/data-loading/dynamic-data-monitor.cjs')
const { ErrorStateMonitor } = require('./tests/error-states/error-state-monitor.cjs')

class ComprehensiveTestSuite {
  constructor() {
    this.results = {
      connectivity: null,
      dataLoading: null,
      errorHandling: null,
      overall: null
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive E2E API Integration Test Suite')
    console.log('=' .repeat(80))
    console.log()

    const startTime = Date.now()

    try {
      // Test 1: API Connectivity
      console.log('📡 Phase 1: API Connectivity Testing')
      console.log('-'.repeat(50))
      const connectivityTester = new APIConnectivityTester()
      await connectivityTester.runAllTests()
      this.results.connectivity = this.analyzeConnectivityResults(connectivityTester.results)
      console.log()

      // Test 2: Dynamic Data Loading
      console.log('📊 Phase 2: Dynamic Data Loading Testing')
      console.log('-'.repeat(50))
      const dataMonitor = new DynamicDataMonitor()
      await dataMonitor.runAllDataLoadingTests()
      this.results.dataLoading = this.analyzeDataLoadingResults(dataMonitor.results)
      console.log()

      // Test 3: Error State Handling
      console.log('🛡️ Phase 3: Error State and Security Testing')
      console.log('-'.repeat(50))
      const errorMonitor = new ErrorStateMonitor()
      await errorMonitor.runAllErrorStateTests()
      this.results.errorHandling = this.analyzeErrorHandlingResults(errorMonitor.results)
      console.log()

      // Generate overall summary
      const totalTime = Date.now() - startTime
      this.generateOverallSummary(totalTime)

    } catch (error) {
      console.error('❌ Test suite execution failed:', error.message)
      throw error
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

  generateOverallSummary(totalTime) {
    console.log('🎯 COMPREHENSIVE TEST SUITE SUMMARY')
    console.log('=' .repeat(80))
    
    // Overall statistics
    const totalTests = (this.results.connectivity?.total || 0) + 
                      (this.results.dataLoading?.total || 0) + 
                      (this.results.errorHandling?.total || 0)
    
    const totalSuccessful = (this.results.connectivity?.successful || 0) + 
                           (this.results.dataLoading?.successful || 0) + 
                           (this.results.errorHandling?.successful || 0)
    
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
      console.log('   🎉 System is ready for production deployment!')
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

    // API Connectivity (25 points)
    if (this.results.connectivity) {
      const connectivityPoints = (this.results.connectivity.successRate / 100) * 25
      score += connectivityPoints
      
      if (this.results.connectivity.successRate >= 90) {
        strengths.push('Excellent API connectivity and health')
      } else if (this.results.connectivity.successRate >= 70) {
        strengths.push('Good API connectivity')
      } else {
        improvements.push('API connectivity needs improvement')
      }
    }

    // Data Loading Performance (35 points)
    if (this.results.dataLoading) {
      const dataPoints = (this.results.dataLoading.successRate / 100) * 35
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

    // Error Handling and Security (40 points)
    if (this.results.errorHandling) {
      const errorPoints = (this.results.errorHandling.successRate / 100) * 40
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

    if (this.results.dataLoading?.successRate < 90) {
      recommendations.push('Enhance data loading mechanisms and caching')
    }

    // Security recommendations
    if (this.results.errorHandling?.securityRate < 80) {
      recommendations.push('Strengthen authentication and input validation')
    }

    if (this.results.errorHandling?.successRate < 70) {
      recommendations.push('Improve error handling and user feedback')
    }

    // General recommendations
    recommendations.push('Implement monitoring and alerting for production')
    recommendations.push('Set up automated testing in CI/CD pipeline')
    recommendations.push('Document API integration patterns for team')

    return recommendations
  }

  async generateTestReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: (this.results.connectivity?.total || 0) + 
                   (this.results.dataLoading?.total || 0) + 
                   (this.results.errorHandling?.total || 0),
        successfulTests: (this.results.connectivity?.successful || 0) + 
                        (this.results.dataLoading?.successful || 0) + 
                        (this.results.errorHandling?.successful || 0),
        overallSuccessRate: this.calculateOverallSuccessRate()
      },
      phases: {
        connectivity: this.results.connectivity,
        dataLoading: this.results.dataLoading,
        errorHandling: this.results.errorHandling
      },
      integration: this.calculateIntegrationScore(),
      recommendations: this.generateRecommendations()
    }

    // Write report to file
    const fs = require('fs')
    const reportPath = 'reports/comprehensive-test-report.json'
    
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
                      (this.results.errorHandling?.total || 0)
    
    const totalSuccessful = (this.results.connectivity?.successful || 0) + 
                           (this.results.dataLoading?.successful || 0) + 
                           (this.results.errorHandling?.successful || 0)
    
    return totalTests > 0 ? (totalSuccessful / totalTests) * 100 : 0
  }
}

// Run comprehensive test suite if this file is executed directly
if (require.main === module) {
  const testSuite = new ComprehensiveTestSuite()
  testSuite.runAllTests()
    .then(() => testSuite.generateTestReport())
    .catch(console.error)
}

module.exports = { ComprehensiveTestSuite }