import Joi from "joi";
export interface SearchTaskSearchParams {
  scope?: "ALL" | "UNASSIGNED" | "MY";
  search?: string;
  taskId?: number;
  taskTypeId?: number;
  dateFrom?: string;
  dateTo?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  clientCodePrefix?: string;
  clientNamePrefix?: string;
  clientTimPrefix?: string;
  clientEmailPrefix?: string;
}
export const searchTasksSchema = Joi.object({
  scope: Joi.string().valid("ALL", "UNASSIGNED", "MY").default("ALL"),
  search: Joi.string().allow(null, ""),
  taskId: Joi.number().integer().optional(),
  taskTypeId: Joi.number().integer().optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").optional(),
  status: Joi.string()
    .valid("IN_PROGRESS", "COMPLETED", "CANCELLED")
    .optional(),
  clientCodePrefix: Joi.string().allow(null, ""),
  clientNamePrefix: Joi.string().allow(null, ""),
  clientTimPrefix: Joi.string().allow(null, ""),
  clientEmailPrefix: Joi.string().allow(null, ""),
});
