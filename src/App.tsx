import React from 'react';
import Box from "@mui/material/Box";
import Navigation from "./components/Navigation";
import {signal} from '@preact/signals-react';
import CDataGrid from "./components/CDataGrid";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";

type EntityType = "categories" | "products";

export const entityType = signal<EntityType>("categories");

function ListApp({entity}: {entity: EntityType}) {
    entityType.value = entity;

    return (<>
        <Navigation/>
        <Box component="main" sx={{p: 3}}>
            <CDataGrid/>
        </Box>
    </>);
}

export default function App() {
    const def = <Navigate to="/categories" replace/>;

    return (
        <BrowserRouter>
            <Routes>
                <Route index path="/" element={def}/>
                <Route path="/categories" element={<ListApp entity="categories"/>}/>
                <Route path="/products" element={<ListApp entity="products"/>}/>
                {/*<Route path="/orders" element={<ListApp entity="orders"/>}/>*/}

                <Route path="*" element={def}/>
            </Routes>
        </BrowserRouter>
    );
}
