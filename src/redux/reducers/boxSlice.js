import { createSlice } from "@reduxjs/toolkit";
import { v4 } from "uuid";


export const defaultBoxData = {
    totalRow: null,
    totalCol: null,
    fieldName: "",
    fieldType: "",
    ReadingDirection: "Column",
    multi_Value: "",
    Blank_value: "",
    fieldValue: "integer",
    Custom: "",
    bubbleIntensity: 14.5,
    radius: 3.5,
    allowMultiple: false,
    detectBestBubble: false,
    height: 100,
    width: 150,
    x: 100,
    y: 100
};

const initialState = {
    boxes: [],
    selectedBoxId: null,
    mergefields: [],
    mergeBoxes: [],
};

const boxSlice = createSlice({
    name: "box",
    initialState,
    reducers: {

        saveBox: (state, action) => {
            const boxData = action.payload;

            let currentBox;

            const existingIndex = state.boxes.findIndex(
                (b) => b.id === boxData.id
            );

            if (existingIndex !== -1) {
                state.boxes[existingIndex] = {
                    ...state.boxes[existingIndex],
                    ...boxData,
                };

                currentBox = state.boxes[existingIndex];
            } else {
                currentBox = {
                    ...defaultBoxData,
                    ...boxData,
                    id: v4(),
                };

                state.boxes.push(currentBox);
                state.selectedBoxId = currentBox.id;
            }
        },

        selectBox: (state, action) => {
            state.selectedBoxId = action.payload;
            return state
        },

        updateBoxGeometry: (state, action) => {
            const { id, x, y, width, height } = action.payload;
            const box = state.boxes.find((item) => item.id === id);

            if (box) {
                if (x !== undefined) box.x = x;
                if (y !== undefined) box.y = y;
                if (width !== undefined) box.width = width;
                if (height !== undefined) box.height = height;
            }
        },

        deleteBox: (state, action) => {
            const deleteId = action.payload;

            // Delete box
            state.boxes = state.boxes.filter(
                (item) => item.id !== deleteId
            );

            // Remove box ID from mergeBoxes childrenIds
            state.mergeBoxes = state.mergeBoxes.filter(
                (item) => item.id !== action.payload
            );


            // Remove box ID from mergefields childrenIds
            state.mergefields = state.mergefields
                .map((item) => ({
                    ...item,
                    childrenIds: item.childrenIds.filter(
                        (id) => id !== deleteId
                    ),
                }))
                .filter((item) => item.childrenIds.length > 0);

            // Clear selection
            if (state.selectedBoxId === deleteId) {
                state.selectedBoxId = null;
            }
        },

        resetBoxes: (state) => {
            state.boxes = [];
            state.selectedBoxId = null;
        },

        copyBox: (state, action) => {
            const copyId = action.payload;

            const copyBoxDetails = state.boxes.find(
                (item) => item.id === copyId
            );

            if (copyBoxDetails) {
                let newFieldName = copyBoxDetails.fieldName;

                if (copyBoxDetails.fieldType === "QuestionField") {
                    const match = copyBoxDetails.fieldName?.match(/^Q(\d+)-Q(\d+)$/i);

                    if (match) {
                        const start = Number(match[1]);
                        const end = Number(match[2]);

                        const range = end - start + 1;

                        const newStart = end + 1;
                        const newEnd = newStart + range - 1;

                        newFieldName = `Q${newStart}-Q${newEnd}`;
                    }
                }

                const newCopyBox = {
                    ...copyBoxDetails,
                    id: v4(),
                    fieldName: newFieldName,
                    x: copyBoxDetails.x + 30,
                    y: copyBoxDetails.y + 30,
                };

                state.boxes.push(newCopyBox);
                state.selectedBoxId = newCopyBox.id;
            }
        },

        renderBoxes: (state, action) => {
            const Box = action.payload?.fields?.map((box) => { return box })
            const mergefieldsData = action.payload?.mergedfields?.map((field) => { return field })

            console.log("mergefieldsData: ", mergefieldsData)

            state.boxes = [];
            state.mergeBoxes = [];
            state.mergefields = [];

            if (Array.isArray(Box)) {
                Box.forEach(box => {
                    state.boxes.push({
                        ...defaultBoxData,
                        ...box
                    });
                    if (box.isMerged) {
                        state.mergeBoxes.push(box);
                    }
                });
            }

            if (Array.isArray(mergefieldsData)) {
                mergefieldsData.forEach(field => {
                    state.mergefields.push({
                        ...field,
                        childrenIds: field.childrenIds.map(id => id),
                        mergeId: field.mergeId,
                        mergedName: field.mergedName,
                    })
                });
            }
        },

        saveMergeData: (state, action) => {
            const { mergedBoxes, masterName } = action.payload;

            const childrenId = mergedBoxes.map((box) => box.id);

            state.mergefields.push({
                mergeId: v4(),
                mergedName: masterName,
                childrenIds: childrenId,
            });

            state.mergeBoxes.push(mergedBoxes);

            state.boxes = state.boxes.map((box) => {
                if (childrenId.includes(box.id)) {
                    return {
                        ...box,
                        isMerged: true,
                        subName: box.subName || box.fieldName, // Preserves original name
                        fieldName: masterName,
                    };
                }
                return box;
            });
        }

    },
});

export const {
    saveBox,
    saveMergeData,
    selectBox,
    mergeBoxes,
    updateBoxGeometry,
    deleteBox,
    resetBoxes,
    renderBoxes,
    copyBox
} = boxSlice.actions;

export default boxSlice.reducer;