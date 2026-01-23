export interface InsertClientParamsRow {
  p_company_name: string;
  p_account_type: string | null;
  p_tim_number: string;
  p_language: string | null;
  p_phone: string;
  p_email: string;
  p_address: string;
  p_city: string | null;
  p_state_country: string | null;
  p_zip_code: string | null;
  p_created_by_user_id: number;
}

export interface InsertClientParams {
  companyName: string;
  accountType: string | null;
  timNumber: string;
  language: string | null;
  phone: string;
  email: string;
  address: string;
  city: string | null;
  stateCountry: string | null;
  zipCode: string | null;
  createdByUserId: number;
}

export interface UpdateClientParams {
  traderId: number;
  companyName: string;
  accountType: string | null;
  timNumber: string;
  language: string | null;
  phone: string;
  email: string;
  address: string;
  city: string | null;
  stateCountry: string | null;
  zipCode: string | null;
  createdByUserId: number;
  status: boolean | null;
}

export interface TraderRow {
  trader_id: string;
  trader_code: string;
  company_name: string;
  account_type: string | null;
  tim_number: string;
  language: string | null;
  phone: string;
  email: string;
  address: string;
  city: string | null;
  state_country: string | null;
  zip_code: string | null;
  created_at: string;
  updated_at: string;
}
export interface Trader {
  traderId: number;
  traderCode: string;
  companyName: string;
  accountType: string | null;
  timNumber: string;
  language: string | null;
  phone: string;
  email: string;
  address: string;
  city: string | null;
  stateCountry: string | null;
  zipCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}
