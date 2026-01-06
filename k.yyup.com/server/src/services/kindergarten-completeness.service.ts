import { Kindergarten } from '../models/kindergarten.model';

/**
 * 完整度计算结果
 */
export interface CompletenessResult {
  score: number;                    // 完整度分数（0-100）
  level: string;                    // 等级：incomplete/basic/good/excellent
  missingRequired: string[];        // 缺失的必填字段
  missingRecommended: string[];     // 缺失的推荐字段
  canUseAdvancedFeatures: boolean;  // 是否可以使用高级功能
  message: string;                  // 提示信息
}

/**
 * 字段配置
 */
interface FieldConfig {
  name: string;
  label: string;
  weight: number;  // 权重
}

/**
 * 幼儿园信息完整度计算服务
 */
export class KindergartenCompletenessService {
  
  /**
   * 必填字段配置（60分）
   * 这些字段必须全部填写才能使用高级功能
   */
  private static REQUIRED_FIELDS: FieldConfig[] = [
    // 基础信息（已有）
    { name: 'name', label: '幼儿园名称', weight: 4 },
    { name: 'type', label: '幼儿园类型', weight: 4 },
    { name: 'level', label: '幼儿园等级', weight: 4 },
    { name: 'address', label: '地址', weight: 4 },
    { name: 'phone', label: '电话', weight: 4 },
    { name: 'principal', label: '园长姓名', weight: 4 },
    { name: 'establishedDate', label: '成立时间', weight: 4 },
    
    // 证照信息（新增）
    { name: 'licenseNumber', label: '办学许可证号', weight: 4 },
    { name: 'licenseIssueDate', label: '许可证发证日期', weight: 4 },
    { name: 'licenseExpiryDate', label: '许可证有效期', weight: 4 },
    
    // 规模信息（已有）
    { name: 'area', label: '占地面积', weight: 4 },
    { name: 'buildingArea', label: '建筑面积', weight: 4 },
    { name: 'classCount', label: '班级数量', weight: 4 },
    { name: 'teacherCount', label: '教师数量', weight: 4 },
    { name: 'studentCount', label: '学生数量', weight: 4 },
    
    // 人员配置（新增）
    { name: 'principalQualification', label: '园长资格证号', weight: 4 },
    { name: 'qualifiedTeacherCount', label: '持证教师数量', weight: 4 },
    
    // 行政信息（新增）
    { name: 'cityLevel', label: '城市级别', weight: 4 },
    { name: 'educationBureau', label: '主管教育局', weight: 4 },
  ];
  
  /**
   * 推荐字段配置（30分）
   * 这些字段建议填写，可提升服务质量
   */
  private static RECOMMENDED_FIELDS: FieldConfig[] = [
    // 办园条件
    { name: 'outdoorArea', label: '户外活动面积', weight: 3 },
    { name: 'classroomCount', label: '教室数量', weight: 3 },
    { name: 'activityRoomCount', label: '活动室数量', weight: 3 },
    
    // 财务信息
    { name: 'tuitionFee', label: '保教费标准', weight: 3 },
    { name: 'mealFee', label: '伙食费标准', weight: 3 },
    
    // 安全管理
    { name: 'fireControlCertified', label: '消防验收合格', weight: 3 },
    { name: 'foodLicenseNumber', label: '食品经营许可证号', weight: 3 },
    
    // 行政信息
    { name: 'supervisorName', label: '责任督学姓名', weight: 3 },
    { name: 'supervisorPhone', label: '责任督学电话', weight: 3 },
    
    // 其他信息
    { name: 'currentGrade', label: '当前等级', weight: 3 },
  ];
  
  /**
   * 可选字段配置（10分）
   * 这些字段可选填写，用于完善信息
   */
  private static OPTIONAL_FIELDS: FieldConfig[] = [
    { name: 'indoorArea', label: '室内活动面积', weight: 0.5 },
    { name: 'greenArea', label: '绿化面积', weight: 0.5 },
    { name: 'playgroundArea', label: '运动场地面积', weight: 0.5 },
    { name: 'dormitoryCount', label: '寝室数量', weight: 0.5 },
    { name: 'kitchenArea', label: '厨房面积', weight: 0.5 },
    { name: 'medicalRoomArea', label: '保健室面积', weight: 0.5 },
    { name: 'principalEducation', label: '园长学历', weight: 0.5 },
    { name: 'principalWorkYears', label: '园长工作年限', weight: 0.5 },
    { name: 'bachelorTeacherCount', label: '本科学历教师数', weight: 0.5 },
    { name: 'nurseCount', label: '保育员数', weight: 0.5 },
    { name: 'cookCount', label: '厨师数', weight: 0.5 },
    { name: 'securityCount', label: '保安数', weight: 0.5 },
    { name: 'doctorCount', label: '保健医生数', weight: 0.5 },
    { name: 'registeredCapital', label: '注册资金', weight: 0.5 },
    { name: 'annualRevenue', label: '年度收入', weight: 0.5 },
    { name: 'annualExpenditure', label: '年度支出', weight: 0.5 },
    { name: 'boardingFee', label: '住宿费标准', weight: 0.5 },
    { name: 'hasSchoolBus', label: '是否有校车', weight: 0.5 },
    { name: 'schoolBusCount', label: '校车数量', weight: 0.5 },
    { name: 'isPuhuiKindergarten', label: '是否普惠园', weight: 0.5 },
  ];
  
