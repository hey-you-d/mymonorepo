import React from 'react';
import { useReactReduxCounterViewModel } from '../viewModels/useReactReduxCounterViewModel';
import { useGenericReduxSelector, store, increment } from '../viewModels/useGenericReduxSelector';

const ReactReduxExamplePage = () => {
    const { counter, increment, decrement, setValue } = useReactReduxCounterViewModel();
    const [inputValue, setInputValue] = React.useState<number>(counter);

    return (
        <div>
            <h1>Counter: {counter}</h1>
            <button onClick={increment}>Increment</button>
            <button onClick={decrement}>Decrement</button>

            <input type="number" value={inputValue} onChange={(e) => setInputValue(Number(e.target.value))} />
            <button onClick={() => setValue(inputValue)}>Set Value</button>
        </div>
    );
}

const GenericReduxExamplePage = () => {
    const count = useGenericReduxSelector(state => state.count);

    return (
        <div>
            <p>Counter: {count}</p>
            <button onClick={() => store.dispatch(increment())}>Increment</button>
        </div>
    );
}

export {
    ReactReduxExamplePage,
    GenericReduxExamplePage
};