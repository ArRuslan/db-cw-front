import {navigationTitle} from "../components/Navigation";
import BaseApp from "../components/BaseApp";
import React, {useState} from "react";
import {Button, InputLabel} from "@mui/material";
import {Textarea} from "@mui/joy";
import ApiClient from "../api/client";
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useSnackbar} from "notistack";


const def = {editable: false, hideable: false, sortable: true, filterable: false, width: 150, align: "left", headerAlign: "left"};

export default function SqlPage() {
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [rows, setRows] = useState<{ [key: string]: string | number | Date }[]>([]);
    const [cols, setCols] = useState<GridColDef[]>([]);
    const {enqueueSnackbar} = useSnackbar();

    navigationTitle.value = "sql";

    const execute = () => {
        setLoading(true);
        ApiClient.execute_sql(query).then(r => {
            setRows([]);
            setCols(r.columns.map(col => ({
                ...def,
                field: col.name,
                headerName: col.name,
                type: col.type
            })) as GridColDef[]);
            setRows(r.result);
            setLoading(false);
        }, e => {
            enqueueSnackbar('Failed to execute!', {variant: "error"});
            setLoading(false);
        }).catch(() => {
            enqueueSnackbar('Failed to execute!', {variant: "error"});
            setLoading(false);
        });
    };

    return (
        <BaseApp>
            <InputLabel>Enter sql query</InputLabel>
            <Textarea sx={{width: "100%"}} placeholder="Enter sql query..." minRows={10}
                      onChange={e => setQuery(e.target.value)}/>
            <Button sx={{mt: 2}} fullWidth variant="outlined" onClick={execute} disabled={loading}>Execute</Button>

            <DataGrid
                loading={loading}
                rows={rows}
                rowCount={rows.length}
                columns={cols}
                pageSizeOptions={[10, 25, 50, 100]}
            />
        </BaseApp>
    );
}