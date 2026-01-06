// import { ValidationConfigManager } from '@/config/validation-config'
// 临时禁用验证配置管理器导入以避免编译错误

// 临时硬编码验证配置
const config = {
  name: { minLength: 2, maxLength: 50 },
  username: {
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    message: '用户名必须为3-20位字母、数字或下划线'
  },
  password: {
    minLength: 6,
    requireLetters: true,
    requireNumbers: true,
    requireSpecialChars: false,
    message: '密码至少6位，必须包含字母和数字'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入有效的邮箱地址'
  },
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的手机号码'
  },
  studentAge: {
    minAge: 3,
    maxAge: 6,
    message: '学生年龄必须在3-6岁之间'
  },
  activity: {
    title: { minLength: 2, maxLength: 100, message: '活动标题长度必须在2-100字符之间' },
    typeRange: { min: 1, max: 10, message: '活动类型必须在1-10之间' },
    location: { maxLength: 200, message: '活动地点不能超过200字符' },
    capacity: { minCapacity: 1, maxCapacity: 1000, message: '参与人数必须在1-1000之间' }
  },
  class: {
    name: { minLength: 2, maxLength: 50, message: '班级名称长度必须在2-50字符之间' },
    code: { minLength: 2, maxLength: 20, message: '班级代码长度必须在2-20字符之间' },
    validGrades: ['小班', '中班', '大班', '学前班'],
    gradeMessage: '年级必须为：小班、中班、大班或学前班',
    capacity: { minCapacity: 1, maxCapacity: 50, message: '班级人数必须在1-50之间' }
  },
  role: {
    name: { minLength: 2, maxLength: 50, message: '角色名称长度必须在2-50字符之间' },
    code: { pattern: /^[a-zA-Z0-9_]{2,20}$/, message: '角色代码必须为2-20位字母、数字或下划线' },
    description: { maxLength: 500, message: '角色描述不能超过500字符' }
  },
  id: {
    minId: 1,
    message: 'ID必须大于0'
  },
  academicYear: {
    pattern: /^\d{4}-\d{4}$/,
    message: '学年格式必须为YYYY-YYYY，如2023-2024'
  }
};

