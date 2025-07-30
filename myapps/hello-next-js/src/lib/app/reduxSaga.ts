import { Saga } from "redux-saga";
import { Store } from "redux";

export type SagaStoreType = Store & {
  runSaga: (saga: Saga) => unknown;
  injectedSagas: Record<string, boolean>;
};

// for Next.js page-based loading: dynamically injecting sagas is a powerful pattern, especially in Next.js or code-split apps, 
// where you want to load sagas only when specific pages or features are mounted.
// Why inject sagas dynamically?
// - Reduces initial bundle size
// - Improves performance with code-splitting
// - Keeps sagas tied to feature lifecycles (like in MVVM or modular architecture)
export function injectSaga(store: SagaStoreType, key: string, saga: Saga) {
  if (!store.injectedSagas[key]) {
    store.injectedSagas[key] = true;
    store.runSaga(saga);
  }
}
