const { sequelize } = require('./src/models');

async function verifyData() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询班级数量
    console.log('📊 班级数据统计:');
    console.log('----------------------------------------');
    const [classes] = await sequelize.query(`
      SELECT
        class_name,
        grade_level,
        COUNT(s.id) as student_count
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id
      GROUP BY c.id, c.class_name, c.grade_level
      ORDER BY c.grade_level, c.class_name
    `);

    let totalStudents = 0;
    let totalClasses = 0;
    let classByGrade = {};

    classes.forEach(cls => {
      totalStudents += cls.student_count || 0;
      totalClasses++;
      const grade = cls.grade_level || '未知';
      if (!classByGrade[grade]) {
        classByGrade[grade] = 0;
      }
      classByGrade[grade]++;
      console.log(`  ${cls.class_name} (${grade}): ${cls.student_count}名学生`);
    });

    console.log(`\n📈 汇总:`);
    console.log(`  总班级数: ${totalClasses}`);
    console.log(`  总学生数: ${totalStudents}`);
    console.log(`  按年级分班: ${JSON.stringify(classByGrade)}`);

    // 查询教师数量
    console.log('\n👨‍🏫 教师数据统计:');
    console.log('----------------------------------------');
    const [teachers] = await sequelize.query(`
      SELECT
        role,
        COUNT(*) as count
      FROM teachers
      GROUP BY role
    `);

    let totalTeachers = 0;
    let teacherByRole = {};

    teachers.forEach(t => {
      totalTeachers += t.count;
      teacherByRole[t.role || '未知'] = t.count;
      console.log(`  ${t.role}: ${t.count}人`);
    });

    console.log(`\n📈 汇总:`);
    console.log(`  总教师数: ${totalTeachers}`);
    console.log(`  按角色分: ${JSON.stringify(teacherByRole)}`);

    console.log('\n========================================');
    console.log('🔍 数据对比:');
    console.log('========================================');
    console.log(`API返回 - 班级数: 12, 学生数: 328, 教师数: 28`);
    console.log(`数据库 - 班级数: ${totalClasses}, 学生数: ${totalStudents}, 教师数: ${totalTeachers}`);

    if (totalClasses === 12 && totalStudents === 328 && totalTeachers === 28) {
      console.log('\n✅ 数据完全一致！');
    } else {
      console.log('\n⚠️ 数据不一致，需要进一步检查');
      console.log('\n差异分析:');
      if (totalClasses !== 12) console.log(`  - 班级数差异: ${totalClasses - 12}`);
      if (totalStudents !== 328) console.log(`  - 学生数差异: ${totalStudents - 328}`);
      if (totalTeachers !== 28) console.log(`  - 教师数差异: ${totalTeachers - 28}`);
    }

  } catch (error) {
    console.error('❌ 数据库查询失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

verifyData();
