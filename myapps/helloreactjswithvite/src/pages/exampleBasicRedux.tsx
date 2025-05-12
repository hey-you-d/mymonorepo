import { ReactReduxExamplePage, GenericReduxExamplePage } from "../views/reduxExamplePage";

const ExampleBasicRedux = () => (
    <>  
        <h1>React Redux</h1>
        <h3>How useSelector Works Internally (Modern react-redux)</h3>
        <p>
            Starting from react-redux@8, the useSelector hook uses useSyncExternalStore internally to ensure 
            consistency with React 18's concurrent rendering model.
        </p>
        <p>
            useSelector is a wrapper around useSyncExternalStore, optimized for Redux.
        </p>
        <p>Benefits:</p>
        <ul>
            <li>Guarantees consistent snapshots before render</li>
            <li>Prevents tearing (reading inconsistent state during concurrent renders)</li>
            <li>Ensures hydration matches on server and client</li>
            <li>Handles external store subscriptions properly</li>
        </ul>
        <ReactReduxExamplePage />
        <h1>Non-React Redux with useSyncExternalStore</h1>
        <p>
            useSyncExternalStore is a React Hook introduced in React 18 to safely subscribe to external stores 
            (like Redux, Zustand, or even a custom store) in a way that is concurrent rendering-compatible and 
            ensures consistent reads during hydration and re-renders.
        </p>
        <h3>Why is it needed?</h3>
        <p>
            When React uses concurrent features (like startTransition, Suspense, etc.), state updates can be 
            interrupted. useSyncExternalStore helps React to read the store snapshot before rendering, ensuring 
            consistency between client/server or between renders.
        </p>
        <h3>Key benefit over useEffect:</h3>
        <p>
            Using useEffect with a state setter to track external store updates, it wouldn’t work safely with 
            concurrent rendering. useSyncExternalStore ensures consistency by letting React know exactly how to 
            read and subscribe.
        </p>
        <h3>Concurrent rendering?</h3>
        <p>
            Concurrent rendering is a major feature introduced in React 18 that enables React to be more responsive by 
            allowing it to pause rendering and prioritize updates. 
        </p>
        <p>
            With concurrent rendering, React can manage rendering tasks more efficiently and smoothly, 
            especially in large or complex apps.
        </p>
        <p>
            Concurrent rendering helps optimize performance and user experience by allowing React to prioritize urgent 
            tasks (like user interactions) and break down heavy rendering work (like large lists or slow network 
            requests) into smaller, non-blocking tasks. It makes the UI feel more responsive and smooth, even during 
            complex updates.
        </p>
        <GenericReduxExamplePage />
    </>
);

export default ExampleBasicRedux;