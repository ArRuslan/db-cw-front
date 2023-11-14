import React, {useEffect, useState} from 'react';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import ApiClient from "../api/client";
import {TYPES} from "../types/types";
import {entityType} from "../App";
import {useDispatch} from "react-redux";
import {setAuthToken} from "../redux/accountState";
import {effect, signal} from "@preact/signals-react";

export type StatPath = "customers" | "categories" | "customers-top" | "time/year" | "time/month";

export const statPath = signal<StatPath>("customers");
export const statValue = signal<number | null>(null);

const colDefs = {
    "customers": [
        {field: 'order_count', headerName: 'Order Count', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'return_count', headerName: 'Return Count', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'ordered_product_count', headerName: 'Unique Products Count', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'ordered_item_count', headerName: 'Ordered items Count', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'returned_items_count', headerName: 'Returned items Count', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'total_money', headerName: 'Total money spent', width: 150, editable: false, hideable: false, sortable: false},
    ],
    "categories": [
        {field: 'order_count', headerName: 'Order Count', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'return_count', headerName: 'Return Count', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'ordered_item_count', headerName: 'Ordered items Count', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'returned_items_count', headerName: 'Returned items Count', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'total_money', headerName: 'Total Money', width: 150, editable: false, hideable: false, sortable: false},
    ],
    "customers-top": [
        {field: 'first_name', headerName: 'First Name', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'last_name', headerName: 'Last Name', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'email', headerName: 'Email', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'order_items', headerName: 'Order Count', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'total_money', headerName: 'Total money spent', width: 150, editable: false, hideable: false, sortable: false},
    ],
    "time/year": [
        {field: 'month', headerName: 'Month', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'order_count', headerName: 'Order Count', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'total_money', headerName: 'Total money spent', width: 150, editable: false, hideable: false, sortable: false},
    ],
    "time/month": [
        {field: 'day', headerName: 'Day', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'order_count', headerName: 'Order Count', width: 150, editable: false, hideable: false, sortable: false},
        {field: 'total_money', headerName: 'Total money spent', width: 150, editable: false, hideable: false, sortable: false},
    ],
}

function SDataGrid() {
    const [rows, setRows] = useState<object[]>([]);
    const [isLoading, setLoading] = useState(true);
    const dispatch = useDispatch();

    const fetchItems = (type: string, value: number | null) => {
        console.log("???????")
        if(["customers", "categories"].includes(type) && value === null)
            return;

        let path = type;
        if(["customers", "categories"].includes(type))
            path += `/${value}`;
        else if (type === "customers-top" && value !== null)
            path += `?count=${value}`;

        setLoading(true);
        ApiClient.statistics(path).then(r => {
            setRows(r);
            setLoading(false);
        }, e => {
            typeof (e) === "number" && e === 401 && dispatch(setAuthToken(null));
        });
    }

    useEffect(() => {
        setRows([]);
        fetchItems(statPath.value, statValue.value);
    }, [statPath.value, statValue.value]);

    return (
        <DataGrid
            loading={isLoading}
            rows={rows}
            rowCount={rows.length}
            columns={colDefs[statPath.value]}
            pageSizeOptions={[10, 25, 50, 100]}
            getRowId={() => Math.ceil(Math.random()*1_000_000_000)}
        />
    );
}

export default SDataGrid;
