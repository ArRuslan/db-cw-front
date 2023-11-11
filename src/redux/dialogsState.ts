import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface DialogsState {
    product_create: boolean,
    order_create: boolean,
}

export const dialogsState = createSlice({
    "name": "dialogs",
    initialState: {
        product_create: false,
        order_create: false,
    } as DialogsState,
    reducers: {
        openDialog: (state: DialogsState, action: PayloadAction<keyof DialogsState>) => {
            state[action.payload] = true;
        },
        closeDialog: (state: DialogsState, action: PayloadAction<keyof DialogsState>) => {
            state[action.payload] = false;
        },
    }
});

export const {openDialog, closeDialog} = dialogsState.actions;