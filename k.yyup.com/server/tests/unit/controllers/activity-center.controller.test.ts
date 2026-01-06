import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivityCenterController } from '@/controllers/activity-center.controller';
import { ActivityCenterService } from '@/services/activity/activity-center.service';

// Mock the service
vi.mock('@/services/activity/activity-center.service', () => {
  return {
    ActivityCenterService: vi.fn().mockImplementation(() => {
      return {
        getAllActivities: vi.fn().mockResolvedValue([{ id: 1, name: 'Test Activity' }]),
        createActivity: vi.fn().mockResolvedValue({ id: 1, name: 'Test Activity' }),
        updateActivity: vi.fn().mockResolvedValue({ id: 1, name: 'Updated Activity' }),
        deleteActivity: vi.fn().mockResolvedValue(undefined)
      };
    })
  };
});

describe('ActivityCenterController', () => {
  let controller: ActivityCenterController;
  let service: ActivityCenterService;

  beforeEach(() => {
    service = new ActivityCenterService();
    controller = new ActivityCenterController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all activities', async () => {
    const req = {};
    const res = {
      json: vi.fn()
    };
    const next = vi.fn();

    await controller.getAllActivities(req as any, res as any, next);
    
    expect(service.getAllActivities).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ id: 1, name: 'Test Activity' }]
    });
  });

  it('should create an activity', async () => {
    const req = {
      body: {
        name: 'Test Activity'
      }
    };
    const res = {
      json: vi.fn()
    };
    const next = vi.fn();

    await controller.createActivity(req as any, res as any, next);
    
    expect(service.createActivity).toHaveBeenCalledWith({
      name: 'Test Activity'
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 1, name: 'Test Activity' }
    });
  });

  it('should update an activity', async () => {
    const req = {
      params: {
        id: '1'
      },
      body: {
        name: 'Updated Activity'
      }
    };
    const res = {
      json: vi.fn()
    };
    const next = vi.fn();

    await controller.updateActivity(req as any, res as any, next);
    
    expect(service.updateActivity).toHaveBeenCalledWith(1, {
      name: 'Updated Activity'
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 1, name: 'Updated Activity' }
    });
  });

  it('should delete an activity', async () => {
    const req = {
      params: {
        id: '1'
      }
    };
    const res = {
      json: vi.fn()
    };
    const next = vi.fn();

    await controller.deleteActivity(req as any, res as any, next);
    
    expect(service.deleteActivity).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Activity deleted successfully'
    });
  });
});