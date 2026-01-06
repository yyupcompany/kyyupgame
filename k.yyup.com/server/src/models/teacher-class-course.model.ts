import { Model, DataTypes, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';

// 教师-班级-课程关联表接口
export interface TeacherClassCourseAttributes {
  id: number;
  teacher_id: number;
  class_id: number;
  course_plan_id: number;
  brain_science_course_id: number;
  assigned_by?: number;
  assigned_at: Date;
  status: 'assigned' | 'in_progress' | 'completed' | 'paused';
  start_date?: Date;
  expected_end_date?: Date;
  actual_end_date?: Date;
  remarks?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TeacherClassCourseCreationAttributes
  extends Optional<TeacherClassCourseAttributes, 'id' | 'assigned_by' | 'assigned_at' | 'start_date' | 'expected_end_date' | 'actual_end_date' | 'remarks' | 'created_at' | 'updated_at'> {}

export class TeacherClassCourse extends Model<TeacherClassCourseAttributes, TeacherClassCourseCreationAttributes>
  implements TeacherClassCourseAttributes {
  public id!: number;
  public teacher_id!: number;
  public class_id!: number;
  public course_plan_id!: number;
  public brain_science_course_id!: number;
  public assigned_by?: number;
  public assigned_at!: Date;
  public status!: 'assigned' | 'in_progress' | 'completed' | 'paused';
  public start_date?: Date;
  public expected_end_date?: Date;
  public actual_end_date?: Date;
  public remarks?: string;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联
  public static associations: {
    teacher?: Association<TeacherClassCourse, any>;
    class?: Association<TeacherClassCourse, any>;
    coursePlan?: Association<TeacherClassCourse, any>;
    brainScienceCourse?: Association<TeacherClassCourse, any>;
    assignedByUser?: Association<TeacherClassCourse, any>;
    records?: Association<TeacherClassCourse, any>;
  };

  public static associate() {
    const { User, Class, CoursePlan, BrainScienceCourse, TeacherCourseRecord } = require('./index');
    
    TeacherClassCourse.belongsTo(User, {
      foreignKey: 'teacher_id',
      as: 'teacher'
    });

    TeacherClassCourse.belongsTo(Class, {
      foreignKey: 'class_id',
      as: 'class'
    });

    TeacherClassCourse.belongsTo(CoursePlan, {
      foreignKey: 'course_plan_id',
      as: 'coursePlan'
    });

    TeacherClassCourse.belongsTo(BrainScienceCourse, {
      foreignKey: 'brain_science_course_id',
      as: 'brainScienceCourse'
    });

    TeacherClassCourse.belongsTo(User, {
      foreignKey: 'assigned_by',
      as: 'assignedByUser'
    });

    TeacherClassCourse.hasMany(TeacherCourseRecord, {
      foreignKey: 'teacher_class_course_id',
      as: 'records'
    });
  }

  // 获取教师的所有课程
  public static async getTeacherCourses(teacherId: number, options?: {
    status?: string;
    classId?: number;
    includeRecords?: boolean;
  }) {
    const where: any = { teacher_id: teacherId };
    
    if (options?.status) {
      where.status = options.status;
    }
    
    if (options?.classId) {
      where.class_id = options.classId;
    }

    const include: any[] = [
      { association: 'class', attributes: ['id', 'class_name'] },
      { association: 'coursePlan', attributes: ['id', 'plan_name', 'description'] },
      { association: 'brainScienceCourse', attributes: ['id', 'course_name', 'age_group', 'domain'] }
    ];

    if (options?.includeRecords) {
      include.push({
        association: 'records',
        separate: true,
        order: [['lesson_date', 'DESC']]
      });
    }

    return await TeacherClassCourse.findAll({
      where,
      include,
      order: [['created_at', 'DESC']]
    });
  }

  // 获取课程统计
  public static async getCourseStats(teacherId: number) {
    const courses = await TeacherClassCourse.findAll({
      where: { teacher_id: teacherId },
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true
    });

    return courses.reduce((acc: any, curr: any) => {
      acc[curr.status] = parseInt(curr.count);
      return acc;
    }, {
      assigned: 0,
      in_progress: 0,
      completed: 0,
      paused: 0
    });
  }
}

export const initTeacherClassCourseModel = (sequelizeInstance: any) => {
  TeacherClassCourse.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      brain_science_course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '脑科学课程ID'
      },
      assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '分配人ID'
      },
      assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: '分配时间'
      },
      status: {
        type: DataTypes.ENUM('assigned', 'in_progress', 'completed', 'paused'),
        defaultValue: 'assigned',
        comment: '课程状态'
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '开始日期'
      },
      expected_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '预计结束日期'
      },
      actual_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '实际结束日期'
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注'
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
      tableName: 'teacher_class_courses',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['teacher_id', 'class_id', 'course_plan_id']
        },
        {
          fields: ['teacher_id']
        },
        {
          fields: ['class_id']
        },
        {
          fields: ['status']
        }
      ]
    }
  );
};

export default TeacherClassCourse;
