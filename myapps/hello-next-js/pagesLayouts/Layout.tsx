import { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import Footer from './Footer';
import { TASKS_CRUD, MONOREPO_PREFIX, TASKS_BFF_DOMAIN_API_URL, TASKS_SQL_DOMAIN_API_URL } from '@/lib/app/common';
import "@/app/globals.css";
import styles from "@/app/page.module.css";

const Layout = ({ children, title } : { children:ReactNode | ReactElement, title: string }) => {
    const finalPrefix = `${MONOREPO_PREFIX}${TASKS_CRUD}`;

    return (
        <section className={styles.page}>
            <header>
                <h1>{title}</h1>
            </header>
            <main className={styles.main}>
                <h3>[Client-side components MVVM variant example pages]</h3>
                <ul>
                    <li><Link href={`${finalPrefix}`}>Default (No Frills) example page</Link></li>    
                    <li><Link href={`${finalPrefix}/with-swr`}>Cached With Vercel SWR example page</Link></li>
                    <li><Link href={`${finalPrefix}/with-search-filter`}>useDeferredValue optimised filtering example page</Link></li>
                    <li><Link href={`${finalPrefix}/graphql`}>Data fetching with graphql (via Apollo Server) example page</Link></li>
                    <li><Link href={`${finalPrefix}/graphql/apolloClient`}>Data fetching & querying with graphql (via Apollo Server & Client) example page</Link></li>
                </ul>
                <h3>[Server-side components MVVM variant example pages]</h3>
                <ul>
                    <li><Link href={`${finalPrefix}/use-server`}>Default (No Frills) example page</Link></li>
                    <li><Link href={`${finalPrefix}/use-server/with-swr`}>Cached With Vercel SWR example page</Link></li>
                    <li><Link href={`${finalPrefix}/use-server/graphql`}>Data fetching with graphql (via Apollo Server) example page</Link></li>
                </ul>
                <h3>[Backend layer]</h3>
                <ul>
                    <li><Link href={`${finalPrefix}/swagger`}>Swagger Doc Page</Link></li>
                    <li><Link href={"/api/tasks/v1/sql"}>Tasks API Endpoints</Link></li>
                    <li><Link href={"/api/tasks/v1/bff"}>Tasks BFF Endpoints (used by the client-side variant Model component)</Link></li>
                </ul>
                <hr/>
                {children}
            </main>
            <Footer />
        </section>
    );
}

export default Layout;