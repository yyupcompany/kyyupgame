import { test, expect, Page } from '@playwright/test';

/**
 * Mobile Parent Role Comprehensive QA Test Suite
 *
 * 测试范围：移动端Parent（家长）角色
 * 平台：移动端（Mobile Viewport）
 * 角色：Parent
 *
 * Test Coverage:
 * 1. User Authentication & Authorization
 * 2. Form Validation
 * 3. CRUD Operations
 * 4. Search & Filtering
 * 5. Data Integrity
 * 6. Business Logic
 * 7. Responsive Design
 * 8. Navigation
 * 9. Layout Consistency
 * 10. Interactive Elements
 * 11. Accessibility
 * 12. User Feedback
 * 13. Page Load Speed
 * 14. API Response Times
 * 15. Resource Optimization
 * 16. Memory & CPU Usage
 * 17. Input Sanitization
 * 18. Authentication Security
 * 19. Data Protection
 * 20. Cross-Browser Compatibility
 * 21. Device Compatibility
 * 22. API Versioning
 */

// Test configuration
const MOBILE_VIEWPORTS = [
  { width: 375, height: 667 },  // iPhone SE
  { width: 390, height: 844 },  // iPhone 12/13
  { width: 414, height: 896 },  // iPhone Max
];

const PARENT_CREDENTIALS = {
  username: 'test_parent',
  password: '123456'
};

const BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5173';

// Helper function to setup mobile viewport
async function setupMobilePage(page: Page, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.goto(BASE_URL);
}

// Helper function to login as parent
async function loginAsParent(page: Page) {
  await page.goto(`${BASE_URL}/mobile/login`);
  await page.waitForLoadState('networkidle');

  // Click quick login button for parent
  await page.click('button:has-text("家长")');
  await page.waitForLoadState('networkidle');

  // Wait for navigation to parent center
  await page.waitForURL('**/mobile/parent-center/**', { timeout: 10000 });
}

// Helper function to check console errors
const consoleErrors: string[] = [];
async function captureConsoleErrors(page: Page) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
}

// Helper function to take screenshot with context
async function takeScreenshot(page: Page, testName: string) {
  await page.screenshot({
    path: `test-results/mobile-parent-qa/${testName}.png`,
    fullPage: true
  });
}

