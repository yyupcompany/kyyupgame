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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var apiResponse_1 = require("../utils/apiResponse");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var child_process_1 = require("child_process");
var util_1 = require("util");
var database_backup_service_1 = __importDefault(require("../services/system/database-backup.service"));
var execAsync = (0, util_1.promisify)(child_process_1.exec);
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/system-backup:
 *   get:
 *     summary: 获取系统备份列表
 *     description: 获取所有系统备份文件的列表，包括数据库备份和完整备份
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取备份列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                 data:
 *                   type: object
 *                   properties:
 *                     backups:
 *                       type: array
 *                       description: 备份文件列表
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: 备份文件名
 *                           size:
 *                             type: number
 *                             description: 文件大小（字节）
 *                           sizeFormatted:
 *                             type: string
 *                             description: 格式化后的文件大小
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: 创建时间
 *                           type:
 *                             type: string
 *                             enum: [database, full]
 *                             description: 备份类型
 *                     totalCount:
 *                       type: number
 *                       description: 备份文件总数
 *                     totalSize:
 *                       type: number
 *                       description: 所有备份文件总大小（字节）
 *                     totalSizeFormatted:
 *                       type: string
 *                       description: 格式化后的总大小
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *             example:
 *               success: true
 *               data:
 *                 backups:
 *                   - name: "backup-2025-01-15T10-30-00-000Z.sql"
 *                     size: 1048576
 *                     sizeFormatted: "1.00 MB"
 *                     createdAt: "2025-01-15T10:30:00.000Z"
 *                     type: "database"
 *                 totalCount: 1
 *                 totalSize: 1048576
 *                 totalSizeFormatted: "1.00 MB"
 *               message: "获取备份列表成功"
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
 */
router.get('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var backups, stats, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, database_backup_service_1["default"].getBackupList()];
            case 1:
                backups = _a.sent();
                return [4 /*yield*/, database_backup_service_1["default"].getBackupStats()];
            case 2:
                stats = _a.sent();
                console.log('备份列表调试信息:');
                console.log('- 备份文件数量:', backups.length);
                console.log('- 前3个备份文件:', backups.slice(0, 3));
                console.log('- 统计信息:', stats);
                result = {
                    items: backups.map(function (backup) { return ({
                        id: backup.filename.replace(/\.[^/.]+$/, ""),
                        name: backup.filename,
                        size: backup.size,
                        sizeFormatted: backup.sizeFormatted,
                        createdAt: backup.createdAt,
                        type: backup.type || 'manual',
                        status: 'completed'
                    }); }),
                    total: stats.totalBackups,
                    totalSize: stats.totalSize,
                    totalSizeFormatted: stats.totalSizeFormatted
                };
                console.log('返回给前端的数据:', JSON.stringify(result, null, 2));
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, result)];
            case 3:
                error_1 = _a.sent();
                console.error('获取备份列表失败:', error_1);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_1, '获取备份列表失败')];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/system-backup/database:
 *   post:
 *     summary: 创建数据库备份
 *     description: 创建新的数据库备份文件，使用mysqldump工具导出数据库
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: 备份描述
 *                 example: "每日自动备份"
 *     responses:
 *       200:
 *         description: 数据库备份创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                       description: 备份文件名
 *                     size:
 *                       type: number
 *                       description: 文件大小（字节）
 *                     sizeFormatted:
 *                       type: string
 *                       description: 格式化后的文件大小
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 创建时间
 *                     description:
 *                       type: string
 *                       description: 备份描述
 *                     status:
 *                       type: string
 *                       description: 备份状态（仅在模拟模式下）
 *                       example: "simulated"
 *                     message:
 *                       type: string
 *                       description: 备份状态消息（仅在模拟模式下）
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *             example:
 *               success: true
 *               data:
 *                 filename: "backup-2025-01-15T10-30-00-000Z.sql"
 *                 size: 1048576
 *                 sizeFormatted: "1.00 MB"
 *                 createdAt: "2025-01-15T10:30:00.000Z"
 *                 description: "每日自动备份"
 *               message: "数据库备份成功"
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
 */
