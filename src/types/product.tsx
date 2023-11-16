import {GridColDef, GridRowModel} from "@mui/x-data-grid";
import BaseEntity, {EntityType} from "./base_entity";
import store, {RootState} from "../redux/store";
import {openDialog} from "../redux/dialogsState";
import {Category} from "./category";
import ApiClient from "../api/client";
import {useSelector} from "react-redux";

export interface Product extends BaseEntity {
    id: number,
    model: string,
    manufacturer: string,
    price: number,
    quantity: number,
    per_order_limit: number,
    image_url: string | null,
    warranty_days: number,
    category_id: number,
}

export const def = () => ({});

function CategoryCell({categoryId}: {categoryId: number}) {
    const cats = useSelector((state: RootState) => state.entities.categories);
    const cat = cats[categoryId] ? (cats[categoryId] as Category).name : "Unknown category!";

    return <>{cat}</>
}

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
        field: 'category__name',
        headerName: 'Category',
        type: "string",
        width: 150,
        editable: false,
        hideable: false,
        filterable: true,
        renderCell: params => {
            const categoryId = params.row.category_id;
            return <CategoryCell categoryId={categoryId}/>
        },
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
    // eslint-disable-next-line no-restricted-globals
    "externalAction": (id: number) => location.href = `/products/${id}`,
    "preloadExternal": async (prods: object[], exclude: number[]): Promise<{type: EntityType, arr: BaseEntity[]}> => {
        const to_load = [];
        for(let prod of prods as Product[])
            if(!exclude.includes(prod.category_id)) to_load.push(prod.category_id);
        return {type: "categories" as EntityType, arr: await ApiClient.by_ids("categories", to_load) as BaseEntity[]}
    }
}
