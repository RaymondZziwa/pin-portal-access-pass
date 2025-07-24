export interface SignUpData {
    password: string;
    country_id: number;
    password_confirmation: string;
    organisation_name: string;
    email: string;
    phone_number: string;
    last_name: string;
    first_name: string;
  }
  
  export interface UserAuthType {
    token: Token;
    user: User;
    package: null;
    role: string;
    permissions: string[];
    organisation: Organisation;
  }
  
  export interface Organisation {
    id: number;
    organisation_name: string;
    organisation_email: string;
    initial: string;
    description: string;
    organisation_phone_number: string;
    organisation_type_id: number;
    logo: string;
    country_id: number;
    subscription_state_id: number;
    subscription_start_at: null;
    subscription_end_at: null;
    beneficiary_language_text: string;
    two_factor: number;
    accounting_type: number;
    use_only_savings_for_transactions: number;
    allow_closing_months: number;
    member_language_text: string;
    sms_api_key: string;
    deleted_at: null;
    package_id: null;
    organisation_no: null;
    fiscal_year_type: string;
    remaining_days: null;
    should_alert: boolean;
    is_subscription_expired: boolean;
    subscription_status: null;
  }
  
  export interface User {
    id: number;
    first_name: string;
    last_name: string;
    other_name: string;
    email: string;
    gender: string;
    date_of_birth: string;
    phone_number: string;
    salutation: string;
    email_verified_at: null;
    profile_picture: string;
    verification_code: string;
    login_attempt: number;
    organisation_id: number;
    branch_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: null;
    two_factor_expires_at: null;
    is_first_login: boolean;
    full_name: string;
    roles: Role[];
    employee_id: number;
  }
  
  interface Role {
    id: number;
    organisation_id: null;
    branch_id: null;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot: Pivot;
    permissions: Permission[];
  }
  
  interface Permission {
    id: number;
    name: string;
  }
  
  interface Pivot {
    model_type: string;
    model_id: number;
    role_id: number;
  }
  
  export interface Token {
    access_token: string;
    token_type: string;
    expires_in: number;
  }
  