router.post('/database', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, description, name_1, _b, includeData, includeTables, excludeTables, result, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, description = _a.description, name_1 = _a.name, _b = _a.includeData, includeData = _b === void 0 ? true : _b, includeTables = _a.includeTables, excludeTables = _a.excludeTables;
                return [4 /*yield*/, database_backup_service_1["default"].createBackup({
                        name: name_1,
                        description: description,
                        includeData: includeData,
                        includeTables: includeTables,
                        excludeTables: excludeTables
                    })];
            case 1:
                result = _c.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        filename: result.filename,
                        size: result.size,
                        sizeFormatted: result.sizeFormatted,
                        createdAt: result.createdAt,
                        description: result.description,
                        tableCount: result.tableCount,
                        recordCount: result.recordCount
                    }, '数据库备份成功')];
            case 2:
                error_2 = _c.sent();
                console.error('创建数据库备份失败:', error_2);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '创建数据库备份失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/system-backup/download/{filename}:
 *   get:
 *     summary: 下载备份文件
 *     description: 下载指定的备份文件到本地
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: 备份文件名
 *         example: "backup-2025-01-15T10-30-00-000Z.sql"
 *     responses:
 *       200:
 *         description: 成功下载备份文件
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: 文件下载头信息
 *             schema:
 *               type: string
 *               example: 'attachment; filename="backup-2025-01-15T10-30-00-000Z.sql"'
 *       404:
 *         description: 备份文件不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "备份文件不存在"
 *                 code:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
 */
router.get('/download/:filename', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filename, backupDir, filePath, stream;
    return __generator(this, function (_a) {
        try {
            filename = req.params.filename;
            backupDir = path.join(process.cwd(), 'backups');
            filePath = path.join(backupDir, filename);
            // 检查文件是否存在
            if (!fs.existsSync(filePath)) {
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '备份文件不存在', 'NOT_FOUND')];
            }
            // 设置响应头
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', "attachment; filename=\"".concat(filename, "\""));
            stream = fs.createReadStream(filePath);
            stream.pipe(res);
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '下载备份文件失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/system/backup/restore:
 *   post:
 *     summary: 恢复备份
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - backupId
 *             properties:
 *               backupId:
 *                 type: string
 *                 description: 备份文件名
 *                 example: "backup-2025-01-15T10-30-00-000Z.sql"
 *               dropExisting:
 *                 type: boolean
 *                 description: 是否删除现有表
 *                 default: true
 *               ignoreErrors:
 *                 type: boolean
 *                 description: 是否忽略错误继续执行
 *                 default: false
 *     responses:
 *       200:
 *         description: 恢复成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     tablesRestored:
 *                       type: integer
 *                       example: 15
 *                     restoredAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-15T10:30:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "备份恢复成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
 */
router.post('/restore', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, backupId, _b, dropExisting, _c, ignoreErrors, result, error_3;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _a = req.body, backupId = _a.backupId, _b = _a.dropExisting, dropExisting = _b === void 0 ? true : _b, _c = _a.ignoreErrors, ignoreErrors = _c === void 0 ? false : _c;
                if (!backupId) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '备份文件名不能为空', 'INVALID_PARAMS', 400)];
                }
                return [4 /*yield*/, database_backup_service_1["default"].restoreBackup({
                        filename: backupId,
                        dropExisting: dropExisting,
                        ignoreErrors: ignoreErrors
                    })];
            case 1:
                result = _d.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        tablesRestored: result.tablesRestored,
                        restoredAt: new Date(),
                        success: result.success
                    }, result.message)];
            case 2:
                error_3 = _d.sent();
                console.error('恢复备份失败:', error_3);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_3, '恢复备份失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/system-backup/{filename}:
 *   delete:
 *     summary: 删除备份文件
 *     description: 删除指定的备份文件
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: 要删除的备份文件名
 *         example: "backup-2025-01-15T10-30-00-000Z.sql"
 *     responses:
 *       200:
 *         description: 备份文件删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                 data:
 *                   type: null
 *                   description: 响应数据（删除操作为null）
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *             example:
 *               success: true
 *               data: null
 *               message: "备份文件删除成功"
 *       404:
 *         description: 备份文件不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "备份文件不存在"
 *                 code:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/:filename', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filename, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                filename = req.params.filename;
                // 使用新的数据库备份服务删除备份
                return [4 /*yield*/, database_backup_service_1["default"].deleteBackup(filename)];
            case 1:
                // 使用新的数据库备份服务删除备份
                _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, '备份文件删除成功')];
            case 2:
                error_4 = _a.sent();
                console.error('删除备份文件失败:', error_4);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_4, '删除备份文件失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/system/backup/validate/{filename}:
 *   post:
 *     summary: 验证备份文件
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: 备份文件名
 *     responses:
 *       200:
 *         description: 验证结果
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.post('/validate/:filename', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filename, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                filename = req.params.filename;
                return [4 /*yield*/, database_backup_service_1["default"].validateBackup(filename)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, result, result.valid ? '备份文件验证通过' : '备份文件验证失败')];
            case 2:
                error_5 = _a.sent();
                console.error('验证备份文件失败:', error_5);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_5, '验证备份文件失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/system/backup/cleanup:
 *   post:
 *     summary: 清理旧备份
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               retentionDays:
 *                 type: number
 *                 description: 保留天数
 *                 default: 7
 *     responses:
 *       200:
 *         description: 清理结果
 */
