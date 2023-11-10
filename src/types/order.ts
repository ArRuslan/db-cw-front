import {GridColDef, GridRowModel} from "@mui/x-data-grid";
import {Product} from "./product";
import {Customer} from "./customer";
import BaseEntity from "./base_entity";
import store from "../redux/store";
import {openDialog} from "../redux/dialogsState";

export interface Order extends BaseEntity {
    id: number,
    status: string,
    creation_time: Date,
    address: string,
    type: string,
    customer: Customer,
    items: Product[],
}

export const def = () => ({});

export const colDef: GridColDef[] = [
    {
        field: 'email',
        headerName: 'Email',
        type: "string",
        width: 150,
        editable: false,
        hideable: false,
        valueGetter: (params) => params.row.customer?.email
    },
    {
        field: 'first_name',
        headerName: 'First name',
        type: "string",
        width: 150,
        editable: false,
        hideable: false,
        valueGetter: (params) => params.row.customer?.first_name
    },
    {
        field: 'last_name',
        headerName: 'Last name',
        type: "string",
        width: 150,
        editable: false,
        hideable: false,
        valueGetter: (params) => params.row.customer?.last_name
    },
    {
        field: 'phone_number',
        headerName: 'Phone number',
        type: "number",
        width: 150,
        editable: false,
        hideable: false,
        valueGetter: (params) => params.row.customer?.phone_number
    },
    {
        field: 'status',
        headerName: 'Status',
        type: "singleSelect",
        width: 100,
        editable: true,
        hideable: false,
        valueOptions: ["processing", "sent", "completed", "canceled"]
    },
    {field: 'address', headerName: 'Address', type: "string", width: 150, editable: true, hideable: false},
    {
        field: 'type',
        headerName: 'Type',
        type: "singleSelect",
        width: 100,
        editable: true,
        hideable: false,
        valueOptions: ["pickup", "shipping"]
    },
    {
        field: 'item_count',
        headerName: 'Item count',
        type: "number",
        width: 100,
        editable: false,
        hideable: false,
        valueGetter: (params) => params.row.items?.length
    },
];

export const orderInfo = {
    "endpoint": "orders",
    "default": def,
    "colDef": colDef,
    "fromRow": (row: GridRowModel) => ({
        "status": row.status,
        "address": row.address,
        "type": row.type,
    }),
    "creatable": false,
    "deletable": false,
    "addCallback": null,
    "externalAction": (id: number) => null,
}
