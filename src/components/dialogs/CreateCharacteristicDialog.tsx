import {Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import React, {SyntheticEvent, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/store";
import {closeDialog} from "../../redux/dialogsState";
import ApiClient from "../../api/client";
import {setAuthToken} from "../../redux/accountState";
import {useSnackbar} from "notistack";
import {Characteristic} from "../../types/characteristic";
import {GridLogicOperator} from "@mui/x-data-grid";
import {addProductChar} from "../../redux/entitiesState";

export default function CreateCharacteristicDialog({productId}: { productId: number }) {
    const open = useSelector((state: RootState) => state.dialogs.char_create);
    const [options, setOptions] = useState<Characteristic[]>([]);
    const [char, setChar] = useState<Characteristic | null>(null);
    const {enqueueSnackbar} = useSnackbar();
    const dispatch = useDispatch();

    const valueRef = useRef<HTMLInputElement | null>(null);

    const putChar = () => {
        if (!char) {
            enqueueSnackbar(`Characteristic is required!`, {variant: "warning"});
            return;
        }
        if (!valueRef.current?.value) {
            enqueueSnackbar(`Value is required!`, {variant: "warning"});
            return;
        }


        ApiClient.chars_set(productId, char.id, valueRef.current?.value).then(r => {
            dispatch(addProductChar({productId: productId, char: r}));
            enqueueSnackbar('Created!', {variant: "info"});
            dispatch(closeDialog("char_create"));
        }, e => {
            typeof (e) === "number" && e === 401 && dispatch(setAuthToken(null));
            typeof (e) === "number" && e >= 400 && enqueueSnackbar(`Failed to create!`, {variant: "error"});
        }).catch(e => {
            enqueueSnackbar(`Failed to create!`, {variant: "error"});
        });
    }

    const onInputChange = (event: SyntheticEvent, value: string) => {
        if (value) {
            ApiClient.search_(
                "characteristics",
                {"page": 0, "pageSize": 100},
                {
                    "items": [{"field": "name", "operator": "contains", "value": value}],
                    "logicOperator": "and" as GridLogicOperator
                },
                []
            ).then(r => setOptions(r.results as Characteristic[]));
        } else {
            setOptions([]);
        }
    };

    return (
        <Dialog open={open}>
            <DialogTitle>Add characteristic</DialogTitle>
            <DialogContent>
                <Autocomplete
                    options={options}
                    onInputChange={onInputChange}
                    getOptionLabel={(option: Characteristic) => `${option.name}, ${option.measurement_unit}`}
                    style={{width: 300}} sx={{mb: 2}}
                    onChange={(e, value) => setChar(value)}
                    renderInput={(params) => (
                        <TextField {...params} label="Characteristic" variant="outlined"/>
                    )}
                />

                <TextField autoFocus margin="dense" label="Value" type="text" fullWidth variant="standard"
                           sx={{mb: 2}} inputRef={valueRef} required/>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => dispatch(closeDialog("char_create"))}>Cancel</Button>
                <Button onClick={putChar}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}