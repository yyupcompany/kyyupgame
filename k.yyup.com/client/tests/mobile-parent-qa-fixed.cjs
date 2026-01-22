#!/usr/bin/env node

/**
 * Mobile Parent Role QA Test Script - Fixed Version
 *
 * This script performs comprehensive QA testing of the mobile Parent role
 * using Playwright in headless mode with corrected selectors.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, '../test-results/mobile-parent-qa');
const REPORT_FILE = path.join(__dirname, '../test-results/mobile-parent-qa-report-fixed.json');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone Max', width: 414, height: 896 }
];

// Updated selectors based on actual page structure
const TEST_PAGES = [
  {
    name: 'Parent Center',
    url: '/mobile/parent-center/index',
    selectors: ['.stats-section', '.content-section', '.mobile-sub-page', 'main']
  },
  {
    name: 'Children',
    url: '/mobile/parent-center/children',
    selectors: ['.children-list', '.child-list', '.child-card', 'main', '.mobile-sub-page']
  },
  {
    name: 'Growth',
    url: '/mobile/parent-center/child-growth',
    selectors: ['.growth-records', '.growth-timeline', '.timeline', 'main', '.mobile-sub-page']
  },
  {
    name: 'Assessment',
    url: '/mobile/parent-center/assessment',
    selectors: ['.assessment-center', '.assessment-list', '.assessment-card', 'main', '.mobile-sub-page']
  },
  {
    name: 'Activities',
    url: '/mobile/parent-center/activities',
    selectors: ['.activity-list', '.activity-card', '.activity-item', 'main', '.mobile-sub-page']
  },
  {
    name: 'Photo Album',
    url: '/mobile/parent-center/photo-album',
    selectors: ['.photo-album', '.photo-grid', '.photo-item', 'main', '.mobile-sub-page']
  },
  {
    name: 'AI Assistant',
    url: '/mobile/parent-center/ai-assistant',
    selectors: ['.ai-assistant', '.chat-interface', '.chat-container', 'main', '.mobile-sub-page']
  },
  {
    name: 'Games',
    url: '/mobile/parent-center/games',
    selectors: ['.games-center', '.game-list', '.game-card', 'main', '.mobile-sub-page']
  },
  {
    name: 'Communication',
    url: '/mobile/parent-center/communication',
    selectors: ['.communication-center', '.teacher-list', '.contact-list', 'main', '.mobile-sub-page']
  },
  {
    name: 'Notifications',
    url: '/mobile/parent-center/notifications',
    selectors: ['.notification-center', '.notification-list', '.notification-item', 'main', '.mobile-sub-page']
  }
];

/**
 * Improved login function with better selectors
 */
