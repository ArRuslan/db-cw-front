import {GridColDef, GridRowModel} from "@mui/x-data-grid";
import BaseEntity from "./base_entity";

export interface Customer extends BaseEntity{
    id: number,
    first_name: string,
    last_name: string,
    email: string,
    phone_number: string,
}

export const colDef: GridColDef[] = [
    {field: 'first_name', headerName: 'First Name', width: 150, editable: true, hideable: false},
    {field: 'last_name', headerName: 'Last Name', width: 150, editable: true, hideable: false},
    {field: 'email', headerName: 'Email', width: 150, editable: true, hideable: false},
    {field: 'phone_number', headerName: 'Phone number', type: "number", width: 150, editable: true, hideable: false},
];

export const customerInfo = {
    "endpoint": "customers",
    "default": () => ({first_name: "First", last_name: "Last", email: "@gmail.com", phone_number: 380000000000}),
    "colDef": colDef,
    "fromRow": (row: GridRowModel) => ({
        "first_name": row.first_name,
        "last_name": row.last_name,
        "email": row.email,
        "phone_number": row.phone_number,
    }),
    "creatable": true,
    "deletable": true,
    "addCallback": null,
}
