import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Category} from "../types/category";
import BaseEntity, {EntityType} from "../types/base_entity";
import {Order} from "../types/order";
import {Customer} from "../types/customer";
import {Product} from "../types/product";
import {Characteristic} from "../types/characteristic";

export interface EntitiesState {
    categories: {[key:number]: BaseEntity},
    products: {[key:number]: BaseEntity},
    customers: {[key:number]: BaseEntity},
    orders: {[key:number]: BaseEntity},
    characteristics: {[key:number]: BaseEntity},
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
            for(let ent of action.payload.arr)
                state[action.payload.type][ent.id] = ent;
        },
        delEntity: (state: EntitiesState, action: PayloadAction<{ type: EntityType, id: number }>) => {
            delete state[action.payload.type][action.payload.id];
        },
        setECount: (state: EntitiesState, action: PayloadAction<{ type: EntityType, count: number }>) => {
            state.counts[action.payload.type] = action.payload.count;
        },
    }
});

export const {setEntities, delEntity, setECount} = entitiesState.actions;