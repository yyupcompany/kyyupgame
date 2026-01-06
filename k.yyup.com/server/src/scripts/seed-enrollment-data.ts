import { sequelize, EnrollmentPlan, EnrollmentApplication, Student, User, ParentStudentRelation } from '../init';
import { Semester, EnrollmentPlanStatus } from '../models/enrollment-plan.model';
import { ApplicationStatus } from '../models/enrollment-application.model';
import { StudentGender } from '../models/student.model';
import { UserStatus, UserRole } from '../models/user.model';

async function seedEnrollmentData() {
  try {
    console.log('🌱 开始创建招生测试数据(幂等)...');

    // 数据库连接已在init.ts中完成
    console.log('使用已初始化的数据库连接...');

    // 获取admin用户作为creatorId（避免硬编码ID）
    const admin = await User.findOne({ where: { username: 'admin' } });
    const creatorId = admin?.get('id') as number | undefined;

    // 幼儿园ID优先使用1（如有多园区可扩展为查询现有园区）
    const kindergartenId = 1;

    // 1) 招生计划（按 title+year+semester 幂等）
    const planInputs = [
      { title: '2024年春季招生计划', year: 2024, semester: Semester.SPRING, startDate: '2024-01-15', endDate: '2024-03-15', targetCount: 120, targetAmount: 420000.00, status: EnrollmentPlanStatus.IN_PROGRESS, remark: '学费3500元/学期，报名费200元' },
      { title: '2024年秋季招生计划', year: 2024, semester: Semester.AUTUMN, startDate: '2024-07-01', endDate: '2024-09-01', targetCount: 150, targetAmount: 570000.00, status: EnrollmentPlanStatus.IN_PROGRESS, remark: '学费3800元/学期，报名费200元' },
      { title: '2025年春季招生计划', year: 2025, semester: Semester.SPRING, startDate: '2025-01-15', endDate: '2025-03-15', targetCount: 130, targetAmount: 520000.00, status: EnrollmentPlanStatus.DRAFT, remark: '学费4000元/学期，报名费250元' },
    ];

    const createdPlans: EnrollmentPlan[] = [] as any;
    for (const p of planInputs) {
      const existing = await EnrollmentPlan.findOne({ where: { kindergartenId, year: p.year, semester: p.semester } });
      if (existing) {
        createdPlans.push(existing);
      } else {
        const plan = await EnrollmentPlan.create({
          kindergartenId,
          title: p.title,
          year: p.year,
          semester: p.semester,
          startDate: new Date(p.startDate),
          endDate: new Date(p.endDate),
          targetCount: p.targetCount,
          targetAmount: p.targetAmount,
          ageRange: '3-6岁',
          requirements: '需要提供健康证明和疫苗接种记录',
          description: `${p.year}年${p.semester === Semester.SPRING ? '春季' : '秋季'}学期招生计划，面向3-6岁儿童`,
          status: p.status,
          remark: p.remark,
          creatorId: creatorId || null,
        });
        createdPlans.push(plan);
      }
    }
    console.log(`✅ 招生计划可用：${createdPlans.length} 个`);

    // 2) 家长用户（按 username 幂等）
    const parentUsers = [
      { username: 'parent1', email: 'parent1@example.com', phone: '13800138001', realName: '张三' },
      { username: 'parent2', email: 'parent2@example.com', phone: '13800138002', realName: '王五' },
    ];
    const parentUserResults: User[] = [] as any;
    const parentIdByUsername: Record<string, number> = {};
    for (const u of parentUsers) {
      const [user] = await User.findOrCreate({
        where: { username: u.username },
        defaults: {
          username: u.username,
          email: u.email,
          // 使用通用的bcrypt("password")哈希（示例）；生产环境请改为安全流程
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          phone: u.phone,
          status: UserStatus.ACTIVE,
          role: UserRole.USER,
          realName: u.realName,
        }
      });
      parentUserResults.push(user);
      parentIdByUsername[u.username] = (user as any).id;
    }
    console.log(`✅ 家长用户可用：${parentUserResults.length} 个`);



    // 3) 学生（按 studentNo 幂等）
    const students = [
      { name: '张小明', studentNo: 'STU001', gender: StudentGender.MALE, birthDate: '2020-05-15', idCardNo: '110101202005150001', enrollmentDate: '2024-02-20', healthCondition: '健康', allergyHistory: '无', specialNeeds: '无' },
      { name: '王小红', studentNo: 'STU002', gender: StudentGender.FEMALE, birthDate: '2019-08-20', idCardNo: '110101201908200002', enrollmentDate: '2024-07-20', healthCondition: '健康', allergyHistory: '花粉过敏', specialNeeds: '无' },
    ];
    const studentResults: Student[] = [] as any;

    // 2.1 建立家长-学生关系（parent_student_relations）以生成 parentId
    const relations = [
      { username: 'parent1', studentNo: 'STU001', relationship: '父亲' },
      { username: 'parent2', studentNo: 'STU002', relationship: '母亲' },
    ];

    for (const s of students) {
      const [stu] = await (Student as any).findOrCreate({
        where: { studentNo: s.studentNo },
        defaults: {
          name: s.name,
          studentNo: s.studentNo,
          kindergartenId,
          gender: s.gender,
          birthDate: new Date(s.birthDate),
          idCardNo: s.idCardNo,
          enrollmentDate: new Date(s.enrollmentDate),
          healthCondition: s.healthCondition,
          allergyHistory: s.allergyHistory,
          specialNeeds: s.specialNeeds,
        }
      });
      studentResults.push(stu);

      // 针对本学生建立家长关系（如果存在对应关系配置）
      const rel = relations.find(r => r.studentNo === s.studentNo);
      if (rel) {
        const userId = parentIdByUsername[rel.username];
        if (userId) {
          await (ParentStudentRelation as any).findOrCreate({
            where: { userId, studentId: (stu as any).id },
            defaults: { userId, studentId: (stu as any).id, relationship: rel.relationship, isPrimaryContact: 1, isLegalGuardian: 1 }
          });
        }
      }
    }
    console.log(`✅ 学生可用：${studentResults.length} 个`);

    // 4) 招生申请（按 planId+studentName+applyDate 幂等）
    const applications = [
      { planIndex: 0, studentName: '张小明', gender: '男', birthDate: '2020-05-15', status: ApplicationStatus.APPROVED, applyDate: '2024-02-15', contactPhone: '13800138001', applicationSource: '官网报名', username: 'parent1', studentNo: 'STU001' },
      { planIndex: 1, studentName: '王小红', gender: '女', birthDate: '2019-08-20', status: ApplicationStatus.PENDING,  applyDate: '2024-07-15', contactPhone: '13800138002', applicationSource: '微信小程序', username: 'parent2', studentNo: 'STU002' },
    ];
    let createdApplicationsCount = 0;
    for (const a of applications) {
      const plan = createdPlans[a.planIndex];
      if (!plan) continue;
      const exists = await EnrollmentApplication.findOne({
        where: { planId: plan.id, studentName: a.studentName, applyDate: new Date(a.applyDate) }
      });
      if (!exists) {
        // 通过关系表查找 parentId
        const userId = parentIdByUsername[a.username];
        let parentId: number | null = null;
        if (userId) {
          const stu = studentResults.find(s => (s as any).studentNo === a.studentNo);
          if (stu) {
            const rel = await (ParentStudentRelation as any).findOne({ where: { userId, studentId: (stu as any).id } });
            if (rel) parentId = (rel as any).id;
          }
        }
        await EnrollmentApplication.create({
          planId: plan.id,
          parentId,
          studentName: a.studentName,
          gender: a.gender,
          birthDate: new Date(a.birthDate),
          status: a.status,
          applyDate: new Date(a.applyDate),
          contactPhone: a.contactPhone,
          applicationSource: a.applicationSource,
          createdBy: creatorId || null,
        });
        createdApplicationsCount++;
      }
    }
    console.log(`✅ 招生申请新增：${createdApplicationsCount} 条（若为0表示已存在）`);

    console.log('🎉 招生测试数据准备完成！');
  } catch (error) {
    console.error('❌ 创建招生测试数据失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedEnrollmentData()
    .then(() => {
      console.log('✅ 招生数据种子脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 招生数据种子脚本执行失败:', error);
      process.exit(1);
    });
}

export { seedEnrollmentData };
