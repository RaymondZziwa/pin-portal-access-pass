export interface Currency {
  id: number;
  organisation_id: number;
  name: string;
  code: string;
  is_base_currency: number;
  created_at: string;
  updated_at: string;
}


export interface PaymentMethod {
  id: number;
  name: string;
  chart_of_account_id: number;
  description?: string
  created_at: string;
  updated_at: string;
}