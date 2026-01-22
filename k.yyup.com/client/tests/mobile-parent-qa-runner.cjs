#!/usr/bin/env node

/**
 * Mobile Parent Role QA Test Script
 *
 * This script performs comprehensive QA testing of the mobile Parent role
 * using Playwright in headless mode.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:5173';
const PARENT_QUICK_LOGIN = 'test_parent';
const SCREENSHOT_DIR = path.join(__dirname, '../test-results/mobile-parent-qa');
const REPORT_FILE = path.join(__dirname, '../test-results/mobile-parent-qa-report.json');

// Viewport sizes for testing
const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone Max', width: 414, height: 896 }
];

// Test pages to validate
const TEST_PAGES = [
  { name: 'Login', url: '/mobile/login', expectedElements: ['.login-container, .mobile-login'] },
  { name: 'Parent Center', url: '/mobile/parent-center/index', expectedElements: ['.parent-dashboard, .dashboard'] },
  { name: 'Children List', url: '/mobile/parent-center/children', expectedElements: ['.children-list, .child-list'] },
  { name: 'Growth Records', url: '/mobile/parent-center/child-growth', expectedElements: ['.growth-records, .growth-timeline'] },
  { name: 'Assessment Center', url: '/mobile/parent-center/assessment', expectedElements: ['.assessment-center, .assessment-list'] },
  { name: 'Activity Center', url: '/mobile/parent-center/activities', expectedElements: ['.activity-list, .activity-card'] },
  { name: 'Photo Album', url: '/mobile/parent-center/photo-album', expectedElements: ['.photo-album, .photo-grid'] },
  { name: 'AI Assistant', url: '/mobile/parent-center/ai-assistant', expectedElements: ['.ai-assistant, .chat-interface'] },
  { name: 'Games Center', url: '/mobile/parent-center/games', expectedElements: ['.games-center, .game-list'] },
  { name: 'Communication', url: '/mobile/parent-center/communication', expectedElements: ['.communication-center, .teacher-list'] },
  { name: 'Notifications', url: '/mobile/parent-center/notifications', expectedElements: ['.notification-center, .notification-list'] }
];

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

/**
 * Take a screenshot with context
 */
async function takeScreenshot(page, testName, viewport) {
  const filename = `${testName}-${viewport.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

/**
 * Login as parent using quick login
 */
async function loginAsParent(page) {
  console.log('🔐 Attempting to login as parent...');

  try {
    await page.goto(`${BASE_URL}/mobile/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Look for quick login button
    const parentButton = page.locator('button:has-text("家长")');

    if (await parentButton.count() > 0) {
      await parentButton.click();
      await page.waitForTimeout(2000);

      // Check if we're redirected to parent center
      const currentUrl = page.url();
      if (currentUrl.includes('/mobile/parent-center')) {
        console.log('✅ Login successful!');
        return true;
      }
    }

    console.log('⚠️  Quick login button not found, trying manual login...');
    // Fallback to manual login
    await page.fill('input[placeholder*="用户名"], input[name="username"], input[type="text"]', PARENT_QUICK_LOGIN);
    await page.fill('input[placeholder*="密码"], input[name="password"], input[type="password"]', '123456');
    await page.click('button[type="submit"], button:has-text("登录"), .login-btn');
    await page.waitForTimeout(2000);

    return page.url().includes('/mobile/parent-center');
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return false;
  }
}

/**
 * Test a page for basic functionality
 */
