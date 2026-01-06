#!/usr/bin/env node
/**
 * 生成真实的人事中心测试数据
 * - 清空班级、教师、家长、学生数据
 * - 生成250人的幼儿园数据
 * - 使用真实的中文姓名
 * - 根据幼儿园基础信息确定地区，生成对应的手机号码
 * - 正确建立关联关系
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { sequelize, User, Kindergarten, Class, Teacher, Student, Parent, ParentStudentRelation, Role } from '../init';
import { UserStatus, UserRole } from '../models/user.model';
import { StudentGender, StudentStatus } from '../models/student.model';
import { TeacherPosition, TeacherStatus } from '../models/teacher.model';
import { ClassType, ClassStatus } from '../models/class.model';
import { ClassTeacher } from '../models/class-teacher.model';
import { ClassTeacherRole, ClassTeacherStatus } from '../models/class-teacher.model';
import { UserRole as UserRoleModel } from '../models/user-role.model';
import { Op, QueryTypes } from 'sequelize';

// 真实的中国姓名库
const REAL_SURNAMES = [
  '王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴',
  '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗',
  '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧',
  '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕',
  '苏', '卢', '蒋', '蔡', '贾', '丁', '魏', '薛', '叶', '阎'
];

// 3-6岁儿童名字（适合幼儿园）
const CHILD_GIVEN_NAMES = [
  '小宝', '小欣', '小雨', '小晨', '小悦', '小宇', '小轩', '小涵', '小萱', '小琪',
  '文博', '思远', '晨曦', '雨桐', '欣然', '悦然', '安然', '诗雨', '语桐', '雅涵',
  '梓轩', '子墨', '思睿', '雨泽', '嘉豪', '子轩', '浩宇', '明轩', '瑞泽', '天翊',
  '诗琪', '梦琪', '雅琳', '欣妍', '思妍', '诗妍', '语嫣', '欣然', '婉如', '若曦',
  '昊然', '子涵', '宇航', '梓宸', '俊杰', '宇泽', '俊宇', '致远', '昊天', '博涛',
  '梓涵', '诗涵', '梓萱', '雨涵', '可馨', '艺涵', '思涵', '若汐', '语汐', '欣怡',
  '小旋', '小悦', '小艺', '小雅', '小慧', '小蕊', '小萌', '小柔', '小晴', '小月'
];

// 成人名字（家长）
const ADULT_MALE_NAMES = [
  '建国', '志强', '永强', '建军', '志明', '文华', '志华', '建华', '国强', '俊杰',
  '浩然', '博文', '梓豪', '子轩', '皓轩', '子涵', '宇航', '梓宸', '宇泽', '俊宇',
  '致远', '昊天', '博涛', '烨霖', '烨华', '煜城', '懿轩', '烨伟', '苑博', '伟宸'
];

const ADULT_FEMALE_NAMES = [
  '芳', '秀英', '丽', '秀兰', '玉兰', '桂英', '秀珍', '丽娜', '静', '美玲',
  '欣怡', '梓涵', '诗涵', '梓萱', '雨涵', '可馨', '艺涵', '思涵', '若汐', '语汐',
  '苏菲', '梓琳', '欣妍', '可儿', '雨桐', '语桐', '梓桐', '若桐', '思桐', '雨琪'
];

// 教师名字
const TEACHER_NAMES = [
  '张老师', '李老师', '王老师', '刘老师', '陈老师', '杨老师', '赵老师', '黄老师',
  '周老师', '吴老师', '徐老师', '孙老师', '胡老师', '朱老师', '高老师', '林老师'
];

// 地区手机号前缀映射
const PHONE_PREFIXES: Record<string, string[]> = {
  '重庆': ['138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '177', '178', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'],
  '北京': ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159'],
  '上海': ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159'],
  '广州': ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159'],
  '深圳': ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159'],
  '成都': ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159'],
  '杭州': ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159'],
  '武汉': ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159'],
  '默认': ['138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '177', '178', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189']
};

// 根据地址判断地区
function detectRegionFromAddress(address: string): string {
  if (!address) return '默认';
  
  const addressLower = address.toLowerCase();
  if (addressLower.includes('重庆') || addressLower.includes('cq')) return '重庆';
  if (addressLower.includes('北京') || addressLower.includes('beijing')) return '北京';
  if (addressLower.includes('上海') || addressLower.includes('shanghai')) return '上海';
  if (addressLower.includes('广州') || addressLower.includes('guangzhou')) return '广州';
  if (addressLower.includes('深圳') || addressLower.includes('shenzhen')) return '深圳';
  if (addressLower.includes('成都') || addressLower.includes('chengdu')) return '成都';
  if (addressLower.includes('杭州') || addressLower.includes('hangzhou')) return '杭州';
  if (addressLower.includes('武汉') || addressLower.includes('wuhan')) return '武汉';
  
  return '默认';
}

// 根据手机号判断地区
function detectRegionFromPhone(phone: string): string {
  if (!phone) return '默认';
  
  // 重庆手机号特征：138/139/150/151等开头
  if (phone.startsWith('138') || phone.startsWith('139') || phone.startsWith('150')) {
    return '重庆';
  }
  
  return '默认';
}

// 生成真实的中文姓名（儿童）
function generateChildName(gender: 'male' | 'female'): string {
  const surname = REAL_SURNAMES[Math.floor(Math.random() * REAL_SURNAMES.length)];
  const givenName = CHILD_GIVEN_NAMES[Math.floor(Math.random() * CHILD_GIVEN_NAMES.length)];
  return surname + givenName;
}

// 生成真实的中文姓名（成人）
function generateAdultName(gender: 'male' | 'female'): string {
  const surname = REAL_SURNAMES[Math.floor(Math.random() * REAL_SURNAMES.length)];
  const names = gender === 'male' ? ADULT_MALE_NAMES : ADULT_FEMALE_NAMES;
  const givenName = names[Math.floor(Math.random() * names.length)];
  return surname + givenName;
}

// 生成真实的手机号码
function generatePhoneNumber(region: string, index: number): string {
  const prefixes = PHONE_PREFIXES[region] || PHONE_PREFIXES['默认'];
  const prefix = prefixes[index % prefixes.length];
  
  // 生成8位随机数字，确保号码看起来自然
  const middle = Math.floor(1000 + Math.random() * 9000); // 4位
  const last = Math.floor(1000 + Math.random() * 9000); // 4位
  
  return `${prefix}${middle}${last}`;
}

// 生成邮箱（确保唯一性）
function generateEmail(name: string, region: string, index: number, type: 'teacher' | 'parent' = 'parent'): string {
  const domainMap: Record<string, string> = {
    '重庆': 'cq.com',
    '北京': 'bj.com',
    '上海': 'sh.com',
    '广州': 'gz.com',
    '深圳': 'sz.com',
    '成都': 'cd.com',
    '杭州': 'hz.com',
    '武汉': 'wh.com',
    '默认': 'example.com'
  };
  
  const domain = domainMap[region] || domainMap['默认'];
  // 使用类型前缀 + 索引确保唯一性
  const prefix = type === 'teacher' ? 't' : 'p';
  const username = `${prefix}${index}_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  return `${username}@${domain}`;
}

// 生成3-6岁的生日（2018-2021年）
function generateBirthDate(age: number): Date {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(birthYear, month, day);
}

// 清空数据
async function clearData() {
  console.log('🗑️  开始清空数据...');
  
  try {
    // 临时禁用外键检查，以便删除数据
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { type: QueryTypes.RAW });
    
    // 删除所有关联数据
    await sequelize.query('DELETE FROM admission_results', { type: QueryTypes.DELETE }).catch(() => {});
    console.log('✅ 清空录取结果');
    
    await sequelize.query('DELETE FROM activity_registrations', { type: QueryTypes.DELETE }).catch(() => {});
    console.log('✅ 清空活动报名');
    
    await sequelize.query('DELETE FROM enrollment_applications', { type: QueryTypes.DELETE }).catch(() => {});
    console.log('✅ 清空招生申请');
    
    await sequelize.query('DELETE FROM parent_student_relations', { type: QueryTypes.DELETE }).catch(() => {});
    console.log('✅ 清空家长-学生关系');
    
    await sequelize.query('DELETE FROM class_teachers', { type: QueryTypes.DELETE }).catch(() => {});
    console.log('✅ 清空班级-教师关系');
    
    await sequelize.query('DELETE FROM parents', { type: QueryTypes.DELETE }).catch(() => {});
    console.log('✅ 清空家长数据');
    
    await sequelize.query('DELETE FROM students', { type: QueryTypes.DELETE }).catch(() => {});
    console.log('✅ 清空学生数据');
    
    await sequelize.query('DELETE FROM classes', { type: QueryTypes.DELETE }).catch(() => {});
    console.log('✅ 清空班级数据');
    
    // 获取教师用户ID
    const teachers = await Teacher.findAll({ attributes: ['userId'] });
    const teacherUserIds = teachers.map(t => t.userId);
    
    await sequelize.query('DELETE FROM teachers', { type: QueryTypes.DELETE }).catch(() => {});
    console.log('✅ 清空教师数据');
    
    // 删除教师用户（但保留admin）
    if (teacherUserIds.length > 0) {
      const ids = teacherUserIds.join(',');
      await sequelize.query(`DELETE FROM users WHERE id IN (${ids}) AND role != 'admin'`, { type: QueryTypes.DELETE }).catch(() => {});
      console.log('✅ 清空教师用户');
    }
    
    // 恢复外键检查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { type: QueryTypes.RAW });
    
    console.log('✅ 数据清空完成');
  } catch (error) {
    // 确保恢复外键检查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { type: QueryTypes.RAW }).catch(() => {});
    console.error('❌ 清空数据失败:', error);
    throw error;
  }
}

// 获取幼儿园信息
async function getKindergartenInfo() {
  const kindergarten = await Kindergarten.findOne({
    where: { status: 1 },
    attributes: ['id', 'name', 'address', 'phone', 'consultationPhone']
  });
  
  if (!kindergarten) {
    throw new Error('未找到幼儿园信息，请先创建幼儿园');
  }
  
  return kindergarten;
}

// 生成数据
async function generateData() {
  try {
    console.log('🌱 开始生成真实测试数据...');
    
    // 获取幼儿园信息
    const kindergarten = await getKindergartenInfo();
    const kindergartenId = kindergarten.id;
    
    // 检测地区
    let region = detectRegionFromAddress(kindergarten.address || '');
    if (region === '默认') {
      region = detectRegionFromPhone(kindergarten.phone || kindergarten.consultationPhone || '');
    }
    console.log(`📍 检测到地区: ${region}`);
    
    // 获取admin用户作为creatorId
    const admin = await User.findOne({ where: { username: 'admin' } });
    if (!admin) {
      throw new Error('未找到admin用户');
    }
    const creatorId = admin.id;
    
    // 获取parent角色
    const parentRole = await Role.findOne({ where: { code: 'parent' } });
    if (!parentRole) {
      throw new Error('未找到parent角色');
    }
    
    const totalStudents = 250;
    const studentsPerClass = 28; // 每个班级28人
    const totalClasses = Math.ceil(totalStudents / studentsPerClass); // 9个班级
    
    // 年级分布：小班(3岁)、中班(4岁)、大班(5岁)
    const classDistribution = {
      small: Math.ceil(totalClasses / 3), // 小班
      middle: Math.ceil(totalClasses / 3), // 中班
      large: totalClasses - 2 * Math.ceil(totalClasses / 3) // 大班
    };
    
    console.log(`📊 计划生成数据:`);
    console.log(`   - 总学生数: ${totalStudents}`);
    console.log(`   - 总班级数: ${totalClasses} (小班${classDistribution.small}个, 中班${classDistribution.middle}个, 大班${classDistribution.large}个)`);
    console.log(`   - 每班人数: ${studentsPerClass}`);
    
    // 生成教师（每个班级2个教师：班主任+助教）
    const totalTeachers = totalClasses * 2;
    console.log(`   - 总教师数: ${totalTeachers}`);
    
    const teachers: Teacher[] = [];
    const teacherUsers: User[] = [];
    
    for (let i = 0; i < totalTeachers; i++) {
      const gender = i % 2 === 0 ? 'female' : 'male';
      const name = generateAdultName(gender);
      const phone = generatePhoneNumber(region, i);
      const email = generateEmail(name, region, i, 'teacher');
      const username = `teacher_${i + 1}`;
      
      // 创建教师用户
      const [user] = await User.findOrCreate({
        where: { username },
        defaults: {
          username,
          email,
          password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          phone,
          realName: name,
                role: UserRole.USER,
          status: UserStatus.ACTIVE
        }
      });
      
      teacherUsers.push(user);
      
      // 创建教师记录
      const position = i % 2 === 0 ? TeacherPosition.HEAD_TEACHER : TeacherPosition.REGULAR_TEACHER;
      const teacher = await Teacher.create({
        userId: user.id,
        kindergartenId,
        teacherNo: `T${String(i + 1).padStart(4, '0')}`,
        position,
        hireDate: new Date(2020, 0, 1),
        status: TeacherStatus.ACTIVE,
        creatorId,
        updaterId: creatorId
      });
      
      teachers.push(teacher);
    }
    
    console.log(`✅ 生成教师完成: ${teachers.length}个`);
    
    // 生成班级
    const classes: Class[] = [];
    let classIndex = 0;
    
    // 小班
    for (let i = 0; i < classDistribution.small; i++) {
      const classCode = `X${String(i + 1).padStart(2, '0')}`; // X01, X02...
      const className = `小班${i + 1}班`;
      const headTeacher = teachers[classIndex * 2];
      const assistantTeacher = teachers[classIndex * 2 + 1];
      
      const classItem = await Class.create({
        kindergartenId,
        name: className,
        code: classCode,
        type: ClassType.SMALL,
        headTeacherId: headTeacher.id,
        assistantTeacherId: assistantTeacher.id,
        capacity: studentsPerClass,
        currentStudentCount: 0,
        status: ClassStatus.NORMAL,
        creatorId,
        updaterId: creatorId
      });
      
      // 建立班级-教师关系（使用SQL直接插入，使用is_main_teacher字段）
      await sequelize.query(
        `INSERT INTO class_teachers (class_id, teacher_id, is_main_teacher, status, creator_id, updater_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [classItem.id, headTeacher.id, 1, ClassTeacherStatus.ACTIVE, creatorId, creatorId],
          type: QueryTypes.INSERT
        }
      ).catch(() => {});
      
      await sequelize.query(
        `INSERT INTO class_teachers (class_id, teacher_id, is_main_teacher, status, creator_id, updater_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [classItem.id, assistantTeacher.id, 0, ClassTeacherStatus.ACTIVE, creatorId, creatorId],
          type: QueryTypes.INSERT
        }
      ).catch(() => {});
      
      classes.push(classItem);
      classIndex++;
    }
    
    // 中班
    for (let i = 0; i < classDistribution.middle; i++) {
      const classCode = `Z${String(i + 1).padStart(2, '0')}`; // Z01, Z02...
      const className = `中班${i + 1}班`;
      const headTeacher = teachers[classIndex * 2];
      const assistantTeacher = teachers[classIndex * 2 + 1];
      
      const classItem = await Class.create({
        kindergartenId,
        name: className,
        code: classCode,
        type: ClassType.MIDDLE,
        headTeacherId: headTeacher.id,
        assistantTeacherId: assistantTeacher.id,
        capacity: studentsPerClass,
        currentStudentCount: 0,
        status: ClassStatus.NORMAL,
        creatorId,
        updaterId: creatorId
      });
      
      await sequelize.query(
        `INSERT INTO class_teachers (class_id, teacher_id, is_main_teacher, status, creator_id, updater_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [classItem.id, headTeacher.id, 1, ClassTeacherStatus.ACTIVE, creatorId, creatorId],
          type: QueryTypes.INSERT
        }
      ).catch(() => {});
      
      await sequelize.query(
        `INSERT INTO class_teachers (class_id, teacher_id, is_main_teacher, status, creator_id, updater_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [classItem.id, assistantTeacher.id, 0, ClassTeacherStatus.ACTIVE, creatorId, creatorId],
          type: QueryTypes.INSERT
        }
      ).catch(() => {});
      
      classes.push(classItem);
      classIndex++;
    }
    
    // 大班
    for (let i = 0; i < classDistribution.large; i++) {
      const classCode = `D${String(i + 1).padStart(2, '0')}`; // D01, D02...
      const className = `大班${i + 1}班`;
      const headTeacher = teachers[classIndex * 2];
      const assistantTeacher = teachers[classIndex * 2 + 1];
      
      const classItem = await Class.create({
        kindergartenId,
        name: className,
        code: classCode,
        type: ClassType.LARGE,
        headTeacherId: headTeacher.id,
        assistantTeacherId: assistantTeacher.id,
        capacity: studentsPerClass,
        currentStudentCount: 0,
        status: ClassStatus.NORMAL,
        creatorId,
        updaterId: creatorId
      });
      
      await sequelize.query(
        `INSERT INTO class_teachers (class_id, teacher_id, is_main_teacher, status, creator_id, updater_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [classItem.id, headTeacher.id, 1, ClassTeacherStatus.ACTIVE, creatorId, creatorId],
          type: QueryTypes.INSERT
        }
      ).catch(() => {});
      
      await sequelize.query(
        `INSERT INTO class_teachers (class_id, teacher_id, is_main_teacher, status, creator_id, updater_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [classItem.id, assistantTeacher.id, 0, ClassTeacherStatus.ACTIVE, creatorId, creatorId],
          type: QueryTypes.INSERT
        }
      ).catch(() => {});
      
      classes.push(classItem);
      classIndex++;
    }
    
    console.log(`✅ 生成班级完成: ${classes.length}个`);
    
    // 生成学生和家长
    let studentIndex = 0;
    let parentIndex = 0;
    const students: Student[] = [];
    const parents: Parent[] = [];
    const parentUsers: User[] = [];
    
    for (const classItem of classes) {
      const classType = classItem.type;
      let studentAge: number;
      
      if (classType === ClassType.SMALL) {
        studentAge = 3;
      } else if (classType === ClassType.MIDDLE) {
        studentAge = 4;
      } else {
        studentAge = 5;
      }
      
      const studentsInClass = Math.min(studentsPerClass, totalStudents - studentIndex);
      
      for (let i = 0; i < studentsInClass; i++) {
        const gender = Math.random() > 0.5 ? StudentGender.MALE : StudentGender.FEMALE;
        const studentName = generateChildName(gender === StudentGender.MALE ? 'male' : 'female');
        const birthDate = generateBirthDate(studentAge);
        const studentNo = `STU${String(studentIndex + 1).padStart(4, '0')}`;
        
        const student = await Student.create({
          kindergartenId,
          classId: classItem.id,
          name: studentName,
          studentNo,
          gender,
          birthDate,
          enrollmentDate: new Date(2024, 0, 1),
          status: StudentStatus.STUDYING,
          creatorId,
          updaterId: creatorId
        });
        
        students.push(student);
        
        // 每个学生创建1-2个家长（70%概率1个，30%概率2个）
        const parentCount = Math.random() > 0.3 ? 1 : 2;
        const relationships = parentCount === 1 ? ['父亲'] : ['父亲', '母亲'];
        
        for (let p = 0; p < parentCount; p++) {
          const parentGender = relationships[p] === '父亲' ? 'male' : 'female';
          const parentName = generateAdultName(parentGender);
          const parentPhone = generatePhoneNumber(region, parentIndex);
          const parentEmail = generateEmail(parentName, region, parentIndex, 'parent');
          const parentUsername = `parent_${parentIndex + 1}`;
          
          // 检查是否已存在该家长用户（同一个家长可能有多个孩子）
          let parentUser = await User.findOne({ where: { phone: parentPhone } });
          
          if (!parentUser) {
            // 创建家长用户
            const [newUser] = await User.findOrCreate({
              where: { username: parentUsername },
              defaults: {
                username: parentUsername,
                email: parentEmail,
                password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                phone: parentPhone,
                realName: parentName,
                role: UserRole.USER,
                status: UserStatus.ACTIVE
              }
            });
            
            parentUser = newUser;
            
            // 添加parent角色
            await UserRoleModel.findOrCreate({
              where: {
                userId: parentUser.id,
                roleId: parentRole.id
              },
              defaults: {
                userId: parentUser.id,
                roleId: parentRole.id
              }
            });
            
            parentUsers.push(parentUser);
            
            // 创建家长记录（Parent模型没有kindergartenId字段，只有userId和studentId）
            // 注意：Parent模型需要通过ParentStudentRelation来关联学生
            // 这里先创建Parent记录，但主要关联通过ParentStudentRelation建立
            const parent = await Parent.findOrCreate({
              where: { userId: parentUser.id },
              defaults: {
                userId: parentUser.id,
                studentId: student.id, // 第一个孩子的ID
                relationship: relationships[p],
                creatorId,
                updaterId: creatorId
              }
            });
            
            if (parent[1]) { // 如果是新创建的
              parents.push(parent[0]);
            } else {
              // 如果已存在，检查是否已添加到parents数组
              if (!parents.find(p => p.id === parent[0].id)) {
                parents.push(parent[0]);
              }
            }
          } else {
            // 如果家长已存在，找到对应的Parent记录
            const existingParent = await Parent.findOne({ where: { userId: parentUser.id } });
            if (existingParent && !parents.find(p => p.id === existingParent.id)) {
              parents.push(existingParent);
            }
          }
          
          // 建立家长-学生关系
          const parentRecord = parents.find(p => p.userId === parentUser!.id);
          if (parentRecord) {
            await ParentStudentRelation.findOrCreate({
              where: {
                userId: parentUser.id,
                studentId: student.id
              },
              defaults: {
                userId: parentUser.id,
                studentId: student.id,
                relationship: relationships[p],
                isPrimaryContact: p === 0 ? 1 : 0,
                isLegalGuardian: 1,
                creatorId,
                updaterId: creatorId
              }
            });
          }
          
          parentIndex++;
        }
        
        studentIndex++;
      }
      
      // 更新班级学生数
      await classItem.update({ currentStudentCount: studentsInClass });
    }
    
    console.log(`✅ 生成学生完成: ${students.length}个`);
    console.log(`✅ 生成家长完成: ${parents.length}个`);
    console.log(`✅ 生成家长用户完成: ${parentUsers.length}个`);
    
    // 更新幼儿园统计信息
    await kindergarten.update({
      studentCount: students.length,
      teacherCount: teachers.length,
      classCount: classes.length
    });
    
    console.log('✅ 数据生成完成！');
    console.log(`📊 统计信息:`);
    console.log(`   - 学生: ${students.length}人`);
    console.log(`   - 教师: ${teachers.length}人`);
    console.log(`   - 班级: ${classes.length}个`);
    console.log(`   - 家长: ${parents.length}人`);
    console.log(`   - 家长用户: ${parentUsers.length}人`);
    
  } catch (error) {
    console.error('❌ 生成数据失败:', error);
    throw error;
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始生成真实的人事中心测试数据...\n');
    
    // 清空数据
    await clearData();
    console.log('');
    
    // 生成数据
    await generateData();
    
    console.log('\n✅ 全部完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { main as generateRealisticPersonnelData };

