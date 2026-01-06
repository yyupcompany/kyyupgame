/**
 * AI操作器统一导出
 * 使用原始的统一智能服务文件
 */

// 直接导入新的统一智能服务
import { UnifiedIntelligenceService } from './unified-intelligence.service';

// 创建服务实例
const unifiedIntelligenceService = new UnifiedIntelligenceService();

// 导出服务
export { UnifiedIntelligenceService, unifiedIntelligenceService };
export default unifiedIntelligenceService;