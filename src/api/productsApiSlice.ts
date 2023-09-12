import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./interceptorsSlice";

export interface Product {
  id: string;
  name: string;
  price: number;
  totalRatingScore: number;
  totalRatings: number;
  quantity: number;
}

type RequireOnly<T, K extends keyof T> = Partial<T> & Pick<T, K>;
type DraftProduct = RequireOnly<
  Product,
  "id" | "totalRatingScore" | "totalRatings"
>;

export interface UserRating {
  id?: string;
  userId?: string;
  ratedProducts: Array<{ productId: string; rating: number }>;
}

export type CartItems = {
  productId: string;
  priceAtTimeOfPurchase: number;
  quantity: number;
};

export interface Cart {
  id?: string;
  userId?: string;
  cartItems?: Array<CartItems>;
  totalDiscount?: number;
}

export const apiSlice = createApi({
  reducerPath: "product",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["product", "userRatings", "carts"],
  endpoints: (builder) => ({
    getProducts: builder.query<Array<Product>, number | void>({
      query: (_limit = 10) => ({
        url: `/products`,
      }),
      providesTags: ["product"],
    }),
    getProduct: builder.query<Product, Product['id']>({
      query: (id) => ({
        url: `/products`,
        params: { id },
        transformResponse: (response: Array<Product>) => {
          if (response && response.length > 0) {
            return response[0];
          }
          throw new Error("Error occured when retrieving Product Info.");
        },
      }),
    }),
    updateProductRating: builder.mutation<Product, DraftProduct>({
      query: (data: DraftProduct) => ({
        url: `products/${data.id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["product"],
    }),
    updateUserRating: builder.mutation<UserRating, any>({
      query: (data: UserRating) => ({
        url: `/users/rating/update/${data.id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["userRatings"],
    }),
    createUserRating: builder.mutation<UserRating, any>({
      query: (data: UserRating) => ({
        url: `/users/rating`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["userRatings"],
    }),
    getUserRatings: builder.query<UserRating, string | undefined>({
      query: (userId) => ({
        url: `/users/rating/${userId}`,
      }),
      providesTags: ["userRatings"],
      transformResponse: (response: Array<UserRating>) => {
        if (response && response.length > 0) {
          return response[0];
        }
        throw new Error("Error occured when retrieving user ratings.");
      },
    }),
    getSavedCarts: builder.query<Array<Cart>, string | undefined>({
      query: (userId) => ({
        url: `/users/cart/${userId}`,
      }),
      providesTags: ["carts"],
    }),
    updateUserCart: builder.mutation<Cart, Cart>({
      query: (data: Cart) => ({
        url: `/users/cart/update/${data.id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["carts"],
    }),
    createUserCart: builder.mutation<Cart, Cart>({
      query: (data: Cart) => ({
        url: `/users/cart`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["carts"],
    }),
    deleteUserCart: builder.mutation<Cart, string | undefined>({
      query: (id: string) => ({
        url: `/users/cart/update/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["carts"],
    }),
  }),
});

export const {
  useLazyGetProductsQuery,
  useLazyGetProductQuery,
  useGetProductQuery,
  useUpdateProductRatingMutation,
  useLazyGetUserRatingsQuery,
  useUpdateUserRatingMutation,
  useCreateUserRatingMutation,
  useLazyGetSavedCartsQuery,
  useUpdateUserCartMutation,
  useCreateUserCartMutation,
  useDeleteUserCartMutation
} = apiSlice;
