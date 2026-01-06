/**
 * 分页配置系统
 * 用于统一管理系统中的分页设置
 */

export interface PaginationConfig {
  // 默认分页设置
  defaultPageSize: number;
  defaultPageSizes: number[];

  // 不同场景的分页设置
  scenarios: {
    table: {
      defaultPageSize: number;
      pageSizes: number[];
    };
    list: {
      defaultPageSize: number;
      pageSizes: number[];
    };
    cards: {
      defaultPageSize: number;
      pageSizes: number[];
    };
    search: {
      defaultPageSize: number;
      pageSizes: number[];
    };
    export: {
      defaultPageSize: number;
      maxPageSize: number;
    };
  };

  // 分页组件配置
  component: {
    showSizeChanger: boolean;
    showQuickJumper: boolean;
    showTotal: boolean;
    pageSizeOptions: string[];
  };

  // 性能配置
  performance: {
    maxPageSize: number;
    recommendedPageSize: number;
    pageSizeThreshold: number;
  };
}

// 默认分页配置
export const defaultPaginationConfig: PaginationConfig = {
  defaultPageSize: 20,
  defaultPageSizes: [10, 20, 50, 100],

  scenarios: {
    table: {
      defaultPageSize: 20,
      pageSizes: [10, 20, 50, 100]
    },
    list: {
      defaultPageSize: 15,
      pageSizes: [10, 15, 30, 50]
    },
    cards: {
      defaultPageSize: 12,
      pageSizes: [6, 12, 24, 48]
    },
    search: {
      defaultPageSize: 10,
      pageSizes: [10, 20, 30, 50]
    },
    export: {
      defaultPageSize: 100,
      maxPageSize: 1000
    }
  },

  component: {
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
    pageSizeOptions: ['10', '20', '50', '100']
  },

  performance: {
    maxPageSize: 1000,
    recommendedPageSize: 50,
    pageSizeThreshold: 100
  }
};

// 分页配置管理器
export class PaginationConfigManager {
  private static config: PaginationConfig = defaultPaginationConfig;

  /**
   * 获取分页配置
   */
  static getConfig(): PaginationConfig {
    return this.config;
  }

  /**
   * 更新分页配置
   */
  static updateConfig(newConfig: Partial<PaginationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 重置为默认配置
   */
  static resetToDefault(): void {
    this.config = defaultPaginationConfig;
  }

  /**
   * 获取特定场景的分页配置
   */
  static getScenarioConfig(scenario: keyof PaginationConfig['scenarios']) {
    return this.config.scenarios[scenario];
  }

  /**
   * 获取分页组件的props
   */
  static getPaginationProps(scenario: keyof PaginationConfig['scenarios'] = 'table') {
    const scenarioConfig = this.getScenarioConfig(scenario);

    return {
      current: 1,
      pageSize: scenarioConfig.defaultPageSize,
      pageSizes: scenarioConfig.pageSizes,
      showSizeChanger: this.config.component.showSizeChanger,
      showQuickJumper: this.config.component.showQuickJumper,
      showTotal: this.config.component.showTotal,
      pageSizeOptions: this.config.component.pageSizeOptions
    };
  }

  /**
   * 验证分页参数
   */
  static validatePaginationParams(params: {
    page?: number;
    pageSize?: number;
    scenario?: keyof PaginationConfig['scenarios'];
  }): {
    page: number;
    pageSize: number;
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const scenario = params.scenario || 'table';
    const scenarioConfig = this.getScenarioConfig(scenario);

    // 验证页码
    let page = 1;
    if (params.page !== undefined) {
      if (typeof params.page !== 'number' || params.page < 1) {
        errors.push('页码必须是大于0的整数');
        page = 1;
      } else {
        page = params.page;
      }
    }

    // 验证页面大小
    let pageSize = scenarioConfig.defaultPageSize;
    if (params.pageSize !== undefined) {
      if (typeof params.pageSize !== 'number' || params.pageSize < 1) {
        errors.push('页面大小必须是大于0的整数');
      } else if (params.pageSize > this.config.performance.maxPageSize) {
        errors.push(`页面大小不能超过${this.config.performance.maxPageSize}`);
      } else {
        pageSize = params.pageSize;
      }
    }

    return {
      page,
      pageSize,
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取推荐的页面大小
   */
  static getRecommendedPageSize(total: number, scenario: keyof PaginationConfig['scenarios'] = 'table'): number {
    const scenarioConfig = this.getScenarioConfig(scenario);
    const recommended = this.config.performance.recommendedPageSize;

    // 如果总数小于推荐大小，返回总数
    if (total <= recommended) {
      return Math.max(total, scenarioConfig.pageSizes[0]);
    }

    // 否则返回推荐大小或最接近的可用大小
    const availableSizes = scenarioConfig.pageSizes;
    const closestSize = availableSizes.reduce((prev, curr) => {
      return Math.abs(curr - recommended) < Math.abs(prev - recommended) ? curr : prev;
    });

    return closestSize;
  }

  /**
   * 格式化分页信息
   */
  static formatPaginationInfo(total: number, page: number, pageSize: number): string {
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    return `第 ${start}-${end} 条，共 ${total} 条`;
  }

  /**
   * 计算总页数
   */
  static getTotalPages(total: number, pageSize: number): number {
    return Math.ceil(total / pageSize);
  }
}

export default PaginationConfigManager;