import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { PaymentMethod } from "../types/Currency";
import { DataState } from "./DataState";

const initialState: DataState<PaymentMethod[]> = {
  data: [],
  loading: false,
  error: null,
};

const paymentMethod = createSlice({
  name: "paymentmethods",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<PaymentMethod[]>) {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    },
    fetchDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchDataStart, fetchDataSuccess, fetchDataFailure } =
  paymentMethod.actions;
export default paymentMethod.reducer;
