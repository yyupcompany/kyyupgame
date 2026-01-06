/**
 * 快捷查询分组服务
 * 管理快捷查询的分组和查询项
 */

export interface QueryItem {
  id: string;
  name: string;
  description: string;
  query: string;
  category: string;
}

export interface QueryGroup {
  id: string;
  name: string;
  description: string;
  icon?: string;
  queries: QueryItem[];
}

export interface GroupOverview {
  totalGroups: number;
  totalQueries: number;
  groups: Array<{
    id: string;
    name: string;
    queryCount: number;
  }>;
}

class QuickQueryGroupsService {
  private groups: QueryGroup[] = [
    {
      id: 'enrollment',
      name: '招生管理',
      description: '招生相关的快捷查询',
      icon: '📋',
      queries: [
        { id: 'e1', name: '今日咨询', description: '查询今日咨询记录', query: '今日咨询', category: 'enrollment' },
        { id: 'e2', name: '待跟进', description: '查询待跟进的咨询', query: '待跟进咨询', category: 'enrollment' },
        { id: 'e3', name: '本周报名', description: '查询本周报名情况', query: '本周报名', category: 'enrollment' },
      ],
    },
    {
      id: 'student',
      name: '学生管理',
      description: '学生相关的快捷查询',
      icon: '👶',
      queries: [
        { id: 's1', name: '在园学生', description: '查询在园学生列表', query: '在园学生', category: 'student' },
        { id: 's2', name: '今日出勤', description: '查询今日出勤情况', query: '今日出勤', category: 'student' },
      ],
    },
    {
      id: 'finance',
      name: '财务管理',
      description: '财务相关的快捷查询',
      icon: '💰',
      queries: [
        { id: 'f1', name: '待缴费', description: '查询待缴费学生', query: '待缴费', category: 'finance' },
        { id: 'f2', name: '本月收入', description: '查询本月收入统计', query: '本月收入', category: 'finance' },
      ],
    },
  ];

  /**
   * 获取所有分组
   */
  getAllGroups(): QueryGroup[] {
    return this.groups;
  }

  /**
   * 获取分组概览
   */
  getGroupsOverview(): GroupOverview {
    const totalQueries = this.groups.reduce((sum, g) => sum + g.queries.length, 0);
    return {
      totalGroups: this.groups.length,
      totalQueries,
      groups: this.groups.map(g => ({
        id: g.id,
        name: g.name,
        queryCount: g.queries.length,
      })),
    };
  }

  /**
   * 根据ID获取分组
   */
  getGroupById(groupId: string): QueryGroup | undefined {
    return this.groups.find(g => g.id === groupId);
  }

  /**
   * 搜索查询
   */
  searchQueries(keyword: string): QueryItem[] {
    const results: QueryItem[] = [];
    const lowerKeyword = keyword.toLowerCase();

    for (const group of this.groups) {
      for (const query of group.queries) {
        if (
          query.name.toLowerCase().includes(lowerKeyword) ||
          query.description.toLowerCase().includes(lowerKeyword) ||
          query.query.toLowerCase().includes(lowerKeyword)
        ) {
          results.push(query);
        }
      }
    }

    return results;
  }

  /**
   * 根据类别获取查询
   */
  getQueriesByCategory(category: string): QueryItem[] {
    const group = this.groups.find(g => g.id === category);
    return group?.queries || [];
  }
}

export const quickQueryGroupsService = new QuickQueryGroupsService();
export default quickQueryGroupsService;

