import pool from "../config/db";
import { AppError } from "../Error/appError";
import {
  FilterClient,
  FilterClientsRow,
  InsertClientParams,
  UpdateClientParams,
} from "../types/PostgresDB/trader-client";
import {
  mapClientStatsRow,
  mapFilterClientsRow,
  mapFilteredClientRow,
  mapTradersRow,
} from "../utils/Mapping/mapTraders";

export const insertClientService = async (clientData: InsertClientParams) => {
  const params = [
    clientData.companyName,
    clientData.accountType,
    clientData.timNumber,
    clientData.language,
    clientData.phone,
    clientData.email,
    clientData.address,
    clientData.city,
    clientData.stateCountry,
    clientData.zipCode,
    clientData.createdByUserId,
  ];

  try {
    const query = `
      SELECT insert_client(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) AS trader_id;
    `;

    const result = await pool.query(query, params);

    return result.rows[0];
  } catch (error) {
    console.error("Error inserting client:", error);
    throw error;
  }
};

export const updateTraderService = async (clientData: UpdateClientParams) => {
  const params = [
    clientData.traderId,
    clientData.companyName,
    clientData.timNumber,
    clientData.phone,
    clientData.email,
    clientData.address,
    clientData.city ?? null,
    clientData.stateCountry ?? null,
    clientData.zipCode ?? null,
    clientData.language ?? null,
    clientData.accountType ?? null,
    clientData.status ?? null,
  ];
  try {
    const query = `
      SELECT update_trader(
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11, $12
      );
    `;
    const result = await pool.query(query, params);
    return result.rows[0];
  } catch (error: any) {
    console.log("ERROR", error.message);
    if (error.message?.includes("Trader not found")) {
      throw new AppError(
        "Trader not found",
        404,
        `No trader exists with id ${clientData.traderId}`,
      );
    }
    console.error("Error updating trader:", error);
    throw error;
  }
};

export const deleteTraderService = async (traderId: number) => {
  try {
    await pool.query(`SELECT delete_trader($1);`, [traderId]);
    return true;
  } catch (error) {
    console.error("Error deleting trader:", error);
    throw error;
  }
};

export const getAllTradersService = async () => {
  try {
    const result = await pool.query(`SELECT * FROM get_all_active_clients();`);
    return result.rows.map(mapTradersRow);
  } catch (error) {
    console.error("Error fetching all traders:", error);
    throw error;
  }
};

export const getTradersStatsService = async () => {
  try {
    const result = await pool.query(`SELECT * FROM get_client_stats();`);
    return result.rows.map(mapClientStatsRow);
  } catch (error) {
    console.error("Error fetching traders stats:", error);
    throw error;
  }
};

export const getFilteredClientsService = async (filters: any) => {
  const {
    search,
    codePrefix,
    namePrefix,
    timPrefix,
    emailPrefix,
    phonePrefix,
    status = "ALL",
    limit = 50,
    offset = 0,
  } = filters;
  console.log("Filters received:", filters);
  const result = await pool.query(
    `SELECT * FROM filter_clients_with_search(
      $1, $2, $3, $4, $5, $6, $7, $8, $9
    )`,
    [
      search ?? null,
      codePrefix ?? null,
      namePrefix ?? null,
      timPrefix ?? null,
      emailPrefix ?? null,
      phonePrefix ?? null,
      status,
      Number(limit),
      Number(offset),
    ],
  );

  return result.rows.map(mapFilteredClientRow);
};

export const getFilteredClientsFormService = async (filters: any) => {
  const {
    codePrefix = null,
    namePrefix = null,
    timPrefix = null,
    emailPrefix = null,
    phonePrefix = null,
    status = "ALL",
    limit = 50,
    offset = 0,
  } = filters;

  const result = await pool.query(
    `SELECT * FROM filter_clients(
      $1, $2, $3, $4, $5, $6, $7, $8
    )`,
    [
      codePrefix ?? null,
      namePrefix ?? null,
      timPrefix ?? null,
      emailPrefix ?? null,
      phonePrefix ?? null,
      status,
      Number(limit),
      Number(offset),
    ],
  );

  return result.rows.map(mapFilterClientsRow);
};
