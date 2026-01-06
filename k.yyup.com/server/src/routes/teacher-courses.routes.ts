import express from 'express';
import { TeacherCoursesController } from '../controllers/teacher-courses.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = express.Router();

// 所有路由都需要教师权限
router.use(verifyToken);
router.use(requireRole(['teacher', 'admin', 'principal']));

/**
* @route   GET /api/teacher/courses
* @desc    获取教师的所有课程列表
* @query   status - 课程状态 (assigned|in_progress|completed|paused)
* @query   classId - 班级ID筛选
* @access  Teacher
*/
router.get('/', TeacherCoursesController.getMyCourses);

/**
* @route   GET /api/teacher/courses/stats
* @desc    获取课程统计数据
* @access  Teacher
*/
router.get('/stats', TeacherCoursesController.getCourseStats);

/**
* @route   GET /api/teacher/courses/:courseId
* @desc    获取课程详情
* @access  Teacher
*/
router.get('/:courseId', TeacherCoursesController.getCourseDetail);

/**
* @route   PUT /api/teacher/courses/:courseId/status
* @desc    更新课程状态
* @body    { status: 'in_progress' | 'completed' | 'paused' }
* @access  Teacher
*/
router.put('/:courseId/status', TeacherCoursesController.updateCourseStatus);

/**
* @route   POST /api/teacher/courses/:courseId/records
* @desc    添加教学记录
* @body    { lesson_date, lesson_duration, attendance_count, teaching_content, ... }
* @access  Teacher
*/
router.post('/:courseId/records', TeacherCoursesController.addCourseRecord);

/**
* @route   PUT /api/teacher/courses/:courseId/records/:recordId
* @desc    更新教学记录
* @access  Teacher
*/
router.put('/:courseId/records/:recordId', TeacherCoursesController.updateCourseRecord);

/**
* @route   DELETE /api/teacher/courses/:courseId/records/:recordId
* @desc    删除教学记录
* @access  Teacher
*/
router.delete('/:courseId/records/:recordId', TeacherCoursesController.deleteCourseRecord);

export default router;
