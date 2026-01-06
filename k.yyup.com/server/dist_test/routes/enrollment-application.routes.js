"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
/**
 * 报名申请路由
 */
var express_1 = require("express");
var enrollmentApplicationController = __importStar(require("../controllers/enrollment-application.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/enrollment-applications:
 *   post:
 *     summary: 创建报名申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentName
 *               - gender
 *               - birthDate
 *               - parentId
 *               - planId
 *               - contactPhone
 *               - applicationSource
 *             properties:
 *               studentName:
 *                 type: string
 *                 description: 学生姓名
 *               gender:
 *                 type: string
 *                 description: 性别
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: 出生日期
 *               parentId:
 *                 type: integer
 *                 description: 家长ID
 *               planId:
 *                 type: integer
 *                 description: 招生计划ID
 *               contactPhone:
 *                 type: string
 *                 description: 联系电话
 *               contactAddress:
 *                 type: string
 *                 description: 联系地址
 *               emergencyContact:
 *                 type: string
 *                 description: 紧急联系人
 *               emergencyPhone:
 *                 type: string
 *                 description: 紧急联系电话
 *               specialNeeds:
 *                 type: string
 *                 description: 特殊需求
 *               previousSchool:
 *                 type: string
 *                 description: 原就读学校
 *               applicationSource:
 *                 type: string
 *                 description: 申请来源
 *               notes:
 *                 type: string
 *                 description: 备注
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), enrollmentApplicationController.createApplication);
/**
 * @swagger
 * /api/enrollment-applications:
 *   get:
 *     summary: 获取报名申请列表
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: studentName
 *         schema:
 *           type: string
 *         description: 学生姓名
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 申请状态
 *       - in: query
 *         name: planId
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: query
 *         name: applyDateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 申请开始日期
 *       - in: query
 *         name: applyDateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 申请结束日期
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), function (req, res) {
    res.json({
        success: true,
        message: '获取报名申请列表成功',
        data: {
            total: 0,
            items: [],
            page: 1,
            pageSize: 10
        }
    });
});
/**
 * @swagger
 * /api/enrollment-applications/{id}:
 *   get:
 *     summary: 获取报名申请详情
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), function (req, res) {
    var id = req.params.id;
    res.json({
        success: true,
        message: '获取报名申请详情成功',
        data: {
            id: parseInt(id),
            studentName: '测试学生',
            gender: '男',
            birthDate: '2020-01-01',
            parentId: 1,
            planId: 1,
            contactPhone: '13800000000',
            applicationStatus: 'pending',
            applicationSource: 'online',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });
});
/**
 * @swagger
 * /api/enrollment-applications/{id}:
 *   put:
 *     summary: 更新报名申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentName:
 *                 type: string
 *                 description: 学生姓名
 *               contactPhone:
 *                 type: string
 *                 description: 联系电话
 *               applicationStatus:
 *                 type: string
 *                 description: 申请状态
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), function (req, res) {
    var id = req.params.id;
    res.json({
        success: true,
        message: '更新报名申请成功',
        data: {
            id: parseInt(id),
            updatedAt: new Date()
        }
    });
});
/**
 * @swagger
 * /api/enrollment-applications/{id}:
 *   delete:
 *     summary: 删除报名申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), function (req, res) {
    var id = req.params.id;
    res.json({
        success: true,
        message: '删除报名申请成功',
        data: {
            id: parseInt(id)
        }
    });
});
/**
 * @swagger
 * /api/enrollment-applications/by-plan/{planId}:
 *   get:
 *     summary: 按计划获取招生申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 招生计划ID
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/by-plan/:planId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), function (req, res) {
    var planId = req.params.planId;
    res.json({
        success: true,
        message: '按计划获取招生申请成功',
        data: {
            planId: parseInt(planId),
            total: 0,
            items: []
        }
    });
});
/**
 * @swagger
 * /api/enrollment-applications/by-status/{status}:
 *   get:
 *     summary: 按状态获取招生申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: 申请状态
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/by-status/:status', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), function (req, res) {
    var status = req.params.status;
    res.json({
        success: true,
        message: '按状态获取招生申请成功',
        data: {
            status: status,
            total: 0,
            items: []
        }
    });
});
/**
 * @swagger
 * /api/enrollment-applications/{id}/documents:
 *   post:
 *     summary: 上传申请文档
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     responses:
 *       201:
 *         description: 上传成功
 */
