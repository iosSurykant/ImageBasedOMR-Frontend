import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isPanModeActive: false,
    isFormPanelOpen: false,
    isMergePanelOpen: false,
    // isActiveTool: null,
};

const tempControlSlice = createSlice({
    name: "tempControl",
    initialState,

    reducers: {

        // Toggle Pan Mode
        togglePanMode: (state) => {
            state.isPanModeActive = !state.isPanModeActive;
        },

        // Toggle Form Panel
        isFormPanelOpen: (state) => {
            state.isFormPanelOpen = !state.isFormPanelOpen;
        },

        // Toggle Merge Panel
        isMergePanelOpen: (state) => {
            state.isMergePanelOpen = !state.isMergePanelOpen;
        },
    },
});

export const { togglePanMode, isFormPanelOpen, isMergePanelOpen } = tempControlSlice.actions;

export default tempControlSlice.reducer;