import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    services: [],
    myServices:null,
    selectedService: null
}

const serviceSlice = createSlice({
    name: "services",
    initialState,
    reducers: {
        setServices: (state, action) => {
            state.services = action.payload;
        },
        setMyServices: (state, action) => {
            state.myServices = action.payload;
        },
        setSelectedService: (state, action) => {
            state.selectedService = action.payload;
        }
    }
})

export const {
    setServices,
    setMyServices,
    setSelectedService
} = serviceSlice.actions;

export default serviceSlice.reducer;
