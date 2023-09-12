import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Cart } from "../../api/productsApiSlice";

type CartState = {
  savedCarts: Array<Cart> | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: CartState = {
  savedCarts: null,
  status: "idle",
  error: null,
};

export const cartSlice = createSlice({
  name: "carts",
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<Array<Cart>>) => {
      state.savedCarts = action.payload;
    },
    setCartLoading: (state) => {
      state.status = "loading";
    },
    setCartError: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
    setCartIdle: (state) => {
      state.status = "idle";
    },
    resetCartData: (state) => {
      state.savedCarts = null;
      state.status = "idle";
      state.error = null;
    },
    incrementCartData: (state, action: PayloadAction<string>) => {
      const product = state.savedCarts![0]?.cartItems?.find(
        (item) => item.productId === action.payload
      );
      if (product) {
        product.quantity += 1;
      }
    },
    decrementCartData: (state, action: PayloadAction<string>) => {
      const product = state.savedCarts![0]?.cartItems?.find(
        (item) => item.productId === action.payload
      );
      if (product) {
        product.quantity -= 1;
        if (product.quantity === 0) {
          state.savedCarts = null;
          state.status = "idle";
          state.error = null;
        }
      }
    },
  },
});

export const cartReducer = cartSlice.reducer;
export const { setCart, setCartError, setCartIdle, setCartLoading, decrementCartData, incrementCartData, resetCartData } =
  cartSlice.actions;
