import {GridColDef, GridRowModel} from "@mui/x-data-grid";
import BaseEntity from "./base_entity";

export interface Category extends BaseEntity{
    id: number,
    name: string,
    description: string | null,
}

export const colDef: GridColDef[] = [
    {field: 'name', headerName: 'Name', width: 180, editable: true, hideable: false},
    {field: 'description', headerName: 'Description', width: 250, editable: true, hideable: false},
];

export const categoryInfo = {
    "endpoint": "categories",
    "default": () => ({name: "", description: ""}),
    "colDef": colDef,
    "fromRow": (row: GridRowModel) => ({"name": row.name, "description": row.description}),
    "creatable": true,
    "deletable": true,
    "addCallback": null,
    "externalAction": null,
    "preloadExternal": null,
}
