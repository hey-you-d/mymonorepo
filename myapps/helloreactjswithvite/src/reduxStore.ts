import { configureStore } from "@reduxjs/toolkit";
import reduxCounterReducer from "./models/ReduxCounterSlice";

export const reduxRootReducer = {
    counter: reduxCounterReducer,
}

export type ReduxRootState = {
    counter: ReturnType<typeof reduxCounterReducer>
}

export const reduxStore = configureStore({
    reducer: reduxRootReducer,
})

export type ReduxAppDispatch = typeof reduxStore.dispatch;
