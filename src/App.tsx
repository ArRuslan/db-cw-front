import React, {SyntheticEvent, useRef, useState} from 'react';
import {signal} from '@preact/signals-react';
import CDataGrid from "./components/CDataGrid";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import CreateProductDialog from "./dialogs/CreateProductDialog";
import {EntityType} from './types/base_entity';
import CreateOrderDialog from "./dialogs/CreateOrderDialog";
import {Autocomplete, Button, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import {Product} from "./types/product";
import {Customer} from "./types/customer";
import {Category} from "./types/category";
import ApiClient from "./api/client";
import SDataGrid, {StatPath, statPath, statValue} from "./components/SDataGrid";
import store from "./redux/store";
import FileSaver from "file-saver";
import ProductPage from "./components/ProductPage";
import BaseApp from "./components/BaseApp";
import {navigationTitle} from "./components/Navigation";
import OrderPage from "./components/OrderPage";

export const entityType = signal<EntityType>("categories");

function ListApp({entity}: { entity: EntityType }) {
    entityType.value = entity as EntityType;
    navigationTitle.value = entityType.value;

    return (
        <BaseApp>
            <CDataGrid/>
            <CreateProductDialog/>
            <CreateOrderDialog/>
        </BaseApp>
    );
}

function SqlPage() {
    navigationTitle.value = "sql";

    return (
        <BaseApp>
            {/*<SyntaxHighlighter language="javascript">a</SyntaxHighlighter>*/}
        </BaseApp>
    );
}

type StatType = "customers" | "categories" | "customers-top" | "last_year" | "last_month";

function StatisticsPage() {
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

type ReportType = "customers" | "categories" | "products";

function ReportsPage() {
    const [type, setType] = useState<ReportType>("customers");
    const [value, setValue] = useState<number | null>(null);
    const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
    const [categoriesOptions, setCategoriesOptions] = useState<Category[]>([]);
    const [productsOptions, setProductsOptions] = useState<Product[]>([]);
    const previousController = useRef<AbortController>();

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
        }).then(r => r.blob()).then(blob => {
            FileSaver.saveAs(blob, "report.xlsx")
        })
    }

    return (
        <BaseApp>
            <InputLabel>Select statistics type</InputLabel>
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

export default function App() {
    const def = <Navigate to="/categories" replace/>;

    return (
        <BrowserRouter>
            <Routes>
                <Route index path="/" element={def}/>
                <Route path="/categories" element={<ListApp entity="categories"/>}/>
                <Route path="/products" element={<ListApp entity="products"/>}/>
                <Route path="/products/:productId" element={<ProductPage/>}/>
                <Route path="/orders" element={<ListApp entity="orders"/>}/>
                <Route path="/orders/:orderId" element={<OrderPage/>}/>
                <Route path="/customers" element={<ListApp entity="customers"/>}/>
                <Route path="/characteristics" element={<ListApp entity="characteristics"/>}/>
                <Route path="/sql" element={<SqlPage/>}/>
                <Route path="/statistics" element={<StatisticsPage/>}/>
                <Route path="/reports" element={<ReportsPage/>}/>

                <Route path="*" element={def}/>
            </Routes>
        </BrowserRouter>
    );
}
