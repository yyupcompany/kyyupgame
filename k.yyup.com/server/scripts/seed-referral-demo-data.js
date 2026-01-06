/**
 * 转介绍演示数据种子脚本
 *
 * 数据规模：
 * - 1000次分享行为
 * - 360人最终转化（30%转化率）
 * - 老师推荐转化180人，家长推荐转化180人
 * - 分12个月分布，7-8月和12-1月为高峰期
 *
 * 执行方法：
 * npm run seed-data:referral-demo
 */

// 加载环境变量
require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// 颜色输出函数
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// 数据库连接配置
const getDatabaseConfig = () => {
  console.log(colors.blue('=== 数据库配置信息 ==='));
  console.log(`DB_HOST: ${process.env.DB_HOST}`);
  console.log(`DB_PORT: ${process.env.DB_PORT}`);
  console.log(`DB_NAME: ${process.env.DB_NAME}`);
  console.log(`DB_USER: ${process.env.DB_USER}`);
  console.log(`========================`);

  // 使用环境变量或默认配置
  return {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'kindergarten_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    logging: false, // 关闭SQL日志
    timezone: '+08:00',
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
};

class ReferralDemoDataSeeder {
  constructor() {
    const dbConfig = getDatabaseConfig();
    this.sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      dbConfig
    );
  }

  async seed() {
    console.log(colors.cyan('🚀 开始生成转介绍演示数据...'));

    try {
      // 连接数据库
      await this.sequelize.authenticate();
      console.log(colors.green('✅ 数据库连接成功'));

      // 验证现有数据
      await this.validateExistingData();

      // 生成演示数据
      const demoData = await this.generateDemoData();
      console.log(colors.yellow('📊 演示数据生成完成'));

      // 插入数据
      await this.insertAllData(demoData);
      console.log(colors.green('💾 数据插入完成'));

      // 打印统计信息
      await this.printStatistics();

    } catch (error) {
      console.error(colors.red('❌ 数据生成失败:'), error);
      throw error;
    } finally {
      await this.sequelize.close();
    }
  }

  async validateExistingData() {
    // 检查必要的表是否存在
    const [teacherCount, parentCount, activityCount, classCount] = await Promise.all([
      this.sequelize.query('SELECT COUNT(*) as count FROM teachers'),
      this.sequelize.query('SELECT COUNT(*) as count FROM parents'),
      this.sequelize.query('SELECT COUNT(*) as count FROM activities'),
      this.sequelize.query('SELECT COUNT(*) as count FROM classes')
    ]);

    const teachers = teacherCount[0][0].count;
    const parents = parentCount[0][0].count;
    const activities = activityCount[0][0].count;
    const classes = classCount[0][0].count;

    console.log(colors.blue('📊 现有数据验证：'));
    console.log(`   - 老师数量: ${teachers}`);
    console.log(`   - 家长数量: ${parents}`);
    console.log(`   - 活动数量: ${activities}`);
    console.log(`   - 班级数量: ${classes}`);

    if (teachers < 10) {
      throw new Error('老师数量不足，请先运行 npm run seed-data:complete');
    }
    if (parents < 100) {
      throw new Error('家长数量不足，请先运行 npm run seed-data:complete');
    }
  }

  async generateDemoData() {
    // 获取现有数据
    const [teachers, parents, activities, classes, kindergartens] = await Promise.all([
      this.sequelize.query('SELECT * FROM teachers LIMIT 18'),
      this.sequelize.query('SELECT * FROM parents LIMIT 100'),
      this.sequelize.query('SELECT * FROM activities LIMIT 20'),
      this.sequelize.query('SELECT * FROM classes LIMIT 10'),
      this.sequelize.query('SELECT * FROM kindergartens LIMIT 3')
    ]);

    console.log(colors.blue('📋 开始生成转介绍数据...'));

    const demoData = {
      referralRelationships: [],
      referralRewards: [],
      activityRegistrations: [],
      newStudents: [],
      newParents: []
    };

    // 月度目标分配
    const monthlyTargets = {
      '01': { conversions: 25 }, '02': { conversions: 20 }, '03': { conversions: 22 },
      '04': { conversions: 18 }, '05': { conversions: 17 }, '06': { conversions: 20 },
      '07': { conversions: 35 }, '08': { conversions: 45 }, '09': { conversions: 20 },
      '10': { conversions: 17 }, '11': { conversions: 18 }, '12': { conversions: 33 }
    };

    // 生成每月的转介绍数据
    for (const [month, target] of Object.entries(monthlyTargets)) {
      const monthConversions = target.conversions;
      const monthDate = new Date(`2024-${month}-01`);

      console.log(colors.cyan(`📅 生成${month}月转介绍数据: ${monthConversions}人`));

      for (let i = 0; i < monthConversions; i++) {
        const isTeacherReferral = Math.random() < 0.5; // 50%老师推荐
        const referrer = isTeacherReferral
          ? teachers[Math.floor(Math.random() * teachers.length)]
          : parents[Math.floor(Math.random() * parents.length)];

        const activity = activities[Math.floor(Math.random() * activities.length)];

        const newStudent = await this.createNewStudent(classes, kindergartens, monthDate, i, month);
        const newParent = await this.createNewParent(newStudent, monthDate, i, month);

        // 创建转介绍关系
        const referralRelationship = await this.createReferralRelationship(
          referrer,
          newStudent,
          activity,
          monthDate,
          isTeacherReferral,
          i,
          month
        );

        // 创建奖励记录
        const rewardRecord = await this.createRewardRecord(
          referralRelationship,
          referrer,
          isTeacherReferral,
          monthDate,
          i,
          month
        );

        // 创建活动报名记录
        const activityRegistration = await this.createActivityRegistration(
          referralRelationship,
          newParent,
          activity,
          monthDate,
          i,
          month
        );

        demoData.referralRelationships.push(referralRelationship);
        demoData.referralRewards.push(rewardRecord);
        demoData.activityRegistrations.push(activityRegistration);
        demoData.newStudents.push(newStudent);
        demoData.newParents.push(newParent);
      }
    }

    return demoData;
  }

  createNewStudent(classes, kindergartens, monthDate, index, month) {
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const randomKindergarten = kindergartens[Math.floor(Math.random() * kindergartens.length)];

    const birthDate = new Date(monthDate);
    birthDate.setFullYear(birthDate.getFullYear() - (Math.floor(Math.random() * 4) + 3)); // 3-6岁

    return {
      name: this.generateRandomChildName(),
      studentNo: `STU${Date.now()}${Math.floor(Math.random() * 1000)}`,
      kindergartenId: randomKindergarten.id,
      classId: randomClass.id,
      gender: Math.random() < 0.5 ? 1 : 2, // 1:男 2:女
      birthDate: birthDate.toISOString().split('T')[0],
      enrollmentDate: monthDate.toISOString().split('T')[0],
      status: 1, // 在读
      photoUrl: null,
      interests: null,
      tags: null,
      createdAt: monthDate,
      updatedAt: monthDate
    };
  }

  createNewParent(studentData, monthDate, index, month) {
    const user = {
      username: `parent_${Date.now()}${Math.floor(Math.random() * 1000)}`,
      email: `parent${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`,
      password: '$2b$10$dummy.password.hash.for.demo', // 密码占位符
      realName: this.generateRandomParentName(),
      phone: this.generateRandomPhone(),
      role: 'parent',
      status: 'active',
      createdAt: monthDate,
      updatedAt: monthDate
    };

    return {
      userId: null, // 插入用户后更新
      studentId: null, // 插入学生后更新
      relationship: Math.random() < 0.5 ? 'father' : 'mother',
      isPrimaryContact: true,
      isLegalGuardian: true,
      workUnit: this.generateRandomWorkUnit(),
      occupation: this.generateRandomOccupation(),
      address: this.generateRandomAddress(),
      isPublic: true,
      followStatus: '已转化',
      priority: 1,
      lastFollowupAt: monthDate,
      createdAt: monthDate,
      updatedAt: monthDate,
      user
    };
  }

  createReferralRelationship(referrer, newStudent, activity, monthDate, isTeacherReferral, index, month) {
    const referralCode = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const rewardAmount = isTeacherReferral
      ? Math.random() < 0.5 ? 500 : 200 // 老师：50%直接成交500元，50%转介绍200元
      : 300; // 家长：300元抵用金

    return {
      activityId: activity.id,
      referrerId: referrer.id,
      refereeId: newStudent.id || `temp_${Date.now()}_${index}`, // 临时ID，插入后更新
      referralCode,
      status: 'completed',
      rewardAmount: rewardAmount.toString(),
      createdAt: monthDate.toISOString(),
      completedAt: monthDate.toISOString(),
      rewardedAt: monthDate.toISOString()
    };
  }

  createRewardRecord(referral, referrer, isTeacherReferral, monthDate, index, month) {
    let rewardType, amount, couponCode;

    if (isTeacherReferral) {
      if (parseInt(referral.rewardAmount) === 500) {
        rewardType = 'direct_deal';
        amount = 500;
      } else {
        rewardType = 'referral_teacher';
        amount = 200;
      }
    } else {
      rewardType = 'referral_parent';
      amount = 300;
      couponCode = `TUITION_${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }

    return {
      referralId: null, // 插入转介绍关系后更新
      rewardType,
      rewardAmount: amount.toString(),
      rewardPoints: '0',
      couponId: null,
      couponCode,
      status: 'issued',
      issuedAt: monthDate.toISOString(),
      usedAt: couponCode ? null : monthDate.toISOString(),
      expiresAt: couponCode ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
      description: `${isTeacherReferral ? '老师' : '家长'}转介绍奖励`,
      createdAt: monthDate.toISOString()
    };
  }

  createActivityRegistration(referral, newParent, activity, monthDate, index, month) {
    // 模拟转化过程的时间点
    const clickDate = new Date(monthDate);
    clickDate.setDate(clickDate.getDate() + Math.floor(Math.random() * 7) + 1);

    const registerDate = new Date(clickDate);
    registerDate.setDate(registerDate.getDate() + Math.floor(Math.random() * 7) + 1);

    const visitDate = new Date(registerDate);
    visitDate.setDate(visitDate.getDate() + Math.floor(Math.random() * 14) + 1);

    const enrollDate = new Date(visitDate);
    enrollDate.setDate(enrollDate.getDate() + Math.floor(Math.random() * 21) + 1);

    return {
      activityId: activity.id,
      parentId: null, // 插入家长后更新
      studentId: null, // 插入学生后更新
      contactName: newParent.user.realName,
      contactPhone: newParent.user.phone,
      childName: this.generateRandomChildName(),
      childAge: Math.floor(Math.random() * 4) + 3,
      childGender: Math.random() < 0.5 ? 1 : 2,
      registrationTime: registerDate.toISOString(),
      attendeeCount: 1,
      source: referral.referrerId ? (referral.referrerId < 1000 ? '老师推荐' : '家长推荐') : '直接报名',
      status: 1, // 已确认
      checkInTime: visitDate.toISOString(),
      checkInLocation: '幼儿园',
      feedback: null,
      isConversion: true,
      remark: null,
      creatorId: null,
      updaterId: null,
      // 转介绍追踪字段
      shareBy: referral.referrerId,
      shareType: referral.referrerId ? (referral.referrerId < 1000 ? 'teacher' : 'parent') : null,
      sourceType: 'TEACHER_REFERRAL',
      sourceDetail: JSON.stringify({
        referralCode: referral.referralCode,
        conversionStages: {
          sharedAt: referral.createdAt,
          firstClickAt: clickDate.toISOString(),
          registeredAt: registerDate.toISOString(),
          visitedAt: visitDate.toISOString(),
          enrolledAt: enrollDate.toISOString()
        }
      }),
      autoAssigned: false,
      createdAt: registerDate.toISOString(),
      updatedAt: enrollDate.toISOString()
    };
  }

  async insertAllData(demoData) {
    console.log(colors.blue('💾 开始批量插入数据...'));

    // 使用事务确保数据一致性
    const transaction = await this.sequelize.transaction();

    try {
      // 1. 先插入新生学生
      console.log(colors.cyan('📚 插入新学生数据...'));
      const insertedStudents = [];
      for (const student of demoData.newStudents) {
        const [inserted] = await this.sequelize.query(
          'INSERT INTO students (name, studentNo, kindergartenId, classId, gender, birthDate, enrollmentDate, status, photoUrl, interests, tags, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            student.name,
            student.studentNo,
            student.kindergartenId,
            student.classId,
            student.gender,
            student.birthDate,
            student.enrollmentDate,
            student.status,
            student.photoUrl,
            student.interests,
            student.tags,
            student.createdAt,
            student.updatedAt
          ],
          { transaction }
        );
        insertedStudents.push(inserted.insertId);
      }

      // 2. 插入新生家长用户和家长记录
      console.log(colors.cyan('👨‍👩‍👧‍👦 插入新家长数据...'));
      const insertedParents = [];
      for (let i = 0; i < demoData.newParents.length; i++) {
        const parentData = demoData.newParents[i];

        // 插入用户
        const [user] = await this.sequelize.query(
          'INSERT INTO users (username, email, password, realName, phone, role, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            parentData.user.username,
            parentData.user.email,
            parentData.user.password,
            parentData.user.realName,
            parentData.user.phone,
            parentData.user.role,
            parentData.user.status,
            parentData.user.createdAt,
            parentData.user.updatedAt
          ],
          { transaction }
        );

        // 插入家长记录
        const [parent] = await this.sequelize.query(
          'INSERT INTO parents (userId, studentId, relationship, isPrimaryContact, isLegalGuardian, workUnit, occupation, address, isPublic, followStatus, priority, lastFollowupAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            user.insertId,
            insertedStudents[i].id,
            parentData.relationship,
            parentData.isPrimaryContact,
            parentData.isLegalGuardian,
            parentData.workUnit,
            parentData.occupation,
            parentData.address,
            parentData.isPublic,
            parentData.followStatus,
            parentData.priority,
            parentData.lastFollowupAt,
            parentData.createdAt,
            parentData.updatedAt
          ],
          { transaction }
        );

        // 插入家长-学生关系
        await this.sequelize.query(
          'INSERT INTO parent_student_relations (userId, studentId, relationship, isPrimaryContact, isLegalGuardian) VALUES (?, ?, ?, ?, ?)',
          [
            user.insertId,
            insertedStudents[i].id,
            parentData.relationship,
            parentData.isPrimaryContact,
            parentData.isLegalGuardian
          ],
          { transaction }
        );

        insertedParents.push({ ...parent, user });
      }

      // 3. 插入转介绍关系记录
      console.log(colors.cyan('🤝 插入转介绍关系数据...'));
      const insertedReferrals = [];
      for (let i = 0; i < demoData.referralRelationships.length; i++) {
        const referral = { ...demoData.referralRelationships[i] };
        referral.refereeId = insertedStudents[i].id;

        const [inserted] = await this.sequelize.query(
          'INSERT INTO referral_relationships (activityId, referrerId, refereeId, referralCode, status, rewardAmount, createdAt, completedAt, rewardedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            referral.activityId,
            referral.referrerId,
            referral.refereeId,
            referral.referralCode,
            referral.status,
            referral.rewardAmount,
            referral.createdAt,
            referral.completedAt,
            referral.rewardedAt
          ],
          { transaction }
        );
        insertedReferrals.push(inserted);
      }

      // 4. 插入奖励记录
      console.log(colors.cyan('💰 插入奖励记录数据...'));
      for (let i = 0; i < demoData.referralRewards.length; i++) {
        const reward = { ...demoData.referralRewards[i] };
        reward.referralId = insertedReferrals[i].id;

        await this.sequelize.query(
          'INSERT INTO referral_rewards (referralId, rewardType, rewardAmount, rewardPoints, couponId, couponCode, status, issuedAt, usedAt, expiresAt, description, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            reward.referralId,
            reward.rewardType,
            reward.rewardAmount,
            reward.rewardPoints,
            reward.couponId,
            reward.couponCode,
            reward.status,
            reward.issuedAt,
            reward.usedAt,
            reward.expiresAt,
            reward.description,
            reward.createdAt
          ],
          { transaction }
        );
      }

      // 5. 插入活动报名记录
      console.log(colors.cyan('📝 插入活动报名数据...'));
      for (let i = 0; i < demoData.activityRegistrations.length; i++) {
        const registration = { ...demoData.activityRegistrations[i] };
        registration.parentId = insertedParents[i].id;
        registration.studentId = insertedStudents[i].id;

        await this.sequelize.query(
          'INSERT INTO activity_registrations (activityId, parentId, studentId, contactName, contactPhone, childName, childAge, childGender, registrationTime, attendeeCount, specialNeeds, source, status, checkInTime, checkInLocation, feedback, isConversion, remark, creatorId, updaterId, shareBy, shareType, sourceType, sourceDetail, autoAssigned, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            registration.activityId,
            registration.parentId,
            registration.studentId,
            registration.contactName,
            registration.contactPhone,
            registration.childName,
            registration.childAge,
            registration.childGender,
            registration.registrationTime,
            registration.attendeeCount,
            registration.specialNeeds,
            registration.source,
            registration.status,
            registration.checkInTime,
            registration.checkInLocation,
            registration.feedback,
            registration.isConversion,
            registration.remark,
            registration.creatorId,
            registration.updaterId,
            registration.shareBy,
            registration.shareType,
            registration.sourceType,
            registration.sourceDetail,
            registration.autoAssigned,
            registration.createdAt,
            registration.updatedAt
          ],
          { transaction }
        );
      }

      // 提交事务
      await transaction.commit();
      console.log(colors.green('✅ 所有数据插入成功'));

    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      console.error(colors.red('❌ 数据插入失败，已回滚:'), error);
      throw error;
    }
  }

  async printStatistics() {
    const [
      totalStudents,
      totalParents,
      totalReferrals,
      totalRewards,
      totalRegistrations
    ] = await Promise.all([
      this.sequelize.query('SELECT COUNT(*) as count FROM students'),
      this.sequelize.query('SELECT COUNT(*) as count FROM parents'),
      this.sequelize.query('SELECT COUNT(*) as count FROM referral_relationships'),
      this.sequelize.query('SELECT COUNT(*) as count FROM referral_rewards'),
      this.sequelize.query('SELECT COUNT(*) as count FROM activity_registrations WHERE isConversion = 1')
    ]);

    const students = totalStudents[0][0].count;
    const parents = totalParents[0][0].count;
    const referrals = totalReferrals[0][0].count;
    const rewards = totalRewards[0][0].count;
    const registrations = totalRegistrations[0][0].count;

    console.log('\n' + colors.bold(colors.blue('📊 数据插入统计：')));
    console.log('='.repeat(50));
    console.log(colors.green(`👶 新增学生数量: ${students}`));
    console.log(colors.green(`👨‍👩‍👧‍👦 新增家长数量: ${parents}`));
    console.log(colors.green(`🤝 转介绍关系数量: ${referrals}`));
    console.log(colors.green(`💰 奖励记录数量: ${rewards}`));
    console.log(colors.green(`📝 转化报名数量: ${registrations}`));
    console.log(`🎯 整体转化率: ${(registrations / 1000 * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
    console.log(colors.yellow('🎉 转介绍演示数据插入完成！'));
    console.log('');
    console.log(colors.cyan('💡 接下来您可以：'));
    console.log('   1. 访问绩效中心查看转介绍统计数据');
    console.log('   2. 查看团队排名和个人贡献');
    console.log('   3. 检查奖励发放记录');
    console.log('   4. 分析转介绍转化漏斗');
  }

  // 工具方法
  generateRandomChildName() {
    const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
    const givenNames = ['梓轩', '雨桐', '欣怡', '宇航', '子涵', '诗涵', '俊豪', '欣妍', '晨曦', '雨萱'];
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
    return surname + givenName;
  }

  generateRandomParentName() {
    const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
    const maleNames = ['伟', '强', '军', '杰', '磊', '涛', '勇', '峰', '健', '明'];
    const femaleNames = ['芳', '娜', '敏', '静', '丽', '娟', '艳', '玲', '霞', '萍'];

    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const isMale = Math.random() < 0.5;
    const namePool = isMale ? maleNames : femaleNames;
    const givenName = namePool[Math.floor(Math.random() * namePool.length)];

    return surname + givenName;
  }

  generateRandomPhone() {
    const prefixes = ['138', '139', '186', '188', '189', '135', '136', '137'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + suffix;
  }

  generateRandomWorkUnit() {
    const units = ['科技公司', '贸易公司', '制造企业', '金融公司', '教育机构', '医疗机构', '政府机关', '个体经营'];
    return units[Math.floor(Math.random() * units.length)];
  }

  generateRandomOccupation() {
    const occupations = ['工程师', '教师', '医生', '销售', '会计', '律师', '设计师', '管理员', '技术员', '自由职业'];
    return occupations[Math.floor(Math.random() * occupations.length)];
  }

  generateRandomAddress() {
    const districts = ['海淀区', '朝阳区', '西城区', '东城区', '丰台区', '石景山区'];
    const streets = ['中关村大街', '建国路', '朝阳路', '西单北大街', '复兴路', '长安街'];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    return `北京市${district}${street}${number}号`;
  }
}

// 执行数据插入
async function main() {
  const seeder = new ReferralDemoDataSeeder();
  await seeder.seed();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ReferralDemoDataSeeder };