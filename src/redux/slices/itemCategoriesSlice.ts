import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "./DataState";
import { ItemCategory } from "../types/ItemCategory";

const initialState: DataState<ItemCategory[]> = {
  data: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: "inventoryCategories",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ItemCategory[]>) {
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
  categoriesSlice.actions;
export default categoriesSlice.reducer;