  /**
   * 计算幼儿园信息完整度
   */
  static calculateCompleteness(kindergarten: Kindergarten): CompletenessResult {
    let score = 0;
    const missingRequired: string[] = [];
    const missingRecommended: string[] = [];
    
    // 1. 计算必填字段得分（60分）
    this.REQUIRED_FIELDS.forEach(field => {
      const value = (kindergarten as any)[field.name];
      if (this.isFieldFilled(value)) {
        score += field.weight;
      } else {
        missingRequired.push(field.name);
      }
    });
    
    // 2. 计算推荐字段得分（30分）
    this.RECOMMENDED_FIELDS.forEach(field => {
      const value = (kindergarten as any)[field.name];
      if (this.isFieldFilled(value)) {
        score += field.weight;
      } else {
        missingRecommended.push(field.name);
      }
    });
    
    // 3. 计算可选字段得分（10分）
    this.OPTIONAL_FIELDS.forEach(field => {
      const value = (kindergarten as any)[field.name];
      if (this.isFieldFilled(value)) {
        score += field.weight;
      }
    });
    
    // 计算等级
    const level = this.getLevel(score);
    
    // 是否可以使用高级功能（必填字段全部填写）
    const canUseAdvancedFeatures = missingRequired.length === 0;
    
    // 生成提示信息
    const message = this.generateMessage(score, missingRequired.length, canUseAdvancedFeatures);
    
    return {
      score: Math.round(score),
      level,
      missingRequired,
      missingRecommended,
      canUseAdvancedFeatures,
      message
    };
  }
  
  /**
   * 判断字段是否已填写
   */
  private static isFieldFilled(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (typeof value === 'number' && value === 0) return false;
    return true;
  }
  
  /**
   * 根据分数获取等级
   */
  private static getLevel(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'basic';
    return 'incomplete';
  }
  
  /**
   * 生成提示信息
   */
  private static generateMessage(
    score: number,
    missingCount: number,
    canUseAdvancedFeatures: boolean
  ): string {
    if (canUseAdvancedFeatures) {
      if (score >= 90) {
        return '信息完善度优秀！您可以享受所有高级服务。';
      } else {
        return `信息完善度良好！建议继续完善推荐字段以获得更好的服务体验。`;
      }
    } else {
      return `请完善${missingCount}个必填字段后使用高级功能。`;
    }
  }
  
  /**
   * 获取缺失字段的友好提示
   */
  static getMissingFieldsLabels(missingFields: string[]): string[] {
    const allFields = [
      ...this.REQUIRED_FIELDS,
      ...this.RECOMMENDED_FIELDS,
      ...this.OPTIONAL_FIELDS
    ];
    
    return missingFields.map(fieldName => {
      const field = allFields.find(f => f.name === fieldName);
      return field ? field.label : fieldName;
    });
  }
  
  /**
   * 获取必填字段列表
   */
  static getRequiredFields(): FieldConfig[] {
    return this.REQUIRED_FIELDS;
  }
  
  /**
   * 获取推荐字段列表
   */
  static getRecommendedFields(): FieldConfig[] {
    return this.RECOMMENDED_FIELDS;
  }
  
  /**
   * 获取可选字段列表
   */
  static getOptionalFields(): FieldConfig[] {
    return this.OPTIONAL_FIELDS;
  }
  
  /**
   * 判断是否可以使用高级功能
   */
  static canUseAdvancedFeatures(completeness: number): boolean {
    return completeness >= 60;
  }
  
  /**
   * 获取等级描述
   */
  static getLevelDescription(level: string): string {
    const descriptions: Record<string, string> = {
      'incomplete': '信息不完整',
      'basic': '基础信息完整',
      'good': '信息较完整',
      'excellent': '信息完整'
    };
    return descriptions[level] || '未知';
  }
}

