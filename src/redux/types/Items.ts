export interface InventoryItem {
  id: number;
  item_category_id: number;
  organisation_id: number;
  unit_of_measure_id: number;
  currency_id: number;
  account_chart_id: number;
  item_type: string;
  name: string;
  cost_price: string;
  selling_price: string;
  vat: string;
  reference: null | string;
  barcode: null | string;
  stock_alert_level: string;
  sku_unit: string;
  has_expiry: 1 | 0;
  shell_life: string;
  item_images: [];
  description: null | string;
  item_category: Itemcategory;
  currency: Currency;
  unit_of_measure: Unitofmeasure;
  chart_account: null | string;
}

interface Unitofmeasure {
  id: number;
  name: string;
  abbreviation: string;
  type: string;
}

interface Currency {
  id: number;
  organisation_id: number;
  name: string;
  code: string;
  is_base_currency: number;
  created_at: string;
  updated_at: string;
}

interface Itemcategory {
  id: number;
  organisation_id: number;
  name: string;
  description: null;
}
