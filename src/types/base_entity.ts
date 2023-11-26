export default interface BaseEntity {
    id: number,
    isNew: boolean,
}

export type EntityType = "categories" | "products" | "orders" | "customers" | "characteristics" | "returns";
export const entityTypes: EntityType[] = ["categories", "products", "orders", "customers", "characteristics", "returns"];
