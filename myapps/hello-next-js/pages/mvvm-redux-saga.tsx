//import Layout from '../pagesLayouts/Layout';
import ReduxSagaExamplePage from '@/views/reduxSagaExamplePage';
//import ChatWithSocketIoReduxSagaExamplePage from '@/views/reduxChatSagaExamplePage';
import SocketIoClientExamplePage from '@/views/socketIoClientExamplePage';

// for reference:
// Redux-Saga is a middleware for Redux, not a replacement for Redux itself. 
// So even when using Redux-Saga, we still use react-redux's Provider to pass 
// the Redux store to the React component tree.
// Data Flow in Redux + Redux-Saga: 
// - You create a Redux store with the redux-saga middleware.
// - You run your sagas via sagaMiddleware.run(rootSaga).
// - You wrap your React app with Provider from react-redux to give components access to the store.
// - Components dispatch actions → Redux reducers update state OR Redux-Saga listens and handles side effects (e.g. API calls).
// Think of it like this:
// - react-redux handles React <--> Redux store connection.
// - redux-saga handles Redux store <--> Side effects (like API calls, delays, etc).
const ExampleReduxSaga = () => {
    return ( 
        <>
            <ReduxSagaExamplePage />
            <SocketIoClientExamplePage />
        </>
    );
}

export default ExampleReduxSaga;
