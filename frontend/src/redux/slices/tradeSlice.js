import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  livePrice: null,
  tradeHistory: [],
};

const tradeSlice = createSlice({
  name: "trade",
  initialState,
  reducers: {
    setLivePrice: (state, action) => {
      state.livePrice = action.payload;
    },
    addTradeRecord: (state, action) => {
      if (!state.tradeHistory) state.tradeHistory = [];
      state.tradeHistory.unshift(action.payload);
    },
  },
});


export const { setLivePrice, addTradeRecord } = tradeSlice.actions;
export default tradeSlice.reducer;

