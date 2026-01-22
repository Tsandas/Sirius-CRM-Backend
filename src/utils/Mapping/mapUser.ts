import { User, UserRow } from "../../types/PostgresDB/users";

export const mapUserRow = (row: UserRow | null): User | null => {
  if (!row) return null;
  return {
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    mobilePhone: row.mobile_phone,
    roleId: row.role_id,
    status: row.status,
    isActive: row.is_active,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};
