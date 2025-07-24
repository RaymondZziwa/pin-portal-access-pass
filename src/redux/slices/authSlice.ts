
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserAuthType } from "../types/user.type";

const initialState: UserAuthType & { isFetchingLocalToken: boolean } = {
  token: {
    access_token: "",
    token_type: "",
    expires_in: 0,
  },
  user: {
    id: 0,
    first_name: "",
    last_name: "",
    other_name: "",
    email: "",
    gender: "",
    date_of_birth: "",
    phone_number: "",
    salutation: "",
    email_verified_at: null,
    profile_picture: "",
    verification_code: "",
    login_attempt: 0,
    organisation_id: 0,
    branch_id: 0,
    created_at: "",
    updated_at: "",
    deleted_at: null,
    two_factor_expires_at: null,
    is_first_login: false,
    full_name: "",
    roles: [],
  },
  package: null,
  role: "",
  permissions: [],
  organisation: {
    id: 0,
    organisation_name: "",
    organisation_email: "",
    initial: "",
    description: "",
    organisation_phone_number: "",
    organisation_type_id: 0,
    logo: "",
    country_id: 0,
    subscription_state_id: 0,
    subscription_start_at: null,
    subscription_end_at: null,
    beneficiary_language_text: "",
    two_factor: 0,
    accounting_type: 0,
    use_only_savings_for_transactions: 0,
    allow_closing_months: 0,
    member_language_text: "",
    sms_api_key: "",
    deleted_at: null,
    package_id: null,
    organisation_no: null,
    fiscal_year_type: "",
    remaining_days: null,
    should_alert: false,
    is_subscription_expired: false,
    subscription_status: null,
  },
  isFetchingLocalToken: false,
};

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserAuthType>) => {
      return { ...state, ...action.payload, isFetchingLocalToken: false };
    },
    clearUserData: () => {
      return { ...initialState, isFetchingLocalToken: false };
    },
    startFetchingLocalToken: (state) => {
      state.isFetchingLocalToken = true;
    },
    finishFetchingLocalToken: (state) => {
      state.isFetchingLocalToken = false;
    },
  },
});

export const {
  setUserData,
  clearUserData,
  startFetchingLocalToken,
  finishFetchingLocalToken,
} = userAuthSlice.actions;
export default userAuthSlice.reducer;
