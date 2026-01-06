"use strict";
/**
 * 推广海报生成服务
 * 使用Canvas API生成推广海报
 */
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
exports.PosterGenerationService = void 0;
// 暂时禁用海报生成功能以避免类型错误
// import { createCanvas, loadImage, registerFont, CanvasRenderingContext2D as NodeCanvasRenderingContext2D, Image } from 'canvas'
var qrcode_1 = __importDefault(require("qrcode"));
var path_1 = __importDefault(require("path"));
var promises_1 = __importDefault(require("fs/promises"));
var PosterGenerationService = /** @class */ (function () {
    function PosterGenerationService() {
        this.templates = new Map();
        this.outputDir = path_1["default"].join(process.cwd(), 'public', 'generated', 'posters');
        this.initializeTemplates();
        this.ensureOutputDirectory();
    }
    /**
     * 初始化海报模板
     */
    PosterGenerationService.prototype.initializeTemplates = function () {
        // 简约风格模板
        this.templates.set(1, {
            id: 1,
            name: '简约风格',
            width: 800,
            height: 1200,
            backgroundColor: '#f8f9fa',
            titleStyle: {
                fontSize: 48,
                color: '#2c3e50',
                fontWeight: 'bold',
                position: { x: 400, y: 200 }
            },
            subtitleStyle: {
                fontSize: 32,
                color: '#7f8c8d',
                position: { x: 400, y: 300 }
            },
            qrCodePosition: { x: 600, y: 800, size: 150 },
            contactPosition: { x: 400, y: 1000 }
        });
        // 温馨风格模板
        this.templates.set(2, {
            id: 2,
            name: '温馨风格',
            width: 800,
            height: 1200,
            backgroundColor: '#fef5e7',
            titleStyle: {
                fontSize: 46,
                color: '#e67e22',
                fontWeight: 'bold',
                position: { x: 400, y: 180 }
            },
            subtitleStyle: {
                fontSize: 30,
                color: '#d68910',
                position: { x: 400, y: 280 }
            },
            qrCodePosition: { x: 600, y: 780, size: 140 },
            contactPosition: { x: 400, y: 980 }
        });
        // 专业风格模板
        this.templates.set(3, {
            id: 3,
            name: '专业风格',
            width: 800,
            height: 1200,
            backgroundColor: '#1a1a1a',
            titleStyle: {
                fontSize: 50,
                color: '#ffffff',
                fontWeight: 'bold',
                position: { x: 400, y: 200 }
            },
            subtitleStyle: {
                fontSize: 34,
                color: '#ecf0f1',
                position: { x: 400, y: 300 }
            },
            qrCodePosition: { x: 600, y: 820, size: 160 },
            contactPosition: { x: 400, y: 1020 }
        });
    };
    /**
     * 确保输出目录存在
     */
    PosterGenerationService.prototype.ensureOutputDirectory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, promises_1["default"].access(this.outputDir)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        _a = _b.sent();
                        return [4 /*yield*/, promises_1["default"].mkdir(this.outputDir, { recursive: true })];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成推广海报
     */
    PosterGenerationService.prototype.generatePoster = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 暂时返回模拟数据，避免Canvas类型错误
                    console.log('生成海报请求:', params);
                    return [2 /*return*/, '/api/posters/mock-poster.png'
                        // 暂时注释掉Canvas相关代码，避免类型错误
                        /*
                        // 设置背景
                        ctx.fillStyle = template.backgroundColor
                        ctx.fillRect(0, 0, template.width, template.height)
                  
                        // 绘制装饰性背景元素
                        await this.drawBackgroundElements(ctx, template)
                  
                        // 绘制标题
                        await this.drawText(ctx, params.mainTitle, template.titleStyle, template)
                  
                        // 绘制副标题
                        await this.drawText(ctx, params.subTitle, template.subtitleStyle, template)
                  
                        // 绘制幼儿园名称（如果有）
                        if (params.kindergartenName) {
                          await this.drawKindergartenName(ctx, params.kindergartenName, template)
                        }
                  
                        // 生成并绘制二维码
                        const qrCodeDataUrl = await this.generateQRCode(params.referralLink, template.qrCodePosition.size)
                        await this.drawQRCode(ctx, qrCodeDataUrl, template.qrCodePosition)
                  
                        // 绘制联系信息
                        await this.drawContactInfo(ctx, {
                          phone: params.contactPhone,
                          address: params.address,
                          referralCode: params.referralCode
                        }, template.contactPosition)
                  
                        // 绘制装饰性边框
                        await this.drawBorder(ctx, template)
                  
                        // 保存海报
                        const filename = `referral_${params.referralCode}_${Date.now()}.png`
                        const filePath = path.join(this.outputDir, filename)
                  
                        const buffer = canvas.toBuffer('image/png')
                        await fs.writeFile(filePath, buffer)
                  
                        // 返回相对于public目录的路径
                        return `/generated/posters/${filename}`
                        */
                    ];
                    // 暂时注释掉Canvas相关代码，避免类型错误
                    /*
                    // 设置背景
                    ctx.fillStyle = template.backgroundColor
                    ctx.fillRect(0, 0, template.width, template.height)
              
                    // 绘制装饰性背景元素
                    await this.drawBackgroundElements(ctx, template)
              
                    // 绘制标题
                    await this.drawText(ctx, params.mainTitle, template.titleStyle, template)
              
                    // 绘制副标题
                    await this.drawText(ctx, params.subTitle, template.subtitleStyle, template)
              
                    // 绘制幼儿园名称（如果有）
                    if (params.kindergartenName) {
                      await this.drawKindergartenName(ctx, params.kindergartenName, template)
                    }
              
                    // 生成并绘制二维码
                    const qrCodeDataUrl = await this.generateQRCode(params.referralLink, template.qrCodePosition.size)
                    await this.drawQRCode(ctx, qrCodeDataUrl, template.qrCodePosition)
              
                    // 绘制联系信息
                    await this.drawContactInfo(ctx, {
                      phone: params.contactPhone,
                      address: params.address,
                      referralCode: params.referralCode
                    }, template.contactPosition)
              
                    // 绘制装饰性边框
                    await this.drawBorder(ctx, template)
              
                    // 保存海报
                    const filename = `referral_${params.referralCode}_${Date.now()}.png`
                    const filePath = path.join(this.outputDir, filename)
              
                    const buffer = canvas.toBuffer('image/png')
                    await fs.writeFile(filePath, buffer)
              
                    // 返回相对于public目录的路径
                    return `/generated/posters/${filename}`
                    */
                }
                catch (error) {
                    console.error('生成海报失败:', error);
                    throw new Error('海报生成失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 绘制背景装饰元素 - 暂时禁用
     */
    PosterGenerationService.prototype.drawBackgroundElements = function (ctx, template) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 绘制顶部装饰条
                ctx.fillStyle = template.backgroundColor === '#1a1a1a' ? '#ffffff20' : '#00000010';
                ctx.fillRect(0, 0, template.width, 100);
                // 绘制底部装饰条
                ctx.fillRect(0, template.height - 100, template.width, 100);
                // 绘制圆形装饰
                ctx.fillStyle = template.backgroundColor === '#1a1a1a' ? '#ffffff15' : '#00000005';
                this.drawCircle(ctx, 100, 100, 80);
                this.drawCircle(ctx, template.width - 100, 100, 60);
                this.drawCircle(ctx, 100, template.height - 100, 70);
                this.drawCircle(ctx, template.width - 100, template.height - 100, 50);
                return [2 /*return*/];
            });
        });
    };
    /**
     * 绘制圆形
     */
    PosterGenerationService.prototype.drawCircle = function (ctx, x, y, radius) {
        // 暂时禁用
        return;
    };
    /**
     * 绘制文本 - 暂时禁用
     */
    PosterGenerationService.prototype.drawText = function (ctx, text, style, template) {
        return __awaiter(this, void 0, void 0, function () {
            var maxWidthValue, words, line, y, i, testLine, metrics, testWidth;
            return __generator(this, function (_a) {
                ctx.font = "".concat(style.fontWeight || 'normal', " ").concat(style.fontSize, "px Arial, sans-serif");
                ctx.fillStyle = style.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                maxWidthValue = template.width - 100;
                words = text.split('');
                line = '';
                y = style.position.y;
                for (i = 0; i < words.length; i++) {
                    testLine = line + words[i];
                    metrics = ctx.measureText(testLine);
                    testWidth = metrics.width;
                    if (testWidth > maxWidthValue && i > 0) {
                        ctx.fillText(line, style.position.x, y);
                        line = words[i];
                        y += style.fontSize * 1.2;
                    }
                    else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, style.position.x, y);
                return [2 /*return*/];
            });
        });
    };
    /**
     * 绘制幼儿园名称
     */
    PosterGenerationService.prototype.drawKindergartenName = function (ctx, name, template) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ctx.font = 'bold 28px Arial, sans-serif';
                ctx.fillStyle = template.backgroundColor === '#1a1a1a' ? '#ffffff90' : '#00000090';
                ctx.textAlign = 'center';
                ctx.fillText(name, template.width / 2, 140);
                return [2 /*return*/];
            });
        });
    };
    /**
     * 生成二维码
     */
    PosterGenerationService.prototype.generateQRCode = function (url, size) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, qrcode_1["default"].toDataURL(url, {
                            width: size,
                            margin: 2,
                            color: {
                                dark: '#000000',
                                light: '#FFFFFF'
                            }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 绘制二维码
     */
    PosterGenerationService.prototype.drawQRCode = function (ctx, qrCodeDataUrl, position) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 暂时禁用
                return [2 /*return*/];
            });
        });
    };
    /**
     * 绘制联系信息
     */
    PosterGenerationService.prototype.drawContactInfo = function (ctx, info, position) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ctx.font = '20px Arial, sans-serif';
                ctx.fillStyle = '#333333';
                ctx.textAlign = 'center';
                // 绘制电话
                ctx.fillText("\uD83D\uDCDE ".concat(info.phone), position.x, position.y - 20);
                // 绘制地址
                ctx.font = '18px Arial, sans-serif';
                ctx.fillStyle = '#666666';
                ctx.fillText("\uD83D\uDCCD ".concat(info.address), position.x, position.y + 10);
                // 绘制推广码
                ctx.fillStyle = '#e74c3c';
                ctx.font = 'bold 16px Arial, sans-serif';
                ctx.fillText("\u63A8\u5E7F\u7801: ".concat(info.referralCode), position.x, position.y + 40);
                return [2 /*return*/];
            });
        });
    };
    /**
     * 绘制边框
     */
    PosterGenerationService.prototype.drawBorder = function (ctx, template) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ctx.strokeStyle = template.backgroundColor === '#1a1a1a' ? '#ffffff30' : '#00000020';
                ctx.lineWidth = 4;
                // 绘制圆角矩形边框
                this.drawRoundedRect(ctx, 20, 20, template.width - 40, template.height - 40, 20);
                ctx.stroke();
                return [2 /*return*/];
            });
        });
    };
    /**
     * 绘制圆角矩形
     */
    PosterGenerationService.prototype.drawRoundedRect = function (ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    };
    /**
     * 获取所有可用模板
     */
    PosterGenerationService.prototype.getAvailableTemplates = function () {
        return Array.from(this.templates.values());
    };
    /**
     * 根据ID获取模板
     */
    PosterGenerationService.prototype.getTemplateById = function (id) {
        return this.templates.get(id);
    };
    return PosterGenerationService;
}());
exports.PosterGenerationService = PosterGenerationService;
