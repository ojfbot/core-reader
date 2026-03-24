import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ActiveTab = 'skills' | 'adrs' | 'roadmap' | 'okrs' | 'docs' | 'changes' | 'events'

interface NavigationState {
  activeTab: ActiveTab
}

const initialState: NavigationState = {
  activeTab: 'skills',
}

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<ActiveTab>) {
      state.activeTab = action.payload
    },
  },
})

export const { setActiveTab } = navigationSlice.actions
export default navigationSlice.reducer
