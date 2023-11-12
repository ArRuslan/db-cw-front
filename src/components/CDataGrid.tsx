import React, {useEffect, useState} from 'react';
import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridEventListener,
    GridFilterModel,
    GridLogicOperator,
    GridRowEditStopReasons,
    GridRowId,
    GridRowModel,
    GridRowModes,
    GridRowModesModel,
    GridRowsProp, GridSortModel,
    GridToolbarContainer
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {Button} from "@mui/material";
import ApiClient from "../api/client";
import {TYPES} from "../types/types";
import {entityType} from "../App";
import {useSnackbar} from "notistack";
import {useDispatch, useSelector} from "react-redux";
import {setAuthToken} from "../redux/accountState";
import {RootState} from "../redux/store";
import {addCurrent, delEntity, setCurrent, setECount, setEntities} from "../redux/entitiesState";
import BaseEntity from "../types/base_entity";

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}

function EditToolbar(props: EditToolbarProps) {
    const dispatch = useDispatch();

    const {setRowModesModel} = props;

    const showButton = TYPES[entityType.value].creatable || TYPES[entityType.value].addCallback !== null;

    const handleClick = () => {
        if (TYPES[entityType.value].addCallback !== null)
            TYPES[entityType.value].addCallback!();
        if (!TYPES[entityType.value].creatable)
            return;
        const id = Date.now();
        const newRow = {id: id, isNew: true, ...TYPES[entityType.value].default()};
        dispatch(addCurrent(newRow as BaseEntity));
        dispatch(setEntities({
            type: entityType.value,
            arr: [newRow] as BaseEntity[]
        }));
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: {mode: GridRowModes.Edit, fieldToFocus: TYPES[entityType.value].colDef[0].field},
        }));
    };

    return (
        <GridToolbarContainer>
            {showButton && <Button color="primary" startIcon={<AddIcon/>} onClick={handleClick}>Add</Button>}
        </GridToolbarContainer>
    );
}

function CDataGrid() {
    const current = useSelector((state: RootState) => state.entities.current);
    const cached = useSelector((state: RootState) => state.entities[entityType.value]);
    const rowsCount = useSelector((state: RootState) => state.entities.counts[entityType.value]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [isLoading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState({page: 0, pageSize: 10});
    const [filterModel, setFilterModel] = useState<GridFilterModel>({items: [], logicOperator: GridLogicOperator.Or});
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const {enqueueSnackbar} = useSnackbar();
    const token = useSelector((state: RootState) => state.account.token);
    const dispatch = useDispatch();

    const fetchItems = () => {
        setLoading(true);
        ApiClient.search_(TYPES[entityType.value].endpoint, paginationModel, filterModel, sortModel).then(r => {
            if(TYPES[entityType.value].preloadExternal !== null)
                TYPES[entityType.value].preloadExternal!(r.results, []).then(p => {
                    dispatch(setEntities(p));
                })
            dispatch(setEntities({type: entityType.value, arr: r.results as BaseEntity[]}));
            dispatch(setECount({type: entityType.value, count: r.count}));
            dispatch(setCurrent(r.results as BaseEntity[]));
            setLoading(false);
        }, e => {
            typeof (e) === "number" && e === 401 && dispatch(setAuthToken(null));
        });
    }

    useEffect(fetchItems, [paginationModel, filterModel, sortModel, entityType.value, token]);

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
            r && dispatch(delEntity({type: entityType.value, id: id as number}));
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

        if(cached[id as number].isNew)
            dispatch(delEntity({type: entityType.value, id: id as number}));
    };

    const processRowUpdate = (newRow: GridRowModel) => {
        return new Promise((resolve) => {
            const data = TYPES[entityType.value].fromRow(newRow);
            const endpoint = TYPES[entityType.value].endpoint;

            const prom = newRow.isNew ? ApiClient.create(endpoint, data) : ApiClient.update(endpoint, newRow.id, data);
            prom.then(r => {
                newRow.isNew && dispatch(delEntity({type: entityType.value, id: newRow.id as number}));
                dispatch(setEntities({type: entityType.value, arr: [r as BaseEntity]}));
                dispatch(addCurrent(r as BaseEntity));
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
            align: 'center',
            width: 150,
            cellClassName: 'actions',
            getActions: ({id}) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                const saveBtn = (
                    <GridActionsCellItem
                        icon={<SaveIcon/>}
                        label="Save"
                        sx={{color: 'primary.main'}}
                        onClick={handleSaveClick(id)}
                    />
                );
                const cancelBtn = (
                    <GridActionsCellItem
                        icon={<CancelIcon/>}
                        label="Cancel"
                        className="textPrimary"
                        onClick={handleCancelClick(id)}
                        color="inherit"
                    />
                );
                const editBtn = (
                    <GridActionsCellItem
                        icon={<EditIcon/>}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />
                );
                const deleteBtn = (
                    <GridActionsCellItem
                        icon={<DeleteIcon/>}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />
                );
                const externalBtn = (
                    <GridActionsCellItem
                        icon={<OpenInNewIcon/>}
                        label="Open"
                        onClick={() => TYPES[entityType.value].externalAction!(id as number)}
                        color="inherit"
                    />
                );

                if (isInEditMode)
                    return [saveBtn, cancelBtn];

                const res = [editBtn];
                if(TYPES[entityType.value].deletable)
                    res.push(deleteBtn);
                if(TYPES[entityType.value].externalAction !== null)
                    res.push(externalBtn);

                return res
            },
        },
    ];

    return (
        <DataGrid
            loading={isLoading}
            rows={current}
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
            filterMode="server"
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
        />
    );
}

export default CDataGrid;
