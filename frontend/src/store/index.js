import { configureStore } from '@reduxjs/toolkit';

// Create a simple dummy reducer to avoid the warning
const dummyReducer = (state = {}, action) => {
  return state;
};
// Create a simple reducer to avoid the warning
const rootReducer = (state = { version: '1.0' }, action) => {
  return state;
};

export const store = configureStore({
  reducer: {
    app: dummyReducer, // Add at least one reducer
    reducer: rootReducer,
  },
});