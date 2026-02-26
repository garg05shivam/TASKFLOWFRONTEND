import { createSlice } from "@reduxjs/toolkit";

const syncSlice = createSlice({
  name: "sync",
  initialState: {
    version: 0,
  },
  reducers: {
    bumpSyncVersion: (state) => {
      state.version += 1;
    },
  },
});

export const { bumpSyncVersion } = syncSlice.actions;
export default syncSlice.reducer;
