import {GridColDef, GridRowModel} from "@mui/x-data-grid";
import BaseEntity, {EntityType} from "./base_entity";
import store from "../redux/store";
import {openDialog} from "../redux/dialogsState";
import {Category} from "./category";
import ApiClient from "../api/client";

export interface Product extends BaseEntity {
    id: number,
    model: string,
    manufacturer: string,
    price: number,
    quantity: number,
    per_order_limit: number | null,
    image_url: string | null,
    warranty_days: number,
    category_id: number,
}

export const def = () => ({});

export const colDef: GridColDef[] = [
    {field: 'model', headerName: 'Model', type: "string", width: 150, editable: true, hideable: false},
    {field: 'manufacturer', headerName: 'Manufacturer', type: "string", width: 150, editable: true, hideable: false},
    {field: 'price', headerName: 'Price', type: "number", width: 150, editable: true, hideable: false},
    {field: 'quantity', headerName: 'Quantity', type: "number", width: 150, editable: true, hideable: false},
    {
        field: 'per_order_limit',
        headerName: 'Per order limit',
        type: "number",
        width: 150,
        editable: true,
        hideable: false
    },
    {field: 'warranty_days', headerName: 'Warranty days', type: "number", width: 150, editable: true, hideable: false},
    {
        field: 'category_id',
        headerName: 'Category',
        type: "singleSelect",
        width: 150,
        editable: false,
        hideable: false,
        valueGetter: params => {
            const categoryId = params.row.category_id;
            const cat = store.getState().entities.categories[categoryId];
            if(cat) return (cat as Category).name;

            return "Unknown category!"
        }
    },
];

export const productInfo = {
    "endpoint": "products",
    "default": def,
    "colDef": colDef,
    "fromRow": (row: GridRowModel) => ({
        "model": row.model,
        "manufacturer": row.manufacturer,
        "price": row.price,
        "quantity": row.quantity,
        "per_order_limit": row.per_order_limit,
        "warranty_days": row.warranty_days,
        "category_id": row.category_id,
    }),
    "creatable": false,
    "deletable": true,
    "addCallback": () => store.dispatch(openDialog("product_create")),
    "externalAction": (id: number) => null,  // TODO: open product page, with image, characteristics, etc.
    "preloadExternal": async (prods: object[], exclude: number[]): Promise<{type: EntityType, arr: BaseEntity[]}> => {
        const to_load = [];
        for(let prod of prods as Product[])
            if(!exclude.includes(prod.category_id)) to_load.push(prod.category_id);
        return {type: "categories" as EntityType, arr: await ApiClient.by_ids("categories", to_load) as BaseEntity[]}
    }
}
