import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { InventoryItem } from "../types/item.type";
import { DataState } from "./DataState";


const initialState: DataState<InventoryItem[]> = {
  data: [],
  loading: false,
  error: null,
};

const itemsSlice = createSlice({
  name: "inventoryItems",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<InventoryItem[]>) {
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
  itemsSlice.actions;
export default itemsSlice.reducer;
