import { readFileSync } from 'fs';
import { join } from 'path';

interface SwaggerValidationResult {
  isValid: boolean;
  version: string;
  title: string;
  pathCount: number;
  schemaCount: number;
  missingFields: string[];
  suggestions: string[];
}

export class SwaggerValidator {
  private swaggerDoc: any;
  
  constructor(swaggerPath?: string) {
    const defaultPath = join(__dirname, '../../swagger.json');
    const filePath = swaggerPath || defaultPath;
    
    try {
      const swaggerContent = readFileSync(filePath, 'utf-8');
      this.swaggerDoc = JSON.parse(swaggerContent);
    } catch (error) {
      throw new Error(`Failed to load swagger.json: ${error.message}`);
    }
  }
  
  validate(): SwaggerValidationResult {
    const result: SwaggerValidationResult = {
      isValid: true,
      version: '',
      title: '',
      pathCount: 0,
      schemaCount: 0,
      missingFields: [],
      suggestions: []
    };
    
    // 检查基本信息
    this.validateBasicInfo(result);
    
    // 检查路径
    this.validatePaths(result);
    
    // 检查组件
    this.validateComponents(result);
    
    // 检查安全定义
    this.validateSecurity(result);
    
    // 检查标签
    this.validateTags(result);
    
    result.isValid = result.missingFields.length === 0;
    
    return result;
  }
  
  private validateBasicInfo(result: SwaggerValidationResult): void {
    // 检查OpenAPI版本
    if (!this.swaggerDoc.openapi) {
      result.missingFields.push('openapi');
    } else {
      result.version = this.swaggerDoc.openapi;
      if (!this.swaggerDoc.openapi.startsWith('3.0')) {
        result.suggestions.push('建议使用OpenAPI 3.0.x版本');
      }
    }
    
    // 检查info字段
    if (!this.swaggerDoc.info) {
      result.missingFields.push('info');
    } else {
      const info = this.swaggerDoc.info;
      
      if (!info.title) {
        result.missingFields.push('info.title');
      } else {
        result.title = info.title;
      }
      
      if (!info.version) {
        result.missingFields.push('info.version');
      }
      
      if (!info.description) {
        result.suggestions.push('建议添加API描述信息');
      }
      
      if (!info.contact) {
        result.suggestions.push('建议添加联系人信息');
      }
      
      if (!info.license) {
        result.suggestions.push('建议添加许可证信息');
      }
    }
    
    // 检查servers
    if (!this.swaggerDoc.servers || !Array.isArray(this.swaggerDoc.servers) || this.swaggerDoc.servers.length === 0) {
      result.suggestions.push('建议定义服务器配置');
    }
  }
  
  private validatePaths(result: SwaggerValidationResult): void {
    if (!this.swaggerDoc.paths) {
      result.missingFields.push('paths');
      return;
    }
    
    const paths = this.swaggerDoc.paths;
    result.pathCount = Object.keys(paths).length;
    
    if (result.pathCount === 0) {
      result.missingFields.push('paths (empty)');
      return;
    }
    
    // 检查每个路径
    let missingDescriptions = 0;
    let missingResponses = 0;
    let missingParameters = 0;
    
    Object.keys(paths).forEach(pathKey => {
      const pathItem = paths[pathKey];
      
      Object.keys(pathItem).forEach(method => {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          const operation = pathItem[method];
          
          if (!operation.summary && !operation.description) {
            missingDescriptions++;
          }
          
          if (!operation.responses) {
            missingResponses++;
          } else {
            // 检查是否有200和错误响应
            if (!operation.responses['200'] && !operation.responses['201']) {
              result.suggestions.push(`${method.toUpperCase()} ${pathKey}: 建议添加成功响应定义`);
            }
            
            if (!operation.responses['400'] && !operation.responses['401'] && !operation.responses['403'] && !operation.responses['404'] && !operation.responses['500']) {
              result.suggestions.push(`${method.toUpperCase()} ${pathKey}: 建议添加错误响应定义`);
            }
          }
          
          // 检查请求体和参数定义
          if (['post', 'put', 'patch'].includes(method) && !operation.requestBody) {
            result.suggestions.push(`${method.toUpperCase()} ${pathKey}: 建议添加请求体定义`);
          }
        }
      });
    });
    
