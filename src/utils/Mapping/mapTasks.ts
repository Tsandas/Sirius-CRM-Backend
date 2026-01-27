import {
  ClientForTaskForm,
  ClientForTaskFormRow,
  FilteredTask,
  FilteredTaskRow,
  MyTask,
  MyTaskRow,
  MyTasksStats,
  MyTasksStatsRow,
  SearchTask,
  SearchTaskRow,
  TaskComment,
  TaskCommentRow,
  UnassignedTask,
  UnassignedTaskRow,
} from "../../types/PostgresDB/tasks";

export const mapTaskCommentRow = (
  row: TaskCommentRow | null,
): TaskComment | null => {
  if (!row) return null;

  return {
    commentId: Number(row.comment_id),
    createdAt: new Date(row.created_at),
    leftText: row.left_text,
    rightText: row.right_text,
  };
};

export const mapUnassignedTaskRow = (
  row: UnassignedTaskRow,
): UnassignedTask => ({
  taskId: Number(row.task_id),
  taskTypeId: row.task_type_id,
  taskPrefix: row.task_prefix,
  chainId: row.chain_id ? Number(row.chain_id) : null,
  transactionId: row.transaction_id ? Number(row.transaction_id) : null,
  status: row.status,
  handledByUserId: row.handled_by_user_id
    ? Number(row.handled_by_user_id)
    : null,
  subject: row.subject,
  description: row.description,
  priority: row.priority,
  reminder: row.reminder,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export const mapMyTaskRow = (row: MyTaskRow): MyTask => ({
  taskId: Number(row.task_id),
  taskTypeId: row.task_type_id,
  taskPrefix: row.task_prefix,
  chainId: row.chain_id ? Number(row.chain_id) : null,
  transactionId: row.transaction_id ? Number(row.transaction_id) : null,
  status: row.status,
  handledByUserId: row.handled_by_user_id
    ? Number(row.handled_by_user_id)
    : null,
  assignedToUserId: row.assigned_to_user_id
    ? Number(row.assigned_to_user_id)
    : null,
  subject: row.subject,
  description: row.description,
  priority: row.priority,
  reminder: row.reminder,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export const mapFilteredTaskRow = (row: FilteredTaskRow): FilteredTask => ({
  taskId: Number(row.task_id),
  taskTypeId: row.task_type_id,
  taskPrefix: row.task_prefix,
  chainId: row.chain_id ? Number(row.chain_id) : null,
  transactionId: Number(row.transaction_id),
  status: row.status,
  handledByUserId: Number(row.handled_by_user_id),
  assignedToUserId: row.assigned_to_user_id
    ? Number(row.assigned_to_user_id)
    : null,
  subject: row.subject,
  description: row.description,
  priority: row.priority,
  reminder: row.reminder,
  callDurationSeconds: row.call_duration_seconds,
  location: row.location,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),

  trader: {
    traderCode: row.trader_code,
    traderName: row.trader_name,
    traderTim: row.trader_tim,
    traderEmail: row.trader_email,
  },
});

export const mapTaskRow = (row: SearchTaskRow): SearchTask => ({
  taskId: Number(row.task_id),
  taskTypeId: row.task_type_id,
  taskPrefix: row.task_prefix,
  chainId: Number(row.chain_id),
  transactionId: Number(row.transaction_id),
  status: row.status,
  handledByUserId: Number(row.handled_by_user_id),
  assignedToUserId: row.assigned_to_user_id
    ? Number(row.assigned_to_user_id)
    : null,
  subject: row.subject,
  description: row.description,
  priority: row.priority,
  reminder: row.reminder,
  callDurationSeconds: row.call_duration_seconds,
  location: row.location,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  traderCode: row.trader_code,
  traderName: row.company_name,
  traderTim: row.tim_number,
  traderEmail: row.email,
});

export const mapClientForTaskFormRow = (
  row: ClientForTaskFormRow,
): ClientForTaskForm => ({
  traderId: Number(row.trader_id),
  traderCode: row.trader_code,
  companyName: row.company_name,
  timNumber: row.tim_number,
});

export const mapMyTasksStatsRow = (
  row: MyTasksStatsRow | undefined,
): MyTasksStats => ({
  totalTasks: Number(row?.total_tasks ?? 0),
  assignedToday: Number(row?.assigned_today ?? 0),
  totalUrgent: Number(row?.total_urgent ?? 0),
});