router.post('/:id/documents', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), function (req, res) {
    var id = req.params.id;
    res.status(201).json({
        success: true,
        message: '上传申请文档成功',
        data: {
            applicationId: parseInt(id),
            documentId: Math.floor(Math.random() * 1000) + 1,
            uploadTime: new Date()
        }
    });
});
/**
 * @swagger
 * /api/enrollment-applications/{id}/documents:
 *   get:
 *     summary: 获取申请文档列表
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/:id/documents', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), function (req, res) {
    var id = req.params.id;
    res.json({
        success: true,
        message: '获取申请文档列表成功',
        data: {
            applicationId: parseInt(id),
            documents: []
        }
    });
});
/**
 * @swagger
 * /api/enrollment-applications/{id}/interview:
 *   post:
 *     summary: 安排面试
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     responses:
 *       201:
 *         description: 安排成功
 */
router.post('/:id/interview', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), function (req, res) {
    var id = req.params.id;
    res.status(201).json({
        success: true,
        message: '安排面试成功',
        data: {
            applicationId: parseInt(id),
            interviewId: Math.floor(Math.random() * 1000) + 1,
            scheduledTime: new Date()
        }
    });
});
/**
 * @swagger
 * /api/enrollment-applications/{id}/review:
 *   put:
 *     summary: 审核申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
 *     responses:
 *       200:
 *         description: 审核成功
 */
router.put('/:id/review', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), function (req, res) {
    var id = req.params.id;
    res.json({
        success: true,
        message: '审核申请成功',
        data: {
            applicationId: parseInt(id),
            reviewStatus: 'reviewed',
            reviewTime: new Date()
        }
    });
});
/**
 * @swagger
 * /api/enrollment-applications/{id}/status:
 *   patch:
 *     summary: 更新申请状态
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 报名申请ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewing, approved, rejected, cancelled]
 *                 description: 申请状态
 *               notes:
 *                 type: string
 *                 description: 状态更新备注
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.patch('/:id/status', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, status_1, notes;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            _a = req.body, status_1 = _a.status, notes = _a.notes;
            if (!status_1) {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: '状态参数不能为空',
                        code: 'INVALID_PARAMS'
                    })];
            }
            // 模拟更新状态
            return [2 /*return*/, res.json({
                    success: true,
                    message: '申请状态更新成功',
                    data: {
                        id: parseInt(id),
                        status: status_1,
                        notes: notes,
                        updatedAt: new Date().toISOString()
                    }
                })];
        }
        catch (error) {
            return [2 /*return*/, res.status(500).json({
                    success: false,
                    message: '更新申请状态失败',
                    code: 'INTERNAL_ERROR'
                })];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/enrollment-applications/{id}/review:
 *   post:
 *     summary: 审核报名申请
 *     tags: [报名申请]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 报名申请ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, reviewing]
 *                 description: 审核状态
 *               comments:
 *                 type: string
 *                 description: 审核意见
 *     responses:
 *       200:
 *         description: 审核成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.post('/:id/review', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), enrollmentApplicationController.reviewApplication);
/**
 * @swagger
 * /api/enrollment-applications/{applicationId}/materials:
 *   get:
 *     summary: 获取报名申请材料列表
 *     tags: [报名申请材料]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 报名申请ID
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.get('/:applicationId/materials', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), enrollmentApplicationController.getMaterials);
/**
 * @swagger
 * /api/enrollment-applications/{applicationId}/materials:
 *   post:
 *     summary: 添加报名申请材料
 *     tags: [报名申请材料]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 报名申请ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - materialType
 *               - materialName
 *               - fileId
 *             properties:
 *               materialType:
 *                 type: string
 *                 description: 材料类型
 *               materialName:
 *                 type: string
 *                 description: 材料名称
 *               fileId:
 *                 type: integer
 *                 description: 文件ID
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.post('/:applicationId/materials', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), enrollmentApplicationController.addApplicationMaterial);
/**
 * @swagger
 * /api/enrollment-applications/materials/{materialId}:
 *   delete:
 *     summary: 删除报名申请材料
 *     tags: [报名申请材料]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: materialId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 材料ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router["delete"]('/materials/:materialId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), enrollmentApplicationController.deleteMaterial);
/**
 * @swagger
 * /api/enrollment-applications/materials/{materialId}/verify:
 *   post:
 *     summary: 验证报名申请材料
 *     tags: [报名申请材料]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: materialId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 材料ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: 验证状态
 *               comments:
 *                 type: string
 *                 description: 验证意见
 *     responses:
 *       200:
 *         description: 验证成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.post('/materials/:materialId/verify', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_APPLICATION_MANAGE'), enrollmentApplicationController.verifyMaterial);
exports["default"] = router;
