import { configureStore } from '@reduxjs/toolkit';
import lyricsReducer from './lyricsSlice.js';

export const store = configureStore({
  reducer: {
    lyrics: lyricsReducer
  }
});
