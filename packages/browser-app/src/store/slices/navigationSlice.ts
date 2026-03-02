import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ActiveTab = 'commands' | 'adrs' | 'roadmap'

interface NavigationState {
  activeTab: ActiveTab
}

const initialState: NavigationState = {
  activeTab: 'commands',
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
