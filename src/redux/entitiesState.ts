import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import BaseEntity, {EntityType} from "../types/base_entity";

export interface EntitiesState {
    current: BaseEntity[],
    categories: { [key: number]: BaseEntity },
    products: { [key: number]: BaseEntity },
    customers: { [key: number]: BaseEntity },
    orders: { [key: number]: BaseEntity },
    characteristics: { [key: number]: BaseEntity },
    counts: {
        categories: number,
        products: number,
        customers: number,
        orders: number,
        characteristics: number,
    },
}

export const entitiesState = createSlice({
    "name": "entities",
    initialState: {
        current: [],
        categories: {},
        products: {},
        customers: {},
        orders: {},
        characteristics: {},
        counts: {
            categories: 0,
            products: 0,
            customers: 0,
            orders: 0,
            characteristics: 0,
        },
    } as EntitiesState,
    reducers: {
        setEntities: (state: EntitiesState, action: PayloadAction<{ type: EntityType, arr: BaseEntity[] }>) => {
            for (let ent of action.payload.arr)
                state[action.payload.type][ent.id] = ent;
        },
        setCurrent: (state: EntitiesState, action: PayloadAction<BaseEntity[]>) => {
            state.current = action.payload;
        },
        addCurrent: (state: EntitiesState, action: PayloadAction<BaseEntity>) => {
            state.current.push(action.payload);
        },
        delEntity: (state: EntitiesState, action: PayloadAction<{ type: EntityType, id: number }>) => {
            const obj = state[action.payload.type][action.payload.id];
            state.current = state.current.filter(item => JSON.stringify(item) !== JSON.stringify(obj));

            delete state[action.payload.type][action.payload.id];
        },
        setECount: (state: EntitiesState, action: PayloadAction<{ type: EntityType, count: number }>) => {
            state.counts[action.payload.type] = action.payload.count;
        },
    }
});

export const {setEntities, setCurrent, addCurrent, delEntity, setECount} = entitiesState.actions;