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
        width: 100,
        editable: true,
        hideable: false,
        valueOptions: ["processing", "sent", "completed", "canceled"]
    },
    {
        field: 'creation_time',
        headerName: 'Creation Time',
        type: "dateTime",
        width: 200,
        editable: true,
        hideable: false,
        valueGetter: (params) => new Date(params.row.creation_time)
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
        filterable: false,
        sortable: false,
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
    "addCallback": () => store.dispatch(openDialog("order_create")),
    // eslint-disable-next-line no-restricted-globals
    "externalAction": (id: number) => location.href = `/orders/${id}`,
    "preloadExternal": null,
}
