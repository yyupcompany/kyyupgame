// 定义路由接口
export interface RouteItem {
  path: string;
  name?: string | symbol;
  meta?: {
    title?: string;
    icon?: string;
    hideInMenu?: boolean;
    permission?: string;
  };
  children?: RouteItem[];
} 