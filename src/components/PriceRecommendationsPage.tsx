import BaseApp from "./BaseApp";
import {Backdrop, Button, CircularProgress} from "@mui/material";
import React, {useState} from "react";
import RDataGrid from "./RDataGrid";
import {Recommendation} from "../types/recommendation";
import ApiClient from "../api/client";
import {navigationTitle} from "./Navigation";

export default function PriceRecommendationsPage() {
    const [loading, setLoading] = useState(false);
    const [prods, setProds] = useState<Recommendation[]>([]);
    const [selected, setSelected] = useState<number[]>([]);

    navigationTitle.value = "Price Recommendations";

    const getRec = () => {
        setLoading(true);
        ApiClient.recommendations().then(rec => {
            setProds(rec);
            setLoading(false);
        })
    };

    const apply = () => {
        setLoading(true);
        const recs: {[key:number]: Recommendation} = {};
        for(let rec of prods)
            recs[rec["id"]] = rec;

        (async () => {
            for(let prodId of selected) {
                const rec = recs[prodId];
                if(!rec) continue;
                await ApiClient.update("products", prodId, {price: rec["new_price"]});
                setProds(pr => pr.filter(prod => prod.id !== prodId));
            }
            setLoading(false);
        })();
    }

    return (
        <BaseApp>
            <Backdrop sx={{ color: '#fff', }} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>

            <Button fullWidth variant="outlined" onClick={getRec} disabled={loading}>Get recommendations</Button>
            <RDataGrid rows={prods} loading={loading} setSelected={setSelected}/>
            {prods.length > 0 ? <Button fullWidth variant="outlined" onClick={apply} disabled={loading}>Apply</Button> : <></>}
        </BaseApp>
    );
}