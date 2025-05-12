// store.js
import { configureStore, createSlice } from '@reduxjs/toolkit';

// Create a slice (includes reducer + actions)
const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment: (state) => {
      state.count += 1;
    }
  }
});

// Export RootState type
export type RootState = ReturnType<typeof store.getState>;

// Export actions
export const { increment } = counterSlice.actions;

// Create store
export const store = configureStore({
  reducer: counterSlice.reducer
});
