import React, { useMemo, Suspense } from 'react';
import { Outlet, Link, Navigate, Routes, Route } from 'react-router-dom';

type FeatureFlags = {
    enableReports: boolean;
    enableAdmin: boolean;
  };

const featureFlags: FeatureFlags = {
    enableReports: true,
    enableAdmin: true,
};

type importFnType = () => Promise<{ default: React.ComponentType<any> }>;
const lazyWithMemo = (importFn: importFnType, flag: boolean) => useMemo(
    () => React.lazy(importFn), [flag]
);

const LazySamplePageLayout = (): React.ReactElement => {
    return (
        <Suspense fallback={<div>Loading view...</div>}>
            <h1>Lazy Sample Page</h1>
            <ul>
                <li><Link to="/example-react-lazy/home">Home</Link></li>
                { featureFlags.enableAdmin && <li><Link to="/example-react-lazy/admin">Admin</Link></li> }
                { featureFlags.enableReports && <li><Link to="/example-react-lazy/reports">Reports</Link></li> }
            </ul>
            <Outlet /> {/* This renders matched child routes */}
        </Suspense>
    );
};

const LazySamplePageRoutes = () => {
    // Lazily import components conditionally
    const Home = lazyWithMemo(() => import("./Home"), true);
    const Reports = lazyWithMemo(() => import("./Reports"), featureFlags.enableReports);
    const Admin = lazyWithMemo(() => import("./Admin"), featureFlags.enableAdmin);

    /*
    const Home = useMemo(() => React.lazy(() => import("./Home")), []);
    const Reports = useMemo(() => featureFlags.enableReports 
        ? React.lazy(() => import("./Reports")) 
        : undefined, 
        [featureFlags.enableReports]
    );
    const Admin = useMemo(() => featureFlags.enableAdmin 
        ? React.lazy(() => import("./Admin")) 
        : undefined, 
        [featureFlags.enableAdmin]
    );
    */
    
    return (
        <Routes>
            <Route key="lazysamplepage-route-1" path="home" element={<Home />} />
            { featureFlags.enableReports && <Route key="lazysamplepage-route-2" path="reports" element={<Reports />} /> }
            { featureFlags.enableAdmin && <Route key="lazysamplepage-route-3" path="admin" element={<Admin />} /> }
            <Route key="lazysamplepage-route-4" path="*" element={<Navigate to="." replace />} />
        </Routes>
    );
};

export {
    LazySamplePageRoutes,
    LazySamplePageLayout
};
