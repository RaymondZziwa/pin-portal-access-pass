export interface Warehouse {
  id: number;
  warehouse_type: string;
  organisation_id: number;
  name: string;
  location: string;
}

export interface WarehouseType {
  id: number;
  name: string;
  description: string;
}