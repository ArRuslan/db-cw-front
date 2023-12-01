import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import BaseEntity, {EntityType} from "../types/base_entity";
import {ProductCharacteristic} from "../types/characteristic";

export interface EntitiesState {
    current: BaseEntity[],
    categories: { [key: number]: BaseEntity },
    products: { [key: number]: BaseEntity },
    customers: { [key: number]: BaseEntity },
    orders: { [key: number]: BaseEntity },
    characteristics: { [key: number]: BaseEntity },
    returns: { [key: number]: BaseEntity },
    counts: {
        categories: number,
        products: number,
        customers: number,
        orders: number,
        characteristics: number,
        returns: number,
    },
    product_characteristics: { [key: number]: ProductCharacteristic[] },
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
        returns: {},
        counts: {
            categories: 0,
            products: 0,
            customers: 0,
            orders: 0,
            characteristics: 0,
            returns: 0,
        },
        product_characteristics: {},
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
            const existing = state.current.filter(e => e.id === action.payload.id);
            if(existing.length)
                Object.assign(existing[0], action.payload);
            else
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
        setProductChars: (state: EntitiesState, action: PayloadAction<{ productId: number, chars: ProductCharacteristic[] }>) => {
            state.product_characteristics[action.payload.productId] = action.payload.chars;
        },
        addProductChar: (state: EntitiesState, action: PayloadAction<{ productId: number, char: ProductCharacteristic }>) => {
            if(!(action.payload.productId in state.product_characteristics))
                state.product_characteristics[action.payload.productId] = [];
            state.product_characteristics[action.payload.productId].push(action.payload.char);
        },
        delProductChar: (state: EntitiesState, action: PayloadAction<{ productId: number, charId: number }>) => {
            const pc = state.product_characteristics;
            const prodId = action.payload.productId;
            const charId = action.payload.charId;

            if(!(prodId in pc))
                pc[prodId] = [];

            pc[prodId] = pc[prodId].filter(c => c.id !== charId);
        },
    }
});

export const {setEntities, setCurrent, addCurrent, delEntity, setECount, setProductChars, addProductChar, delProductChar} = entitiesState.actions;