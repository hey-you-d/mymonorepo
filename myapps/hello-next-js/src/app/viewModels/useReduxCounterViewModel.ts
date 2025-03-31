import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, setValue } from '../models/ReduxCounterSlice';
import { ReduxRootState, ReduxAppDispatch } from '../reduxStore';

export const useReduxCounterViewModel = () => {
    const counter = useSelector((state: ReduxRootState) => state.counter.value);
    const dispatch: ReduxAppDispatch = useDispatch();

    return {
        counter,
        increment: () => dispatch(increment()),
        decrement: () => dispatch(decrement()),
        setValue: (value: number) => dispatch(setValue(value)),
    };
}
