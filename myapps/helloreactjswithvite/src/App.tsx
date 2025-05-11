import { ReactElement } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import MvvmPatternFetchPage from './pages/mvvmPatternFetch';
import ExampleSharedUI from './pages/exampleSharedUI';
import ExampleBasicRedux from './pages/exampleBasicRedux';
//import ExampleSimpleCart from './pages/exampleSimpleCart';
//import ExampleReactLazy from './pages/exampleReactLazy';
import { RouterAttributes } from "./types/Common";
import { LazySamplePageRoutes, LazySamplePageLayout } from './views/lazySamplePage';

function App() {
  const contentLinks: Record<string, RouterAttributes> = {
    Home: { title: "Home", path: "/", render: <></> },
    MvvmPatternFetchPage: { title: "MVVM Pattern - data fetch example", path: "/mvvm-pattern-fetch", render: <MvvmPatternFetchPage /> },
    ExampleSharedLibrary: { title: "Example - shared library", path: "/example-shared-ui", render: <ExampleSharedUI /> },
    ExampleBasicRedux: { title: "Example - basic redux", path: "/example-basic-redux", render: <ExampleBasicRedux /> },
    //ExampleReactLazy: { title: "Example - react lazy", path: "/example-react-lazy", render: <ExampleReactLazy /> },
    //ExampleSimpleCart: { title: "Example - simple cart", path: "/example-simple-cart", render: <ExampleSimpleCart /> },
  }

  const renderedLinks: ReactElement[] = [];
  Object.keys(contentLinks).forEach((key) => {
    return renderedLinks.push(<li key={`list-${key}`} className="read-the-docs"><Link to={contentLinks[key].path}>{contentLinks[key].title}</Link></li>);
  });
  const routeMembers: ReactElement[] = [];
  Object.keys(contentLinks).forEach((key) => {
    return routeMembers.push(<Route key={`route-${key}`} path={contentLinks[key].path} element={contentLinks[key].render} />);
  });

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Hello-React-JS</h1>
      <div className="card">
        <p>
          Head to the <a href="/hello-next-js" target="_self">Hello-Next-JS</a> site
        </p>
      </div>
      <div className="card">
        <p>Sample Codes:</p>
        <Router>
          <nav>
            <ul>
              {renderedLinks}
              <li className="read-the-docs">
                <Link to="/example-react-lazy">Example - React Lazy</Link>
              </li>
            </ul>
          </nav>
          <Routes>
            {routeMembers}
            <Route path="/example-react-lazy/*" element={<LazySamplePageLayout />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="*" element={<LazySamplePageRoutes />} />
            </Route>
          </Routes> 
        </Router>
      </div>
    </>
  )
}

export default App
