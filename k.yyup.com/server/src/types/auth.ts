export interface LoginDto {
  username?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    realName?: string;
    phone?: string;
    roles: {
      id: number;
      name: string;
      code: string;
      permissions: {
        id: number;
        name: string;
        code: string;
        type: string;
        path?: string;
        component?: string;
        icon?: string;
      }[];
    }[];
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
} 