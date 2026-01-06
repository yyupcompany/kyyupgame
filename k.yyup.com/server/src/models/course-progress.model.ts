import { DataTypes, Model, Optional } from 'sequelize';
// import { sequelize } from '../init'; // 将在初始化时传入
// import { CoursePlan } from './course-plan.model'; // 延迟关联，避免循环依赖
// import { Class } from './class.model'; // 延迟关联，避免循环依赖
// import { Teacher } from './teacher.model'; // 延迟关联，避免循环依赖

// 课程进度记录属性接口
export interface CourseProgressAttributes {
  id: number;
  course_plan_id: number;
  class_id: number;
  session_number: number;
  session_date?: Date;
  completion_status: 'not_started' | 'in_progress' | 'completed';
  teacher_confirmed: boolean;
  attendance_count: number;
  target_achieved_count: number;
  achievement_rate: number;
  has_class_media: boolean;
  class_media_count: number;
  has_student_media: boolean;
  student_media_count: number;
  media_upload_required: boolean;
  session_content?: string;
  notes?: string;
  teacher_id?: number;
  confirmed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// 创建时的可选属性
export interface CourseProgressCreationAttributes 
  extends Optional<CourseProgressAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 课程进度记录模型类
export class CourseProgress extends Model<CourseProgressAttributes, CourseProgressCreationAttributes>
  implements CourseProgressAttributes {
  
  public id!: number;
  public course_plan_id!: number;
  public class_id!: number;
  public session_number!: number;
  public session_date?: Date;
  public completion_status!: 'not_started' | 'in_progress' | 'completed';
  public teacher_confirmed!: boolean;
  public attendance_count!: number;
  public target_achieved_count!: number;
  public achievement_rate!: number;
  public has_class_media!: boolean;
  public class_media_count!: number;
  public has_student_media!: boolean;
  public student_media_count!: number;
  public media_upload_required!: boolean;
  public session_content?: string;
  public notes?: string;
  public teacher_id?: number;
  public confirmed_at?: Date;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联属性
  public coursePlan?: any; // 使用any类型避免循环依赖，通过延迟加载
  public class?: any;      // 使用any类型避免循环依赖，通过延迟加载
  public teacher?: any;    // 使用any类型避免循环依赖，通过延迟加载

  // 静态关联方法 - 延迟关联，在init.ts中设置
  public static associate() {
    // 关联将在init.ts中通过require延迟设置
    // 避免循环依赖问题
  }

  // 实例方法：获取完成状态描述
  public getCompletionStatusDescription(): string {
    const statusMap = {
      'not_started': '未开始',
      'in_progress': '进行中',
      'completed': '已完成'
    };
    return statusMap[this.completion_status] || '未知状态';
  }

  // 实例方法：计算达标率
  public calculateAchievementRate(): number {
    if (this.attendance_count === 0) return 0;
    return Math.round((this.target_achieved_count / this.attendance_count) * 100);
  }

  // 实例方法：检查是否有媒体记录
  public hasAnyMedia(): boolean {
    return this.has_class_media || this.has_student_media;
  }

  // 实例方法：获取总媒体数量
  public getTotalMediaCount(): number {
    return this.class_media_count + this.student_media_count;
  }

  // 实例方法：检查是否需要上传媒体
  public needsMediaUpload(): boolean {
    return this.media_upload_required && !this.hasAnyMedia();
  }

  // 实例方法：获取媒体状态描述
  public getMediaStatusDescription(): string {
    if (!this.media_upload_required) {
      return '无需上传媒体';
    }
    if (this.hasAnyMedia()) {
      return `已上传 ${this.getTotalMediaCount()} 个媒体文件`;
    }
    return '待上传媒体';
  }

  // 实例方法：检查是否可以确认完成
  public canConfirmCompletion(): boolean {
    if (this.completion_status !== 'completed') return false;
    if (this.media_upload_required && !this.hasAnyMedia()) return false;
    return true;
  }

  // 实例方法：获取课时标题
  public getSessionTitle(): string {
    return `第${this.session_number}课时`;
  }

  // 实例方法：检查是否已过期（超过7天未上课）
  public isOverdue(): boolean {
    if (this.completion_status === 'completed') return false;
    if (!this.session_date) return false;
    
    const now = new Date();
    const sessionDate = new Date(this.session_date);
    const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays > 7;
  }

  // 实例方法：获取出勤率
  public getAttendanceRate(totalStudents: number): number {
    if (totalStudents === 0) return 0;
    return Math.round((this.attendance_count / totalStudents) * 100);
  }

  // 实例方法：确认完成课程
  public confirmCompletion(teacherId: number): void {
    this.teacher_confirmed = true;
    this.teacher_id = teacherId;
    this.confirmed_at = new Date();
    this.completion_status = 'completed';
  }
}

// 初始化模型函数
export const initCourseProgressModel = (sequelizeInstance: any) => {
  CourseProgress.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '课程进度ID'
    },
    course_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '课程计划ID'
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '班级ID'
    },
    session_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '第几课时'
    },
    session_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '上课日期'
    },
    completion_status: {
      type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
      defaultValue: 'not_started',
      comment: '完成状态'
    },
    teacher_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '教师确认完成'
    },
    attendance_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '出勤人数'
    },
    target_achieved_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '达标人数'
    },
    achievement_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: '达标率（%）'
    },
    has_class_media: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否有班级媒体'
    },
    class_media_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '班级媒体数量'
    },
    has_student_media: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否有学员媒体'
    },
    student_media_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '学员媒体数量'
    },
    media_upload_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否要求上传媒体'
    },
    session_content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '课时内容'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '授课教师ID'
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '确认时间'
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
    modelName: 'CourseProgress',
    tableName: 'course_progress',
    timestamps: true,
    underscored: true,
    comment: '课程进度记录表'
  }
);
};

export default CourseProgress;
