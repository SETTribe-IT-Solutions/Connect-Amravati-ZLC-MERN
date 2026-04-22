import { createSlice } from '@reduxjs/toolkit';
import { ROLES } from '../../constants/roles';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const userData = action.payload;
      state.user = {
        userID: userData.userID || userData.id,
        name: userData.name,
        role: userData.role,
        email: userData.email,
        phone: userData.phone,
        district: userData.district,
        taluka: userData.taluka,
        village: userData.village,
        loginTime: userData.loginTime || new Date().toISOString(),
        permissions: userData.role === ROLES.SYSTEM_ADMINISTRATOR ? ['all'] : ['view_tasks'],
      };
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
