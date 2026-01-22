#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, '../test-results/mobile-parent-qa');
const REPORT_FILE = path.join(__dirname, '../test-results/mobile-parent-qa-report.json');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone Max', width: 414, height: 896 }
];

const TEST_PAGES = [
  { name: 'Parent Center', url: '/mobile/parent-center/index', selector: '.parent-dashboard, .dashboard' },
  { name: 'Children', url: '/mobile/parent-center/children', selector: '.children-list, .child-list' },
  { name: 'Growth', url: '/mobile/parent-center/child-growth', selector: '.growth-records, .growth-timeline' },
  { name: 'Assessment', url: '/mobile/parent-center/assessment', selector: '.assessment-center, .assessment-list' },
  { name: 'Activities', url: '/mobile/parent-center/activities', selector: '.activity-list, .activity-card' },
  { name: 'Photo Album', url: '/mobile/parent-center/photo-album', selector: '.photo-album, .photo-grid' },
  { name: 'AI Assistant', url: '/mobile/parent-center/ai-assistant', selector: '.ai-assistant, .chat-interface' },
  { name: 'Games', url: '/mobile/parent-center/games', selector: '.games-center, .game-list' },
  { name: 'Communication', url: '/mobile/parent-center/communication', selector: '.communication-center, .teacher-list' },
  { name: 'Notifications', url: '/mobile/parent-center/notifications', selector: '.notification-center, .notification-list' }
];

async function runQATests() {
  console.log('🚀 Starting Mobile Parent QA Tests...\n');

  const qaResults = {
    timestamp: new Date().toISOString(),
    platform: 'Mobile',
    role: 'Parent',
    summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
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
    // Test 1: Viewport Compatibility
    console.log('📐 Testing Viewport Compatibility...');
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: vp });
      try {
        await page.goto(`${BASE_URL}/mobile/parent-center/index`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);

        const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
        const screenshotPath = path.join(SCREENSHOT_DIR, `viewport-${vp.name.replace(/\s/g, '-')}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        const result = { viewport: vp.name, hasOverflow, screenshot: screenshotPath };
        qaResults.viewportTests.push(result);

        if (hasOverflow) {
          console.log(`  ⚠️  ${vp.name}: Horizontal overflow`);
          qaResults.issues.push(`${vp.name}: Horizontal overflow`);
        } else {
          console.log(`  ✅ ${vp.name}: No layout issues`);
          qaResults.summary.passed++;
        }
        qaResults.summary.total++;
      } catch (err) {
        console.log(`  ❌ ${vp.name}: ${err.message}`);
        qaResults.issues.push(`${vp.name}: ${err.message}`);
        qaResults.summary.failed++;
        qaResults.summary.total++;
      } finally {
        await page.close();
      }
    }

    // Test 2: Page Functionality
    console.log('\n📄 Testing Page Functionality...');
    for (const pageInfo of TEST_PAGES) {
      const page = await browser.newPage({ viewport: VIEWPORTS[1] });
      const errors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      try {
        const start = Date.now();
        await page.goto(`${BASE_URL}${pageInfo.url}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);
        const loadTime = Date.now() - start;

        const element = page.locator(pageInfo.selector).first();
        const isVisible = await element.count() > 0;

        const screenshotPath = path.join(SCREENSHOT_DIR, `${pageInfo.name.replace(/\s/g, '-')}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        const result = {
          page: pageInfo.name,
          url: pageInfo.url,
          loadTime,
          hasContent: isVisible,
          consoleErrors: errors.length,
          screenshot: screenshotPath
        };
        qaResults.pageTests.push(result);

        if (isVisible && errors.length === 0) {
          console.log(`  ✅ ${pageInfo.name}: ${loadTime}ms`);
          qaResults.summary.passed++;
        } else {
          console.log(`  ❌ ${pageInfo.name}: Load ${loadTime}ms, Content: ${isVisible}, Errors: ${errors.length}`);
          if (!isVisible) qaResults.issues.push(`${pageInfo.name}: Expected content not found`);
          if (errors.length > 0) {
            qaResults.consoleErrors.push(...errors);
            qaResults.issues.push(`${pageInfo.name}: ${errors.length} console errors`);
          }
          qaResults.summary.failed++;
        }
        qaResults.summary.total++;
      } catch (err) {
        console.log(`  ❌ ${pageInfo.name}: ${err.message}`);
        qaResults.issues.push(`${pageInfo.name}: Navigation error - ${err.message}`);
        qaResults.summary.failed++;
        qaResults.summary.total++;
      } finally {
        await page.close();
      }
    }

    // Test 3: Interactive Elements
    console.log('\n🖱️  Testing Interactive Elements...');
    const page = await browser.newPage({ viewport: VIEWPORTS[1] });
    try {
      await page.goto(`${BASE_URL}/mobile/parent-center/index`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      const buttons = await page.locator('button, [role="button"]').count();
      const links = await page.locator('a[href]').count();
      const inputs = await page.locator('input, textarea, select').count();

      console.log(`  ✅ Buttons: ${buttons}, Links: ${links}, Inputs: ${inputs}`);
      qaResults.summary.passed++;
      qaResults.summary.total++;
    } catch (err) {
      console.log(`  ❌ Interactive elements test failed: ${err.message}`);
      qaResults.summary.failed++;
      qaResults.summary.total++;
    } finally {
      await page.close();
    }

    // Test 4: Performance
    console.log('\n⚡ Testing Performance...');
    const perfPage = await browser.newPage({ viewport: VIEWPORTS[1] });
    try {
      const start = Date.now();
      await perfPage.goto(`${BASE_URL}/mobile/parent-center/index`, { waitUntil: 'networkidle', timeout: 15000 });
      const loadTime = Date.now() - start;

      const status = loadTime < 5000 ? '✅' : '⚠️';
      console.log(`  ${status} Initial Load: ${loadTime}ms`);

      if (loadTime >= 5000) {
        qaResults.issues.push(`Performance: Initial load ${loadTime}ms exceeds 5000ms threshold`);
        qaResults.summary.warnings++;
      }
    } catch (err) {
      console.log(`  ❌ Performance test failed: ${err.message}`);
      qaResults.issues.push(`Performance test error: ${err.message}`);
    } finally {
      await perfPage.close();
    }

  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 QA TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${qaResults.summary.total}`);
  console.log(`✅ Passed: ${qaResults.summary.passed}`);
  console.log(`❌ Failed: ${qaResults.summary.failed}`);
  console.log(`⚠️  Warnings: ${qaResults.summary.warnings}`);
  console.log(`🐛 Issues: ${qaResults.issues.length}`);

  if (qaResults.issues.length > 0) {
    console.log('\n🔍 Issues:');
    qaResults.issues.slice(0, 10).forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
    if (qaResults.issues.length > 10) {
      console.log(`  ... and ${qaResults.issues.length - 10} more`);
    }
  }

  console.log(`\n📸 Screenshots: ${SCREENSHOT_DIR}`);
  console.log(`📄 Report: ${REPORT_FILE}\n`);

  fs.writeFileSync(REPORT_FILE, JSON.stringify(qaResults, null, 2));

  return qaResults;
}

runQATests()
  .then(results => {
    process.exit(results.summary.failed > 0 ? 1 : 0);
  })
  .catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
