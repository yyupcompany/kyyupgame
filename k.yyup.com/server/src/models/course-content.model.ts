import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

/**
 * 课程内容类型枚举
 */
export type CourseContentType = 'text' | 'image' | 'video' | 'interactive' | 'document';

/**
 * 课程内容属性接口
 */
export interface CourseContentAttributes {
  id: number;
  course_id: number;
  content_type: CourseContentType;
  content_title: string;
  content_data: {
    text?: string;           // 富文本内容
    image_url?: string;      // 图片URL
    image_urls?: string[];   // 多图片URL数组
    video_url?: string;      // 视频URL
    video_cover?: string;    // 视频封面
    document_url?: string;   // 文档URL
    interactive_id?: number; // 关联AI互动课程ID
    interactive_name?: string; // 互动课程名称
  };
  sort_order: number;
  duration_minutes?: number;  // 预计时长
  is_required: boolean;       // 是否必学
  teaching_notes?: string;    // 教学备注
  created_at: Date;
  updated_at: Date;
}

/**
 * 创建时的可选属性
 */
export interface CourseContentCreationAttributes
  extends Optional<CourseContentAttributes, 'id' | 'created_at' | 'updated_at' | 'is_required' | 'sort_order'> {}

/**
 * 课程内容模型类
 */
export class CourseContent extends Model<CourseContentAttributes, CourseContentCreationAttributes>
  implements CourseContentAttributes {
  
  public id!: number;
  public course_id!: number;
  public content_type!: CourseContentType;
  public content_title!: string;
  public content_data!: {
    text?: string;
    image_url?: string;
    image_urls?: string[];
    video_url?: string;
    video_cover?: string;
    document_url?: string;
    interactive_id?: number;
    interactive_name?: string;
  };
  public sort_order!: number;
  public duration_minutes?: number;
  public is_required!: boolean;
  public teaching_notes?: string;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联属性
  public course?: any;
  public interactiveCurriculum?: any;

  /**
   * 获取内容类型描述
   */
  public getContentTypeDescription(): string {
    const typeMap: Record<CourseContentType, string> = {
      'text': '文本',
      'image': '图片',
      'video': '视频',
      'interactive': 'AI互动课件',
      'document': '文档'
    };
    return typeMap[this.content_type] || '未知类型';
  }

  /**
   * 获取内容类型图标
   */
  public getContentTypeIcon(): string {
    const iconMap: Record<CourseContentType, string> = {
      'text': '📝',
      'image': '🖼️',
      'video': '🎬',
      'interactive': '🎮',
      'document': '📄'
    };
    return iconMap[this.content_type] || '📋';
  }

  /**
   * 检查是否有关联的互动课件
   */
  public hasInteractive(): boolean {
    return this.content_type === 'interactive' && !!this.content_data.interactive_id;
  }

  /**
   * 获取预览数据
   */
  public getPreviewData(): string | null {
    switch (this.content_type) {
      case 'text':
        // 返回前100个字符作为预览
        return this.content_data.text?.substring(0, 100) || null;
      case 'image':
        return this.content_data.image_url || (this.content_data.image_urls?.[0]) || null;
      case 'video':
        return this.content_data.video_cover || this.content_data.video_url || null;
      case 'interactive':
        return this.content_data.interactive_name || null;
      case 'document':
        return this.content_data.document_url || null;
      default:
        return null;
    }
  }
}

/**
 * 初始化模型函数
 */
export const initCourseContentModel = (sequelizeInstance: Sequelize) => {
  CourseContent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '内容ID'
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '关联课程ID'
      },
      content_type: {
        type: DataTypes.ENUM('text', 'image', 'video', 'interactive', 'document'),
        allowNull: false,
        comment: '内容类型'
      },
      content_title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '内容标题'
      },
      content_data: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        comment: '内容数据（JSON格式）'
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序序号'
      },
      duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '预计时长（分钟）'
      },
      is_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否必学'
      },
      teaching_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '教学备注'
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
      modelName: 'CourseContent',
      tableName: 'course_contents',
      timestamps: true,
      underscored: true,
      comment: '课程内容表',
      indexes: [
        {
          fields: ['course_id']
        },
        {
          fields: ['content_type']
        },
        {
          fields: ['course_id', 'sort_order']
        }
      ]
    }
  );
};

export default CourseContent;


