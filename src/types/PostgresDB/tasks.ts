export interface InsertTaskTypeParams {
  taskTypeId: number;
  taskTypeName: string;
  taskTypeCode: string;
  isActive?: boolean;
}

export interface SetActiveTaskTypesParams {
  activeTaskTypeIds: number[] | null;
  updatedByUserId: number;
}

export interface InsertTaskParams {
  taskTypeId: number;
  transactionId: number;
  status: string;
  handledByUserId: number;
  subject: string;
  description: string;
  assignedToUserId?: number | null;
  priority?: string | null;
  reminder?: boolean;
  callDurationSeconds?: number | null;
  location?: string | null;
  chainId?: number | null;
}

export interface UpdateTaskParams {
  taskId: number;
  status: string;
  subject: string;
  description: string;
  assignedToUserId?: number | null;
  priority?: string | null;
  reminder?: boolean;
  callDurationSeconds?: number | null;
  location?: string | null;
}

export interface AddTaskCommentParams {
  taskId: number;
  userId: number;
  comment: string;
}

export interface TaskCommentRow {
  comment_id: string;
  created_at: string;
  left_text: string;
  right_text: string;
}

export interface TaskComment {
  commentId: number;
  createdAt: Date;
  leftText: string;
  rightText: string;
}

export interface UnassignedTaskRow {
  task_id: string;
  task_type_id: number;
  task_prefix: number;
  chain_id: string | null;
  transaction_id: string | null;
  status: string;
  handled_by_user_id: string | null;
  subject: string;
  description: string | null;
  priority: string | null;
  reminder: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnassignedTask {
  taskId: number;
  taskTypeId: number;
  taskPrefix: number;
  chainId: number | null;
  transactionId: number | null;
  status: string;
  handledByUserId: number | null;
  subject: string;
  description: string | null;
  priority: string | null;
  reminder: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MyTaskRow {
  task_id: string;
  task_type_id: number;
  task_prefix: number;
  chain_id: string | null;
  transaction_id: string | null;
  status: string;
  handled_by_user_id: string | null;
  assigned_to_user_id: string | null;
  subject: string;
  description: string | null;
  priority: string | null;
  reminder: boolean;
  created_at: string;
  updated_at: string;
}

export interface MyTask {
  taskId: number;
  taskTypeId: number;
  taskPrefix: number;
  chainId: number | null;
  transactionId: number | null;
  status: string;
  handledByUserId: number | null;
  assignedToUserId: number | null;
  subject: string;
  description: string | null;
  priority: string | null;
  reminder: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterTasksParams {
  taskId: number | null;
  taskTypeId: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  priority: string | null;
  status: string | null;
  clientCodePrefix: string | null;
  clientNamePrefix: string | null;
  clientTimPrefix: string | null;
  clientEmailPrefix: string | null;
}

export interface FilteredTaskRow {
  task_id: string;
  task_type_id: number;
  task_prefix: number;
  chain_id: string | null;
  transaction_id: string;
  status: string;
  handled_by_user_id: string;
  assigned_to_user_id: string | null;
  subject: string;
  description: string;
  priority: string | null;
  reminder: boolean;
  call_duration_seconds: number | null;
  location: string | null;
  created_at: string;
  updated_at: string;

  trader_code: string;
  trader_name: string;
  trader_tim: string;
  trader_email: string;
}

export interface FilteredTask {
  taskId: number;
  taskTypeId: number;
  taskPrefix: number;
  chainId: number | null;
  transactionId: number;
  status: string;
  handledByUserId: number;
  assignedToUserId: number | null;
  subject: string;
  description: string;
  priority: string | null;
  reminder: boolean;
  callDurationSeconds: number | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;

  trader: {
    traderCode: string;
    traderName: string;
    traderTim: string;
    traderEmail: string;
  };
}

export interface SearchTaskRow {
  task_id: string;
  task_type_id: number;
  task_prefix: number;
  chain_id: string;
  transaction_id: string;
  status: string;
  handled_by_user_id: string;
  assigned_to_user_id: string | null;
  subject: string;
  description: string;
  priority: string;
  reminder: boolean;
  call_duration_seconds: number | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  trader_code: string;
  company_name: string;
  tim_number: string;
  email: string;
}

export interface SearchTask {
  taskId: number;
  taskTypeId: number;
  taskPrefix: number;
  chainId: number;
  transactionId: number;
  status: string;
  handledByUserId: number;
  assignedToUserId: number | null;
  subject: string;
  description: string;
  priority: string;
  reminder: boolean;
  callDurationSeconds: number | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
  traderCode: string;
  traderName: string;
  traderTim: string;
  traderEmail: string;
}