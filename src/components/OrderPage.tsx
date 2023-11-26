import {useParams} from "react-router-dom";
import BaseApp from "./BaseApp";
import Box from "@mui/material/Box";
import React, {memo, useEffect, useState} from "react";
import {
    Backdrop,
    Button,
    CircularProgress,
    Divider,
    InputLabel,
    List,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import ApiClient from "../api/client";
import {Product} from "../types/product";
import {navigationTitle} from "./Navigation";
import {Customer} from "../types/customer";
import {Order} from "../types/order";
import {useSnackbar} from "notistack";
import CreateReturnDialog from "../dialogs/CreateReturnDialog";

function ProductItem({item, callback}: {item: Product, callback: (quantity: number, reason: string) => void}) {
    const [isOpen, setOpen] = useState(false);

    return (
        <>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                my: 1
            }}>
                <Typography>{`${item.manufacturer} ${item.model}`}</Typography>
                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                    <TextField label="Count" type="number" value={item.quantity} disabled/>
                    <Button variant="outlined" onClick={() => setOpen(true)}>Return</Button>
                </Box>
            </Box>
            <CreateReturnDialog open={isOpen} setOpen={(o) => setOpen(o)} callback={callback}/>
            <Divider/>
        </>
    )
}

export default function OrderPage() {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [cusValue, setCusValue] = useState<Customer | null>(null);
    const [addValue, setAddValue] = useState("...");
    const [typValue, setTypValue] = useState("...");
    const [staValue, setStaValue] = useState("...");
    const [creValue, setCreValue] = useState<Date | null>(null);
    const [itmValue, setItmValue] = useState<Product[]>([]);
    const {enqueueSnackbar} = useSnackbar();

    navigationTitle.value = "Order overview";

    const setValues = (ord: Order) => {
        setTypValue(ord["type"]);
        setStaValue(ord["status"]);
        setCusValue(ord["customer"]);
        setAddValue(ord["address"]);
        setItmValue(ord["items"]);
        setCreValue(ord["creation_time"]);
    }

    useEffect(() => {
        ApiClient.get("orders", Number(params.orderId)).then(j => {
            setValues(j as Order);
            setLoading(false);
        });
    }, []);

    const save = () => {
        setLoading(true);
        const data = {
            type: typValue,
            status: staValue,
            address: addValue,
        }
        ApiClient.update("orders", Number(params.orderId), data).then(j => {
            setValues(j as Order);
            setLoading(false);
        });
    }

    const createReturn = (product_id: number) => (quantity: number, reason: string) => {
        const data = {
            order_id: Number(params.orderId),
            product_id: product_id,
            quantity: quantity,
            reason: reason,
        }
        ApiClient.create("returns", data).then(
            () => enqueueSnackbar(`Return created!`, {variant: "success"}),
            () => enqueueSnackbar("Failed to create!", {variant: "error"})
        )
    }

    const ProductItems = memo(() => (
        <List style={{overflow: 'auto'}}>
            {itmValue.map(item => <ProductItem item={item} callback={createReturn(item.id)}/>)}
        </List>
    ));

    return (
        <BaseApp>
            <Backdrop sx={{color: '#fff',}} open={loading}>
                <CircularProgress color="inherit"/>
            </Backdrop>

            <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                <InputLabel>Customer Email</InputLabel>
                <TextField label="Customer Email" type="text" value={cusValue ? cusValue.email : "..."} disabled/>

                <InputLabel>Customer First Name</InputLabel>
                <TextField label="Customer First Name" type="text" value={cusValue ? cusValue.first_name : "..."}
                           disabled/>

                <InputLabel>Customer Last Name</InputLabel>
                <TextField label="Customer Last Name" type="text" value={cusValue ? cusValue.last_name : "..."}
                           disabled/>

                <InputLabel>Customer Phone Number</InputLabel>
                <TextField label="Customer Phone Number" type="text" value={cusValue ? cusValue.phone_number : "..."}
                           disabled/>

                <InputLabel>Creation Time</InputLabel>
                <TextField label="Creation Time" type="text" value={creValue === null ? "..." : creValue} disabled/>

                <InputLabel>Address</InputLabel>
                <TextField label="Address" type="text" value={addValue} disabled={loading}/>

                <InputLabel>Type</InputLabel>
                <Select label="Type" value={typValue} onChange={e => setTypValue(e.target.value)} disabled={loading}>
                    {typValue === "..." && <MenuItem value="..." disabled>...</MenuItem>}
                    <MenuItem value="shipping">Shipping</MenuItem>
                    <MenuItem value="pickup">Pickup</MenuItem>
                </Select>

                <InputLabel>Status</InputLabel>
                <Select label="Status" value={staValue} onChange={e => setStaValue(e.target.value)} disabled={loading}>
                    {staValue === "..." && <MenuItem value="..." disabled>...</MenuItem>}
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="sent">Sent</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="canceled">Canceled</MenuItem>
                </Select>

                <Button fullWidth variant="outlined" onClick={save} disabled={loading}>Save</Button>

                <Typography variant="h5">Items</Typography>

                {<ProductItems/>}
            </Box>
        </BaseApp>
    );
}