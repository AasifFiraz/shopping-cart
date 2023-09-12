import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../api/productsApiSlice";

type ProductsState = {
  searchKeyword: string;
  products: Array<Product> | undefined;
};

const initialState: ProductsState = {
  searchKeyword: "",
  products: [],
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
  },
});

export const productReducer = productSlice.reducer;
export const { setSearchKeyword, setProducts } = productSlice.actions;
