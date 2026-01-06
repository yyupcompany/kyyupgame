import { FullConfig } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Global Teardown for E2E API Integration Tests
 * E2E API集成测试全局清理
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E API Integration Test Global Teardown...')
  
  try {
    // Clean up test artifacts
    await cleanupTestArtifacts()
    
    // Generate final test summary
    await generateTestSummary()
    
    console.log('✅ Global Teardown completed successfully')
  } catch (error) {
    console.error('❌ Global Teardown failed:', error)
  }
}

/**
 * Clean up test artifacts and temporary files
 * 清理测试产物和临时文件
 */
async function cleanupTestArtifacts() {
  console.log('🗑️ Cleaning up test artifacts...')
  
  const artifactPaths = [
    'tests/e2e-api-integration/temp',
    'tests/e2e-api-integration/downloads'
  ]
  
  for (const artifactPath of artifactPaths) {
    const fullPath = path.resolve(artifactPath)
    
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true })
        console.log(`✅ Cleaned up: ${artifactPath}`)
      } catch (error) {
        console.warn(`⚠️ Failed to clean up ${artifactPath}:`, error.message)
      }
    }
  }
}

/**
 * Generate a summary of the test execution
 * 生成测试执行总结
 */
async function generateTestSummary() {
  console.log('📊 Generating test summary...')
  
  const timestamp = new Date().toISOString()
  const summary = {
    timestamp,
    testFramework: 'Playwright E2E API Integration',
    purpose: 'Frontend-Backend API Integration Validation',
    environment: 'Development',
    notes: [
      'This test suite validates API integration between frontend and backend',
      'Tests include role-based authentication, data loading, and error handling',
      'Results help ensure frontend components correctly consume backend APIs'
    ]
  }
  
  const reportsDir = 'tests/e2e-api-integration/reports'
  
  // Ensure reports directory exists
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }
  
  // Write summary file
  const summaryPath = path.join(reportsDir, 'test-execution-summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
  
  console.log(`✅ Test summary generated: ${summaryPath}`)
}

export default globalTeardown