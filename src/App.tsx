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

export const entityType = signal<EntityType>("categories");

export default function App() {
    const def = <Navigate to="/categories" replace/>;

    LicenseInfo.setLicenseKey(process.env.REACT_APP_MUI_X_LICENSE_KEY ?? "");

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
                <Route path="/returns" element={<ListApp entity="returns"/>}/>
                <Route path="/sql" element={<SqlPage/>}/>
                <Route path="/statistics" element={<StatisticsPage/>}/>
                <Route path="/reports" element={<ReportsPage/>}/>
                <Route path="/price-rec" element={<PriceRecommendationsPage/>}/>

                <Route path="*" element={def}/>
            </Routes>
        </BrowserRouter>
    );
}
