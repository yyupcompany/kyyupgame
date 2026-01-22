/**
 * 自定义课程管理路由
 * 提供课程、课程内容、课程排期的完整CRUD操作
 */

import { Router } from 'express';
import { CustomCourseController } from '../controllers/custom-course.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// 应用认证中间件
router.use(verifyToken);

// ==================== 课程统计 ====================

/**
 * @route   GET /api/custom-courses/stats
 * @desc    获取课程统计数据
 * @access  Admin, Principal
 */
router.get('/stats',
  requireRole(['admin', 'principal']),
  CustomCourseController.getCourseStats
);

/**
 * @route   GET /api/custom-courses/delayed-schedules
 * @desc    获取延期告警列表
 * @access  Admin, Principal
 */
router.get('/delayed-schedules',
  requireRole(['admin', 'principal']),
  CustomCourseController.getDelayedSchedules
);

// ==================== 教师端课程 ====================

/**
 * @route   GET /api/custom-courses/teacher/my-courses
 * @desc    获取教师的课程列表
 * @access  Teacher
 */
router.get('/teacher/my-courses',
  requireRole(['teacher', 'admin', 'principal']),
  CustomCourseController.getTeacherCourses
);

// ==================== 课程CRUD ====================

/**
 * @route   GET /api/custom-courses
 * @desc    获取课程列表
 * @access  Admin, Principal, Teacher
 */
router.get('/',
  requireRole(['admin', 'principal', 'teacher']),
  CustomCourseController.getCourses
);

/**
 * @route   GET /api/custom-courses/:id
 * @desc    获取单个课程详情
 * @access  Admin, Principal, Teacher
 */
router.get('/:id',
  requireRole(['admin', 'principal', 'teacher']),
  CustomCourseController.getCourseById
);

/**
 * @route   POST /api/custom-courses
 * @desc    创建课程
 * @access  Admin, Principal
 */
router.post('/',
  requireRole(['admin', 'principal']),
  CustomCourseController.createCourse
);

/**
 * @route   PUT /api/custom-courses/:id
 * @desc    更新课程
 * @access  Admin, Principal
 */
router.put('/:id',
  requireRole(['admin', 'principal']),
  CustomCourseController.updateCourse
);

/**
 * @route   DELETE /api/custom-courses/:id
 * @desc    删除课程
 * @access  Admin, Principal
 */
router.delete('/:id',
  requireRole(['admin', 'principal']),
  CustomCourseController.deleteCourse
);

/**
 * @route   PUT /api/custom-courses/:id/publish
 * @desc    发布课程
 * @access  Admin, Principal
 */
router.put('/:id/publish',
  requireRole(['admin', 'principal']),
  CustomCourseController.publishCourse
);

/**
 * @route   PUT /api/custom-courses/:id/archive
 * @desc    归档课程
 * @access  Admin, Principal
 */
router.put('/:id/archive',
  requireRole(['admin', 'principal']),
  CustomCourseController.archiveCourse
);

// ==================== 课程内容管理 ====================

/**
 * @route   GET /api/custom-courses/:courseId/contents
 * @desc    获取课程内容列表
 * @access  Admin, Principal, Teacher
 */
router.get('/:courseId/contents',
  requireRole(['admin', 'principal', 'teacher']),
  CustomCourseController.getCourseContents
);

/**
 * @route   POST /api/custom-courses/:courseId/contents
 * @desc    添加课程内容
 * @access  Admin, Principal
 */
router.post('/:courseId/contents',
  requireRole(['admin', 'principal']),
  CustomCourseController.addCourseContent
);

/**
 * @route   PUT /api/custom-courses/contents/:contentId
 * @desc    更新课程内容
 * @access  Admin, Principal
 */
router.put('/contents/:contentId',
  requireRole(['admin', 'principal']),
  CustomCourseController.updateCourseContent
);

/**
 * @route   DELETE /api/custom-courses/contents/:contentId
 * @desc    删除课程内容
 * @access  Admin, Principal
 */
router.delete('/contents/:contentId',
  requireRole(['admin', 'principal']),
  CustomCourseController.deleteCourseContent
);

/**
 * @route   PUT /api/custom-courses/:courseId/contents/reorder
 * @desc    更新课程内容排序
 * @access  Admin, Principal
 */
router.put('/:courseId/contents/reorder',
  requireRole(['admin', 'principal']),
  CustomCourseController.reorderCourseContents
);

// ==================== 课程排期管理 ====================

/**
 * @route   GET /api/custom-courses/:courseId/schedules
 * @desc    获取课程排期列表
 * @access  Admin, Principal, Teacher
 */
