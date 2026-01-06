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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.TaskAttachmentController = void 0;
var task_attachment_model_1 = require("../models/task-attachment.model");
var todo_model_1 = require("../models/todo.model");
var user_model_1 = require("../models/user.model");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var file_security_1 = require("../utils/file-security");
var TaskAttachmentController = /** @class */ (function () {
    function TaskAttachmentController() {
    }
    /**
     * 获取任务的所有附件
     */
    TaskAttachmentController.getTaskAttachments = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var taskId, task, attachments, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        taskId = req.params.taskId;
                        return [4 /*yield*/, todo_model_1.Todo.findByPk(taskId)];
                    case 1:
                        task = _a.sent();
                        if (!task) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '任务不存在'
                                })];
                        }
                        return [4 /*yield*/, task_attachment_model_1.TaskAttachment.findAll({
                                where: {
                                    taskId: taskId,
                                    status: 'active'
                                },
                                include: [
                                    {
                                        model: user_model_1.User,
                                        as: 'uploader',
                                        attributes: ['id', 'username', 'realName']
                                    }
                                ],
                                order: [['uploadTime', 'DESC']]
                            })];
                    case 2:
                        attachments = _a.sent();
                        res.json({
                            success: true,
                            data: attachments
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('获取任务附件失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: '获取任务附件失败',
                            error: error_1 instanceof Error ? error_1.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 上传任务附件
     */
    TaskAttachmentController.uploadTaskAttachment = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var taskId, userId, file, task, fileName, filePath, fileSize, fileType, fileExtension, securityCheck, fileHash, fileUrl, attachment, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        taskId = req.params.taskId;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        file = req.file;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        if (!file) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '未找到上传的文件'
                                })];
                        }
                        return [4 /*yield*/, todo_model_1.Todo.findByPk(taskId)];
                    case 1:
                        task = _b.sent();
                        if (!task) {
                            // 删除已上传的文件
                            if (fs_1["default"].existsSync(file.path)) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '任务不存在'
                                })];
                        }
                        fileName = file.originalname;
                        filePath = file.path;
                        fileSize = file.size;
                        fileType = file.mimetype;
                        fileExtension = path_1["default"].extname(fileName);
                        // 🔒 安全检查
                        console.log("\uD83D\uDD0D \u5F00\u59CB\u5B89\u5168\u68C0\u67E5\u6587\u4EF6: ".concat(fileName));
                        return [4 /*yield*/, file_security_1.FileSecurityChecker.performSecurityCheck(fileName, filePath, fileType, fileSize)];
                    case 2:
                        securityCheck = _b.sent();
                        if (!securityCheck.safe) {
                            // 删除不安全的文件
                            if (fs_1["default"].existsSync(filePath)) {
                                fs_1["default"].unlinkSync(filePath);
                            }
                            console.error("\u274C \u5B89\u5168\u68C0\u67E5\u5931\u8D25: ".concat(securityCheck.reason));
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: "\u6587\u4EF6\u5B89\u5168\u68C0\u67E5\u5931\u8D25: ".concat(securityCheck.reason)
                                })];
                        }
                        console.log("\u2705 \u6587\u4EF6\u5B89\u5168\u68C0\u67E5\u901A\u8FC7: ".concat(fileName));
                        fileHash = file_security_1.FileSecurityChecker.calculateFileHash(filePath);
                        fileUrl = "/uploads/tasks/".concat(file.filename);
                        return [4 /*yield*/, task_attachment_model_1.TaskAttachment.create({
                                taskId: parseInt(taskId),
                                fileName: fileName,
                                filePath: filePath,
                                fileUrl: fileUrl,
                                fileSize: fileSize,
                                fileType: fileType,
                                fileExtension: fileExtension,
                                uploaderId: userId,
                                uploadTime: new Date(),
                                status: 'active'
                            })];
                    case 3:
                        attachment = _b.sent();
                        console.log("\u2705 \u9644\u4EF6\u4E0A\u4F20\u6210\u529F: ID=".concat(attachment.id, ", Hash=").concat(fileHash.substring(0, 8), "..."));
                        res.json({
                            success: true,
                            message: '文件上传成功',
                            data: {
                                id: attachment.id,
                                fileName: attachment.fileName,
                                fileUrl: attachment.fileUrl,
                                fileSize: attachment.fileSize,
                                fileType: attachment.fileType,
                                uploadTime: attachment.uploadTime
                            }
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _b.sent();
                        console.error('上传任务附件失败:', error_2);
                        // 清理上传的文件
                        if (req.file && fs_1["default"].existsSync(req.file.path)) {
                            fs_1["default"].unlinkSync(req.file.path);
                        }
                        res.status(500).json({
                            success: false,
                            message: '上传任务附件失败',
                            error: error_2 instanceof Error ? error_2.message : '未知错误'
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除任务附件
     */
    TaskAttachmentController.deleteTaskAttachment = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, taskId, attachmentId, userId, attachment, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        _b = req.params, taskId = _b.taskId, attachmentId = _b.attachmentId;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, task_attachment_model_1.TaskAttachment.findOne({
                                where: {
                                    id: attachmentId,
                                    taskId: taskId,
                                    status: 'active'
                                }
                            })];
                    case 1:
                        attachment = _c.sent();
                        if (!attachment) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '附件不存在'
                                })];
                        }
                        // 验证权限（只有上传者可以删除）
                        if (attachment.uploaderId !== userId) {
                            return [2 /*return*/, res.status(403).json({
                                    success: false,
                                    message: '无权删除此附件'
                                })];
                        }
                        // 软删除附件记录
                        attachment.status = 'deleted';
                        return [4 /*yield*/, attachment.save()];
                    case 2:
                        _c.sent();
                        // 可选：删除物理文件
                        // if (fs.existsSync(attachment.filePath)) {
                        //   fs.unlinkSync(attachment.filePath);
                        // }
                        res.json({
                            success: true,
                            message: '附件已删除'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _c.sent();
                        console.error('删除任务附件失败:', error_3);
                        res.status(500).json({
                            success: false,
                            message: '删除任务附件失败',
                            error: error_3 instanceof Error ? error_3.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 下载任务附件
     */
    TaskAttachmentController.downloadTaskAttachment = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, taskId, attachmentId, attachment, fileStream, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.params, taskId = _a.taskId, attachmentId = _a.attachmentId;
                        return [4 /*yield*/, task_attachment_model_1.TaskAttachment.findOne({
                                where: {
                                    id: attachmentId,
                                    taskId: taskId,
                                    status: 'active'
                                }
                            })];
                    case 1:
                        attachment = _b.sent();
                        if (!attachment) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '附件不存在'
                                })];
                        }
                        // 检查文件是否存在
                        if (!fs_1["default"].existsSync(attachment.filePath)) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '文件不存在'
                                })];
                        }
                        // 设置响应头
                        res.setHeader('Content-Type', attachment.fileType || 'application/octet-stream');
                        res.setHeader('Content-Disposition', "attachment; filename=\"".concat(encodeURIComponent(attachment.fileName), "\""));
                        res.setHeader('Content-Length', attachment.fileSize.toString());
                        fileStream = fs_1["default"].createReadStream(attachment.filePath);
                        fileStream.pipe(res);
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        console.error('下载任务附件失败:', error_4);
                        res.status(500).json({
                            success: false,
                            message: '下载任务附件失败',
                            error: error_4 instanceof Error ? error_4.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量上传任务附件
     */
    TaskAttachmentController.batchUploadTaskAttachments = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var uploadedFiles, taskId_1, userId_1, files, task, securityResults, unsafeFiles, reasons, attachments, error_5;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        uploadedFiles = [];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        taskId_1 = req.params.taskId;
                        userId_1 = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        files = req.files;
                        if (!userId_1) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        if (!files || files.length === 0) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '未找到上传的文件'
                                })];
                        }
                        return [4 /*yield*/, todo_model_1.Todo.findByPk(taskId_1)];
                    case 2:
                        task = _b.sent();
                        if (!task) {
                            // 删除所有已上传的文件
                            files.forEach(function (file) {
                                if (fs_1["default"].existsSync(file.path)) {
                                    fs_1["default"].unlinkSync(file.path);
                                }
                            });
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '任务不存在'
                                })];
                        }
                        console.log("\uD83D\uDD0D \u5F00\u59CB\u6279\u91CF\u5B89\u5168\u68C0\u67E5 ".concat(files.length, " \u4E2A\u6587\u4EF6"));
                        return [4 /*yield*/, Promise.all(files.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                                var securityCheck;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, file_security_1.FileSecurityChecker.performSecurityCheck(file.originalname, file.path, file.mimetype, file.size)];
                                        case 1:
                                            securityCheck = _a.sent();
                                            return [2 /*return*/, { file: file, securityCheck: securityCheck }];
                                    }
                                });
                            }); }))];
                    case 3:
                        securityResults = _b.sent();
                        unsafeFiles = securityResults.filter(function (r) { return !r.securityCheck.safe; });
                        if (unsafeFiles.length > 0) {
                            // 删除所有已上传的文件
                            files.forEach(function (file) {
                                if (fs_1["default"].existsSync(file.path)) {
                                    fs_1["default"].unlinkSync(file.path);
                                }
                            });
                            reasons = unsafeFiles.map(function (f) {
                                return "".concat(f.file.originalname, ": ").concat(f.securityCheck.reason);
                            }).join('; ');
                            console.error("\u274C \u6279\u91CF\u4E0A\u4F20\u5B89\u5168\u68C0\u67E5\u5931\u8D25: ".concat(reasons));
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: "\u6587\u4EF6\u5B89\u5168\u68C0\u67E5\u5931\u8D25",
                                    details: reasons
                                })];
                        }
                        console.log("\u2705 \u6240\u6709\u6587\u4EF6\u5B89\u5168\u68C0\u67E5\u901A\u8FC7");
                        return [4 /*yield*/, Promise.all(files.map(function (file) {
                                var fileName = file.originalname;
                                var filePath = file.path;
                                var fileSize = file.size;
                                var fileType = file.mimetype;
                                var fileExtension = path_1["default"].extname(fileName);
                                var fileUrl = "/uploads/tasks/".concat(file.filename);
                                var fileHash = file_security_1.FileSecurityChecker.calculateFileHash(filePath);
                                uploadedFiles.push(file);
                                console.log("\u2705 \u521B\u5EFA\u9644\u4EF6\u8BB0\u5F55: ".concat(fileName, ", Hash=").concat(fileHash.substring(0, 8), "..."));
                                return task_attachment_model_1.TaskAttachment.create({
                                    taskId: parseInt(taskId_1),
                                    fileName: fileName,
                                    filePath: filePath,
                                    fileUrl: fileUrl,
                                    fileSize: fileSize,
                                    fileType: fileType,
                                    fileExtension: fileExtension,
                                    uploaderId: userId_1,
                                    uploadTime: new Date(),
                                    status: 'active'
                                });
                            }))];
                    case 4:
                        attachments = _b.sent();
                        console.log("\u2705 \u6279\u91CF\u4E0A\u4F20\u6210\u529F: ".concat(attachments.length, " \u4E2A\u6587\u4EF6"));
                        res.json({
                            success: true,
                            message: "\u6210\u529F\u4E0A\u4F20 ".concat(attachments.length, " \u4E2A\u6587\u4EF6"),
                            data: attachments.map(function (att) { return ({
                                id: att.id,
                                fileName: att.fileName,
                                fileUrl: att.fileUrl,
                                fileSize: att.fileSize,
                                fileType: att.fileType,
                                uploadTime: att.uploadTime
                            }); })
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_5 = _b.sent();
                        console.error('批量上传任务附件失败:', error_5);
                        // 清理所有已上传的文件
                        if (req.files) {
                            req.files.forEach(function (file) {
                                if (fs_1["default"].existsSync(file.path)) {
                                    fs_1["default"].unlinkSync(file.path);
                                }
                            });
                        }
                        res.status(500).json({
                            success: false,
                            message: '批量上传任务附件失败',
                            error: error_5 instanceof Error ? error_5.message : '未知错误'
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return TaskAttachmentController;
}());
exports.TaskAttachmentController = TaskAttachmentController;
exports["default"] = TaskAttachmentController;