router.post('/cleanup', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, retentionDays, result, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body.retentionDays, retentionDays = _a === void 0 ? 7 : _a;
                return [4 /*yield*/, database_backup_service_1["default"].cleanupOldBackups(retentionDays)];
            case 1:
                result = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, result, "\u6E05\u7406\u5B8C\u6210\uFF0C\u5220\u9664\u4E86 ".concat(result.deletedCount, " \u4E2A\u5907\u4EFD\u6587\u4EF6"))];
            case 2:
                error_6 = _b.sent();
                console.error('清理备份失败:', error_6);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_6, '清理备份失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/system-backup/stats:
 *   get:
 *     summary: 获取备份统计信息
 *     description: 获取系统备份的统计数据，包括总数、总大小和最新备份时间
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取备份统计信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBackups:
 *                       type: number
 *                       description: 备份文件总数
 *                     totalSize:
 *                       type: number
 *                       description: 所有备份文件总大小（字节）
 *                     latestBackup:
 *                       type: string
 *                       format: date-time
 *                       description: 最新备份时间，如果没有备份则为null
 *                       nullable: true
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *             example:
 *               success: true
 *               data:
 *                 totalBackups: 5
 *                 totalSize: 52428800
 *                 latestBackup: "2025-01-15T10:30:00.000Z"
 *               message: "获取备份统计成功"
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
 */
router.get('/stats', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stats, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, database_backup_service_1["default"].getBackupStats()];
            case 1:
                stats = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        totalBackups: stats.totalBackups,
                        totalSize: stats.totalSize,
                        totalSizeFormatted: stats.totalSizeFormatted,
                        latestBackup: stats.latestBackup ? stats.latestBackup.toISOString() : null,
                        oldestBackup: stats.oldestBackup ? stats.oldestBackup.toISOString() : null
                    })];
            case 2:
                error_7 = _a.sent();
                console.error('获取备份统计失败:', error_7);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_7, '获取备份统计失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/system-backup/config:
 *   get:
 *     summary: 获取备份配置
 *     description: 获取系统备份的配置信息，包括自动备份设置和备份类型
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取备份配置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                 data:
 *                   type: object
 *                   properties:
 *                     autoBackup:
 *                       type: object
 *                       properties:
 *                         enabled:
 *                           type: boolean
 *                           description: 是否启用自动备份
 *                         schedule:
 *                           type: string
 *                           description: 备份计划（cron表达式）
 *                         retention:
 *                           type: number
 *                           description: 备份保留天数
 *                     backupTypes:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: boolean
 *                           description: 是否启用数据库备份
 *                         files:
 *                           type: boolean
 *                           description: 是否启用文件备份
 *                         full:
 *                           type: boolean
 *                           description: 是否启用完整备份
 *                     maxBackupSize:
 *                       type: number
 *                       description: 最大备份文件大小（字节）
 *                     backupPath:
 *                       type: string
 *                       description: 备份文件存储路径
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *             example:
 *               success: true
 *               data:
 *                 autoBackup:
 *                   enabled: false
 *                   schedule: "0 2 * * *"
 *                   retention: 7
 *                 backupTypes:
 *                   database: true
 *                   files: false
 *                   full: false
 *                 maxBackupSize: 1073741824
 *                 backupPath: "/home/project/backups"
 *               message: "获取备份配置成功"
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
 */
