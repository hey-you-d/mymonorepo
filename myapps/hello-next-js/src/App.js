import logo from './logo.svg';
import './App.css';
import { ExampleComponent } from 'my-shared-ui'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <ExampleComponent text='hello from my-shared-ui!' />
        <p>CD Test #1</p>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
