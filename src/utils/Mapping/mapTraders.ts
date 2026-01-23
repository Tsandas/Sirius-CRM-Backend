import { Trader, TraderRow } from "../../types/PostgresDB/trader-client";

export const mapTradersRow = (row: TraderRow | null): Trader | null => {
  if (!row) return null;

  return {
    traderId: Number(row.trader_id),
    traderCode: row.trader_code,
    companyName: row.company_name,
    accountType: row.account_type,
    timNumber: row.tim_number,
    language: row.language,
    phone: row.phone,
    email: row.email,
    address: row.address,
    city: row.city,
    stateCountry: row.state_country,
    zipCode: row.zip_code,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
};