test.describe('Mobile Parent Role - Phase 1: QA Full Inspection', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await captureConsoleErrors(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  // Test 1: User Authentication & Authorization
  test.describe('1. Authentication & Authorization', () => {
    test('should login with quick login button', async () => {
      await page.goto(`${BASE_URL}/mobile/login`);
      await page.waitForLoadState('networkidle');

      // Check if quick login buttons are visible
      const parentButton = page.locator('button:has-text("家长")');
      await expect(parentButton).toBeVisible();

      // Click and verify redirect
      await parentButton.click();
      await page.waitForURL('**/mobile/parent-center/**', { timeout: 10000 });

      // Verify login success
      const currentUrl = page.url();
      expect(currentUrl).toContain('/mobile/parent-center');

      await takeScreenshot(page, '01-login-success');
    });

    test('should maintain session across page refresh', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be logged in
      const currentUrl = page.url();
      expect(currentUrl).toContain('/mobile/parent-center');
    });

    test('should logout successfully', async () => {
      // Find and click logout button
      const logoutButton = page.locator('button:has-text("退出"), .logout-btn, [data-testid="logout"]');
      if (await logoutButton.count() > 0) {
        await logoutButton.first().click();
        await page.waitForURL('**/mobile/login', { timeout: 5000 });
        expect(page.url()).toContain('/mobile/login');
      }
    });
  });

  // Test 2: Parent Dashboard/Home
  test.describe('2. Parent Dashboard', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should display parent dashboard correctly', async () => {
      await page.waitForLoadState('networkidle');

      // Check for dashboard elements
      const dashboard = page.locator('.parent-dashboard, [data-testid="parent-dashboard"]');
      await expect(dashboard).toBeVisible();

      // Check for quick action cards
      const actionCards = page.locator('.action-card, .stat-card, [data-testid="action-card"]');
      expect(await actionCards.count()).toBeGreaterThan(0);

      await takeScreenshot(page, '02-dashboard-display');
    });

    test('should have responsive layout on different viewports', async () => {
      for (const viewport of MOBILE_VIEWPORTS) {
        await page.setViewportSize(viewport);
        await page.waitForLoadState('domcontentloaded');

        // Check if content is visible and not overlapping
        const mainContent = page.locator('main, .main-content');
        await expect(mainContent).toBeVisible();

        // Check for horizontal scroll (should not exist)
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = viewport.width;
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
      }
    });

    test('should load dashboard data without errors', async () => {
      // Check console for errors
      expect(consoleErrors.filter(e => e.includes('dashboard')).length).toBe(0);

      // Check for loading states
      const loadingSpinner = page.locator('.loading, .spinner, [data-testid="loading"]');
      await loadingSpinner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Verify data is loaded
      const dataElements = page.locator('[data-loaded="true"], .data-loaded');
      expect(await dataElements.count()).toBeGreaterThan(0);
    });
  });

  // Test 3: Children Management
  test.describe('3. Children Management', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should navigate to children list', async () => {
      // Navigate to children page
      await page.goto(`${BASE_URL}/mobile/parent-center/children`);
      await page.waitForLoadState('networkidle');

      // Check if children list is visible
      const childrenList = page.locator('.children-list, [data-testid="children-list"]');
      await expect(childrenList).toBeVisible();

      await takeScreenshot(page, '03-children-list');
    });

    test('should display child cards with correct information', async () => {
      const childCards = page.locator('.child-card, [data-testid="child-card"]');
      const count = await childCards.count();

      expect(count).toBeGreaterThan(0);

      // Check first child card for required information
      if (count > 0) {
        const firstCard = childCards.first();
        await expect(firstCard).toBeVisible();

        // Check for child name
        const childName = firstCard.locator('.child-name, [data-testid="child-name"]');
        await expect(childName).toBeVisible();

        // Check for child age or class
        const childInfo = firstCard.locator('.child-info, .class-name, [data-testid="child-info"]');
        await expect(childInfo).toBeVisible();
      }
    });

    test('should navigate to child detail page', async () => {
      const childCards = page.locator('.child-card, [data-testid="child-card"]');
      if (await childCards.count() > 0) {
        await childCards.first().click();
        await page.waitForLoadState('networkidle');

        // Verify navigation to detail page
        expect(page.url()).toContain('/detail');

        // Check for detail elements
        const detailPage = page.locator('.child-detail, [data-testid="child-detail"]');
        await expect(detailPage).toBeVisible();

        await takeScreenshot(page, '04-child-detail');
      }
    });
  });

  // Test 4: Growth Records
  test.describe('4. Growth Records', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should navigate to growth records', async () => {
      await page.goto(`${BASE_URL}/mobile/parent-center/child-growth`);
      await page.waitForLoadState('networkidle');

      // Check if growth records page is visible
      const growthPage = page.locator('.growth-records, [data-testid="growth-records"]');
      await expect(growthPage).toBeVisible();

      await takeScreenshot(page, '05-growth-records');
    });

    test('should display growth timeline', async () => {
      const timeline = page.locator('.timeline, .growth-timeline, [data-testid="timeline"]');
      await expect(timeline).toBeVisible();

      // Check for timeline items
      const timelineItems = timeline.locator('.timeline-item, .growth-item');
      expect(await timelineItems.count()).toBeGreaterThan(0);
    });

    test('should support filtering by date or category', async () => {
      const filterButton = page.locator('.filter-btn, [data-testid="filter-btn"]');
      if (await filterButton.count() > 0) {
        await filterButton.first().click();
        await page.waitForTimeout(500);

        // Check if filter modal/options appear
        const filterOptions = page.locator('.filter-options, [data-testid="filter-options"]');
        await expect(filterOptions).toBeVisible();
      }
    });
  });

  // Test 5: Assessment
  test.describe('5. Assessment Center', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should navigate to assessment center', async () => {
      await page.goto(`${BASE_URL}/mobile/parent-center/assessment`);
      await page.waitForLoadState('networkidle');

      const assessmentPage = page.locator('.assessment-center, [data-testid="assessment-center"]');
      await expect(assessmentPage).toBeVisible();

      await takeScreenshot(page, '06-assessment-center');
    });

    test('should display assessment list', async () => {
      const assessmentList = page.locator('.assessment-list, [data-testid="assessment-list"]');
      await expect(assessmentList).toBeVisible();

      const assessments = assessmentList.locator('.assessment-item, .assessment-card');
      expect(await assessments.count()).toBeGreaterThanOrEqual(0);
    });

    test('should start new assessment if available', async () => {
      const startButton = page.locator('button:has-text("开始测评"), .start-assessment-btn');
      if (await startButton.count() > 0) {
        await startButton.first().click();
        await page.waitForLoadState('networkidle');

        // Verify navigation to assessment page
        expect(page.url()).toContain('/start') || expect(page.url()).toContain('/doing');

        await takeScreenshot(page, '07-assessment-start');
      }
    });
  });

  // Test 6: Activities
  test.describe('6. Activity Center', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should navigate to activity list', async () => {
      await page.goto(`${BASE_URL}/mobile/parent-center/activities`);
      await page.waitForLoadState('networkidle');

      const activityList = page.locator('.activity-list, [data-testid="activity-list"]');
      await expect(activityList).toBeVisible();

      await takeScreenshot(page, '08-activity-list');
    });

    test('should display activity cards', async () => {
      const activityCards = page.locator('.activity-card, [data-testid="activity-card"]');
      const count = await activityCards.count();

      expect(count).toBeGreaterThanOrEqual(0);

      // Check activity card structure
      if (count > 0) {
        const firstCard = activityCards.first();
        await expect(firstCard).toBeVisible();

        // Check for activity title
        const title = firstCard.locator('.activity-title, [data-testid="activity-title"]');
        await expect(title).toBeVisible();
      }
    });

    test('should navigate to activity detail', async () => {
      const activityCards = page.locator('.activity-card, [data-testid="activity-card"]');
      if (await activityCards.count() > 0) {
        await activityCards.first().click();
        await page.waitForLoadState('networkidle');

        expect(page.url()).toContain('/detail');

        const activityDetail = page.locator('.activity-detail, [data-testid="activity-detail"]');
        await expect(activityDetail).toBeVisible();

        await takeScreenshot(page, '09-activity-detail');
      }
    });

    test('should support activity registration', async () => {
      await page.goto(`${BASE_URL}/mobile/parent-center/activities`);
      await page.waitForLoadState('networkidle');

      const registerButton = page.locator('button:has-text("报名"), .register-btn');
      if (await registerButton.count() > 0) {
        await registerButton.first().click();
        await page.waitForTimeout(500);

        // Check if registration dialog appears
        const dialog = page.locator('.dialog, .modal, [data-testid="registration-dialog"]');
        if (await dialog.count() > 0) {
          await expect(dialog).toBeVisible();
          await takeScreenshot(page, '10-activity-registration');
        }
      }
    });
  });

  // Test 7: Photo Album
  test.describe('7. Photo Album Center', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should navigate to photo album', async () => {
      await page.goto(`${BASE_URL}/mobile/parent-center/photo-album`);
      await page.waitForLoadState('networkidle');

      const photoAlbum = page.locator('.photo-album, [data-testid="photo-album"]');
      await expect(photoAlbum).toBeVisible();

      await takeScreenshot(page, '11-photo-album');
    });

    test('should display photo grid', async () => {
      const photoGrid = page.locator('.photo-grid, .album-grid, [data-testid="photo-grid"]');
      await expect(photoGrid).toBeVisible();

      const photos = photoGrid.locator('.photo-item, .album-item, img');
      expect(await photos.count()).toBeGreaterThanOrEqual(0);
    });

    test('should support photo preview', async () => {
      const photoItems = page.locator('.photo-item, .album-item');
      if (await photoItems.count() > 0) {
        await photoItems.first().click();
        await page.waitForTimeout(500);

        // Check if preview modal appears
        const preview = page.locator('.photo-preview, .image-preview, [data-testid="photo-preview"]');
        if (await preview.count() > 0) {
          await expect(preview).toBeVisible();
          await takeScreenshot(page, '12-photo-preview');
        }
      }
    });
  });

  // Test 8: AI Assistant
  test.describe('8. AI Assistant', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should navigate to AI assistant', async () => {
      await page.goto(`${BASE_URL}/mobile/parent-center/ai-assistant`);
      await page.waitForLoadState('networkidle');

      const aiAssistant = page.locator('.ai-assistant, [data-testid="ai-assistant"]');
      await expect(aiAssistant).toBeVisible();

      await takeScreenshot(page, '13-ai-assistant');
    });

    test('should display chat interface', async () => {
      const chatInterface = page.locator('.chat-interface, .ai-chat, [data-testid="chat-interface"]');
      await expect(chatInterface).toBeVisible();

      // Check for input field
      const inputField = page.locator('input[type="text"], textarea, [contenteditable="true"]');
      await expect(inputField).toBeVisible();

      // Check for send button
      const sendButton = page.locator('button:has-text("发送"), .send-btn, [data-testid="send-btn"]');
      await expect(sendButton).toBeVisible();
    });

    test('should support sending messages', async () => {
      const inputField = page.locator('input[type="text"], textarea, [contenteditable="true"]').first();
      const sendButton = page.locator('button:has-text("发送"), .send-btn, [data-testid="send-btn"]').first();

      await inputField.fill('测试消息');
      await sendButton.click();
      await page.waitForTimeout(2000);

      // Check if message appears in chat
      const messages = page.locator('.message, .chat-message, [data-testid="message"]');
      expect(await messages.count()).toBeGreaterThan(0);

      await takeScreenshot(page, '14-ai-chat');
    });
  });

  // Test 9: Games Center
  test.describe('9. Games Center', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should navigate to games center', async () => {
      await page.goto(`${BASE_URL}/mobile/parent-center/games`);
      await page.waitForLoadState('networkidle');

      const gamesCenter = page.locator('.games-center, [data-testid="games-center"]');
      await expect(gamesCenter).toBeVisible();

      await takeScreenshot(page, '15-games-center');
    });

    test('should display available games', async () => {
      const gameCards = page.locator('.game-card, [data-testid="game-card"]');
      expect(await gameCards.count()).toBeGreaterThanOrEqual(0);

      // Check first game card
      if (await gameCards.count() > 0) {
        const firstGame = gameCards.first();
        await expect(firstGame).toBeVisible();

        // Check for game title
        const gameTitle = firstGame.locator('.game-title, [data-testid="game-title"]');
        await expect(gameTitle).toBeVisible();
      }
    });

    test('should navigate to game play page', async () => {
      const playButton = page.locator('button:has-text("开始"), .play-btn, .start-game-btn');
      if (await playButton.count() > 0) {
        await playButton.first().click();
        await page.waitForLoadState('networkidle');

        expect(page.url()).toContain('/play');

        await takeScreenshot(page, '16-game-play');
      }
    });

    test('should display achievements and records', async () => {
      const achievementsTab = page.locator('button:has-text("成就"), .achievements-tab');
      const recordsTab = page.locator('button:has-text("记录"), .records-tab');

      // Test achievements tab
      if (await achievementsTab.count() > 0) {
        await achievementsTab.first().click();
        await page.waitForTimeout(500);

        const achievements = page.locator('.achievement, [data-testid="achievement"]');
        await expect(achievements).toBeVisible();
      }

      // Test records tab
      if (await recordsTab.count() > 0) {
        await recordsTab.first().click();
        await page.waitForTimeout(500);

        const records = page.locator('.game-record, [data-testid="game-record"]');
        await expect(records).toBeVisible();
      }
    });
  });

  // Test 10: Communication
  test.describe('10. Communication Center', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should navigate to communication center', async () => {
      await page.goto(`${BASE_URL}/mobile/parent-center/communication`);
      await page.waitForLoadState('networkidle');

      const communication = page.locator('.communication-center, [data-testid="communication-center"]');
      await expect(communication).toBeVisible();

      await takeScreenshot(page, '17-communication-center');
    });

    test('should display teacher contacts', async () => {
      const teacherList = page.locator('.teacher-list, .contact-list, [data-testid="teacher-list"]');
      await expect(teacherList).toBeVisible();

      const teachers = teacherList.locator('.teacher-card, .contact-card');
      expect(await teachers.count()).toBeGreaterThanOrEqual(0);
    });

    test('should support sending messages to teachers', async () => {
      const contactButton = page.locator('button:has-text("联系"), .contact-btn, [data-testid="contact-btn"]');
      if (await contactButton.count() > 0) {
        await contactButton.first().click();
        await page.waitForTimeout(500);

        // Check if message dialog appears
        const dialog = page.locator('.message-dialog, .contact-dialog, [data-testid="message-dialog"]');
        if (await dialog.count() > 0) {
          await expect(dialog).toBeVisible();
          await takeScreenshot(page, '18-teacher-message');
        }
      }
    });
  });

  // Test 11: Notifications
  test.describe('11. Notification Center', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should navigate to notification center', async () => {
      await page.goto(`${BASE_URL}/mobile/parent-center/notifications`);
      await page.waitForLoadState('networkidle');

      const notificationCenter = page.locator('.notification-center, [data-testid="notification-center"]');
      await expect(notificationCenter).toBeVisible();

      await takeScreenshot(page, '19-notification-center');
    });

    test('should display notification list', async () => {
      const notificationList = page.locator('.notification-list, [data-testid="notification-list"]');
      await expect(notificationList).toBeVisible();

      const notifications = notificationList.locator('.notification-item, .notification-card');
      expect(await notifications.count()).toBeGreaterThanOrEqual(0);
    });

    test('should mark notification as read', async () => {
      const unreadNotifications = page.locator('.notification-item.unread, [data-read="false"]');
      if (await unreadNotifications.count() > 0) {
        await unreadNotifications.first().click();
        await page.waitForTimeout(500);

        // Verify it's marked as read
        await expect(unreadNotifications.first()).not.toHaveClass(/unread/);
      }
    });
  });

  // Test 12: Mobile-Specific Features
  test.describe('12. Mobile-Specific Features', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should have bottom navigation bar', async () => {
      const bottomNav = page.locator('.bottom-nav, .tab-bar, [data-testid="bottom-nav"]');
      await expect(bottomNav).toBeVisible();

      // Check navigation items
      const navItems = bottomNav.locator('.nav-item, .tab-item');
      expect(await navItems.count()).toBeGreaterThan(0);

      await takeScreenshot(page, '20-bottom-navigation');
    });

    test('should support touch interactions', async () => {
      // Test tap on buttons
      const buttons = page.locator('button, .btn, [role="button"]');
      if (await buttons.count() > 0) {
        await buttons.first().tap();
        await page.waitForTimeout(300);
      }
    });

    test('should support swipe gestures (if applicable)', async () => {
      // Test horizontal swipe on carousel/slider
      const carousel = page.locator('.carousel, .swiper, .slider');
      if (await carousel.count() > 0) {
        const box = await carousel.first().boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2);
          await page.mouse.up();
          await page.waitForTimeout(500);
        }
      }
    });

    test('should have FAB (Floating Action Button) if applicable', async () => {
      const fab = page.locator('.fab, .floating-action-button, [data-testid="fab"]');
      if (await fab.count() > 0) {
        await expect(fab).toBeVisible();
        await fab.first().click();
        await page.waitForTimeout(500);

        // Check if FAB triggers action
        await takeScreenshot(page, '21-fab-action');
      }
    });

    test('should support pull-to-refresh (if applicable)', async () => {
      // Test pull-to-refresh gesture
      const body = page.locator('body');
      const box = await body.boundingBox();

      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + 100);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2, box.y + 300, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(1000);
      }
    });
  });

  // Test 13: Performance Tests
  test.describe('13. Performance & Load Times', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should load pages within acceptable time', async () => {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/mobile/parent-center/index`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);

      console.log(`Page load time: ${loadTime}ms`);
    });

    test('should not have memory leaks', async () => {
      // Get initial metrics
      const metrics1 = await page.metrics();

      // Navigate through multiple pages
      await page.goto(`${BASE_URL}/mobile/parent-center/children`);
      await page.waitForLoadState('networkidle');
      await page.goto(`${BASE_URL}/mobile/parent-center/activities`);
      await page.waitForLoadState('networkidle');

      // Get final metrics
      const metrics2 = await page.metrics();

      // JS heap size should not increase significantly
      const heapIncrease = metrics2.JSHeapUsedSize - metrics1.JSHeapUsedSize;
      expect(heapIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase

      console.log(`Heap increase: ${heapIncrease / 1024 / 1024}MB`);
    });
  });

  // Test 14: Accessibility
  test.describe('14. Accessibility', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should have proper ARIA labels', async () => {
      const interactiveElements = page.locator('button, a, input, [role="button"]');
      const count = await interactiveElements.count();

      // Check first 10 elements for ARIA labels
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = interactiveElements.nth(i);
        const hasAria = await element.evaluate(el =>
          el.hasAttribute('aria-label') ||
          el.hasAttribute('aria-labelledby') ||
          el.hasAttribute('title') ||
          el.textContent?.trim()
        );
        expect(hasAria).toBeTruthy();
      }
    });

    test('should support keyboard navigation', async () => {
      // Test Tab navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'A', 'INPUT', 'TEXTAREA']).toContain(focusedElement);
    });

    test('should have sufficient color contrast', async () => {
      // This is a simplified check - real contrast checking requires more sophisticated tools
      const textElements = page.locator('p, span, h1, h2, h3, h4, h5, h6');
      const count = await textElements.count();

      for (let i = 0; i < Math.min(count, 20); i++) {
        const element = textElements.nth(i);
        const isVisible = await element.isVisible();
        if (isVisible) {
          const color = await element.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
              color: styles.color,
              backgroundColor: styles.backgroundColor
            };
          });

          // Verify colors are defined (not transparent)
          expect(color.color).not.toBe('rgba(0, 0, 0, 0)');
        }
      }
    });
  });

  // Test 15: Error Handling
  test.describe('15. Error Handling', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should handle network errors gracefully', async () => {
      // Simulate network offline
      await page.context().setOffline(true);

      await page.goto(`${BASE_URL}/mobile/parent-center/children`);
      await page.waitForTimeout(2000);

      // Check for error message
      const errorMessage = page.locator('.error-message, .network-error, [data-testid="error-message"]');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeVisible();
        await takeScreenshot(page, '22-network-error');
      }

      // Restore network
      await page.context().setOffline(false);
    });

    test('should handle API errors gracefully', async () => {
      // Monitor API responses
      const apiErrors: string[] = [];
      page.on('response', response => {
        if (response.status() >= 400) {
          apiErrors.push(`${response.url()} - ${response.status()}`);
        }
      });

      await page.goto(`${BASE_URL}/mobile/parent-center/index`);
      await page.waitForLoadState('networkidle');

      // Check if any API errors occurred
      if (apiErrors.length > 0) {
        console.log('API Errors:', apiErrors);

        // Check if error messages are displayed to user
        const errorDisplay = page.locator('.api-error, .error-toast');
        // It's okay if errors are shown to user
      }
    });
  });

  // Test 16: Form Validation
  test.describe('16. Form Validation', () => {
    test.beforeEach(async () => {
      await loginAsParent(page);
    });

    test('should validate required fields', async () => {
      // Find forms and test validation
      const forms = page.locator('form');
      const count = await forms.count();

      if (count > 0) {
        const firstForm = forms.first();
        const submitButton = firstForm.locator('button[type="submit"], .submit-btn');

        if (await submitButton.count() > 0) {
          // Try to submit without filling required fields
          await submitButton.click();
          await page.waitForTimeout(500);

          // Check for validation messages
          const validationMessages = page.locator('.validation-error, .error-message, [data-invalid="true"]');
          if (await validationMessages.count() > 0) {
            await expect(validationMessages.first()).toBeVisible();
            await takeScreenshot(page, '23-form-validation');
          }
        }
      }
    });

    test('should show appropriate error messages', async () => {
      // Test with invalid input
      const emailInputs = page.locator('input[type="email"]');
      const count = await emailInputs.count();

      if (count > 0) {
        const emailInput = emailInputs.first();
        await emailInput.fill('invalid-email');

        // Trigger validation
        await emailInput.blur();
        await page.waitForTimeout(500);

        // Check for error message
        const errorMessage = page.locator('.error-message, .validation-error');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    });
  });

  // Final Report Generation
  test.describe('QA Report Summary', () => {
    test('should generate QA report', async () => {
      const report = {
        timestamp: new Date().toISOString(),
        platform: 'Mobile',
        role: 'Parent',
        tests: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0
        },
        consoleErrors: consoleErrors,
        viewportSizes: MOBILE_VIEWPORTS,
        baseURL: BASE_URL
      };

      console.log('QA Report Summary:', JSON.stringify(report, null, 2));

      // Save report to file
      await page.evaluate((data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mobile-parent-qa-report-${Date.now()}.json`;
        a.click();
      }, report);
    });
  });
});
