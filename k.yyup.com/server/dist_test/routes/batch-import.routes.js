"use strict";
/**
 * 批量导入路由
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var multer_1 = __importDefault(require("multer"));
var batch_import_controller_1 = require("../controllers/batch-import.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1["default"].Router();
// 配置multer（内存存储）
var upload = (0, multer_1["default"])({
    storage: multer_1["default"].memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: function (req, file, cb) {
        var allowedExtensions = ['.xlsx', '.xls', '.csv'];
        var ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('只支持 .xlsx, .xls, .csv 格式的文件'));
        }
    }
});
/**
 * @route POST /api/batch-import/preview
 * @desc 上传并预览导入文件
 * @access Private
 */
router.post('/preview', auth_middleware_1.verifyToken, upload.single('file'), batch_import_controller_1.batchImportController.previewImport.bind(batch_import_controller_1.batchImportController));
/**
 * @route POST /api/batch-import/customer-preview
 * @desc 客户导入预览（使用AI识别字段映射）
 * @access Private
 */
router.post('/customer-preview', auth_middleware_1.verifyToken, upload.single('file'), batch_import_controller_1.batchImportController.previewCustomerImport.bind(batch_import_controller_1.batchImportController));
/**
 * @route POST /api/batch-import/execute
 * @desc 执行批量导入
 * @access Private
 */
router.post('/execute', auth_middleware_1.verifyToken, batch_import_controller_1.batchImportController.executeImport.bind(batch_import_controller_1.batchImportController));
/**
 * @route GET /api/batch-import/template/:entityType
 * @desc 下载导入模板
 * @access Private
 */
router.get('/template/:entityType', auth_middleware_1.verifyToken, batch_import_controller_1.batchImportController.downloadTemplate.bind(batch_import_controller_1.batchImportController));
exports["default"] = router;
