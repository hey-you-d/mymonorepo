import React from 'react';
import { useReduxCounterViewModel } from '../viewModels/useReduxCounterViewModel';

const ReduxExamplePage = () => {
    const { counter, increment, decrement, setValue } = useReduxCounterViewModel();
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

export default ReduxExamplePage;