import { Model, DataTypes, Optional, Association, Sequelize } from 'sequelize';

/**
 * 课程分配属性接口
 * 用于将课程分配给教师，建立 Admin/园长创建的课程 与 教师 之间的关联
 */
export interface CourseAssignmentAttributes {
  id: number;
  course_id: number;              // 关联 custom_courses 表
  teacher_id: number;             // 教师ID
  class_id: number;               // 班级ID
  assigned_by: number;            // 分配人ID (Admin/园长)
  assigned_at: Date;              // 分配时间
  status: 'assigned' | 'in_progress' | 'completed' | 'paused'; // 状态
  start_date?: Date;              // 开始日期
  expected_end_date?: Date;       // 预期结束日期
  actual_end_date?: Date;         // 实际结束日期
  notes?: string;                 // 备注
  is_active: boolean;             // 是否有效
  created_at: Date;
  updated_at: Date;
}

/**
 * 创建时的可选属性
 */
export interface CourseAssignmentCreationAttributes
  extends Optional<CourseAssignmentAttributes,
    | 'id'
    | 'assigned_at'
    | 'start_date'
    | 'expected_end_date'
    | 'actual_end_date'
    | 'notes'
    | 'is_active'
    | 'created_at'
    | 'updated_at'> {}

/**
 * 课程分配模型类
 */
export class CourseAssignment
  extends Model<CourseAssignmentAttributes, CourseAssignmentCreationAttributes>
  implements CourseAssignmentAttributes {
  public id!: number;
  public course_id!: number;
  public teacher_id!: number;
  public class_id!: number;
  public assigned_by!: number;
  public assigned_at!: Date;
  public status!: 'assigned' | 'in_progress' | 'completed' | 'paused';
  public start_date?: Date;
  public expected_end_date?: Date;
  public actual_end_date?: Date;
  public notes?: string;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // 关联
  public static associations: {
    course: Association<CourseAssignment, any>;
    teacher: Association<CourseAssignment, any>;
    class: Association<CourseAssignment, any>;
    assignedByUser: Association<CourseAssignment, any>;
  };

  public static associate(models: any) {
    // 从参数中获取模型，避免循环依赖和 require 问题
    const { CustomCourse, User, Class, TeacherCourseRecord } = models;

    // 关联课程
    if (CustomCourse) {
      CourseAssignment.belongsTo(CustomCourse, {
        foreignKey: 'course_id',
        as: 'course'
      });
    }

    // 关联教师 (通过 teacher_id 关联 User 表)
    if (User) {
      CourseAssignment.belongsTo(User, {
        foreignKey: 'teacher_id',
        as: 'teacher'
      });

      // 关联分配人
      CourseAssignment.belongsTo(User, {
        foreignKey: 'assigned_by',
        as: 'assignedByUser'
      });
    }

    // 关联班级
    if (Class) {
      CourseAssignment.belongsTo(Class, {
        foreignKey: 'class_id',
        as: 'class'
      });
    }

    // 关联教学记录
    if (TeacherCourseRecord && TeacherCourseRecord.rawAttributes) {
      CourseAssignment.hasMany(TeacherCourseRecord, {
        foreignKey: 'assignment_id',
        as: 'records'
      });
    }
  }
}

/**
 * 初始化课程分配模型
 */
export function initCourseAssignmentModel(sequelize: Sequelize) {
  CourseAssignment.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: '分配ID'
      },
      course_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '课程ID',
        references: {
          model: 'custom_courses',
          key: 'id'
        }
      },
      teacher_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '教师ID',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      class_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '班级ID',
        references: {
          model: 'classes',
          key: 'id'
        }
      },
      assigned_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '分配人ID',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '分配时间'
      },
      status: {
        type: DataTypes.ENUM('assigned', 'in_progress', 'completed', 'paused'),
        allowNull: false,
        defaultValue: 'assigned',
        comment: '分配状态'
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '开始日期'
      },
      expected_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '预期结束日期'
      },
      actual_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '实际结束日期'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否有效'
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
      sequelize,
      tableName: 'course_assignments',
      indexes: [
        {
          fields: ['course_id']
        },
        {
          fields: ['teacher_id']
        },
        {
          fields: ['class_id']
        },
        {
          fields: ['assigned_by']
        },
        {
          fields: ['status']
        },
        {
          fields: ['is_active']
        },
        {
          // 联合索引，防止重复分配
          fields: ['course_id', 'teacher_id', 'class_id'],
          unique: true,
          name: 'unique_assignment'
        }
      ],
      comment: '课程分配表 - 建立课程与教师的分配关系'
    }
  );

  return CourseAssignment;
}

export default CourseAssignment;