router.get('/:courseId/schedules',
  requireRole(['admin', 'principal', 'teacher']),
  CustomCourseController.getCourseSchedules
);

/**
 * @route   POST /api/custom-courses/:courseId/schedules
 * @desc    创建课程排期
 * @access  Admin, Principal
 */
router.post('/:courseId/schedules',
  requireRole(['admin', 'principal']),
  CustomCourseController.createCourseSchedule
);

/**
 * @route   PUT /api/custom-courses/schedules/:scheduleId
 * @desc    更新课程排期
 * @access  Admin, Principal
 */
router.put('/schedules/:scheduleId',
  requireRole(['admin', 'principal']),
  CustomCourseController.updateCourseSchedule
);

/**
 * @route   DELETE /api/custom-courses/schedules/:scheduleId
 * @desc    删除课程排期
 * @access  Admin, Principal
 */
router.delete('/schedules/:scheduleId',
  requireRole(['admin', 'principal']),
  CustomCourseController.deleteCourseSchedule
);

/**
 * @route   PUT /api/custom-courses/schedules/:scheduleId/confirm
 * @desc    教师确认课程排期
 * @access  Teacher
 */
router.put('/schedules/:scheduleId/confirm',
  requireRole(['teacher']),
  CustomCourseController.confirmSchedule
);

// ==================== AI互动课程关联 ====================

/**
 * @route   GET /api/custom-courses/:courseId/interactive-links
 * @desc    获取课程的互动课程关联列表
 * @access  Admin, Principal, Teacher
 */
router.get('/:courseId/interactive-links',
  requireRole(['admin', 'principal', 'teacher']),
  CustomCourseController.getCourseInteractiveLinks
);

/**
 * @route   POST /api/custom-courses/:courseId/interactive-links
 * @desc    关联AI互动课程
 * @access  Teacher, Admin, Principal
 */
router.post('/:courseId/interactive-links',
  requireRole(['teacher', 'admin', 'principal']),
  CustomCourseController.linkInteractiveCourse
);

/**
 * @route   DELETE /api/custom-courses/interactive-links/:linkId
 * @desc    取消关联AI互动课程
 * @access  Teacher, Admin, Principal
 */
router.delete('/interactive-links/:linkId',
  requireRole(['teacher', 'admin', 'principal']),
  CustomCourseController.unlinkInteractiveCourse
);

/**
 * @route   PUT /api/custom-courses/interactive-links/:linkId/approve
 * @desc    审核互动课程关联
 * @access  Admin, Principal
 */
router.put('/interactive-links/:linkId/approve',
  requireRole(['admin', 'principal']),
  CustomCourseController.approveInteractiveLink
);

// ==================== 课程分配管理 ====================

/**
 * @route   GET /api/custom-courses/assignments/stats
 * @desc    获取分配统计数据
 * @access  Admin, Principal, Teacher
 */
router.get('/assignments/stats',
  requireRole(['admin', 'principal', 'teacher']),
  CustomCourseController.getAssignmentStats
);

/**
 * @route   GET /api/custom-courses/:courseId/assignments
 * @desc    获取课程的分配列表
 * @access  Admin, Principal, Teacher
 */
router.get('/:courseId/assignments',
  requireRole(['admin', 'principal', 'teacher']),
  CustomCourseController.getCourseAssignments
);

/**
 * @route   POST /api/custom-courses/:courseId/assignments
 * @desc    创建课程分配
 * @access  Admin, Principal
 */
router.post('/:courseId/assignments',
  requireRole(['admin', 'principal']),
  CustomCourseController.createAssignment
);

/**
 * @route   PUT /api/custom-courses/assignments/:assignmentId
 * @desc    更新课程分配
 * @access  Admin, Principal
 */
router.put('/assignments/:assignmentId',
  requireRole(['admin', 'principal']),
  CustomCourseController.updateAssignment
);

/**
 * @route   DELETE /api/custom-courses/assignments/:assignmentId
 * @desc    取消课程分配
 * @access  Admin, Principal
 */
router.delete('/assignments/:assignmentId',
  requireRole(['admin', 'principal']),
  CustomCourseController.cancelAssignment
);

/**
 * @route   GET /api/custom-courses/teacher/my-assignments
 * @desc    获取教师的课程分配列表
 * @access  Teacher
 */
router.get('/teacher/my-assignments',
  requireRole(['teacher', 'admin', 'principal']),
  CustomCourseController.getTeacherAssignments
);

export default router;


