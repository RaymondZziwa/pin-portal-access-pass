import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Currency } from "../types/Currency";
import { DataState } from "./DataState";

const initialState: DataState<Currency[]> = {
  data: [],
  loading: false,
  error: null,
};

const currenciesSlice = createSlice({
  name: "currencies",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Currency[]>) {
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
  currenciesSlice.actions;
export default currenciesSlice.reducer;
