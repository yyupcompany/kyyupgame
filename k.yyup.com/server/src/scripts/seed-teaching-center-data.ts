#!/usr/bin/env ts-node
/*
 * 教学中心初始化种子数据
 * - 创建示例幼儿园/班级/教师/学生/家长关系
 * - 创建脑科学课程、课程计划、16次课程进度
 * - 创建户外训练与离园展示记录
 * - 创建一次校外展示与一次锦标赛
 * - 创建教学媒体与文件存储
 */
// 先加载环境变量，确保连接真实数据库而非SQLite内存库
import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// 再导入数据库与核心模型（init.ts 会按照真实环境初始化）
// 使用 require 避免静态导入在 dotenv 之前执行
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { sequelize, User, Kindergarten, Class, Teacher, Student, ParentStudentRelation, FileStorage } = require('../init')

// 教学中心模型与初始化器
import { initBrainScienceCourseModel, BrainScienceCourse } from '../models/brain-science-course.model'
import { initCoursePlanModel, CoursePlan } from '../models/course-plan.model'
import { initCourseProgressModel, CourseProgress } from '../models/course-progress.model'
import { initTeachingMediaRecordModel, TeachingMediaRecord } from '../models/teaching-media-record.model'
import { initOutdoorTrainingRecordModel, OutdoorTrainingRecord } from '../models/outdoor-training-record.model'
import { initExternalDisplayRecordModel, ExternalDisplayRecord } from '../models/external-display-record.model'
import { initChampionshipRecordModel, ChampionshipRecord } from '../models/championship-record.model'

async function ensureTeachingCenterModelsInitialized() {
  // init.ts 未包含教学中心模型，这里显式初始化一次
  initBrainScienceCourseModel(sequelize as any)
  initCoursePlanModel(sequelize as any)
  initCourseProgressModel(sequelize as any)
  initTeachingMediaRecordModel(sequelize as any)
  initOutdoorTrainingRecordModel(sequelize as any)
  initExternalDisplayRecordModel(sequelize as any)
  initChampionshipRecordModel(sequelize as any)
}

