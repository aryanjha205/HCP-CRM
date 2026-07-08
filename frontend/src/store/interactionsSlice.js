import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:8000/api';

export const fetchInteractions = createAsyncThunk(
    'interactions/fetchInteractions',
    async () => {
        const response = await fetch(`${API_URL}/interactions`);
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
    }
);

export const logInteraction = createAsyncThunk(
    'interactions/logInteraction',
    async (data) => {
        const response = await fetch(`${API_URL}/interactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to log interaction');
        return await response.json();
    }
);

export const sendChatMessage = createAsyncThunk(
    'interactions/sendChatMessage',
    async (message) => {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });
        if (!response.ok) throw new Error('Chat request failed');
        return await response.json();
    }
);

const initialState = {
    list: [],
    status: 'idle',
    error: null,
    chatHistory: [
        { role: 'assistant', content: 'Hello! I am your AI assistant. You can chat with me to log an HCP interaction or ask for a doctor summary, follow-up ideas, or material recommendations.' }
    ],
    chatLoading: false,
};

const interactionsSlice = createSlice({
    name: 'interactions',
    initialState,
    reducers: {
        addChatMessage(state, action) {
            state.chatHistory.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInteractions.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchInteractions.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(fetchInteractions.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(logInteraction.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            })
            .addCase(sendChatMessage.pending, (state) => {
                state.chatLoading = true;
            })
            .addCase(sendChatMessage.fulfilled, (state, action) => {
                state.chatLoading = false;
                state.chatHistory.push({ role: 'assistant', content: action.payload.reply });
            })
            .addCase(sendChatMessage.rejected, (state, action) => {
                state.chatLoading = false;
                state.chatHistory.push({ role: 'assistant', content: 'Sorry, I encountered an error communicating with the AI agent.' });
            });
    },
});

export const { addChatMessage } = interactionsSlice.actions;
export default interactionsSlice.reducer;
