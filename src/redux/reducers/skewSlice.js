import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isPanelOpen: false,
    skewData: {
        "topLeft": { selected: false, x: 20, y: 20, width: 20, height: 10, position: "topLeft" },
        "bottomLeft": { selected: false, x: 20, y: 500, width: 20, height: 10, position: "bottomLeft" },
        "topRight": { selected: false, x: 400, y: 20, width: 20, height: 10, position: "topRight" },
        "bottomRight": { selected: false, x: 400, y: 500, width: 20, height: 10, position: "bottomRight" },
    },
};

const skewSlice = createSlice({
    name: "skew",   
    initialState,
    reducers: {

        setSkewPanel: (state, action) => {
            state.isPanelOpen =
                typeof action.payload === "boolean"
                    ? action.payload
                    : !state.isPanelOpen;
        },

        toggleCornerSelection: (state, action) => {
            const corner = action.payload;
            if (state.skewData[corner]) {
                state.skewData[corner].selected = !state.skewData[corner].selected;
            }
        },

        updateSkewPosition: (state, action) => {
            const { corner, x, y } = action.payload;
            if (state.skewData[corner]) {
                state.skewData[corner].x = x;
                state.skewData[corner].y = y;
            }
        },

        updateSkewDimensions: (state, action) => {
            const { corner, width, height, x, y, selected } = action.payload;
            
            console.log(width, corner, height, x, y, selected)

            if (state.skewData[corner]) {
                state.skewData[corner].width = width;
                state.skewData[corner].height = height;
                state.skewData[corner].x = x;
                state.skewData[corner].y = y;
                state.skewData[corner].selected = selected
            }
        },
        
        resetSkewSelections: (state) => {
            Object.keys(state.skewData).forEach((key) => {
                state.skewData[key].selected = false;
            });
        },




      setSelectedSkewCorners: (state, action) => {
    const skewBoxes = action.payload;

    // state.skewData = {};

    Object.keys(skewBoxes).forEach((key) => {
        state.skewData[key] = {
            ...skewBoxes[key],
            selected: true,
        };
    });
}
    },
});

export const {
    setSkewPanel,
    toggleCornerSelection,
    updateSkewPosition,
    updateSkewDimensions,
    resetSkewSelections,
    setSelectedSkewCorners
} = skewSlice.actions;

export default skewSlice.reducer;