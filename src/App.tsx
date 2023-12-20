import React from 'react';
import {signal} from '@preact/signals-react';
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {EntityType} from './types/base_entity';
import ProductPage from "./pages/ProductPage";
import OrderPage from "./pages/OrderPage";
import PriceRecommendationsPage from "./pages/PriceRecommendationsPage";
import {LicenseInfo} from "@mui/x-data-grid-pro";
import ReportsPage from "./pages/ReportsPage";
import StatisticsPage from "./pages/StatisticsPage";
import ListApp from "./pages/ListPage";
import SqlPage from "./pages/SqlPage";
import {SnackbarProvider} from "notistack";

export const entityType = signal<EntityType>("categories");

function SnackbarWrapper({children}: { children: React.JSX.Element }) {
    return (
        <SnackbarProvider maxSnack={10} anchorOrigin={{vertical: "bottom", horizontal: "right"}}>
            {children}
        </SnackbarProvider>
    )
}

export default function App() {
    const def = <Navigate to="/categories" replace/>;

    LicenseInfo.setLicenseKey(import.meta.env.VITE_APP_MUI_X_LICENSE_KEY ?? "");

    return (
        <BrowserRouter>
            <Routes>
                <Route index path="/" element={def}/>
                <Route path="/categories" element={<SnackbarWrapper><ListApp entity="categories"/></SnackbarWrapper>}/>
                <Route path="/products" element={<SnackbarWrapper><ListApp entity="products"/></SnackbarWrapper>}/>
                <Route path="/products/:productId" element={<SnackbarWrapper><ProductPage/></SnackbarWrapper>}/>
                <Route path="/orders" element={<SnackbarWrapper><ListApp entity="orders"/></SnackbarWrapper>}/>
                <Route path="/orders/:orderId" element={<SnackbarWrapper><OrderPage/></SnackbarWrapper>}/>
                <Route path="/customers" element={<SnackbarWrapper><ListApp entity="customers"/></SnackbarWrapper>}/>
                <Route path="/characteristics" element={<SnackbarWrapper><ListApp entity="characteristics"/></SnackbarWrapper>}/>
                <Route path="/returns" element={<SnackbarWrapper><ListApp entity="returns"/></SnackbarWrapper>}/>
                <Route path="/sql" element={<SnackbarWrapper><SqlPage/></SnackbarWrapper>}/>
                <Route path="/statistics" element={<SnackbarWrapper><StatisticsPage/></SnackbarWrapper>}/>
                <Route path="/reports" element={<SnackbarWrapper><ReportsPage/></SnackbarWrapper>}/>
                <Route path="/price-rec" element={<SnackbarWrapper><PriceRecommendationsPage/></SnackbarWrapper>}/>

                <Route path="*" element={def}/>
            </Routes>
        </BrowserRouter>
    );
}
