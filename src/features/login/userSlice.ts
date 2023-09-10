import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { UserState } from "../../contexts/UserContext";

const initialState: UserState = {
  id: "",
  username: "",
  email: "",
  auth: false,
  lastLogin: null,
};

export const userSlice = createSlice({
  name: "userSession",
  initialState,
  reducers: {
    setUserSession: (state, action: PayloadAction<UserState>) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.auth = action.payload.auth;
    },
    clearUserSession: (state) => {
      state.id = "";
      state.username = "";
      state.email = "";
      state.auth = false;
    },
    setLastLogin: (state, action: PayloadAction<string>) => {
      state.lastLogin = action.payload;
    },
  },
});

export const { setUserSession, clearUserSession, setLastLogin } = userSlice.actions;

export const userReducer = userSlice.reducer;
