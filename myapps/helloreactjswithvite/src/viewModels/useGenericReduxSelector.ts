import { useSyncExternalStore } from 'react';
import { store, increment, RootState } from '../models/GenericReduxStore';

type SelectorType<T> = (_: RootState) => T;
const useGenericReduxSelector = <T>(selector: SelectorType<T>): T => {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState())
  );
}

export {
    store,
    increment,
    useGenericReduxSelector
}