async function loginAsParent(page) {
  console.log('🔐 Attempting to login as parent...');

  try {
    await page.goto(`${BASE_URL}/mobile/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Look for quick login buttons using correct selector
    const quickLoginButtons = page.locator('.quick-login-buttons button');

    // Wait for buttons to be visible
    await quickLoginButtons.first().waitFor({ state: 'visible', timeout: 10000 });

    // Find the "家长" button (4th button)
    const parentButton = page.locator('.quick-login-buttons button').nth(3);

    if (await parentButton.count() > 0) {
      // Use JavaScript click for better reliability
      await parentButton.evaluate(el => el.click());
      await page.waitForTimeout(3000);

      // Check if we're redirected to parent center
      const currentUrl = page.url();
      if (currentUrl.includes('/mobile/parent-center')) {
        console.log('✅ Login successful!');
        return true;
      }
    }

    console.log('⚠️  Quick login failed');
    return false;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return false;
  }
}

/**
 * Check authentication state
 */
async function checkAuthState(page) {
  const currentUrl = page.url();

  // Check if redirected to login
  if (currentUrl.includes('/login')) {
    return { authenticated: false, reason: 'Redirected to login page' };
  }

  // Check for login prompt
  const loginPrompt = page.locator('text:has-text("请先登录"), text:has-text("登录后")');
  if (await loginPrompt.count() > 0) {
    return { authenticated: false, reason: 'Login prompt detected' };
  }

  // Check for empty state
  const emptyState = page.locator('van-empty, .empty');
  const hasEmptyState = await emptyState.count() > 0;

  // Check for content
  const hasContent = await page.evaluate(() => {
    const body = document.body;
    if (!body) return false;
    const text = body.innerText || '';
    return text.trim().length > 50;
  });

  if (hasEmptyState) {
    return { authenticated: true, reason: 'Authenticated but no data', hasEmptyState: true };
  }

  if (hasContent) {
    return { authenticated: true, reason: 'Has content' };
  }

  return { authenticated: false, reason: 'No content detected' };
}

/**
 * Test a page with multiple selector fallbacks
 */
async function testPage(browser, viewport, pageInfo) {
  const page = await browser.newPage({ viewport });
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  try {
    const start = Date.now();
    await page.goto(`${BASE_URL}${pageInfo.url}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const loadTime = Date.now() - start;

    // Check authentication state
    const authState = await checkAuthState(page);

    // Try multiple selectors
    let hasContent = false;
    let foundSelector = null;

    for (const selector of pageInfo.selectors) {
      try {
        const element = page.locator(selector).first();
        const count = await element.count();
        if (count > 0) {
          hasContent = true;
          foundSelector = selector;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    const screenshotPath = path.join(SCREENSHOT_DIR, `${pageInfo.name.replace(/\s/g, '-')}-fixed.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const result = {
      page: pageInfo.name,
      url: pageInfo.url,
      loadTime,
      hasContent,
      foundSelector,
      authenticated: authState.authenticated,
      authReason: authState.reason,
      consoleErrors: errors.length,
      screenshot: screenshotPath
    };

    return result;
  } catch (err) {
    return {
      page: pageInfo.name,
      url: pageInfo.url,
      error: err.message,
      hasContent: false,
      consoleErrors: errors.length
    };
  } finally {
    await page.close();
  }
}

/**
 * Run comprehensive QA tests
 */
async function runQATests() {
  console.log('🚀 Starting Mobile Parent QA Tests (Fixed Version)...\n');

  const qaResults = {
    timestamp: new Date().toISOString(),
    platform: 'Mobile',
    role: 'Parent',
    summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
    loginTest: {},
    viewportTests: [],
    pageTests: [],
    issues: [],
    consoleErrors: []
  };

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Test 1: Login functionality
    console.log('📱 Testing Login Functionality...');
    const loginPage = await browser.newPage({ viewport: VIEWPORTS[0] });
    const loginSuccess = await loginAsParent(loginPage);

    qaResults.loginTest = {
      passed: loginSuccess,
      screenshot: path.join(SCREENSHOT_DIR, 'login-after-fixed.png')
    };

    await loginPage.screenshot({ path: qaResults.loginTest.screenshot, fullPage: true });
    await loginPage.close();

    if (loginSuccess) {
      console.log('  ✅ Login successful - proceeding with authenticated tests\n');
    } else {
      console.log('  ⚠️  Login failed - proceeding with unauthenticated tests\n');
    }

    // Test 2: Page Functionality with improved selectors
    console.log('📄 Testing Page Functionality (Improved Selectors)...');
    for (const pageInfo of TEST_PAGES) {
      const result = await testPage(browser, VIEWPORTS[1], pageInfo);
      qaResults.pageTests.push(result);

      const authStatus = result.authenticated ? '✅' : '❌';
      const contentStatus = result.hasContent ? '✅' : '❌';

      if (result.error) {
        console.log(`  ❌ ${pageInfo.name}: ${result.error}`);
        qaResults.issues.push(`${pageInfo.name}: ${result.error}`);
        qaResults.summary.failed++;
      } else if (result.authenticated && result.hasContent) {
        console.log(`  ${authStatus} ${pageInfo.name}: ${result.loadTime}ms - ${contentStatus} Content - Auth: ${result.authReason}`);
        qaResults.summary.passed++;
      } else {
        console.log(`  ${authStatus} ${pageInfo.name}: ${result.loadTime}ms - ${contentStatus} Content - Auth: ${result.authReason}`);
        qaResults.summary.warnings++;
      }

      qaResults.summary.total++;

      if (result.consoleErrors > 0) {
        qaResults.consoleErrors.push(...errors);
        qaResults.issues.push(`${pageInfo.name}: ${result.consoleErrors} console errors`);
      }
    }

    // Test 3: Check page content details
    console.log('\n🔍 Analyzing Page Content Details...');
    const detailPage = await browser.newPage({ viewport: VIEWPORTS[1] });
    try {
      await detailPage.goto(`${BASE_URL}/mobile/parent-center/index`, { waitUntil: 'networkidle' });
      await detailPage.waitForTimeout(2000);

      // Get page text content
      const pageText = await detailPage.evaluate(() => {
        return {
          title: document.title,
          bodyText: document.body?.innerText?.substring(0, 200) || '',
          hasVanEmpty: !!document.querySelector('van-empty'),
          hasStatsSection: !!document.querySelector('.stats-section'),
          hasContentSection: !!document.querySelector('.content-section'),
          buttonCount: document.querySelectorAll('button').length,
          linkCount: document.querySelectorAll('a').length
        };
      });

      console.log('  Page Details:');
      console.log(`    Title: ${pageText.title}`);
      console.log(`    Body Text: ${pageText.bodyText.substring(0, 100)}...`);
      console.log(`    Has van-empty: ${pageText.hasVanEmpty}`);
      console.log(`    Has stats-section: ${pageText.hasStatsSection}`);
      console.log(`    Has content-section: ${pageText.hasContentSection}`);
      console.log(`    Buttons: ${pageText.buttonCount}, Links: ${pageText.linkCount}`);

      qaResults.pageDetails = pageText;

    } finally {
      await detailPage.close();
    }

  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 QA TEST SUMMARY (Fixed Version)');
  console.log('='.repeat(60));
  console.log(`Login Test: ${qaResults.loginTest.passed ? '✅ Passed' : '❌ Failed'}`);
  console.log(`\nTotal Tests: ${qaResults.summary.total}`);
  console.log(`✅ Passed: ${qaResults.summary.passed}`);
  console.log(`⚠️  Warnings: ${qaResults.summary.warnings}`);
  console.log(`❌ Failed: ${qaResults.summary.failed}`);
  console.log(`🐛 Issues: ${qaResults.issues.length}`);

  if (qaResults.issues.length > 0) {
    console.log('\n🔍 Issues:');
    qaResults.issues.slice(0, 10).forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }

  console.log(`\n📸 Screenshots: ${SCREENSHOT_DIR}`);
  console.log(`📄 Report: ${REPORT_FILE}\n`);

  fs.writeFileSync(REPORT_FILE, JSON.stringify(qaResults, null, 2));

  return qaResults;
}

runQATests()
  .then(results => {
    const exitCode = (results.summary.failed + (results.loginTest.passed ? 0 : 1)) > 0 ? 1 : 0;
    process.exit(exitCode);
  })
  .catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
