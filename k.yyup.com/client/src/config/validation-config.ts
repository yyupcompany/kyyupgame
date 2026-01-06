/**
 * 表单验证规则配置
 * 用于统一管理系统中的验证阈值和规则
 */

export interface ValidationRule {
  min?: number;
  max?: number;
  required?: boolean;
  pattern?: RegExp;
  message?: string;
}

export interface ValidationConfig {
  // 用户名验证规则
  username: {
    minLength: number;
    maxLength: number;
    pattern: RegExp;
    message: string;
  };

  // 密码验证规则
  password: {
    minLength: number;
    requireLetters: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    message: string;
  };

  // 邮箱验证规则
  email: {
    pattern: RegExp;
    message: string;
  };

  // 手机号验证规则
  phone: {
    pattern: RegExp;
    message: string;
  };

  // 姓名验证规则
  name: {
    minLength: number;
    maxLength: number;
    message: string;
  };

  // 学生年龄验证规则
  studentAge: {
    minAge: number;
    maxAge: number;
    message: string;
  };

  // 活动相关验证规则
  activity: {
    title: {
      minLength: number;
      maxLength: number;
      message: string;
    };
    capacity: {
      minCapacity: number;
      maxCapacity: number;
      message: string;
    };
    location: {
      maxLength: number;
      message: string;
    };
    typeRange: {
      min: number;
      max: number;
      message: string;
    };
  };

  // 班级相关验证规则
  class: {
    name: {
      minLength: number;
      maxLength: number;
      message: string;
    };
    code: {
      minLength: number;
      maxLength: number;
      message: string;
    };
    capacity: {
      minCapacity: number;
      maxCapacity: number;
      message: string;
    };
    validGrades: string[];
    gradeMessage: string;
  };

  // 角色验证规则
  role: {
    name: {
      minLength: number;
      maxLength: number;
      message: string;
    };
    code: {
      pattern: RegExp;
      message: string;
    };
    description: {
      maxLength: number;
      message: string;
    };
  };

  // 通用文本验证规则
  text: {
    short: {
      maxLength: number;
      message: string;
    };
    medium: {
      maxLength: number;
      message: string;
    };
    long: {
      maxLength: number;
      message: string;
    };
  };

  // 学年验证规则
  academicYear: {
    pattern: RegExp;
    message: string;
  };

  // ID验证规则
  id: {
    minId: number;
    message: string;
  };
}

// 默认验证配置
export const defaultValidationConfig: ValidationConfig = {
  username: {
    minLength: 4,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]{4,20}$/,
    message: '用户名4-20位，只能包含字母、数字和下划线'
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

  name: {
    minLength: 2,
    maxLength: 100,
    message: '姓名长度2-100个字符'
  },

  studentAge: {
    minAge: 2,
    maxAge: 7,
    message: '年龄需在2-7岁之间'
  },

  activity: {
    title: {
      minLength: 2,
      maxLength: 100,
      message: '活动标题长度2-100个字符'
    },
    capacity: {
      minCapacity: 1,
      maxCapacity: 1000,
      message: '活动容量需在1-1000人之间'
    },
    location: {
      maxLength: 200,
      message: '活动地点最多200个字符'
    },
    typeRange: {
      min: 1,
      max: 7,
      message: '请选择有效的活动类型'
    }
  },

  class: {
    name: {
      minLength: 2,
      maxLength: 50,
      message: '班级名称长度2-50个字符'
    },
    code: {
      minLength: 3,
      maxLength: 50,
      message: '班级代码为必填项，长度3-50个字符'
    },
    capacity: {
      minCapacity: 10,
      maxCapacity: 50,
      message: '班级容量需在10-50人之间'
    },
    validGrades: ['小班', '中班', '大班'],
    gradeMessage: '请选择有效的年级（小班/中班/大班）'
  },

  role: {
    name: {
      minLength: 2,
      maxLength: 50,
      message: '角色名称长度2-50个字符'
    },
    code: {
      pattern: /^[A-Z][A-Z0-9_]*$/,
      message: '角色代码必须以大写字母开头，只能包含大写字母、数字和下划线'
    },
    description: {
      maxLength: 200,
      message: '描述最多200个字符'
    }
  },

  text: {
    short: {
      maxLength: 50,
      message: '最多50个字符'
    },
    medium: {
      maxLength: 200,
      message: '最多200个字符'
    },
    long: {
      maxLength: 1000,
      message: '最多1000个字符'
    }
  },

  academicYear: {
    pattern: /^\d{4}$/,
    message: '学年格式：4位数字'
  },

  id: {
    minId: 1,
    message: 'ID必须大于0'
  }
};

// 验证配置管理器
export class ValidationConfigManager {
  private static config: ValidationConfig = defaultValidationConfig;

  /**
   * 获取验证配置
   */
  static getConfig(): ValidationConfig {
    return this.config;
  }

  /**
   * 更新验证配置
   */
  static updateConfig(newConfig: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 重置为默认配置
   */
  static resetToDefault(): void {
    this.config = defaultValidationConfig;
  }

  /**
   * 获取用户名验证规则
   */
  static getUsernameRules(): { validator: (rule: any, value: string, callback: any) => void, trigger: string }[] {
    return [{
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error('用户名为必填项'));
          return;
        }
        if (value.length < this.config.username.minLength ||
            value.length > this.config.username.maxLength) {
          callback(new Error(this.config.username.message));
          return;
        }
        if (!this.config.username.pattern.test(value)) {
          callback(new Error(this.config.username.message));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }];
  }

  /**
   * 获取密码验证规则
   */
  static getPasswordRules(): { validator: (rule: any, value: string, callback: any) => void, trigger: string }[] {
    return [{
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error('密码为必填项'));
          return;
        }
        if (value.length < this.config.password.minLength) {
          callback(new Error(this.config.password.message));
          return;
        }
        if (this.config.password.requireLetters && !/[a-zA-Z]/.test(value)) {
          callback(new Error('密码必须包含字母'));
          return;
        }
        if (this.config.password.requireNumbers && !/\d/.test(value)) {
          callback(new Error('密码必须包含数字'));
          return;
        }
        if (this.config.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          callback(new Error('密码必须包含特殊字符'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }];
  }

  /**
   * 获取邮箱验证规则
   */
  static getEmailRules(): { validator: (rule: any, value: string, callback: any) => void, trigger: string }[] {
    return [{
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error('邮箱为必填项'));
          return;
        }
        if (!this.config.email.pattern.test(value)) {
          callback(new Error(this.config.email.message));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }];
  }

  /**
   * 获取手机号验证规则
   */
  static getPhoneRules(): { validator: (rule: any, value: string, callback: any) => void, trigger: string }[] {
    return [{
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error('手机号为必填项'));
          return;
        }
        if (!this.config.phone.pattern.test(value)) {
          callback(new Error(this.config.phone.message));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }];
  }

  /**
   * 获取姓名验证规则
   */
  static getNameRules(): { validator: (rule: any, value: string, callback: any) => void, trigger: string }[] {
    return [{
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error('姓名为必填项'));
          return;
        }
        if (value.length < this.config.name.minLength ||
            value.length > this.config.name.maxLength) {
          callback(new Error(this.config.name.message));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }];
  }
}

export default ValidationConfigManager;