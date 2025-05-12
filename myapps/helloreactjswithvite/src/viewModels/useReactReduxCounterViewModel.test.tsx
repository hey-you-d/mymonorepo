//import { render, screen } from '@testing-library/react';
import { useSelector, useDispatch } from 'react-redux';
import { useReactReduxCounterViewModel } from './useReactReduxCounterViewModel';

// create a mock redux store
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn(),
    useDispatch: jest.fn(),
}));

describe('useCounterViewModel', () => {
    let mockDispatch: typeof jest.fn;

    beforeEach(() => {
        mockDispatch = jest.fn();
        (useDispatch as unknown  as jest.Mock).mockReturnValue(mockDispatch);
        (useSelector as unknown as jest.Mock).mockReturnValue(0);
    });

    it("should increment counter when increment fn is called", () => {
        const { increment } = useReactReduxCounterViewModel();

        increment();

        expect(mockDispatch).toHaveBeenCalledWith({"payload": undefined, "type": "counter/increment"});
    });

    it("should increment counter when decrement fn is called", () => {
        const { decrement } = useReactReduxCounterViewModel();

        decrement();

        expect(mockDispatch).toHaveBeenCalledWith({"payload": undefined, "type": "counter/decrement"});
    });

    it("should set a counter value when setValue fn is called", () => {
        const { setValue } = useReactReduxCounterViewModel();

        setValue(10);

        expect(mockDispatch).toHaveBeenCalledWith({"payload": 10, "type": "counter/setValue"});
    });
    /*
    it.skip("should display counter value from the state", () => {
        (useSelector as unknown as jest.Mock).mockReturnValue(5);

        render(<div>{useReduxCounterViewModel().counter}</div>);

        expect(screen.getByText('5')).toBeInTheDocument;
    });
    */
});