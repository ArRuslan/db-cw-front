import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Category} from "../types/category";
import {EntityType} from "../App";
import {Order} from "../types/order";
import {Customer} from "../types/customer";
import {Product} from "../types/product";

export type Entity = Category | Product | Customer | Order;

export interface EntitiesState {
    categories: Category[] | Entity[],
    products: Product[] | Entity[],
    customers: Customer[] | Entity[],
    orders: Order[] | Entity[],
    counts: {
        categories: number,
        products: number,
        customers: number,
        orders: number,
    },
}

export const entitiesState = createSlice({
    "name": "entities",
    initialState: {
        categories: [],
        products: [],
        customers: [],
        orders: [],
        counts: {
            categories: 0,
            products: 0,
            customers: 0,
            orders: 0,
        },
    } as EntitiesState,
    reducers: {
        setEntities: (state: EntitiesState, action: PayloadAction<{ type: EntityType, arr: Entity[] }>) => {
            state[action.payload.type] = action.payload.arr;
        },
        setECount: (state: EntitiesState, action: PayloadAction<{ type: EntityType, count: number }>) => {
            state.counts[action.payload.type] = action.payload.count;
        },
    }
});

export const {setEntities, setECount} = entitiesState.actions;