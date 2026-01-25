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
