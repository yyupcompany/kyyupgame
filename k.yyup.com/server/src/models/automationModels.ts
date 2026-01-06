import { DataTypes, Model, Optional, Sequelize } from 'sequelize'
import { User } from './user.model'

// 暂时注释掉模型定义，使用mock数据版本
// const sequelize = (global as any).sequelize || require('../config/database').sequelize

// 自动化任务接口
interface AutomationTaskAttributes {
  id: string
  name: string
  description?: string
  url: string
  steps: any[]
  config: any
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
  progress: number
  templateId?: string
  userId: string
  lastExecuted?: Date
  createdAt: Date
  updatedAt: Date
}

interface AutomationTaskCreationAttributes extends Optional<AutomationTaskAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// 自动化任务模型
export class AutomationTask extends Model<AutomationTaskAttributes, AutomationTaskCreationAttributes> 
  implements AutomationTaskAttributes {
  
  public id!: string
  public name!: string
  public description?: string
  public url!: string
  public steps!: any[]
  public config!: any
  public status!: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
  public progress!: number
  public templateId?: string
  public userId!: string
  public lastExecuted?: Date
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // 关联
  public user?: User
}

/*AutomationTask.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '任务名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '任务描述'
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '目标网站URL'
  },
  steps: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: '任务步骤配置'
  },
  config: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    comment: '任务配置信息'
  },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'completed', 'failed', 'stopped'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '任务状态'
  },
  progress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    },
    comment: '执行进度（0-100）'
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: '关联的模板ID'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '创建用户ID'
  },
  lastExecuted: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后执行时间'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize: sequelize as Sequelize,
  tableName: 'automation_tasks',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['templateId']
    },
    {
      fields: ['createdAt']
    }
  ]
})

// 自动化模板接口
interface AutomationTemplateAttributes {
  id: string
  name: string
  description?: string
  category: 'web' | 'form' | 'data' | 'test' | 'custom'
  complexity: 'simple' | 'medium' | 'complex'
  steps: any[]
  parameters: any[]
  config: any
  usageCount: number
  version: string
  status: 'draft' | 'published' | 'archived'
  isPublic: boolean
  allowParameterization: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

interface AutomationTemplateCreationAttributes extends Optional<AutomationTemplateAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// 自动化模板模型
export class AutomationTemplate extends Model<AutomationTemplateAttributes, AutomationTemplateCreationAttributes> 
  implements AutomationTemplateAttributes {
  
  public id!: string
  public name!: string
  public description?: string
  public category!: 'web' | 'form' | 'data' | 'test' | 'custom'
  public complexity!: 'simple' | 'medium' | 'complex'
  public steps!: any[]
  public parameters!: any[]
  public config!: any
  public usageCount!: number
  public version!: string
  public status!: 'draft' | 'published' | 'archived'
  public isPublic!: boolean
  public allowParameterization!: boolean
  public userId!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // 关联
  public user?: User
}

AutomationTemplate.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '模板名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '模板描述'
  },
  category: {
    type: DataTypes.ENUM('web', 'form', 'data', 'test', 'custom'),
    allowNull: false,
    defaultValue: 'custom',
    comment: '模板分类'
  },
  complexity: {
    type: DataTypes.ENUM('simple', 'medium', 'complex'),
    allowNull: false,
    defaultValue: 'simple',
    comment: '复杂度级别'
  },
  steps: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: '模板步骤配置'
  },
  parameters: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: '模板参数配置'
  },
  config: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    comment: '模板配置信息'
  },
  usageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '使用次数'
  },
  version: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '1.0.0',
    comment: '模板版本'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    allowNull: false,
    defaultValue: 'draft',
    comment: '模板状态'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否公开'
  },
  allowParameterization: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否允许参数化'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '创建用户ID'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'automation_templates',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['isPublic']
    },
    {
      fields: ['usageCount']
    }
  ]
})

// 执行历史接口
interface ExecutionHistoryAttributes {
  id: string
  taskId: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  startTime: Date
  endTime?: Date
  logs?: string
  result?: string
  error?: string
  createdAt: Date
  updatedAt: Date
}

interface ExecutionHistoryCreationAttributes extends Optional<ExecutionHistoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// 执行历史模型
export class ExecutionHistory extends Model<ExecutionHistoryAttributes, ExecutionHistoryCreationAttributes> 
  implements ExecutionHistoryAttributes {
  
  public id!: string
  public taskId!: string
  public status!: 'running' | 'completed' | 'failed' | 'stopped'
  public startTime!: Date
  public endTime?: Date
  public logs?: string
  public result?: string
  public error?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // 关联
  public task?: AutomationTask
}

ExecutionHistory.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '关联的任务ID'
  },
  status: {
    type: DataTypes.ENUM('running', 'completed', 'failed', 'stopped'),
    allowNull: false,
    comment: '执行状态'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '开始执行时间'
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '结束执行时间'
  },
  logs: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: '执行日志（JSON格式）'
  },
  result: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: '执行结果（JSON格式）'
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '错误信息'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'execution_histories',
  indexes: [
    {
      fields: ['taskId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['startTime']
    }
  ]
})

// 模型关联
AutomationTask.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasMany(AutomationTask, { foreignKey: 'userId', as: 'automationTasks' })

AutomationTemplate.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasMany(AutomationTemplate, { foreignKey: 'userId', as: 'automationTemplates' })

AutomationTask.belongsTo(AutomationTemplate, { foreignKey: 'templateId', as: 'template' })
AutomationTemplate.hasMany(AutomationTask, { foreignKey: 'templateId', as: 'tasks' })

ExecutionHistory.belongsTo(AutomationTask, { foreignKey: 'taskId', as: 'task' })
AutomationTask.hasMany(ExecutionHistory, { foreignKey: 'taskId', as: 'executions' })

export { AutomationTaskAttributes, AutomationTemplateAttributes, ExecutionHistoryAttributes }*/