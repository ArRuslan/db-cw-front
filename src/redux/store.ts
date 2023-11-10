import {configureStore} from '@reduxjs/toolkit';
import {AccountState, accountState} from "./accountState";
import {entitiesState, EntitiesState} from "./entitiesState";
import {dialogsState, DialogsState} from "./dialogsState";

export interface RootState {
    account: AccountState,
    entities: EntitiesState,
    dialogs: DialogsState,
}

export default configureStore({
    reducer: {
        account: accountState.reducer,
        entities: entitiesState.reducer,
        dialogs: dialogsState.reducer,
    },
})