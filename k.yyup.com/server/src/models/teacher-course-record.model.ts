import { Model, DataTypes, Optional, Association } from 'sequelize';

// 教师课程执行记录接口
export interface TeacherCourseRecordAttributes {
  id: number;
  teacher_class_course_id: number;
  teacher_id: number;
  class_id: number;
  course_plan_id: number;
  lesson_number?: number;
  lesson_date: Date;
  lesson_duration?: number;
  attendance_count?: number;
  teaching_content?: string;
  teaching_method?: string;
  teaching_effect?: 'excellent' | 'good' | 'average' | 'poor';
  student_feedback?: string;
  difficulties?: string;
  improvements?: string;
  media_files?: any;
  created_at: Date;
  updated_at: Date;
}

export interface TeacherCourseRecordCreationAttributes
  extends Optional<TeacherCourseRecordAttributes, 'id' | 'lesson_number' | 'lesson_duration' | 'attendance_count' | 'teaching_content' | 'teaching_method' | 'teaching_effect' | 'student_feedback' | 'difficulties' | 'improvements' | 'media_files' | 'created_at' | 'updated_at'> {}

export class TeacherCourseRecord extends Model<TeacherCourseRecordAttributes, TeacherCourseRecordCreationAttributes>
  implements TeacherCourseRecordAttributes {
  public id!: number;
  public teacher_class_course_id!: number;
  public teacher_id!: number;
  public class_id!: number;
  public course_plan_id!: number;
  public lesson_number?: number;
  public lesson_date!: Date;
  public lesson_duration?: number;
  public attendance_count?: number;
  public teaching_content?: string;
  public teaching_method?: string;
  public teaching_effect?: 'excellent' | 'good' | 'average' | 'poor';
  public student_feedback?: string;
  public difficulties?: string;
  public improvements?: string;
  public media_files?: any;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联
  public static associations: {
    teacherClassCourse?: Association<TeacherCourseRecord, any>;
    teacher?: Association<TeacherCourseRecord, any>;
    class?: Association<TeacherCourseRecord, any>;
    coursePlan?: Association<TeacherCourseRecord, any>;
  };

  public static associate() {
    const { TeacherClassCourse, User, Class, CoursePlan } = require('./index');
    
    TeacherCourseRecord.belongsTo(TeacherClassCourse, {
      foreignKey: 'teacher_class_course_id',
      as: 'teacherClassCourse'
    });

    TeacherCourseRecord.belongsTo(User, {
      foreignKey: 'teacher_id',
      as: 'teacher'
    });

    TeacherCourseRecord.belongsTo(Class, {
      foreignKey: 'class_id',
      as: 'class'
    });

    TeacherCourseRecord.belongsTo(CoursePlan, {
      foreignKey: 'course_plan_id',
      as: 'coursePlan'
    });
  }

  // 获取课程记录列表
  public static async getCourseRecords(teacherClassCourseId: number, options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const where: any = { teacher_class_course_id: teacherClassCourseId };
    
    if (options?.startDate || options?.endDate) {
      where.lesson_date = {};
      if (options.startDate) {
        where.lesson_date.$gte = options.startDate;
      }
      if (options.endDate) {
        where.lesson_date.$lte = options.endDate;
      }
    }

    return await TeacherCourseRecord.findAll({
      where,
      order: [['lesson_date', 'DESC']],
      limit: options?.limit || 50
    });
  }

  // 获取课程统计
  public static async getRecordStats(teacherClassCourseId: number) {
    const records = await TeacherCourseRecord.findAll({
      where: { teacher_class_course_id: teacherClassCourseId },
      attributes: [
        'teaching_effect',
        [TeacherCourseRecord.sequelize!.fn('COUNT', TeacherCourseRecord.sequelize!.col('id')), 'count'],
        [TeacherCourseRecord.sequelize!.fn('AVG', TeacherCourseRecord.sequelize!.col('attendance_count')), 'avg_attendance']
      ],
      group: ['teaching_effect'],
      raw: true
    });

    return records;
  }
}

export const initTeacherCourseRecordModel = (sequelizeInstance: any) => {
  TeacherCourseRecord.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      teacher_class_course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '教师课程关联ID'
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '教师ID'
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '班级ID'
      },
      course_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '课程计划ID'
      },
      lesson_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '第几课'
      },
      lesson_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '上课日期'
      },
      lesson_duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '课时(分钟)'
      },
      attendance_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '出勤人数'
      },
      teaching_content: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '教学内容'
      },
      teaching_method: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '教学方法'
      },
      teaching_effect: {
        type: DataTypes.ENUM('excellent', 'good', 'average', 'poor'),
        allowNull: true,
        comment: '教学效果'
      },
      student_feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '学生反馈'
      },
      difficulties: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '遇到的困难'
      },
      improvements: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '改进建议'
      },
      media_files: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '媒体文件'
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
      }
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'teacher_course_records',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['teacher_class_course_id']
        },
        {
          fields: ['teacher_id']
        },
        {
          fields: ['lesson_date']
        }
      ]
    }
  );
};

export default TeacherCourseRecord;
