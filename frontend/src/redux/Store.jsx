import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authSlice from "./authSlice";
import serviceSlice from "./serviceSlice";

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['services'], // Only persist services, not auth (Clerk handles auth)
    blacklist: ['auth'] // Don't persist auth state
};

const rootReducer = combineReducers({
    auth: authSlice,
    services: serviceSlice
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const Store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export const persistor = persistStore(Store);