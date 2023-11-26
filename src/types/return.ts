import {GridColDef, GridRowModel} from "@mui/x-data-grid";
import {Product} from "./product";
import {Customer} from "./customer";
import BaseEntity from "./base_entity";

export interface Return extends BaseEntity {
    id: number,
    status: string,
    creation_time: Date,
    customer: Customer,
    item: Product,
}

export const def = () => ({});

export const colDef: GridColDef[] = [
    {
        field: 'customer__email',
        headerName: 'Email',
        type: "string",
        width: 150,
        editable: false,
        hideable: false,
        valueGetter: (params) => params.row.customer?.email
    },
    {
        field: 'status',
        headerName: 'Status',
        type: "singleSelect",
        width: 150,
        editable: true,
        hideable: false,
        valueOptions: ["processing", "completed", "canceled"]
    },
    {
        field: 'creation_time',
        headerName: 'Creation Time',
        type: "dateTime",
        width: 200,
        editable: false,
        hideable: false,
        valueGetter: (params) => new Date(params.row.creation_time)
    },
    {
        field: 'order_item__model',
        headerName: 'Item model',
        type: "string",
        width: 150,
        editable: false,
        hideable: false,
        valueGetter: (params) => params.row.item?.model
    },
    {
        field: 'quantity',
        headerName: 'Quantity',
        type: "number",
        width: 100,
        editable: false,
        hideable: false,
    },
];

export const returnInfo = {
    "endpoint": "returns",
    "default": def,
    "colDef": colDef,
    "fromRow": (row: GridRowModel) => ({}),
    "creatable": false,
    "deletable": false,
    "addCallback": null,
    "externalAction": null,
    "preloadExternal": null,
}
