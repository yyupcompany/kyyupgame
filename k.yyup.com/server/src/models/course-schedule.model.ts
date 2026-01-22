import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

/**
 * 课程排期状态枚举
 */
export type ScheduleStatus = 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';

/**
 * 课程排期属性接口
 */
export interface CourseScheduleAttributes {
  id: number;
  course_id: number;
  class_id: number;
  teacher_id: number;
  
  // 排期信息
  planned_start_date: Date;
  planned_end_date: Date;
  actual_start_date?: Date;
  actual_end_date?: Date;
  
  // 排课时间配置
  schedule_config?: {
    weekdays: number[];      // 周几上课 [1,3,5] = 周一三五
    time_slots: string[];    // 上课时间 ["09:00", "14:00"]
  };
  
  // 状态
  schedule_status: ScheduleStatus;
  delay_days: number;        // 延期天数
  delay_reason?: string;     // 延期原因
  
  // 进度
  completed_sessions: number;  // 已完成课时
  total_sessions: number;      // 总课时
  
  // 告警
  alert_level: 'none' | 'warning' | 'critical';  // 告警级别
  alert_sent: boolean;       // 是否已发送告警
  alert_sent_at?: Date;      // 告警发送时间
  
  // 教师确认
  teacher_confirmed: boolean;
  teacher_confirmed_at?: Date;
  
  notes?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * 创建时的可选属性
 */
export interface CourseScheduleCreationAttributes
  extends Optional<CourseScheduleAttributes, 
    'id' | 'created_at' | 'updated_at' | 'delay_days' | 'completed_sessions' | 
    'alert_level' | 'alert_sent' | 'teacher_confirmed' | 'schedule_status'> {}

/**
 * 课程排期模型类
 */
export class CourseSchedule extends Model<CourseScheduleAttributes, CourseScheduleCreationAttributes>
  implements CourseScheduleAttributes {
  
  public id!: number;
  public course_id!: number;
  public class_id!: number;
  public teacher_id!: number;
  public planned_start_date!: Date;
  public planned_end_date!: Date;
  public actual_start_date?: Date;
  public actual_end_date?: Date;
  public schedule_config?: {
    weekdays: number[];
    time_slots: string[];
  };
  public schedule_status!: ScheduleStatus;
  public delay_days!: number;
  public delay_reason?: string;
  public completed_sessions!: number;
  public total_sessions!: number;
  public alert_level!: 'none' | 'warning' | 'critical';
  public alert_sent!: boolean;
  public alert_sent_at?: Date;
  public teacher_confirmed!: boolean;
  public teacher_confirmed_at?: Date;
  public notes?: string;
  public created_by!: number;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联属性
  public course?: any;
  public class?: any;
  public teacher?: any;
  public creator?: any;

  /**
   * 获取状态描述
   */
  public getStatusDescription(): string {
    const statusMap: Record<ScheduleStatus, string> = {
      'pending': '待开始',
      'in_progress': '进行中',
      'completed': '已完成',
      'delayed': '已延期',
      'cancelled': '已取消'
    };
    return statusMap[this.schedule_status] || '未知状态';
  }

  /**
   * 获取完成进度百分比
   */
  public getProgressPercentage(): number {
    if (this.total_sessions === 0) return 0;
    return Math.round((this.completed_sessions / this.total_sessions) * 100);
  }

  /**
   * 检查是否已延期
   */
  public isDelayed(): boolean {
    if (this.schedule_status === 'completed' || this.schedule_status === 'cancelled') {
      return false;
    }
    const now = new Date();
    return now > new Date(this.planned_end_date);
  }

  /**
   * 计算延期天数
   */
  public calculateDelayDays(): number {
    if (!this.isDelayed()) return 0;
    const now = new Date();
    const endDate = new Date(this.planned_end_date);
    const diffTime = now.getTime() - endDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 检查是否需要告警
   */
  public needsAlert(): boolean {
    if (this.schedule_status === 'completed' || this.schedule_status === 'cancelled') {
      return false;
    }
    
    const now = new Date();
    const endDate = new Date(this.planned_end_date);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // 3天内到期或已延期
    return daysRemaining <= 3 || this.isDelayed();
  }

  /**
   * 获取告警级别
   */
  public getAlertLevel(): 'none' | 'warning' | 'critical' {
    if (!this.needsAlert()) return 'none';
    
    const now = new Date();
    const endDate = new Date(this.planned_end_date);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return 'critical';  // 已延期
    if (daysRemaining <= 3) return 'warning';  // 即将到期
    return 'none';
  }

  /**
   * 获取剩余天数描述
   */
  public getRemainingDaysDescription(): string {
    const now = new Date();
    const endDate = new Date(this.planned_end_date);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return `已延期${Math.abs(daysRemaining)}天`;
    } else if (daysRemaining === 0) {
      return '今日到期';
    } else {
      return `剩余${daysRemaining}天`;
    }
  }
}

/**
 * 初始化模型函数
 */
export const initCourseScheduleModel = (sequelizeInstance: Sequelize) => {
  CourseSchedule.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '排期ID'
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '关联课程ID'
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '班级ID'
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '教师ID'
      },
      planned_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '计划开始日期'
      },
      planned_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '计划结束日期'
      },
      actual_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '实际开始日期'
      },
      actual_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '实际结束日期'
      },
      schedule_config: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '排课时间配置'
      },
      schedule_status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'delayed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '排期状态'
      },
      delay_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '延期天数'
      },
      delay_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '延期原因'
      },
      completed_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '已完成课时'
      },
      total_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 16,
        comment: '总课时'
      },
      alert_level: {
        type: DataTypes.ENUM('none', 'warning', 'critical'),
        allowNull: false,
        defaultValue: 'none',
        comment: '告警级别'
      },
      alert_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否已发送告警'
      },
      alert_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '告警发送时间'
      },
      teacher_confirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '教师是否已确认'
      },
      teacher_confirmed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '教师确认时间'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注'
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      modelName: 'CourseSchedule',
      tableName: 'course_schedules',
      timestamps: true,
      underscored: true,
      comment: '课程排期表',
      indexes: [
        {
          fields: ['course_id']
        },
        {
          fields: ['class_id']
        },
        {
          fields: ['teacher_id']
        },
        {
          fields: ['schedule_status']
        },
        {
          fields: ['alert_level']
        },
        {
          fields: ['planned_start_date', 'planned_end_date']
        }
      ]
    }
  );
};

export default CourseSchedule;


