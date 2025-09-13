import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import serviceSlice from "./serviceSlice";

export const Store= configureStore({
    reducer:{
        auth: authSlice,
        services: serviceSlice
    }
})