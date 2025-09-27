import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    services: [], // All published services for home page
    myServices: [], // User's own services for MyServices page
    searchResults: [], // Search results for Services page
    selectedService: null,
    lastFetchTime: null,
    myServicesLastFetchTime: null,
    searchLastFetchTime: null,
    isStale: false,
    myServicesStale: false,
    searchStale: false
}

const serviceSlice = createSlice({
    name: "services",
    initialState,
    reducers: {
        setServices: (state, action) => {
            state.services = Array.isArray(action.payload) ? action.payload : [];
            state.lastFetchTime = Date.now();
            state.isStale = false;
        },
        setMyServices: (state, action) => {
            state.myServices = Array.isArray(action.payload) ? action.payload : [];
            state.myServicesLastFetchTime = Date.now();
            state.myServicesStale = false;
        },
        setSearchResults: (state, action) => {
            state.searchResults = Array.isArray(action.payload) ? action.payload : [];
            state.searchLastFetchTime = Date.now();
            state.searchStale = false;
        },
        setSelectedService: (state, action) => {
            state.selectedService = action.payload;
        },
        markAsStale: (state) => {
            state.isStale = true;
        },
        markMyServicesAsStale: (state) => {
            state.myServicesStale = true;
        },
        markSearchAsStale: (state) => {
            state.searchStale = true;
        },
        clearServices: (state) => {
            state.services = [];
            state.lastFetchTime = null;
            state.isStale = true;
        },
        clearMyServices: (state) => {
            state.myServices = [];
            state.myServicesLastFetchTime = null;
            state.myServicesStale = true;
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
            state.searchLastFetchTime = null;
            state.searchStale = true;
        }
    }
})

export const {
    setServices,
    setMyServices,
    setSearchResults,
    setSelectedService,
    markAsStale,
    markMyServicesAsStale,
    markSearchAsStale,
    clearServices,
    clearMyServices,
    clearSearchResults
} = serviceSlice.actions;

export default serviceSlice.reducer;
