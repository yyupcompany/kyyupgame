"use strict";
/**
 * 图片压缩服务
 * 用于在发送给AI模型前压缩图片，减少token消耗
 */
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
exports.imageCompressionService = void 0;
var sharp_1 = __importDefault(require("sharp"));
var fs = __importStar(require("fs"));
var util_1 = require("util");
var readFileAsync = (0, util_1.promisify)(fs.readFile);
var writeFileAsync = (0, util_1.promisify)(fs.writeFile);
var ImageCompressionService = /** @class */ (function () {
    function ImageCompressionService() {
        /**
         * 默认压缩选项
         */
        this.defaultOptions = {
            maxWidth: 1024,
            maxHeight: 1024,
            quality: 80,
            format: 'jpeg',
            preserveAspectRatio: true
        };
    }
    /**
     * 压缩图片文件
     * @param filePath 图片文件路径
     * @param options 压缩选项
     * @returns 压缩结果
     */
    ImageCompressionService.prototype.compressImageFile = function (filePath, options) {
        return __awaiter(this, void 0, void 0, function () {
            var originalBuffer, originalSize, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, readFileAsync(filePath)];
                    case 1:
                        originalBuffer = _a.sent();
                        originalSize = originalBuffer.length;
                        return [4 /*yield*/, this.compressImageBuffer(originalBuffer, options)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, result), { originalSize: originalSize })];
                    case 3:
                        error_1 = _a.sent();
                        console.error('图片压缩失败:', error_1);
                        throw new Error("\u56FE\u7247\u538B\u7F29\u5931\u8D25: ".concat(error_1.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 压缩图片Buffer
     * @param buffer 图片Buffer
     * @param options 压缩选项
     * @returns 压缩结果
     */
    ImageCompressionService.prototype.compressImageBuffer = function (buffer, options) {
        return __awaiter(this, void 0, void 0, function () {
            var opts, originalSize, metadata, originalWidth, originalHeight, targetWidth, targetHeight, widthRatio, heightRatio, ratio, sharpInstance, compressedBuffer, compressedSize, compressionRatio, base64, base64WithPrefix, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        opts = __assign(__assign({}, this.defaultOptions), options);
                        originalSize = buffer.length;
                        return [4 /*yield*/, (0, sharp_1["default"])(buffer).metadata()];
                    case 1:
                        metadata = _a.sent();
                        originalWidth = metadata.width || 0;
                        originalHeight = metadata.height || 0;
                        targetWidth = originalWidth;
                        targetHeight = originalHeight;
                        if (opts.preserveAspectRatio) {
                            // 保持宽高比
                            if (originalWidth > opts.maxWidth || originalHeight > opts.maxHeight) {
                                widthRatio = opts.maxWidth / originalWidth;
                                heightRatio = opts.maxHeight / originalHeight;
                                ratio = Math.min(widthRatio, heightRatio);
                                targetWidth = Math.round(originalWidth * ratio);
                                targetHeight = Math.round(originalHeight * ratio);
                            }
                        }
                        else {
                            // 不保持宽高比
                            targetWidth = Math.min(originalWidth, opts.maxWidth);
                            targetHeight = Math.min(originalHeight, opts.maxHeight);
                        }
                        sharpInstance = (0, sharp_1["default"])(buffer)
                            .resize(targetWidth, targetHeight, {
                            fit: opts.preserveAspectRatio ? 'inside' : 'fill',
                            withoutEnlargement: true
                        });
                        // 根据格式设置压缩选项
                        switch (opts.format) {
                            case 'jpeg':
                                sharpInstance = sharpInstance.jpeg({
                                    quality: opts.quality,
                                    progressive: true,
                                    mozjpeg: true
                                });
                                break;
                            case 'png':
                                sharpInstance = sharpInstance.png({
                                    quality: opts.quality,
                                    compressionLevel: 9,
                                    progressive: true
                                });
                                break;
                            case 'webp':
                                sharpInstance = sharpInstance.webp({
                                    quality: opts.quality,
                                    effort: 6
                                });
                                break;
                        }
                        return [4 /*yield*/, sharpInstance.toBuffer()];
                    case 2:
                        compressedBuffer = _a.sent();
                        compressedSize = compressedBuffer.length;
                        compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
                        base64 = compressedBuffer.toString('base64');
                        base64WithPrefix = "data:image/".concat(opts.format, ";base64,").concat(base64);
                        console.log("\u2705 \u56FE\u7247\u538B\u7F29\u6210\u529F:");
                        console.log("   \u539F\u59CB\u5C3A\u5BF8: ".concat(originalWidth, "x").concat(originalHeight));
                        console.log("   \u538B\u7F29\u5C3A\u5BF8: ".concat(targetWidth, "x").concat(targetHeight));
                        console.log("   \u539F\u59CB\u5927\u5C0F: ".concat((originalSize / 1024).toFixed(2), " KB"));
                        console.log("   \u538B\u7F29\u5927\u5C0F: ".concat((compressedSize / 1024).toFixed(2), " KB"));
                        console.log("   \u538B\u7F29\u7387: ".concat(compressionRatio.toFixed(2), "%"));
                        return [2 /*return*/, {
                                buffer: compressedBuffer,
                                base64: base64WithPrefix,
                                originalSize: originalSize,
                                compressedSize: compressedSize,
                                compressionRatio: compressionRatio,
                                width: targetWidth,
                                height: targetHeight,
                                format: opts.format
                            }];
                    case 3:
                        error_2 = _a.sent();
                        console.error('图片压缩失败:', error_2);
                        throw new Error("\u56FE\u7247\u538B\u7F29\u5931\u8D25: ".concat(error_2.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 压缩图片并保存到文件
     * @param inputPath 输入文件路径
     * @param outputPath 输出文件路径
     * @param options 压缩选项
     * @returns 压缩结果
     */
    ImageCompressionService.prototype.compressAndSave = function (inputPath, outputPath, options) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.compressImageFile(inputPath, options)];
                    case 1:
                        result = _a.sent();
                        // 保存压缩后的图片
                        return [4 /*yield*/, writeFileAsync(outputPath, result.buffer)];
                    case 2:
                        // 保存压缩后的图片
                        _a.sent();
                        console.log("\u2705 \u538B\u7F29\u56FE\u7247\u5DF2\u4FDD\u5B58\u5230: ".concat(outputPath));
                        return [2 /*return*/, result];
                    case 3:
                        error_3 = _a.sent();
                        console.error('图片压缩并保存失败:', error_3);
                        throw new Error("\u56FE\u7247\u538B\u7F29\u5E76\u4FDD\u5B58\u5931\u8D25: ".concat(error_3.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量压缩图片
     * @param filePaths 图片文件路径数组
     * @param options 压缩选项
     * @returns 压缩结果数组
     */
    ImageCompressionService.prototype.compressBatch = function (filePaths, options) {
        return __awaiter(this, void 0, void 0, function () {
            var results, totalOriginalSize, totalCompressedSize, totalCompressionRatio, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all(filePaths.map(function (filePath) { return _this.compressImageFile(filePath, options); }))];
                    case 1:
                        results = _a.sent();
                        totalOriginalSize = results.reduce(function (sum, r) { return sum + r.originalSize; }, 0);
                        totalCompressedSize = results.reduce(function (sum, r) { return sum + r.compressedSize; }, 0);
                        totalCompressionRatio = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100;
                        console.log("\u2705 \u6279\u91CF\u538B\u7F29\u5B8C\u6210:");
                        console.log("   \u6587\u4EF6\u6570\u91CF: ".concat(results.length));
                        console.log("   \u603B\u539F\u59CB\u5927\u5C0F: ".concat((totalOriginalSize / 1024).toFixed(2), " KB"));
                        console.log("   \u603B\u538B\u7F29\u5927\u5C0F: ".concat((totalCompressedSize / 1024).toFixed(2), " KB"));
                        console.log("   \u603B\u538B\u7F29\u7387: ".concat(totalCompressionRatio.toFixed(2), "%"));
                        return [2 /*return*/, results];
                    case 2:
                        error_4 = _a.sent();
                        console.error('批量压缩失败:', error_4);
                        throw new Error("\u6279\u91CF\u538B\u7F29\u5931\u8D25: ".concat(error_4.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ImageCompressionService;
}());
// 导出单例
exports.imageCompressionService = new ImageCompressionService();
exports["default"] = exports.imageCompressionService;
