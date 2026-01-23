import pool from "../config/db";
import { InsertClientParams } from "../types/PostgresDB/trader-client";

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
