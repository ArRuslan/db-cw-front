import {GridColDef, GridRowModel} from "@mui/x-data-grid";
import BaseEntity from "./base_entity";

export interface Characteristic extends BaseEntity {
    id: number,
    name: string,
    measurement_unit: string,
}

export const colDef: GridColDef[] = [
    {field: 'name', headerName: 'Name', width: 180, editable: true, hideable: false},
    {field: 'measurement_unit', headerName: 'Measurement Unit', width: 150, editable: true, hideable: false},
];

export const characteristicInfo = {
    "endpoint": "characteristics",
    "default": () => ({name: "", measurement_unit: ""}),
    "colDef": colDef,
    "fromRow": (row: GridRowModel) => ({"name": row.name, "measurement_unit": row.measurement_unit}),
    "creatable": true,
    "deletable": true,
    "addCallback": null,
    "externalAction": null,
}
