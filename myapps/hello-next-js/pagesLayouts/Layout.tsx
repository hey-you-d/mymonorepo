import { ReactElement, ReactNode } from 'react';
import Footer from './Footer';

const Layout = ({ children, title } : { children:ReactNode | ReactElement, title: string }) => {
    return (
        <>
            <header>
                <h1>{title}</h1>
            </header>
            <main>
                {children}
            </main>
            <Footer />
        </>
    );
}

export default Layout;