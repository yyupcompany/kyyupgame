#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  // --bg-secondary files (85 files)
  'k.yyup.com/client/src/pages/centers/DocumentCenter.vue',
  'k.yyup.com/client/src/pages/mobile/parent-center/index.vue',
  'k.yyup.com/client/src/pages/centers/CustomerPoolCenter.vue',
  'k.yyup.com/client/src/pages/mobile/parent-center/share-stats/index.vue',
  'k.yyup.com/client/src/pages/mobile/quick-actions/index.vue',
  'k.yyup.com/client/src/pages/centers/TaskCenter.vue',
  'k.yyup.com/client/src/pages/centers/SystemCenter.vue',
  'k.yyup.com/client/src/pages/centers/PersonnelCenter.vue',
  'k.yyup.com/client/src/pages/centers/InspectionCenter.vue',
  'k.yyup.com/client/src/pages/centers/BusinessCenter.vue',
  'k.yyup.com/client/src/pages/centers/AttendanceCenter.vue',
  'k.yyup.com/client/src/pages/parent-center/dashboard/index.vue',
  'k.yyup.com/client/src/pages/centers/MediaCenter.vue',
  'k.yyup.com/client/src/pages/centers/TeachingCenter.vue',
  'k.yyup.com/client/src/pages/teacher-center/creative-curriculum/interactive-curriculum.vue',
  'k.yyup.com/client/src/pages/teacher-center/creative-curriculum/components/ScheduleBuilder.vue',
  'k.yyup.com/client/src/pages/mobile/centers/new-media-center/components/MobileArticleCreator.vue',
  'k.yyup.com/client/src/pages/mobile/centers/new-media-center/components/MobileCopywritingCreator.vue',
  'k.yyup.com/client/src/pages/centers/AICenter.vue',
  'k.yyup.com/client/src/pages/activity/ActivityCreate.vue',
  'k.yyup.com/client/src/pages/mobile/parent-center/photo-album/index.vue',
  'k.yyup.com/client/src/pages/Notifications.vue',
  'k.yyup.com/client/src/pages/centers/EnrollmentCenter.vue',
  'k.yyup.com/client/src/pages/system/roles/index.vue',
  'k.yyup.com/client/src/pages/system/permissions/index.vue',
  'k.yyup.com/client/src/pages/dashboard/CampusOverview.vue',
  'k.yyup.com/client/src/pages/dashboard/Performance.vue',
  'k.yyup.com/client/src/pages/dashboard/Schedule.vue',
  'k.yyup.com/client/src/pages/dashboard/Analytics.vue',
  'k.yyup.com/client/src/pages/dashboard/ClassCreate.vue',
  'k.yyup.com/client/src/pages/dashboard/ImportantNotices.vue',
  'k.yyup.com/client/src/pages/dashboard/index.vue',
  'k.yyup.com/client/src/pages/activity/ActivityList.vue',
  'k.yyup.com/client/src/pages/activity/detail/_id.vue',
  'k.yyup.com/client/src/pages/activity/ActivityForm.vue',
  'k.yyup.com/client/src/pages/activity/RegistrationPageGenerator.vue',
  'k.yyup.com/client/src/pages/activity/ActivityTimeline.vue',
  'k.yyup.com/client/src/pages/activity/ActivityPosterPreview.vue',
  'k.yyup.com/client/src/pages/activity/ActivityDetail.vue',
  'k.yyup.com/client/src/pages/principal/Performance.vue',
  'k.yyup.com/client/src/pages/principal/decision-support/intelligent-dashboard.vue',
  'k.yyup.com/client/src/pages/principal/PosterTemplates.vue',
  'k.yyup.com/client/src/pages/principal/Dashboard.vue',
  'k.yyup.com/client/src/pages/principal/PosterGenerator.vue',
  'k.yyup.com/client/src/pages/PerformanceTest.vue',
  'k.yyup.com/client/src/pages/customer/edit/[id].vue',
  'k.yyup.com/client/src/pages/customer/create/index.vue',
  'k.yyup.com/client/src/pages/parent-center/games/play/PrincessGarden.vue',
  'k.yyup.com/client/src/pages/parent-center/games/play/PrincessMemory.vue',
  'k.yyup.com/client/src/pages/parent-center/games/play/SpaceTreasure.vue',
  'k.yyup.com/client/src/pages/parent-center/assessment/components/GameComponent.vue',
  'k.yyup.com/client/src/pages/parent-center/assessment/games/AttentionGame.vue',
  'k.yyup.com/client/src/pages/application/ApplicationDetail.vue',
  'k.yyup.com/client/src/pages/application/ApplicationList.vue',
  'k.yyup.com/client/src/pages/demo/SmartExpertDemo.vue',
  'k.yyup.com/client/src/pages/demo/index.vue',
  'k.yyup.com/client/src/pages/test/SimpleFormModalTest.vue',
  'k.yyup.com/client/src/pages/teacher/TeacherList.vue',
  'k.yyup.com/client/src/pages/group/group-list.vue',
  'k.yyup.com/client/src/pages/student/growth/StudentGrowth.vue',
  'k.yyup.com/client/src/pages/student/detail/StudentDetail.vue',
  'k.yyup.com/client/src/pages/student/analytics/StudentAnalytics.vue',
  'k.yyup.com/client/src/pages/student/assessment/StudentAssessment.vue',
  'k.yyup.com/client/src/pages/test-poster-preview.vue',
  'k.yyup.com/client/src/pages/ai/predictive/maintenance-optimizer.vue',
  'k.yyup.com/client/src/pages/ai/ExpertConsultationPage.vue',
  'k.yyup.com/client/src/pages/ai/DocumentImportPage.vue',
  'k.yyup.com/client/src/pages/centers/components/InspectionRecordPrintTemplate.vue',
  'k.yyup.com/client/src/pages/centers/components/InspectionRectificationPrintTemplate.vue',
  'k.yyup.com/client/src/pages/centers/components/InspectionReportPrintTemplate.vue',
  'k.yyup.com/client/src/pages/centers/components/PrintPreviewDialog.vue',
  'k.yyup.com/client/src/pages/centers/components/ClassDetailDialog.vue',
  'k.yyup.com/client/src/pages/centers/duplicates-backup/SystemCenter-Enhanced.vue',
  'k.yyup.com/client/src/pages/centers/duplicates-backup/MarketingCenter-Original.vue',
  'k.yyup.com/client/src/pages/centers/duplicates-backup/AnalyticsCenter-Enhanced.vue',
  'k.yyup.com/client/src/pages/centers/AIBillingCenter.vue',
  'k.yyup.com/client/src/pages/class/smart-management/SmartManagement.vue',
  'k.yyup.com/client/src/pages/class/optimization/ClassOptimization.vue',
  'k.yyup.com/client/src/pages/class/detail/ClassDetail.vue',
  'k.yyup.com/client/src/pages/class/analytics/ClassAnalytics.vue',
  'k.yyup.com/client/src/pages/Register.vue',
  'k.yyup.com/client/src/pages/usage-center/index.vue',
  'k.yyup.com/client/src/pages/teacher-center/dashboard/components/QuickActionsPanel.vue',
  'k.yyup.com/client/src/pages/teacher-center/teaching/components/ClassManagement.vue',
  'k.yyup.com/client/src/pages/teacher-center/teaching/components/TeachingProgress.vue',

  // --bg-primary[^-] files (71 files)
  'k.yyup.com/client/src/pages/training-center/records.vue',
  'k.yyup.com/client/src/pages/mobile/login/index.vue',
  'k.yyup.com/client/src/pages/mobile/more/index.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/appointment-management/index.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/performance-rewards/index.vue',
  'k.yyup.com/client/src/pages/teacher-center/creative-curriculum/index.vue',
  'k.yyup.com/client/src/pages/parent-center/assessment/Report.vue',
  'k.yyup.com/client/src/pages/mobile/centers/attendance-center/index.vue',
  'k.yyup.com/client/src/pages/mobile/centers/notification-center/index.vue',
  'k.yyup.com/client/src/pages/mobile/centers/schedule-center/index.vue',
  'k.yyup.com/client/src/pages/mobile/centers/photo-album-center/index.vue',
  'k.yyup.com/client/src/pages/mobile/centers/permission-center/index.vue',
  'k.yyup.com/client/src/pages/mobile/centers/new-media-center/index.vue',
  'k.yyup.com/client/src/pages/mobile/centers/my-task-center/index.vue',
  'k.yyup.com/client/src/pages/mobile/centers/group-center/index.vue',
  'k.yyup.com/client/src/pages/mobile/centers/new-media-center/components/MobileTextToSpeech.vue',
  'k.yyup.com/client/src/pages/mobile/centers/principal-center/index.vue',
  'k.yyup.com/client/src/pages/mobile/centers/settings-center/index.vue',
  'k.yyup.com/client/src/pages/mobile/centers/new-media-center/components/MobileVideoCreator.vue',
  'k.yyup.com/client/src/pages/mobile/centers/CentersContent.vue',
  'k.yyup.com/client/src/pages/mobile/centers/business-hub/index.vue',
  'k.yyup.com/client/src/pages/mobile/centers/analytics-hub/index.vue',
  'k.yyup.com/client/src/pages/mobile/centers/system-log-center/index.vue',
  'k.yyup.com/client/src/pages/mobile-demo/index.vue',
  'k.yyup.com/client/src/pages/mobile/parent-center/communication/index.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/index.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/dashboard/index.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/creative-curriculum/index.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/class-contacts/index.vue',
  'k.yyup.com/client/src/pages/centers/marketing/components/PersonalContributionTab.vue',
  'k.yyup.com/client/src/pages/centers/marketing/components/TeamRankingTab.vue',
  'k.yyup.com/client/src/pages/mobile/components/dashboard/ParentDashboard.vue',
  'k.yyup.com/client/src/pages/mobile/components/dashboard/TeacherDashboard.vue',
  'k.yyup.com/client/src/pages/mobile/components/dashboard/PrincipalDashboard.vue',
  'k.yyup.com/client/src/pages/mobile/dashboard/index.vue',
  'k.yyup.com/client/src/pages/mobile/components/common/MobileForm.vue',
  'k.yyup.com/client/src/pages/mobile/layouts/MobileLayout.vue',
  'k.yyup.com/client/src/pages/mobile/layouts/RoleBasedMobileLayout.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/creative-curriculum/components/CodeEditor.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/customer-tracking/components/ConversationTimeline.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/customer-tracking/components/ConversionFunnel.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/customer-tracking/components/CreateCustomerDialog.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/customer-tracking/components/CustomerCard.vue',
  'k.yyup.com/client/src/pages/mobile/teacher-center/customer-tracking/components/AISuggestionPanel.vue',
  'k.yyup.com/client/src/pages/principal/media-center/VideoCreatorTimeline.vue',
  'k.yyup.com/client/src/pages/About.vue',
  'k.yyup.com/client/src/pages/parent-center/games/play/DinosaurMemory.vue',
  'k.yyup.com/client/src/pages/parent-center/games/play/RobotFactory.vue',
  'k.yyup.com/client/src/pages/enrollment/EnrollmentDetail.vue',
  'k.yyup.com/client/src/pages/training-center/activities.vue',
  'k.yyup.com/client/src/pages/training-center/plans.vue',
  'k.yyup.com/client/src/pages/training-center/achievements.vue',
  'k.yyup.com/client/src/pages/training-center/index.vue',
  'k.yyup.com/client/src/pages/student/index.vue',
  'k.yyup.com/client/src/pages/ai/monitoring/AIPerformanceMonitor.vue',
  'k.yyup.com/client/src/pages/centers/components/InspectionTimelineEditor.vue',
  'k.yyup.com/client/src/pages/centers/duplicates-backup/SystemCenter-Original.vue',
  'k.yyup.com/client/src/pages/centers/duplicates-backup/AnalyticsCenter-Original.vue',
  'k.yyup.com/client/src/pages/centers/duplicates-backup/FinanceCenter-Original.vue',
  'k.yyup.com/client/src/pages/centers/marketing/components/ReferralRewardsTab.vue',
  'k.yyup.com/client/src/pages/centers/marketing/performance.vue',
  'k.yyup.com/client/src/pages/teacher-center/creative-curriculum/components/AICurriculumAssistant.vue',

  // --bg-color files (18 files)
  'k.yyup.com/client/src/pages/centers/ActivityCenter.vue',
  'k.yyup.com/client/src/pages/parent-center/games/play/SpaceTreasure.vue',
  'k.yyup.com/client/src/pages/parent-center/games/play/RobotFactory.vue',
  'k.yyup.com/client/src/pages/centers/duplicates-backup/SystemCenter-Original.vue',
  'k.yyup.com/client/src/pages/centers/duplicates-backup/MarketingCenter-Original.vue',
  'k.yyup.com/client/src/pages/centers/marketing/performance.vue',
  'k.yyup.com/client/src/pages/teacher-center/creative-curriculum/components/VideoPlayer.vue',
  'k.yyup.com/client/src/pages/teacher-center/creative-curriculum/components/ImageCarousel.vue',
  'k.yyup.com/client/src/pages/teacher-center/creative-curriculum/components/ProgressPanel.vue',
];

