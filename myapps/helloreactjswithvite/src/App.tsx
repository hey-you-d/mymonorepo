import { ReactElement } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MvvmPatternFetchPage from './pages/mvvmPatternFetch';
import ExampleSharedUI from './pages/exampleSharedUI';
import ExampleBasicRedux from './pages/exampleBasicRedux';
//import ExampleSimpleCart from './pages/exampleSimpleCart';
import { RouterAttributes } from "./types/Common";

function App() {
  const contentLinks: Record<string, RouterAttributes> = {
    Home: { title: "Home", path: "/", render: <></> },
    MvvmPatternFetchPage: { title: "MVVM Pattern - data fetch example", path: "/mvvm-pattern-fetch", render: <MvvmPatternFetchPage /> },
    ExampleSharedLibrary: { title: "Example - shared library", path: "/example-shared-ui", render: <ExampleSharedUI /> },
    ExampleBasicRedux: { title: "Example - basic redux", path: "/example-basic-redux", render: <ExampleBasicRedux /> },
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

  console.log("HOME");

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
              <Routes>{routeMembers}</Routes>
            </ul>
          </nav>
        </Router>
      </div>
    </>
  )
}

export default App
