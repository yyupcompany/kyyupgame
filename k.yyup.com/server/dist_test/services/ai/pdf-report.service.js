"use strict";
/**
 * PDF报告生成服务
 * 生成教师跟进质量分析PDF报告
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
exports.pdfReportService = void 0;
var pdfkit_1 = __importDefault(require("pdfkit"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var followup_analysis_service_1 = require("./followup-analysis.service");
/**
 * PDF报告生成服务类
 */
var PDFReportService = /** @class */ (function () {
    function PDFReportService() {
        // 设置上传目录
        this.uploadsDir = path_1["default"].join(__dirname, '../../../uploads/reports');
        // 确保目录存在
        if (!fs_1["default"].existsSync(this.uploadsDir)) {
            fs_1["default"].mkdirSync(this.uploadsDir, { recursive: true });
        }
    }
    /**
     * 生成跟进质量分析PDF报告
     */
    PDFReportService.prototype.generateFollowupReports = function (options, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var stats, targetTeachers, aiAnalysis, pdfUrls, mergedPdfPath, _i, targetTeachers_1, teacher, pdfPath, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 11, , 12]);
                        console.log('📄 开始生成PDF报告...');
                        return [4 /*yield*/, followup_analysis_service_1.followupAnalysisService.getFollowupStatistics()];
                    case 1:
                        stats = _a.sent();
                        targetTeachers = stats.teachers.filter(function (t) {
                            return options.teacherIds.includes(t.id);
                        });
                        console.log("\uD83D\uDCC4 \u4E3A ".concat(targetTeachers.length, " \u4E2A\u6559\u5E08\u751F\u6210PDF\u62A5\u544A"));
                        aiAnalysis = null;
                        if (!options.includeAIAnalysis) return [3 /*break*/, 3];
                        console.log('📄 获取AI分析结果...');
                        return [4 /*yield*/, followup_analysis_service_1.followupAnalysisService.analyzeFollowupQuality(options.teacherIds, options.format || 'detailed', userId)];
                    case 2:
                        aiAnalysis = _a.sent();
                        _a.label = 3;
                    case 3:
                        pdfUrls = [];
                        if (!options.mergeAll) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.generateMergedPDF(targetTeachers, stats.overall, aiAnalysis, options.format)];
                    case 4:
                        mergedPdfPath = _a.sent();
                        return [2 /*return*/, {
                                pdfUrls: [],
                                mergedPdfUrl: "/uploads/reports/".concat(path_1["default"].basename(mergedPdfPath))
                            }];
                    case 5:
                        _i = 0, targetTeachers_1 = targetTeachers;
                        _a.label = 6;
                    case 6:
                        if (!(_i < targetTeachers_1.length)) return [3 /*break*/, 9];
                        teacher = targetTeachers_1[_i];
                        return [4 /*yield*/, this.generateSingleTeacherPDF(teacher, stats.overall, aiAnalysis === null || aiAnalysis === void 0 ? void 0 : aiAnalysis.teacherRecommendations[teacher.id.toString()], options.format)];
                    case 7:
                        pdfPath = _a.sent();
                        pdfUrls.push("/uploads/reports/".concat(path_1["default"].basename(pdfPath)));
                        _a.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 6];
                    case 9: return [2 /*return*/, { pdfUrls: pdfUrls }];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_1 = _a.sent();
                        console.error('❌ 生成PDF报告失败:', error_1);
                        throw new Error('生成PDF报告失败');
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成单个教师的PDF报告
     */
    PDFReportService.prototype.generateSingleTeacherPDF = function (teacher, overall, aiRecommendation, format) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, filename, filepath;
            var _this = this;
            return __generator(this, function (_a) {
                timestamp = Date.now();
                filename = "report_teacher_".concat(teacher.id, "_").concat(timestamp, ".pdf");
                filepath = path_1["default"].join(this.uploadsDir, filename);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        try {
                            // 创建PDF文档
                            var doc = new pdfkit_1["default"]({
                                size: 'A4',
                                margins: { top: 50, bottom: 50, left: 50, right: 50 }
                            });
                            // 创建写入流
                            var stream = fs_1["default"].createWriteStream(filepath);
                            doc.pipe(stream);
                            // 添加中文字体支持（需要字体文件）
                            // doc.font('path/to/chinese-font.ttf');
                            // 生成报告内容
                            _this.addReportHeader(doc, teacher);
                            _this.addOverviewSection(doc, teacher, overall);
                            if (aiRecommendation) {
                                _this.addAIAnalysisSection(doc, aiRecommendation);
                            }
                            _this.addGoalsSection(doc, aiRecommendation);
                            _this.addFooter(doc);
                            // 完成PDF
                            doc.end();
                            stream.on('finish', function () {
                                console.log("\uD83D\uDCC4 PDF\u751F\u6210\u6210\u529F: ".concat(filename));
                                resolve(filepath);
                            });
                            stream.on('error', function (error) {
                                console.error('❌ PDF写入失败:', error);
                                reject(error);
                            });
                        }
                        catch (error) {
                            console.error('❌ PDF生成失败:', error);
                            reject(error);
                        }
                    })];
            });
        });
    };
    /**
     * 生成合并的PDF报告
     */
    PDFReportService.prototype.generateMergedPDF = function (teachers, overall, aiAnalysis, format) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, filename, filepath;
            var _this = this;
            return __generator(this, function (_a) {
                timestamp = Date.now();
                filename = "report_all_teachers_".concat(timestamp, ".pdf");
                filepath = path_1["default"].join(this.uploadsDir, filename);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        try {
                            var doc_1 = new pdfkit_1["default"]({
                                size: 'A4',
                                margins: { top: 50, bottom: 50, left: 50, right: 50 }
                            });
                            var stream = fs_1["default"].createWriteStream(filepath);
                            doc_1.pipe(stream);
                            // 添加封面
                            _this.addCoverPage(doc_1, teachers.length);
                            // 添加整体统计
                            _this.addOverallStatsPage(doc_1, overall);
                            // 为每个教师添加一页
                            teachers.forEach(function (teacher, index) {
                                if (index > 0) {
                                    doc_1.addPage();
                                }
                                _this.addReportHeader(doc_1, teacher);
                                _this.addOverviewSection(doc_1, teacher, overall);
                                if (aiAnalysis) {
                                    var recommendation = aiAnalysis.teacherRecommendations[teacher.id.toString()];
                                    if (recommendation) {
                                        _this.addAIAnalysisSection(doc_1, recommendation);
                                    }
                                }
                            });
                            _this.addFooter(doc_1);
                            doc_1.end();
                            stream.on('finish', function () {
                                console.log("\uD83D\uDCC4 \u5408\u5E76PDF\u751F\u6210\u6210\u529F: ".concat(filename));
                                resolve(filepath);
                            });
                            stream.on('error', function (error) {
                                console.error('❌ 合并PDF写入失败:', error);
                                reject(error);
                            });
                        }
                        catch (error) {
                            console.error('❌ 合并PDF生成失败:', error);
                            reject(error);
                        }
                    })];
            });
        });
    };
    /**
     * 添加报告头部
     */
    PDFReportService.prototype.addReportHeader = function (doc, teacher) {
        doc.fontSize(20).text('跟进质量分析报告', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text("\u6559\u5E08\u59D3\u540D: ".concat(teacher.name));
        doc.fontSize(12).text("\u751F\u6210\u65E5\u671F: ".concat(new Date().toLocaleDateString('zh-CN')));
        doc.moveDown();
    };
    /**
     * 添加概览部分
     */
    PDFReportService.prototype.addOverviewSection = function (doc, teacher, overall) {
        doc.fontSize(14).text('一、个人跟进数据概览', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text("\u8D1F\u8D23\u5BA2\u6237\u6570: ".concat(teacher.totalCustomers, "\u4E2A (\u56E2\u961F\u5E73\u5747: ").concat(Math.round(overall.totalTeachers > 0 ? overall.totalTeachers / overall.totalTeachers : 0), "\u4E2A)"));
        doc.text("\u8DDF\u8FDB\u603B\u6B21\u6570: ".concat(teacher.followupCount, "\u6B21"));
        doc.text("\u5E73\u5747\u8DDF\u8FDB\u95F4\u9694: ".concat(teacher.avgInterval, "\u5929 (\u56E2\u961F\u5E73\u5747: ").concat(overall.avgFollowupInterval, "\u5929)"));
        doc.text("\u8F6C\u5316\u7387: ".concat(teacher.conversionRate, "% (\u56E2\u961F\u5E73\u5747: ").concat(overall.avgConversionRate, "%)"));
        doc.text("\u8D85\u671F\u672A\u8DDF\u8FDB\u5BA2\u6237: ".concat(teacher.overdueCount, "\u4E2A"));
        doc.text("\u72B6\u6001\u8BC4\u7EA7: ".concat(teacher.status));
        doc.text("\u56E2\u961F\u6392\u540D: ".concat(teacher.ranking));
        doc.moveDown();
    };
    /**
     * 添加AI分析部分
     */
    PDFReportService.prototype.addAIAnalysisSection = function (doc, recommendation) {
        doc.fontSize(14).text('二、AI诊断分析', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text("\u8BC4\u4F30: ".concat(recommendation.assessment));
        doc.moveDown(0.5);
        if (recommendation.priorityCustomers && recommendation.priorityCustomers.length > 0) {
            doc.text('优先跟进客户:', { underline: true });
            recommendation.priorityCustomers.forEach(function (customer, index) {
                doc.text("".concat(index + 1, ". ").concat(customer.name, " - ").concat(customer.reason));
                doc.text("   \u5EFA\u8BAE\u884C\u52A8: ".concat(customer.action));
            });
            doc.moveDown(0.5);
        }
        if (recommendation.improvements && recommendation.improvements.length > 0) {
            doc.text('改进建议:', { underline: true });
            recommendation.improvements.forEach(function (improvement, index) {
                doc.text("".concat(index + 1, ". ").concat(improvement));
            });
            doc.moveDown();
        }
    };
    /**
     * 添加目标部分
     */
    PDFReportService.prototype.addGoalsSection = function (doc, recommendation) {
        if (!recommendation || !recommendation.goals)
            return;
        doc.fontSize(14).text('三、本月目标', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text("\u8DDF\u8FDB\u95F4\u9694: ".concat(recommendation.goals.followupInterval));
        doc.text("\u8F6C\u5316\u7387: ".concat(recommendation.goals.conversionRate));
        doc.text("\u8D85\u671F\u5BA2\u6237: ".concat(recommendation.goals.overdueCustomers));
        doc.moveDown();
    };
    /**
     * 添加封面页
     */
    PDFReportService.prototype.addCoverPage = function (doc, teacherCount) {
        doc.fontSize(24).text('跟进质量分析报告', { align: 'center' });
        doc.moveDown(2);
        doc.fontSize(16).text("\u6559\u5E08\u4EBA\u6570: ".concat(teacherCount, "\u4EBA"), { align: 'center' });
        doc.fontSize(14).text("\u751F\u6210\u65E5\u671F: ".concat(new Date().toLocaleDateString('zh-CN')), { align: 'center' });
        doc.addPage();
    };
    /**
     * 添加整体统计页
     */
    PDFReportService.prototype.addOverallStatsPage = function (doc, overall) {
        doc.fontSize(18).text('整体统计', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12);
        doc.text("\u603B\u6559\u5E08\u6570: ".concat(overall.totalTeachers, "\u4EBA"));
        doc.text("\u5E73\u5747\u8DDF\u8FDB\u9891\u7387: ".concat(overall.avgFollowupInterval, "\u5929/\u6B21"));
        doc.text("\u5E73\u5747\u8F6C\u5316\u7387: ".concat(overall.avgConversionRate, "%"));
        doc.text("\u8D85\u671F\u672A\u8DDF\u8FDB\u5BA2\u6237: ".concat(overall.overdueCustomers, "\u4E2A"));
        doc.text("\u603B\u8DDF\u8FDB\u6B21\u6570: ".concat(overall.totalFollowups, "\u6B21"));
        doc.addPage();
    };
    /**
     * 添加页脚
     */
    PDFReportService.prototype.addFooter = function (doc) {
        var pageCount = doc.bufferedPageRange().count;
        for (var i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(10).text("\u7B2C ".concat(i + 1, " \u9875\uFF0C\u5171 ").concat(pageCount, " \u9875"), 50, doc.page.height - 50, { align: 'center' });
            doc.text("\u62A5\u544A\u751F\u6210\u65F6\u95F4: ".concat(new Date().toLocaleString('zh-CN')), 50, doc.page.height - 35, { align: 'center' });
        }
    };
    return PDFReportService;
}());
exports.pdfReportService = new PDFReportService();
exports["default"] = exports.pdfReportService;
