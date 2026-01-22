export interface JWTPayload {
  userId: string;
  username: string;
  roleId: string;
  iat?: number; // added by jwt.sign
  exp?: number; // added by jwt.sign
}

export interface LoginBody {
  username: string;
  password: string;
}
