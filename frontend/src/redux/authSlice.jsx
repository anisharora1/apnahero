import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        loading: false,
        user: null,
        userProfile: null,
        isAuthenticated: false
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setUser: (state, action) => {
            state.user = action.payload
            state.isAuthenticated = !!action.payload
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload
        },
        clearAuth: (state) => {
            state.user = null
            state.userProfile = null
            state.isAuthenticated = false
        }
    }
})

export const { setLoading, setUser, setUserProfile, clearAuth } = authSlice.actions;
export default authSlice.reducer;