export interface JWTPayload {
  userId: string;
  username: string;
  roleId: number;
  iat?: number; // added by jwt.sign
  exp?: number; // added by jwt.sign
}

export interface LoginBody {
  username: string;
  password: string;
}
