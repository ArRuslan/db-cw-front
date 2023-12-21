import React, {SyntheticEvent, useRef, useState} from "react";
import {Customer} from "../types/customer";
import {Category} from "../types/category";
import {Product} from "../types/product";
import {navigationTitle} from "../components/Navigation";
import ApiClient from "../api/client";
import {Autocomplete, Button, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import store from "../redux/store";
import FileSaver from "file-saver";
import BaseApp from "../components/BaseApp";
import {useSnackbar} from "notistack";

type ReportType = "customers" | "categories" | "products";

export default function ReportsPage() {
    const [type, setType] = useState<ReportType>("customers");
    const [value, setValue] = useState<number | null>(null);
    const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
    const [categoriesOptions, setCategoriesOptions] = useState<Category[]>([]);
    const [productsOptions, setProductsOptions] = useState<Product[]>([]);
    const previousController = useRef<AbortController>();
    const {enqueueSnackbar} = useSnackbar();

    navigationTitle.value = "Reports";

    const onAutocompleteChanged = (type: ReportType) => (event: SyntheticEvent, value: string) => {
        if (value) {
            if (previousController.current)
                previousController.current.abort();

            const controller = new AbortController();
            const signal = controller.signal;
            previousController.current = controller;
            let query = type === "categories" ? {"name": value, "description": value} : {"anything": value};
            ApiClient.search(type, query, signal).then(r => {
                if (type === "customers")
                    setCustomerOptions(r.results as Customer[]);
                else if (type === "categories")
                    setCategoriesOptions(r.results as Category[]);
                else if (type === "products")
                    setProductsOptions(r.results as Product[]);
            });
        } else {
            if (type === "customers")
                setCustomerOptions([]);
            else if (type === "categories")
                setCategoriesOptions([]);
            else if (type === "products")
                setProductsOptions([]);
        }
    }

    let autocomplete = (
        <Autocomplete
            fullWidth
            options={customerOptions}
            onInputChange={onAutocompleteChanged("customers")}
            getOptionLabel={(option: Customer) => `${option.first_name} ${option.last_name} <${option.email}>`}
            onChange={(e, value) => value !== null && setValue(value.id)}
            renderInput={(params) => (
                <TextField {...params} label="Select customer" variant="outlined"/>
            )}
        />
    );
    if (type === "products")
        autocomplete = (
            <Autocomplete
                fullWidth
                options={productsOptions}
                onInputChange={onAutocompleteChanged("products")}
                getOptionLabel={(option: Product) => `${option.manufacturer} ${option.model}`}
                onChange={(e, value) => value !== null && setValue(value.id)}
                renderInput={(params) => (
                    <TextField {...params} label="Select product" variant="outlined"/>
                )}
            />
        );
    else if (type === "categories")
        autocomplete = (
            <Autocomplete
                fullWidth
                options={categoriesOptions}
                onInputChange={onAutocompleteChanged("categories")}
                getOptionLabel={(option: Category) => option.name}
                onChange={(e, value) => value !== null && setValue(value.id)}
                renderInput={(params) => (
                    <TextField {...params} label="Select category" variant="outlined"/>
                )}
            />
        );

    const downloadReport = () => {
        fetch(`http://127.0.0.1:8000/api/v0/reports/${type}/${value}?fmt=excel`, {
            headers: {"Authorization": store.getState().account.token!},
        }).then(r => {
            if(r.status >= 400) {
                enqueueSnackbar('Failed to get report!', {variant: "error"});
                return null;
            }
            return r.blob()
        }).then(blob => {
            blob && FileSaver.saveAs(blob, "report.xlsx")
        }, e => enqueueSnackbar('Failed to get report!', {variant: "error"}))
            .catch(() => {
                enqueueSnackbar('Failed to get statistics!', {variant: "error"});
            });
    }

    return (
        <BaseApp>
            <InputLabel>Select report type</InputLabel>
            <Select sx={{mb: 2}} value={type} fullWidth onChange={e => {
                setType(e.target.value as ReportType);
                setValue(null);
            }}>
                <MenuItem value="customers">Customer</MenuItem>
                <MenuItem value="categories">Category</MenuItem>
                <MenuItem value="products">Product</MenuItem>
            </Select>
            {autocomplete}
            <Button sx={{mt: 2}} fullWidth variant="outlined" onClick={downloadReport} disabled={value === null}>Get
                report</Button>
        </BaseApp>
    );
}