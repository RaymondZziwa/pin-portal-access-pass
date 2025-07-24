export interface Customer {
  organization_name: string;
  first_name: string;
  last_name: string;
  other_name: string;
  phone: string;
  email: string;
  industry: string;
  headquarters_address: string;
  type: 'Organisation' | 'Individual'; // Consider using an enum for better type safety
  salutation?: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Dr' | 'Prof' | 'Rev' | null; // Optional/Nullable
  status: 'active' | 'inactive' | 'suspended';
  billing_address: string;
  shipping_address: string;
  credit_limit: string; // Consider using `number` if this is always numeric
  payment_terms: 'DOR' | 'Net7' | 'Net30' | 'Net60' | 'Net90' | 'Prepaid' | 'COD' | 'CIA' | 'EOM' | 'Custom';
  bank_details: string; // ID reference to bank details
  tax_identification_number: string;
  description: string;
}
