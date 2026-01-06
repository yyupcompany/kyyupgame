import { DataTypes, Model, Optional } from 'sequelize';
// import { sequelize } from '../init'; // 将在初始化时传入
// import { User } from './user.model'; // 延迟关联，避免循环依赖

// 脑科学课程属性接口
export interface BrainScienceCourseAttributes {
  id: number;
  course_name: string;
  course_description?: string;
  course_type: 'core' | 'extended' | 'special';
  target_age_min?: number;
  target_age_max?: number;
  duration_minutes?: number;
  frequency_per_week: number;
  objectives?: any;
  materials?: any;
  difficulty_level: number;
  prerequisites?: any;
  is_active: boolean;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

// 创建时的可选属性
export interface BrainScienceCourseCreationAttributes 
  extends Optional<BrainScienceCourseAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 脑科学课程模型类
export class BrainScienceCourse extends Model<BrainScienceCourseAttributes, BrainScienceCourseCreationAttributes>
  implements BrainScienceCourseAttributes {
  
  public id!: number;
  public course_name!: string;
  public course_description?: string;
  public course_type!: 'core' | 'extended' | 'special';
  public target_age_min?: number;
  public target_age_max?: number;
  public duration_minutes?: number;
  public frequency_per_week!: number;
  public objectives?: any;
  public materials?: any;
  public difficulty_level!: number;
  public prerequisites?: any;
  public is_active!: boolean;
  public created_by?: number;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联属性
  public creator?: any; // 使用any类型避免循环依赖，通过延迟加载

  // 静态关联方法 - 延迟关联，在init.ts中设置
  public static associate() {
    // 关联将在init.ts中通过require延迟设置
    // 避免循环依赖问题
  }

  // 实例方法：获取适用年龄范围描述
  public getAgeRangeDescription(): string {
    if (!this.target_age_min && !this.target_age_max) {
      return '不限年龄';
    }
    if (this.target_age_min && this.target_age_max) {
      return `${this.target_age_min}-${this.target_age_max}个月`;
    }
    if (this.target_age_min) {
      return `${this.target_age_min}个月以上`;
    }
    if (this.target_age_max) {
      return `${this.target_age_max}个月以下`;
    }
    return '不限年龄';
  }

  // 实例方法：获取课程类型描述
  public getCourseTypeDescription(): string {
    const typeMap = {
      'core': '核心课程',
      'extended': '扩展课程',
      'special': '特色课程'
    };
    return typeMap[this.course_type] || '未知类型';
  }

  // 实例方法：获取难度等级描述
  public getDifficultyDescription(): string {
    const difficultyMap = {
      1: '入门',
      2: '初级',
      3: '中级',
      4: '高级',
      5: '专家'
    };
    return difficultyMap[this.difficulty_level as keyof typeof difficultyMap] || '未知难度';
  }

  // 实例方法：检查是否适合指定年龄
  public isAgeAppropriate(ageInMonths: number): boolean {
    if (!this.target_age_min && !this.target_age_max) {
      return true; // 不限年龄
    }
    if (this.target_age_min && ageInMonths < this.target_age_min) {
      return false;
    }
    if (this.target_age_max && ageInMonths > this.target_age_max) {
      return false;
    }
    return true;
  }
}

// 初始化模型函数
export const initBrainScienceCourseModel = (sequelizeInstance: any) => {
  BrainScienceCourse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '课程ID'
    },
    course_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '课程名称'
    },
    course_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '课程描述'
    },
    course_type: {
      type: DataTypes.ENUM('core', 'extended', 'special'),
      defaultValue: 'core',
      comment: '课程类型：核心课程、扩展课程、特色课程'
    },
    target_age_min: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '适用最小年龄（月）'
    },
    target_age_max: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '适用最大年龄（月）'
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '课程时长（分钟）'
    },
    frequency_per_week: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '每周频次'
    },
    objectives: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '课程目标（JSON格式）'
    },
    materials: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '所需材料（JSON格式）'
    },
    difficulty_level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '难度等级（1-5）'
    },
    prerequisites: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '前置课程要求（JSON格式）'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '创建者ID'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '创建时间'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '更新时间'
    }
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'BrainScienceCourse',
    tableName: 'brain_science_courses',
    timestamps: true,
    underscored: true,
    comment: '脑科学课程表'
  }
);
};

export default BrainScienceCourse;
