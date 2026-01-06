#!/usr/bin/env node

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function fixDemoAccounts() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🚀 开始修复四个快捷登录账号...\n');
    
    // ========== Phase 1: 扩展users表的role字段枚举值 ==========
    console.log('📋 Phase 1: 修复users表role字段枚举值');
    
    console.log('  - 当前role字段类型: enum(\'admin\',\'user\')');
    console.log('  - 修改为: enum(\'admin\',\'user\',\'principal\',\'teacher\',\'parent\')');
    
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('admin', 'user', 'principal', 'teacher', 'parent') NOT NULL
    `);
    console.log('  ✅ users表role字段已扩展\n');
    
    // ========== Phase 2: 修正四个演示账号的角色 ==========
    console.log('👤 Phase 2: 修正演示账号角色');
    
    const accountUpdates = [
      { username: 'admin', role: 'admin', desc: '系统管理员' },
      { username: 'principal', role: 'principal', desc: '园长' },
      { username: 'teacher', role: 'teacher', desc: '教师' },
      { username: 'parent', role: 'parent', desc: '家长' }
    ];
    
    for (const account of accountUpdates) {
      await connection.execute(
        'UPDATE users SET role = ? WHERE username = ?',
        [account.role, account.username]
      );
      console.log(`  ✅ ${account.username} 角色已更新为 ${account.role} (${account.desc})`);
    }
    console.log('');
    
    // ========== Phase 3: 确保核心角色存在 ==========
    console.log('🔐 Phase 3: 确保核心角色配置');
    
    const coreRoles = [
      { name: '系统管理员', code: 'admin', description: '系统超级管理员，拥有所有权限' },
      { name: '园长', code: 'principal', description: '幼儿园园长，负责园区整体管理' },
      { name: '教师', code: 'teacher', description: '幼儿园教师，负责班级和学生管理' },
      { name: '家长', code: 'parent', description: '学生家长，查看孩子相关信息' }
    ];
    
    for (const role of coreRoles) {
      const [existing] = await connection.execute(
        'SELECT id FROM roles WHERE code = ? LIMIT 1',
        [role.code]
      );
      
      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO roles (name, code, description, status, created_at, updated_at) VALUES (?, ?, ?, 1, NOW(), NOW())',
          [role.name, role.code, role.description]
        );
        console.log(`  ✅ 创建角色: ${role.name} (${role.code})`);
      } else {
        console.log(`  ℹ️ 角色已存在: ${role.name} (${role.code})`);
      }
    }
    console.log('');
    
    // ========== Phase 4: 创建parent用户的学生关联数据 ==========
    console.log('👨‍👩‍👧‍👦 Phase 4: 创建家长学生关联数据');
    
    // 获取parent用户ID
    const [parentUser] = await connection.execute(
      'SELECT id FROM users WHERE username = "parent" LIMIT 1'
    );
    
    if (parentUser.length > 0) {
      const parentUserId = parentUser[0].id;
      
      // 检查是否已有家长关联记录
      const [existingParentRecords] = await connection.execute(
        'SELECT COUNT(*) as count FROM parents WHERE user_id = ?',
        [parentUserId]
      );
      
      if (existingParentRecords[0].count === 0) {
        console.log('  开始创建演示学生和家长关联...');
        
        // 首先获取一个幼儿园ID
        const [kindergartens] = await connection.execute(
          'SELECT id FROM kindergartens WHERE deleted_at IS NULL LIMIT 1'
        );
        
        let kindergartenId = 1; // 默认值
        if (kindergartens.length > 0) {
          kindergartenId = kindergartens[0].id;
        }
        
        // 创建演示学生
        const demoStudents = [
          {
            name: '王小明',
            student_no: `ST${Date.now()}001`,
            gender: 1, // 1=男
            birth_date: '2019-05-15',
            enrollment_date: '2024-09-01',
            status: 1 // 1=在读
          },
          {
            name: '王小红',
            student_no: `ST${Date.now()}002`,
            gender: 2, // 2=女
            birth_date: '2020-08-20',
            enrollment_date: '2024-09-01',
            status: 1 // 1=在读
          }
        ];
        
        for (const student of demoStudents) {
          // 创建学生记录
          const [studentResult] = await connection.execute(`
            INSERT INTO students (
              name, student_no, kindergarten_id, gender, birth_date, 
              enrollment_date, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `, [
            student.name, student.student_no, kindergartenId,
            student.gender, student.birth_date, student.enrollment_date, student.status
          ]);
          
          const studentId = studentResult.insertId;
          
          // 创建家长-学生关联记录
          await connection.execute(`
            INSERT INTO parents (
              user_id, student_id, relationship, is_primary_contact, is_legal_guardian,
              work_unit, occupation, address, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `, [
            parentUserId, studentId, 'father', 1, 1,
            '示例科技公司', '软件工程师', '北京市朝阳区示例街道123号'
          ]);
          
          console.log(`  ✅ 已创建学生: ${student.name} 并关联到家长`);
        }
      } else {
        console.log('  ℹ️ 家长关联记录已存在');
      }
    }
    console.log('');
    
    // ========== Phase 5: 完善teacher用户的教师档案 ==========
    console.log('👩‍🏫 Phase 5: 完善教师档案');
    
    const [teacherUser] = await connection.execute(
      'SELECT id FROM users WHERE username = "teacher" LIMIT 1'
    );
    
    if (teacherUser.length > 0) {
      const teacherUserId = teacherUser[0].id;
      
      // 检查教师档案
      const [teacherProfile] = await connection.execute(
        'SELECT id FROM teachers WHERE user_id = ? LIMIT 1',
        [teacherUserId]
      );
      
      if (teacherProfile.length > 0) {
        const teacherId = teacherProfile[0].id;
        console.log('  ℹ️ 教师档案已存在 (ID: ' + teacherId + ')');
        
        // 检查是否有班级分配
        const [assignedClasses] = await connection.execute(
          'SELECT COUNT(*) as count FROM class_teachers WHERE teacher_id = ?',
          [teacherId]
        );
        
        if (assignedClasses[0].count === 0) {
          // 查找可分配的班级
          const [availableClasses] = await connection.execute(
            'SELECT id, name FROM classes WHERE deleted_at IS NULL LIMIT 2'
          );
          
          if (availableClasses.length > 0) {
            for (const cls of availableClasses) {
              await connection.execute(`
                INSERT INTO class_teachers (teacher_id, class_id, is_main_teacher, start_date, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
              `, [teacherId, cls.id, 1, '2024-09-01', 1]);
              
              console.log(`  ✅ 已分配班级: ${cls.name} (ID: ${cls.id})`);
            }
          } else {
            console.log('  ⚠️ 暂无可分配的班级');
          }
        } else {
          console.log(`  ℹ️ 教师已分配 ${assignedClasses[0].count} 个班级`);
        }
      }
    }
    console.log('');
    
    // ========== Phase 6: 验证修复结果 ==========
    console.log('✅ Phase 6: 验证修复结果');
    
    const [finalUsers] = await connection.execute(`
      SELECT id, username, email, role, real_name, phone, status 
      FROM users 
      WHERE username IN ('admin', 'principal', 'teacher', 'parent')
      ORDER BY username
    `);
    
    console.log('\n修复后的账号状态:');
    for (const user of finalUsers) {
      console.log(`📋 ${user.username.toUpperCase()}`);
      console.log(`   ID: ${user.id} | 角色: ${user.role} | 姓名: ${user.real_name}`);
      console.log(`   邮箱: ${user.email} | 电话: ${user.phone} | 状态: ${user.status}`);
      
      // 检查特定角色的数据完整性
      if (user.username === 'parent') {
        const [parentData] = await connection.execute(
          'SELECT COUNT(*) as count FROM parents WHERE user_id = ?',
          [user.id]
        );
        console.log(`   家长关联记录: ${parentData[0].count} 条`);
        
        if (parentData[0].count > 0) {
          const [studentsData] = await connection.execute(`
            SELECT COUNT(DISTINCT student_id) as count FROM parents WHERE user_id = ?
          `, [user.id]);
          console.log(`   关联学生: ${studentsData[0].count} 个`);
        }
      }
      
      if (user.username === 'teacher') {
        const [teacherData] = await connection.execute(
          'SELECT COUNT(*) as count FROM teachers WHERE user_id = ?',
          [user.id]
        );
        console.log(`   教师档案: ${teacherData[0].count} 条`);
        
        if (teacherData[0].count > 0) {
          const [classData] = await connection.execute(`
            SELECT COUNT(*) as count FROM class_teachers ct 
            JOIN teachers t ON ct.teacher_id = t.id 
            WHERE t.user_id = ?
          `, [user.id]);
          console.log(`   分配班级: ${classData[0].count} 个`);
        }
      }
      
      if (user.username === 'principal') {
        const [schedules] = await connection.execute(
          'SELECT COUNT(*) as count FROM schedules WHERE user_id = ?',
          [user.id]
        );
        const [todos] = await connection.execute(
          'SELECT COUNT(*) as count FROM todos WHERE user_id = ?',
          [user.id]
        );
        const [notifications] = await connection.execute(
          'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
          [user.id]
        );
        console.log(`   日程: ${schedules[0].count} 条 | 待办: ${todos[0].count} 条 | 通知: ${notifications[0].count} 条`);
      }
      
      console.log('');
    }
    
    console.log('🎉 四个快捷登录账号修复完成！');
    console.log('\n✅ 修复内容:');
    console.log('   1. 扩展了users表role字段枚举值');
    console.log('   2. 修正了所有演示账号的角色');
    console.log('   3. 确保了核心角色配置存在');
    console.log('   4. 创建了parent用户的完整档案和关联学生');
    console.log('   5. 完善了teacher用户的班级分配');
    console.log('\n🚀 现在所有四个账号都可以正常用于演示！');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
    console.error('错误详情:', error.message);
  } finally {
    await connection.end();
  }
}

// 运行修复脚本
fixDemoAccounts();