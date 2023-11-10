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
import {useSnackbar} from "notistack";
import {useDispatch, useSelector} from "react-redux";
import {setAuthToken} from "../redux/accountState";
import {RootState} from "../redux/store";
import {Entity, setECount, setEntities} from "../redux/entitiesState";

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}

function EditToolbar(props: EditToolbarProps) {
    const ent = useSelector((state: RootState) => state.entities);
    const dispatch = useDispatch();

    const {setRowModesModel} = props;

    const handleClick = () => {
        if (TYPES[entityType.value].addCallback !== null)
            TYPES[entityType.value].addCallback!();
        if (!TYPES[entityType.value].creatable)
            return;
        const id = Date.now();
        dispatch(setEntities({
            type: entityType.value,
            arr: [...ent[entityType.value], {id: id, isNew: true, ...TYPES[entityType.value].default()}] as Entity[]
        }))
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
    const rows = useSelector((state: RootState) => state.entities[entityType.value]);
    const rowsCount = useSelector((state: RootState) => state.entities.counts[entityType.value]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [isLoading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState({page: 0, pageSize: 10});
    const {enqueueSnackbar} = useSnackbar();
    const token = useSelector((state: RootState) => state.account.token);
    const dispatch = useDispatch();

    const fetchItems = () => {
        setLoading(true);
        ApiClient.fetch(TYPES[entityType.value].endpoint, paginationModel.page, paginationModel.pageSize).then(r => {
            dispatch(setEntities({type: entityType.value, arr: r.results as Entity[]}));
            dispatch(setECount({type: entityType.value, count: r.count}));
            setLoading(false);
        }, e => {
            typeof (e) === "number" && e === 401 && dispatch(setAuthToken(null));
        });
    }

    useEffect(fetchItems, [paginationModel, entityType.value, token]);

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
            r && dispatch(setEntities({type: entityType.value, arr: rows.filter((row) => row.id !== id) as Entity[]}));
            r
                ? enqueueSnackbar('Deleted!', {variant: "info"})
                : enqueueSnackbar('Failed to delete!', {variant: "error"});
            r && dispatch(setECount({type: entityType.value, count: rowsCount - 1}));
        }, e => {
            typeof (e) === "number" && e === 401 && dispatch(setAuthToken(null));
        });
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: {mode: GridRowModes.View, ignoreModifications: true},
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow!.isNew) {
            dispatch(setEntities({type: entityType.value, arr: rows.filter((row) => row.id !== id) as Entity[]}));
        }
    };

    const processRowUpdate = (newRow: GridRowModel) => {
        return new Promise((resolve) => {
            const data = TYPES[entityType.value].fromRow(newRow);
            const endpoint = TYPES[entityType.value].endpoint;

            const prom = newRow.isNew ? ApiClient.create(endpoint, data) : ApiClient.update(endpoint, newRow.id, data);
            prom.then(r => {
                dispatch(setEntities({type: entityType.value, arr: rows.map((row) => (row.id === newRow.id ? r : row)) as Entity[]}));
                newRow.isNew && dispatch(setECount({type: entityType.value, count: rowsCount + 1}));
                newRow.isNew
                    ? enqueueSnackbar('Created!', {variant: "info"})
                    : enqueueSnackbar('Updated!', {variant: "info"});

                resolve(r);
            }, e => {
                typeof (e) === "number" && e === 401 && dispatch(setAuthToken(null));
            }).catch(e => {
                enqueueSnackbar(`Failed to ${newRow.isNew ? "create" : "update"}!`, {variant: "error"});
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

                return TYPES[entityType.value].deletable ? [
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
                ] : [
                    <GridActionsCellItem
                        icon={<EditIcon/>}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
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
            rowCount={rowsCount}
            columns={columns}
            pageSizeOptions={[10, 25, 50, 100]}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            slots={{toolbar: EditToolbar}}
            slotProps={{toolbar: {setRowModesModel}}}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
        />
    );
}

export default CDataGrid;
