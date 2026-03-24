import { configureStore } from '@reduxjs/toolkit'
import navigationReducer from './slices/navigationSlice'
import skillsReducer from './slices/skillsSlice'
import adrsReducer from './slices/adrsSlice'
import roadmapReducer from './slices/roadmapSlice'
import chatReducer from './slices/chatSlice'
import threadsReducer from './slices/threadsSlice'
import okrsReducer from './slices/okrsSlice'
import docsReducer from './slices/docsSlice'
import gitReducer from './slices/gitSlice'
import eventsReducer from './slices/eventsSlice'

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    skills: skillsReducer,
    adrs: adrsReducer,
    roadmap: roadmapReducer,
    chat: chatReducer,
    threads: threadsReducer,
    okrs: okrsReducer,
    docs: docsReducer,
    git: gitReducer,
    events: eventsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
