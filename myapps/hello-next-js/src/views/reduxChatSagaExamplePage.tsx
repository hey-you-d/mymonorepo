import { useEffect } from "react";
import { useStore } from "react-redux";
import { injectSaga, SagaStoreType } from "@/lib/app/reduxSaga";
import { rootSaga as chatSaga } from "@/viewModels/reduxSagaChatViewModel";

export default function ChatWithSocketIoReduxSagaExamplePage() {
  const store = useStore() as SagaStoreType;

  useEffect(() => {
    injectSaga(store, "chatSaga", chatSaga);
  }, [store]);

  return <div>Chat Room</div>;
}
