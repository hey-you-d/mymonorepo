// rootSaga.ts
import { all } from 'redux-saga/effects';
import { rootSaga as userSaga } from './reduxSagaUserViewModel';
import { rootSaga as chatSaga } from './reduxSagaChatViewModel';

export default function* rootSaga() {
  yield all([
    userSaga(),
    chatSaga(),
  ]);
}
