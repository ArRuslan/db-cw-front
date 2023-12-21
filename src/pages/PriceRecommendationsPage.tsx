import BaseApp from "../components/BaseApp";
import {Backdrop, Button, CircularProgress} from "@mui/material";
import React, {useState} from "react";
import RDataGrid from "../components/RDataGrid";
import {Recommendation} from "../types/recommendation";
import ApiClient from "../api/client";
import {navigationTitle} from "../components/Navigation";
import {useSnackbar} from "notistack";

export default function PriceRecommendationsPage() {
    const [loading, setLoading] = useState(false);
    const [prods, setProds] = useState<Recommendation[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const {enqueueSnackbar} = useSnackbar();

    navigationTitle.value = "Price Recommendations";

    const getRec = () => {
        setLoading(true);
        ApiClient.recommendations().then(rec => {
            for(let r of rec)
                r["new_price"] = r["recommended_price"];
            setProds(rec);
            setLoading(false);
        }, () => {
            enqueueSnackbar('Failed to get recommendations!', {variant: "error"});
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

    const setPrice = (id: number, new_price: number) => {
        setProds(prods_ => {
            for(let prod of prods_) {
                if(prod.id === id)
                    prod["new_price"] = new_price;
            }
            return prods_;
        })
    }

    return (
        <BaseApp>
            <Backdrop sx={{ color: '#fff', }} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>

            <Button fullWidth variant="outlined" onClick={getRec} disabled={loading}>Get recommendations</Button>
            <RDataGrid rows={prods} loading={loading} setSelected={setSelected} setPrice={setPrice}/>
            {prods.length > 0 ? <Button fullWidth variant="outlined" onClick={apply} disabled={loading || selected.length === 0}>Apply</Button> : <></>}
        </BaseApp>
    );
}