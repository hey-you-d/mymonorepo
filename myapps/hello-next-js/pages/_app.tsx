import React from "react";
import { ApolloProvider } from '@apollo/client';
import { reduxSagaWrapper } from "@/app/reduxSagaStore";
import apolloClient from "@/app/models/Task/use-client/TaskGraphqlApolloClient";
import type { AppProps } from 'next/app';

const MyNextApp = ({ Component, pageProps } : AppProps) => {
    return (
        <ApolloProvider client={apolloClient}>
            <Component {...pageProps} />
        </ApolloProvider>
    );
}

export default reduxSagaWrapper.withRedux(MyNextApp);
