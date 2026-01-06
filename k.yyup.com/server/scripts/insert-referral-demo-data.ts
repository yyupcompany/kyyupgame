/**
 * 转介绍演示数据插入脚本
 *
 * 执行方法：
 * cd server
 * npm run seed:referral-demo
 */

import { Sequelize } from 'sequelize';
import { getDatabaseConfig } from '../config/database-unified';

// 导入模型
import { User } from '../models/user.model';
import { Teacher } from '../models/teacher.model';
import { Parent } from '../models/parent.model';
import { Student } from '../models/student.model';
import { ParentStudentRelation } from '../models/parent-student-relation.model';
import { Activity } from '../models/activity.model';
import { ActivityRegistration } from '../models/activity-registration.model';
import { Kindergarten } from '../models/kindergarten.model';
import { Class } from '../models/class.model';
import { ReferralRelationship } from '../models/referralrelationship.model';
import { ReferralReward } from '../models/referralreward.model';

interface ReferralDemoData {
  referralRelationships: any[];
  referralRewards: any[];
  activityRegistrations: any[];
  newStudents: any[];
  newParents: any[];
}

class ReferralDataInserter {
  private sequelize: Sequelize;

  constructor() {
    const dbConfig = getDatabaseConfig();
    this.sequelize = new Sequelize(
      dbConfig.database || '',
      dbConfig.username || '',
      dbConfig.password || '',
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: false
      }
    );
  }

  async insertDemoData(): Promise<void> {
    console.log('🚀 开始插入转介绍演示数据...');

    try {
      // 连接数据库
      await this.sequelize.authenticate();
      console.log('✅ 数据库连接成功');

      // 验证现有数据
      await this.validateExistingData();

      // 生成演示数据
      const demoData = await this.generateDemoData();
      console.log('📊 演示数据生成完成');

      // 插入数据
      await this.insertAllData(demoData);
      console.log('💾 数据插入完成');

      // 打印统计信息
      await this.printStatistics();

    } catch (error) {
      console.error('❌ 数据插入失败:', error);
      throw error;
    } finally {
      await this.sequelize.close();
    }
  }

  private async validateExistingData(): Promise<void> {
    const [teacherCount, parentCount, activityCount, classCount] = await Promise.all([
      Teacher.count(),
      Parent.count(),
      Activity.count(),
      Class.count()
    ]);

    console.log(`📊 现有数据验证：`);
    console.log(`   - 老师数量: ${teacherCount}`);
    console.log(`   - 家长数量: ${parentCount}`);
    console.log(`   - 活动数量: ${activityCount}`);
    console.log(`   - 班级数量: ${classCount}`);

    if (teacherCount < 10 || parentCount < 100 || activityCount < 5) {
      throw new Error('基础数据不足，请先运行 npm run seed-data:complete');
    }
  }

  private async generateDemoData(): Promise<ReferralDemoData> {
    const teachers = await Teacher.findAll({ limit: 18 });
    const parents = await Parent.findAll({ limit: 100 });
    const activities = await Activity.findAll({ limit: 20 });
    const classes = await Class.findAll({ limit: 10 });
    const kindergartens = await Kindergarten.findAll({ limit: 3 });

    // 月度目标分配
    const monthlyTargets = {
      '01': { conversions: 25 }, '02': { conversions: 20 }, '03': { conversions: 22 },
      '04': { conversions: 18 }, '05': { conversions: 17 }, '06': { conversions: 20 },
      '07': { conversions: 35 }, '08': { conversions: 45 }, '09': { conversions: 20 },
      '10': { conversions: 17 }, '11': { conversions: 18 }, '12': { conversions: 33 }
    };

    const demoData: ReferralDemoData = {
      referralRelationships: [],
      referralRewards: [],
      activityRegistrations: [],
      newStudents: [],
      newParents: []
    };

    // 生成每月的转介绍数据
    for (const [month, target] of Object.entries(monthlyTargets)) {
      const monthConversions = target.conversions;
      const monthDate = new Date(`2024-${month}-01`);

      for (let i = 0; i < monthConversions; i++) {
        const isTeacherReferral = Math.random() < 0.5; // 50%老师推荐
        const referrer = isTeacherReferral
          ? teachers[Math.floor(Math.random() * teachers.length)]
          : parents[Math.floor(Math.random() * parents.length)];

        const newStudent = await this.createNewStudent(classes, kindergartens, monthDate);
        const newParent = await this.createNewParent(newStudent, monthDate);

        // 创建转介绍关系
        const referralRelationship = await this.createReferralRelationship(
          referrer,
          newStudent,
          activities[Math.floor(Math.random() * activities.length)],
          monthDate,
          isTeacherReferral
        );

        // 创建奖励记录
        const rewardRecord = await this.createRewardRecord(
          referralRelationship,
          referrer,
          isTeacherReferral,
          monthDate
        );

        // 创建活动报名记录
        const activityRegistration = await this.createActivityRegistration(
          referralRelationship,
          newParent,
          activities[Math.floor(Math.random() * activities.length)],
          monthDate
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

  private async createNewStudent(classes: any[], kindergartens: any[], monthDate: Date): Promise<any> {
    const studentNo = `STU${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const randomKindergarten = kindergartens[Math.floor(Math.random() * kindergartens.length)];

    const birthDate = new Date(monthDate);
    birthDate.setFullYear(birthDate.getFullYear() - (Math.floor(Math.random() * 4) + 3)); // 3-6岁

    return {
      name: this.generateRandomChildName(),
      studentNo,
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

  private async createNewParent(studentData: any, monthDate: Date): Promise<any> {
    const parentUser = {
      username: `parent_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
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
      user: parentUser
    };
  }

  private async createReferralRelationship(
    referrer: any,
    newStudent: any,
    activity: any,
    monthDate: Date,
    isTeacherReferral: boolean
  ): Promise<any> {
    const referralCode = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const rewardAmount = isTeacherReferral
      ? Math.random() < 0.5 ? 500 : 200 // 老师：50%直接成交500元，50%转介绍200元
      : 300; // 家长：300元抵用金

    return {
      activityId: activity.id,
      referrerId: referrer.id,
      refereeId: newStudent.id || `temp_${Date.now()}`, // 临时ID，插入后更新
      referralCode,
      status: 'completed',
      rewardAmount: rewardAmount.toString(),
      createdAt: monthDate.toISOString(),
      completedAt: monthDate.toISOString(),
      rewardedAt: monthDate.toISOString()
    };
  }

  private async createRewardRecord(
    referral: any,
    referrer: any,
    isTeacherReferral: boolean,
    monthDate: Date
  ): Promise<any> {
    let rewardType: string;
    let amount: number;
    let couponCode: string | null = null;

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

  private async createActivityRegistration(
    referral: any,
    newParent: any,
    activity: any,
    monthDate: Date
  ): Promise<any> {
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
      sourceDetail: {
        referralCode: referral.referralCode,
        conversionStages: {
          sharedAt: referral.createdAt,
          firstClickAt: clickDate.toISOString(),
          registeredAt: registerDate.toISOString(),
          visitedAt: visitDate.toISOString(),
          enrolledAt: enrollDate.toISOString()
        }
      },
      autoAssigned: false,
      createdAt: registerDate.toISOString(),
      updatedAt: enrollDate.toISOString()
    };
  }

  private async insertAllData(demoData: ReferralDemoData): Promise<void> {
    console.log('开始批量插入数据...');

    // 使用事务确保数据一致性
    const transaction = await this.sequelize.transaction();

    try {
      // 1. 先插入新生学生
      console.log('📚 插入新学生数据...');
      const insertedStudents = [];
      for (const student of demoData.newStudents) {
        const inserted = await Student.create(student, { transaction });
        insertedStudents.push(inserted);
      }

      // 2. 插入新生家长用户和家长记录
      console.log('👨‍👩‍👧‍👦 插入新家长数据...');
      const insertedParents = [];
      for (let i = 0; i < demoData.newParents.length; i++) {
        const parentData = demoData.newParents[i];

        // 插入用户
        const user = await User.create(parentData.user, { transaction });

        // 插入家长记录
        const parent = await Parent.create({
          ...parentData,
          userId: user.id,
          studentId: insertedStudents[i].id
        }, { transaction });

        // 插入家长-学生关系
        await ParentStudentRelation.create({
          userId: user.id,
          studentId: insertedStudents[i].id,
          relationship: parentData.relationship,
          isPrimaryContact: parentData.isPrimaryContact,
          isLegalGuardian: parentData.isLegalGuardian
        }, { transaction });

        insertedParents.push({ ...parent, user });
      }

      // 3. 插入转介绍关系记录
      console.log('🤝 插入转介绍关系数据...');
      const insertedReferrals = [];
      for (let i = 0; i < demoData.referralRelationships.length; i++) {
        const referral = { ...demoData.referralRelationships[i] };
        referral.refereeId = insertedStudents[i].id;

        const inserted = await ReferralRelationship.create(referral, { transaction });
        insertedReferrals.push(inserted);
      }

      // 4. 插入奖励记录
      console.log('💰 插入奖励记录数据...');
      for (let i = 0; i < demoData.referralRewards.length; i++) {
        const reward = { ...demoData.referralRewards[i] };
        reward.referralId = insertedReferrals[i].id;

        await ReferralReward.create(reward, { transaction });
      }

      // 5. 插入活动报名记录
      console.log('📝 插入活动报名数据...');
      for (let i = 0; i < demoData.activityRegistrations.length; i++) {
        const registration = { ...demoData.activityRegistrations[i] };
        registration.parentId = insertedParents[i].id;
        registration.studentId = insertedStudents[i].id;

        await ActivityRegistration.create(registration, { transaction });
      }

      // 提交事务
      await transaction.commit();
      console.log('✅ 所有数据插入成功');

    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      console.error('❌ 数据插入失败，已回滚:', error);
      throw error;
    }
  }

  private async printStatistics(): Promise<void> {
    const [
      totalStudents,
      totalParents,
      totalReferrals,
      totalRewards,
      totalRegistrations
    ] = await Promise.all([
      Student.count(),
      Parent.count(),
      ReferralRelationship.count(),
      ReferralReward.count(),
      ActivityRegistration.count({ where: { isConversion: true } })
    ]);

    console.log('\n📊 数据插入统计：');
    console.log('='.repeat(50));
    console.log(`👶 新增学生数量: ${totalStudents}`);
    console.log(`👨‍👩‍👧‍👦 新增家长数量: ${totalParents}`);
    console.log(`🤝 转介绍关系数量: ${totalReferrals}`);
    console.log(`💰 奖励记录数量: ${totalRewards}`);
    console.log(`📝 转化报名数量: ${totalRegistrations}`);
    console.log(`🎯 整体转化率: ${(totalRegistrations / 1000 * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
    console.log('🎉 转介绍演示数据插入完成！');
    console.log('');
    console.log('💡 接下来您可以：');
    console.log('   1. 访问绩效中心查看转介绍统计数据');
    console.log('   2. 查看团队排名和个人贡献');
    console.log('   3. 检查奖励发放记录');
    console.log('   4. 分析转介绍转化漏斗');
  }

  // 工具方法
  private generateRandomChildName(): string {
    const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
    const givenNames = ['梓轩', '雨桐', '欣怡', '宇航', '子涵', '诗涵', '俊豪', '欣妍', '晨曦', '雨萱'];
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
    return surname + givenName;
  }

  private generateRandomParentName(): string {
    const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
    const maleNames = ['伟', '强', '军', '杰', '磊', '涛', '勇', '峰', '健', '明'];
    const femaleNames = ['芳', '娜', '敏', '静', '丽', '娟', '艳', '玲', '霞', '萍'];

    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const isMale = Math.random() < 0.5;
    const namePool = isMale ? maleNames : femaleNames;
    const givenName = namePool[Math.floor(Math.random() * namePool.length)];

    return surname + givenName;
  }

  private generateRandomPhone(): string {
    const prefixes = ['138', '139', '186', '188', '189', '135', '136', '137'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + suffix;
  }

  private generateRandomWorkUnit(): string {
    const units = ['科技公司', '贸易公司', '制造企业', '金融公司', '教育机构', '医疗机构', '政府机关', '个体经营'];
    return units[Math.floor(Math.random() * units.length)];
  }

  private generateRandomOccupation(): string {
    const occupations = ['工程师', '教师', '医生', '销售', '会计', '律师', '设计师', '管理员', '技术员', '自由职业'];
    return occupations[Math.floor(Math.random() * occupations.length)];
  }

  private generateRandomAddress(): string {
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
  const inserter = new ReferralDataInserter();
  await inserter.insertDemoData();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

export { ReferralDataInserter };