router.get('/config', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var config;
    return __generator(this, function (_a) {
        try {
            config = {
                autoBackup: {
                    enabled: false,
                    schedule: '0 2 * * *',
                    retention: 7 // 保留7天
                },
                backupTypes: {
                    database: true,
                    files: false,
                    full: false
                },
                maxBackupSize: 1024 * 1024 * 1024,
                backupPath: path.join(process.cwd(), 'backups')
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, config)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取备份配置失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/system-backup/auto-settings:
 *   get:
 *     summary: 获取自动备份设置
 *     description: 获取自动备份的详细设置信息，包括计划、保留策略等
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取自动备份设置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                 data:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                       description: 是否启用自动备份
 *                     schedule:
 *                       type: string
 *                       description: 备份计划（cron表达式）
 *                     retention:
 *                       type: number
 *                       description: 备份保留天数
 *                     maxBackupSize:
 *                       type: number
 *                       description: 最大备份文件大小（字节）
 *                     backupTypes:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: boolean
 *                           description: 是否启用数据库备份
 *                         files:
 *                           type: boolean
 *                           description: 是否启用文件备份
 *                         full:
 *                           type: boolean
 *                           description: 是否启用完整备份
 *                     lastBackup:
 *                       type: string
 *                       format: date-time
 *                       description: 上次备份时间
 *                       nullable: true
 *                     nextBackup:
 *                       type: string
 *                       format: date-time
 *                       description: 下次备份时间
 *                       nullable: true
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *             example:
 *               success: true
 *               data:
 *                 enabled: false
 *                 schedule: "0 2 * * *"
 *                 retention: 7
 *                 maxBackupSize: 1073741824
 *                 backupTypes:
 *                   database: true
 *                   files: false
 *                   full: false
 *                 lastBackup: null
 *                 nextBackup: null
 *               message: "获取自动备份设置成功"
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
 */
router.get('/auto-settings', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var autoSettings;
    return __generator(this, function (_a) {
        try {
            autoSettings = {
                enabled: false,
                schedule: '0 2 * * *',
                retention: 7,
                maxBackupSize: 1024 * 1024 * 1024,
                backupTypes: {
                    database: true,
                    files: false,
                    full: false
                },
                lastBackup: null,
                nextBackup: null
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, autoSettings)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取自动备份设置失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/system-backup/auto-settings:
 *   put:
 *     summary: 更新自动备份设置
 *     description: 更新系统自动备份的配置设置
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: 是否启用自动备份
 *                 example: true
 *               schedule:
 *                 type: string
 *                 description: 备份计划（cron表达式）
 *                 example: "0 2 * * *"
 *               retention:
 *                 type: number
 *                 description: 备份保留天数
 *                 example: 7
 *               maxBackupSize:
 *                 type: number
 *                 description: 最大备份文件大小（字节）
 *                 example: 1073741824
 *               backupTypes:
 *                 type: object
 *                 properties:
 *                   database:
 *                     type: boolean
 *                     description: 是否启用数据库备份
 *                     example: true
 *                   files:
 *                     type: boolean
 *                     description: 是否启用文件备份
 *                     example: false
 *                   full:
 *                     type: boolean
 *                     description: 是否启用完整备份
 *                     example: false
 *     responses:
 *       200:
 *         description: 自动备份设置更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                 data:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                       description: 是否启用自动备份
 *                     schedule:
 *                       type: string
 *                       description: 备份计划（cron表达式）
 *                     retention:
 *                       type: number
 *                       description: 备份保留天数
 *                     maxBackupSize:
 *                       type: number
 *                       description: 最大备份文件大小（字节）
 *                     backupTypes:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: boolean
 *                           description: 是否启用数据库备份
 *                         files:
 *                           type: boolean
 *                           description: 是否启用文件备份
 *                         full:
 *                           type: boolean
 *                           description: 是否启用完整备份
 *                     lastBackup:
 *                       type: string
 *                       format: date-time
 *                       description: 上次备份时间
 *                       nullable: true
 *                     nextBackup:
 *                       type: string
 *                       format: date-time
 *                       description: 下次备份时间
 *                       nullable: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 设置更新时间
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *             example:
 *               success: true
 *               data:
 *                 enabled: true
 *                 schedule: "0 2 * * *"
 *                 retention: 7
 *                 maxBackupSize: 1073741824
 *                 backupTypes:
 *                   database: true
 *                   files: false
 *                   full: false
 *                 lastBackup: null
 *                 nextBackup: null
 *                 updatedAt: "2025-01-15T10:30:00.000Z"
 *               message: "自动备份设置更新成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
 */
router.put('/auto-settings', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, enabled, schedule, retention, backupTypes, maxBackupSize, updatedSettings;
    return __generator(this, function (_b) {
        try {
            _a = req.body, enabled = _a.enabled, schedule = _a.schedule, retention = _a.retention, backupTypes = _a.backupTypes, maxBackupSize = _a.maxBackupSize;
            updatedSettings = {
                enabled: enabled || false,
                schedule: schedule || '0 2 * * *',
                retention: retention || 7,
                maxBackupSize: maxBackupSize || 1024 * 1024 * 1024,
                backupTypes: backupTypes || {
                    database: true,
                    files: false,
                    full: false
                },
                lastBackup: null,
                nextBackup: null,
                updatedAt: new Date()
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, updatedSettings, '自动备份设置更新成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '更新自动备份设置失败')];
        }
        return [2 /*return*/];
    });
}); });
// 辅助函数：格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
exports["default"] = router;
