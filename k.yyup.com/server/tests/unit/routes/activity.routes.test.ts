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

describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '@/app';

describe('Activity Routes', () => {
  it('should get all activities', async () => {
    // Mock the service call
    vi.mock('@/services/activity/activity.service', () => {
      return {
        ActivityService: vi.fn().mockImplementation(() => {
          return {
            getAllActivities: vi.fn().mockResolvedValue([
              { id: 1, name: 'Test Activity 1' },
              { id: 2, name: 'Test Activity 2' }
            ])
          };
        })
      };
    });

    const response = await request(app).get('/api/activities');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should create a new activity', async () => {
    // Mock the service call
    vi.mock('@/services/activity/activity.service', () => {
      return {
        ActivityService: vi.fn().mockImplementation(() => {
          return {
            createActivity: vi.fn().mockResolvedValue({
              id: 1,
              name: 'New Test Activity'
            })
          };
        })
      };
    });

    const newActivity = {
      name: 'New Test Activity',
      description: 'Test description'
    };

    const response = await request(app)
      .post('/api/activities')
      .send(newActivity);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.name).toBe('New Test Activity');
  });

  it('should get activity by id', async () => {
    // Mock the service call
    vi.mock('@/services/activity/activity.service', () => {
      return {
        ActivityService: vi.fn().mockImplementation(() => {
          return {
            getActivityById: vi.fn().mockResolvedValue({
              id: 1,
              name: 'Test Activity'
            })
          };
        })
      };
    });

    const response = await request(app).get('/api/activities/1');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(1);
  });

  it('should update an activity', async () => {
    // Mock the service call
    vi.mock('@/services/activity/activity.service', () => {
      return {
        ActivityService: vi.fn().mockImplementation(() => {
          return {
            updateActivity: vi.fn().mockResolvedValue({
              id: 1,
              name: 'Updated Activity'
            })
          };
        })
      };
    });

    const updatedActivity = {
      name: 'Updated Activity',
      description: 'Updated description'
    };

    const response = await request(app)
      .put('/api/activities/1')
      .send(updatedActivity);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Updated Activity');
  });

  it('should delete an activity', async () => {
    // Mock the service call
    vi.mock('@/services/activity/activity.service', () => {
      return {
        ActivityService: vi.fn().mockImplementation(() => {
          return {
            deleteActivity: vi.fn().mockResolvedValue(undefined)
          };
        })
      };
    });

    const response = await request(app).delete('/api/activities/1');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Activity deleted successfully');
  });
});