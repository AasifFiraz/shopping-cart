import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./interceptorsSlice";

export interface User {
  username: string;
  id?: string;
  email?: string;
  mobile?: string;
  password: string;
}

export const apiSlice = createApi({
  reducerPath: "user",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["user"],
  endpoints: (builder) => ({
    getUser: builder.query<User, { username: string; password: string }>({
      query: ({ username, password }) => ({
        url: `/users`,
        params: { username, password },
      }),
      transformResponse: (response: Array<User>) => {
        if (response && response.length > 0) {
          return response[0];
        }
        throw new Error("Invalid username or password.");
      },
    }),
    addUser: builder.mutation<any, any>({
      query: (data) => ({
        url: "/users",
        method: "post",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),
  }),
});

export const {
  useLazyGetUserQuery,
  useAddUserMutation,
} = apiSlice;
