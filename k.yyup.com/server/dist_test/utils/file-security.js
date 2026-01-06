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
exports.FileSecurityChecker = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var crypto_1 = __importDefault(require("crypto"));
/**
 * 文件安全检测工具类
 */
var FileSecurityChecker = /** @class */ (function () {
    function FileSecurityChecker() {
    }
    /**
     * 检查文件名是否安全
     */
    FileSecurityChecker.isFileNameSafe = function (filename) {
        // 检查路径遍历攻击
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return { safe: false, reason: '文件名包含非法路径字符' };
        }
        // 检查空字节注入
        if (filename.includes('\0')) {
            return { safe: false, reason: '文件名包含空字节' };
        }
        // 检查文件名长度
        if (filename.length > 255) {
            return { safe: false, reason: '文件名过长' };
        }
        // 检查是否包含特殊字符
        var invalidChars = /[<>:"|?*]/;
        if (invalidChars.test(filename)) {
            return { safe: false, reason: '文件名包含非法字符' };
        }
        // 检查双重扩展名
        var parts = filename.split('.');
        if (parts.length > 2) {
            var secondExt = '.' + parts[parts.length - 2].toLowerCase();
            if (this.DANGEROUS_EXTENSIONS.includes(secondExt)) {
                return { safe: false, reason: '检测到双重扩展名攻击' };
            }
        }
        // 检查危险扩展名
        var ext = path_1["default"].extname(filename).toLowerCase();
        if (this.DANGEROUS_EXTENSIONS.includes(ext)) {
            return { safe: false, reason: "\u4E0D\u5141\u8BB8\u4E0A\u4F20 ".concat(ext, " \u7C7B\u578B\u7684\u6587\u4EF6") };
        }
        return { safe: true };
    };
    /**
     * 检查MIME类型是否允许
     */
    FileSecurityChecker.isMimeTypeAllowed = function (mimeType) {
        if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
            return { allowed: false, reason: "\u4E0D\u5141\u8BB8\u7684\u6587\u4EF6\u7C7B\u578B: ".concat(mimeType) };
        }
        return { allowed: true };
    };
    /**
     * 检查文件内容是否安全（通过文件签名）
     */
    FileSecurityChecker.isFileContentSafe = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var buffer, fd, _i, _a, _b, signature, description;
            return __generator(this, function (_c) {
                try {
                    buffer = Buffer.alloc(8);
                    fd = fs_1["default"].openSync(filePath, 'r');
                    fs_1["default"].readSync(fd, buffer, 0, 8, 0);
                    fs_1["default"].closeSync(fd);
                    // 检查危险的文件签名
                    for (_i = 0, _a = this.DANGEROUS_SIGNATURES; _i < _a.length; _i++) {
                        _b = _a[_i], signature = _b.signature, description = _b.description;
                        if (buffer.slice(0, signature.length).equals(signature)) {
                            return [2 /*return*/, { safe: false, reason: "\u68C0\u6D4B\u5230\u53EF\u6267\u884C\u6587\u4EF6\u7B7E\u540D: ".concat(description) }];
                        }
                    }
                    return [2 /*return*/, { safe: true }];
                }
                catch (error) {
                    return [2 /*return*/, { safe: false, reason: '无法读取文件内容' }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 检查文件大小是否在允许范围内
     */
    FileSecurityChecker.isFileSizeValid = function (fileSize, mimeType) {
        var maxSizes = {
            'image': 10 * 1024 * 1024,
            'application': 20 * 1024 * 1024,
            'text': 20 * 1024 * 1024,
            'video': 100 * 1024 * 1024 // 100MB
        };
        var category = mimeType.split('/')[0];
        var maxSize = maxSizes[category] || 20 * 1024 * 1024;
        if (fileSize > maxSize) {
            return {
                valid: false,
                reason: "\u6587\u4EF6\u5927\u5C0F\u8D85\u8FC7\u9650\u5236 (\u6700\u5927 ".concat(Math.round(maxSize / 1024 / 1024), "MB)")
            };
        }
        return { valid: true };
    };
    /**
     * 扫描文件内容中的恶意代码模式
     */
    FileSecurityChecker.scanForMaliciousContent = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var content, maliciousPatterns, _i, maliciousPatterns_1, pattern;
            return __generator(this, function (_a) {
                try {
                    content = fs_1["default"].readFileSync(filePath, 'utf8');
                    maliciousPatterns = [
                        /<script[^>]*>[\s\S]*?<\/script>/gi,
                        /javascript:/gi,
                        /on\w+\s*=\s*["'][^"']*["']/gi,
                        /eval\s*\(/gi,
                        /exec\s*\(/gi,
                        /system\s*\(/gi,
                        /<iframe[^>]*>/gi,
                        /<embed[^>]*>/gi,
                        /<object[^>]*>/gi, // object标签
                    ];
                    for (_i = 0, maliciousPatterns_1 = maliciousPatterns; _i < maliciousPatterns_1.length; _i++) {
                        pattern = maliciousPatterns_1[_i];
                        if (pattern.test(content)) {
                            return [2 /*return*/, { safe: false, reason: '检测到潜在的恶意代码' }];
                        }
                    }
                    return [2 /*return*/, { safe: true }];
                }
                catch (error) {
                    // 如果文件不是文本文件，会抛出错误，这是正常的
                    return [2 /*return*/, { safe: true }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 计算文件的SHA256哈希值
     */
    FileSecurityChecker.calculateFileHash = function (filePath) {
        var fileBuffer = fs_1["default"].readFileSync(filePath);
        var hashSum = crypto_1["default"].createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    };
    /**
     * 综合安全检查
     */
    FileSecurityChecker.performSecurityCheck = function (filename, filePath, mimeType, fileSize) {
        return __awaiter(this, void 0, void 0, function () {
            var filenameCheck, mimeCheck, sizeCheck, contentCheck, maliciousCheck;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filenameCheck = this.isFileNameSafe(filename);
                        if (!filenameCheck.safe) {
                            return [2 /*return*/, filenameCheck];
                        }
                        mimeCheck = this.isMimeTypeAllowed(mimeType);
                        if (!mimeCheck.allowed) {
                            return [2 /*return*/, { safe: false, reason: mimeCheck.reason }];
                        }
                        sizeCheck = this.isFileSizeValid(fileSize, mimeType);
                        if (!sizeCheck.valid) {
                            return [2 /*return*/, { safe: false, reason: sizeCheck.reason }];
                        }
                        return [4 /*yield*/, this.isFileContentSafe(filePath)];
                    case 1:
                        contentCheck = _a.sent();
                        if (!contentCheck.safe) {
                            return [2 /*return*/, contentCheck];
                        }
                        if (!(mimeType.startsWith('text/') || mimeType.includes('html'))) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.scanForMaliciousContent(filePath)];
                    case 2:
                        maliciousCheck = _a.sent();
                        if (!maliciousCheck.safe) {
                            return [2 /*return*/, maliciousCheck];
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/, { safe: true }];
                }
            });
        });
    };
    /**
     * 生成安全的文件名
     */
    FileSecurityChecker.generateSafeFilename = function (originalFilename) {
        var ext = path_1["default"].extname(originalFilename);
        var timestamp = Date.now();
        var random = Math.round(Math.random() * 1E9);
        return "task-".concat(timestamp, "-").concat(random).concat(ext);
    };
    /**
     * 清理文件名（移除危险字符）
     */
    FileSecurityChecker.sanitizeFilename = function (filename) {
        return filename
            .replace(/[^a-zA-Z0-9._-]/g, '_') // 替换非法字符
            .replace(/\.{2,}/g, '.') // 移除连续的点
            .replace(/^\.+/, '') // 移除开头的点
            .substring(0, 255); // 限制长度
    };
    // 危险的文件扩展名黑名单
    FileSecurityChecker.DANGEROUS_EXTENSIONS = [
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
        '.msi', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.sh', '.bash', '.zsh',
        '.ps1', '.psm1', '.dll', '.so', '.dylib', '.sys', '.drv'
    ];
    // 允许的MIME类型白名单
    FileSecurityChecker.ALLOWED_MIME_TYPES = [
        // 图片
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
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
        'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv'
    ];
    // 危险的文件签名（魔数）
    FileSecurityChecker.DANGEROUS_SIGNATURES = [
        { signature: Buffer.from([0x4D, 0x5A]), description: 'PE/EXE' },
        { signature: Buffer.from([0x7F, 0x45, 0x4C, 0x46]), description: 'ELF' },
        { signature: Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]), description: 'Mach-O' },
        { signature: Buffer.from([0x23, 0x21]), description: 'Script' }, // #! (Shell script)
    ];
    return FileSecurityChecker;
}());
exports.FileSecurityChecker = FileSecurityChecker;
exports["default"] = FileSecurityChecker;