async function testPage(browser, viewport, pageInfo, isLoggedIn) {
  const result = {
    page: pageInfo.name,
    url: pageInfo.url,
    viewport: viewport.name,
    passed: false,
    loadTime: 0,
    hasExpectedElements: false,
    consoleErrors: [],
    screenshot: null,
    issues: []
  };

  const page = await browser.newPage({ viewport });
  const consoleErrors = [];

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    const startTime = Date.now();

    // Navigate to page
    await page.goto(`${BASE_URL}${pageInfo.url}`, { waitUntil: 'networkidle', timeout: 10000 });
    const loadTime = Date.now() - startTime;
    result.loadTime = loadTime;

    // Wait for content to load
    await page.waitForTimeout(1000);

    // Check for expected elements
    let hasElements = false;
    for (const selector of pageInfo.expectedElements) {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          hasElements = true;
          break;
        }
      } catch (e) {
        // Ignore selector errors
      }
    }
    result.hasExpectedElements = hasElements;

    // Check for page-level errors
    const pageError = page.locator('.error-page, .error-message, [data-testid="error"]');
    const hasPageError = await pageError.count() > 0;
    if (hasPageError) {
      result.issues.push('Page displays error message');
    }

    // Take screenshot
    result.screenshot = await takeScreenshot(page, `${pageInfo.name}`, viewport);

    // Determine if test passed
    result.passed = hasElements && !hasPageError && consoleErrors.length === 0;
    result.consoleErrors = consoleErrors;

    // Log results
    if (result.passed) {
      console.log(`✅ ${pageInfo.name} (${viewport.name}) - ${loadTime}ms`);
    } else {
      console.log(`❌ ${pageInfo.name} (${viewport.name}) - Load: ${loadTime}ms, Elements: ${hasElements}, Errors: ${consoleErrors.length}`);
      if (result.issues.length > 0) {
        console.log(`   Issues: ${result.issues.join(', ')}`);
      }
    }

  } catch (error) {
    result.issues.push(`Navigation error: ${error.message}`);
    console.log(`❌ ${pageInfo.name} (${viewport.name}) - ${error.message}`);
  } finally {
    await page.close();
  }

  return result;
}

/**
 * Run comprehensive QA tests
 */
