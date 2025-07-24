import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Warehouse } from "../types/Warehouse";
import { DataState } from "./DataState";

const initialState: DataState<Warehouse[]> = {
  data: [],
  loading: false,
  error: null,
};

const warehousesSlice = createSlice({
  name: "inventoryIwarehouses",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Warehouse[]>) {
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
  warehousesSlice.actions;
export default warehousesSlice.reducer;
