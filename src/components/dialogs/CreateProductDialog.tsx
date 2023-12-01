import {Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import React, {SyntheticEvent, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/store";
import {closeDialog} from "../../redux/dialogsState";
import {Category} from "../../types/category";
import ApiClient from "../../api/client";
import {setECount, setEntities} from "../../redux/entitiesState";
import {entityType} from "../../App";
import {setAuthToken} from "../../redux/accountState";
import {useSnackbar} from "notistack";
import BaseEntity from "../../types/base_entity";

export default function CreateProductDialog() {
    const open = useSelector((state: RootState) => state.dialogs.product_create);
    const rowCounts = useSelector((state: RootState) => state.entities.counts);
    const dispatch = useDispatch();
    const [options, setOptions] = useState<Category[]>([]);
    const previousController = useRef<AbortController>();
    const [selCat, setSelCat] = useState<Category | null>(null);

    const modelRef = useRef<HTMLInputElement | null>(null);
    const manufacturerRef = useRef<HTMLInputElement | null>(null);
    const priceRef = useRef<HTMLInputElement | null>(null);
    const quantityRef = useRef<HTMLInputElement | null>(null);
    const limitRef = useRef<HTMLInputElement | null>(null);
    const warrantyRef = useRef<HTMLInputElement | null>(null);
    const {enqueueSnackbar} = useSnackbar();

    const createProduct = () => {
        if(!modelRef.current?.value)
            return enqueueSnackbar("Model is required!", {variant: "warning"});
        if(!manufacturerRef.current?.value)
            return enqueueSnackbar("Manufacturer is required!", {variant: "warning"});
        if(!priceRef.current?.value)
            return enqueueSnackbar("Price is required!", {variant: "warning"});
        if(selCat === null)
            return enqueueSnackbar("Category is required!", {variant: "warning"});

        const data = {
            "model": modelRef.current?.value,
            "manufacturer": manufacturerRef.current?.value,
            "price": priceRef.current?.value,
            "quantity": quantityRef.current?.value,
            "per_order_limit": limitRef.current?.value,
            "warranty_days": warrantyRef.current?.value,
            "category_id": selCat?.id,
        }
        ApiClient.create("products", data).then(r => {
            dispatch(setEntities({type: "products", arr: [r] as BaseEntity[]}));
            dispatch(setECount({type: entityType.value, count: rowCounts.products + 1}));
            enqueueSnackbar('Created!', {variant: "info"});
            dispatch(closeDialog("product_create"));
        }, e => {
            typeof (e) === "number" && e === 401 && dispatch(setAuthToken(null));
            typeof (e) === "number" && e >= 400 && enqueueSnackbar(`Failed to create!`, {variant: "error"});
        }).catch(e => {
            enqueueSnackbar(`Failed to create!`, {variant: "error"});
        });
    }

    const getData = (searchTerm: string) => {
        if (previousController.current) {
            previousController.current.abort();
        }
        const controller = new AbortController();
        const signal = controller.signal;
        previousController.current = controller;
        ApiClient.search("categories", {"name": searchTerm}, signal).then(r => setOptions(r.results as Category[]));
    };

    const onInputChange = (event: SyntheticEvent, value: string) => {
        if (value) {
            getData(value);
        } else {
            setOptions([]);
        }
    };

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

                <Autocomplete
                    options={options}
                    onInputChange={onInputChange}
                    getOptionLabel={(option: Category) => option.name}
                    style={{ width: 300 }}
                    onChange={(e, value) => setSelCat(value)}
                    renderInput={(params) => (
                        <TextField {...params} label="Category" variant="outlined" />
                    )}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => dispatch(closeDialog("product_create"))}>Cancel</Button>
                <Button onClick={createProduct}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}