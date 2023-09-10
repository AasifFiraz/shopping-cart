import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Order, Product } from "../../api/productsApiSlice";

type ProductsState = {
  orders: Array<Order> | null;
  searchKeyword: string;
  products: Array<Product> | undefined;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ProductsState = {
  orders: null,
  searchKeyword: "",
  products: [],
  status: "idle",
  error: null,
};

export const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSearchKeyword: (state, action) => {
      state.searchKeyword = action.payload;
    },
    setProducts: (state, action: PayloadAction<Array<Product> | undefined>) => {
      state.products = action.payload;
    },
    setOrderData: (state, action) => {
      state.orders = action.payload;
      state.status = "succeeded";
    },
    setOrderLoading: (state) => {
      state.status = "loading";
    },
    setOrderError: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
    setOrderIdle: (state) => {
      state.status = "idle";
    },
    resetOrderData: (state) => {
      state.orders = null;
      state.status = "idle";
      state.error = null;
    },
    incrementOrderData: (state, action: PayloadAction<string>) => {
      const product = state.orders![0]?.orderItems?.find(
        (item) => item.productId === action.payload
      );
      if (product) {
        product.quantity += 1;
      }
    },
    decrementOrderData: (state, action: PayloadAction<string>) => {
      const product = state.orders![0]?.orderItems?.find(
        (item) => item.productId === action.payload
      );
      if (product) {
        product.quantity -= 1;
        if (product.quantity === 0) {
          state.orders = null;
          state.status = "idle";
          state.error = null;
        }
      }
    },
  },
});

export const productReducer = productSlice.reducer;
export const {
  setOrderData,
  setOrderError,
  setOrderIdle,
  setOrderLoading,
  resetOrderData,
  setSearchKeyword,
  setProducts,
  incrementOrderData,
  decrementOrderData,
} = productSlice.actions;
