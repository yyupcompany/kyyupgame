"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.FileController = exports.uploadFileMiddleware = void 0;
var apiResponse_1 = require("../utils/apiResponse");
var param_validator_1 = require("../utils/param-validator");
var multer_1 = __importDefault(require("multer"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var image_compression_service_1 = require("../services/image-compression.service");
// 临时FileService类，提供基本功能
var FileService = /** @class */ (function () {
    function FileService() {
    }
    FileService.prototype.getFileList = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 临时实现，返回空列表
                return [2 /*return*/, {
                        items: [],
                        total: 0,
                        page: params.page || 1,
                        pageSize: params.pageSize || 10,
                        totalPages: 0
                    }];
            });
        });
    };
    FileService.prototype.getFileStatistics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        totalFiles: 0,
                        totalSize: 0,
                        fileTypes: {}
                    }];
            });
        });
    };
    FileService.prototype.getStorageInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        totalSpace: 0,
                        usedSpace: 0,
                        freeSpace: 0
                    }];
            });
        });
    };
    FileService.prototype.getFileById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, null];
            });
        });
    };
    FileService.prototype.createFile = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, __assign(__assign({ id: Date.now().toString() }, data), { createdAt: new Date(), updatedAt: new Date() })];
            });
        });
    };
    FileService.prototype.updateFile = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, __assign(__assign({ id: id }, data), { updatedAt: new Date() })];
            });
        });
    };
    FileService.prototype.deleteFile = function (id, physicalDelete) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, true];
            });
        });
    };
    FileService.prototype.cleanupTempFiles = function (olderThanHours) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { deletedCount: 0, freedSpace: 0 }];
            });
        });
    };
    return FileService;
}());
// 确保上传目录存在
var uploadsPath = path_1["default"].join(__dirname, '../../../uploads/files');
if (!fs_1["default"].existsSync(uploadsPath)) {
    fs_1["default"].mkdirSync(uploadsPath, { recursive: true });
}
// Multer storage 配置
var storage = multer_1["default"].diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsPath);
    },
    filename: function (req, file, cb) {
        var uniqueSuffix = "".concat(Date.now(), "-").concat(Math.round(Math.random() * 1e9));
        var ext = path_1["default"].extname(file.originalname);
        cb(null, "file-".concat(uniqueSuffix).concat(ext));
    }
});
// 文件过滤器
var fileFilter = function (req, file, cb) {
    try {
        // 允许的文件类型
        var allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/bmp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
            'application/json',
            'application/xml',
            'text/xml'
        ];
        // 检查文件类型
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error("\u4E0D\u652F\u6301\u7684\u6587\u4EF6\u7C7B\u578B: ".concat(file.mimetype)));
            return;
        }
        // 检查文件扩展名
        var allowedExtensions = [
            '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp',
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.txt', '.csv', '.json', '.xml'
        ];
        var fileExtension = path_1["default"].extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            cb(new Error("\u4E0D\u652F\u6301\u7684\u6587\u4EF6\u6269\u5C55\u540D: ".concat(fileExtension)));
            return;
        }
        // 检查文件名长度
        if (file.originalname.length > 255) {
            cb(new Error('文件名过长，请缩短文件名'));
            return;
        }
        // 检查文件名是否包含危险字符
        var dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
        if (dangerousChars.test(file.originalname)) {
            cb(new Error('文件名包含非法字符'));
            return;
        }
        cb(null, true);
    }
    catch (error) {
        cb(new Error('文件验证失败'));
    }
};
// 创建multer实例
exports.uploadFileMiddleware = (0, multer_1["default"])({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 5 // 最多5个文件
    }
});
var FileController = /** @class */ (function () {
    function FileController() {
        var _this = this;
        /**
         * 获取文件列表
         */
        this.getFileList = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var queryParams, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        queryParams = {
                            module: req.query.module,
                            uploaderType: req.query.uploaderType,
                            uploaderId: req.query.uploaderId ? (0, param_validator_1.parseId)(req.query.uploaderId) : undefined,
                            fileType: req.query.fileType,
                            status: req.query.status,
                            keyword: req.query.keyword,
                            page: (0, param_validator_1.parsePage)(req.query.page),
                            pageSize: (0, param_validator_1.parsePageSize)(req.query.pageSize),
                            sortBy: req.query.sortBy,
                            sortOrder: req.query.sortOrder
                        };
                        return [4 /*yield*/, this.fileService.getFileList(queryParams)];
                    case 1:
                        result = _a.sent();
                        apiResponse_1.ApiResponse.success(res, result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_1, '获取文件列表失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取文件统计信息
         */
        this.getFileStatistics = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var stats, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.fileService.getFileStatistics()];
                    case 1:
                        stats = _a.sent();
                        apiResponse_1.ApiResponse.success(res, stats);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_2, '获取文件统计失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取存储空间信息
         */
        this.getStorageInfo = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var storageInfo, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.fileService.getStorageInfo()];
                    case 1:
                        storageInfo = _a.sent();
                        apiResponse_1.ApiResponse.success(res, storageInfo);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_3, '获取存储空间信息失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取文件详情
         */
        this.getFileById = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, file, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, this.fileService.getFileById(id)];
                    case 1:
                        file = _a.sent();
                        if (!file) {
                            apiResponse_1.ApiResponse.notFound(res, '文件不存在');
                            return [2 /*return*/];
                        }
                        apiResponse_1.ApiResponse.success(res, file);
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_4, '获取文件详情失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 文件上传
         */
        this.uploadFile = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var file, finalFile, compressionInfo, isImage, compressionResult, error_5, userId, userType, isPublic, metadata, fileUrl, createFileData, fileRecord, responseData, error_6;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        file = req.file;
                        if (!file) {
                            apiResponse_1.ApiResponse.badRequest(res, '未找到上传的文件');
                            return [2 /*return*/];
                        }
                        // 验证文件大小
                        if (file.size > 10 * 1024 * 1024) {
                            apiResponse_1.ApiResponse.badRequest(res, '文件大小不能超过10MB');
                            return [2 /*return*/];
                        }
                        finalFile = file;
                        compressionInfo = null;
                        isImage = file.mimetype.startsWith('image/');
                        if (!isImage) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        console.log("\uD83D\uDDBC\uFE0F \u68C0\u6D4B\u5230\u56FE\u7247\u4E0A\u4F20\uFF0C\u5F00\u59CB\u538B\u7F29: ".concat(file.originalname));
                        return [4 /*yield*/, image_compression_service_1.imageCompressionService.compressImageFile(file.path, {
                                maxWidth: 1024,
                                maxHeight: 1024,
                                quality: 80,
                                format: 'jpeg'
                            })];
                    case 2:
                        compressionResult = _c.sent();
                        // 保存压缩后的图片（覆盖原文件）
                        fs_1["default"].writeFileSync(file.path, compressionResult.buffer);
                        // 更新文件信息
                        finalFile = __assign(__assign({}, file), { size: compressionResult.compressedSize });
                        compressionInfo = {
                            originalSize: compressionResult.originalSize,
                            compressedSize: compressionResult.compressedSize,
                            compressionRatio: compressionResult.compressionRatio,
                            width: compressionResult.width,
                            height: compressionResult.height
                        };
                        console.log("\u2705 \u56FE\u7247\u538B\u7F29\u5B8C\u6210: ".concat(file.originalname));
                        console.log("   \u539F\u59CB\u5927\u5C0F: ".concat((compressionResult.originalSize / 1024).toFixed(2), " KB"));
                        console.log("   \u538B\u7F29\u5927\u5C0F: ".concat((compressionResult.compressedSize / 1024).toFixed(2), " KB"));
                        console.log("   \u538B\u7F29\u7387: ".concat(compressionResult.compressionRatio.toFixed(2), "%"));
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _c.sent();
                        console.error('图片压缩失败，使用原始文件:', error_5);
                        return [3 /*break*/, 4];
                    case 4:
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        userType = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || 'user';
                        isPublic = false;
                        metadata = null;
                        try {
                            isPublic = req.body.isPublic === 'true' || req.body.isPublic === true;
                        }
                        catch (error) {
                            console.warn('解析isPublic参数失败:', error);
                        }
                        try {
                            if (req.body.metadata && typeof req.body.metadata === 'string') {
                                metadata = JSON.parse(req.body.metadata);
                            }
                            else if (req.body.metadata && typeof req.body.metadata === 'object') {
                                metadata = req.body.metadata;
                            }
                        }
                        catch (error) {
                            console.warn('解析metadata参数失败:', error);
                            metadata = null;
                        }
                        fileUrl = "/uploads/files/".concat(file.filename);
                        createFileData = {
                            fileName: finalFile.filename,
                            originalName: finalFile.originalname,
                            filePath: finalFile.path,
                            fileSize: finalFile.size,
                            fileType: finalFile.mimetype,
                            storageType: 'local',
                            accessUrl: fileUrl,
                            isPublic: isPublic,
                            uploaderId: userId || null,
                            uploaderType: userType,
                            module: req.body.module || 'general',
                            referenceId: req.body.referenceId || null,
                            referenceType: req.body.referenceType || null,
                            metadata: compressionInfo ? __assign(__assign({}, metadata), { compression: compressionInfo }) : metadata
                        };
                        return [4 /*yield*/, this.fileService.createFile(createFileData)];
                    case 5:
                        fileRecord = _c.sent();
                        responseData = compressionInfo
                            ? __assign(__assign({}, fileRecord), { compression: compressionInfo }) : fileRecord;
                        apiResponse_1.ApiResponse.success(res, responseData, '文件上传成功', 201);
                        return [3 /*break*/, 7];
                    case 6:
                        error_6 = _c.sent();
                        // 如果是multer错误，提供更友好的错误信息
                        if (error_6 instanceof multer_1["default"].MulterError) {
                            switch (error_6.code) {
                                case 'LIMIT_FILE_SIZE':
                                    apiResponse_1.ApiResponse.badRequest(res, '文件大小超过限制（最大10MB）');
                                    return [2 /*return*/];
                                case 'LIMIT_FILE_COUNT':
                                    apiResponse_1.ApiResponse.badRequest(res, '文件数量超过限制');
                                    return [2 /*return*/];
                                case 'LIMIT_UNEXPECTED_FILE':
                                    apiResponse_1.ApiResponse.badRequest(res, '上传了意外的文件字段');
                                    return [2 /*return*/];
                                default:
                                    apiResponse_1.ApiResponse.badRequest(res, "\u6587\u4EF6\u4E0A\u4F20\u9519\u8BEF: ".concat(error_6.message));
                                    return [2 /*return*/];
                            }
                        }
                        apiResponse_1.ApiResponse.handleError(res, error_6, '文件上传失败');
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 文件下载
         */
        this.downloadFile = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, file, fullPath, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, this.fileService.getFileById(id)];
                    case 1:
                        file = _a.sent();
                        if (!file) {
                            apiResponse_1.ApiResponse.notFound(res, '文件不存在');
                            return [2 /*return*/];
                        }
                        // 检查文件是否存在于磁盘
                        if (file.storage_type === 'local') {
                            fullPath = path_1["default"].resolve(file.file_path);
                            if (!fs_1["default"].existsSync(fullPath)) {
                                apiResponse_1.ApiResponse.error(res, '文件已损坏或不存在', 'FILE_NOT_FOUND', 404);
                                return [2 /*return*/];
                            }
                            // 设置响应头
                            res.setHeader('Content-Disposition', "attachment; filename=\"".concat(encodeURIComponent(file.original_name), "\""));
                            res.setHeader('Content-Type', file.file_type);
                            res.setHeader('Content-Length', file.file_size);
                            // 发送文件
                            res.sendFile(fullPath);
                        }
                        else {
                            // 对于其他存储类型，重定向到访问URL
                            res.redirect(file.access_url);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_7, '文件下载失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 更新文件信息
         */
        this.updateFile = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, updateData_1, updatedFile, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        updateData_1 = {
                            fileName: req.body.fileName,
                            originalName: req.body.originalName,
                            isPublic: req.body.isPublic,
                            module: req.body.module,
                            referenceId: req.body.referenceId,
                            referenceType: req.body.referenceType,
                            metadata: req.body.metadata,
                            status: req.body.status
                        };
                        // 移除undefined值
                        Object.keys(updateData_1).forEach(function (key) {
                            if (updateData_1[key] === undefined) {
                                delete updateData_1[key];
                            }
                        });
                        return [4 /*yield*/, this.fileService.updateFile(id, updateData_1)];
                    case 1:
                        updatedFile = _a.sent();
                        apiResponse_1.ApiResponse.success(res, updatedFile, '文件信息更新成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_8, '更新文件信息失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 删除文件
         */
        this.deleteFile = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, physicalDelete, success, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        physicalDelete = req.query.physical === 'true';
                        return [4 /*yield*/, this.fileService.deleteFile(id, physicalDelete)];
                    case 1:
                        success = _a.sent();
                        if (success) {
                            apiResponse_1.ApiResponse.success(res, null, physicalDelete ? '文件已彻底删除' : '文件已删除');
                        }
                        else {
                            apiResponse_1.ApiResponse.error(res, '删除文件失败', 'DELETE_FAILED', 500);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_9, '删除文件失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 清理临时文件
         */
        this.cleanupTempFiles = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var olderThanHours, result, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        olderThanHours = req.query.hours ? Number(req.query.hours) : 24;
                        return [4 /*yield*/, this.fileService.cleanupTempFiles(olderThanHours)];
                    case 1:
                        result = _a.sent();
                        apiResponse_1.ApiResponse.success(res, result, "\u6E05\u7406\u5B8C\u6210\uFF0C\u5220\u9664\u4E86 ".concat(result.deletedCount, " \u4E2A\u4E34\u65F6\u6587\u4EF6\uFF0C\u91CA\u653E\u4E86 ").concat(Math.round(result.freedSpace / 1024 / 1024 * 100) / 100, " MB \u7A7A\u95F4"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_10, '清理临时文件失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 批量上传文件
         */
        this.uploadMultipleFiles = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var files, totalSize, uploadedFiles, errors, userId, userType, isPublic, metadata, _i, files_1, uploadedFile, fileUrl, createFileData, fileRecord, error_11, response, error_12;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        files = req.files;
                        if (!files || files.length === 0) {
                            apiResponse_1.ApiResponse.badRequest(res, '未找到上传的文件');
                            return [2 /*return*/];
                        }
                        // 验证文件数量
                        if (files.length > 5) {
                            apiResponse_1.ApiResponse.badRequest(res, '一次最多只能上传5个文件');
                            return [2 /*return*/];
                        }
                        totalSize = files.reduce(function (sum, file) { return sum + file.size; }, 0);
                        if (totalSize > 50 * 1024 * 1024) { // 50MB总限制
                            apiResponse_1.ApiResponse.badRequest(res, '文件总大小不能超过50MB');
                            return [2 /*return*/];
                        }
                        uploadedFiles = [];
                        errors = [];
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        userType = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || 'user';
                        isPublic = false;
                        metadata = null;
                        try {
                            isPublic = req.body.isPublic === 'true' || req.body.isPublic === true;
                        }
                        catch (error) {
                            console.warn('解析isPublic参数失败:', error);
                        }
                        try {
                            if (req.body.metadata && typeof req.body.metadata === 'string') {
                                metadata = JSON.parse(req.body.metadata);
                            }
                            else if (req.body.metadata && typeof req.body.metadata === 'object') {
                                metadata = req.body.metadata;
                            }
                        }
                        catch (error) {
                            console.warn('解析metadata参数失败:', error);
                            metadata = null;
                        }
                        _i = 0, files_1 = files;
                        _c.label = 1;
                    case 1:
                        if (!(_i < files_1.length)) return [3 /*break*/, 6];
                        uploadedFile = files_1[_i];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        // 验证单个文件大小
                        if (uploadedFile.size > 10 * 1024 * 1024) {
                            errors.push({
                                fileName: uploadedFile.originalname,
                                error: '文件大小超过10MB限制'
                            });
                            return [3 /*break*/, 5];
                        }
                        fileUrl = "/uploads/files/".concat(uploadedFile.filename);
                        createFileData = {
                            fileName: uploadedFile.filename,
                            originalName: uploadedFile.originalname,
                            filePath: uploadedFile.path,
                            fileSize: uploadedFile.size,
                            fileType: uploadedFile.mimetype,
                            storageType: 'local',
                            accessUrl: fileUrl,
                            isPublic: isPublic,
                            uploaderId: userId || null,
                            uploaderType: userType,
                            module: req.body.module || 'general',
                            referenceId: req.body.referenceId || null,
                            referenceType: req.body.referenceType || null,
                            metadata: metadata
                        };
                        return [4 /*yield*/, this.fileService.createFile(createFileData)];
                    case 3:
                        fileRecord = _c.sent();
                        uploadedFiles.push(fileRecord);
                        return [3 /*break*/, 5];
                    case 4:
                        error_11 = _c.sent();
                        errors.push({
                            fileName: uploadedFile.originalname,
                            error: error_11 instanceof Error ? error_11.message : '上传失败'
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        if (uploadedFiles.length === 0) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '所有文件上传失败', 'UPLOAD_FAILED', 400)];
                        }
                        response = {
                            files: uploadedFiles,
                            count: uploadedFiles.length,
                            totalCount: files.length
                        };
                        if (errors.length > 0) {
                            response.errors = errors;
                            apiResponse_1.ApiResponse.success(res, response, "\u90E8\u5206\u6587\u4EF6\u4E0A\u4F20\u6210\u529F: ".concat(uploadedFiles.length, "/").concat(files.length), 201);
                        }
                        else {
                            apiResponse_1.ApiResponse.success(res, response, "\u6210\u529F\u4E0A\u4F20 ".concat(uploadedFiles.length, " \u4E2A\u6587\u4EF6"), 201);
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        error_12 = _c.sent();
                        // 如果是multer错误，提供更友好的错误信息
                        if (error_12 instanceof multer_1["default"].MulterError) {
                            switch (error_12.code) {
                                case 'LIMIT_FILE_SIZE':
                                    apiResponse_1.ApiResponse.badRequest(res, '文件大小超过限制（最大10MB）');
                                    return [2 /*return*/];
                                case 'LIMIT_FILE_COUNT':
                                    apiResponse_1.ApiResponse.badRequest(res, '文件数量超过限制（最多5个文件）');
                                    return [2 /*return*/];
                                case 'LIMIT_UNEXPECTED_FILE':
                                    apiResponse_1.ApiResponse.badRequest(res, '上传了意外的文件字段');
                                    return [2 /*return*/];
                                default:
                                    apiResponse_1.ApiResponse.badRequest(res, "\u6279\u91CF\u6587\u4EF6\u4E0A\u4F20\u9519\u8BEF: ".concat(error_12.message));
                                    return [2 /*return*/];
                            }
                        }
                        apiResponse_1.ApiResponse.handleError(res, error_12, '批量文件上传失败');
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        this.fileService = new FileService();
    }
    return FileController;
}());
exports.FileController = FileController;
