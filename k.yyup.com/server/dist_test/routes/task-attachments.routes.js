"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var task_attachment_controller_1 = require("../controllers/task-attachment.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var multer_1 = __importDefault(require("multer"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var router = (0, express_1.Router)();
// 配置文件上传
var storage = multer_1["default"].diskStorage({
    destination: function (req, file, cb) {
        var uploadDir = path_1["default"].join(__dirname, '../../uploads/tasks');
        // 确保上传目录存在
        if (!fs_1["default"].existsSync(uploadDir)) {
            fs_1["default"].mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名
        var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        var ext = path_1["default"].extname(file.originalname);
        cb(null, "task-".concat(uniqueSuffix).concat(ext));
    }
});
// 文件过滤器
var fileFilter = function (req, file, cb) {
    // 允许的文件类型
    var allowedMimes = [
        // 图片
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        // 文档
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        // 视频
        'video/mp4',
        'video/avi',
        'video/quicktime',
        'video/x-msvideo'
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('不支持的文件类型'));
    }
};
// 文件大小限制
var limits = {
    fileSize: 100 * 1024 * 1024 // 100MB
};
var upload = (0, multer_1["default"])({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});
// 任务附件路由
/**
 * @route   GET /api/tasks/:taskId/attachments
 * @desc    获取任务的所有附件
 * @access  Private
 */
router.get('/tasks/:taskId/attachments', auth_middleware_1.authMiddleware, task_attachment_controller_1.TaskAttachmentController.getTaskAttachments);
/**
 * @route   POST /api/tasks/:taskId/attachments
 * @desc    上传任务附件
 * @access  Private
 */
router.post('/tasks/:taskId/attachments', auth_middleware_1.authMiddleware, upload.single('file'), task_attachment_controller_1.TaskAttachmentController.uploadTaskAttachment);
/**
 * @route   POST /api/tasks/:taskId/attachments/batch
 * @desc    批量上传任务附件
 * @access  Private
 */
router.post('/tasks/:taskId/attachments/batch', auth_middleware_1.authMiddleware, upload.array('files', 10), task_attachment_controller_1.TaskAttachmentController.batchUploadTaskAttachments);
/**
 * @route   DELETE /api/tasks/:taskId/attachments/:attachmentId
 * @desc    删除任务附件
 * @access  Private
 */
router["delete"]('/tasks/:taskId/attachments/:attachmentId', auth_middleware_1.authMiddleware, task_attachment_controller_1.TaskAttachmentController.deleteTaskAttachment);
/**
 * @route   GET /api/tasks/:taskId/attachments/:attachmentId/download
 * @desc    下载任务附件
 * @access  Private
 */
router.get('/tasks/:taskId/attachments/:attachmentId/download', auth_middleware_1.authMiddleware, task_attachment_controller_1.TaskAttachmentController.downloadTaskAttachment);
exports["default"] = router;
