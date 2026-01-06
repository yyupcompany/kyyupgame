import { Request, Response } from 'express'
import * as websiteAutomationService from '../services/websiteAutomationService'
import { ApiResponse } from '../types/api'
import { ErrorHandler } from '../utils/errorHandler'

/**
 * 网站自动化控制器
 */
export class WebsiteAutomationController {
  
  /**
   * 获取所有任务
   */
  async getAllTasks(req: Request, res: Response) {
    try {
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      const tasks = await websiteAutomationService.getAllTasks(userId)
      res.json(ApiResponse.success(tasks))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 创建新任务
   */
  async createTask(req: Request, res: Response) {
    try {
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      const taskData = req.body
      const task = await websiteAutomationService.createTask(userId, taskData)
      res.status(201).json(ApiResponse.success(task, '任务创建成功'))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 更新任务
   */
  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      const taskData = req.body
      const task = await websiteAutomationService.updateTask(id, userId, taskData)
      res.json(ApiResponse.success(task, '任务更新成功'))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 删除任务
   */
  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      await websiteAutomationService.deleteTask(id, userId)
      res.json(ApiResponse.success(null, '任务删除成功'))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 执行任务
   */
  async executeTask(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      const result = await websiteAutomationService.executeTask(id, userId)
      res.json(ApiResponse.success(result, '任务执行成功'))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 停止任务执行
   */
  async stopTask(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      await websiteAutomationService.stopTask(id, userId)
      res.json(ApiResponse.success(null, '任务已停止'))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 获取任务执行历史
   */
  async getTaskHistory(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      const history = await websiteAutomationService.getTaskHistory(id, userId)
      res.json(ApiResponse.success(history))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 获取所有任务模板
   */
  async getAllTemplates(req: Request, res: Response) {
    try {
      const userId = req.user?.id?.toString()
      const templates = await websiteAutomationService.getAllTemplates(userId)
      res.json(ApiResponse.success(templates))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 创建任务模板
   */
  async createTemplate(req: Request, res: Response) {
    try {
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      const templateData = req.body
      const template = await websiteAutomationService.createTemplate(userId, templateData)
      res.status(201).json(ApiResponse.success(template, '模板创建成功'))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 更新任务模板
   */
  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      const templateData = req.body
      const template = await websiteAutomationService.updateTemplate(id, userId, templateData)
      res.json(ApiResponse.success(template, '模板更新成功'))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 删除任务模板
   */
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      await websiteAutomationService.deleteTemplate(id, userId)
      res.json(ApiResponse.success(null, '模板删除成功'))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 基于模板创建任务
   */
  async createTaskFromTemplate(req: Request, res: Response) {
    try {
      const { templateId } = req.params
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      const { parameters } = req.body
      const task = await websiteAutomationService.createTaskFromTemplate(templateId, userId, parameters)
      res.status(201).json(ApiResponse.success(task, '基于模板创建任务成功'))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 网页截图
   */
  async captureScreenshot(req: Request, res: Response) {
    try {
      const { url, options } = req.body
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      const screenshot = await websiteAutomationService.captureScreenshot(url, options)
      res.json(ApiResponse.success(screenshot, '截图成功'))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 分析网页元素
   */
  async analyzePageElements(req: Request, res: Response) {
    try {
      const { url, screenshot, config } = req.body
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      const analysis = await websiteAutomationService.analyzePageElements(url, screenshot, config)
      res.json(ApiResponse.success(analysis, '页面分析成功'))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 智能元素查找
   */
  async findElementByDescription(req: Request, res: Response) {
    try {
      const { url, description, screenshot } = req.body
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      const elements = await websiteAutomationService.findElementByDescription(url, description, screenshot)
      res.json(ApiResponse.success(elements, '元素查找成功'))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }

  /**
   * 获取网站自动化统计数据
   */
  async getStatistics(req: Request, res: Response) {
    try {
      const userId = req.user?.id?.toString()
      if (!userId) {
        return res.status(401).json(ApiResponse.error('用户未认证'))
      }

      const stats = await websiteAutomationService.getStatistics(userId)
      res.json(ApiResponse.success(stats))
    } catch (error) {
      ErrorHandler.handleError(error, res)
    }
  }
}

export const websiteAutomationController = new WebsiteAutomationController()