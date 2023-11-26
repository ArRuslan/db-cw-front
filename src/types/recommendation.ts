export interface Recommendation {
    id: number,
    model: string,
    manufacturer: string,
    price: number,
    recommended_price: number,
    new_price: number,
    action: "up" | "down",
}