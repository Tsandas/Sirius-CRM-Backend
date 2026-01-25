import pool from "../config/db";
import {
  InsertTaskParams,
  InsertTaskTypeParams,
  SetActiveTaskTypesParams,
} from "../types/PostgresDB/tasks";

export const insertTaskTypeService = async (task: InsertTaskTypeParams) => {
  const params = [
    task.taskTypeId,
    task.taskTypeName,
    task.taskTypeCode,
    task.isActive ?? true,
  ];

  try {
    const query = `
      SELECT insert_task_type($1, $2, $3, $4);
    `;
    const result = await pool.query(query, params);
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting task type:", error);
    throw error;
  }
};

export const setActiveTaskTypesService = async (
  params: SetActiveTaskTypesParams,
) => {
  const query = `
    SELECT set_active_task_types($1);
  `;
  try {
    await pool.query(query, [params.activeTaskTypeIds]);
  } catch (error) {
    console.error("Error setting active task types:", error);
    throw error;
  }
};

export const insertTaskService = async (task: InsertTaskParams) => {
  const query = `
    SELECT * FROM insert_task(
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,
      $10,$11,$12
    );
  `;
  const params = [
    task.taskTypeId,
    task.transactionId,
    task.status,
    task.handledByUserId,
    task.subject,
    task.description,
    task.assignedToUserId ?? null,
    task.priority ?? null,
    task.reminder ?? false,
    task.callDurationSeconds ?? null,
    task.location ?? null,
    task.chainId ?? null,
  ];
  try {
    const { rows } = await pool.query(query, params);
    return rows[0];
  } catch (error) {
    console.error("Error inserting task:", error);
    throw error;
  }
};