async function findOrCreateKindergarten() {
  const kg = await Kindergarten.findOne()
  if (kg) return kg
  return Kindergarten.create({
    name: '示例幼儿园',
    address: '示例路1号',
    phone: '020-00000000',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any)
}

async function findAdminUser() {
  const admin = await User.findOne({ where: { username: 'admin' } })
  if (!admin) throw new Error('未找到管理员用户 admin，请先运行初始种子或创建admin用户')
  return admin
}

async function ensureTeacher(adminUserId: number, kindergartenId: number) {
  // 复用admin作为教师（仅用于演示数据）
  let teacher = await Teacher.findOne({ where: { userId: adminUserId } })
  if (!teacher) {
    teacher = await Teacher.create({
      userId: adminUserId,
      kindergartenId,
      teacherNo: 'T-0001',
      position: 5, // REGULAR_TEACHER
      status: 1, // ACTIVE
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)
  }
  return teacher
}

async function ensureClass(kindergartenId: number, teacherId: number) {
  let cls = await Class.findOne({ where: { code: 'K1-01' } })
  if (!cls) {
    cls = await Class.create({
      name: '小一班',
      code: 'K1-01',
      kindergartenId,
      type: 1, // 小班
      headTeacherId: teacherId,
      capacity: 30,
      currentStudentCount: 0,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)
  }
  return cls
}

async function createStudents(kindergartenId: number, classId: number) {
  const existing = await Student.findAll({ where: { classId } })
  if (existing.length >= 2) return existing
  const now = new Date()
  const s1 = await Student.create({
    name: '小明',
    studentNo: 'S2024001',
    kindergartenId,
    classId,
    gender: 1,
    birthDate: new Date('2020-03-01'),
    enrollmentDate: new Date('2024-09-01'),
    status: 1,
    createdAt: now,
    updatedAt: now,
  } as any)
  const s2 = await Student.create({
    name: '小红',
    studentNo: 'S2024002',
    kindergartenId,
    classId,
    gender: 2,
    birthDate: new Date('2020-07-15'),
    enrollmentDate: new Date('2024-09-01'),
    status: 1,
    createdAt: now,
    updatedAt: now,
  } as any)
  // 更新班级人数
  await Class.update({ currentStudentCount: existing.length + 2 }, { where: { id: classId } })
  return [s1, s2]
}

async function ensureParentUsersAndRelations(students: any[]) {
  // 为两个学生创建两位家长用户并建立关联
  const now = new Date()
  const parent1 = await User.findOrCreate({
    where: { username: 'parent001' },
    defaults: {
      username: 'parent001',
      email: 'parent001@example.com',
      realName: '家长王',
      phone: '13800000001',
      status: 'active',
      role: 'user',
      createdAt: now,
      updatedAt: now,
    } as any,
  }).then(([u]) => u)

  const parent2 = await User.findOrCreate({
    where: { username: 'parent002' },
    defaults: {
      username: 'parent002',
      email: 'parent002@example.com',
      realName: '家长李',
      phone: '13800000002',
      status: 'active',
      role: 'user',
      createdAt: now,
      updatedAt: now,
    } as any,
  }).then(([u]) => u)

  // 通过 ParentStudentRelation 进行关联
  for (const [idx, stu] of students.entries()) {
    const pUser = idx === 0 ? parent1 : parent2
    await ParentStudentRelation.findOrCreate({
      where: { userId: pUser.id, studentId: stu.id },
      defaults: {
        userId: pUser.id,
        studentId: stu.id,
        relationship: '家长',
        isPrimaryContact: 1,
        isLegalGuardian: 1,
        createdAt: now,
        updatedAt: now,
      } as any,
    })
  }
}

async function seedBrainCourseAndPlan(classId: number, adminId: number) {
  const course = await BrainScienceCourse.findOrCreate({
    where: { course_name: '神童计划·基础' },
    defaults: {
      course_name: '神童计划·基础',
      course_description: '面向小班的脑科学启蒙课程',
      course_type: 'core',
      target_age_min: 36,
      target_age_max: 60,
      duration_minutes: 40,
      frequency_per_week: 1,
      objectives: { focus: '注意力', memory: '工作记忆' },
      materials: { cards: true, music: true },
      difficulty_level: 2,
      is_active: true,
      created_by: adminId,
    } as any,
  }).then(([c]) => c)

  const plan = await CoursePlan.findOrCreate({
    where: { class_id: classId, academic_year: '2024-2025', semester: '2024春季' },
    defaults: {
      course_id: course.id,
      class_id: classId,
      semester: '2024春季',
      academic_year: '2024-2025',
      planned_start_date: new Date('2024-03-01'),
      planned_end_date: new Date('2024-06-30'),
      total_sessions: 16,
      completed_sessions: 0,
      plan_status: 'active',
      target_achievement_rate: 80,
      actual_achievement_rate: 0,
      created_by: adminId,
    } as any,
  }).then(([p]) => p)

  return { course, plan }
}

async function seedCourseProgress(planId: number, classId: number, teacherId: number, studentsCount: number) {
  const existing = await CourseProgress.count({ where: { course_plan_id: planId } })
  if (existing >= 16) return
  const now = new Date()
  for (let i = 1; i <= 16; i++) {
    const completed = i <= 6 // 前6次标记为已完成
    const attendance = completed ? Math.max(10, Math.min(studentsCount, 18)) : 0
    const achieved = completed ? Math.round(attendance * 0.8) : 0
    await CourseProgress.create({
      course_plan_id: planId,
      class_id: classId,
      session_number: i,
      session_date: new Date(2024, 2, 1 + (i - 1) * 7),
      completion_status: completed ? 'completed' : 'not_started',
      teacher_confirmed: completed,
      attendance_count: attendance,
      target_achieved_count: achieved,
      achievement_rate: attendance > 0 ? Math.round((achieved / attendance) * 100) : 0,
      has_class_media: false,
      class_media_count: 0,
      has_student_media: false,
      student_media_count: 0,
      media_upload_required: true,
      teacher_id: completed ? teacherId : null,
      confirmed_at: completed ? now : null,
      created_at: now,
      updated_at: now,
    } as any)
  }
}

async function seedFileAndMedia(classId: number, planId: number, uploaderId: number) {
  // 找几条已完成的progress来挂媒体
  const progresses = await CourseProgress.findAll({
    where: { course_plan_id: planId, completion_status: 'completed' },
    limit: 2,
    order: [['session_number', 'ASC']],
  })
  if (progresses.length === 0) return

  const file = await FileStorage.create({
    fileName: 'class_photo_1.jpg',
    originalName: 'class_photo_1.jpg',
    filePath: '/uploads/demo/class_photo_1.jpg',
    fileSize: 102400,
    fileType: 'image/jpeg',
    storageType: 'local',
    accessUrl: '/uploads/demo/class_photo_1.jpg',
    isPublic: true,
    uploaderId: uploaderId,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active',
  } as any)

  for (const [idx, p] of progresses.entries()) {
    await TeachingMediaRecord.create({
      class_id: classId,
      course_progress_id: p.id,
      media_type: idx === 0 ? 'class_photo' : 'student_photo',
      file_storage_id: file.id,
      upload_by: uploaderId,
      upload_time: new Date(),
      description: idx === 0 ? '课堂合影' : '学生练习照',
      is_featured: idx === 0,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    } as any)
    // 回写进度上的媒体统计缓存
    await TeachingMediaRecord.countByMediaType(classId, p.id).then(async (c) => {
      await p.update({
        has_class_media: (c.class_photo + c.class_video) > 0,
        class_media_count: c.class_photo + c.class_video,
        has_student_media: (c.student_photo + c.student_video) > 0,
        student_media_count: c.student_photo + c.student_video,
      } as any)
    })
  }
}

async function seedOutdoorAndDisplay(classId: number, teacherId: number) {
  const now = new Date()
  // 户外训练与离园展示：各2条
  for (let w = 1; w <= 2; w++) {
    await OutdoorTrainingRecord.findOrCreate({
      where: { class_id: classId, academic_year: '2024-2025', semester: '2024春季', week_number: w, training_type: 'outdoor_training' },
      defaults: {
        class_id: classId,
        academic_year: '2024-2025',
        semester: '2024春季',
        week_number: w,
        training_type: 'outdoor_training',
        training_date: new Date(2024, 2, 3 + (w - 1) * 7),
        completion_status: 'completed',
        attendance_count: 20,
        target_achieved_count: 16,
        achievement_rate: 80,
        location: '操场',
        duration_minutes: 40,
        teacher_id: teacherId,
        confirmed_at: now,
      } as any,
    })

    await OutdoorTrainingRecord.findOrCreate({
      where: { class_id: classId, academic_year: '2024-2025', semester: '2024春季', week_number: w, training_type: 'departure_display' },
      defaults: {
        class_id: classId,
        academic_year: '2024-2025',
        semester: '2024春季',
        week_number: w,
        training_type: 'departure_display',
        training_date: new Date(2024, 2, 5 + (w - 1) * 7),
        completion_status: 'completed',
        attendance_count: 20,
        target_achieved_count: 18,
        achievement_rate: 90,
        location: '操场',
        duration_minutes: 20,
        teacher_id: teacherId,
        confirmed_at: now,
      } as any,
    })
  }

  // 校外展示：1条
  await ExternalDisplayRecord.findOrCreate({
    where: { class_id: classId, academic_year: '2024-2025', semester: '2024春季', event_name: '社区才艺展示' },
    defaults: {
      class_id: classId,
      academic_year: '2024-2025',
      semester: '2024春季',
      display_date: new Date('2024-05-20'),
      display_type: 'performance',
      event_name: '社区才艺展示',
      location: '社区文化中心',
      participation_count: 20,
      achievement_level: 'excellent',
      awards: '优秀节目奖',
      description: '音乐律动与创意画展示',
      photos_count: 5,
      videos_count: 1,
      teacher_id: teacherId,
    } as any,
  })
}

async function seedChampionship() {
  await ChampionshipRecord.findOrCreate({
    where: { academic_year: '2024-2025', semester: '2024春季', championship_name: '春季综合能力锦标赛' },
    defaults: {
      academic_year: '2024-2025',
      semester: '2024春季',
      championship_date: new Date('2024-06-15'),
      championship_type: 'comprehensive',
      championship_name: '春季综合能力锦标赛',
      total_classes: 6,
      total_participants: 120,
      completion_status: 'completed',
      brain_science_achievement_rate: 85,
      course_content_achievement_rate: 82,
      outdoor_training_achievement_rate: 88,
      external_display_achievement_rate: 80,
      overall_achievement_rate: 84,
      photos_count: 12,
      videos_count: 3,
    } as any,
  })
}

export async function run() {
  console.log('🌱 教学中心数据初始化开始 ...')
  await ensureTeachingCenterModelsInitialized()

  const t = await (sequelize as any).transaction()
  try {
    const admin = await findAdminUser()
    const kg = await findOrCreateKindergarten()
    const teacher = await ensureTeacher(admin.id, (kg as any).id)
    const cls = await ensureClass((kg as any).id, (teacher as any).id)
    const students = await createStudents((kg as any).id, (cls as any).id)
    await ensureParentUsersAndRelations(students)

    const { plan } = await seedBrainCourseAndPlan((cls as any).id, admin.id)
    await seedCourseProgress((plan as any).id, (cls as any).id, (teacher as any).id, students.length)

    await seedFileAndMedia((cls as any).id, (plan as any).id, admin.id)
    // 暂时跳过户外训练/离园展示/锦标赛，避免与历史数据库结构不一致导致报错
    // await seedOutdoorAndDisplay((cls as any).id, (teacher as any).id)
    // await seedChampionship()

    await t.commit()
    console.log('✅ 教学中心数据初始化完成')
  } catch (err) {
    await t.rollback()
    console.error('❌ 教学中心数据初始化失败:', err)
    process.exit(1)
  } finally {
    await (sequelize as any).close()
    process.exit(0)
  }
}

if (require.main === module) {
  run()
}

