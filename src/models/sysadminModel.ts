import pool from "../config/db";
import { queries } from "../utils/queryLoader";
import { Agent } from "../types/PostgresDB/agent";

export const agentExistsService = async (agentId: number, username: string) => {
  const query = queries.findAgent;
  const result = await pool.query(query, [agentId, username]);
  const agentExists = result.rows.length > 0;
  return agentExists;
};

export const createAgentService = async (agentData: Agent) => {};
