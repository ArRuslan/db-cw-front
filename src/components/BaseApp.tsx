import React from "react";
import Navigation from "./Navigation";
import Box from "@mui/material/Box";

export default function BaseApp({children}: { children: React.JSX.Element | React.JSX.Element[] }) {
    return (
        <>
            <Navigation/>
            <Box component="main" sx={{p: 3}}>
                {children}
            </Box>
        </>
    );
}