    if (missingDescriptions > 0) {
      result.suggestions.push(`有${missingDescriptions}个接口缺少描述信息`);
    }
    
    if (missingResponses > 0) {
      result.suggestions.push(`有${missingResponses}个接口缺少响应定义`);
    }
  }
  
  private validateComponents(result: SwaggerValidationResult): void {
    if (!this.swaggerDoc.components) {
      result.suggestions.push('建议添加components部分以复用组件');
      return;
    }
    
    const components = this.swaggerDoc.components;
    
    // 检查schemas
    if (!components.schemas) {
      result.suggestions.push('建议添加数据模型定义');
    } else {
      result.schemaCount = Object.keys(components.schemas).length;
      
      // 检查常用的响应模式
      const requiredSchemas = ['Error', 'SuccessResponse', 'PaginationResponse'];
      requiredSchemas.forEach(schema => {
        if (!components.schemas[schema]) {
          result.suggestions.push(`建议添加${schema}数据模型`);
        }
      });
    }
    
    // 检查安全定义
    if (!components.securitySchemes) {
      result.suggestions.push('建议添加安全认证定义');
    } else {
      if (!components.securitySchemes.bearerAuth && !components.securitySchemes.apiKey) {
        result.suggestions.push('建议添加JWT或API Key认证方式');
      }
    }
    
    // 检查参数复用
    if (!components.parameters) {
      result.suggestions.push('建议定义可复用的参数组件');
    }
    
    // 检查响应复用
    if (!components.responses) {
      result.suggestions.push('建议定义可复用的响应组件');
    }
  }
  
  private validateSecurity(result: SwaggerValidationResult): void {
    // 检查全局安全定义
    if (!this.swaggerDoc.security) {
      result.suggestions.push('建议添加全局安全策略');
    }
    
    // 检查路径级别的安全定义
    if (this.swaggerDoc.paths) {
      let unprotectedPaths = 0;
      
      Object.keys(this.swaggerDoc.paths).forEach(pathKey => {
        const pathItem = this.swaggerDoc.paths[pathKey];
        
        Object.keys(pathItem).forEach(method => {
          if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
            const operation = pathItem[method];
            
            // 检查是否为公开接口（如登录、注册）
            const isPublicEndpoint = pathKey.includes('/auth/') || 
                                   pathKey.includes('/login') || 
                                   pathKey.includes('/register');
            
            if (!isPublicEndpoint && !operation.security && !this.swaggerDoc.security) {
              unprotectedPaths++;
            }
          }
        });
      });
      
      if (unprotectedPaths > 0) {
        result.suggestions.push(`发现${unprotectedPaths}个可能需要认证保护的接口`);
      }
    }
  }
  
  private validateTags(result: SwaggerValidationResult): void {
    if (!this.swaggerDoc.tags || this.swaggerDoc.tags.length === 0) {
      result.suggestions.push('建议添加标签组织API接口');
      return;
    }
    
    const definedTags = this.swaggerDoc.tags.map((tag: any) => tag.name);
    const usedTags = new Set<string>();
    
    // 收集路径中使用的标签
    if (this.swaggerDoc.paths) {
      Object.keys(this.swaggerDoc.paths).forEach(pathKey => {
        const pathItem = this.swaggerDoc.paths[pathKey];
        
        Object.keys(pathItem).forEach(method => {
          if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
            const operation = pathItem[method];
            
            if (operation.tags) {
              operation.tags.forEach((tag: string) => usedTags.add(tag));
            }
          }
        });
      });
    }
    
    // 检查未使用的标签
    const unusedTags = definedTags.filter((tag: string) => !usedTags.has(tag));
    if (unusedTags.length > 0) {
      result.suggestions.push(`发现未使用的标签: ${unusedTags.join(', ')}`);
    }
    
    // 检查未定义的标签
    const undefinedTags = Array.from(usedTags).filter(tag => !definedTags.includes(tag));
    if (undefinedTags.length > 0) {
      result.suggestions.push(`发现未定义的标签: ${undefinedTags.join(', ')}`);
    }
  }
  
  // 生成改进建议报告
  generateReport(): string {
    const validation = this.validate();
    
    let report = `# OpenAPI 3.0 文档验证报告\n\n`;
    
    report += `## 基本信息\n`;
    report += `- **文档标题**: ${validation.title || '未定义'}\n`;
    report += `- **OpenAPI版本**: ${validation.version || '未定义'}\n`;
    report += `- **API路径数量**: ${validation.pathCount}\n`;
    report += `- **数据模型数量**: ${validation.schemaCount}\n`;
    report += `- **文档状态**: ${validation.isValid ? '✅ 有效' : '❌ 存在问题'}\n\n`;
    
    if (validation.missingFields.length > 0) {
      report += `## ❌ 必需字段缺失\n\n`;
      validation.missingFields.forEach(field => {
        report += `- \`${field}\`: 必需字段，请添加\n`;
      });
      report += `\n`;
    }
    
    if (validation.suggestions.length > 0) {
      report += `## 📝 改进建议\n\n`;
      validation.suggestions.forEach((suggestion, index) => {
        report += `${index + 1}. ${suggestion}\n`;
      });
      report += `\n`;
    }
    
    report += `## 📊 文档质量评估\n\n`;
    
    const completeness = this.calculateCompleteness(validation);
    report += `- **完整性**: ${completeness}%\n`;
    
    const consistency = this.calculateConsistency();
    report += `- **一致性**: ${consistency}%\n`;
    
    const usability = this.calculateUsability(validation);
    report += `- **可用性**: ${usability}%\n`;
    
    const overallScore = Math.round((completeness + consistency + usability) / 3);
    report += `- **总体评分**: ${overallScore}%\n\n`;
    
    report += this.generateRecommendations(overallScore);
    
    return report;
  }
  
  private calculateCompleteness(validation: SwaggerValidationResult): number {
    let score = 100;
    
    // 基本信息扣分
    score -= validation.missingFields.length * 10;
    
    // 路径数量评估
    if (validation.pathCount === 0) {
      score -= 50;
    } else if (validation.pathCount < 10) {
      score -= 10;
    }
    
    // 数据模型评估
    if (validation.schemaCount === 0) {
      score -= 20;
    } else if (validation.schemaCount < 5) {
      score -= 5;
    }
    
    return Math.max(0, score);
  }
  
  private calculateConsistency(): number {
    // 检查命名一致性、响应格式一致性等
    let score = 100;
    
    // 这里可以添加更多一致性检查逻辑
    // 例如：检查所有接口是否使用相同的错误响应格式
    
    return score;
  }
  
  private calculateUsability(validation: SwaggerValidationResult): number {
    let score = 100;
    
    // 建议数量评估（建议越少，可用性越高）
    score -= Math.min(50, validation.suggestions.length * 2);
    
    return Math.max(0, score);
  }
  
  private generateRecommendations(score: number): string {
    let recommendations = `## 🎯 具体建议\n\n`;
    
    if (score >= 90) {
      recommendations += `文档质量优秀！建议：\n`;
      recommendations += `- 定期更新文档与代码同步\n`;
      recommendations += `- 添加更多使用示例\n`;
      recommendations += `- 考虑添加API变更日志\n`;
    } else if (score >= 70) {
      recommendations += `文档质量良好，建议：\n`;
      recommendations += `- 完善缺失的字段和描述\n`;
      recommendations += `- 统一响应格式\n`;
      recommendations += `- 添加更多错误代码说明\n`;
    } else if (score >= 50) {
      recommendations += `文档需要改进，建议：\n`;
      recommendations += `- 补充基本的API信息\n`;
      recommendations += `- 添加数据模型定义\n`;
      recommendations += `- 完善安全认证说明\n`;
    } else {
      recommendations += `文档质量较低，急需改进：\n`;
      recommendations += `- 添加所有必需的基本信息\n`;
      recommendations += `- 定义完整的数据模型\n`;
      recommendations += `- 添加详细的接口说明\n`;
      recommendations += `- 统一错误处理和响应格式\n`;
    }
    
    return recommendations;
  }
}

export default SwaggerValidator;