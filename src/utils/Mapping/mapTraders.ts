import {
  ClientStats,
  ClientStatsRow,
  FilterClient,
  FilterClientsRow,
  FilteredClient,
  FilteredClientRow,
  Trader,
  TraderRow,
} from "../../types/PostgresDB/trader-client";

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

export const mapClientStatsRow = (
  row: ClientStatsRow | null,
): ClientStats | null => {
  if (!row) return null;

  return {
    totalClients: Number(row.total_clients),
    activeClients: Number(row.active_clients),
    inactiveClients: Number(row.inactive_clients),
  };
};

export const mapFilteredClientRow = (
  row: FilteredClientRow | null,
): FilteredClient | null => {
  if (!row) return null;

  return {
    traderId: Number(row.trader_id),
    traderCode: row.trader_code,
    companyName: row.company_name,
    timNumber: row.tim_number,
    phone: row.phone,
    email: row.email,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
};


export const mapFilterClientsRow = (
  row: FilterClientsRow | null
): FilterClient | null => {
  if (!row) return null;

  return {
    traderId: Number(row.trader_id),
    traderCode: row.trader_code,
    companyName: row.company_name,
    timNumber: row.tim_number,
    phone: row.phone,
    email: row.email,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
};
