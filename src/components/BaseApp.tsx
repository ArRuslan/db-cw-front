import React from "react";
import {SnackbarProvider} from "notistack";
import Navigation from "./Navigation";
import Box from "@mui/material/Box";

export default function BaseApp({children}: { children: React.JSX.Element | React.JSX.Element[] }) {
    return (
        <SnackbarProvider maxSnack={10} anchorOrigin={{vertical: "bottom", horizontal: "right"}}>
            <Navigation/>
            <Box component="main" sx={{p: 3}}>
                {children}
            </Box>
        </SnackbarProvider>
    );
}