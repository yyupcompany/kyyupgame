#!/usr/bin/env node

/**
 * 修复AI字典查询的脚本
 * 根据实际数据库结构修正查询中的字段名和值
 */

const fs = require('fs');
const path = require('path');

// AI字典文件路径
const dictionaryPath = path.join(__dirname, '../src/config/ai-dictionaries/05-query-templates.json');

// 字段映射修正
const fieldMappings = {
  // status字段值映射
  students: {
    'active': '1',      // 在读
    'inactive': '0',    // 离园
    'graduated': '2'    // 休学（暂时用作毕业状态）
  },
  teachers: {
    'active': '1',      // 在职
    'inactive': '0',    // 离职
    'on_leave': '2',    // 请假中
    'probation': '3'    // 见习期
  },
  classes: {
    'active': '1',      // 正常
    'inactive': '0',    // 禁用
    'graduated': '2'    // 已毕业
  },
  activities: {
    'draft': '0',       // 草稿
    'planned': '1',     // 未开始
    'ongoing': '3',     // 进行中
    'completed': '4',   // 已结束
    'cancelled': '5'    // 已取消
  },
  enrollment_applications: {
    '1': 'approved',    // 已批准
    '0': 'pending'      // 待审核
  }
};

// 需要修复的查询
const queryFixes = {
  "今天有多少学生在校": {
    "sql": "SELECT COUNT(*) as count FROM students WHERE status = 1 AND DATE(created_at) = CURDATE()"
  },
  "学生总数": {
    "sql": "SELECT COUNT(*) as count FROM students WHERE status = 1"
  },
  "学生总数？": {
    "sql": "SELECT COUNT(*) as count FROM students WHERE status = 1"
  },
  "男女学生比例": {
    "sql": "SELECT gender, COUNT(*) as count, COUNT(*) * 100.0 / (SELECT COUNT(*) FROM students WHERE status = 1) as percentage FROM students WHERE status = 1 GROUP BY gender"
  },
  "各班级学生人数分布": {
    "sql": "SELECT c.name as class_name, COUNT(s.id) as student_count FROM classes c LEFT JOIN students s ON c.id = s.class_id WHERE s.status = 1 AND c.status = 1 GROUP BY c.id, c.name ORDER BY student_count DESC"
  },
  "现在有几个班级": {
    "sql": "SELECT COUNT(*) as count FROM classes WHERE status = 1"
  },
  "现在有几个班级？": {
    "sql": "SELECT COUNT(*) as count FROM classes WHERE status = 1"
  },
  "班级总数": {
    "sql": "SELECT COUNT(*) as count FROM classes WHERE status = 1"
  },
  "有多少个班级": {
    "sql": "SELECT COUNT(*) as count FROM classes WHERE status = 1"
  },
  "教师总数": {
    "sql": "SELECT COUNT(*) as count FROM teachers WHERE status = 1"
  },
  "教师总数是多少？": {
    "sql": "SELECT COUNT(*) as count FROM teachers WHERE status = 1"
  },
  "哪些班级的出勤率最高": {
    "sql": "SELECT c.name as class_name, c.current_student_count, c.capacity, (c.current_student_count * 100.0 / c.capacity) as attendance_rate FROM classes c WHERE c.status = 1 AND c.capacity > 0 ORDER BY attendance_rate DESC LIMIT 10"
  },
  "班级容量利用率": {
    "sql": "SELECT name as class_name, current_student_count, capacity, (current_student_count * 100.0 / capacity) as utilization_rate FROM classes WHERE status = 1 AND capacity > 0 ORDER BY utilization_rate DESC"
  },
  "系统用户数量": {
    "sql": "SELECT COUNT(*) as count FROM users WHERE status = 'active'"
  },
  "招生统计": {
    "sql": "SELECT COUNT(*) as total_applications, COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count, COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count FROM enrollment_applications WHERE YEAR(created_at) = YEAR(NOW())"
  },
  "本月招生报告": {
    "sql": "SELECT COUNT(*) as applications, COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved, (COUNT(CASE WHEN status = 'approved' THEN 1 END) * 100.0 / COUNT(*)) as approval_rate FROM enrollment_applications WHERE YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())"
  },
  "幼儿园概况": {
    "sql": "SELECT (SELECT COUNT(*) FROM students WHERE status = 1) as student_count, (SELECT COUNT(*) FROM teachers WHERE status = 1) as teacher_count, (SELECT COUNT(*) FROM classes WHERE status = 1) as class_count, (SELECT COUNT(*) FROM activities WHERE status IN (1, 2, 3)) as activity_count"
  },
  "数据总览": {
    "sql": "SELECT 'students' as category, COUNT(*) as count FROM students WHERE status = 1 UNION ALL SELECT 'teachers' as category, COUNT(*) as count FROM teachers WHERE status = 1 UNION ALL SELECT 'classes' as category, COUNT(*) as count FROM classes WHERE status = 1 UNION ALL SELECT 'activities' as category, COUNT(*) as count FROM activities WHERE status IN (1, 2, 3)"
  }
};

function fixAIDictionary() {
  try {
    console.log('读取AI字典文件...');
    const content = fs.readFileSync(dictionaryPath, 'utf8');
    const dictionary = JSON.parse(content);
    
    console.log('修复查询...');
    let fixedCount = 0;
    
    for (const [queryName, fixes] of Object.entries(queryFixes)) {
      if (dictionary.queryTemplates[queryName]) {
        console.log(`修复查询: ${queryName}`);
        
        // 更新SQL查询
        if (fixes.sql) {
          dictionary.queryTemplates[queryName].sql = fixes.sql;
        }
        
        // 更新其他字段
        for (const [key, value] of Object.entries(fixes)) {
          if (key !== 'sql') {
            dictionary.queryTemplates[queryName][key] = value;
          }
        }
        
        fixedCount++;
      } else {
        console.log(`警告: 未找到查询 "${queryName}"`);
      }
    }
    
    // 备份原文件
    const backupPath = dictionaryPath + '.backup.' + Date.now();
    fs.copyFileSync(dictionaryPath, backupPath);
    console.log(`原文件已备份到: ${backupPath}`);
    
    // 写入修复后的文件
    fs.writeFileSync(dictionaryPath, JSON.stringify(dictionary, null, 2));
    
    console.log(`\n修复完成! 共修复了 ${fixedCount} 个查询`);
    console.log('修复的查询包括:');
    Object.keys(queryFixes).forEach(queryName => {
      console.log(`  - ${queryName}`);
    });
    
  } catch (error) {
    console.error('修复过程中出错:', error);
  }
}

// 运行修复
if (require.main === module) {
  fixAIDictionary();
}

module.exports = { fixAIDictionary };
