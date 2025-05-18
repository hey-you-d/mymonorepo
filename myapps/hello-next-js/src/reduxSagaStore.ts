// Redux implementation example #2: 
// Next.js redux implementation using Redux saga while following the MVVM patternW
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { createWrapper } from 'next-redux-wrapper';
import reduxSagaUserReducer from "./models/ReduxSagaUserSlice";
import rootSaga from "./viewModels/reduxSagaUserViewModel";

const sagaMiddleware = createSagaMiddleware();

export const makeStore = () => {
    const store = configureStore({
        reducer: {
            reduxSagaUser: reduxSagaUserReducer
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware)  
    });

    sagaMiddleware.run(rootSaga);

    return store;
}

export type ReduxSagaAppStore = ReturnType<typeof makeStore>;
export type ReduxSagaAppState = ReturnType<ReduxSagaAppStore["getState"]>;
export type ReduxSagaAppDispatch = ReduxSagaAppStore["dispatch"];

export const reduxSagaWrapper = createWrapper<ReduxSagaAppStore>(makeStore);
