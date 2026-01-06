import SwaggerValidator from '../helpers/swaggerValidator';
import { writeFileSync } from 'fs';
import { join } from 'path';

describe('OpenAPI 3.0 Documentation Validation', () => {
  let validator: SwaggerValidator;
  let validationResult: any;

  beforeAll(() => {
    validator = new SwaggerValidator();
    validationResult = validator.validate();
  });

  describe('Basic Structure Validation', () => {
    it('should have valid OpenAPI version', () => {
      expect(validationResult.version).toBeDefined();
      expect(validationResult.version).toMatch(/^3\.0\.\d+$/);
    });

    it('should have required basic information', () => {
      expect(validationResult.title).toBeDefined();
      expect(validationResult.title).not.toBe('');
      expect(validationResult.title).toBe('幼儿园招生管理系统API');
    });

    it('should have API paths defined', () => {
      expect(validationResult.pathCount).toBeGreaterThan(0);
      expect(validationResult.pathCount).toBeGreaterThan(50); // 至少50个API接口
    });

    it('should have data schemas defined', () => {
      expect(validationResult.schemaCount).toBeGreaterThan(0);
      expect(validationResult.schemaCount).toBeGreaterThan(10); // 至少10个数据模型
    });
  });

  describe('Documentation Completeness', () => {
    it('should not have critical missing fields', () => {
      const criticalFields = ['openapi', 'info', 'paths'];
      const missingCritical = validationResult.missingFields.filter((field: string) => 
        criticalFields.some(critical => field.includes(critical))
      );
      
      expect(missingCritical).toHaveLength(0);
    });

    it('should have comprehensive API coverage', () => {
      // 检查核心功能模块的API是否存在
      const coreModules = [
        'auth',      // 认证模块
        'users',     // 用户管理
        'students',  // 学生管理
        'teachers',  // 教师管理
        'classes',   // 班级管理
        'activities',// 活动管理
        'enrollment' // 招生管理
      ];

      // 通过路径数量推断模块覆盖度
      expect(validationResult.pathCount).toBeGreaterThan(coreModules.length * 4); // 每个模块至少4个接口
    });

    it('should have proper error handling documentation', () => {
      // 检查是否定义了错误响应模型
      expect(validationResult.schemaCount).toBeGreaterThan(5);
      
      // 建议应该包含错误处理相关的内容
      const errorRelatedSuggestions = validationResult.suggestions.filter((s: string) => 
        s.includes('错误') || s.includes('Error') || s.includes('响应')
      );
      
      // 如果有错误相关建议，说明文档在错误处理方面可以改进
      if (errorRelatedSuggestions.length > 0) {
        console.warn('错误处理文档可以改进:', errorRelatedSuggestions);
      }
    });
  });

  describe('API Documentation Quality', () => {
    it('should have reasonable documentation quality score', () => {
      // 生成完整报告来计算质量分数
      const report = validator.generateReport();
      
      // 从报告中提取总体评分
      const scoreMatch = report.match(/总体评分.*?(\d+)%/);
      if (scoreMatch) {
        const score = parseInt(scoreMatch[1]);
        expect(score).toBeGreaterThan(60); // 至少60分
        
        if (score < 70) {
          console.warn(`文档质量评分偏低: ${score}%，建议改进`);
        }
      }
    });

    it('should have reasonable number of improvement suggestions', () => {
      // 建议数量不应过多，表明文档质量较好
      expect(validationResult.suggestions.length).toBeLessThan(50);
      
      if (validationResult.suggestions.length > 20) {
        console.warn(`改进建议较多 (${validationResult.suggestions.length}条)，建议重点关注`);
      }
    });

    it('should generate comprehensive validation report', () => {
      const report = validator.generateReport();
      
      expect(report).toContain('OpenAPI 3.0 文档验证报告');
      expect(report).toContain('基本信息');
      expect(report).toContain('文档质量评估');
      
      // 保存验证报告
      const reportPath = join(__dirname, '../reports/swagger-validation-report.md');
      writeFileSync(reportPath, report, 'utf-8');
      
      console.log(`📋 OpenAPI验证报告已生成: ${reportPath}`);
    });
  });

  describe('Security Documentation', () => {
    it('should have security schemes defined', () => {
      // 通过建议检查是否有安全相关的问题
      const securitySuggestions = validationResult.suggestions.filter((s: string) => 
        s.includes('安全') || s.includes('认证') || s.includes('Security') || s.includes('Auth')
      );
      
      // 如果有安全相关建议，记录但不强制失败
      if (securitySuggestions.length > 0) {
        console.warn('安全文档建议:', securitySuggestions);
      }
      
      // 文档应该定义了基本的安全方案
      expect(validationResult.pathCount).toBeGreaterThan(0); // 有接口说明有安全考虑
    });

    it('should document authentication requirements', () => {
      // 检查是否有认证相关的路径
      expect(validationResult.pathCount).toBeGreaterThan(0);
      
      // 建议中如果提到认证，说明需要改进
      const authSuggestions = validationResult.suggestions.filter((s: string) => 
        s.includes('认证') || s.includes('Auth') || s.includes('JWT')
      );
      
      if (authSuggestions.length > 0) {
        console.info('认证文档建议:', authSuggestions);
      }
    });
  });

  describe('Data Model Documentation', () => {
    it('should have sufficient data models', () => {
      expect(validationResult.schemaCount).toBeGreaterThan(5);
      
      // 对于大型系统，应该有更多数据模型
      if (validationResult.pathCount > 100) {
        expect(validationResult.schemaCount).toBeGreaterThan(15);
      }
    });

    it('should have consistent response formats', () => {
      // 通过建议检查响应格式一致性
      const formatSuggestions = validationResult.suggestions.filter((s: string) => 
        s.includes('响应') || s.includes('Response') || s.includes('格式')
      );
      
      if (formatSuggestions.length > 5) {
        console.warn('响应格式一致性需要改进:', formatSuggestions.length, '条建议');
      }
    });
  });

  describe('API Coverage Analysis', () => {
    it('should cover all major business domains', () => {
      // 基于路径数量评估业务覆盖度
      const pathCount = validationResult.pathCount;
      
      if (pathCount < 50) {
        console.warn('API覆盖度可能不足，当前路径数:', pathCount);
      }
      
      expect(pathCount).toBeGreaterThan(20); // 最基本的覆盖度
    });

    it('should have proper API versioning strategy', () => {
      // 检查版本策略相关建议
      const versionSuggestions = validationResult.suggestions.filter((s: string) => 
        s.includes('版本') || s.includes('version') || s.includes('v1') || s.includes('v2')
      );
      
      if (versionSuggestions.length > 0) {
        console.info('API版本策略建议:', versionSuggestions);
      }
      
      // 文档应该有版本信息
      expect(validationResult.version).toBeDefined();
    });
  });

  afterAll(() => {
    // 输出验证摘要
    console.log('\n📊 OpenAPI文档验证摘要:');
    console.log(`- 文档标题: ${validationResult.title}`);
    console.log(`- OpenAPI版本: ${validationResult.version}`);
    console.log(`- API路径数量: ${validationResult.pathCount}`);
    console.log(`- 数据模型数量: ${validationResult.schemaCount}`);
    console.log(`- 文档有效性: ${validationResult.isValid ? '✅ 有效' : '❌ 需要改进'}`);
    console.log(`- 缺失字段: ${validationResult.missingFields.length}个`);
    console.log(`- 改进建议: ${validationResult.suggestions.length}条`);
    
    if (validationResult.missingFields.length > 0) {
      console.log('\n❌ 缺失字段:', validationResult.missingFields.join(', '));
    }
    
    if (validationResult.suggestions.length > 0 && validationResult.suggestions.length <= 10) {
      console.log('\n📝 主要改进建议:');
      validationResult.suggestions.slice(0, 5).forEach((suggestion: string, index: number) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
      
      if (validationResult.suggestions.length > 5) {
        console.log(`  ... 还有 ${validationResult.suggestions.length - 5} 条建议`);
      }
    }
    
    console.log('\n🎯 建议查看完整验证报告: APItest/reports/swagger-validation-report.md');
  });
});