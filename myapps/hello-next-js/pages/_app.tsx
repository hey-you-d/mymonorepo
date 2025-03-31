import React from "react";
import { Provider } from 'react-redux';
import { reduxStore } from '@/app/reduxStore';

// eslint-disable-next-line
const MyNextApp = ({ Component, pageProps } : { Component: React.ComponentType; pageProps: any }) => {
    return (
        <Provider store={reduxStore}>
            <Component {...pageProps} />
        </Provider>
    );
}

export default MyNextApp;
