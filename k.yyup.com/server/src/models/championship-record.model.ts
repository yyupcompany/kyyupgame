import { DataTypes, Model, Optional } from 'sequelize';
import { Class } from './class.model';
import { Teacher } from './teacher.model';

// 全员锦标赛记录属性接口
export interface ChampionshipRecordAttributes {
  id: number;
  semester: string;
  academic_year: string;
  championship_date: Date;
  championship_name: string;
  championship_type: 'brain_science' | 'comprehensive' | 'special';
  total_participants: number;
  participating_class_count: number; // 参与班级数
  class_participation_rate: number; // 班级参与比例（%）
  student_participation_rate: number; // 学生参与比例（%）
  brain_science_achievement_rate: number;
  course_content_achievement_rate: number;
  outdoor_training_achievement_rate: number;
  external_display_achievement_rate: number;
  overall_achievement_rate: number;
  completion_status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  has_media: boolean;
  media_count: number;
  awards?: string;
  winners?: string;
  championship_rules?: string;
  summary?: string;
  notes?: string;
  organizer_id?: number;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

// 创建时的可选属性
export interface ChampionshipRecordCreationAttributes 
  extends Optional<ChampionshipRecordAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 全员锦标赛记录模型类
export class ChampionshipRecord extends Model<ChampionshipRecordAttributes, ChampionshipRecordCreationAttributes>
  implements ChampionshipRecordAttributes {
  
  public id!: number;
  public semester!: string;
  public academic_year!: string;
  public championship_date!: Date;
  public championship_name!: string;
  public championship_type!: 'brain_science' | 'comprehensive' | 'special';
  public total_participants!: number;
  public participating_class_count!: number; // 参与班级数
  public class_participation_rate!: number; // 班级参与比例（%）
  public student_participation_rate!: number; // 学生参与比例（%）
  public brain_science_achievement_rate!: number;
  public course_content_achievement_rate!: number;
  public outdoor_training_achievement_rate!: number;
  public external_display_achievement_rate!: number;
  public overall_achievement_rate!: number;
  public completion_status!: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  public has_media!: boolean;
  public media_count!: number;
  public awards?: string;
  public winners?: string;
  public championship_rules?: string;
  public summary?: string;
  public notes?: string;
  public organizer_id?: number;
  public created_by?: number;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联属性
  public organizer?: Teacher;

  // 静态关联方法
  public static associate() {
    // 与教师表的关联（组织者）
    ChampionshipRecord.belongsTo(Teacher, {
      foreignKey: 'organizer_id',
      as: 'organizer',
      constraints: false
    });
  }

  // 实例方法：获取锦标赛类型描述
  public getChampionshipTypeDescription(): string {
    const typeMap = {
      'brain_science': '脑科学专项锦标赛',
      'comprehensive': '综合能力锦标赛',
      'special': '特色主题锦标赛'
    };
    return typeMap[this.championship_type] || '未知类型';
  }

  // 实例方法：获取完成状态描述
  public getCompletionStatusDescription(): string {
    const statusMap = {
      'planned': '计划中',
      'in_progress': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[this.completion_status] || '未知状态';
  }

  // 实例方法：获取学期描述
  public getSemesterDescription(): string {
    return `${this.academic_year}学年 ${this.semester}`;
  }

  // 实例方法：检查是否已完成
  public isCompleted(): boolean {
    return this.completion_status === 'completed';
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

  // 实例方法：获取获奖者描述
  public getWinnersDescription(): string {
    if (!this.winners) return '暂无获奖者';
    return this.winners;
  }

  // 实例方法：获取规则描述
  public getRulesDescription(): string {
    if (!this.championship_rules) return '暂无规则';
    return this.championship_rules;
  }

  // 实例方法：获取综合评级
  public getOverallGrade(): string {
    const rate = this.overall_achievement_rate;
    if (rate >= 90) return '优秀';
    if (rate >= 80) return '良好';
    if (rate >= 70) return '合格';
    if (rate >= 60) return '及格';
    return '待改进';
  }

  // 实例方法：获取各项达标率汇总
  public getAchievementRatesSummary() {
    return {
      brain_science: {
        rate: this.brain_science_achievement_rate,
        description: '神童计划达标率'
      },
      course_content: {
        rate: this.course_content_achievement_rate,
        description: '课程内容达标率'
      },
      outdoor_training: {
        rate: this.outdoor_training_achievement_rate,
        description: '户外训练达标率'
      },
      external_display: {
        rate: this.external_display_achievement_rate,
        description: '外出活动达标率'
      },
      overall: {
        rate: this.overall_achievement_rate,
        description: '综合达标率'
      }
    };
  }

  // 静态方法：按学期统计锦标赛情况
  public static async getChampionshipStats(semester: string, academicYear: string) {
    const records = await ChampionshipRecord.findAll({
      where: {
        semester,
        academic_year: academicYear
      }
    });

    const totalChampionships = records.length;
    const completedChampionships = records.filter(r => r.completion_status === 'completed').length;
    const totalParticipants = records.reduce((sum, r) => sum + r.total_participants, 0);
    const totalMedia = records.reduce((sum, r) => sum + r.media_count, 0);

    const averageAchievementRates = {
      brain_science: records.length > 0 ? 
        Math.round(records.reduce((sum, r) => sum + r.brain_science_achievement_rate, 0) / records.length) : 0,
      course_content: records.length > 0 ? 
        Math.round(records.reduce((sum, r) => sum + r.course_content_achievement_rate, 0) / records.length) : 0,
      outdoor_training: records.length > 0 ? 
        Math.round(records.reduce((sum, r) => sum + r.outdoor_training_achievement_rate, 0) / records.length) : 0,
      external_display: records.length > 0 ? 
        Math.round(records.reduce((sum, r) => sum + r.external_display_achievement_rate, 0) / records.length) : 0,
      overall: records.length > 0 ? 
        Math.round(records.reduce((sum, r) => sum + r.overall_achievement_rate, 0) / records.length) : 0
    };

    return {
      total_championships: totalChampionships,
      completed_championships: completedChampionships,
      completion_rate: totalChampionships > 0 ? Math.round((completedChampionships / totalChampionships) * 100) : 0,
      total_participants: totalParticipants,
      average_participants_per_championship: totalChampionships > 0 ? Math.round(totalParticipants / totalChampionships) : 0,
      total_media: totalMedia,
      average_achievement_rates: averageAchievementRates,
      championships_with_media: records.filter(r => r.hasMediaRecords()).length,
      media_coverage_rate: totalChampionships > 0 ?
        Math.round((records.filter(r => r.hasMediaRecords()).length / totalChampionships) * 100) : 0
    };
  }

  // 静态方法：获取历史锦标赛统计
  public static async getHistoricalStats() {
    const allRecords = await ChampionshipRecord.findAll({
      order: [['championship_date', 'ASC']]
    });

    const totalAllTime = allRecords.length;
    const completedAllTime = allRecords.filter(r => r.completion_status === 'completed').length;
    
    // 按学年分组统计
    const byAcademicYear = allRecords.reduce((acc, record) => {
      const year = record.academic_year;
      if (!acc[year]) {
        acc[year] = { total: 0, completed: 0, participants: 0 };
      }
      acc[year].total++;
      if (record.completion_status === 'completed') {
        acc[year].completed++;
      }
      acc[year].participants += record.total_participants;
      return acc;
    }, {} as { [key: string]: { total: number; completed: number; participants: number } });

    return {
      total_all_time: totalAllTime,
      completed_all_time: completedAllTime,
      completion_rate_all_time: totalAllTime > 0 ? Math.round((completedAllTime / totalAllTime) * 100) : 0,
      by_academic_year: byAcademicYear,
      first_championship_date: allRecords.length > 0 ? allRecords[0].championship_date : null,
      latest_championship_date: allRecords.length > 0 ? allRecords[allRecords.length - 1].championship_date : null,
      total_participants_all_time: allRecords.reduce((sum, r) => sum + r.total_participants, 0)
    };
  }
}

// 初始化模型函数
export const initChampionshipRecordModel = (sequelizeInstance: any) => {
  ChampionshipRecord.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '锦标赛记录ID'
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
      championship_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '锦标赛日期'
      },
      championship_type: {
        type: DataTypes.ENUM('brain_science', 'comprehensive', 'special'),
        allowNull: false,
        comment: '锦标赛类型'
      },
      championship_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '锦标赛名称'
      },
      total_participants: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '参与总人数'
      },
      participating_class_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '参与班级数'
      },
      class_participation_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: '班级参与比例（%）'
      },
      student_participation_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: '学生参与比例（%）'
      },
      brain_science_achievement_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: '神童计划达标率（%）'
      },
      course_content_achievement_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: '课程内容达标率（%）'
      },
      outdoor_training_achievement_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: '户外训练达标率（%）'
      },
      external_display_achievement_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: '外出活动达标率（%）'
      },
      overall_achievement_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: '综合达标率（%）'
      },
      completion_status: {
        type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'planned',
        comment: '完成状态'
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
      awards: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '获得奖项'
      },
      winners: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '获奖者'
      },
      championship_rules: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '锦标赛规则'
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '总结'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注'
      },
      organizer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '组织者ID'
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
      modelName: 'ChampionshipRecord',
      tableName: 'championship_records',
      timestamps: true,
      underscored: true,
      comment: '全员锦标赛记录表'
    }
  );
};

export default ChampionshipRecord;
