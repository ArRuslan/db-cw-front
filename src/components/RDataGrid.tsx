import React from 'react';
import {DataGrid, GridColDef, GridRowModel} from '@mui/x-data-grid';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';


const def = {editable: false, hideable: false, sortable: true, filterable: false};
const colDef: GridColDef[] = [
    {...def, field: 'manufacturer', headerName: 'Manufacturer', width: 150},
    {...def, field: 'model', headerName: 'Model', width: 250},
    {...def, field: 'price', headerName: 'Old Price', width: 100},
    {...def, field: 'recommended_price', headerName: 'Recommended price', width: 150},
    {...def, field: "action", headerName: "Action", width: 75, renderCell: params => {
            return params.row.action === "up" ? <ArrowUpwardIcon/> : <ArrowDownwardIcon/>;
        }
    },
    {...def, field: 'new_price', headerName: 'New price', width: 100, editable: true},
];

interface Props {
    rows: object[],
    loading: boolean,
    setSelected: (arg0: number[]) => void,
    setPrice: (id: number, new_price: number) => void,
}

export default function RDataGrid({rows, loading, setSelected, setPrice}: Props) {
    const processRowUpdate = (newRow: GridRowModel) => {
        setPrice(newRow.id, Number(newRow.new_price));
        return newRow;
    }

    return (
        <DataGrid
            loading={loading}
            rows={rows}
            rowCount={rows.length}
            columns={colDef}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(ids) => setSelected(ids as number[])}
            processRowUpdate={processRowUpdate}
        />
    );
}
