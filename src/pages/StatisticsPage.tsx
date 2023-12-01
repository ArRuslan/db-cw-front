import React, {SyntheticEvent, useRef, useState} from "react";
import {Customer} from "../types/customer";
import {Category} from "../types/category";
import {navigationTitle} from "../components/Navigation";
import ApiClient from "../api/client";
import {Autocomplete, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import SDataGrid, {StatPath, statPath, statValue} from "../components/SDataGrid";
import BaseApp from "../components/BaseApp";

type StatType = "customers" | "categories" | "customers-top" | "last_year" | "last_month";

export default function StatisticsPage() {
    const [type, setType] = useState<StatType>("customers");
    const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
    const [categoriesOptions, setCategoriesOptions] = useState<Category[]>([]);
    const previousController = useRef<AbortController>();

    navigationTitle.value = "Statistics";

    const onAutocompleteChanged = (type: "customers" | "categories") => (event: SyntheticEvent, value: string) => {
        if (value) {
            if (previousController.current)
                previousController.current.abort();

            const controller = new AbortController();
            const signal = controller.signal;
            previousController.current = controller;
            let query = type === "categories" ? {"name": value} : {"anything": value};
            ApiClient.search(type, query, signal).then(r => {
                type === "customers"
                    ? setCustomerOptions(r.results as Customer[])
                    : setCategoriesOptions(r.results as Category[]);
            });
        } else {
            type === "customers"
                ? setCustomerOptions([])
                : setCategoriesOptions([]);
        }
    }

    let content = <></>;
    if (type === "customers")
        content = (
            <Autocomplete
                fullWidth
                options={customerOptions}
                onInputChange={onAutocompleteChanged("customers")}
                getOptionLabel={(option: Customer) => `${option.first_name} ${option.last_name} <${option.email}>`}
                onChange={(e, value) => (value !== null && statPath.value === "customers" ? statValue.value = value.id : 1)}
                renderInput={(params) => (
                    <TextField {...params} label="Select customer" variant="outlined"/>
                )}
            />
        );
    else if (type === "categories")
        content = (
            <Autocomplete
                fullWidth
                options={categoriesOptions}
                onInputChange={onAutocompleteChanged("categories")}
                getOptionLabel={(option: Category) => option.name}
                onChange={(e, value) => (value !== null && statPath.value === "categories" ? statValue.value = value.id : 1)}
                renderInput={(params) => (
                    <TextField {...params} label="Select category" variant="outlined"/>
                )}
            />
        );
    else if (type === "customers-top")
        content = (
            <TextField label="Count" type="number" fullWidth variant="outlined" defaultValue={10} aria-valuemax={100}
                       onChange={(e) => (e.target.value !== null && statPath.value === "customers-top" ? statValue.value = Number(e.target.value) : 1)}/>
        );

    const dataGridTypes = {
        "customers": "customers",
        "categories": "categories",
        "customers-top": "customers-top",
        "last_year": "time/year",
        "last_month": "time/month"
    }

    return (
        <BaseApp>
            <InputLabel>Select statistics type</InputLabel>
            <Select sx={{mb: 2}} value={type} fullWidth onChange={e => {
                setType(e.target.value as StatType);
                statPath.value = dataGridTypes[e.target.value as StatType] as StatPath;
            }}>
                <MenuItem value="customers">Customer</MenuItem>
                <MenuItem value="categories">Category</MenuItem>
                <MenuItem value="customers-top">Customers Top</MenuItem>
                <MenuItem value="last_year">Monthly for last year</MenuItem>
                <MenuItem value="last_month">Daily for last month</MenuItem>
            </Select>
            {content}
            <SDataGrid/>
        </BaseApp>
    );
}