import { configureStore } from '@reduxjs/toolkit'
import navigationReducer from './slices/navigationSlice'
import commandsReducer from './slices/commandsSlice'
import adrsReducer from './slices/adrsSlice'
import roadmapReducer from './slices/roadmapSlice'
import chatReducer from './slices/chatSlice'
import threadsReducer from './slices/threadsSlice'

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    commands: commandsReducer,
    adrs: adrsReducer,
    roadmap: roadmapReducer,
    chat: chatReducer,
    threads: threadsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
