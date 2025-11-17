import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/authSlice'
import categoryReducer from './slices/itemCategoriesSlice'
import itemReducer from './slices/itemsSlice'
import CurrencyReducer from './slices/currenciesSlice'
import WarehouseReducer from './slices/warehousesSlice'
import PaymentMethodReducer from './slices/payment_method'
import CustomerReducer from './slices/customerSlice'

export const store = configureStore({
  reducer: {
    currencies: CurrencyReducer,
    warehouses: WarehouseReducer,
    paymentMethods: PaymentMethodReducer,
    items: itemReducer,
    categories: categoryReducer,
    userAuth: userReducer,
    customer: CustomerReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
