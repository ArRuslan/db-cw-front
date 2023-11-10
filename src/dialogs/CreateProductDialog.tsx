import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from "@mui/material";
import React, {useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux/store";
import {closeDialog} from "../redux/dialogsState";
import {Category} from "../types/category";
import ApiClient from "../api/client";
import {Entity, setECount, setEntities} from "../redux/entitiesState";
import {entityType} from "../App";
import {setAuthToken} from "../redux/accountState";
import {useSnackbar} from "notistack";

export default function CreateProductDialog() {
    const open = useSelector((state: RootState) => state.dialogs.product_create);
    const rows = useSelector((state: RootState) => state.entities);
    const rowCounts = useSelector((state: RootState) => state.entities.counts);
    const dispatch = useDispatch();

    const modelRef = useRef<HTMLInputElement | null>(null);
    const manufacturerRef = useRef<HTMLInputElement | null>(null);
    const priceRef = useRef<HTMLInputElement | null>(null);
    const quantityRef = useRef<HTMLInputElement | null>(null);
    const limitRef = useRef<HTMLInputElement | null>(null);
    const warrantyRef = useRef<HTMLInputElement | null>(null);
    const categoryRef = useRef<HTMLInputElement | null>(null);
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        ApiClient.fetch("categories", 0, 0).then(r => {
            dispatch(setEntities({type: "categories", arr: r.results as Entity[]}));
            dispatch(setECount({type: "categories", count: r.count}));
        }, e => {
            typeof (e) === "number" && e === 401 && dispatch(setAuthToken(null));
        });
    }, [open]);

    const createProduct = () => {
        const data = {
            "model": modelRef.current?.value,
            "manufacturer": manufacturerRef.current?.value,
            "price": priceRef.current?.value,
            "quantity": quantityRef.current?.value,
            "per_order_limit": limitRef.current?.value,
            "warranty_days": warrantyRef.current?.value,
            "category_id": categoryRef.current?.value,
        }
        ApiClient.create("products", data).then(r => {
            dispatch(setEntities({type: "products", arr: [...rows.products, r] as Entity[]}));
            dispatch(setECount({type: entityType.value, count: rowCounts.products + 1}));
            enqueueSnackbar('Created!', {variant: "info"});
        }, e => {
            typeof (e) === "number" && e === 401 && dispatch(setAuthToken(null));
        }).catch(e => {
            enqueueSnackbar(`Failed to create!`, {variant: "error"});
        });

        dispatch(closeDialog("product_create"));
    }

    const MemoizedSelect = React.memo(() => (
        <Select margin="dense" labelId="category-select-label" required inputRef={categoryRef}>
            {rows.categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                    {(cat as Category).name}
                </MenuItem>
            ))}
        </Select>
    ));

    return (
        <Dialog open={open}>
            <DialogTitle>Create product</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Model" type="text" fullWidth variant="standard"
                           inputRef={modelRef} required/>
                <TextField margin="dense" label="Manufacturer" type="text" fullWidth variant="standard"
                           inputRef={manufacturerRef} required/>
                <TextField margin="dense" label="Price" type="number" fullWidth variant="standard"
                           inputRef={priceRef} required/>
                <TextField margin="dense" label="Quantity" type="number" fullWidth variant="standard"
                           inputRef={quantityRef} required defaultValue={0}/>
                <TextField margin="dense" label="Per order limit" type="number" fullWidth variant="standard"
                           inputRef={limitRef} required defaultValue={0}/>
                <TextField margin="dense" label="Warranty days" type="number" fullWidth variant="standard"
                           inputRef={warrantyRef} required defaultValue={14}/>

                <InputLabel id="category-select-label">Category</InputLabel>
                {rows.categories && <MemoizedSelect/>}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => dispatch(closeDialog("product_create"))}>Cancel</Button>
                <Button onClick={createProduct}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}