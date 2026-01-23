import pool from "../config/db";
import { queries } from "../utils/queryLoader";
import { User } from "../types/PostgresDB/users";
import bcrypt from "bcrypt";

export const userExistsService = async (userId: number, username: string) => {
  const query = queries.findUser;
  const result = await pool.query(query, [userId, username]);
  const userExists = result.rows.length > 0;
  return userExists;
};

export const createUserService = async (userData: User) => {
  try {
    const hashedPassword = await bcrypt.hash(userData.passwordHash, 10);
    const query = `
      SELECT insert_user(
        $1, $2, $3, $4, $5, $6, $7, $8
      ) AS user_id;
    `;

    const values = [
      userData.firstName,
      userData.lastName,
      userData.username,
      userData.email,
      hashedPassword,
      userData.roleId,
      userData.mobilePhone || null,
      userData.status || "OFFLINE",
    ];

    const result = await pool.query(query, values);
    const userId: number = result.rows[0].user_id;

    return userId;
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  }
};

export const updateUserService = async (userData: User) => {
  try {
    const query = `
      SELECT update_user($1, $2, $3, $4, $5, $6) AS updated;
    `;
    const values = [
      userData.userId,
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.roleId,
      userData.mobilePhone || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0].updated;
  } catch (err) {
    console.error("Error updating user:", err);
    throw err;
  }
};
