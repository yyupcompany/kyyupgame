import { TestDataFactory } from '../helpers/testUtils';

describe('Route Configuration Unit Tests', () => {
  describe('Route Definition Tests', () => {
    class MockRoute {
      public method: string;
      public path: string;
      public middlewares: any[] = [];
      public handler: any;
      public description?: string;

      constructor(method: string, path: string, handler: any) {
        this.method = method.toLowerCase();
        this.path = path;
        this.handler = handler;
      }

      use(...middlewares: any[]) {
        this.middlewares.push(...middlewares);
        return this;
      }

      describe(description: string) {
        this.description = description;
        return this;
      }

      validate() {
        const errors: string[] = [];

        if (!this.method) {
          errors.push('HTTP method is required');
        }

        if (!this.path) {
          errors.push('Route path is required');
        }

        if (!this.handler) {
          errors.push('Route handler is required');
        }

        if (this.path && !this.path.startsWith('/')) {
          errors.push('Route path must start with /');
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      }

      matches(method: string, path: string): boolean {
        if (this.method !== method.toLowerCase()) return false;
        
        // Simple path matching (without parameters)
        if (this.path === path) return true;
        
        // Parameter matching (e.g., /users/:id matches /users/123)
        const routeSegments = this.path.split('/');
        const pathSegments = path.split('/');
        
        if (routeSegments.length !== pathSegments.length) return false;
        
        return routeSegments.every((segment, index) => {
          return segment.startsWith(':') || segment === pathSegments[index];
        });
      }

      extractParams(path: string): Record<string, string> {
        const params: Record<string, string> = {};
        const routeSegments = this.path.split('/');
        const pathSegments = path.split('/');

        routeSegments.forEach((segment, index) => {
          if (segment.startsWith(':')) {
            const paramName = segment.slice(1);
            params[paramName] = pathSegments[index];
          }
        });

        return params;
      }
    }

    class MockRouter {
      private routes: MockRoute[] = [];

      get(path: string, handler: any) {
        const route = new MockRoute('get', path, handler);
        this.routes.push(route);
        return route;
      }

      post(path: string, handler: any) {
        const route = new MockRoute('post', path, handler);
        this.routes.push(route);
        return route;
      }

      put(path: string, handler: any) {
        const route = new MockRoute('put', path, handler);
        this.routes.push(route);
        return route;
      }

      delete(path: string, handler: any) {
        const route = new MockRoute('delete', path, handler);
        this.routes.push(route);
        return route;
      }

      use(path: string, router: MockRouter) {
        // Mount sub-router
        router.routes.forEach(route => {
          const newPath = path + route.path;
          const newRoute = new MockRoute(route.method, newPath, route.handler);
          newRoute.middlewares = [...route.middlewares];
          newRoute.description = route.description;
          this.routes.push(newRoute);
        });
      }

      findRoute(method: string, path: string): MockRoute | undefined {
        return this.routes.find(route => route.matches(method, path));
      }

      getRoutes(): MockRoute[] {
        return this.routes;
      }

      validateAllRoutes(): { isValid: boolean; errors: string[] } {
        const allErrors: string[] = [];

        this.routes.forEach((route, index) => {
          const validation = route.validate();
          if (!validation.isValid) {
            allErrors.push(`Route ${index}: ${validation.errors.join(', ')}`);
          }
        });

        return {
          isValid: allErrors.length === 0,
          errors: allErrors
        };
      }
    }

    it('should create basic routes correctly', () => {
      const router = new MockRouter();
      const handler = () => ({ success: true });

      router.get('/users', handler);
      router.post('/users', handler);
      router.put('/users/:id', handler);
      router.delete('/users/:id', handler);

      const routes = router.getRoutes();
      expect(routes).toHaveLength(4);
      expect(routes[0].method).toBe('get');
      expect(routes[0].path).toBe('/users');
      expect(routes[2].path).toBe('/users/:id');
    });

    it('should validate route definitions', () => {
      const validRoute = new MockRoute('get', '/users', () => {});
      const invalidRoute = new MockRoute('', '', null);

      const validResult = validRoute.validate();
      expect(validResult.isValid).toBe(true);

      const invalidResult = invalidRoute.validate();
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('HTTP method is required');
      expect(invalidResult.errors).toContain('Route path is required');
      expect(invalidResult.errors).toContain('Route handler is required');
    });

    it('should validate path format', () => {
      const invalidPathRoute = new MockRoute('get', 'users', () => {});
      const validation = invalidPathRoute.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Route path must start with /');
    });

    it('should match routes correctly', () => {
      const route = new MockRoute('get', '/users/:id', () => {});

      expect(route.matches('get', '/users/123')).toBe(true);
      expect(route.matches('post', '/users/123')).toBe(false);
      expect(route.matches('get', '/users')).toBe(false);
      expect(route.matches('get', '/users/123/posts')).toBe(false);
    });

    it('should extract route parameters', () => {
      const route = new MockRoute('get', '/users/:id/posts/:postId', () => {});
      const params = route.extractParams('/users/123/posts/456');

      expect(params).toEqual({
        id: '123',
        postId: '456'
      });
    });

    it('should add middlewares to routes', () => {
      const authMiddleware = () => {};
      const validationMiddleware = () => {};
      
      const route = new MockRoute('get', '/users', () => {});
      route.use(authMiddleware, validationMiddleware);

      expect(route.middlewares).toHaveLength(2);
      expect(route.middlewares).toContain(authMiddleware);
      expect(route.middlewares).toContain(validationMiddleware);
    });

    it('should find routes by method and path', () => {
      const router = new MockRouter();
      const handler = () => {};

      router.get('/users', handler);
      router.get('/users/:id', handler);

      const route1 = router.findRoute('get', '/users');
      const route2 = router.findRoute('get', '/users/123');
      const route3 = router.findRoute('post', '/users');

      expect(route1).toBeDefined();
      expect(route1?.path).toBe('/users');
      
      expect(route2).toBeDefined();
      expect(route2?.path).toBe('/users/:id');
      
      expect(route3).toBeUndefined();
    });

    it('should mount sub-routers', () => {
      const mainRouter = new MockRouter();
      const apiRouter = new MockRouter();
      const userRouter = new MockRouter();

      const handler = () => {};

      userRouter.get('/profile', handler);
      userRouter.post('/update', handler);

      apiRouter.use('/users', userRouter);
      mainRouter.use('/api/v1', apiRouter);

      const routes = mainRouter.getRoutes();
      expect(routes).toHaveLength(2);
      expect(routes[0].path).toBe('/api/v1/users/profile');
      expect(routes[1].path).toBe('/api/v1/users/update');
    });

    it('should validate all routes in router', () => {
      const router = new MockRouter();

      router.get('/users', () => {});
      router.post('invalid-path', () => {}); // Invalid path

      const validation = router.validateAllRoutes();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
    });
  });

  describe('Route Handler Tests', () => {
    class MockRouteHandler {
      static async getUserProfile(req: any, res: any) {
        try {
          const userId = req.params.id;
          
          if (!userId) {
            return res.status(400).json({
              success: false,
              message: 'User ID is required'
            });
          }

          const user = TestDataFactory.createUser({ id: parseInt(userId) });
          
          return res.status(200).json({
            success: true,
            data: user
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: 'Internal server error'
          });
        }
      }

      static async createUser(req: any, res: any) {
        try {
          const { username, email, password, role } = req.body;

          const errors: string[] = [];
          
          if (!username) errors.push('Username is required');
          if (!email) errors.push('Email is required');
          if (!password) errors.push('Password is required');

          if (errors.length > 0) {
            return res.status(400).json({
              success: false,
              message: 'Validation failed',
              errors
            });
          }

          const newUser = TestDataFactory.createUser({
            username,
            email,
            role: role || 'parent'
          });

          return res.status(201).json({
            success: true,
            data: newUser
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: 'Internal server error'
          });
        }
      }

      static async updateUser(req: any, res: any) {
        try {
          const userId = req.params.id;
          const updateData = req.body;

          if (!userId) {
            return res.status(400).json({
              success: false,
              message: 'User ID is required'
            });
          }

          if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
              success: false,
              message: 'Update data is required'
            });
          }

          const updatedUser = TestDataFactory.createUser({
            id: parseInt(userId),
            ...updateData
          });

          return res.status(200).json({
            success: true,
            data: updatedUser
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: 'Internal server error'
          });
        }
      }

      static async deleteUser(req: any, res: any) {
        try {
          const userId = req.params.id;

          if (!userId) {
            return res.status(400).json({
              success: false,
              message: 'User ID is required'
            });
          }

          return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: 'Internal server error'
          });
        }
      }

      static async getStudentsByClass(req: any, res: any) {
        try {
          const classId = req.params.classId;
          const { page = 1, limit = 10 } = req.query;

          if (!classId) {
            return res.status(400).json({
              success: false,
              message: 'Class ID is required'
            });
          }

          const students = Array.from({ length: parseInt(limit) }, (_, index) => 
            TestDataFactory.createStudent({
              id: index + 1,
              classId: parseInt(classId)
            })
          );

          return res.status(200).json({
            success: true,
            data: students,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: students.length
            }
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: 'Internal server error'
          });
        }
      }

      static async createActivity(req: any, res: any) {
        try {
          const { title, type, startTime, endTime, capacity } = req.body;

          const errors: string[] = [];

          if (!title) errors.push('Activity title is required');
          if (!type) errors.push('Activity type is required');
          if (!startTime) errors.push('Start time is required');
          if (!endTime) errors.push('End time is required');

          if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            
            if (end <= start) {
              errors.push('End time must be after start time');
            }
          }

          if (errors.length > 0) {
            return res.status(400).json({
              success: false,
              message: 'Validation failed',
              errors
            });
          }

          const activity = TestDataFactory.createActivity({
            title,
            type,
            startTime,
            endTime,
            capacity: capacity || 20
          });

          return res.status(201).json({
            success: true,
            data: activity
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: 'Internal server error'
          });
        }
      }
    }

    class MockRequest {
      public params: any = {};
      public body: any = {};
      public query: any = {};
      public headers: any = {};
      public user?: any;

      constructor(options: any = {}) {
        Object.assign(this, options);
      }
    }

    class MockResponse {
      public statusCode: number = 200;
      public data: any;

      status(code: number) {
        this.statusCode = code;
        return this;
      }

      json(data: any) {
        this.data = data;
        return this;
      }

      send(data: any) {
        this.data = data;
        return this;
      }
    }

    it('should handle getUserProfile correctly', async () => {
      const req = new MockRequest({ params: { id: '123' } });
      const res = new MockResponse();

      await MockRouteHandler.getUserProfile(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data).toHaveProperty('id', 123);
    });

    it('should handle getUserProfile with missing ID', async () => {
      const req = new MockRequest({ params: {} });
      const res = new MockResponse();

      await MockRouteHandler.getUserProfile(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('User ID is required');
    });

    it('should handle createUser correctly', async () => {
      const req = new MockRequest({
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'teacher'
        }
      });
      const res = new MockResponse();

      await MockRouteHandler.createUser(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.data).toHaveProperty('username', 'testuser');
      expect(res.data.data).toHaveProperty('role', 'teacher');
    });

    it('should handle createUser validation errors', async () => {
      const req = new MockRequest({
        body: {
          username: '',
          email: '',
          password: ''
        }
      });
      const res = new MockResponse();

      await MockRouteHandler.createUser(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.success).toBe(false);
      expect(res.data.errors).toContain('Username is required');
      expect(res.data.errors).toContain('Email is required');
      expect(res.data.errors).toContain('Password is required');
    });

    it('should handle updateUser correctly', async () => {
      const req = new MockRequest({
        params: { id: '123' },
        body: { username: 'updateduser', email: 'updated@example.com' }
      });
      const res = new MockResponse();

      await MockRouteHandler.updateUser(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data).toHaveProperty('id', 123);
      expect(res.data.data).toHaveProperty('username', 'updateduser');
    });

    it('should handle updateUser with empty data', async () => {
      const req = new MockRequest({
        params: { id: '123' },
        body: {}
      });
      const res = new MockResponse();

      await MockRouteHandler.updateUser(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Update data is required');
    });

    it('should handle deleteUser correctly', async () => {
      const req = new MockRequest({ params: { id: '123' } });
      const res = new MockResponse();

      await MockRouteHandler.deleteUser(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.message).toBe('User deleted successfully');
    });

    it('should handle getStudentsByClass with pagination', async () => {
      const req = new MockRequest({
        params: { classId: '1' },
        query: { page: '2', limit: '5' }
      });
      const res = new MockResponse();

      await MockRouteHandler.getStudentsByClass(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data).toHaveLength(5);
      expect(res.data.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 5
      });
    });

    it('should handle createActivity correctly', async () => {
      const futureDate1 = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const futureDate2 = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();

      const req = new MockRequest({
        body: {
          title: '测试活动',
          type: '户外活动',
          startTime: futureDate1,
          endTime: futureDate2,
          capacity: 25
        }
      });
      const res = new MockResponse();

      await MockRouteHandler.createActivity(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.data).toHaveProperty('title', '测试活动');
      expect(res.data.data).toHaveProperty('capacity', 25);
    });

    it('should handle createActivity validation errors', async () => {
      const req = new MockRequest({
        body: {
          title: '',
          type: '',
          startTime: '2023-12-15T10:00:00Z',
          endTime: '2023-12-15T09:00:00Z' // End before start
        }
      });
      const res = new MockResponse();

      await MockRouteHandler.createActivity(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.success).toBe(false);
      expect(res.data.errors).toContain('Activity title is required');
      expect(res.data.errors).toContain('Activity type is required');
      expect(res.data.errors).toContain('End time must be after start time');
    });
  });

  describe('Route Middleware Integration Tests', () => {
    class MockMiddlewareChain {
      private middlewares: any[] = [];
      private handler: any;

      constructor(handler: any) {
        this.handler = handler;
      }

      use(...middlewares: any[]) {
        this.middlewares.push(...middlewares);
        return this;
      }

      async execute(req: any, res: any): Promise<any> {
        let index = 0;

        const next = async () => {
          if (index < this.middlewares.length) {
            const middleware = this.middlewares[index++];
            await middleware(req, res, next);
          } else {
            // Execute final handler
            return await this.handler(req, res);
          }
        };

        return await next();
      }
    }

    const authMiddleware = (req: any, res: any, next: any) => {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token is required'
        });
      }

      if (token === 'invalid_token') {
        return res.status(403).json({
          success: false,
          message: 'Invalid token'
        });
      }

      req.user = { id: 1, role: 'admin' };
      next();
    };

    const roleMiddleware = (requiredRoles: string[]) => {
      return (req: any, res: any, next: any) => {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        if (!requiredRoles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
          });
        }

        next();
      };
    };

    const validationMiddleware = (req: any, res: any, next: any) => {
      const { title } = req.body;

      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      next();
    };

    const finalHandler = (req: any, res: any) => {
      return res.status(200).json({
        success: true,
        message: 'Success',
        user: req.user
      });
    };

    class MockRequest {
      public headers: any = {};
      public body: any = {};
      public user?: any;

      constructor(options: any = {}) {
        Object.assign(this, options);
      }
    }

    class MockResponse {
      public statusCode: number = 200;
      public data: any;

      status(code: number) {
        this.statusCode = code;
        return this;
      }

      json(data: any) {
        this.data = data;
        return this;
      }
    }

    it('should execute middleware chain successfully', async () => {
      const req = new MockRequest({
        headers: { authorization: 'Bearer valid_token' },
        body: { title: 'Test Title' }
      });
      const res = new MockResponse();

      const chain = new MockMiddlewareChain(finalHandler)
        .use(authMiddleware)
        .use(roleMiddleware(['admin']))
        .use(validationMiddleware);

      await chain.execute(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.user).toEqual({ id: 1, role: 'admin' });
    });

    it('should stop chain on authentication failure', async () => {
      const req = new MockRequest({
        headers: {},
        body: { title: 'Test Title' }
      });
      const res = new MockResponse();

      const chain = new MockMiddlewareChain(finalHandler)
        .use(authMiddleware)
        .use(roleMiddleware(['admin']))
        .use(validationMiddleware);

      await chain.execute(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Access token is required');
    });

    it('should stop chain on invalid token', async () => {
      const req = new MockRequest({
        headers: { authorization: 'Bearer invalid_token' },
        body: { title: 'Test Title' }
      });
      const res = new MockResponse();

      const chain = new MockMiddlewareChain(finalHandler)
        .use(authMiddleware)
        .use(roleMiddleware(['admin']))
        .use(validationMiddleware);

      await chain.execute(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Invalid token');
    });

    it('should stop chain on insufficient permissions', async () => {
      const req = new MockRequest({
        headers: { authorization: 'Bearer valid_token' },
        body: { title: 'Test Title' }
      });
      const res = new MockResponse();

      const chain = new MockMiddlewareChain(finalHandler)
        .use(authMiddleware)
        .use(roleMiddleware(['principal'])) // Different required role
        .use(validationMiddleware);

      await chain.execute(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Insufficient permissions');
    });

    it('should stop chain on validation failure', async () => {
      const req = new MockRequest({
        headers: { authorization: 'Bearer valid_token' },
        body: { title: '' } // Empty title
      });
      const res = new MockResponse();

      const chain = new MockMiddlewareChain(finalHandler)
        .use(authMiddleware)
        .use(roleMiddleware(['admin']))
        .use(validationMiddleware);

      await chain.execute(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Title is required');
    });

    it('should execute without middleware', async () => {
      const req = new MockRequest();
      const res = new MockResponse();

      const chain = new MockMiddlewareChain(finalHandler);

      await chain.execute(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.user).toBeUndefined();
    });
  });

  describe('Route Error Handling Tests', () => {
    class MockErrorHandler {
      static handleError(error: any, req: any, res: any) {
        console.error('Route Error:', error);

        if (error.name === 'ValidationError') {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.errors
          });
        }

        if (error.name === 'UnauthorizedError') {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized access'
          });
        }

        if (error.name === 'ForbiddenError') {
          return res.status(403).json({
            success: false,
            message: 'Access forbidden'
          });
        }

        if (error.name === 'NotFoundError') {
          return res.status(404).json({
            success: false,
            message: 'Resource not found'
          });
        }

        // Default error
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

      static safeHandler(handler: any) {
        return async (req: any, res: any) => {
          try {
            await handler(req, res);
          } catch (error) {
            this.handleError(error, req, res);
          }
        };
      }
    }

    class MockResponse {
      public statusCode: number = 200;
      public data: any;

      status(code: number) {
        this.statusCode = code;
        return this;
      }

      json(data: any) {
        this.data = data;
        return this;
      }
    }

    it('should handle validation errors', () => {
      const error = {
        name: 'ValidationError',
        errors: ['Field is required', 'Invalid format']
      };
      const req = {};
      const res = new MockResponse();

      MockErrorHandler.handleError(error, req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Validation failed');
      expect(res.data.errors).toEqual(['Field is required', 'Invalid format']);
    });

    it('should handle unauthorized errors', () => {
      const error = { name: 'UnauthorizedError' };
      const req = {};
      const res = new MockResponse();

      MockErrorHandler.handleError(error, req, res);

      expect(res.statusCode).toBe(401);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Unauthorized access');
    });

    it('should handle forbidden errors', () => {
      const error = { name: 'ForbiddenError' };
      const req = {};
      const res = new MockResponse();

      MockErrorHandler.handleError(error, req, res);

      expect(res.statusCode).toBe(403);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Access forbidden');
    });

    it('should handle not found errors', () => {
      const error = { name: 'NotFoundError' };
      const req = {};
      const res = new MockResponse();

      MockErrorHandler.handleError(error, req, res);

      expect(res.statusCode).toBe(404);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Resource not found');
    });

    it('should handle generic errors', () => {
      const error = { message: 'Something went wrong' };
      const req = {};
      const res = new MockResponse();

      MockErrorHandler.handleError(error, req, res);

      expect(res.statusCode).toBe(500);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Internal server error');
    });

    it('should wrap handlers with error handling', async () => {
      const throwingHandler = async (req: any, res: any) => {
        throw new Error('Handler error');
      };

      const req = {};
      const res = new MockResponse();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const safeHandler = MockErrorHandler.safeHandler(throwingHandler);
      await safeHandler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Internal server error');
      expect(consoleSpy).toHaveBeenCalledWith('Route Error:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should pass through successful handlers', async () => {
      const successHandler = async (req: any, res: any) => {
        res.status(200).json({ success: true, message: 'Success' });
      };

      const req = {};
      const res = new MockResponse();

      const safeHandler = MockErrorHandler.safeHandler(successHandler);
      await safeHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.message).toBe('Success');
    });
  });
});