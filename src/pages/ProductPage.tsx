import {useParams} from "react-router-dom";
import BaseApp from "../components/BaseApp";
import Box from "@mui/material/Box";
import React, {memo, SyntheticEvent, useEffect, useRef, useState} from "react";
import {
    Autocomplete,
    Backdrop,
    Button,
    CircularProgress,
    Divider,
    InputLabel,
    List,
    TextField,
    Typography
} from "@mui/material";
import ApiClient from "../api/client";
import {Product} from "../types/product";
import {Category} from "../types/category";
import {navigationTitle} from "../components/Navigation";
import {ProductCharacteristic} from "../types/characteristic";
import CreateCharacteristicDialog from "../components/dialogs/CreateCharacteristicDialog";
import {useDispatch, useSelector} from "react-redux";
import {openDialog} from "../redux/dialogsState";
import {RootState} from "../redux/store";
import {delProductChar, setProductChars} from "../redux/entitiesState";
import DeleteIcon from '@mui/icons-material/Delete';
import {useSnackbar} from "notistack";

function CharacteristicItem({productId, item}: {productId: number, item: ProductCharacteristic}) {
    const [value, setValue] = useState(item.value);
    const {enqueueSnackbar} = useSnackbar();
    const dispatch = useDispatch();

    const del = () => {
        ApiClient.chars_delete(productId, item.id).then(
            () => {
                dispatch(delProductChar({productId: productId, charId: item.id}));
                enqueueSnackbar(`Deleted!`, {variant: "success"});
            },
            () => enqueueSnackbar(`Failed to delete!`, {variant: "error"})
        );
    }

    const update = () => {
        if(value === item.value) return;

        ApiClient.chars_set(productId, item.id, value).then(
            () => enqueueSnackbar(`Updated!`, {variant: "success"}),
            () => enqueueSnackbar(`Failed to update!`, {variant: "error"})
        );
    }

    return (
        <>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                my: 1
            }}>
                <Typography>{`${item.name}, ${item.unit}`}</Typography>
                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                    <TextField label="Value" type="text" value={value} onChange={e => setValue(e.target.value)} onBlur={update}/>
                    <Button variant="outlined" onClick={del}>
                        <DeleteIcon/>
                    </Button>
                </Box>
            </Box>
            <Divider/>
        </>
    )
}

export default function ProductPage() {
    const params = useParams();
    const productId = Number(params.productId);
    const [loading, setLoading] = useState(true);
    const [manValue, setManValue] = useState("...");
    const [modValue, setModValue] = useState("...");
    const [priValue, setPriValue] = useState(0);
    const [quaValue, setQuaValue] = useState(0);
    const [polValue, setPolValue] = useState(0);
    const [warValue, setWarValue] = useState(0);
    const [defaultCategory, setDefaultCategory] = useState<Category | null>(null);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
    const previousController = useRef<AbortController>();
    const chars = useSelector((state: RootState) => state.entities.product_characteristics[productId]);
    const dispatch = useDispatch();

    navigationTitle.value = "Product edit";

    const setValues = (prod: Product) => {
        setManValue(prod["manufacturer"]);
        setModValue(prod["model"]);
        setPriValue(prod["price"]);
        setQuaValue(prod["quantity"]);
        setPolValue(prod["per_order_limit"]);
        setWarValue(prod["warranty_days"]);

        ApiClient.get("categories", prod.category_id).then(j1 => {
            setDefaultCategory(j1 as Category);
            setCurrentCategory(j1 as Category);
            setLoading(false);
        });

        ApiClient.chars_fetch(productId).then(j => {
            dispatch(setProductChars({productId: productId, chars: j as ProductCharacteristic[]}));
            setLoading(false);
        });
    }

    useEffect(() => {
        ApiClient.get("products", productId).then(j => {
            setValues(j as Product);
            setLoading(false);
        });
    }, []);

    const onCategoryInputChange = (event: SyntheticEvent, value: string) => {
        if (value) {
            if (previousController.current) {
                previousController.current.abort();
            }
            const controller = new AbortController();
            const signal = controller.signal;
            //previousController.current = controller;
            ApiClient.search("categories", {"name": value}, signal).then(r => setCategoryOptions(r.results as Category[]));
        } else {
            setCategoryOptions([]);
        }
    };

    const save = () => {
        setLoading(true);
        const data = {
            model: modValue,
            manufacturer: manValue,
            price: priValue,
            quantity: quaValue,
            per_order_limit: polValue,
            warranty_days: warValue,
            category_id: currentCategory!.id,
        }
        ApiClient.update("products", productId, data).then(j => {
            setValues(j as Product);
            setLoading(false);
        });
    }

    const Characteristics = memo(() => (
        <List style={{overflow: 'auto'}}>
            {!!chars && chars.map(item => <CharacteristicItem productId={productId} item={item}/>)}
        </List>
    ));

    return (
        <BaseApp>
            <Backdrop sx={{ color: '#fff', }} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>

            <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                <InputLabel>Manufacturer</InputLabel>
                <TextField label="Manufacturer" type="text" value={manValue} onChange={e => setManValue(e.target.value)}
                           disabled={loading}/>

                <InputLabel>Model</InputLabel>
                <TextField label="Model" type="text" value={modValue} onChange={e => setModValue(e.target.value)}
                           disabled={loading}/>

                <InputLabel>Price</InputLabel>
                <TextField label="Price" type="number" value={priValue}
                           onChange={e => setPriValue(Number(e.target.value))} disabled={loading}/>

                <InputLabel>Quantity</InputLabel>
                <TextField label="Quantity" type="number" value={quaValue}
                           onChange={e => setQuaValue(Number(e.target.value))} disabled={loading}/>

                <InputLabel>Per order limit</InputLabel>
                <TextField label="Per order limit" type="number" value={polValue}
                           onChange={e => setPolValue(Number(e.target.value))} disabled={loading}/>

                <InputLabel>Warranty days</InputLabel>
                <TextField label="Warranty days" type="number" value={warValue}
                           onChange={e => setWarValue(Number(e.target.value))} disabled={loading}/>

                <InputLabel>Category</InputLabel>
                <Autocomplete
                    fullWidth
                    value={currentCategory}
                    options={categoryOptions}
                    onInputChange={onCategoryInputChange}
                    getOptionLabel={(option: Category) => option.name}
                    onChange={(e, value) => setCurrentCategory(value === null ? defaultCategory : value)}
                    renderInput={(params) => (
                        <TextField {...params} label="Category" variant="outlined"/>
                    )}
                />

                <Button fullWidth variant="outlined" onClick={save} disabled={loading}>Save</Button>
                <Divider/>

                <Button fullWidth variant="outlined" onClick={() => dispatch(openDialog("char_create"))} disabled={loading}>Add characteristic</Button>
                <Divider/>

                <Characteristics/>

                <CreateCharacteristicDialog productId={productId}/>
            </Box>
        </BaseApp>
    );
}