import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

/**
 * 关联类型枚举
 */
export type LinkType = 'embedded' | 'reference';

/**
 * 审核状态枚举
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * AI互动课程关联属性接口
 */
export interface CourseInteractiveLinkAttributes {
  id: number;
  course_id: number;              // 关联课程ID
  course_content_id?: number;     // 关联课程内容ID（可选，表示关联到具体内容块）
  creative_curriculum_id: number; // AI互动课程ID
  
  link_type: LinkType;            // 嵌入/引用
  
  // 审核相关
  added_by: number;               // 添加人（教师）
  approved_by?: number;           // 审核人（园长）
  approval_status: ApprovalStatus;
  approval_notes?: string;        // 审核备注
  approved_at?: Date;             // 审核时间
  
  // 使用统计
  use_count: number;              // 使用次数
  last_used_at?: Date;            // 最后使用时间
  
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * 创建时的可选属性
 */
export interface CourseInteractiveLinkCreationAttributes
  extends Optional<CourseInteractiveLinkAttributes, 
    'id' | 'created_at' | 'updated_at' | 'approval_status' | 'use_count' | 'is_active'> {}

/**
 * AI互动课程关联模型类
 */
export class CourseInteractiveLink extends Model<CourseInteractiveLinkAttributes, CourseInteractiveLinkCreationAttributes>
  implements CourseInteractiveLinkAttributes {
  
  public id!: number;
  public course_id!: number;
  public course_content_id?: number;
  public creative_curriculum_id!: number;
  public link_type!: LinkType;
  public added_by!: number;
  public approved_by?: number;
  public approval_status!: ApprovalStatus;
  public approval_notes?: string;
  public approved_at?: Date;
  public use_count!: number;
  public last_used_at?: Date;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联属性
  public course?: any;
  public courseContent?: any;
  public creativeCurriculum?: any;
  public addedByUser?: any;
  public approvedByUser?: any;

  /**
   * 获取关联类型描述
   */
  public getLinkTypeDescription(): string {
    const typeMap: Record<LinkType, string> = {
      'embedded': '嵌入',
      'reference': '引用'
    };
    return typeMap[this.link_type] || '未知类型';
  }

  /**
   * 获取审核状态描述
   */
  public getApprovalStatusDescription(): string {
    const statusMap: Record<ApprovalStatus, string> = {
      'pending': '待审核',
      'approved': '已通过',
      'rejected': '已拒绝'
    };
    return statusMap[this.approval_status] || '未知状态';
  }

  /**
   * 检查是否已审核通过
   */
  public isApproved(): boolean {
    return this.approval_status === 'approved';
  }

  /**
   * 检查是否待审核
   */
  public isPending(): boolean {
    return this.approval_status === 'pending';
  }

  /**
   * 记录使用
   */
  public recordUsage(): void {
    this.use_count += 1;
    this.last_used_at = new Date();
  }
}

/**
 * 初始化模型函数
 */
export const initCourseInteractiveLinkModel = (sequelizeInstance: Sequelize) => {
  CourseInteractiveLink.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '关联ID'
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '关联课程ID'
      },
      course_content_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '关联课程内容ID'
      },
      creative_curriculum_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'AI互动课程ID'
      },
      link_type: {
        type: DataTypes.ENUM('embedded', 'reference'),
        allowNull: false,
        defaultValue: 'reference',
        comment: '关联类型：嵌入/引用'
      },
      added_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '添加人ID（教师）'
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '审核人ID（园长）'
      },
      approval_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '审核状态'
      },
      approval_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '审核备注'
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '审核时间'
      },
      use_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '使用次数'
      },
      last_used_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '最后使用时间'
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
      modelName: 'CourseInteractiveLink',
      tableName: 'course_interactive_links',
      timestamps: true,
      underscored: true,
      comment: 'AI互动课程关联表',
      indexes: [
        {
          fields: ['course_id']
        },
        {
          fields: ['course_content_id']
        },
        {
          fields: ['creative_curriculum_id']
        },
        {
          fields: ['added_by']
        },
        {
          fields: ['approval_status']
        },
        {
          unique: true,
          fields: ['course_id', 'creative_curriculum_id'],
          name: 'unique_course_interactive'
        }
      ]
    }
  );
};

export default CourseInteractiveLink;


