import { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import Footer from './Footer';
import { TASKS_CRUD } from '@/lib/app/common';

const Layout = ({ children, title } : { children:ReactNode | ReactElement, title: string }) => {
    return (
        <>
            <header>
                <h1>{title}</h1>
            </header>
            <main>
                <h3>[Pure Client components MVVM variant example pages]</h3>
                <ul>
                    <li><Link href={`${TASKS_CRUD}`}>Default example page</Link></li>    
                    <li><Link href={`${TASKS_CRUD}/with-swr`}>Cached With Vercel SWR example page</Link></li>
                    <li><Link href={`${TASKS_CRUD}/with-search-filter`}>useDeferredValue optimised filtering example page</Link></li>
                    <li><Link href={`${TASKS_CRUD}/graphql`}>Data fetching with graphql (via Apollo Server) example page</Link></li>
                    <li><Link href={`${TASKS_CRUD}/graphql/apolloClient`}>Data fetching & querying with graphql (via Apollo Server & Client) example page</Link></li>
                </ul>
                <h3>[Mixed Client-Server components MVVM variant example pages]</h3>
                <ul>
                    <li><Link href={`${TASKS_CRUD}/use-server`}>Default example page</Link></li>
                    <li><Link href={`${TASKS_CRUD}/use-server/with-swr`}>Cached With Vercel SWR example page</Link></li>
                </ul>
                <hr/>
                {children}
            </main>
            <Footer />
        </>
    );
}

export default Layout;