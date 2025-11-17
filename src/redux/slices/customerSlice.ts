import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Customer } from "../types/Customers";
import { DataState } from "./DataState";

const initialState: DataState<Customer[]> = {
  data: [],
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Customer[]>) {
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
customerSlice.actions;
export default customerSlice.reducer;
