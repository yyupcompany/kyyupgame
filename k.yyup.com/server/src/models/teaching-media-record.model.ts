import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';
import { Class } from './class.model';
import { CourseProgress } from './course-progress.model';
import { FileStorage } from './file-storage.model';
import { Student } from './student.model';
import { User } from './user.model';

// 教学媒体记录属性接口
export interface TeachingMediaRecordAttributes {
  id: number;
  class_id: number;
  course_progress_id: number;
  media_type: 'class_photo' | 'class_video' | 'student_photo' | 'student_video';
  file_storage_id: number;
  student_id?: number;
  upload_by: number;
  upload_time: Date;
  description?: string;
  is_featured: boolean;
  status: 'active' | 'archived' | 'deleted';
  file_size?: number;
  file_format?: string;
  duration?: number;
  thumbnail_url?: string;
  created_at: Date;
  updated_at: Date;
}

// 创建时的可选属性
export interface TeachingMediaRecordCreationAttributes 
  extends Optional<TeachingMediaRecordAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 教学媒体记录模型类
export class TeachingMediaRecord extends Model<TeachingMediaRecordAttributes, TeachingMediaRecordCreationAttributes>
  implements TeachingMediaRecordAttributes {
  
  public id!: number;
  public class_id!: number;
  public course_progress_id!: number;
  public media_type!: 'class_photo' | 'class_video' | 'student_photo' | 'student_video';
  public file_storage_id!: number;
  public student_id?: number;
  public upload_by!: number;
  public upload_time!: Date;
  public description?: string;
  public is_featured!: boolean;
  public status!: 'active' | 'archived' | 'deleted';
  public file_size?: number;
  public file_format?: string;
  public duration?: number;
  public thumbnail_url?: string;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联属性
  public class?: Class;
  public courseProgress?: CourseProgress;
  public fileStorage?: FileStorage;
  public student?: Student;
  public uploader?: User;

  // 静态关联方法
  public static associate() {
    // 与班级表的关联
    TeachingMediaRecord.belongsTo(Class, {
      foreignKey: 'class_id',
      as: 'class'
    });

    // 与课程进度表的关联
    TeachingMediaRecord.belongsTo(CourseProgress, {
      foreignKey: 'course_progress_id',
      as: 'courseProgress'
    });

    // 与文件存储表的关联
    TeachingMediaRecord.belongsTo(FileStorage, {
      foreignKey: 'file_storage_id',
      as: 'fileStorage'
    });

    // 与学生表的关联（可选）
    TeachingMediaRecord.belongsTo(Student, {
      foreignKey: 'student_id',
      as: 'student',
      constraints: false
    });

    // 与用户表的关联（上传者）
    TeachingMediaRecord.belongsTo(User, {
      foreignKey: 'upload_by',
      as: 'uploader'
    });
  }

  // 实例方法：获取媒体类型描述
  public getMediaTypeDescription(): string {
    const typeMap = {
      'class_photo': '班级照片',
      'class_video': '班级视频',
      'student_photo': '学员照片',
      'student_video': '学员视频'
    };
    return typeMap[this.media_type] || '未知类型';
  }

  // 实例方法：检查是否为图片
  public isImage(): boolean {
    return this.media_type === 'class_photo' || this.media_type === 'student_photo';
  }

  // 实例方法：检查是否为视频
  public isVideo(): boolean {
    return this.media_type === 'class_video' || this.media_type === 'student_video';
  }

  // 实例方法：检查是否为班级媒体
  public isClassMedia(): boolean {
    return this.media_type === 'class_photo' || this.media_type === 'class_video';
  }

  // 实例方法：检查是否为学员媒体
  public isStudentMedia(): boolean {
    return this.media_type === 'student_photo' || this.media_type === 'student_video';
  }

  // 实例方法：获取文件大小描述
  public getFileSizeDescription(): string {
    if (!this.file_size) return '未知大小';
    
    const size = this.file_size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  // 实例方法：获取视频时长描述
  public getDurationDescription(): string {
    if (!this.duration || !this.isVideo()) return '';
    
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    
    if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    }
    return `${seconds}秒`;
  }

  // 实例方法：获取状态描述
  public getStatusDescription(): string {
    const statusMap = {
      'active': '正常',
      'archived': '已归档',
      'deleted': '已删除'
    };
    return statusMap[this.status] || '未知状态';
  }

  // 实例方法：检查是否可以删除
  public canDelete(userId: number): boolean {
    // 只有上传者可以删除
    return this.upload_by === userId && this.status === 'active';
  }

  // 实例方法：软删除
  public softDelete(): void {
    this.status = 'deleted';
  }

  // 实例方法：归档
  public archive(): void {
    this.status = 'archived';
  }

  // 实例方法：恢复状态
  public restoreStatus(): void {
    this.status = 'active';
  }

  // 实例方法：设置为精选
  public setFeatured(featured: boolean = true): void {
    this.is_featured = featured;
  }

  // 实例方法：获取缩略图URL或默认图标
  public getThumbnailUrl(): string {
    if (this.thumbnail_url) return this.thumbnail_url;
    
    // 返回默认图标
    if (this.isImage()) return '/default-image-thumbnail.png';
    if (this.isVideo()) return '/default-video-thumbnail.png';
    return '/default-file-thumbnail.png';
  }

  // 静态方法：根据媒体类型统计数量
  public static async countByMediaType(classId: number, courseProgressId: number) {
    const counts = await TeachingMediaRecord.findAll({
      where: {
        class_id: classId,
        course_progress_id: courseProgressId,
        status: 'active'
      },
      attributes: [
        'media_type',
        [(TeachingMediaRecord.sequelize as any).fn('COUNT', (TeachingMediaRecord.sequelize as any).col('id')), 'count']
      ],
      group: ['media_type'],
      raw: true
    });

    const result = {
      class_photo: 0,
      class_video: 0,
      student_photo: 0,
      student_video: 0
    };

    counts.forEach((count: any) => {
      result[count.media_type as keyof typeof result] = parseInt(count.count);
    });

    return result;
  }
}

// 初始化模型函数
export const initTeachingMediaRecordModel = (sequelizeInstance: any) => {
  TeachingMediaRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '媒体记录ID'
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '班级ID'
    },
    course_progress_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '课程进度ID'
    },
    media_type: {
      type: DataTypes.ENUM('class_photo', 'class_video', 'student_photo', 'student_video'),
      allowNull: false,
      comment: '媒体类型'
    },
    file_storage_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '文件存储ID'
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '学员ID（学员媒体时使用）'
    },
    upload_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '上传者ID'
    },
    upload_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: '上传时间'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '媒体描述'
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否为精选媒体'
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'deleted'),
      defaultValue: 'active',
      comment: '状态'
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '文件大小（字节）'
    },
    file_format: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: '文件格式'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '视频时长（秒）'
    },
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '缩略图URL'
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
    modelName: 'TeachingMediaRecord',
    tableName: 'teaching_media_records',
    timestamps: true,
    underscored: true,
    comment: '教学媒体记录表'
  }
);
};

export default TeachingMediaRecord;
