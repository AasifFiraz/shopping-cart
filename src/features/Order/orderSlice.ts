import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Order } from "../../api/productsApiSlice";

type OrderState = {
  orders: Array<Order> | null;
};

const initialState: OrderState = {
  orders: null,
};

export const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrder: (state, action: PayloadAction<Array<Order>>) => {
      state.orders = action.payload;
    }
  },
});

export const orderReducer = orderSlice.reducer;
export const { setOrder } =
  orderSlice.actions;
