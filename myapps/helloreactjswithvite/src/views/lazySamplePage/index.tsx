import React, { useMemo, Suspense } from 'react';
import { Outlet, Link, Navigate, Routes, Route, useLocation } from 'react-router-dom';

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
    const basePath = "/example-react-lazy";

    return (
        <Suspense fallback={<div>Loading view...</div>}>
            <h1>Lazy Loading Page Sample with memoization</h1>
            <ul>
                <li><Link to={`${basePath}/home`}>Home</Link></li>
                { featureFlags.enableAdmin && <li><Link to={`${basePath}/admin`}>Admin</Link></li> }
                { featureFlags.enableReports && <li><Link to={`${basePath}/reports`}>Reports</Link></li> }
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

    const HomeElement = (
        <Suspense fallback={<div>Loading Home...</div>}>
          <Home />
        </Suspense>
    );

    const AdminElement = (
        <Suspense fallback={<div>Loading Admin...</div>}>
          <Admin />
        </Suspense>
    );

    const ReportsElement = (
        <Suspense fallback={<div>Loading Reports...</div>}>
          <Reports />
        </Suspense>
    );
    
    return (
        <Routes location={useLocation()}> {/* Add location prop */}
            <Route key="lazysamplepage-route-1" path="home" element={HomeElement} />
            { featureFlags.enableReports && <Route key="lazysamplepage-route-2" path="reports" element={ReportsElement} /> }
            { featureFlags.enableAdmin && <Route key="lazysamplepage-route-3" path="admin" element={AdminElement} /> }
            <Route key="lazysamplepage-route-4" path="*" element={<Navigate to="../home" replace />} />
        </Routes>
    );
};

export {
    LazySamplePageRoutes,
    LazySamplePageLayout
};
