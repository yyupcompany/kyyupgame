#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const replacements = [
  // document-center
  { file: 'client/src/pages/mobile/centers/document-center/index.vue', old: "'/documents'", new: "'/document-instance'" },
  // inspection-center
  { file: 'client/src/pages/mobile/centers/inspection-center/index.vue', old: "'/inspection-center/tasks'", new: "'/inspection-record'" },
  // permission-center  
  { file: 'client/src/pages/mobile/centers/permission-center/index.vue', old: "'/permissions/roles'", new: "'/roles'" },
  // parent-center/feedback
  { file: 'client/src/pages/mobile/parent-center/feedback/index.vue', old: "'/feedback/my-records'", new: "'/assessment'" },
  // parent-center/promotion-center (3 occurrences)
  { file: 'client/src/pages/mobile/parent-center/promotion-center/index.vue', old: "'/parent/promotion/stats'", new: "'/referral-statistics'" },
  { file: 'client/src/pages/mobile/parent-center/promotion-center/index.vue', old: "'/parent/promotion/activities'", new: "'/smart-promotion'" },
  { file: 'client/src/pages/mobile/parent-center/promotion-center/index.vue', old: "'/parent/promotion/rewards'", new: "'/referral-rewards'" },
  // parent-center/share-stats (2 occurrences)
  { file: 'client/src/pages/mobile/parent-center/share-stats/index.vue', old: "'/parent/share/overview'", new: "'/assessment-share'" },
  { file: 'client/src/pages/mobile/parent-center/share-stats/index.vue', old: "'/parent/share/records'", new: "'/assessment-share'" },
  // teacher-center/appointment-management
  { file: 'client/src/pages/mobile/teacher-center/appointment-management/index.vue', old: "'/teacher/appointments'", new: "'/enrollment-interviews'" },
  // teacher-center/class-contacts
  { file: 'client/src/pages/mobile/teacher-center/class-contacts/index.vue', old: "'/teacher/classes'", new: "'/classes'" },
  // teacher-center/performance-rewards
  { file: 'client/src/pages/mobile/teacher-center/performance-rewards/index.vue', old: "'/teacher/performance/stats'", new: "'/principal-performance'" },
  // teacher-center/teaching
  { file: 'client/src/pages/mobile/teacher-center/teaching/index.vue', old: "'/teacher/schedule/weekly'", new: "'/schedules'" }
];

console.log('🔧 修复剩余的API调用...\n');

let fixCount = 0;

for (const { file, old, new: newVal } of replacements) {
  try {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${file}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes(old)) {
      content = content.replaceAll(old, newVal);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ ${file}`);
      console.log(`   ${old} -> ${newVal}`);
      fixCount++;
    } else {
      console.log(`⚠️  ${file} - 未找到 ${old}`);
    }
  } catch (error) {
    console.error(`❌ ${file} - 错误: ${error.message}`);
  }
}

console.log(`\n✅ 共修复 ${fixCount} 个文件`);

