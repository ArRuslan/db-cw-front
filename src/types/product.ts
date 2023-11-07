import {GridColDef, GridRowModel} from "@mui/x-data-grid";

export interface Product {
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

export const def = () => ({model: "", manufacturer: "", price: 0, quantity: 0, per_order_limit: null, image: null, warranty_days: 0, category_id: null});

export const colDef: GridColDef[] = [
    {field: 'model', headerName: 'Model', type: "string", width: 150, editable: true, hideable: false},
    {field: 'manufacturer', headerName: 'Manufacturer', type: "string", width: 150, editable: true, hideable: false},
    {field: 'price', headerName: 'Price', type: "number", width: 150, editable: true, hideable: false},
    {field: 'quantity', headerName: 'Quantity', type: "number", width: 150, editable: true, hideable: false},
    {field: 'per_order_limit', headerName: 'Per order limit', type: "number", width: 150, editable: true, hideable: false},
    {field: 'warranty_days', headerName: 'Warranty days', type: "number", width: 150, editable: true, hideable: false},
    {
        field: 'category_id',
        headerName: 'Category',
        type: "singleSelect",
        width: 150,
        editable: false,
        hideable: false,
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
}
