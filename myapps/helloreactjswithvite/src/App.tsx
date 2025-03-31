import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import MvvmPatternFetchPage from './pages/mvvmPatternFetch'
import ExampleSharedUI from './pages/exampleSharedUI'
import ExampleBasicRedux from './pages/exampleBasicRedux'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Hello-React-JS</h1>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <a href="/hello-next-js" target="_self">To Hello-Next-JS</a>
      <Router>
        <nav>
          <ul>
            <li className="read-the-docs"><Link to="/mvvm-pattern-fetch">MVVM Pattern - data fetch example</Link></li>
            <li className="read-the-docs"><Link to="/example-shared-ui">Example - shared library</Link></li>
            <li className="read-the-docs"><Link to="/example-basic-redux">Example - basic redux</Link></li>
            <Routes>
              <Route path="/mvvm-pattern-fetch" element={<MvvmPatternFetchPage />} />
              <Route path="/example-shared-ui" element={<ExampleSharedUI />} />
              <Route path="/example-basic-redux" element={<ExampleBasicRedux />} />
            </Routes>
          </ul>
        </nav>
      </Router>
    </>
  )
}

export default App
