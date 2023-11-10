import React from 'react';
import Box from "@mui/material/Box";
import Navigation from "./components/Navigation";
import {signal} from '@preact/signals-react';
import CDataGrid from "./components/CDataGrid";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {SnackbarProvider} from "notistack";
import CreateProductDialog from "./dialogs/CreateProductDialog";

export type EntityType = "categories" | "products" | "orders" | "customers" | "characteristics";

export const entityType = signal<EntityType>("categories");
export const entityTypes: EntityType[] = ["categories", "products", "orders", "customers", "characteristics"];

function ListApp({entity}: { entity: EntityType }) {
    entityType.value = entity;

    return (
        <SnackbarProvider maxSnack={10} anchorOrigin={{vertical: "bottom", horizontal: "right"}}>
            <Navigation/>
            <Box component="main" sx={{p: 3}}>
                <CDataGrid/>
                <CreateProductDialog/>
            </Box>
        </SnackbarProvider>
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
                <Route path="/orders" element={<ListApp entity="orders"/>}/>
                <Route path="/customers" element={<ListApp entity="customers"/>}/>
                <Route path="/characteristics" element={<ListApp entity="characteristics"/>}/>

                <Route path="*" element={def}/>
            </Routes>
        </BrowserRouter>
    );
}
