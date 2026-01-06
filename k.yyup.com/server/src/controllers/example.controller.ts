import { Request, Response, NextFunction } from 'express';

/**
 * 示例控制器 - 用于测试目的
 */
export class ExampleController {
  private examples: any[] = [];
  private nextId = 1;

  /**
   * 创建新示例
   */
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description, status } = req.body;
      
      // 基本验证
      if (!name || name.trim() === '') {
        res.status(400).json({
          success: false,
          message: '名称不能为空',
          error: 'Name is required'
        });
        return;
      }

      const example = {
        id: this.nextId++,
        name: name.trim(),
        description: description || '',
        status: status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.examples.push(example);
      
      res.status(201).json(example);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取示例列表
   */
  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(this.examples);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 根据ID获取示例
   */
  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      const example = this.examples.find(e => e.id === id);
      
      if (!example) {
        res.status(404).json({
          success: false,
          message: '示例不存在',
          error: 'Example not found'
        });
        return;
      }

      res.status(200).json(example);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 更新示例
   */
  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      const exampleIndex = this.examples.findIndex(e => e.id === id);
      
      if (exampleIndex === -1) {
        res.status(404).json({
          success: false,
          message: '示例不存在',
          error: 'Example not found'
        });
        return;
      }

      const { name, description, status } = req.body;
      const updatedExample = {
        ...this.examples[exampleIndex],
        name: name || this.examples[exampleIndex].name,
        description: description || this.examples[exampleIndex].description,
        status: status || this.examples[exampleIndex].status,
        updatedAt: new Date().toISOString()
      };

      this.examples[exampleIndex] = updatedExample;
      
      res.status(200).json(updatedExample);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 删除示例
   */
  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      const exampleIndex = this.examples.findIndex(e => e.id === id);
      
      if (exampleIndex === -1) {
        res.status(404).json({
          success: false,
          message: '示例不存在',
          error: 'Example not found'
        });
        return;
      }

      this.examples.splice(exampleIndex, 1);
      
      res.status(200).json({
        success: true,
        message: '删除成功',
        id: id
      });
    } catch (error) {
      next(error);
    }
  };
}