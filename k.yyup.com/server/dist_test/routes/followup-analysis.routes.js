"use strict";
/**
 * 跟进质量分析路由
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var followupAnalysisController = __importStar(require("../controllers/followup-analysis.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1["default"].Router();
// 所有路由都需要认证
router.use(auth_middleware_1.authenticate);
/**
 * @route GET /api/followup/analysis
 * @desc 获取跟进质量统计
 * @access Private
 */
router.get('/analysis', followupAnalysisController.getFollowupAnalysis);
/**
 * @route POST /api/followup/ai-analysis
 * @desc AI深度分析跟进质量
 * @access Private
 */
router.post('/ai-analysis', followupAnalysisController.analyzeFollowupQuality);
/**
 * @route POST /api/followup/generate-pdf
 * @desc 生成PDF报告
 * @access Private
 */
router.post('/generate-pdf', followupAnalysisController.generatePDFReport);
exports["default"] = router;