export class FormValidator {
  static validateStudentForm(data: any): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.studentNo) {
      errors.studentNo = "学号为必填项";
    }

    if (!data.name || data.name.length < config.name.minLength) {
      errors.name = `姓名至少${config.name.minLength}个字符`;
    }

    if (![0, 1, 2].includes(data.gender)) {
      errors.gender = "请选择性别";
    }

    if (!data.birthDate) {
      errors.birthDate = "出生日期为必填项";
    } else {
      const age = new Date().getFullYear() - new Date(data.birthDate).getFullYear();
      if (age < config.studentAge.minAge || age > config.studentAge.maxAge) {
        errors.birthDate = config.studentAge.message;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  static validateUserForm(data: any): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.username || !config.username.pattern.test(data.username)) {
      errors.username = config.username.message;
    }

    if (!data.password || data.password.length < config.password.minLength) {
      errors.password = config.password.message;
    } else {
      // 检查密码复杂度
      if (config.password.requireLetters && !/[a-zA-Z]/.test(data.password)) {
        errors.password = "密码必须包含字母";
      }
      if (config.password.requireNumbers && !/\d/.test(data.password)) {
        errors.password = "密码必须包含数字";
      }
    }

    if (!data.email || !config.email.pattern.test(data.email)) {
      errors.email = config.email.message;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  static validateActivityPlanForm(data: any): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.title ||
        data.title.length < config.activity.title.minLength ||
        data.title.length > config.activity.title.maxLength) {
      errors.title = config.activity.title.message;
    }

    if (!data.activityType ||
        data.activityType < config.activity.typeRange.min ||
        data.activityType > config.activity.typeRange.max) {
      errors.activityType = config.activity.typeRange.message;
    }

    if (!data.startTime) {
      errors.startTime = "开始时间为必填项";
    }

    if (!data.endTime) {
      errors.endTime = "结束时间为必填项";
    } else if (new Date(data.endTime) <= new Date(data.startTime)) {
      errors.endTime = "结束时间必须晚于开始时间";
    }

    if (!data.location || data.location.length > config.activity.location.maxLength) {
      errors.location = config.activity.location.message;
    }

    if (!data.capacity ||
        data.capacity < config.activity.capacity.minCapacity ||
        data.capacity > config.activity.capacity.maxCapacity) {
      errors.capacity = config.activity.capacity.message;
    }

    if (!data.registrationStartTime) {
      errors.registrationStartTime = "报名开始时间为必填项";
    }

    if (!data.registrationEndTime) {
      errors.registrationEndTime = "报名结束时间为必填项";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  static validateClassForm(data: any): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.name ||
        data.name.length < config.class.name.minLength ||
        data.name.length > config.class.name.maxLength) {
      errors.name = config.class.name.message;
    }

    // 添加班级代码验证（必填）
    if (!data.code ||
        data.code.length < config.class.code.minLength ||
        data.code.length > config.class.code.maxLength) {
      errors.code = config.class.code.message;
    }

    if (!data.kindergartenId || data.kindergartenId < config.id.minId) {
      errors.kindergartenId = config.id.message;
    }

    if (data.grade && !config.class.validGrades.includes(data.grade)) {
      errors.grade = config.class.gradeMessage;
    }

    if (data.capacity &&
        (data.capacity < config.class.capacity.minCapacity ||
         data.capacity > config.class.capacity.maxCapacity)) {
      errors.capacity = config.class.capacity.message;
    }

    if (data.teacherId && data.teacherId < config.id.minId) {
      errors.teacherId = config.id.message;
    }

    if (data.academicYear && !config.academicYear.pattern.test(data.academicYear)) {
      errors.academicYear = config.academicYear.message;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  static validateRoleForm(data: any): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.name ||
        data.name.length < config.role.name.minLength ||
        data.name.length > config.role.name.maxLength) {
      errors.name = config.role.name.message;
    }

    if (!data.code || !config.role.code.pattern.test(data.code)) {
      errors.code = config.role.code.message;
    }

    if (data.description && data.description.length > config.role.description.maxLength) {
      errors.description = config.role.description.message;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // 通用验证辅助方法
  static validateEmail(email: string): boolean {
    return config.email.pattern.test(email);
  }

  static validatePhone(phone: string): boolean {
    return config.phone.pattern.test(phone);
  }

  static validateUsername(username: string): boolean {
    return config.username.pattern.test(username);
  }

  static validatePassword(password: string): boolean {

    if (password.length < config.password.minLength) {
      return false;
    }

    if (config.password.requireLetters && !/[a-zA-Z]/.test(password)) {
      return false;
    }

    if (config.password.requireNumbers && !/\d/.test(password)) {
      return false;
    }

    if (config.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return false;
    }

    return true;
  }
  
  static validateDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  }
  
  static validateDateRange(startDate: string, endDate: string): boolean {
    return new Date(endDate) > new Date(startDate);
  }
  
  // 生成学号
  static generateStudentNo(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `STU${year}${month}${day}${random}`;
  }
  
  // 生成班级代码
  static generateClassCode(name: string = '', kindergartenId: number = 1): string {
    const timestamp = Date.now();
    const nameCode = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '').substring(0, 5) || 'CLASS';
    return `CLASS_${kindergartenId}_${nameCode}_${timestamp}`;
  }
  
  // 格式化错误信息为Element Plus格式
  static formatErrorsForElementPlus(errors: Record<string, string>): Array<{field: string, message: string}> {
    return Object.entries(errors).map(([field, message]) => ({
      field,
      message
    }));
  }
  
  // 将验证结果转换为表单规则
  static toFormRules(validators: Record<string, (value: any) => string | undefined>) {
    const rules: Record<string, any[]> = {};
    
    for (const [field, validator] of Object.entries(validators)) {
      rules[field] = [
        {
          validator: (_: any, value: any, callback: any) => {
            const error = validator(value);
            if (error) {
              callback(new Error(error));
            } else {
              callback();
            }
          },
          trigger: 'blur'
        }
      ];
    }
    
    return rules;
  }
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export type { ValidationResult };