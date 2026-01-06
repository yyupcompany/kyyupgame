"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var teacher_controller_1 = require("../controllers/teacher.controller");
var async_handler_1 = require("../middlewares/async-handler");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/teachers/search:
 *   get:
 *     summary: 搜索教师
 *     description: 根据查询条件搜索教师列表
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: 教师姓名（支持模糊搜索）
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: 工号
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: 部门
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: 状态
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 搜索成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "搜索成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Teacher'
 *                     total:
 *                       type: integer
 *                       description: 总数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
// 教师搜索接口（必须放在 /:id 之前）
router.get('/search', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('TEACHER_VIEW'), (0, async_handler_1.asyncHandler)(teacher_controller_1.teacherController.list.bind(teacher_controller_1.teacherController)));
/**
 * @swagger
 * /api/teachers/by-user/{userId}:
 *   get:
 *     summary: 根据用户ID获取教师信息
 *     description: 通过用户ID查询对应的教师信息
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取成功"
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
// 根据用户ID获取教师信息（必须放在 /:id 之前）
router.get('/by-user/:userId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('TEACHER_VIEW'), (0, async_handler_1.asyncHandler)(teacher_controller_1.teacherController.getByUserId.bind(teacher_controller_1.teacherController)));
/**
 * @swagger
 * /api/teachers/statistics:
 *   get:
 *     summary: 获取全局教师统计信息
 *     description: 获取系统中教师的全局统计数据，包括总数、状态分布等
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取统计信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取统计信息成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 教师总数
 *                     active:
 *                       type: integer
 *                       description: 在职教师数
 *                     inactive:
 *                       type: integer
 *                       description: 离职教师数
 *                     suspended:
 *                       type: integer
 *                       description: 停职教师数
 *                     byDepartment:
 *                       type: object
 *                       description: 各部门教师分布
 *                     avgExperience:
 *                       type: number
 *                       description: 平均工作经验（年）
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
// 获取全局教师统计信息（必须放在 /:id 之前）
router.get('/statistics', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('TEACHER_VIEW'), (0, async_handler_1.asyncHandler)(teacher_controller_1.teacherController.globalStats.bind(teacher_controller_1.teacherController)));
/**
 * @swagger
 * /api/teachers:
 *   get:
 *     summary: 获取教师列表
 *     description: 获取教师列表，支持分页和筛选
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: 教师状态筛选
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: 部门筛选
 *     responses:
 *       200:
 *         description: 获取教师列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取教师列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Teacher'
 *                     total:
 *                       type: integer
 *                       description: 总数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
// 获取教师列表
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('TEACHER_VIEW'), (0, async_handler_1.asyncHandler)(teacher_controller_1.teacherController.list.bind(teacher_controller_1.teacherController)));
/**
 * @swagger
 * /api/teachers/{id}:
 *   get:
 *     summary: 获取教师详情
 *     description: 根据教师ID获取教师详细信息
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教师ID
 *     responses:
 *       200:
 *         description: 获取教师详情成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取教师详情成功"
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
// 获取教师详情
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('TEACHER_VIEW'), (0, async_handler_1.asyncHandler)(teacher_controller_1.teacherController.detail.bind(teacher_controller_1.teacherController)));
/**
 * @swagger
 * /api/teachers:
 *   post:
 *     summary: 创建教师
 *     description: 创建新的教师记录
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - employeeId
 *               - phone
 *               - email
 *               - department
 *             properties:
 *               name:
 *                 type: string
 *                 description: 教师姓名
 *                 example: "张老师"
 *               employeeId:
 *                 type: string
 *                 description: 工号
 *                 example: "T001"
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *                 example: "13800138000"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱
 *                 example: "teacher@example.com"
 *               department:
 *                 type: string
 *                 description: 部门
 *                 example: "教学部"
 *               position:
 *                 type: string
 *                 description: 职位
 *                 example: "主班老师"
 *               qualification:
 *                 type: string
 *                 description: 教师资格证号
 *               experience:
 *                 type: integer
 *                 description: 工作经验（年）
 *                 example: 5
 *               address:
 *                 type: string
 *                 description: 住址
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: 生日
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: 性别
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 default: active
 *                 description: 状态
 *     responses:
 *       201:
 *         description: 创建教师成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "创建教师成功"
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: 工号或邮箱已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
// 创建教师
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('TEACHER_MANAGE'), (0, async_handler_1.asyncHandler)(teacher_controller_1.teacherController.create.bind(teacher_controller_1.teacherController)));
/**
 * @swagger
 * /api/teachers/{id}:
 *   put:
 *     summary: 更新教师信息
 *     description: 根据教师ID更新教师信息
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教师ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 教师姓名
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱
 *               department:
 *                 type: string
 *                 description: 部门
 *               position:
 *                 type: string
 *                 description: 职位
 *               qualification:
 *                 type: string
 *                 description: 教师资格证号
 *               experience:
 *                 type: integer
 *                 description: 工作经验（年）
 *               address:
 *                 type: string
 *                 description: 住址
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: 生日
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: 性别
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 description: 状态
 *     responses:
 *       200:
 *         description: 更新教师信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "更新教师信息成功"
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: 邮箱已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
// 更新教师信息
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('TEACHER_UPDATE'), (0, async_handler_1.asyncHandler)(teacher_controller_1.teacherController.update.bind(teacher_controller_1.teacherController)));
/**
 * @swagger
 * /api/teachers/{id}:
 *   delete:
 *     summary: 删除教师
 *     description: 根据教师ID删除教师记录
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教师ID
 *     responses:
 *       200:
 *         description: 删除教师成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "删除教师成功"
 *                 data:
 *                   type: object
 *                   nullable: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: 教师仍有关联数据，无法删除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
// 删除教师
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('TEACHER_MANAGE'), (0, async_handler_1.asyncHandler)(teacher_controller_1.teacherController["delete"].bind(teacher_controller_1.teacherController)));
/**
 * @swagger
 * /api/teachers/{id}/classes:
 *   get:
 *     summary: 获取教师分配的班级
 *     description: 获取指定教师负责的班级列表
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教师ID
 *     responses:
 *       200:
 *         description: 获取教师班级成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取教师班级成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacher:
 *                       $ref: '#/components/schemas/Teacher'
 *                     classes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Class'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
// 获取教师分配的班级
router.get('/:id/classes', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('TEACHER_VIEW'), (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // 这里可以添加获取教师班级的逻辑
            // 目前先返回教师详情中的班级信息
            return [4 /*yield*/, teacher_controller_1.teacherController.detail(req, res)];
            case 1:
                // 这里可以添加获取教师班级的逻辑
                // 目前先返回教师详情中的班级信息
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }));
/**
 * @swagger
 * /api/teachers/{id}/stats:
 *   get:
 *     summary: 获取教师统计信息
 *     description: 获取指定教师的详细统计信息，包括班级数量、学生数量等
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教师ID
 *     responses:
 *       200:
 *         description: 获取教师统计信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取教师统计信息成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacherId:
 *                       type: integer
 *                       description: 教师ID
 *                     teacherName:
 *                       type: string
 *                       description: 教师姓名
 *                     classCount:
 *                       type: integer
 *                       description: 负责班级数量
 *                     studentCount:
 *                       type: integer
 *                       description: 管理学生总数
 *                     experienceYears:
 *                       type: integer
 *                       description: 工作经验年数
 *                     performanceRating:
 *                       type: number
 *                       format: float
 *                       description: 绩效评分
 *                     attendanceRate:
 *                       type: number
 *                       format: float
 *                       description: 出勤率（百分比）
 *                     classPerformance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           classId:
 *                             type: integer
 *                             description: 班级ID
 *                           className:
 *                             type: string
 *                             description: 班级名称
 *                           studentCount:
 *                             type: integer
 *                             description: 班级学生数量
 *                           avgScore:
 *                             type: number
 *                             format: float
 *                             description: 班级平均成绩
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
// 获取教师统计信息
router.get('/:id/stats', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('TEACHER_VIEW'), (0, async_handler_1.asyncHandler)(teacher_controller_1.teacherController.stats.bind(teacher_controller_1.teacherController)));
exports["default"] = router;
