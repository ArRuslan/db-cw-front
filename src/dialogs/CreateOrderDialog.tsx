import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputLabel,
    List,
    MenuItem,
    Select,
    TextField
} from "@mui/material";
import React, {memo, SyntheticEvent, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux/store";
import {closeDialog} from "../redux/dialogsState";
import ApiClient from "../api/client";
import {setECount, setEntities} from "../redux/entitiesState";
import {setAuthToken} from "../redux/accountState";
import {useSnackbar} from "notistack";
import BaseEntity from "../types/base_entity";
import {Customer} from "../types/customer";
import {Product} from "../types/product";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";

interface OrderItem {
    id: number,
    quantity: number,
    max: number,
    model: string,
    manufacturer: string,
}

function ProductItem({item, delItem}: { item: OrderItem, delItem: (item: OrderItem) => void }) {
    return (
        <div>
            <Divider/>
            <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                <span>{item.manufacturer} - {item.model}</span>
                <IconButton onClick={() => delItem(item)} color="inherit"><DeleteIcon/></IconButton>
            </div>
            <TextField margin="dense" label="Quantity" type="number" fullWidth variant="standard"
                       defaultValue={item.quantity} onChange={(e) => item.quantity = Number(e.currentTarget.value)}/>
        </div>
    );
}

export default function CreateOrderDialog() {
    const open = useSelector((state: RootState) => state.dialogs.order_create);
    const rowCounts = useSelector((state: RootState) => state.entities.counts);
    const dispatch = useDispatch();
    const [options, setOptions] = useState<Customer[]>([]);
    const [optionsProd, setOptionsProd] = useState<Product[]>([]);
    const previousController = useRef<AbortController>();
    const [selCus, setSelCus] = useState<Customer | null>(null);
    const [products, setProducts] = useState<OrderItem[]>([]);

    const addressRef = useRef<HTMLInputElement | null>(null);
    const typeRef = useRef<HTMLInputElement | null>(null);
    const {enqueueSnackbar} = useSnackbar();

    const createOrder = () => {
        const data = {
            "customer_info": {
                "first_name": selCus?.first_name,
                "last_name": selCus?.last_name,
                "email": selCus?.email,
                "phone_number": selCus?.phone_number,
            },
            "address": addressRef.current?.value,
            "type": typeRef.current?.value,
            "products": products.map(product => ({id: product.id, quantity: product.quantity})),
        }

        ApiClient.create("orders", data).then(r => {
            dispatch(setEntities({type: "orders", arr: [r] as BaseEntity[]}));
            dispatch(setECount({type: "orders", count: rowCounts.orders + 1}));
            enqueueSnackbar('Created!', {variant: "info"});
            dispatch(closeDialog("order_create"));
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
        ApiClient.search("customers", {"anything": searchTerm}, signal).then(r => setOptions(r.results as Customer[]));
    };
    const onInputChange = (event: SyntheticEvent, value: string) => {
        if (value) {
            getData(value);
        } else {
            setOptions([]);
        }
    };

    const getDataProd = (searchTerm: string) => {
        if (previousController.current) {
            previousController.current.abort();
        }
        const controller = new AbortController();
        const signal = controller.signal;
        previousController.current = controller;
        ApiClient.search("products", {"anything": searchTerm}, signal).then(r => setOptionsProd(r.results as Product[]));
    };
    const onInputChangeProd = (event: SyntheticEvent, value: string) => {
        if (value) {
            getDataProd(value);
        } else {
            setOptionsProd([]);
        }
    };

    const delProductItem = (item: OrderItem) => {
        setProducts(products.filter(it => it.id !== item.id));
    }
    const ProductItems = memo(() => (
        <List style={{maxHeight: 200, overflow: 'auto'}}>
            {products.map(item => <ProductItem item={item} delItem={delProductItem}/>)}
        </List>
    ));
    const addProduct = (prod: Product) => {
        for (let p of products) {
            if (p.id === prod.id) {
                p.quantity++;
                return;
            }
        }
        setProducts([...products, {
            id: prod.id,
            quantity: 1,
            max: prod.per_order_limit === null ? prod.quantity : Math.min(prod.per_order_limit, prod.quantity),
            model: prod.model,
            manufacturer: prod.manufacturer,
        }])
    }

    return (
        <Dialog open={open}>
            <DialogTitle>Create order</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Address" type="text" fullWidth variant="standard"
                           sx={{mb: 2}}
                           inputRef={addressRef} required/>

                <InputLabel>Order type</InputLabel>
                <Select label="Type" fullWidth variant="standard" sx={{mb: 2}}
                        inputRef={typeRef} required defaultValue="shipping">
                    <MenuItem value="shipping">Shipping</MenuItem>
                    <MenuItem value="pickup">Pickup</MenuItem>
                </Select>

                <InputLabel>Customer</InputLabel>
                <Autocomplete
                    options={options}
                    onInputChange={onInputChange}
                    getOptionLabel={(option: Customer) => `${option.first_name} ${option.last_name} <${option.email}>`}
                    style={{width: 300}} sx={{mb: 2}}
                    onChange={(e, value) => setSelCus(value)}
                    renderInput={(params) => (
                        <TextField {...params} label="Customer" variant="outlined"/>
                    )}
                />

                <InputLabel>Add product</InputLabel>
                <Autocomplete
                    options={optionsProd}
                    onInputChange={onInputChangeProd}
                    getOptionLabel={(option: Product) => `${option.manufacturer} - ${option.model}`}
                    style={{width: 300}} sx={{mb: 2}}
                    onChange={(e, value) => value !== null && addProduct(value)}
                    renderInput={(params) => (
                        <TextField {...params} label="Add product" variant="outlined"/>
                    )}
                />

                <InputLabel>Product list</InputLabel>
                {products && <ProductItems/>}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => dispatch(closeDialog("order_create"))}>Cancel</Button>
                <Button onClick={createOrder}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}