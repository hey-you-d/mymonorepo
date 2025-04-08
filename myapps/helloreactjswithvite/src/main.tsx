import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { reduxStore } from './reduxStore'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
    <Provider store={reduxStore}>
      <App />
    </Provider>
)
