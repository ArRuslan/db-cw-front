import store from "../redux/store";
import {GridPaginationModel} from "@mui/x-data-grid/models/gridPaginationProps";
import {GridFilterModel, GridSortModel} from "@mui/x-data-grid";
import {Recommendation} from "../types/recommendation";
import {ProductCharacteristic} from "../types/characteristic";

interface FetchResult {
    results: object[],
    count: number,
}

interface ExecuteResponse {
    columns: {
        name: string,
        type: "string" | "number" | "date",
    }[],
    result: {
        [key:string]: string | number | Date
    }[],
}

export default class ApiClient {
    static fetch(entity: string, page: number, pageSize: number): Promise<FetchResult> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}?page=${page}&limit=${pageSize}`, {
                headers: {"Authorization": store.getState().account.token!}
            }).then(r => {
                r.status === 200 && r.json().then(j => {
                    resolve(j as FetchResult);
                });
                r.status >= 400 && reject(r.status);
            })
        });
    }

    static delete(entity: string, id: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}/${id}`, {
                method: "DELETE",
                headers: {"Authorization": store.getState().account.token!}
            }).then(r => {
                r.status >= 400 && reject(r.status);
                resolve(r.status === 204);
            });
        });
    }

    static create(entity: string, data: object): Promise<object> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}`, {
                method: "POST",
                headers: {"Content-Type": "application/json", "Authorization": store.getState().account.token!},
                body: JSON.stringify(data)
            }).then(r => {
                r.status === 200 && r.json().then(j => resolve(j));
                r.status >= 400 && reject(r.status);
            });
        })
    }

    static update(entity: string, id: number, data: object): Promise<object> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}/${id}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json", "Authorization": store.getState().account.token!},
                body: JSON.stringify(data)
            }).then(r => {
                r.status === 200 && r.json().then(j => resolve(j));
                r.status >= 400 && reject(r.status);
            });
        })
    }

    static get(entity: string, id: number): Promise<object> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}/${id}`, {
                headers: {"Authorization": store.getState().account.token!}
            }).then(r => {
                r.status === 200 && r.json().then(j => resolve(j));
                r.status >= 400 && reject(r.status);
            });
        })
    }

    static by_ids(entity: string, ids: number[]): Promise<object> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}/batch`, {
                method: "POST",
                headers: {"Content-Type": "application/json", "Authorization": store.getState().account.token!},
                body: JSON.stringify({ids: ids})
            }).then(r => {
                r.status === 200 && r.json().then(j => resolve(j));
                r.status >= 400 && reject(r.status);
            });
        })
    }

    static search(entity: string, query: {[key:string]: any}, signal: AbortSignal): Promise<FetchResult> {
        return new Promise((resolve, reject) => {
            try {
                fetch(`http://127.0.0.1:8000/api/v0/${entity}/search?${new URLSearchParams(query)}`, {
                    signal,
                    method: "GET",
                    headers: {"Authorization": store.getState().account.token!}
                }).then(r => {
                    r.status === 200 && r.json().then(j => resolve(j as FetchResult));
                    r.status >= 400 && reject(r.status);
                });
            } catch(e) {
                reject(e);
            }
        })
    }

    static search_(entity: string, pagination: GridPaginationModel, filter: GridFilterModel, sort: GridSortModel): Promise<FetchResult> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}/search`, {
                method: "POST",
                headers: {"Content-Type": "application/json", "Authorization": store.getState().account.token!},
                body: JSON.stringify({pagination: pagination, filter: filter, sort: sort}),
            }).then(r => {
                r.status === 200 && r.json().then(j => {
                    resolve(j as FetchResult);
                });
                r.status >= 400 && reject(r.status);
            })
        });
    }

    static statistics(path: string): Promise<object[]> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/statistics/${path}`, {
                headers: {"Authorization": store.getState().account.token!}
            }).then(r => {
                r.status === 200 && r.json().then(j => {
                    resolve(j as object[]);
                });
                r.status >= 400 && reject(r.status);
            })
        });
    }

    static recommendations(): Promise<Recommendation[]> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/products/price-recommendations`, {
                headers: {"Authorization": store.getState().account.token!}
            }).then(r => {
                r.status === 200 && r.json().then(j => {
                    resolve(j["result"] as Recommendation[]);
                });
                r.status >= 400 && reject(r.status);
            })
        });
    }

    static chars_fetch(productId: number): Promise<ProductCharacteristic[]> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/products/${productId}/chars`, {
                headers: {"Authorization": store.getState().account.token!}
            }).then(r => {
                r.status === 200 && r.json().then(j => {
                    resolve(j as ProductCharacteristic[]);
                });
                r.status >= 400 && reject(r.status);
            })
        });
    }

    static chars_set(productId: number, charId: number, value: string): Promise<ProductCharacteristic> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/products/${productId}/chars/${charId}`, {
                method: "PUT",
                headers: {"Authorization": store.getState().account.token!, "Content-Type": "application/json"},
                body: JSON.stringify({"value": value}),
            }).then(r => {
                r.status === 200 && r.json().then(j => {
                    resolve(j as ProductCharacteristic);
                });
                r.status >= 400 && reject(r.status);
            })
        });
    }

    static chars_delete(productId: number, charId: number): Promise<null> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/products/${productId}/chars/${charId}`, {
                method: "DELETE",
                headers: {"Authorization": store.getState().account.token!},
            }).then(r => {
                r.status >= 400 && reject(r.status);
                r.status >= 200 && resolve(null);
            })
        });
    }

    static execute_sql(query: string): Promise<ExecuteResponse> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/sql`, {
                method: "POST",
                headers: {"Authorization": store.getState().account.token!, "Content-Type": "application/json"},
                body: JSON.stringify({"query": query}),
            }).then(r => {
                r.status >= 400 && reject(r.status);
                r.status >= 200 && r.json().then(j => resolve(j as ExecuteResponse));
            }).catch(() => {
                reject(500);
            })
        });
    }
}