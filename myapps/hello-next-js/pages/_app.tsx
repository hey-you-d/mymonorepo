import React from "react";
import { reduxSagaWrapper } from "@/app/reduxSagaStore";
import type { AppProps } from 'next/app';

const MyNextApp = ({ Component, pageProps } : AppProps) => {
    return (
        <Component {...pageProps} />
    );
}

export default reduxSagaWrapper.withRedux(MyNextApp);
