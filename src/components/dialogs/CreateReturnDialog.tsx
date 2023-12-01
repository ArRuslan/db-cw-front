import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import React, {useRef} from "react";
import {useSnackbar} from "notistack";

interface Props {
    open: boolean,
    setOpen: (arg0: boolean) => void,
    callback: (quantity: number, reason: string) => void,
}

export default function CreateReturnDialog({open, setOpen, callback}: Props) {
    const quantityRef = useRef<HTMLInputElement | null>(null);
    const reasonRef = useRef<HTMLInputElement | null>(null);
    const {enqueueSnackbar} = useSnackbar();

    const create = () => {
        if (!quantityRef.current?.value)
            return enqueueSnackbar("Quantity is required!", {variant: "warning"});

        callback(Number(quantityRef.current?.value), reasonRef.current?.value ?? "");
    }

    return (
        <Dialog open={open}>
            <DialogTitle>Create return</DialogTitle>
            <DialogContent>
                <TextField margin="dense" label="Quantity" type="number" fullWidth variant="standard"
                           inputRef={quantityRef} required defaultValue={0}/>
                <TextField margin="dense" label="Reason" type="text" fullWidth variant="standard"
                           inputRef={reasonRef} required/>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}