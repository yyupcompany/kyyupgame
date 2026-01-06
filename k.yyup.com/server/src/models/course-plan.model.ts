import { DataTypes, Model, Optional } from 'sequelize';
// import { sequelize } from '../config/database'; // 将在初始化时传入
// import { BrainScienceCourse } from './brain-science-course.model'; // 延迟关联，避免循环依赖
// import { Class } from './class.model'; // 延迟关联，避免循环依赖
// import { User } from './user.model'; // 延迟关联，避免循环依赖

// 课程计划属性接口
export interface CoursePlanAttributes {
  id: number;
  course_id: number;
  class_id: number;
  semester: string;
  academic_year: string;
  planned_start_date?: Date;
  planned_end_date?: Date;
  total_sessions: number;
  completed_sessions: number;
  plan_status: 'draft' | 'active' | 'completed' | 'cancelled';
  target_achievement_rate: number;
  actual_achievement_rate: number;
  notes?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

// 创建时的可选属性
export interface CoursePlanCreationAttributes 
  extends Optional<CoursePlanAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 课程计划模型类
export class CoursePlan extends Model<CoursePlanAttributes, CoursePlanCreationAttributes>
  implements CoursePlanAttributes {
  
  public id!: number;
  public course_id!: number;
  public class_id!: number;
  public semester!: string;
  public academic_year!: string;
  public planned_start_date?: Date;
  public planned_end_date?: Date;
  public total_sessions!: number;
  public completed_sessions!: number;
  public plan_status!: 'draft' | 'active' | 'completed' | 'cancelled';
  public target_achievement_rate!: number;
  public actual_achievement_rate!: number;
  public notes?: string;
  public created_by!: number;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联属性
  public course?: any; // 使用any类型避免循环依赖，通过延迟加载
  public class?: any;  // 使用any类型避免循环依赖，通过延迟加载
  public creator?: any; // 使用any类型避免循环依赖，通过延迟加载

  // 静态关联方法 - 延迟关联，在init.ts中设置
  public static associate() {
    // 关联将在init.ts中通过require延迟设置
    // 避免循环依赖问题
  }

  // 实例方法：获取计划状态描述
  public getPlanStatusDescription(): string {
    const statusMap = {
      'draft': '草稿',
      'active': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[this.plan_status] || '未知状态';
  }

  // 实例方法：获取完成进度百分比
  public getCompletionPercentage(): number {
    if (this.total_sessions === 0) return 0;
    return Math.round((this.completed_sessions / this.total_sessions) * 100);
  }

  // 实例方法：获取剩余课时数
  public getRemainingSessions(): number {
    return Math.max(0, this.total_sessions - this.completed_sessions);
  }

  // 实例方法：检查是否已完成
  public isCompleted(): boolean {
    return this.completed_sessions >= this.total_sessions || this.plan_status === 'completed';
  }

  // 实例方法：检查是否达到目标达标率
  public isTargetAchieved(): boolean {
    return this.actual_achievement_rate >= this.target_achievement_rate;
  }

  // 实例方法：获取达标率差距
  public getAchievementGap(): number {
    return this.target_achievement_rate - this.actual_achievement_rate;
  }

  // 实例方法：获取学期描述
  public getSemesterDescription(): string {
    return `${this.academic_year}学年 ${this.semester}`;
  }

  // 实例方法：检查计划是否过期
  public isExpired(): boolean {
    if (!this.planned_end_date) return false;
    return new Date() > this.planned_end_date && this.plan_status !== 'completed';
  }

  // 实例方法：获取计划持续时间（天数）
  public getPlanDuration(): number | null {
    if (!this.planned_start_date || !this.planned_end_date) return null;
    const diffTime = this.planned_end_date.getTime() - this.planned_start_date.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// 初始化模型函数
export const initCoursePlanModel = (sequelizeInstance: any) => {
  CoursePlan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '课程计划ID'
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '课程ID'
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '班级ID'
    },
    semester: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '学期（如：2024春季）'
    },
    academic_year: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '学年（如：2024-2025）'
    },
    planned_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '计划开始日期'
    },
    planned_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '计划结束日期'
    },
    total_sessions: {
      type: DataTypes.INTEGER,
      defaultValue: 16,
      comment: '总课时数'
    },
    completed_sessions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '已完成课时'
    },
    plan_status: {
      type: DataTypes.ENUM('draft', 'active', 'completed', 'cancelled'),
      defaultValue: 'draft',
      comment: '计划状态'
    },
    target_achievement_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 80.00,
      comment: '目标达标率（%）'
    },
    actual_achievement_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: '实际达标率（%）'
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
    modelName: 'CoursePlan',
    tableName: 'course_plans',
    timestamps: true,
    underscored: true,
    comment: '课程计划表'
  }
);
};

export default CoursePlan;
