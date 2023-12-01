import {EntityType} from "../types/base_entity";
import {navigationTitle} from "../components/Navigation";
import BaseApp from "../components/BaseApp";
import CDataGrid from "../components/CDataGrid";
import CreateProductDialog from "../components/dialogs/CreateProductDialog";
import CreateOrderDialog from "../components/dialogs/CreateOrderDialog";
import React from "react";
import {entityType} from "../App";

export default function ListApp({entity}: { entity: EntityType }) {
    entityType.value = entity as EntityType;
    navigationTitle.value = entityType.value;

    return (
        <BaseApp>
            <CDataGrid/>
            <CreateProductDialog/>
            <CreateOrderDialog/>
        </BaseApp>
    );
}