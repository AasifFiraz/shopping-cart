import { configureStore, ThunkAction, Action, combineReducers } from "@reduxjs/toolkit";
import { productReducer } from "../features/product/productSlice";
import appReducer from "../appSlice";
import { apiSlice as userApiSlice } from "../api/userApiSlice";
import { apiSlice as ProductApiSlice } from "../api/productsApiSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storageSession from 'reduxjs-toolkit-persist/lib/storage/session'
import { userReducer } from "../features/login/userSlice";

const rootPersistConfig = {
  key: 'root',
  storage: storageSession,
  whitelist: ['users']
}

const productPersistConfig = {
  key: 'products',
  storage: storageSession,
  blacklist: ['searchKeyword']
}

const persistedProductReducer = persistReducer(productPersistConfig, productReducer);

const rootReducer = combineReducers({
  app: appReducer,
  products: persistedProductReducer,
  users: userReducer,
  [userApiSlice.reducerPath]: userApiSlice.reducer,
  [ProductApiSlice.reducerPath]: ProductApiSlice.reducer,
})

const persistedReducer = persistReducer(rootPersistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      ProductApiSlice.middleware,
      userApiSlice.middleware
    ),
});

export const persistor = persistStore(store)
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
