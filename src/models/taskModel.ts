import pool from "../config/db";
import { SearchTaskSearchParams } from "../middleware/input/tasks/searchTasksQueryValidator";
import {
  AddTaskCommentParams,
  FilterTasksParams,
  InsertTaskParams,
  InsertTaskTypeParams,
  SearchTaskRow,
  SetActiveTaskTypesParams,
  UpdateTaskParams,
} from "../types/PostgresDB/tasks";
import { mapTaskCommentRow, mapTaskRow } from "../utils/Mapping/mapTasks";

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

export const updateTaskService = async (task: UpdateTaskParams) => {
  const query = `
    SELECT * FROM update_task(
      $1,$2,$3,$4,
      $5,$6,$7,$8,$9
    );
  `;

  const params = [
    task.taskId,
    task.status,
    task.subject,
    task.description,
    task.assignedToUserId ?? null,
    task.priority ?? null,
    task.reminder ?? false,
    task.callDurationSeconds ?? null,
    task.location ?? null,
  ];
  try {
    const { rows } = await pool.query(query, params);
    return rows[0];
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const addTaskCommentService = async (params: AddTaskCommentParams) => {
  try {
    const query = `
      SELECT add_task_comment($1, $2, $3) AS comment_id;
    `;
    const values = [params.taskId, params.userId, params.comment];

    const { rows } = await pool.query(query, values);
    return rows[0]?.comment_id ?? null;
  } catch (error) {
    console.error("Error adding task comment:", error);
    throw error;
  }
};

export const getTaskCommentsService = async (taskId: number) => {
  try {
    const query = `
      SELECT * FROM get_task_comments($1);
    `;
    const result = await pool.query(query, [taskId]);
    return result.rows.map(mapTaskCommentRow);
  } catch (error) {
    console.error("Error fetching task comments", error);
    throw error;
  }
};

export const getUnassignedTasksService = async () => {
  try {
    const query = `
    SELECT *
    FROM get_unassigned_tasks();
  `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching unassigned tasks:", error);
    throw error;
  }
};

export const getMyTasksService = async (userId: number) => {
  try {
    const query = `
    SELECT *
    FROM get_my_tasks($1);
  `;
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows;
  } catch (error) {
    console.error("Error fetching my tasks:", error);
    throw error;
  }
};

export const filterTasksService = async (params: FilterTasksParams) => {
  try {
    const query = `
    SELECT *
    FROM filter_tasks(
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,$10
    );
  `;

    const values = [
      params.taskId,
      params.taskTypeId,
      params.dateFrom,
      params.dateTo,
      params.priority,
      params.status,
      params.clientCodePrefix,
      params.clientNamePrefix,
      params.clientTimPrefix,
      params.clientEmailPrefix,
    ];

    const { rows } = await pool.query(query, values);
    return rows;
  } catch (error) {
    console.error("Error filtering tasks:", error);
    throw error;
  }
};

export const searchTasksService = async (
  params: SearchTaskSearchParams,
  userId?: number,
) => {
  try {
    const query = `
  SELECT * FROM filter_tasks_with_search(
    $1::text,      -- p_scope
    $2::bigint,    -- p_user_id
    $3::text,      -- p_search
    $4::bigint,    -- p_task_id
    $5::integer,   -- p_task_type_id
    $6::date,      -- p_date_from
    $7::date,      -- p_date_to
    $8::varchar,   -- p_priority
    $9::varchar,   -- p_status
    $10::text,     -- p_client_code_prefix
    $11::text,     -- p_client_name_prefix
    $12::text,     -- p_client_tim_prefix
    $13::text      -- p_client_email_prefix
  )
`;
    const values = [
      params.scope || "ALL",
      userId ?? null,
      params.search ?? null,
      params.taskId ?? null,
      params.taskTypeId ?? null,
      params.dateFrom ?? null,
      params.dateTo ?? null,
      params.priority ?? null,
      params.status ?? null,
      params.clientCodePrefix ?? null,
      params.clientNamePrefix ?? null,
      params.clientTimPrefix ?? null,
      params.clientEmailPrefix ?? null,
    ];
    const { rows } = await pool.query<SearchTaskRow>(query, values);
    return rows.map(mapTaskRow);
  } catch (error) {
    console.error("Error searching tasks:", error);
    throw error;
  }
};
