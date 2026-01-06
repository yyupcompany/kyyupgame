import { DataTypes, Model, Optional } from 'sequelize';
import { Class } from './class.model';
import { Teacher } from './teacher.model';

// 户外训练记录属性接口
export interface OutdoorTrainingRecordAttributes {
  id: number;
  class_id: number;
  semester: string;
  academic_year: string;
  week_number: number;
  training_date?: Date;
  training_type: 'outdoor_training' | 'departure_display';
  completion_status: 'not_started' | 'in_progress' | 'completed';
  participation_count: number;
  achievement_count: number;
  achievement_rate: number;
  has_media: boolean;
  media_count: number;
  weather_condition?: string;
  training_content?: string;
  notes?: string;
  teacher_id?: number;
  confirmed_by?: number;
  confirmed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// 创建时的可选属性
export interface OutdoorTrainingRecordCreationAttributes 
  extends Optional<OutdoorTrainingRecordAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 户外训练记录模型类
export class OutdoorTrainingRecord extends Model<OutdoorTrainingRecordAttributes, OutdoorTrainingRecordCreationAttributes>
  implements OutdoorTrainingRecordAttributes {
  
  public id!: number;
  public class_id!: number;
  public semester!: string;
  public academic_year!: string;
  public week_number!: number;
  public training_date?: Date;
  public training_type!: 'outdoor_training' | 'departure_display';
  public completion_status!: 'not_started' | 'in_progress' | 'completed';
  public participation_count!: number;
  public achievement_count!: number;
  public achievement_rate!: number;
  public has_media!: boolean;
  public media_count!: number;
  public weather_condition?: string;
  public training_content?: string;
  public notes?: string;
  public teacher_id?: number;
  public confirmed_by?: number;
  public confirmed_at?: Date;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联属性
  public class?: Class;
  public teacher?: Teacher;

  // 静态关联方法
  public static associate() {
    // 与班级表的关联
    OutdoorTrainingRecord.belongsTo(Class, {
      foreignKey: 'class_id',
      as: 'class'
    });

    // 与教师表的关联
    OutdoorTrainingRecord.belongsTo(Teacher, {
      foreignKey: 'teacher_id',
      as: 'teacher',
      constraints: false
    });
  }

  // 实例方法：获取训练类型描述
  public getTrainingTypeDescription(): string {
    const typeMap = {
      'outdoor_training': '户外训练',
      'departure_display': '离园展示'
    };
    return typeMap[this.training_type] || '未知类型';
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
    if (this.participation_count === 0) return 0;
    return Math.round((this.achievement_count / this.participation_count) * 100);
  }

  // 实例方法：获取学期描述
  public getSemesterDescription(): string {
    return `${this.academic_year}学年 ${this.semester}`;
  }

  // 实例方法：获取周次描述
  public getWeekDescription(): string {
    return `第${this.week_number}周`;
  }

  // 实例方法：检查是否已完成
  public isCompleted(): boolean {
    return this.completion_status === 'completed';
  }

  // 实例方法：检查是否已确认
  public isConfirmed(): boolean {
    return this.confirmed_at !== null;
  }

  // 实例方法：获取天气状况描述
  public getWeatherDescription(): string {
    if (!this.weather_condition) return '未记录';
    const weatherMap: { [key: string]: string } = {
      'sunny': '晴天',
      'cloudy': '多云',
      'rainy': '雨天',
      'windy': '大风',
      'snowy': '雪天'
    };
    return weatherMap[this.weather_condition] || this.weather_condition;
  }

  // 实例方法：获取媒体状态描述
  public getMediaStatusDescription(): string {
    if (!this.has_media) return '无媒体';
    return `${this.media_count}个媒体文件`;
  }

  // 静态方法：按班级和学期统计完成情况
  public static async getCompletionStats(classId: number, semester: string, academicYear: string) {
    const records = await OutdoorTrainingRecord.findAll({
      where: {
        class_id: classId,
        semester,
        academic_year: academicYear
      }
    });

    const totalWeeks = 16;
    const completedWeeks = records.filter(r => r.completion_status === 'completed').length;
    const outdoorTrainingWeeks = records.filter(r => r.training_type === 'outdoor_training' && r.completion_status === 'completed').length;
    const departureDisplayWeeks = records.filter(r => r.training_type === 'departure_display' && r.completion_status === 'completed').length;

    return {
      total_weeks: totalWeeks,
      completed_weeks: completedWeeks,
      outdoor_training_weeks: outdoorTrainingWeeks,
      departure_display_weeks: departureDisplayWeeks,
      completion_rate: Math.round((completedWeeks / totalWeeks) * 100),
      outdoor_training_rate: Math.round((outdoorTrainingWeeks / totalWeeks) * 100),
      departure_display_rate: Math.round((departureDisplayWeeks / totalWeeks) * 100)
    };
  }
}

// 初始化模型函数
export const initOutdoorTrainingRecordModel = (sequelizeInstance: any) => {
  OutdoorTrainingRecord.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '户外训练记录ID'
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
      week_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '第几周（1-16）'
      },
      training_type: {
        type: DataTypes.ENUM('outdoor_training', 'departure_display'),
        allowNull: false,
        comment: '训练类型'
      },
      training_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '训练日期'
      },
      completion_status: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
        defaultValue: 'not_started',
        comment: '完成状态'
      },
      participation_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '参与人数'
      },
      achievement_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '达标人数'
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
      weather_condition: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '天气状况'
      },
      training_content: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '训练内容'
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
      confirmed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '确认人ID'
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
      modelName: 'OutdoorTrainingRecord',
      tableName: 'outdoor_training_records',
      timestamps: true,
      underscored: true,
      comment: '户外训练记录表'
    }
  );
};

export default OutdoorTrainingRecord;
