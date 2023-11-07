import React, {useEffect, useState} from 'react';
import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridEventListener,
    GridRowEditStopReasons,
    GridRowId,
    GridRowModel,
    GridRowModes,
    GridRowModesModel,
    GridRowsProp,
    GridToolbarContainer
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {Button} from "@mui/material";
import ApiClient from "../api/client";
import {TYPES} from "../types/types";
import {entityType} from "../App";

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}

function EditToolbar(props: EditToolbarProps) {
    const {setRows, setRowModesModel} = props;

    const handleClick = () => {
        const id = Date.now();
        setRows((oldRows) => [...oldRows, {id: id, isNew: true, ...TYPES[entityType.value].default()}]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: {mode: GridRowModes.Edit, fieldToFocus: 'name'},
        }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon/>} onClick={handleClick}>Add</Button>
        </GridToolbarContainer>
    );
}

function CDataGrid() {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [isLoading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState({page: 0, pageSize: 10});
    const [categoriesCount, setCategoriesCount] = useState(0);

    const fetchItems = () => {
        setLoading(true);
        ApiClient.fetch(TYPES[entityType.value].endpoint, paginationModel.page, paginationModel.pageSize).then(r => {
            setRows(r.results);
            setCategoriesCount(r.count);
            setLoading(false);
        })
    }

    useEffect(fetchItems, [paginationModel, entityType.value]);

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id: GridRowId) => () => setRowModesModel({
        ...rowModesModel,
        [id]: {mode: GridRowModes.Edit}
    });
    const handleSaveClick = (id: GridRowId) => () => setRowModesModel({
        ...rowModesModel,
        [id]: {mode: GridRowModes.View}
    });

    const handleDeleteClick = (id: GridRowId) => () => {
        ApiClient.delete(TYPES[entityType.value].endpoint, id as number).then(r => {
            r && setRows(rows.filter((row) => row.id !== id));
        });
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: {mode: GridRowModes.View, ignoreModifications: true},
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow!.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = (newRow: GridRowModel) => {
        return new Promise((resolve) => {
            const data = TYPES[entityType.value].fromRow(newRow);
            const endpoint = TYPES[entityType.value].endpoint;

            const prom = newRow.isNew ? ApiClient.create(endpoint, data) : ApiClient.update(endpoint, newRow.id, data);
            prom.then(r => {
                setRows(rows.map((row) => (row.id === newRow.id ? r : row)));
                newRow.isNew && setCategoriesCount((prev) => prev + 1);
                resolve(r);
            });
        });
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns: GridColDef[] = [
        ...TYPES[entityType.value].colDef,
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            align: 'right',
            width: 100,
            cellClassName: 'actions',
            getActions: ({id}) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon/>}
                            label="Save"
                            sx={{color: 'primary.main'}}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon/>}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon/>}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon/>}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    return (
        <DataGrid
            loading={isLoading}
            rows={rows}
            rowCount={categoriesCount}
            columns={columns}
            pageSizeOptions={[10, 25, 50, 100]}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            slots={{toolbar: EditToolbar}}
            slotProps={{toolbar: {setRows, setRowModesModel}}}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
        />
    );
}

export default CDataGrid;
