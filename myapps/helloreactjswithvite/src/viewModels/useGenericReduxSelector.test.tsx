import { render, screen, act } from '@testing-library/react';
import { store, increment, useGenericReduxSelector } from "./useGenericReduxSelector";

const TestComponent = () => {
  const count = useGenericReduxSelector((state) => state.count);
  
  return <div data-testid="count">{count}</div>;
};

describe('useGenericReduxSelector', () => {
  it('should read initial state from the Redux store', () => {
    render(<TestComponent />);

    const countElement = screen.getByTestId('count');
    
    expect(countElement.textContent).toBe('0');
  });

  it('should update when the Redux store changes', () => {
    render(<TestComponent />);

    act(() => {
      store.dispatch(increment()); // Increases count to 1
    });

    const countElement = screen.getByTestId('count');
    expect(countElement.textContent).toBe('1');
  });
});
