import React from "react";
import { ApolloProvider } from '@apollo/client';
import { Provider } from 'react-redux';
import { reduxSagaWrapper } from "@/app/reduxSagaStore";
import apolloClient from "@/app/models/Task/use-client/TaskGraphqlApolloClient";
import type { AppProps } from 'next/app';

const MyNextApp = ({ Component, pageProps } : AppProps) => {
    // dev note:
    // Redux-Saga is a middleware for Redux, not a replacement for Redux itself. 
    // So even when using Redux-Saga, we still use react-redux's Provider to pass 
    // the Redux store to the React component tree.
    // Data Flow in Redux + Redux-Saga: 
    // - You create a Redux store with the redux-saga middleware.
    // - You run your sagas via sagaMiddleware.run(rootSaga).
    // - You wrap your React app with Provider from react-redux to give components access to the store.
    // - Components dispatch actions → Redux reducers update state OR Redux-Saga listens and handles side effects (e.g. API calls).
    // Think of it like this:
    // Think of it like this:
    // - react-redux handles React <--> Redux store connection.
    // - redux-saga handles Redux store <--> Side effects (like API calls, delays, etc).
    // This approach:
    // - is compatible with React 18’s concurrent features
    // - Avoids legacy HOC usage
    // - Plays better with server-side rendering
    const { store } = reduxSagaWrapper.useWrappedStore(pageProps);

    return (
        <Provider store={store}>
            <ApolloProvider client={apolloClient}>
                <Component {...pageProps} />
            </ApolloProvider>
        </Provider>
    );
}

export default MyNextApp;
