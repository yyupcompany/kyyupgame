import { DataTypes, Model, Optional } from 'sequelize';
import { Class } from './class.model';
import { Teacher } from './teacher.model';

// 校外展示记录属性接口
export interface ExternalDisplayRecordAttributes {
  id: number;
  class_id: number;
  semester: string;
  academic_year: string;
  display_date: Date;
  display_location: string;
  display_type: 'competition' | 'performance' | 'exhibition' | 'visit' | 'other';
  participation_count: number;
  achievement_level?: 'excellent' | 'good' | 'average' | 'needs_improvement';
  achievement_rate: number;
  has_media: boolean;
  media_count: number;
  display_content?: string;
  feedback?: string;
  awards?: string;
  expenses?: number;
  notes?: string;
  teacher_id?: number;
  organizer?: string;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

// 创建时的可选属性
export interface ExternalDisplayRecordCreationAttributes 
  extends Optional<ExternalDisplayRecordAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 校外展示记录模型类
export class ExternalDisplayRecord extends Model<ExternalDisplayRecordAttributes, ExternalDisplayRecordCreationAttributes>
  implements ExternalDisplayRecordAttributes {
  
  public id!: number;
  public class_id!: number;
  public semester!: string;
  public academic_year!: string;
  public display_date!: Date;
  public display_location!: string;
  public display_type!: 'competition' | 'performance' | 'exhibition' | 'visit' | 'other';
  public participation_count!: number;
  public achievement_level?: 'excellent' | 'good' | 'average' | 'needs_improvement';
  public achievement_rate!: number;
  public has_media!: boolean;
  public media_count!: number;
  public display_content?: string;
  public feedback?: string;
  public awards?: string;
  public expenses?: number;
  public notes?: string;
  public teacher_id?: number;
  public organizer?: string;
  public created_by?: number;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联属性
  public class?: Class;
  public teacher?: Teacher;

  // 静态关联方法
  public static associate() {
    // 与班级表的关联
    ExternalDisplayRecord.belongsTo(Class, {
      foreignKey: 'class_id',
      as: 'class'
    });

    // 与教师表的关联
    ExternalDisplayRecord.belongsTo(Teacher, {
      foreignKey: 'teacher_id',
      as: 'teacher',
      constraints: false
    });
  }

  // 实例方法：获取展示类型描述
  public getDisplayTypeDescription(): string {
    const typeMap = {
      'competition': '比赛竞技',
      'performance': '表演展示',
      'exhibition': '作品展览',
      'visit': '参观学习',
      'other': '其他活动'
    };
    return typeMap[this.display_type] || '未知类型';
  }

  // 实例方法：获取成就等级描述
  public getAchievementLevelDescription(): string {
    if (!this.achievement_level) return '未评级';
    const levelMap = {
      'excellent': '优秀',
      'good': '良好',
      'average': '一般',
      'needs_improvement': '待改进'
    };
    return levelMap[this.achievement_level] || '未知等级';
  }

  // 实例方法：获取学期描述
  public getSemesterDescription(): string {
    return `${this.academic_year}学年 ${this.semester}`;
  }

  // 实例方法：检查是否有媒体记录
  public hasMediaRecords(): boolean {
    return this.has_media && this.media_count > 0;
  }

  // 实例方法：获取媒体统计描述
  public getMediaStatsDescription(): string {
    if (!this.has_media || this.media_count === 0) {
      return '无媒体记录';
    }
    return `${this.media_count}个媒体文件`;
  }

  // 实例方法：获取费用描述
  public getCostDescription(): string {
    if (!this.expenses) return '免费';
    return `¥${this.expenses.toFixed(2)}`;
  }

  // 实例方法：获取达标率描述
  public getAchievementRateDescription(): string {
    return `${this.achievement_rate.toFixed(2)}%`;
  }

  // 实例方法：获取反馈描述
  public getFeedbackDescription(): string {
    if (!this.feedback) return '暂无反馈';
    return this.feedback;
  }

  // 实例方法：获取参与率描述
  public getParticipationDescription(totalStudents: number): string {
    if (totalStudents === 0) return '无学生';
    const rate = Math.round((this.participation_count / totalStudents) * 100);
    return `${this.participation_count}/${totalStudents} (${rate}%)`;
  }

  // 静态方法：按班级和学期统计外出情况
  public static async getDisplayStats(classId: number, semester: string, academicYear: string) {
    const records = await ExternalDisplayRecord.findAll({
      where: {
        class_id: classId,
        semester,
        academic_year: academicYear
      }
    });

    const totalDisplays = records.length;
    const displaysByType = records.reduce((acc, record) => {
      acc[record.display_type] = (acc[record.display_type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const totalParticipants = records.reduce((sum, record) => sum + record.participation_count, 0);
    const totalCost = records.reduce((sum, record) => sum + (record.expenses || 0), 0);
    const totalMedia = records.reduce((sum, record) => sum + record.media_count, 0);

    const achievementLevels = records.reduce((acc, record) => {
      if (record.achievement_level) {
        acc[record.achievement_level] = (acc[record.achievement_level] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });

    return {
      total_displays: totalDisplays,
      displays_by_type: displaysByType,
      total_participants: totalParticipants,
      average_participants: totalDisplays > 0 ? Math.round(totalParticipants / totalDisplays) : 0,
      total_cost: totalCost,
      average_cost: totalDisplays > 0 ? Math.round(totalCost / totalDisplays) : 0,
      total_media: totalMedia,
      achievement_levels: achievementLevels,
      records_with_media: records.filter(r => r.hasMediaRecords()).length,
      media_coverage_rate: totalDisplays > 0 ? Math.round((records.filter(r => r.hasMediaRecords()).length / totalDisplays) * 100) : 0
    };
  }

  // 静态方法：获取累计外出统计
  public static async getCumulativeStats(classId: number) {
    const allRecords = await ExternalDisplayRecord.findAll({
      where: { class_id: classId }
    });

    const currentSemesterRecords = await ExternalDisplayRecord.findAll({
      where: {
        class_id: classId,
        semester: '2024春季', // 这里应该动态获取当前学期
        academic_year: '2024-2025'
      }
    });

    return {
      total_all_time: allRecords.length,
      total_current_semester: currentSemesterRecords.length,
      total_participants_all_time: allRecords.reduce((sum, r) => sum + r.participation_count, 0),
      total_cost_all_time: allRecords.reduce((sum, r) => sum + (r.expenses || 0), 0),
      first_display_date: allRecords.length > 0 ?
        allRecords.sort((a, b) => a.display_date.getTime() - b.display_date.getTime())[0].display_date : null,
      latest_display_date: allRecords.length > 0 ?
        allRecords.sort((a, b) => b.display_date.getTime() - a.display_date.getTime())[0].display_date : null
    };
  }
}

// 初始化模型函数
export const initExternalDisplayRecordModel = (sequelizeInstance: any) => {
  ExternalDisplayRecord.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '校外展示记录ID'
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
      display_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '展示日期'
      },
      display_location: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '展示地点'
      },
      display_type: {
        type: DataTypes.ENUM('competition', 'performance', 'exhibition', 'visit', 'other'),
        allowNull: false,
        comment: '展示类型'
      },
      participation_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '参与人数'
      },
      achievement_level: {
        type: DataTypes.ENUM('excellent', 'good', 'average', 'needs_improvement'),
        allowNull: true,
        comment: '成就等级'
      },
      achievement_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: '达标率（%）'
      },
      has_media: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '是否有媒体文件'
      },
      media_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '媒体文件数量'
      },
      display_content: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '展示内容'
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '反馈'
      },
      awards: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '获得奖项'
      },
      expenses: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '费用'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注'
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '负责教师ID'
      },
      organizer: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '主办方'
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '创建人ID'
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
      modelName: 'ExternalDisplayRecord',
      tableName: 'external_display_records',
      timestamps: true,
      underscored: true,
      comment: '校外展示记录表'
    }
  );
};

export default ExternalDisplayRecord;
