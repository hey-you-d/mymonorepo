import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessageType } from "@/types/Chat";

const reduxSagaChatSlice = createSlice({
    name: 'redux saga user',
    initialState: {
        messages: [] as ChatMessageType[],
    },
    reducers: {
        addMessage(state, action: PayloadAction<ChatMessageType>) {
            state.messages.push(action.payload);
        },
        sendMessage(_: any, action: PayloadAction<ChatMessageType>) {
            // saga handles this
        },
    }
});

export const { addMessage, sendMessage } = reduxSagaChatSlice.actions;

const reduxSagaChatReducer = reduxSagaChatSlice.reducer;
export default reduxSagaChatReducer;
