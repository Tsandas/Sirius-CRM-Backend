export interface UserRow {
  user_id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password_hash: string;
  mobile_phone: string | null;
  role_id: number;
  status: string;
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
  mobilePhone: string | null;
  roleId: number;
  status: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
