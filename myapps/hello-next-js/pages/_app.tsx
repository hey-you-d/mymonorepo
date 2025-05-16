import React from "react";
import { ApolloProvider } from '@apollo/client';
import { Provider } from 'react-redux';
import { reduxSagaWrapper } from "@/app/reduxSagaStore";
import apolloClient from "@/app/models/Task/use-client/TaskGraphqlApolloClient";
import type { AppProps } from 'next/app';

const MyNextApp = ({ Component, pageProps } : AppProps) => {
    // for reference:
    // Compare to the legacy impl. with reduxSagaWrapper.withRedux approach, this approach:
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