async function runQATests() {
  console.log('🚀 Starting Mobile Parent QA Tests...\n');
  console.log(`📸 Screenshots will be saved to: ${SCREENSHOT_DIR}`);
  console.log(`📊 Report will be saved to: ${REPORT_FILE}\n`);

  // Initialize results object
  const qaResults = {
    timestamp: new Date().toISOString(),
    platform: 'Mobile',
    role: 'Parent',
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    },
    viewportTests: [],
    pageTests: [],
    functionalTests: [],
    consoleErrors: [],
    performanceMetrics: [],
    issues: []
  };

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Test 1: Login functionality on smallest viewport
    console.log('\n📱 Testing Login Functionality (iPhone SE)...');
    const loginPage = await browser.newPage({ viewport: VIEWPORTS[0] });
    const loginSuccess = await loginAsParent(loginPage);

    const loginScreenshot = await takeScreenshot(loginPage, 'login-success', VIEWPORTS[0]);
    qaResults.functionalTests.push({
      test: 'Parent Login',
      passed: loginSuccess,
      screenshot: loginScreenshot,
      notes: loginSuccess ? 'Successfully logged in using quick login' : 'Login failed'
    });

    if (!loginSuccess) {
      console.log('⚠️  Could not login, proceeding with unauthenticated tests...');
    }

    await loginPage.close();

    // Test 2: Viewport compatibility
    console.log('\n📐 Testing Viewport Compatibility...');
    for (const viewport of VIEWPORTS) {
      console.log(`  Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);

      const page = await browser.newPage({ viewport });

      try {
        await page.goto(`${BASE_URL}/mobile/parent-center/index`, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(1000);

        // Check for horizontal overflow
        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });

        // Check if main content is visible
        const mainContent = page.locator('main, .main-content, .parent-center');
        const isContentVisible = await mainContent.count() > 0;

        const passed = !hasHorizontalOverflow && isContentVisible;
        const screenshot = await takeScreenshot(page, 'viewport-test', viewport);

        qaResults.viewportTests.push({
          viewport: viewport.name,
          width: viewport.width,
          height: viewport.height,
          hasHorizontalOverflow,
          isContentVisible,
          passed,
          screenshot
        });

        if (passed) {
          console.log(`  ✅ ${viewport.name} - No layout issues`);
        } else {
          console.log(`  ⚠️  ${viewport.name} - Issues detected`);
          if (hasHorizontalOverflow) qaResults.issues.push(`${viewport.name}: Horizontal overflow detected`);
          if (!isContentVisible) qaResults.issues.push(`${viewport.name}: Main content not visible`);
        }

      } catch (error) {
        console.log(`  ❌ ${viewport.name} - ${error.message}`);
        qaResults.viewportTests.push({
          viewport: viewport.name,
          passed: false,
          error: error.message
        });
      } finally {
        await page.close();
      }
    }

    // Test 3: Page accessibility and functionality
    console.log('\n📄 Testing Page Functionality...');
    for (const pageInfo of TEST_PAGES) {
      // Skip login page as we already tested it
      if (pageInfo.name === 'Login') continue;

      // Test on primary viewport (iPhone 12)
      const result = await testPage(browser, VIEWPORTS[1], pageInfo, loginSuccess);
      qaResults.pageTests.push(result);

      if (result.passed) {
        qaResults.summary.passed++;
      } else {
        qaResults.summary.failed++;
        qaResults.issues.push(...result.issues);
        if (result.consoleErrors.length > 0) {
          qaResults.consoleErrors.push(...result.consoleErrors);
        }
      }
      qaResults.summary.total++;
    }

    // Test 4: Performance metrics
    console.log('\n⚡ Testing Performance Metrics...');
    const page = await browser.newPage({ viewport: VIEWPORTS[1] });

    try {
      // Test page load time
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/mobile/parent-center/index`, { waitUntil: 'networkidle' });
      const initialLoadTime = Date.now() - startTime;

      // Test navigation between pages
      const navStart = Date.now();
      await page.goto(`${BASE_URL}/mobile/parent-center/children`, { waitUntil: 'networkidle' });
      const navTime = Date.now() - navStart;

      qaResults.performanceMetrics.push({
        test: 'Initial Page Load',
        time: initialLoadTime,
        acceptable: initialLoadTime < 5000
      });
      qaResults.performanceMetrics.push({
        test: 'Page Navigation',
        time: navTime,
        acceptable: navTime < 3000
      });

      console.log(`  📊 Initial Load: ${initialLoadTime}ms ${initialLoadTime < 5000 ? '✅' : '⚠️'}`);
      console.log(`  📊 Navigation: ${navTime}ms ${navTime < 3000 ? '✅' : '⚠️'}`);

    } finally {
      await page.close();
    }

    // Test 5: Interactive elements
    console.log('\n🖱️  Testing Interactive Elements...');
    const testPage = await browser.newPage({ viewport: VIEWPORTS[1] });

    try {
      await testPage.goto(`${BASE_URL}/mobile/parent-center/index`, { waitUntil: 'networkidle' });
      await testPage.waitForTimeout(1000);

      // Test buttons
      const buttons = testPage.locator('button, .btn, [role="button"]');
      const buttonCount = await buttons.count();

      // Test links
      const links = testPage.locator('a[href]');
      const linkCount = await links.count();

      // Test inputs
      const inputs = testPage.locator('input, textarea, select');
      const inputCount = await inputs.count();

      qaResults.functionalTests.push({
        test: 'Interactive Elements',
        passed: true,
        details: {
          buttons: buttonCount,
          links: linkCount,
          inputs: inputCount
        }
      });

      console.log(`  ✅ Found ${buttonCount} buttons, ${linkCount} links, ${inputCount} inputs`);

    } catch (error) {
      qaResults.functionalTests.push({
        test: 'Interactive Elements',
        passed: false,
        error: error.message
      });
      console.log(`  ❌ Error testing interactive elements: ${error.message}`);
    } finally {
      await testPage.close();
    }

  } finally {
    await browser.close();
  }

  // Generate summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 QA TEST SUMMARY');
  console.log('='.repeat(50));

  const totalTests = qaResults.summary.total + qaResults.functionalTests.length + qaResults.viewportTests.length;
  const totalPassed = qaResults.summary.passed +
    qaResults.functionalTests.filter(t => t.passed).length +
    qaResults.viewportTests.filter(t => t.passed).length;
  const totalFailed = totalTests - totalPassed;

  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`⚠️  Warnings: ${qaResults.summary.warnings}`);
  console.log(`🐛 Issues Found: ${qaResults.issues.length}`);

  if (qaResults.issues.length > 0) {
    console.log('\n🔍 Issues Summary:');
    qaResults.issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }

  if (qaResults.consoleErrors.length > 0) {
    console.log(`\n💻 Console Errors: ${qaResults.consoleErrors.length}`);
    qaResults.consoleErrors.slice(0, 5).forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.substring(0, 100)}...`);
    });
  }

  console.log(`\n📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
  console.log(`📄 Full report saved to: ${REPORT_FILE}`);
  console.log('\n' + '='.repeat(50));

  // Save report
  qaResults.summary.total = totalTests;
  qaResults.summary.passed = totalPassed;
  qaResults.summary.failed = totalFailed;

  fs.writeFileSync(REPORT_FILE, JSON.stringify(qaResults, null, 2));

  return qaResults;
}

// Run tests
runQATests()
  .then(results => {
    process.exit(results.summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ QA Test execution failed:', error);
    process.exit(1);
  });
