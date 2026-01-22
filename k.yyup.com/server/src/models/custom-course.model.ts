import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';

/**
 * 自定义课程属性接口
 */
export interface CustomCourseAttributes {
  id: number;
  course_name: string;
  course_description?: string;
  course_type: 'brain_science' | 'custom' | 'theme';
  age_group: string;  // 3-4, 4-5, 5-6
  semester: string;
  academic_year: string;
  status: 'draft' | 'published' | 'archived';
  thumbnail_url?: string;
  
  // 四进度配置（脑科学课程专用）
  progress_config?: {
    indoor_weeks: number;      // 室内课周数
    outdoor_weeks: number;     // 户外课周数
    display_count: number;     // 校外展示次数
    championship_count: number; // 锦标赛次数
  };
  
  // 课程目标
  objectives?: string;
  
  // 适用班级类型
  target_class_type?: string;
  
  // 总课时数
  total_sessions?: number;
  
  // 每节课时长（分钟）
  session_duration?: number;
  
  created_by: number;
  kindergarten_id?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * 创建时的可选属性
 */
export interface CustomCourseCreationAttributes
  extends Optional<CustomCourseAttributes, 'id' | 'created_at' | 'updated_at' | 'is_active'> {}

/**
 * 自定义课程模型类
 */
export class CustomCourse extends Model<CustomCourseAttributes, CustomCourseCreationAttributes>
  implements CustomCourseAttributes {
  
  public id!: number;
  public course_name!: string;
  public course_description?: string;
  public course_type!: 'brain_science' | 'custom' | 'theme';
  public age_group!: string;
  public semester!: string;
  public academic_year!: string;
  public status!: 'draft' | 'published' | 'archived';
  public thumbnail_url?: string;
  public progress_config?: {
    indoor_weeks: number;
    outdoor_weeks: number;
    display_count: number;
    championship_count: number;
  };
  public objectives?: string;
  public target_class_type?: string;
  public total_sessions?: number;
  public session_duration?: number;
  public created_by!: number;
  public kindergarten_id?: number;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联属性
  public creator?: any;
  public kindergarten?: any;
  public contents?: any[];
  public schedules?: any[];

  /**
   * 获取课程类型描述
   */
  public getCourseTypeDescription(): string {
    const typeMap = {
      'brain_science': '脑科学课程',
      'custom': '自定义课程',
      'theme': '主题课程'
    };
    return typeMap[this.course_type] || '未知类型';
  }

  /**
   * 获取状态描述
   */
  public getStatusDescription(): string {
    const statusMap = {
      'draft': '草稿',
      'published': '已发布',
      'archived': '已归档'
    };
    return statusMap[this.status] || '未知状态';
  }

  /**
   * 检查是否为脑科学课程
   */
  public isBrainScience(): boolean {
    return this.course_type === 'brain_science';
  }

  /**
   * 获取年龄组描述
   */
  public getAgeGroupDescription(): string {
    const ageMap: Record<string, string> = {
      '3-4': '小班(3-4岁)',
      '4-5': '中班(4-5岁)',
      '5-6': '大班(5-6岁)',
      '3-6': '全年龄段(3-6岁)'
    };
    return ageMap[this.age_group] || this.age_group;
  }
}

/**
 * 初始化模型函数
 */
export const initCustomCourseModel = (sequelizeInstance: Sequelize) => {
  CustomCourse.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '课程ID'
      },
      course_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '课程名称'
      },
      course_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '课程描述'
      },
      course_type: {
        type: DataTypes.ENUM('brain_science', 'custom', 'theme'),
        allowNull: false,
        defaultValue: 'custom',
        comment: '课程类型：脑科学/自定义/主题'
      },
      age_group: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: '3-6',
        comment: '适用年龄组'
      },
      semester: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '学期'
      },
      academic_year: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '学年'
      },
      status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft',
        comment: '状态：草稿/已发布/已归档'
      },
      thumbnail_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '缩略图URL'
      },
      progress_config: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '四进度配置（脑科学课程专用）'
      },
      objectives: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '课程目标'
      },
      target_class_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '适用班级类型'
      },
      total_sessions: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 16,
        comment: '总课时数'
      },
      session_duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 40,
        comment: '每节课时长（分钟）'
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '创建者ID'
      },
      kindergarten_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '幼儿园ID'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否启用'
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
      modelName: 'CustomCourse',
      tableName: 'custom_courses',
      timestamps: true,
      underscored: true,
      comment: '自定义课程表',
      indexes: [
        {
          fields: ['course_type']
        },
        {
          fields: ['status']
        },
        {
          fields: ['created_by']
        },
        {
          fields: ['kindergarten_id']
        },
        {
          fields: ['semester', 'academic_year']
        }
      ]
    }
  );

  // 设置模型关联
  CustomCourse.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
};

export default CustomCourse;