const basePath = '/persistent/home/zhgue/kyyupgame/';

// 修复规则
const replacements = [
  {
    from: /var\(--bg-secondary\)/g,
    to: 'var(--bg-page)',
    description: '--bg-secondary -> --bg-page'
  },
  {
    from: /var\(--bg-primary\)(?![a-z-])/g,
    to: 'var(--bg-page)',
    description: '--bg-primary -> --bg-page'
  },
  {
    from: /var\(--bg-color\)/g,
    to: 'var(--bg-card)',
    description: '--bg-color -> --bg-card'
  }
];

let fixedCount = 0;
let errorCount = 0;
const errors = [];

// 处理每个文件
filesToFix.forEach((relativePath, index) => {
  const fullPath = path.join(basePath, relativePath);

  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${relativePath}`);
      errorCount++;
      errors.push({ file: relativePath, error: 'File not found' });
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // 应用所有替换规则
    replacements.forEach(rule => {
      const newContent = content.replace(rule.from, rule.to);
      if (newContent !== content) {
        modified = true;
        content = newContent;
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      fixedCount++;
      console.log(`✅ [${index + 1}/${filesToFix.length}] Fixed: ${relativePath}`);
    }
  } catch (error) {
    errorCount++;
    errors.push({ file: relativePath, error: error.message });
    console.error(`❌ Error fixing ${relativePath}:`, error.message);
  }
});

// 输出总结
console.log('\n' + '='.repeat(60));
console.log('批量修复完成');
console.log('='.repeat(60));
console.log(`总文件数: ${filesToFix.length}`);
console.log(`成功修复: ${fixedCount}`);
console.log(`错误数量: ${errorCount}`);

if (errors.length > 0) {
  console.log('\n错误详情:');
  errors.forEach(({ file, error }) => {
    console.log(`  - ${file}: ${error}`);
  });
}

console.log('\n修复规则:');
replacements.forEach(rule => {
  console.log(`  - ${rule.description}`);
});
