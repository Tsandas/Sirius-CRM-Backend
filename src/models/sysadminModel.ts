import pool from "../config/db";
import { queries } from "../utils/queryLoader";
import { User } from "../types/PostgresDB/users";

export const userExistsService = async (userId: number, username: string) => {
  const query = queries.findUser;
  const result = await pool.query(query, [userId, username]);
  const userExists = result.rows.length > 0;
  return userExists;
};

export const createUserService = async (userData: User) => {};
