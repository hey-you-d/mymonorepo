import { takeEvery, put, call, fork } from "redux-saga/effects";
import { eventChannel, END } from "redux-saga";
import { getSocket } from "@/views/sharedSocketIoClientExample";
import { addMessage, sendMessage } from "@/models/ReduxSagaChatSlice";
import { SocketIoEventName } from "@/lib/app/socketIoExample";
import { ChatMessageType } from "@/types/Chat";

function createSocketChannel(socket) {
  return eventChannel((emit) => {
    socket.on(SocketIoEventName.MESSAGE, (msg: ChatMessageType) => {
      emit(msg);
    });

    socket.on("disconnect", () => {
      // No more messages will come. Close this channel and exit the saga loop.  
      emit(END);
    });

    return () => {
      socket.off(SocketIoEventName.MESSAGE);
    };
  });
}

// Saga worker
// eslint-disable-next-line   
function* handleSendMessage(action: { payload: ChatMessageType }) {
  const socket = getSocket();

  socket.emit(SocketIoEventName.MESSAGE, action.payload);
}

// Saga watcher
// for reference:
// You only use takeLatest, takeEvery, etc. when you're watching Redux actions (e.g. SEND_MESSAGE, FETCH_DATA, etc.) — 
// not when you're reacting to external sources like Socket.IO directly.
// use takeLatest (or takeEvery, throttle, etc.) when you want to handle Redux-dispatched actions, not socket events.
// So: You don’t use takeLatest for socket listeners
// The correct approach: Use eventChannel for sockets
// eslint-disable-next-line   
function* watchIncomingMessages() {
    const socket = getSocket();
    
    // for reference:
    // socket.on(... => put(...)) won’t work because put() is a Saga effect, not a normal function. 
    // You need to use event channel to bridge Socket.IO with sagas.

    /*
    yield fork(function* () {
        socket.on(SocketIoEventName.MESSAGE, (msg: ChatMessageType) => {
            // Use put in event handler by wrapping it in saga context
            put(addMessage(msg)); // This won’t work directly — see fix below
        });
    });
    */
    const channel = yield call(createSocketChannel, socket);

    while (true) {
        const msg: ChatMessageType = yield take(channel);
        yield put(addMessage(msg));
    }
}

// Saga watcher
// for reference:
// Yes, use takeLatest (or takeEvery, throttle, etc.) when you want to handle Redux-dispatched actions, not socket events.
// You only use takeLatest, takeEvery, etc. when you're watching Redux actions (e.g. SEND_MESSAGE, FETCH_DATA, etc.) — 
// not when you're reacting to external sources like Socket.IO directly.
export function* watchSendMessageAction() {
    yield takeEvery(sendMessage.type, handleSendMessage);
}

// Root Saga for this viewModel
export function* rootSaga() {
  yield fork(watchIncomingMessages); // handles incoming socket events

  yield watchSendMessageAction(); // handles Redux-dispatched actions
}
